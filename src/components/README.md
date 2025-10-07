# AstroPro Digital - Component Documentation

Dokumentasi lengkap untuk sistem komponen UI AstroPro Digital yang menggunakan design tokens untuk konsistensi visual.

## 📋 Daftar Komponen

### 🎨 UI Components

| Komponen | Deskripsi | Status |
|----------|-----------|---------|
| **Button** | Tombol dengan berbagai variant dan ukuran | ✅ Updated |
| **Card** | Kontainer konten dengan design modern | ✅ Updated |
| **FormInput** | Input field dengan validasi dan styling | ✅ Updated |
| **FormSelect** | Dropdown select dengan styling konsisten | 🔄 Need Check |
| **Modal** | Modal dialog dengan berbagai ukuran | ✅ Updated |
| **Toast** | Notifikasi toast dengan auto-dismiss | ✅ Updated |
| **BaseHead** | Head component untuk SEO | 🔄 Need Check |
| **FormattedDate** | Komponen untuk format tanggal | 🔄 Need Check |
| **MdxButton** | Tombol khusus untuk konten MDX | 🔄 Need Check |
| **PricingTable** | Tabel harga dengan design modern | 🔄 Need Check |
| **ProjectCard** | Kartu proyek untuk portfolio | 🔄 Need Check |
| **StatsCard** | Kartu statistik dengan animasi | 🔄 Need Check |

### 🏢 Portal Components

| Komponen | Deskripsi | Status |
|----------|-----------|---------|
| **PortalHeader** | Header untuk portal klien | 🔄 Need Check |
| **PortalNav** | Navigasi portal | 🔄 Need Check |
| **ProjectCard** | Kartu proyek dalam portal | 🔄 Need Check |
| **NotificationCenter** | Pusat notifikasi | 🔄 Need Check |

### 🎯 Marketing Components

| Komponen | Deskripsi | Status |
|----------|-----------|---------|
| **HeroSection** | Section hero untuk landing page | 🔄 Need Check |
| **FeatureCard** | Kartu fitur dengan ikon | 🔄 Need Check |
| **TestimonialCard** | Kartu testimonial klien | 🔄 Need Check |
| **MarketingHeader** | Header marketing site | 🔄 Need Check |
| **MarketingFooter** | Footer marketing site | 🔄 Need Check |
| **NavLink** | Link navigasi dengan hover effects | 🔄 Need Check |

## 🎨 Design Tokens

Sistem menggunakan design tokens komprehensif yang didefinisikan dalam `src/styles/design-tokens.css`:

### Warna
```css
/* Primary Colors */
--color-primary: #7C3AED;
--color-secondary: #3B82F6;
--color-accent: #F87171;

/* Semantic Colors */
--color-success: #10B981;
--color-warning: #F59E0B;
--color-error: #EF4444;
--color-info: #3B82F6;

/* Surface Colors */
--color-surface: #0F172A;
--color-surface-elevated: #1E293B;
--color-surface-card: rgba(30, 41, 59, 0.8);
```

### Typography
```css
/* Font Sizes (Fluid) */
--text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
--text-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
--text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);

/* Font Weights */
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing
```css
/* 8px Grid System */
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
```

### Border Radius
```css
--radius-sm: 0.5rem;    /* 8px */
--radius-md: 0.75rem;   /* 12px */
--radius-lg: 1rem;      /* 16px */
--radius-xl: 1.5rem;    /* 24px */
--radius-full: 9999px;  /* Full rounded */
```

### Shadows
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

## 📖 Penggunaan Komponen

### Button Component

```astro
---
import { Button } from '../components/ui/Button';
---

<Button variant="primary" size="md">
  Klik Saya
</Button>

<Button variant="secondary" size="lg" fullWidth>
  Tombol Lebar Penuh
</Button>

<Button variant="ghost" size="sm" href="/kontak">
  Link Button
</Button>
```

**Props:**
- `variant`: `'primary' | 'secondary' | 'ghost'` (default: 'primary')
- `size`: `'sm' | 'md' | 'lg'` (default: 'md')
- `fullWidth`: `boolean` (default: false)
- `loading`: `boolean` (default: false)
- `disabled`: `boolean` (default: false)
- `href`: `string` (untuk link button)

### Card Component

```astro
---
import { Card } from '../components/ui/Card';
---

<Card title="Judul Kartu" eyebrow="Kategori" description="Deskripsi kartu">
  <p>Konten utama kartu di sini...</p>
</Card>
```

**Props:**
- `as`: `'article' | 'section' | 'div'` (default: 'article')
- `title`: `string` (opsional)
- `eyebrow`: `string` (opsional)
- `description`: `string` (opsional)

### FormInput Component

```astro
---
import { FormInput } from '../components/ui/FormInput';
---

<FormInput
  label="Nama Lengkap"
  name="fullName"
  type="text"
  required
  placeholder="Masukkan nama lengkap Anda"
/>

<FormInput
  label="Email"
  name="email"
  type="email"
  icon="email"
  description="Kami tidak akan membagikan email Anda"
/>

<FormInput
  label="Password"
  name="password"
  type="password"
  icon="password"
  error="Password minimal 8 karakter"
/>
```

**Props:**
- `label`: `string` (opsional)
- `description`: `string` (opsional)
- `error`: `string` (opsional)
- `success`: `boolean` (default: false)
- `icon`: `string` (opsional)
- `variant`: `'default' | 'floating' | 'underline'` (default: 'default')
- `size`: `'sm' | 'md' | 'lg'` (default: 'md')
- `fullWidth`: `boolean` (default: true)

### Modal Component

```astro
---
import { Modal } from '../components/ui/Modal';
---

<Modal
  isOpen={isModalOpen}
  title="Konfirmasi Hapus"
  description="Apakah Anda yakin ingin menghapus item ini?"
  size="md"
  closeOnBackdrop={true}
>
  <p>Item yang dihapus tidak dapat dikembalikan.</p>

  <div slot="footer">
    <Button variant="ghost" onclick={() => isModalOpen = false}>
      Batal
    </Button>
    <Button variant="primary">
      Hapus
    </Button>
  </div>
</Modal>
```

**Props:**
- `isOpen`: `boolean` (wajib)
- `title`: `string` (opsional)
- `description`: `string` (opsional)
- `size`: `'sm' | 'md' | 'lg' | 'xl' | 'fullscreen'` (default: 'md')
- `variant`: `'default' | 'sidebar' | 'drawer'` (default: 'default')
- `position`: `'center' | 'top' | 'bottom' | 'left' | 'right'` (default: 'center')
- `closeOnBackdrop`: `boolean` (default: true)
- `closeOnEscape`: `boolean` (default: true)
- `showCloseButton`: `boolean` (default: true)

### Toast Component

```astro
---
import { Toast } from '../components/ui/Toast';
---

<Toast
  type="success"
  title="Berhasil!"
  message="Data telah berhasil disimpan"
  duration={3000}
  position="top-right"
/>
```

**Props:**
- `type`: `'success' | 'error' | 'warning' | 'info'` (default: 'info')
- `title`: `string` (opsional)
- `message`: `string` (wajib)
- `duration`: `number` (default: 5000ms)
- `showCloseButton`: `boolean` (default: true)
- `position`: `'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center'` (default: 'top-right')
- `isVisible`: `boolean` (default: true)

## 🎯 Best Practices

### 1. Konsistensi Design
- Selalu gunakan design tokens yang telah didefinisikan
- Jangan tambahkan warna atau spacing baru tanpa alasan kuat
- Ikuti sistem 8px grid untuk spacing

### 2. Accessibility
- Sertakan `aria-label` untuk elemen interaktif
- Gunakan semantic HTML yang tepat
- Pastikan kontras warna memenuhi WCAG AA
- Tambahkan `prefers-reduced-motion` support

### 3. Responsive Design
- Gunakan fluid typography dengan `clamp()`
- Test pada breakpoint utama: 640px, 768px, 1024px, 1280px
- Pertimbangkan touch targets (minimal 44px)

### 4. Performance
- Gunakan CSS custom properties untuk theme switching
- Minimize repaints dengan transisi yang efisien
- Pertimbangkan bundle size untuk komponen besar

## 🔧 Pengembangan Komponen

### Menambah Komponen Baru

1. **Buat file komponen** di `src/components/ui/`
2. **Gunakan design tokens** untuk semua styling
3. **Tambahkan TypeScript interface** untuk props
4. **Sertakan accessibility attributes**
5. **Tambahkan responsive behavior**
6. **Update dokumentasi** ini

### Contoh Struktur Komponen

```astro
---
// 1. Import design system types jika diperlukan
import type { AstroHTML } from 'astro/types';

// 2. Define props interface
interface ComponentProps extends AstroHTML.JSX.HTMLAttributes<'div'> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

// 3. Extract props dengan defaults
const { variant = 'primary', size = 'md', class: customClass = '', ...rest } = Astro.props;

// 4. Generate CSS classes
const classes = ['component', `component--${variant}`, `component--${size}`, customClass].filter(Boolean).join(' ');
---

<!-- 5. HTML Structure dengan semantic markup -->
<div class={classes} {...rest}>
  <slot />
</div>

<!-- 6. Scoped styles menggunakan design tokens -->
<style>
  .component {
    padding: var(--space-4);
    background: var(--color-surface-elevated);
    border-radius: var(--radius-lg);
    color: var(--color-text-primary);
  }

  .component--primary {
    background: var(--gradient-primary);
    color: white;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .component {
      padding: var(--space-3);
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .component {
      transition: none;
    }
  }
</style>
```

## 🚨 Troubleshooting

### Masalah Umum

**1. Design tokens tidak berfungsi**
```css
/* ❌ Salah */
.my-component {
  color: #7C3AED; /* Hardcoded color */
}

/* ✅ Benar */
.my-component {
  color: var(--color-primary);
}
```

**2. Spacing tidak konsisten**
```css
/* ❌ Salah */
.gap-10px { gap: 10px; }
.margin-15 { margin: 15px; }

/* ✅ Benar */
.gap-custom { gap: var(--space-4); }
.margin-custom { margin: var(--space-3); }
```

**3. Typography tidak responsive**
```css
/* ❌ Salah */
.title { font-size: 18px; }

/* ✅ Benar */
.title { font-size: var(--text-lg); }
```

## 📚 Resources

- [Design Tokens Reference](../styles/design-tokens.css)
- [Astro Component API](https://docs.astro.build/en/reference/api-reference/)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)

---

*Last updated: 2025-10-07*
*Design System Version: 1.0.0*