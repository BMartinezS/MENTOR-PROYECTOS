# Testing Setup - React Native + Expo

Este documento describe la configuración de testing automatizado para la aplicación móvil.

## ✅ Configuración Completada

- ✅ Dependencias de testing instaladas
- ✅ Jest configuration creada (`jest.config.js`)
- ✅ Jest setup file creado (`jest.setup.js`)
- ✅ Test scripts agregados a `package.json`
- ✅ Tests de ejemplo creados para componentes principales
- ✅ Mocks configurados para módulos Expo y React Native

## 📦 Dependencias Instaladas

```json
{
  "devDependencies": {
    "jest": "^30.2.0",
    "jest-expo": "^54.0.16",
    "@testing-library/react-native": "^13.3.3",
    "react-test-renderer": "^19.1.0"
  }
}
```

## 🚧 Problemas Conocidos

### Incompatibilidad Expo SDK 54 + Jest

El preset `jest-expo` tiene incompatibilidades con:
- React 19.1.0
- Expo SDK 54
- TypeScript modules en `expo-modules-core`

**Error típico**:
```
Cannot use import statement outside a module
expo-modules-core/src/polyfill/dangerous-internal.ts
```

### Soluciones Posibles

#### Opción 1: Downgrade a React 18 (Recomendado para testing)
```bash
npm install react@18.2.0 react-test-renderer@18.2.0 --save-dev
```

#### Opción 2: Configuración alternativa de Jest
Usar configuración más básica sin `jest-expo` preset:
```javascript
module.exports = {
  testEnvironment: 'node',
  preset: '@testing-library/react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/app/$1',
  },
};
```

#### Opción 3: Usar Detox para E2E Testing
Para pruebas end-to-end que evitan problemas de unit testing:
```bash
npm install --save-dev detox
```

## 📁 Tests Creados

### Context Tests
- `app/contexts/__tests__/AuthContext.test.tsx` - Testing del contexto de autenticación
- `app/contexts/__tests__/PurchaseContext.test.tsx` - Testing del contexto de compras

### Component Tests
- `app/components/__tests__/ProUpgradePrompt.test.tsx` - Testing del componente de upgrade

### Setup Test
- `app/__tests__/setup.test.ts` - Test básico de configuración

## 🧪 Scripts de Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con coverage
npm run test:coverage

# Ejecutar tests para CI
npm run test:ci
```

## 🔧 Configuración Jest

### jest.config.js
```javascript
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js|jsx)',
    '**/*.(test|spec).(ts|tsx|js|jsx)',
  ],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    '!app/**/*.d.ts',
    '!app/**/_layout.tsx',
    '!app/**/index.tsx',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/app/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo)/)',
  ],
};
```

### jest.setup.js
Mocks configurados para:
- ✅ AsyncStorage
- ✅ Expo Router
- ✅ Expo Constants
- ✅ Expo Notifications
- ✅ Expo Device
- ✅ Expo Haptics
- ✅ Expo Linear Gradient
- ✅ RevenueCat
- ✅ Lucide Icons
- ✅ React Native Paper

## 🔍 Testing Patterns

### Testing Contexts
```typescript
import { render, waitFor, act } from '@testing-library/react-native';

// Mock dependencies
jest.mock('../services/api');

// Test context providers
const TestConsumer = () => {
  const context = useMyContext();
  return null;
};

render(
  <MyContextProvider>
    <TestConsumer />
  </MyContextProvider>
);
```

### Testing Components
```typescript
import { render, fireEvent } from '@testing-library/react-native';

// Test component rendering and interactions
const { getByText, queryByText } = render(<MyComponent />);
fireEvent.press(getByText('Button'));
expect(queryByText('Result')).toBeTruthy();
```

### Testing API Calls
```typescript
// Mock API responses
mockApi.auth.login.mockResolvedValue({
  user: { id: '123', email: 'test@example.com' },
  token: 'jwt-token'
});

// Test async operations
await act(async () => {
  await authContext.login('email', 'password');
});

expect(authContext.user).toEqual(expectedUser);
```

## 🚀 Next Steps

### Para Habilitar Testing Inmediatamente:

1. **Downgrade React** (temporalmente para testing):
   ```bash
   npm install react@18.2.0 react-dom@18.2.0 --save-dev
   ```

2. **Ejecutar tests**:
   ```bash
   npm test
   ```

3. **Verificar cobertura**:
   ```bash
   npm run test:coverage
   ```

### Para Testing Completo:

1. Resolver incompatibilidades de Expo + Jest
2. Agregar tests para todos los componentes principales
3. Agregar tests de integración para flows completos
4. Configurar CI/CD pipeline con testing automático
5. Agregar E2E testing con Detox

## 📋 Testing Checklist

- [x] Jest configurado
- [x] Testing Library instalado
- [x] Mocks configurados
- [x] Tests de ejemplo creados
- [ ] Tests ejecutándose sin errores
- [ ] Coverage reportes funcionando
- [ ] CI/CD pipeline configurado
- [ ] E2E tests configurados

## 🔧 Troubleshooting

### "Cannot use import statement outside a module"
- Verificar `transformIgnorePatterns` en jest.config.js
- Considerar downgrade a React 18 para testing
- Usar configuración Jest alternativa sin preset expo

### "Module not found"
- Verificar `moduleNameMapper` configuration
- Asegurar que mocks estén en jest.setup.js

### Tests muy lentos
- Usar `--maxWorkers=1` para debugging
- Optimizar `transformIgnorePatterns`
- Considerar separar unit tests de integration tests

---

**Estado**: Configuración lista, pendiente resolución de incompatibilidades Expo SDK 54 + Jest
**Próximo paso**: Downgrade React 18 o configuración alternativa de Jest
**Mantenido por**: Equipo de desarrollo