import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us — Cansan Solutions',
  description: 'Get in touch with Cansan Solutions via WhatsApp, phone, or visit us in Harare, Zimbabwe.',
};

const WA_NUMBER = '263773754747';
const WA_DISPLAY = '+263 77 375 4747';

const contactItems = [
  {
    label: 'WhatsApp',
    value: WA_DISPLAY,
    detail: 'Fastest way to reach us — chat, order, or enquire.',
    href: `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hi Cansan Solutions, I'd like to get in touch.")}`,
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
      </svg>
    ),
    color: 'bg-green-50 text-green-600',
    btnClass: 'bg-green-600 hover:bg-green-700 text-white',
    btnLabel: 'Open WhatsApp',
  },
  {
    label: 'Phone',
    value: WA_DISPLAY,
    detail: 'Call us during business hours — Mon to Sat, 8am–6pm.',
    href: `tel:+${WA_NUMBER}`,
    external: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
      </svg>
    ),
    color: 'bg-blue-50 text-blue-600',
    btnClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    btnLabel: 'Call Now',
  },
  {
    label: 'Email',
    value: 'info@cansansolutions.co.zw',
    detail: 'For formal enquiries, quotes, and corporate orders.',
    href: 'mailto:info@cansansolutions.co.zw',
    external: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
      </svg>
    ),
    color: 'bg-red-50 text-red-600',
    btnClass: 'bg-red-600 hover:bg-red-700 text-white',
    btnLabel: 'Send Email',
  },
  {
    label: 'Location',
    value: 'Shop 7, ZB House',
    detail: 'Corner Speke & 1st Street, Harare — walk-ins welcome, call ahead to confirm availability.',
    href: 'https://maps.google.com/?q=Shop+7+ZB+House+Corner+Speke+and+1st+Street+Harare+Zimbabwe',
    external: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
      </svg>
    ),
    color: 'bg-zinc-100 text-zinc-600',
    btnClass: 'bg-zinc-700 hover:bg-zinc-800 text-white',
    btnLabel: 'View on Map',
  },
];

const hours = [
  { day: 'Monday – Friday', time: '8:00 AM – 6:00 PM' },
  { day: 'Saturday', time: '9:00 AM – 4:00 PM' },
  { day: 'Sunday', time: 'Closed' },
];

const faqs = [
  {
    q: 'How do I place an order?',
    a: 'Add items to your cart on our website, then click "Order via WhatsApp" in the cart drawer. We\'ll confirm availability and arrange payment and delivery.',
  },
  {
    q: 'Do you offer delivery?',
    a: 'Yes — we deliver across Harare and can arrange nationwide courier. Delivery fees vary by location; confirm with us on WhatsApp.',
  },
  {
    q: 'Are prices negotiable?',
    a: 'Prices on the site are indicative. For bulk orders or special circumstances, reach out and we\'ll do our best to accommodate you.',
  },
  {
    q: 'Can you source products not listed on the site?',
    a: 'Absolutely. Contact us via WhatsApp with the product name or specs and we\'ll check availability through our supplier network.',
  },
  {
    q: 'Do products come with a warranty?',
    a: 'All products come with the manufacturer\'s standard warranty. Contact us if you encounter any issues and we\'ll help facilitate a claim.',
  },
];

export default function ContactPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-zinc-900 px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-red-400">Get in touch</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">We&apos;d love to hear from you</h1>
          <p className="mt-5 text-base text-zinc-400 max-w-lg mx-auto leading-relaxed">
            Questions, quotes, bulk orders, or just need advice — our team is ready. WhatsApp is the fastest way to reach us.
          </p>
        </div>
      </section>

      {/* Contact cards */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-5 sm:grid-cols-2">
          {contactItems.map((item) => (
            <div key={item.label} className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.color}`}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{item.label}</p>
                  <p className="mt-0.5 text-base font-bold text-zinc-900">{item.value}</p>
                  <p className="mt-1 text-xs text-zinc-500 leading-relaxed">{item.detail}</p>
                </div>
              </div>
              <a
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noreferrer' : undefined}
                className={`mt-auto flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition ${item.btnClass}`}
              >
                {item.btnLabel}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Hours + FAQ side by side */}
      <section className="bg-zinc-50 px-6 py-16">
        <div className="mx-auto max-w-5xl grid gap-10 lg:grid-cols-2">
          {/* Business hours */}
          <div>
            <h2 className="mb-6 text-xl font-bold text-zinc-900">Business Hours</h2>
            <div className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white overflow-hidden">
              {hours.map((h) => (
                <div key={h.day} className="flex items-center justify-between px-5 py-4">
                  <span className="text-sm font-medium text-zinc-700">{h.day}</span>
                  <span className={`text-sm font-semibold ${h.time === 'Closed' ? 'text-zinc-400' : 'text-zinc-900'}`}>
                    {h.time}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-zinc-400">
              Outside hours? Send us a WhatsApp — we monitor messages and will reply as soon as possible.
            </p>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="mb-6 text-xl font-bold text-zinc-900">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.q} className="rounded-xl border border-zinc-200 bg-white p-4">
                  <p className="text-sm font-semibold text-zinc-900">{faq.q}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final WhatsApp CTA */}
      <section className="bg-green-600 px-6 py-12 text-center text-white">
        <h2 className="text-xl font-bold">Still have questions?</h2>
        <p className="mt-1 text-green-100 text-sm">Send us a message — we usually respond within minutes.</p>
        <a
          href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hi Cansan Solutions, I have a question.")}`}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-50"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
          </svg>
          WhatsApp Us Now
        </a>
      </section>
    </div>
  );
}
