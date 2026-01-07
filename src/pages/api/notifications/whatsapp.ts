import type { APIRoute } from 'astro';
import { withTimeout } from '../../../lib/api-middleware';
import { ApiError } from '../../../lib/api-utils';

import { getServiceClient } from '../../../lib/supabase/server';

const RETRY_DELAYS_MINUTES = [5, 15, 60];

const safeNumber = (value: unknown): number | null => {
        if (value === null || value === undefined) return null;
        const parsed = Number.parseInt(String(value), 10);
        return Number.isFinite(parsed) ? parsed : null;
};

const createId = () => {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
                return crypto.randomUUID();
        }
        return `wa_${Math.random().toString(36).slice(2, 12)}`;
};

const resolveStatuses = (payload: Record<string, unknown>) => {
        const entries = Array.isArray(payload.entry) ? payload.entry : [];
        const statuses: Array<Record<string, unknown>> = [];

        for (const entry of entries) {
                const changes = Array.isArray((entry as Record<string, unknown>)?.changes)
                        ? (entry as Record<string, unknown>).changes as Array<Record<string, unknown>>
                        : [];

                for (const change of changes) {
                        const value = (change as Record<string, unknown>)?.value as Record<string, unknown> | undefined;
                        const changeStatuses = Array.isArray(value?.statuses) ? value?.statuses : [];
                        for (const status of changeStatuses) {
                                statuses.push(status as Record<string, unknown>);
                        }
                }
        }

        return statuses;
};

const resolveMessages = (payload: Record<string, unknown>) => {
        const entries = Array.isArray(payload.entry) ? payload.entry : [];
        const messages: Array<Record<string, unknown>> = [];

        for (const entry of entries) {
                const changes = Array.isArray((entry as Record<string, unknown>)?.changes)
                        ? (entry as Record<string, unknown>).changes as Array<Record<string, unknown>>
                        : [];

                for (const change of changes) {
                        const value = (change as Record<string, unknown>)?.value as Record<string, unknown> | undefined;
                        const changeMessages = Array.isArray(value?.messages) ? value?.messages : [];
                        for (const message of changeMessages) {
                                messages.push(message as Record<string, unknown>);
                        }
                }
        }

        return messages;
};

const computeRetryPlan = (rawAttempt: unknown) => {
        const attemptIndex = safeNumber(rawAttempt);
        const currentIndex = attemptIndex !== null && attemptIndex >= 0 ? attemptIndex : 0;
        if (currentIndex >= RETRY_DELAYS_MINUTES.length) {
                        return { attemptIndex: currentIndex, nextRetryAt: null };
        }
        const delayMinutes = RETRY_DELAYS_MINUTES[currentIndex];
        const nextRetryAt = new Date(Date.now() + delayMinutes * 60 * 1000);
        return { attemptIndex: currentIndex, nextRetryAt };
};

const getSupabaseClient = () => {
        try {
                return getServiceClient();
        } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                console.warn('[whatsapp:webhook] Supabase client unavailable', message);
                return null;
        }
};

const insertEvents = async (supabase: ReturnType<typeof getServiceClient> | null, events: Array<Record<string, unknown>>) => {
        if (!supabase || events.length === 0) {
                return;
        }

        const { error } = await supabase.from('whatsapp_events').insert(events);
        if (error) {
                console.error('[whatsapp:webhook] gagal menyimpan log', error.message ?? error);
        }
};

const enqueueRetries = async (
        supabase: ReturnType<typeof getServiceClient> | null,
        retries: Array<{
                status: Record<string, unknown>;
                nextRetryAt: Date;
                attemptIndex: number;
        }>,
) => {
        if (!supabase || retries.length === 0) {
                if (retries.length > 0) {
                        console.warn('[whatsapp:webhook] Supabase tidak tersedia, tidak dapat menjadwalkan retry');
                }
                return;
        }

        for (const retry of retries) {
                        const record = {
                                id: createId(),
                                message_id: retry.status.id ?? null,
                                recipient: retry.status.recipient_id ?? null,
                                attempt: retry.attemptIndex + 1,
                                retry_at: retry.nextRetryAt.toISOString(),
                                payload: retry.status,
                                created_at: new Date().toISOString(),
                        };
                        const { error } = await supabase.from('whatsapp_retry_queue').upsert(record);
                        if (error) {
                                console.error('[whatsapp:webhook] gagal menjadwalkan retry', error.message ?? error);
                        }
        }
};

const applyOptOut = async (supabase: ReturnType<typeof getServiceClient> | null, numbers: Set<string>) => {
        if (!supabase || numbers.size === 0) {
                return;
        }

        for (const phone of numbers) {
                const { error } = await supabase
                        .from('notifications_opt_in')
                        .update({
                                opted_in: false,
                                opted_out_at: new Date().toISOString(),
                                opted_out_source: 'user_reply_stop',
                        })
                        .eq('phone', phone);

                if (error) {
                        console.error('[whatsapp:webhook] gagal memperbarui opt-out', phone, error.message ?? error);
                }
        }
};

export const POST: APIRoute = withTimeout(async ({ request }) => {
        let payload: Record<string, unknown>;
        try {
                payload = (await request.json()) as Record<string, unknown>;
        } catch (error) {
                throw new ApiError('Request body must be valid JSON', 400, 'INVALID_JSON');
        }

        const supabase = getSupabaseClient();
        const statuses = resolveStatuses(payload);
        const messages = resolveMessages(payload);

        const logRecords: Array<Record<string, unknown>> = [];
        const retryQueue: Array<{ status: Record<string, unknown>; nextRetryAt: Date; attemptIndex: number }> = [];

        for (const statusRecord of statuses) {
                const status = statusRecord as Record<string, unknown>;
                const statusMetadata = (status.metadata as Record<string, unknown> | undefined) ?? {};
                const errors = Array.isArray(status.errors)
                        ? (status.errors as Array<Record<string, unknown>>)
                        : [];
                const firstError = errors[0];

                const attemptSource =
                        statusMetadata.attempt ?? firstError?.details ?? firstError?.code ?? status.retry_count ?? 0;
                const attempt = computeRetryPlan(attemptSource);
                const attemptNumber = attempt.attemptIndex + 1;
                const nextRetryEligible = status.status === 'failed' ? attempt.nextRetryAt : null;

                logRecords.push({
                        event_id: createId(),
                        message_id: status.id ?? null,
                        recipient: status.recipient_id ?? null,
                        template: (status.template as string | undefined) ?? ((status.conversation as Record<string, unknown> | undefined)?.origin as Record<string, unknown> | undefined)?.type ?? null,
                        status: status.status,
                        attempt: attemptNumber,
                        retry_after: nextRetryEligible?.toISOString() ?? null,
                        error_code: firstError?.code ?? null,
                        error_title: firstError?.title ?? null,
                        payload: status,
                        created_at: status.timestamp ? new Date(Number(status.timestamp) * 1000).toISOString() : new Date().toISOString(),
                });

                if (nextRetryEligible) {
                        retryQueue.push({ status, nextRetryAt: nextRetryEligible, attemptIndex: attempt.attemptIndex + 1 });
                }

                console.info('[whatsapp:webhook] status', {
                        messageId: status.id,
                        status: status.status,
                        recipient: status.recipient_id,
                        attempt: attemptNumber,
                        retryAt: nextRetryEligible?.toISOString() ?? null,
                });
        }

        const optOutNumbers = new Set<string>();
        for (const message of messages) {
                const messageObj = message as Record<string, unknown>;
                const type = (messageObj?.type as string) || 'unknown';
                if (type === 'text') {
                        const from = typeof message.from === 'string' ? message.from : null;
                        const textBody = ((message.text as Record<string, unknown> | undefined)?.body as string | undefined) ?? '';
                        if (from && /\bstop\b/i.test(textBody)) {
                                optOutNumbers.add(from);
                        }
                }
                console.info('[whatsapp:webhook] message', {
                        from: message.from,
                        type: message.type,
                });
        }

        await Promise.all([
                insertEvents(supabase, logRecords),
                enqueueRetries(
                        supabase,
                        retryQueue,
                ),
                applyOptOut(supabase, optOutNumbers),
        ]);

        return new Response(JSON.stringify({
                success: true,
                data: {
                        received: true,
                        statuses: logRecords.length,
                        retriesScheduled: retryQueue.length,
                        optOuts: optOutNumbers.size,
                },
                timestamp: new Date().toISOString(),
        }), {
                status: 200,
                headers: {
                        'content-type': 'application/json; charset=utf-8',
                        'cache-control': 'no-store',
                },
        });
}, 10000);
