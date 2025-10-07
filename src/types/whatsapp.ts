// WhatsApp Business API types
export interface WhatsAppBusinessAccount {
  id: string;
  name: string;
  phone_number_id: string;
  is_active: boolean;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: string;
  language: string;
  status: 'approved' | 'pending' | 'rejected';
  components: Array<{
    type: 'header' | 'body' | 'footer' | 'button';
    text?: string;
    buttons?: Array<{
      type: 'phone_number' | 'url' | 'quick_reply';
      text: string;
      payload?: string;
    }>;
  }>;
}

export interface WhatsAppNotificationRequest {
  to: string;
  template_name: string;
  language_code: string;
  variables?: Record<string, string>;
}