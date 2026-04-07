export const SITE_NAME = 'Cansan Solutions';
export const SITE_URL = 'https://cansansolutions.shop';
export const SITE_DESCRIPTION =
  'Buy laptops, phones, printers, CCTV, networking gear, and accessories in Harare, Zimbabwe. Order via WhatsApp with fast delivery and expert support.';
export const SITE_EMAIL = 'info@cansansolutions.co.zw';
export const SITE_PHONE = '+263 77 375 4747';
export const SITE_PHONE_E164 = '+263773754747';
export const SITE_ADDRESS = {
  streetAddress: 'Shop 7, ZB House, Corner Speke & 1st Street',
  addressLocality: 'Harare',
  addressCountry: 'ZW',
};

export function absoluteUrl(path = '/') {
  return new URL(path, SITE_URL).toString();
}
