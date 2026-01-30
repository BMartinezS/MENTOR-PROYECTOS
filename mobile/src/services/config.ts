import Constants from 'expo-constants';

// Environment detection
export const IS_PRODUCTION = !__DEV__;

// Production API URL - configure this before deploying
const PRODUCTION_API_URL = 'https://api.mentorproyectos.com/api';
// Development API URL - local machine IP
const DEVELOPMENT_API_URL = 'http://192.168.100.16:3000/api';

type ExtraConfig = {
  apiUrl?: string;
  useMockApi?: boolean | string;
  revenueCatApiKeyIOS?: string;
  revenueCatApiKeyAndroid?: string;
};

function getExtraConfig(): ExtraConfig {
  const expoExtra = (Constants.expoConfig?.extra ?? {}) as ExtraConfig;
  if (Object.keys(expoExtra).length) {
    return expoExtra;
  }

  const legacyManifest = Constants.manifest as { extra?: ExtraConfig } | null;
  return legacyManifest?.extra ?? {};
}

function parseBoolean(value: string | boolean | undefined | null) {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'boolean') return value;
  const normalized = value.toLowerCase();
  return normalized === '1' || normalized === 'true';
}

const extra = getExtraConfig();

// API URL resolution (priority: env var > manifest > environment default)
const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
const manifestApiUrl = typeof extra.apiUrl === 'string' ? extra.apiUrl : undefined;
const defaultApiUrl = IS_PRODUCTION ? PRODUCTION_API_URL : DEVELOPMENT_API_URL;

export const API_URL = envApiUrl && envApiUrl.trim().length
  ? envApiUrl
  : manifestApiUrl ?? defaultApiUrl;

// Mock API configuration
const envUseMock = parseBoolean(process.env.EXPO_PUBLIC_USE_MOCK_API ?? undefined);
const manifestUseMock = parseBoolean(extra.useMockApi ?? undefined);

export const USE_MOCK_API = envUseMock ?? manifestUseMock ?? false;

// RevenueCat API Keys
// For production: use separate keys per platform
// For development/testing: a single key works for both
const envRevenueCatKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
const envRevenueCatIOS = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS;
const envRevenueCatAndroid = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID;
const manifestRevenueCatIOS = extra.revenueCatApiKeyIOS;
const manifestRevenueCatAndroid = extra.revenueCatApiKeyAndroid;

// Single key fallback (useful for development)
const fallbackKey = envRevenueCatKey ?? 'YOUR_REVENUECAT_API_KEY';

export const REVENUECAT_API_KEY = {
  ios: envRevenueCatIOS ?? manifestRevenueCatIOS ?? fallbackKey,
  android: envRevenueCatAndroid ?? manifestRevenueCatAndroid ?? fallbackKey,
};
