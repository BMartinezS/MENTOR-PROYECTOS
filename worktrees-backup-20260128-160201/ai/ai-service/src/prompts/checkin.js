export const checkinPrompt = (context) => `
Genera un mensaje de check-in para el usuario ${context.userName}.

Contexto:
- Ultima tarea completada: ${context.lastTask || 'ninguna'}
- Próxima tarea: ${context.nextTask}
- Días sin progreso: ${context.daysSinceProgress}
- Proyecto: ${context.projectTitle}

Genera un mensaje corto (max 150 caracteres) que:
1. Sea amable pero directo
2. Mencione el momentum si hay avance reciente
3. Pregunte específicamente sobre la próxima tarea
4. Use tono ${context.tone} (normal/suave/directo)

Responde SOLO el mensaje, sin comillas ni formato adicional.
`;

