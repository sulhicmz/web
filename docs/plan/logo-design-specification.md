# AstroPro Digital - Logo Design Specification

Comprehensive logo design specification untuk brand identity AstroPro Digital sebagai platform manajemen proyek terpercaya.

## 🎯 Logo Design Brief

### Brand Essence
**"Precision. Innovation. Reliability."**
- Precision dalam project management
- Innovation dalam teknologi yang digunakan
- Reliability sebagai partner bisnis yang dapat diandalkan

### Design Philosophy
"Modern geometric logo dengan elemen orbital yang melambangkan precision, movement, dan technological advancement."

## 📐 Logo Architecture

### Primary Logo Structure
```
┌─────────────────────────────────────────────────┐
│  [Icon]  AstroPro Digital                       │
│  ○                                              │
│  ○○    [Modern geometric icon]                  │
│  ○○                                             │
│  ○○○  [Wordmark]                               │
└─────────────────────────────────────────────────┘
```

### Logo Components

#### 1. Icon Design
**Geometric Symbol**: Abstract "A" dengan orbital rings
- **Outer Ring**: Perfect circle melambangkan completeness dan precision
- **Inner Elements**: Geometric shapes yang membentuk stylized "A"
- **Orbital Motion**: Implies movement dan technological advancement

#### 2. Wordmark Design
**Typography**: Modern sans-serif dengan custom modifications
- **"Astro"**: Teknologi dan precision-focused
- **"Pro"**: Professional dan expert-level service
- **"Digital"**: Modern digital transformation focus

#### 3. Combined Logo
**Icon + Wordmark**: Balanced composition dengan proper spacing
- **Icon Size**: 60% dari wordmark height
- **Spacing**: 1.5x icon width antara icon dan wordmark
- **Alignment**: Icon dan wordmark optically aligned

## 🎨 Visual Design Elements

### Color Variations

#### Primary Logo (Full Color)
```css
.logo-primary {
  /* Icon Colors */
  --icon-outer: linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%);
  --icon-inner: #F8FAFC;

  /* Wordmark Colors */
  --wordmark-primary: #7C3AED;
  --wordmark-secondary: #3B82F6;
}
```

#### Secondary Logo (Monochrome)
```css
.logo-secondary {
  /* Single color untuk versatility */
  --logo-color: #7C3AED;
}
```

#### Dark Mode Logo
```css
.logo-dark-mode {
  /* Optimized untuk dark backgrounds */
  --icon-bg: rgba(124, 58, 237, 0.1);
  --icon-border: #7C3AED;
  --wordmark: #F8FAFC;
}
```

### Typography Specifications

#### Wordmark Font
**Primary Font**: Atkinson Hyperlegible (Custom modified)
- **Reason**: Excellent readability dan accessibility
- **Modifications**: Custom kerning untuk "AstroPro Digital"
- **Weight**: Semi-bold (600) untuk professional appearance

#### Alternative Fonts
**Fallback 1**: Inter (Modern, technical feel)
**Fallback 2**: Nunito (Friendly, approachable)
**Fallback 3**: System fonts untuk performance

## 📏 Logo Specifications

### Logo Sizes & Usage

#### Digital Usage
```css
/* Minimum Sizes */
--logo-min-web: 32px;      /* Smallest untuk web */
--logo-min-mobile: 48px;   /* Touch-friendly size */
--logo-min-desktop: 64px;  /* Standard desktop */

/* Standard Sizes */
--logo-sm: 64px;           /* Small UI elements */
--logo-md: 128px;          /* Navigation bars */
--logo-lg: 256px;          /* Hero sections */
--logo-xl: 512px;          /* Presentations */
```

#### Print Usage
```css
/* Print Specifications */
--logo-min-print: 0.75in;   /* Minimum untuk print */
--logo-standard-print: 1.5in; /* Standard business cards */
--logo-large-print: 3in;    /* Large format materials */
```

### Clear Space Requirements
```css
/* Clear space harus minimal 25% dari logo height */
.logo-container {
  padding: calc(var(--logo-height) * 0.25);
}

.logo-container::before {
  /* Invisible boundary untuk clear space */
  content: '';
  position: absolute;
  top: calc(var(--logo-height) * -0.25);
  left: calc(var(--logo-height) * -0.25);
  right: calc(var(--logo-height) * -0.25);
  bottom: calc(var(--logo-height) * -0.25);
}
```

## 🎭 Logo Variations

### 1. Primary Logo
**Full color logo dengan gradient icon**
- **Usage**: Main website, business cards, presentations
- **Background**: Light backgrounds
- **File**: `logo-primary.svg`, `logo-primary.png`

### 2. Secondary Logo
**Monochrome version untuk flexibility**
- **Usage**: Footer, single-color printing, merchandise
- **Background**: Any background color
- **File**: `logo-secondary.svg`, `logo-secondary.png`

### 3. Icon Only
**Icon without wordmark untuk app icons**
- **Usage**: Favicon, app icons, social media avatars
- **Sizes**: 16x16, 32x32, 64x64, 256x256, 512x512
- **File**: `logo-icon.svg`, `logo-icon.png`

### 4. Wordmark Only
**Text-only version untuk readability**
- **Usage**: Legal documents, certificates, letterheads
- **Background**: Any background
- **File**: `logo-wordmark.svg`, `logo-wordmark.png`

## 📱 Application Icons

### Favicon Set
```css
/* Multiple sizes untuk different devices */
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
```

### App Icons (PWA)
```css
/* Progressive Web App icons */
{
  "icons": [
    { "src": "/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-256x256.png", "sizes": "256x256", "type": "image/png" },
    { "src": "/icon-384x384.png", "sizes": "384x384", "type": "image/png" },
    { "src": "/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

## 🎨 Brand Applications

### Color Usage Guidelines

#### Primary Palette Usage
- **Purple (#7C3AED)**: Main brand color untuk CTA buttons, links, icons
- **Blue (#3B82F6)**: Secondary color untuk accents, highlights, gradients
- **Coral (#F87171)**: Accent color untuk notifications, alerts, special offers

#### Background Colors
- **Dark Surface**: #0F172A (Primary background)
- **Elevated Surface**: #1E293B (Cards, modals, elevated elements)
- **Light Accent**: rgba(124, 58, 237, 0.05) (Hover states, selections)

### Typography Hierarchy

#### Heading Scale
```css
h1 {
  font-size: clamp(2rem, 3vw, 3rem);
  font-weight: 700;
  line-height: 1.2;
  color: var(--color-text-primary);
}

h2 {
  font-size: clamp(1.75rem, 2.5vw, 2.25rem);
  font-weight: 600;
  line-height: 1.3;
  color: var(--color-text-primary);
}

h3 {
  font-size: clamp(1.5rem, 2vw, 1.875rem);
  font-weight: 600;
  line-height: 1.4;
  color: var(--color-text-primary);
}
```

#### Body Text Scale
```css
.body-large {
  font-size: clamp(1.125rem, 1.2vw, 1.25rem);
  line-height: 1.6;
  color: var(--color-text-primary);
}

.body-regular {
  font-size: clamp(1rem, 1vw, 1.125rem);
  line-height: 1.6;
  color: var(--color-text-primary);
}

.body-small {
  font-size: clamp(0.875rem, 0.9vw, 1rem);
  line-height: 1.5;
  color: var(--color-text-secondary);
}
```

## 🚫 Logo Misuse Guidelines

### Prohibited Uses
- ❌ **Don't stretch or distort** the logo proportions
- ❌ **Don't change colors** outside approved palette
- ❌ **Don't add effects** like shadows, glows, atau outlines
- ❌ **Don't rotate** lebih dari 90 degrees
- ❌ **Don't use on busy backgrounds** tanpa proper contrast
- ❌ **Don't modify typography** atau icon shapes

### Correct Usage Examples
```css
/* ✅ Correct usage */
.logo-container {
  background: white;
  padding: 20px;
}

.logo {
  height: 64px;
  width: auto;
}

/* ✅ Correct color usage */
.logo-purple { color: #7C3AED; }
.logo-blue { color: #3B82F6; }
.logo-white { color: white; }
```

## 📁 Logo File Organization

### File Structure
```
src/assets/
├── logo/
│   ├── primary/
│   │   ├── logo-primary.svg
│   │   ├── logo-primary.png
│   │   └── logo-primary.pdf
│   ├── secondary/
│   │   ├── logo-secondary.svg
│   │   ├── logo-secondary.png
│   │   └── logo-secondary.pdf
│   ├── icon/
│   │   ├── logo-icon.svg
│   │   ├── favicon.svg
│   │   ├── apple-touch-icon.png
│   │   └── [size-variants]
│   └── wordmark/
│       ├── logo-wordmark.svg
│       ├── logo-wordmark.png
│       └── logo-wordmark.pdf
├── brand/
│   ├── colors/
│   ├── typography/
│   └── guidelines/
└── icons/
    ├── ui-icons.svg
    └── brand-icons.svg
```

### File Naming Convention
- **Primary**: `logo-primary.[format]`
- **Secondary**: `logo-secondary.[format]`
- **Icon Only**: `logo-icon.[format]`
- **Wordmark**: `logo-wordmark.[format]`
- **Sizes**: `logo-primary-128x128.png`

## 🎯 Implementation Guidelines

### Web Implementation
```html
<!-- Primary Logo -->
<img src="/logo/primary/logo-primary.svg"
     alt="AstroPro Digital"
     class="logo logo-primary"
     width="256"
     height="64" />

<!-- Icon Only -->
<img src="/logo/icon/logo-icon.svg"
     alt="AstroPro Digital"
     class="logo logo-icon"
     width="64"
     height="64" />
```

### CSS Implementation
```css
.logo {
  height: auto;
  max-width: 100%;
  display: block;
}

.logo-primary {
  /* Full color logo styling */
}

.logo-secondary {
  /* Monochrome logo styling */
}

.logo-icon {
  /* Icon only styling */
}
```

### Responsive Implementation
```css
@media (max-width: 768px) {
  .logo {
    height: 48px;
  }
}

@media (max-width: 480px) {
  .logo {
    height: 40px;
  }
}
```

## 📊 Logo Testing Checklist

### Visual Testing
- [ ] Logo terlihat jelas pada semua background colors
- [ ] Logo tetap readable pada minimum size (32px)
- [ ] Colors match brand palette exactly
- [ ] Proportions tetap konsisten di semua sizes

### Technical Testing
- [ ] SVG files optimized dan clean
- [ ] PNG files compressed dengan proper transparency
- [ ] All sizes rendered correctly
- [ ] Responsive behavior works pada all breakpoints

### Accessibility Testing
- [ ] Logo memiliki alt text yang descriptive
- [ ] Colors meet WCAG contrast requirements
- [ ] Logo works dengan high contrast mode
- [ ] Logo visible dengan reduced motion preferences

## 🚀 Brand Assets Delivery

### Logo Package Contents
1. **Vector Files**: SVG, PDF untuk scalability
2. **Raster Files**: PNG dengan transparency untuk web
3. **Icon Set**: Multiple sizes untuk different use cases
4. **Usage Guidelines**: Documentation untuk proper usage
5. **Color Palette**: Digital swatches untuk design tools

### File Formats
- **SVG**: Scalable vector untuk web dan digital
- **PNG**: Raster dengan transparency untuk web
- **PDF**: Vector untuk print production
- **JPG**: High-quality untuk presentations

## 📈 Brand Evolution

### Version Control
**Current Version**: Logo v1.0.0
**Design Philosophy**: Modern geometric dengan orbital elements
**Last Updated**: 2025-01-07

### Future Considerations
- **Scalability**: Logo harus work pada sizes dari 16px sampai billboard
- **Adaptability**: Logo harus work di berbagai media dan contexts
- **Timelessness**: Design harus relevant untuk 5+ years
- **Distinctiveness**: Logo harus unique dan memorable

---

*Logo Design Specification v1.0.0*
*Last updated: 2025-01-07*