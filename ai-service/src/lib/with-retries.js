const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const withRetries = async (fn, { retries = 3, baseDelayMs = 200 } = {}) => {
  let lastError;

  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === retries - 1) break;
      await sleep(baseDelayMs * (attempt + 1));
    }
  }

  throw lastError;
};

