import Constants from 'expo-constants';

type ExtraConfig = {
  apiUrl?: string;
  useMockApi?: boolean | string;
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
const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
const manifestApiUrl = typeof extra.apiUrl === 'string' ? extra.apiUrl : undefined;

export const API_URL = envApiUrl && envApiUrl.trim().length ? envApiUrl : manifestApiUrl ?? 'http://localhost:3000/api';

const envUseMock = parseBoolean(process.env.EXPO_PUBLIC_USE_MOCK_API ?? undefined);
const manifestUseMock = parseBoolean(extra.useMockApi ?? undefined);

export const USE_MOCK_API = envUseMock ?? manifestUseMock ?? false;
