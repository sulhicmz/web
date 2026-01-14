import DOMPurify from 'dompurify';

const DOMPurifyConfig = {
  ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'span', 'a', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
  SAFE_FOR_TEMPLATES: true,
  SAFE_FOR_JQUERY: true,
  SANITIZE_DOM: true,
};

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, DOMPurifyConfig);
}

export function sanitizeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
