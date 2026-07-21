import { describe, it, expect } from 'vitest';
import { HIPATIA_MANUAL_CONTEXT, askGeminiSupport } from '../services/aiSupport.js';

describe('Gemini AI Customer Support Agent (Zero-Database RAG)', () => {
  it('should contain official Hipatia manuals, fraud rules, and fallback email in prompt context', () => {
    expect(HIPATIA_MANUAL_CONTEXT).toContain('hola@hipatia.bo');
    expect(HIPATIA_MANUAL_CONTEXT).toContain('HIPATIA PUNTOS');
    expect(HIPATIA_MANUAL_CONTEXT).toContain('TOTP');
    expect(HIPATIA_MANUAL_CONTEXT).toContain('alberdi.andres@gmail.com');
    expect(HIPATIA_MANUAL_CONTEXT).toContain('hipatia.admin@gmail.com');
  });

  it('should return fallback greeting or response when API key is unconfigured', async () => {
    const res = await askGeminiSupport('¿Cuáles son los servicios de Hipatia?');
    expect(res).toBeDefined();
    expect(typeof res).toBe('string');
    expect(res).toContain('hola@hipatia.bo');
  });
});
