import { describe, it, expect, vi } from 'vitest';
import { saveLead, TARGET_LEAD_EMAIL } from '../services/leadService.js';

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn().mockResolvedValue({ id: 'test-lead-123' }),
  getFirestore: vi.fn()
}));

vi.mock('../config/firebase.js', () => ({
  db: {}
}));

describe('Lead Capture Service', () => {
  it('should target hipatia.admin@gmail.com for lead notifications', () => {
    expect(TARGET_LEAD_EMAIL).toBe('hipatia.admin@gmail.com');
  });

  it('should format lead payload correctly and process saveLead', async () => {
    const sampleLead = {
      name: 'Carlos Mendoza',
      company: 'Café Alexander',
      email: 'carlos@alexander.bo',
      service: 'puntos',
      message: 'Interesado en la plataforma de puntos'
    };

    const res = await saveLead(sampleLead);
    expect(res).toBeDefined();
    expect(res.success).toBe(true);
    expect(res.id).toBe('test-lead-123');
  });
});
