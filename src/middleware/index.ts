import { onRequest as authGuard } from './auth-guard';

export const onRequest = authGuard;
