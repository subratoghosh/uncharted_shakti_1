// mocks/browser.ts — MSW browser setup (dev only)
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

