import { checkinPrompt } from '../prompts/checkin.js';
import { generatePlanPrompt } from '../prompts/generate-plan.js';
import { generatePlanIterationPrompt } from '../prompts/plan-iteration.js';
import { weeklyReviewPrompt } from '../prompts/weekly-review.js';
import { suggestTaskSplitPrompt } from '../prompts/suggest-task-split.js';
import { resolveAreaTemplate } from '../prompts/plan-templates.js';
import { createOpenAIClient } from '../lib/openai-client.js';
import { normalizePlanStructure } from '../lib/plan-normalizer.js';
import { validateGeneratedPlan } from '../validators/plan-validator.js';
import { validateCheckinContext } from '../validators/checkin-validator.js';
import { validateWeeklyReviewInput } from '../validators/weekly-review-validator.js';
import { validateTaskSplitResult } from '../validators/task-split-validator.js';
import { withRetries } from '../lib/with-retries.js';

const JSON_ONLY_INSTRUCTIONS = 'Eres un mentor de proyectos experto. Responde SOLO con JSON válido.';

const getChatModel = () => {
  const configuredModel = process.env.OPENAI_MODEL?.trim();
  return configuredModel && configuredModel.length > 0 ? configuredModel : 'gpt-5-nano';
};

const shouldUseResponseFormat = () => {
  const override = process.env.OPENAI_RESPONSE_FORMAT?.trim().toLowerCase();
  if (override === 'disabled' || override === 'false' || override === 'off' || override === 'none') {
    return false;
  }

  if (override === 'json' || override === 'json_object' || override === 'true' || override === 'enabled') {
    return true;
  }

  return true;
};

const getResponseText = (response) => {
  const text = response?.output_text;
  return typeof text === 'string' ? text.trim() : '';
};

const shouldForceLowReasoning = (model) => model?.toLowerCase().includes('gpt-5');

const getPlanMaxTokens = () => {
  const raw = process.env.OPENAI_PLAN_MAX_TOKENS;
  if (!raw) return 600;

  const parsed = Number(raw);
  if (Number.isNaN(parsed) || parsed <= 0) return 600;

  return Math.min(parsed, 1200);
};

const getChatTemperature = () => {
  const raw = process.env.OPENAI_TEMPERATURE;
  if (!raw) return undefined;

  const parsed = Number(raw);
  if (Number.isNaN(parsed)) return undefined;

  if (parsed < 0 || parsed > 2) {
    return undefined;
  }

  return parsed;
};

const parseJsonContent = (rawContent) => {
  if (!rawContent) {
    return { ok: false };
  }

  try {
    return { ok: true, value: JSON.parse(rawContent) };
  } catch {
    return { ok: false };
  }
};

const requestStructuredJson = async ({
  openai,
  model,
  instructions = JSON_ONLY_INSTRUCTIONS,
  prompt,
  maxTokens,
}) => {
  const temperature = getChatTemperature();
  const useResponseFormat = shouldUseResponseFormat();
  let completion;
  let content;
  let currentMaxTokens = maxTokens;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    completion = await withRetries(() =>
      openai.responses.create({
        model,
        instructions,
        input: prompt,
        max_output_tokens: currentMaxTokens,
        ...(typeof temperature === 'number' ? { temperature } : {}),
        ...(useResponseFormat ? { text: { format: { type: 'json_object' } } } : {}),
        ...(shouldForceLowReasoning(model) ? { reasoning: { effort: 'low' } } : {}),
      })
    );

    if (
      completion?.incomplete_details?.reason === 'max_output_tokens' &&
      currentMaxTokens < 4000
    ) {
      currentMaxTokens = Math.min(currentMaxTokens * 2, 4000);
      continue;
    }

    content = getResponseText(completion);
    if (content) break;
  }

  return parseJsonContent(content);
};

const parseHours = (value) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed <= 0) return null;
  return parsed;
};

const parseIterations = (value) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) return 0;
  return Math.floor(parsed);
};

const normalizeTier = (tier) => (tier && tier.toString().toLowerCase() === 'pro' ? 'pro' : 'free');

export const testAI = async (req, res) => {
  const openai = createOpenAIClient();
  const model = getChatModel();

  const completion = await withRetries(() =>
    openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: "Say 'AI Service OK'" }],
    })
  );

  res.json({ message: completion.choices[0].message.content });
};

export const generatePlan = async (req, res) => {
  const { idea, availableHoursPerWeek, targetDate, projectArea, projectId } = req.body || {};
  const hours = parseHours(availableHoursPerWeek);
  if (!idea || !hours || !targetDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const openai = createOpenAIClient();
  const model = getChatModel();
  const areaTemplate = resolveAreaTemplate(projectArea);
  const prompt = generatePlanPrompt({
    idea,
    availableHours: hours,
    targetDate,
    projectArea: areaTemplate.key,
  });

  const result = await requestStructuredJson({
    openai,
    model,
    prompt,
    maxTokens: getPlanMaxTokens(),
  });

  if (!result.ok) {
    return res.status(500).json({ error: 'Invalid AI response' });
  }

  const validation = validateGeneratedPlan(result.value, { availableHours: hours });
  if (!validation.ok) {
    return res.status(500).json({ error: 'Invalid plan structure', details: validation.errors });
  }

  const normalizedPlan = normalizePlanStructure(result.value, {
    projectId: projectId || req.body?.projectId,
    projectArea: areaTemplate.key,
  });

  return res.json(normalizedPlan);
};

export const generatePlanIteration = async (req, res) => {
  const { projectId } = req.params;
  const {
    previousPlan,
    feedback,
    availableHoursPerWeek,
    targetDate,
    userTier,
    existingIterations,
    projectArea,
  } = req.body || {};

  const hours = parseHours(availableHoursPerWeek) || parseHours(previousPlan?.availableHoursPerWeek);
  const tier = normalizeTier(userTier);
  const iterations = parseIterations(existingIterations);

  if (!feedback || !previousPlan || typeof previousPlan !== 'object') {
    return res.status(400).json({ error: 'Invalid iteration payload' });
  }

  if (tier === 'free' && iterations >= 1) {
    return res.status(403).json({ error: 'Free tier allows only one iteration' });
  }

  const previousValidation = validateGeneratedPlan(previousPlan, {
    availableHours: hours || parseHours(previousPlan?.initialTasks?.[0]?.estimatedHours) || 40,
  });
  if (!previousValidation.ok) {
    return res.status(400).json({ error: 'Previous plan is invalid' });
  }

  const openai = createOpenAIClient();
  const model = getChatModel();
  const areaTemplate = resolveAreaTemplate(projectArea || previousPlan.projectArea);
  const prompt = generatePlanIterationPrompt({
    idea: previousPlan.title,
    availableHours: hours,
    targetDate: targetDate || previousPlan.targetDate,
    feedback,
    projectArea: areaTemplate.key,
    previousPlan,
  });

  const result = await requestStructuredJson({
    openai,
    model,
    prompt,
    maxTokens: getPlanMaxTokens(),
  });

  if (!result.ok) {
    return res.status(500).json({ error: 'Invalid AI response' });
  }

  const validation = validateGeneratedPlan(result.value, { availableHours: hours || 40 });
  if (!validation.ok) {
    return res.status(500).json({ error: 'Invalid plan structure', details: validation.errors });
  }

  const normalizedPlan = normalizePlanStructure(result.value, {
    projectId: projectId || previousPlan.projectId,
    projectArea: areaTemplate.key,
    previousPlan,
  });

  return res.json({
    tier,
    iteration: iterations + 1,
    projectId: normalizedPlan.projectId,
    plan: normalizedPlan,
  });
};

export const generateCheckin = async (req, res) => {
  const { context } = req.body || {};
  const validation = validateCheckinContext(context);
  if (!validation.ok) {
    return res.status(400).json({ error: 'Invalid context' });
  }

  const openai = createOpenAIClient();
  const model = getChatModel();
  const prompt = checkinPrompt(context);
  const temperature = getChatTemperature();

  const completion = await withRetries(() => {
    const requestPayload = {
      model,
      messages: [{ role: 'user', content: prompt }],
      max_completion_tokens: 100,
    };

    if (typeof temperature === 'number') {
      requestPayload.temperature = temperature;
    }

    return openai.chat.completions.create(requestPayload);
  });

  const message = completion.choices?.[0]?.message?.content?.trim();
  if (!message) return res.status(500).json({ error: 'Invalid AI response' });

  return res.json({ message: message.slice(0, 150) });
};

export const generateWeeklyReview = async (req, res) => {
  const { data } = req.body || {};
  const inputValidation = validateWeeklyReviewInput(data);
  if (!inputValidation.ok) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  const openai = createOpenAIClient();
  const model = getChatModel();
  const prompt = weeklyReviewPrompt(data);

  const result = await requestStructuredJson({
    openai,
    model,
    prompt,
    maxTokens: getPlanMaxTokens(),
  });

  if (!result.ok) {
    return res.status(500).json({ error: 'Invalid AI response' });
  }

  const review = result.value;
  if (
    typeof review?.summary !== 'string' ||
    !Array.isArray(review?.questions) ||
    !Array.isArray(review?.suggestions)
  ) {
    return res.status(500).json({ error: 'Invalid AI response' });
  }

  return res.json(review);
};

export const suggestTaskSplit = async (req, res) => {
  const { task, projectContext, maxSubtasks } = req.body || {};
  if (!task || typeof task !== 'object' || !task.title || !task.description) {
    return res.status(400).json({ error: 'Invalid task payload' });
  }

  const openai = createOpenAIClient();
  const model = getChatModel();
  const cappedSubtasks = Math.min(Math.max(Number(maxSubtasks) || 4, 2), 8);
  const prompt = suggestTaskSplitPrompt({ task, projectContext, maxSubtasks: cappedSubtasks });

  const result = await requestStructuredJson({
    openai,
    model,
    prompt,
    maxTokens: Math.min(getPlanMaxTokens(), 800),
  });

  if (!result.ok) {
    return res.status(500).json({ error: 'Invalid AI response' });
  }

  const validation = validateTaskSplitResult(result.value);
  if (!validation.ok) {
    return res.status(500).json({ error: 'Invalid AI response' });
  }

  const subtasks = result.value.subtasks.map((subtask, index) => ({
    id:
      typeof subtask.id === 'string' && subtask.id.trim().length > 0
        ? subtask.id.trim()
        : `subtask-${index + 1}`,
    title: subtask.title.trim(),
    description: subtask.description.trim(),
    estimatedHours: subtask.estimatedHours,
    order: index + 1,
  }));

  return res.json({ subtasks });
};
