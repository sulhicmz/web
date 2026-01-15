import { ResilientHttpClient } from './integration/http-client';

const WHATSAPP_API_URL = 'https://graph.facebook.com/v15.0';

interface WhatsAppComponent {
  type: string;
  parameters: WhatsAppParameter[];
}

interface WhatsAppParameter {
  type: string;
  text: string;
}

const httpClient = new ResilientHttpClient({
  baseURL: WHATSAPP_API_URL,
  timeout: 20000,
  maxRetries: 2,
  circuitBreakerEnabled: true,
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
});

export async function sendTemplate(to: string, template: string, components: WhatsAppComponent[]) {
  const businessId = import.meta.env.WHATSAPP_BUSINESS_ID || import.meta.env.WHATSAPP_PHONE_NUMBER_ID;

  return httpClient.post(
    `${businessId}/messages`,
    {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: template,
        language: { code: 'id' },
        components,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${import.meta.env.WHATSAPP_ACCESS_TOKEN}`,
      },
      context: {
        serviceName: 'whatsapp-api',
        operationName: 'sendTemplate',
      },
      timeout: 20000,
      retries: 2,
    }
  );
}

export async function sendInvoiceAlert(to: string, invoiceNumber: string, amount: string, dueDate: string, paymentUrl: string) {
  const components = [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: invoiceNumber },
        { type: 'text', text: amount },
        { type: 'text', text: dueDate },
        { type: 'text', text: paymentUrl },
      ],
    },
  ];
  return sendTemplate(to, 'invoice_alert', components);
}

export async function sendProjectStatusUpdate(to: string, projectName: string, status: string, sprintDetailsUrl: string) {
  const components = [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: projectName },
        { type: 'text', text: status },
        { type: 'text', text: sprintDetailsUrl },
      ],
    },
  ];
  return sendTemplate(to, 'project_status', components);
}

export async function sendTicketUpdate(to: string, ticketId: string, author: string, detailsUrl: string) {
  const components = [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: ticketId },
        { type: 'text', text: author },
        { type: 'text', text: detailsUrl },
      ],
    },
  ];
  return sendTemplate(to, 'ticket_update', components);
}