import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock canvas-confetti because it is a canvas animation library and not supported in JSDOM
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));
