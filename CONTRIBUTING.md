# Panduan Kontribusi

Terima kasih ingin berkontribusi ke **AstroPro Digital**! Dokumen ini menjelaskan alur kerja dan standar kolaborasi agar repositori tetap rapi dan efisien.

## 1. Alur Kolaborasi
1. **Diskusikan dulu** — buka issue menggunakan template yang tersedia (`Bug`, `Feature`, atau `Task`). Sertakan referensi `docs/plan/` bila relevan.
2. **Fork / branch** — gunakan branch konvensi `feat/`, `fix/`, `chore/`. Contoh: `feat/portal-auth-guard`.
3. **Kerjakan & uji** — jalankan `npm run build` (butuh Node 20+) sebelum mengirim PR. Dokumentasikan keterbatasan jika build belum bisa jalan karena lingkungan.
4. **Ajukan PR** — gunakan template PR, lengkapi checklist, dan tautkan issue terkait (`Closes #123`).
5. **Review & merge** — minimal satu review sebelum merge ke `main`. Gunakan `squash` atau `rebase` sesuai konteks.

## 2. Standar Commit & Branch
- Commit message mengikuti pola konvensional: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`.
- Branch `main` = produksi. Gunakan branch fitur dan buat PR agar pipeline CI berjalan.

## 3. Testing & Kualitas
- `npm run build` menjadi gate utama (Astro + TypeScript). Tambahkan tes tambahan bila area membutuhkan.
- Front-end perubahan UI perlu dicek secara manual di viewport desktop & mobile.

## 4. Dokumentasi
- Update `README.md`, `howto.md`, atau bagian `docs/` bila perubahan memengaruhi setup/deployment.
- Issue/PR harus merujuk pada rencana di `docs/plan/` agar konteks terjaga.

## 5. Label & Triage
- `bug`, `enhancement`, `chore` — otomatis terpasang lewat template.
- Tambahan label yang disarankan: `area:marketing`, `area:portal`, `area:payments`, `area:docs`, `priority:high`.
- Gunakan `good first issue` untuk tugas sederhana.

## 6. CI/CD
- Workflow `ci.yml` akan menjalankan `npm ci` dan `npm run build` pada Node 20. Pastikan PR hijau sebelum merge.

## 7. Pertanyaan
Jika ada kendala, gunakan diskusi di issue terkait atau hubungi maintainer melalui komentar PR.

Selamat berkontribusi! 🎉
