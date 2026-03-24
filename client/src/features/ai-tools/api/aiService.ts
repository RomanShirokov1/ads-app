import axios from 'axios';
import { getCategoryLabel } from '@/entities/ad/lib/ad-formatters';
import type { EditAdFormValues } from '@/entities/ad/model/types';
import { env } from '@/shared/config/env';

type GenerateDescriptionResult = {
  description: string;
  suggestions: string[];
};

type EstimatePriceResult = {
  price: number;
  rationale: string;
};

const buildPrompt = (type: 'description' | 'price', values: EditAdFormValues) => {
  const compactPayload = JSON.stringify(values, null, 2);

  if (type === 'description') {
    return `Ты помогаешь улучшать карточки объявлений.
Верни JSON c полями description и suggestions.
description: готовый продающий текст на русском языке без markdown.
suggestions: массив из 2-3 коротких причин, почему текст лучше.
Категория: ${getCategoryLabel(values.category)}
Данные объявления:
${compactPayload}`;
  }

  return `Ты оцениваешь рыночную цену объявления.
Верни JSON c полями price и rationale.
price: одно целое число в рублях.
rationale: короткое объяснение в 1-2 предложениях.
Категория: ${getCategoryLabel(values.category)}
Данные объявления:
${compactPayload}`;
};

const parseOllamaResponse = <T,>(response: string): T => {
  const firstBraceIndex = response.indexOf('{');
  const lastBraceIndex = response.lastIndexOf('}');

  if (firstBraceIndex === -1 || lastBraceIndex === -1) {
    throw new Error('LLM вернула ответ без ожидаемого JSON');
  }

  return JSON.parse(response.slice(firstBraceIndex, lastBraceIndex + 1)) as T;
};

const callOllama = async <T,>(type: 'description' | 'price', values: EditAdFormValues) => {
  if (!env.ollamaUrl.trim()) {
    throw new Error('Не задан VITE_OLLAMA_URL в .env');
  }

  const { data } = await axios.post<{ response: string }>(env.ollamaUrl, {
    model: 'llama3',
    stream: false,
    prompt: buildPrompt(type, values),
  });

  return parseOllamaResponse<T>(data.response);
};

export const aiService = {
  generateDescription(values: EditAdFormValues) {
    return callOllama<GenerateDescriptionResult>('description', values);
  },

  estimatePrice(values: EditAdFormValues) {
    return callOllama<EstimatePriceResult>('price', values);
  },
};