/**
 * Setup global para Vitest + Testing Library.
 * Se ejecuta antes de cada archivo de test.
 */
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock de IntersectionObserver (no disponible en jsdom)
globalThis.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock de ResizeObserver (no disponible en jsdom)
globalThis.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock de matchMedia (no disponible en jsdom)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock de scrollTo
window.scrollTo = vi.fn();
