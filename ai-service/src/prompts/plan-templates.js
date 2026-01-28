const normalizeKey = (value) => {
  if (!value) return 'general';
  const key = value.toString().trim().toLowerCase();
  return key.length > 0 ? key : 'general';
};

const AREA_TEMPLATES = {
  general: {
    key: 'general',
    label: 'Ejecución general',
    tone: 'equilibrado y directo',
    focus: 'mantener un balance entre planificación, validación y lanzamiento',
    sections: ['Exploración inicial', 'Validación rápida', 'Entrega iterativa'],
    kpis: ['Tareas completadas/planificadas', 'Tiempo invertido vs estimado', 'Impacto en objetivo principal'],
  },
  marketing: {
    key: 'marketing',
    label: 'Marketing y growth',
    tone: 'energético y orientado a pruebas',
    focus: 'experimentación de canales, mensajes y medición continua',
    sections: ['Investigación de audiencia', 'Experimentación de canales', 'Optimización y escalamiento'],
    kpis: ['Leads generados', 'CAC estimado', 'CTR / Conversión'],
  },
  producto: {
    key: 'producto',
    label: 'Producto digital',
    tone: 'enfocado en discovery y entregables UX/UI',
    focus: 'validación con usuarios, prototipos y releases incrementales',
    sections: ['Research y discovery', 'Diseño/Prototipado', 'Desarrollo y QA'],
    kpis: ['Usuarios activos', 'NPS / CSAT', 'Velocidad de releases'],
  },
  operaciones: {
    key: 'operaciones',
    label: 'Operaciones y procesos',
    tone: 'metódico y orientado a eficiencia',
    focus: 'documentar procesos, eliminar cuellos de botella y estandarizar',
    sections: ['Mapeo de procesos actuales', 'Implementación de mejoras', 'Medición/Optimización'],
    kpis: ['Tiempo de ciclo', 'Errores por proceso', 'Costo por operación'],
  },
  finanzas: {
    key: 'finanzas',
    label: 'Estrategia financiera',
    tone: 'analítico y conservador',
    focus: 'modelación financiera, control de gastos y fuentes de ingresos',
    sections: ['Diagnóstico financiero', 'Plan de ingresos/gastos', 'Implementación y monitoreo'],
    kpis: ['Margen bruto', 'Burn rate', 'Runway proyectado'],
  },
  tecnologia: {
    key: 'tecnologia',
    label: 'Tecnología e ingeniería',
    tone: 'técnico y pragmático',
    focus: 'arquitectura sólida, entregas incrementales y calidad',
    sections: ['Arquitectura', 'Implementación', 'QA y despliegue'],
    kpis: ['Cobertura de tests', 'Tiempo de despliegue', 'Incidentes abiertos'],
  },
};

const resolveAreaKey = (value) => {
  const normalized = normalizeKey(value);
  if (AREA_TEMPLATES[normalized]) return normalized;
  if (normalized.startsWith('prod')) return 'producto';
  if (normalized.startsWith('ops') || normalized.includes('oper')) return 'operaciones';
  if (normalized.startsWith('fin')) return 'finanzas';
  if (normalized.startsWith('tech') || normalized.includes('dev')) return 'tecnologia';
  if (normalized.startsWith('mkt') || normalized.includes('growth')) return 'marketing';
  return 'general';
};

export const resolveAreaTemplate = (area) => AREA_TEMPLATES[resolveAreaKey(area)];

export const formatAreaGuidance = (template) => {
  const sectionsList = template.sections.map((section) => `- ${section}`).join('\n');
  const kpiList = template.kpis.map((kpi) => `- ${kpi}`).join('\n');
  return `Área: ${template.label}\nTono esperado: ${template.tone}\nEnfoque: ${template.focus}\nSecciones sugeridas:\n${sectionsList}\nKPIs recomendados:\n${kpiList}`;
};
