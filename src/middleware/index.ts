import { authGuard } from './auth-guard';

// Ekspor hanya fungsi authGuard sebagai onRequest untuk saat ini
// Karena ekspor array di auth-guard.ts telah dihapus
export const onRequest = authGuard;
