// ==========================================================================
// AstroPro Digital - Application Constants
// Konstanta aplikasi yang digunakan di seluruh aplikasi
// ==========================================================================

// Site Information
export const SITE = {
  title: 'AstroPro Digital',
  description: 'Platform manajemen proyek dan konsultasi digital terpercaya untuk bisnis Anda.',
  defaultTitle: 'AstroPro Digital - Platform Manajemen Proyek',
  titleTemplate: '%s | AstroPro Digital',
  defaultDescription: 'Kelola proyek, tim, dan klien Anda dengan mudah menggunakan platform kami yang modern dan terpercaya.',
  siteUrl: 'https://astropro.digital',
  defaultImage: '/og-image.png',
  twitterHandle: '@astroprodigital',
  email: 'hello@astropro.digital',
  phone: '+62-21-xxx-xxxx',
  address: 'Jakarta, Indonesia',
} as const;

// Navigation
export const NAVIGATION = {
  main: [
    { label: 'Beranda', href: '/' },
    { label: 'Layanan', href: '/layanan' },
    { label: 'Portofolio', href: '/portofolio' },
    { label: 'Blog', href: '/blog' },
    { label: 'Tentang', href: '/about' },
    { label: 'Kontak', href: '/kontak' },
  ],
  portal: [
    { label: 'Dashboard', href: '/portal/dashboard', icon: 'dashboard' },
    { label: 'Proyek', href: '/portal/projects', icon: 'projects' },
    { label: 'Tagihan', href: '/portal/billing', icon: 'billing' },
    { label: 'Dukungan', href: '/portal/support', icon: 'support' },
    { label: 'Akun', href: '/portal/account', icon: 'account' },
  ],
  footer: [
    { label: 'Beranda', href: '/' },
    { label: 'Layanan', href: '/layanan' },
    { label: 'Portofolio', href: '/portofolio' },
    { label: 'Blog', href: '/blog' },
    { label: 'Tentang Kami', href: '/about' },
    { label: 'Kontak', href: '/kontak' },
    { label: 'FAQ', href: '/faq' },
  ],
} as const;

// Social Media Links
export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/astroprodigital',
  linkedin: 'https://linkedin.com/company/astropro-digital',
  instagram: 'https://instagram.com/astroprodigital',
  facebook: 'https://facebook.com/astroprodigital',
  youtube: 'https://youtube.com/@astroprodigital',
  github: 'https://github.com/astropro-digital',
} as const;

// Service Categories
export const SERVICE_CATEGORIES = {
  WEB_DEVELOPMENT: 'web-development',
  MOBILE_DEVELOPMENT: 'mobile-development',
  UI_UX_DESIGN: 'ui-ux-design',
  DIGITAL_MARKETING: 'digital-marketing',
  CONSULTING: 'consulting',
  MAINTENANCE: 'maintenance',
} as const;

// Project Status
export const PROJECT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ON_HOLD: 'on_hold',
  CANCELLED: 'cancelled',
} as const;

// Priority Levels
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  CLIENT: 'client',
  TEAM_MEMBER: 'team_member',
  MANAGER: 'manager',
} as const;

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
} as const;

// Support Ticket Status
export const TICKET_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  WAITING_FOR_RESPONSE: 'waiting_for_response',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
} as const;

// Payment Methods
export const PAYMENT_METHODS = {
  BANK_TRANSFER: 'bank_transfer',
  CREDIT_CARD: 'credit_card',
  E_WALLET: 'e_wallet',
  VIRTUAL_ACCOUNT: 'virtual_account',
} as const;

// Currencies
export const CURRENCIES = {
  IDR: 'IDR',
  USD: 'USD',
  EUR: 'EUR',
} as const;

// File Categories
export const FILE_CATEGORIES = {
  PROJECT: 'project',
  INVOICE: 'invoice',
  CONTRACT: 'contract',
  REPORT: 'report',
  OTHER: 'other',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

// Activity Types
export const ACTIVITY_TYPES = {
  PROJECT_CREATED: 'project_created',
  PROJECT_UPDATED: 'project_updated',
  PROJECT_COMPLETED: 'project_completed',
  PAYMENT_RECEIVED: 'payment_received',
  TICKET_CREATED: 'ticket_created',
  TICKET_RESOLVED: 'ticket_resolved',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
} as const;

// Time Intervals (in milliseconds)
export const TIME_INTERVALS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
} as const;

// Pagination Defaults
export const PAGINATION_DEFAULTS = {
  PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

// Form Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  EMAIL_MAX_LENGTH: 254,
  NAME_MAX_LENGTH: 100,
  PHONE_REGEX: /^(\+62|62|0)8[1-9][0-9]{6,11}$/,
  POSTAL_CODE_REGEX: /^[0-9]{5}$/,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    ME: '/api/auth/me',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  PROJECTS: {
    LIST: '/api/projects',
    CREATE: '/api/projects',
    GET: '/api/projects/[id]',
    UPDATE: '/api/projects/[id]',
    DELETE: '/api/projects/[id]',
  },
  PAYMENTS: {
    LIST: '/api/payments',
    CREATE: '/api/payments',
    GET: '/api/payments/[id]',
    WEBHOOK: '/api/payments/webhook',
  },
  SUPPORT: {
    TICKETS: '/api/support/tickets',
    CREATE_TICKET: '/api/support/tickets',
    GET_TICKET: '/api/support/tickets/[id]',
    UPDATE_TICKET: '/api/support/tickets/[id]',
  },
  WHATSAPP: {
    WEBHOOK: '/api/whatsapp/webhook',
  },
} as const;

// Regular Expressions
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^(\+62|62|0)8[1-9][0-9]{6,11}$/,
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
} as const;

// Color Palette
export const COLORS = {
  PRIMARY: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  ACCENT: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  SUCCESS: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  WARNING: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  ERROR: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
} as const;

// Breakpoints (for responsive design)
export const BREAKPOINTS = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Z-Index Scale
export const Z_INDEX = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// Animation Durations
export const ANIMATION_DURATION = {
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
  slower: '500ms',
} as const;

// Border Radius
export const BORDER_RADIUS = {
  none: '0',
  sm: '0.125rem',
  base: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
} as const;

// Shadows
export const SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: '0 0 #0000',
} as const;

// Typography Scale
export const TYPOGRAPHY = {
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
  },
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
} as const;

// Spacing Scale
export const SPACING = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
} as const;

// Export everything as a single object for convenience
export const CONSTS = {
  SITE,
  NAVIGATION,
  SOCIAL_LINKS,
  SERVICE_CATEGORIES,
  PROJECT_STATUS,
  PRIORITY_LEVELS,
  USER_ROLES,
  PAYMENT_STATUS,
  TICKET_STATUS,
  PAYMENT_METHODS,
  CURRENCIES,
  FILE_CATEGORIES,
  NOTIFICATION_TYPES,
  ACTIVITY_TYPES,
  TIME_INTERVALS,
  PAGINATION_DEFAULTS,
  VALIDATION_RULES,
  API_ENDPOINTS,
  REGEX_PATTERNS,
  COLORS,
  BREAKPOINTS,
  Z_INDEX,
  ANIMATION_DURATION,
  BORDER_RADIUS,
  SHADOWS,
  TYPOGRAPHY,
  SPACING,
} as const;