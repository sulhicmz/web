// Payment provider types
export interface PaymentProvider {
  name: string;
  isActive: boolean;
  config: Record<string, unknown>;
}

export interface MidtransConfig {
  clientKey: string;
  serverKey: string;
  isProduction: boolean;
}