const WHATSAPP_API_URL = 'https://graph.facebook.com/v15.0';

export async function sendTemplate(to: string, template: string, components: any[]) {
  const response = await fetch(`${WHATSAPP_API_URL}/${import.meta.env.WHATSAPP_BUSINESS_ID}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.WHATSAPP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: template,
        language: { code: 'id' },
        components,
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Gagal mengirim template WhatsApp: ${response.status} ${detail}`);
  }

  return response.json();
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