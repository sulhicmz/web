// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = "AstroPro Digital";
export const SITE_DESCRIPTION = "Solusi website Astro, portal klien, dan otomasi operasional untuk bisnis B2B modern.";

export const CONTACT_EMAIL = "halo@astropro.id";
export const CONTACT_WHATSAPP_NUMBER = "6281234567890";
export const CONTACT_WHATSAPP_DEFAULT_MESSAGE = "Halo, saya ingin diskusi proyek website";

export const buildWhatsappLink = (message: string = CONTACT_WHATSAPP_DEFAULT_MESSAGE) =>
        `https://wa.me/${CONTACT_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
