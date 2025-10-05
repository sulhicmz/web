# 20. Testing & QA

## Matriks Pengujian
- Unit Tests (Vitest, ≥10):
  1. Pricing calculator discount logic.
  2. Supabase role guard util.
  3. Payment status mapper.
  4. Pagefind indexing helper.
  5. WhatsApp link generator (encoding).
  6. SLA timer formatter.
  7. Feature flag evaluator.
  8. Form validation schema (lead form).
  9. Invoice tax calculation.
 10. Activity event serializer.
- E2E Tests (Playwright, ≥6):
  1. Marketing funnel (Home → Layanan → Form submit mock).
  2. Blog article navigation + TOC anchor.
  3. Portal login + dashboard data load (mock Supabase).
  4. Invoice checkout flow (sandbox provider stub).
  5. Ticket creation & comment flow.
  6. Account security (enable 2FA, revoke session).
- Aksesibilitas: axe-core pada halaman marketing & portal utama.
- Regresi visual: Percy/Chromatic untuk komponen marketing dan portal dashboard.

## Skenario Gherkin
```
Scenario: Lead form submission with consent
  Given a visitor on the Home page
  And the cookie consent is accepted
  When they submit the lead form with valid data
  Then a success message is shown
  And a lead event is recorded

Scenario: Portal denies access without session
  Given a user navigates to /portal/dashboard
  When no Supabase session cookie is present
  Then they are redirected to /login

Scenario: Client views invoice list
  Given a client with outstanding invoices
  When they open the Invoices page
  Then invoices are listed with status badges
  And the Pay button is enabled for unpaid invoices

Scenario: Staff escalates a high priority ticket
  Given a staff user views a ticket with priority high
  When they change the status to in_progress
  Then the SLA timer resets
  And a notification is sent to the client

Scenario: Pricing toggle updates totals
  Given the pricing table is visible
  When the user selects annual billing
  Then package prices display the annual rate
  And savings badge appears

Scenario: Blog search returns relevant article
  Given Pagefind index is loaded
  When a user searches for "Supabase"
  Then articles tagged with Supabase appear in results
  And each result link is keyboard focusable
```

## Kriteria Penerimaan
- Semua tes unit & e2e lulus di CI.
- Tidak ada regression visual > 1% diff tanpa approval.
- axe-core melaporkan nol pelanggaran kritikal.
- Manual QA checklist terselesaikan sebelum rilis produksi.
