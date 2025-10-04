## Platform
- Gunakan Plausible self-hosted (mode cookieless) + fallback Google Analytics 4 (hanya bila consent).
- Consent mode: banner cookie mengaktifkan event marketing hanya setelah persetujuan.

## Skema Event (JSON)
```json
{
  "lead_submit": {
    "description": "Pengguna mengirim form lead",
    "properties": {
      "source": "utm_source",
      "package_interest": "string",
      "has_consent": "boolean"
    }
  },
  "cta_whatsapp_click": {
    "description": "Klik CTA WhatsApp",
    "properties": {
      "placement": "hero|floating|footer",
      "pre_filled": "boolean"
    }
  },
  "checkout_start": {
    "description": "Portal memulai proses pembayaran",
    "properties": {
      "invoice_id": "uuid",
      "amount": "number",
      "method": "string"
    }
  },
  "subscription_upgrade": {
    "description": "Klien upgrade paket",
    "properties": {
      "from_package": "string",
      "to_package": "string",
      "addons": "array"
    }
  },
  "ticket_created": {
    "description": "Tiket dukungan baru",
    "properties": {
      "priority": "string",
      "channel": "portal|email"
    }
  }
}
```

## A/B Testing Framework
- Gunakan FlagSmith atau Splitbee untuk eksperimen ringan; fallback manual via Supabase `experiments` table.
- Segmentasi berdasarkan peran & paket aktif.
- Simpan hasil experiment (variant_id, conversion_count) di tabel `experiment_results`.

## Implementasi
- Astro island `AnalyticsProvider` memuat skrip Plausible hanya setelah consent.
- Portal SSR menambahkan header `X-Request-ID` untuk korelasi event & log.
- Event diteruskan ke Supabase Edge Function untuk enrichment (client_id, role).
