import { CONTACT_DETAILS } from './config';

// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = "AstroPro Digital";
export const SITE_DESCRIPTION = "Solusi website Astro, portal klien, dan otomasi operasional untuk bisnis B2B modern.";

export const CONTACT_EMAIL = CONTACT_DETAILS.email;
export const CONTACT_WHATSAPP_NUMBER = CONTACT_DETAILS.whatsappNumber;
export const CONTACT_WHATSAPP_DEFAULT_MESSAGE = "Halo, saya ingin diskusi proyek website";

export const buildWhatsappLink = (message: string = CONTACT_WHATSAPP_DEFAULT_MESSAGE) =>
        `${CONTACT_DETAILS.whatsappLink}?text=${encodeURIComponent(message)}`;
