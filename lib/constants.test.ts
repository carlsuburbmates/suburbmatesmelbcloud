import { describe, it, expect } from 'vitest';
import { SITE_CONFIG } from './constants';

describe('Constants', () => {
  it('should have the correct site name', () => {
    expect(SITE_CONFIG.name).toBe('SuburbMates');
  });

  it('should have the correct footer copyright', () => {
    expect(SITE_CONFIG.footer.copyright).toBe('© 2026 Melb');
  });
});