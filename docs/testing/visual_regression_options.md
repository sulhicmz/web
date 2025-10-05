# Visual Regression Testing Options

Tujuan: melindungi komponen UI inti (`src/components/ui/*`, `src/layouts/*`) dari perubahan styling tak terduga saat iterasi fitur portal dan marketing site.

## 1. Playwright + Visual Comparisons (Self-Hosted)
- **Implementasi**: gunakan `@playwright/test` dengan `page.goto` untuk halaman Astro build (`npm run build && npx astro preview`), ambil screenshot, bandingkan dengan baseline.
- **Kelebihan**: kontrol penuh atas lingkungan; dapat digabung dengan e2e behavior; open-source.
- **Kekurangan**: perlu orkestrasi penyimpanan snapshot; baseline harus disinkronkan via git (besar) atau storage eksternal.
- **Langkah awal**:
  1. `npm install -D @playwright/test`.
  2. Tambah script `"test:ui": "playwright test"` di `package.json`.
  3. Buat test untuk halaman kritikal (Landing, Portal Dashboard, PricingTable story) dengan `expect(page).toHaveScreenshot()`.

## 2. Chromatic (Storybook Cloud)
- **Implementasi**: pasangkan Storybook untuk komponen (`@storybook/astro`), sinkronisasi ke Chromatic.
- **Kelebihan**: deteksi diff otomatis, UI review kolaboratif, integrasi PR.
- **Kekurangan**: layanan berbayar (ada tier gratis terbatas); perlu menyiapkan Storybook terlebih dahulu.
- **Catatan**: cocok bila tim ingin review visual asinkron antar desainer/dev.

## 3. Percy by BrowserStack
- **Implementasi**: jalankan snapshot via CLI terhadap URL build atau Storybook.
- **Kelebihan**: integrasi CI sederhana, laporan diff rapi, dukungan integrasi GitHub.
- **Kekurangan**: layanan SaaS, ada batasan saat trial; perlu variabel env API token.

## Rekomendasi
Mulai dengan **Playwright visual testing** sebagai baseline karena:
- Dependencies minimal tambahan; tidak menambah langkah SaaS.
- Dapat dijalankan di CI Cloudflare/Workers build pipeline sebelum deploy.
- Bisa dikombinasikan dengan test interaktif (klik toggles PricingTable, dsb).

Setelah baseline stabil dan tim membutuhkan review desain kolaboratif, pertimbangkan menambahkan Storybook + Chromatic.

## Next Steps (Disarankan)
1. Tambahkan Playwright ke devDependencies, generate config default (`npx playwright install --with-deps`).
2. Buat folder `tests/visual/` dan tambahkan skenario untuk:
   - `src/pages/index.astro` (marketing hero, PricingTable)
   - `src/pages/portal/dashboard.astro` (state autentikasi mock Supabase)
   - Komponen `Button` dan `Card` melalui halaman demo sederhana.
3. Konfigurasikan toleransi diff (mis. `maxDiffPixelRatio: 0.01`).
4. Integrasikan perintah `npm run build && PLAYWRIGHT_TEST_BASE_URL=http://localhost:4321 astro preview` sebelum test.
