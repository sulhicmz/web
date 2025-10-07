// ==========================================================================
// AstroPro Digital - Application Configuration
// Konfigurasi aplikasi terpusat untuk environment variables dan constants
// ==========================================================================

// Supabase Configuration
export const SUPABASE_CONFIG = {
  url: import.meta.env.PUBLIC_SUPABASE_URL,
  anonKey: import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
  serviceRoleKey: import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
};

// Payment Configuration (Midtrans)
export const MIDTRANS_CONFIG = {
  clientKey: import.meta.env.PUBLIC_MIDTRANS_CLIENT_KEY,
  serverKey: import.meta.env.MIDTRANS_SERVER_KEY,
  isProduction: import.meta.env.PUBLIC_MIDTRANS_IS_PRODUCTION === 'true',
};

// WhatsApp Configuration
export const WHATSAPP_CONFIG = {
  token: import.meta.env.WHATSAPP_TOKEN,
  phoneNumberId: import.meta.env.WHATSAPP_PHONE_NUMBER_ID,
  businessAccountId: import.meta.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
  webhookVerifyToken: import.meta.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
};

// Application Configuration
export const APP_CONFIG = {
  name: 'AstroPro Digital',
  description: 'Platform manajemen proyek dan konsultasi digital',
  url: import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321',
  environment: import.meta.env.MODE || 'development',
  enableAnalytics: import.meta.env.PUBLIC_ENABLE_ANALYTICS === 'true',
  enablePayments: import.meta.env.PUBLIC_ENABLE_PAYMENTS === 'true',
  enableWhatsApp: import.meta.env.PUBLIC_ENABLE_WHATSAPP === 'true',
};

// Error Messages
export const ERROR_MESSAGES = {
  // Authentication Errors
  AUTH_INVALID_CREDENTIALS: 'Email atau password tidak valid',
  AUTH_USER_NOT_FOUND: 'Pengguna tidak ditemukan',
  AUTH_EMAIL_NOT_CONFIRMED: 'Email belum dikonfirmasi',
  AUTH_SESSION_EXPIRED: 'Sesi telah berakhir, silakan login kembali',
  AUTH_UNAUTHORIZED: 'Anda tidak memiliki akses untuk melakukan tindakan ini',

  // Validation Errors
  VALIDATION_REQUIRED: 'Field ini wajib diisi',
  VALIDATION_INVALID_EMAIL: 'Format email tidak valid',
  VALIDATION_INVALID_PHONE: 'Format nomor telepon tidak valid',
  VALIDATION_PASSWORD_TOO_WEAK: 'Password terlalu lemah',
  VALIDATION_PASSWORDS_NOT_MATCH: 'Password tidak cocok',

  // Payment Errors
  PAYMENT_FAILED: 'Pembayaran gagal, silakan coba lagi',
  PAYMENT_INVALID_AMOUNT: 'Jumlah pembayaran tidak valid',
  PAYMENT_METHOD_NOT_SUPPORTED: 'Metode pembayaran tidak didukung',

  // General Errors
  INTERNAL_ERROR: 'Terjadi kesalahan internal',
  NETWORK_ERROR: 'Kesalahan koneksi jaringan',
  NOT_FOUND: 'Data tidak ditemukan',
  RATE_LIMIT_EXCEEDED: 'Terlalu banyak permintaan, silakan coba lagi nanti',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  AUTH_LOGIN_SUCCESS: 'Login berhasil',
  AUTH_LOGOUT_SUCCESS: 'Logout berhasil',
  AUTH_REGISTER_SUCCESS: 'Registrasi berhasil, silakan periksa email Anda',
  AUTH_PASSWORD_RESET_SENT: 'Email reset password telah dikirim',

  PAYMENT_SUCCESS: 'Pembayaran berhasil',
  PROFILE_UPDATE_SUCCESS: 'Profil berhasil diperbarui',
  PROJECT_CREATE_SUCCESS: 'Proyek berhasil dibuat',
  TICKET_CREATE_SUCCESS: 'Tiket dukungan berhasil dibuat',
};

// Route Configuration
export const ROUTE_CONFIG = {
  HOME: '/',
  LOGIN: '/login',
  PORTAL: '/portal',
  PORTAL_DASHBOARD: '/portal/dashboard',
  PORTAL_PROJECTS: '/portal/projects',
  PORTAL_BILLING: '/portal/billing',
  PORTAL_SUPPORT: '/portal/support',
  PORTAL_ACCOUNT: '/portal/account',

  API_BASE: '/api',
  API_AUTH: '/api/auth',
  API_PROJECTS: '/api/projects',
  API_PAYMENTS: '/api/payments',
  API_SUPPORT: '/api/support',
  API_WHATSAPP: '/api/whatsapp',
};

// File Upload Configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ],
  UPLOAD_DIR: '/uploads',
};

// Pagination Configuration
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
};

// Cache Configuration
export const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  USER_TTL: 10 * 60 * 1000, // 10 minutes
  PROJECT_TTL: 5 * 60 * 1000, // 5 minutes
  STATS_TTL: 2 * 60 * 1000, // 2 minutes
};

// Rate Limiting Configuration
export const RATE_LIMIT_CONFIG = {
  DEFAULT: { windowMs: 15 * 60 * 1000, maxRequests: 100 },
  AUTH: { windowMs: 15 * 60 * 1000, maxRequests: 5 },
  PAYMENT: { windowMs: 60 * 1000, maxRequests: 10 },
  UPLOAD: { windowMs: 60 * 1000, maxRequests: 5 },
};

// Security Configuration
export const SECURITY_CONFIG = {
  JWT_EXPIRES_IN: '7d',
  REFRESH_TOKEN_EXPIRES_IN: '30d',
  PASSWORD_MIN_LENGTH: 8,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
};

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  PLAUSIBLE_DOMAIN: import.meta.env.PUBLIC_PLAUSIBLE_DOMAIN,
  PLAUSIBLE_SCRIPT_URL: import.meta.env.PUBLIC_PLAUSIBLE_SCRIPT_URL || 'https://plausible.io/js/script.js',
  GOOGLE_ANALYTICS_ID: import.meta.env.PUBLIC_GOOGLE_ANALYTICS_ID,
  ENABLED: import.meta.env.PUBLIC_ENABLE_ANALYTICS === 'true',
};

// Site Configuration (for BaseHead, etc.)
export const SITE = {
  title: APP_CONFIG.name,
  description: APP_CONFIG.description,
  url: APP_CONFIG.url,
  twitterHandle: '@AstroProDigital', // Ganti dengan handle resmi jika ada
};

// Export validation functions
export function validateEnvironment(): void {
  const requiredEnvVars = [
    'PUBLIC_SUPABASE_URL',
    'PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missing = requiredEnvVars.filter(envVar => !import.meta.env[envVar]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Export configuration object for easy access
export const CONFIG = {
  supabase: SUPABASE_CONFIG,
  midtrans: MIDTRANS_CONFIG,
  whatsapp: WHATSAPP_CONFIG,
  app: APP_CONFIG,
  errors: ERROR_MESSAGES,
  success: SUCCESS_MESSAGES,
  routes: ROUTE_CONFIG,
  upload: UPLOAD_CONFIG,
  pagination: PAGINATION_CONFIG,
  cache: CACHE_CONFIG,
  rateLimit: RATE_LIMIT_CONFIG,
  security: SECURITY_CONFIG,
  analytics: ANALYTICS_CONFIG,
  site: SITE, // Tambahkan SITE ke objek CONFIG jika diinginkan
};