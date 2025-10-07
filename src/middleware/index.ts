import { onRequest as authGuard } from './auth-guard';

// Hapus ekspor onRequest tunggal karena onRequest di auth-guard.ts sudah berupa array middleware
// Ekspor middleware array dari auth-guard.ts
export { onRequest } from './auth-guard';
