import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { EditAdFormValues } from '@/entities/ad/model/types';
import { getCategoryLabel } from '@/entities/ad/lib/ad-formatters';

const { mockedPost, mockedEnv } = vi.hoisted(() => ({
  mockedPost: vi.fn(),
  mockedEnv: {
    apiBaseUrl: 'http://localhost:8080',
    ollamaUrl: 'http://localhost:11434/api/generate',
  },
}));

vi.mock('axios', () => ({
  default: {
    post: mockedPost,
  },
}));

vi.mock('@/shared/config/env', () => ({
  env: mockedEnv,
}));

import { aiService } from './aiService';

const formValues: EditAdFormValues = {
  category: 'electronics',
  title: 'iPhone 15',
  description: 'Почти новый',
  price: 80000,
  params: {
    type: 'phone',
    brand: 'Apple',
    model: '15',
    condition: 'used',
    color: 'black',
  },
};

describe('aiService', () => {
  beforeEach(() => {
    mockedPost.mockReset();
    mockedEnv.ollamaUrl = 'http://localhost:11434/api/generate';
  });

  it('builds description prompt and sends expected request payload', async () => {
    mockedPost.mockResolvedValueOnce({
      data: {
        response: '{"description":"Готовый текст","suggestions":["Причина 1","Причина 2"]}',
      },
    });

    await aiService.generateDescription(formValues);

    expect(mockedPost).toHaveBeenCalledTimes(1);

    const [url, payload] = mockedPost.mock.calls[0] as [string, Record<string, unknown>];

    expect(url).toBe(mockedEnv.ollamaUrl);
    expect(payload.model).toBe('llama3');
    expect(payload.stream).toBe(false);
    expect(payload.prompt).toEqual(expect.stringContaining('description'));
    expect(payload.prompt).toEqual(expect.stringContaining('suggestions'));
    expect(payload.prompt).toEqual(
      expect.stringContaining(`Категория: ${getCategoryLabel(formValues.category)}`),
    );
    expect(payload.prompt).toEqual(
      expect.stringContaining(JSON.stringify(formValues, null, 2)),
    );
  });

  it('builds price prompt and parses JSON embedded in extra text', async () => {
    mockedPost.mockResolvedValueOnce({
      data: {
        response:
          'Some preface text {"price":125000,"rationale":"Оценка по рынку"} trailing text',
      },
    });

    const result = await aiService.estimatePrice(formValues);

    const [, payload] = mockedPost.mock.calls[0] as [string, Record<string, unknown>];

    expect(payload.prompt).toEqual(expect.stringContaining('price'));
    expect(payload.prompt).toEqual(expect.stringContaining('rationale'));
    expect(result).toEqual({
      price: 125000,
      rationale: 'Оценка по рынку',
    });
  });

  it('throws when ollama url is not configured', async () => {
    mockedEnv.ollamaUrl = '   ';

    await expect(aiService.generateDescription(formValues)).rejects.toThrow();
    expect(mockedPost).not.toHaveBeenCalled();
  });

  it('throws when response has no JSON object', async () => {
    mockedPost.mockResolvedValueOnce({
      data: {
        response: 'No json here',
      },
    });

    await expect(aiService.estimatePrice(formValues)).rejects.toThrow();
  });
});
