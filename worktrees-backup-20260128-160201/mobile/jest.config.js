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
    '!app/**/expo-env.d.ts',
    '!app/**/metro.config.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/app/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|react-native-paper|react-native-vector-icons|@react-navigation|react-native-purchases|react-native-reanimated|react-native-gesture-handler|react-native-safe-area-context|react-native-screens|expo-modules-core|expo-router|expo-constants|expo-device|expo-notifications|expo-haptics|expo-linear-gradient)/)',
  ],
  globals: {
    __DEV__: true,
  },
};