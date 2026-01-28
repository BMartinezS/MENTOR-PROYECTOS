import { USE_MOCK_API } from './config';
import { mockApi } from './mockApi';
import { realApi } from './realApi';

export const api = USE_MOCK_API ? mockApi : realApi;

export const isMockApi = USE_MOCK_API;
