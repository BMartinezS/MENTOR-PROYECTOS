# /test-all

Ejecuta tests de backend, mobile y ai-service con coverage.

## Proceso

### 1. Backend Tests
```bash
cd backend && npm test -- --coverage --passWithNoTests
```

### 2. Mobile Tests
```bash
cd mobile && npm test -- --coverage --passWithNoTests
```

### 3. AI Service Tests
```bash
cd ai-service && npm test -- --coverage --passWithNoTests
```

## En caso de fallos

Para cada test que falle:
1. Leer el output del error
2. Identificar archivo y línea
3. Analizar causa raíz
4. Proponer y aplicar fix
5. Re-ejecutar test específico
6. Continuar hasta que pase

## Coverage Target
- Backend: 80%+ statements
- Mobile: 75%+ statements (UI tests son más difíciles)
- AI Service: 80%+ statements

## Output esperado
```
📊 TEST RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━
Backend:   ✅ 45/45 passed | 87% coverage
Mobile:    ✅ 23/23 passed | 78% coverage
AI Service: ✅ 12/12 passed | 91% coverage
━━━━━━━━━━━━━━━━━━━━━━━━
✅ ALL TESTS PASSED
```

## Si coverage es bajo
Listar archivos que necesitan más tests y ofrecer generarlos.
