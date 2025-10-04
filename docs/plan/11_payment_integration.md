## Arsitektur Integrasi Pembayaran
- Provider abstraksi: `PaymentProvider` interface (Midtrans/Xendit implementasi).
- Mode: sandbox & production; pilih via ENV `PAYMENT_PROVIDER` dan `PAYMENT_ENV`.
- Semua request gunakan idempotency key (`payment_attempt_id`).

```ts
export interface PaymentProvider {
  createOneTimeInvoice(input: InvoicePayload): Promise<ProviderInvoice>;
  createSubscription(input: SubscriptionPayload): Promise<ProviderSubscription>;
  applyCoupon(invoiceId: string, code: string): Promise<void>;
  fetchStatus(reference: string): Promise<PaymentStatus>;
  verifyWebhook(payload: unknown, signature: string): boolean;
}
```

## Flow Satu Kali (One-Time)
1. Portal memanggil `POST /api/payments/checkout` dengan invoice_id.
2. Server memuat invoice dari DB, membuat order di provider, menyimpan `provider_reference`.
3. Response berisi redirect_url + deep link e-wallet.
4. Webhook mengirim status `settlement`/`pending`/`expire` → update tabel payments.

## Flow Langganan
1. Portal kirim paket + metode bayar → `createSubscription`.
2. Provider membuat subscription, kirim `schedule` (monthly/yearly) dan virtual account.
3. Webhook `active`/`inactive` memperbarui `subscriptions.status`.
4. Cron edge function memverifikasi status setiap 6 jam.

## Endpoint & Webhook
- `POST /api/payments/checkout` → body `{invoiceId, method, successUrl, cancelUrl}`.
- `POST /api/payments/subscription` → body `{packageId, addons[], coupon}`.
- `POST /api/payments/webhook` → menerima event provider.
  - Validasi `x-signature` + timestamp, cek idempotency via tabel `payment_events` (pk: event_id).
  - Mapping status:
    - `settlement|paid` → `paid`
    - `pending|waiting_payment` → `pending`
    - `expire|failed` → `failed`
    - `refund` → `refunded`

## Pajak & Kupon
- Terapkan PPN 11% jika `client.is_taxable = true`.
- Kupon tersimpan di tabel `coupons` (admin managed) dengan tipe `percent|amount` + batas waktu.

## Faktur & Rekonsiliasi
- Setelah status `paid`, generate PDF invoice (Edge function) + kirim email.
- Simpan log webhook & signature untuk audit (tabel `payment_events`).

## Sandbox
- Gunakan Midtrans Snap sandbox & Xendit invoice sandbox.
- Env sample: `PAYMENT_SANDBOX_API_KEY`, `PAYMENT_PRODUCTION_API_KEY` (gunakan secret binding, jangan commit).
