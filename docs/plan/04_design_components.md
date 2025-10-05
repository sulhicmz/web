# 04. Komponen UI Inti

## Card
- Variasi: default, elevated, outline
- WCAG: Pastikan kontras teks ≥ 4.5:1 dan fokus keyboard pada link internal.

## Button
- Variasi: primary, secondary, ghost, icon-only
- State: default, hover, focus-visible, loading, disabled
- Gunakan ukuran minimum 44x44px untuk target sentuh.

## PricingTable
- Struktur kolom responsive; gunakan aria-describedby untuk highlight paket unggulan.

## Testimonial
- Format slider berbasis tombol dengan aria-live="polite"; sediakan transkrip teks statis.

## Badge
- Variasi status (success, warning, danger, info); gunakan `role="status"` bila dinamis.

## DataTable
- Header sticky, sortabel, dukung pagination dan export; gunakan `<caption>` deskriptif.

## Form
- Validasi inline dengan pesan yang dikaitkan ke `aria-describedby`; pastikan urutan tab logis.

## Tabs
- Implementasi roving tabindex; gunakan `aria-controls` dan `aria-selected` yang benar.

## Layout Utilities
- Grid responsif 12 kolom, breakpoints: 640/768/1024/1280.
- Container max-width: 1200px dengan padding horizontal spacing.lg.
