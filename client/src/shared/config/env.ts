const defaultApiBaseUrl = 'http://localhost:8080';

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? defaultApiBaseUrl,
  ollamaUrl: import.meta.env.VITE_OLLAMA_URL ?? '',
};
