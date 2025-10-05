# 16. Keamanan & Kepatuhan

## Checklist Keamanan (12 Poin)
1. Terapkan CSP default-src 'self' + domain terpercaya, blok inline kecuali nonce.
2. Gunakan HTTP Strict-Transport-Security max-age >= 31536000, includeSubDomains, preload.
3. Validasi input server-side (zod schemas) untuk semua API & form.
4. Terapkan rate limiting via Cloudflare Rules (200 req/10m per IP untuk API publik).
5. Gunakan Supabase RLS untuk seluruh akses data multi-tenant.
6. Enkripsi data sensitif at-rest (Supabase pgcrypto untuk kolom rahasia) dan transit (TLS 1.2+).
7. Implementasi CSRF proteksi (SameSite=Lax cookies + token anti-CSRF pada form portal).
8. Sanitasi konten MDX dengan rehype-sanitize; allowlist komponen khusus.
9. Backup harian database + storage ke lokasi terenkripsi, retensi 30 hari.
10. Rotasi key & token setiap 90 hari; simpan di Cloudflare Secrets Manager.
11. Audit log akses admin, impersonasi, dan perubahan harga.
12. Sediakan banner cookie & consent (analytics opsional) sesuai regulasi.

## Contoh Header HTTP (Cloudflare)
```
Content-Security-Policy: default-src 'self'; img-src 'self' data: https://images.ctfassets.net; script-src 'self' 'nonce-{nonce}' https://static.cloudflareinsights.com; connect-src 'self' https://*.supabase.co https://wa.me/{NOMOR_WHATSAPP}; style-src 'self' 'unsafe-inline'; font-src 'self' data:
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=(), microphone=()
```
