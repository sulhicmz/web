// Payment provider types
export interface PaymentProvider {
  name: string;
  isActive: boolean;
  config: Record<string, any>;
}

export interface MidtransConfig {
  clientKey: string;
  serverKey: string;
  isProduction: boolean;
}