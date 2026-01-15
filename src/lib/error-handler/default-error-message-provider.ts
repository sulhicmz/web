import type { IErrorMessageProvider } from './error-message-provider.interface';

export class DefaultErrorMessageProvider implements IErrorMessageProvider {
  readonly AUTH_INVALID_CREDENTIALS = 'Email atau password tidak valid';
  readonly AUTH_USER_NOT_FOUND = 'Pengguna tidak ditemukan';
  readonly AUTH_EMAIL_NOT_CONFIRMED = 'Email belum dikonfirmasi';
  readonly AUTH_SESSION_EXPIRED = 'Sesi telah berakhir, silakan login kembali';
  readonly AUTH_UNAUTHORIZED = 'Anda tidak memiliki akses untuk melakukan tindakan ini';
  readonly VALIDATION_REQUIRED = 'Field ini wajib diisi';
  readonly VALIDATION_INVALID_EMAIL = 'Format email tidak valid';
  readonly VALIDATION_INVALID_PHONE = 'Format nomor telepon tidak valid';
  readonly VALIDATION_PASSWORD_TOO_WEAK = 'Password terlalu lemah';
  readonly VALIDATION_PASSWORDS_NOT_MATCH = 'Password tidak cocok';
  readonly PAYMENT_FAILED = 'Pembayaran gagal, silakan coba lagi';
  readonly PAYMENT_INVALID_AMOUNT = 'Jumlah pembayaran tidak valid';
  readonly PAYMENT_METHOD_NOT_SUPPORTED = 'Metode pembayaran tidak didukung';
  readonly INTERNAL_ERROR = 'Terjadi kesalahan internal';
  readonly NETWORK_ERROR = 'Kesalahan koneksi jaringan';
  readonly NOT_FOUND = 'Data tidak ditemukan';
  readonly RATE_LIMIT_EXCEEDED = 'Terlalu banyak permintaan, silakan coba lagi nanti';
}
