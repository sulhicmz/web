import { onRequest as authGuard } from './auth-guard';
import { sequence } from 'astro/middleware';

export const onRequest = sequence(authGuard);
