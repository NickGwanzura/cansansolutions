'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/lib/cart-store';
import { getWhatsAppOrderMessage, buildWhatsAppPreview, formatCurrency } from '@/lib/utils';
import { WA_NUMBER } from '@/lib/site';
import { ProductImage } from './ProductImage';

type Props = { open: boolean; onClose: () => void };
type Step = 'cart' | 'review';
const NOTE_SUGGESTIONS = [
  'Need Harare delivery',
  'Will collect in store',
  'Please confirm stock first',
];

// Step indicator
function StepDots({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center gap-1.5 text-xs font-semibold ${step === 'cart' ? 'text-red-600' : 'text-zinc-500'}`}
      >
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${step === 'cart' ? 'bg-red-600 text-white' : 'bg-zinc-200 text-zinc-600'}`}
        >
          1
        </span>
        Cart
      </div>
      <div className={`h-px w-6 ${step === 'review' ? 'bg-green-400' : 'bg-zinc-200'}`} />
      <div
        className={`flex items-center gap-1.5 text-xs font-semibold ${step === 'review' ? 'text-green-600' : 'text-zinc-400'}`}
      >
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${step === 'review' ? 'bg-green-600 text-white' : 'bg-zinc-100 text-zinc-400'}`}
        >
          2
        </span>
        Review
      </div>
      <div className="h-px w-6 bg-zinc-200" />
      <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-[11px] font-bold text-zinc-400">
          3
        </span>
        WhatsApp
      </div>
    </div>
  );
}

export function CartDrawer({ open, onClose }: Props) {
  const items = useCartStore((s) => s.items);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const updateQty = useCartStore((s) => s.updateQty);
  const clearCart = useCartStore((s) => s.clearCart);

  const [step, setStep] = useState<Step>('cart');
  const [note, setNote] = useState('');

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const totalItems = items.reduce((a, i) => a + i.qty, 0);
  const currency = items[0]?.currency ?? 'USD';

  // Reset step when drawer closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep('cart');
        setNote('');
      }, 300);
    }
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const currentStep: Step = items.length === 0 ? 'cart' : step;

  const waHref = `https://wa.me/${WA_NUMBER}?text=${getWhatsAppOrderMessage(items, note)}`;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                    />
                  </svg>
                  <h2 className="font-heading text-sm font-bold text-zinc-900">Your Cart</h2>
                  {items.length > 0 && (
                    <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-600">
                      {totalItems} item{totalItems !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {items.length > 0 && <StepDots step={currentStep} />}
              </div>
              <button
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-zinc-100"
                aria-label="Close cart"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {/* ── STEP 1: CART ITEMS ── */}
                {currentStep === 'cart' && (
                  <motion.div
                    key="cart-step"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="px-5 py-4"
                  >
                    {items.length === 0 ? (
                      <div className="flex h-64 flex-col items-center justify-center gap-4 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="28"
                            height="28"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.4}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-heading text-sm font-semibold text-zinc-700">
                            Your cart is empty
                          </p>
                          <p className="mt-1 text-sm text-zinc-500">
                            Browse products and add items to get started
                          </p>
                        </div>
                        <button
                          onClick={onClose}
                          className="inline-flex min-h-11 items-center rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                          Browse Products
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
                          <p className="text-sm font-semibold text-emerald-800">
                            What happens next
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-emerald-700">
                            Review your items, add any delivery or collection note, then send the
                            order on WhatsApp. Cansan confirms stock, final pricing, and next steps
                            before payment.
                          </p>
                        </div>

                        <ul className="space-y-3">
                          <AnimatePresence initial={false}>
                            {items.map((item) => (
                              <motion.li
                                key={item.id}
                                layout
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3"
                              >
                                <Link
                                  href={`/products/${item.slug}`}
                                  onClick={onClose}
                                  className="block h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-zinc-100 bg-white"
                                >
                                  <ProductImage
                                    src={item.image}
                                    alt={item.name}
                                    width={56}
                                    height={56}
                                    className="h-full w-full object-contain p-1.5"
                                  />
                                </Link>
                                <div className="flex min-w-0 flex-1 flex-col gap-1">
                                  <Link
                                    href={`/products/${item.slug}`}
                                    onClick={onClose}
                                    className="font-heading text-sm font-semibold leading-snug text-zinc-900 transition-colors hover:text-red-600 line-clamp-2"
                                  >
                                    {item.name}
                                  </Link>
                                  <span className="text-sm text-zinc-500">
                                    {formatCurrency(item.price, item.currency)} each
                                  </span>
                                  <div className="mt-0.5 flex items-center gap-1.5">
                                    <button
                                      onClick={() => updateQty(item.id, item.qty - 1)}
                                      className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-base font-bold transition hover:border-red-300 hover:text-red-600 active:scale-90"
                                    >
                                      −
                                    </button>
                                    <span className="w-7 text-center text-sm font-bold text-zinc-900">
                                      {item.qty}
                                    </span>
                                    <button
                                      onClick={() => updateQty(item.id, item.qty + 1)}
                                      className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-base font-bold transition hover:border-red-300 hover:text-red-600 active:scale-90"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                                <div className="shrink-0 flex flex-col items-end gap-2">
                                  <span className="font-heading text-sm font-bold text-zinc-900">
                                    {formatCurrency(item.price * item.qty, item.currency)}
                                  </span>
                                  <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="inline-flex min-h-10 items-center text-sm text-zinc-500 transition-colors hover:text-red-500"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </motion.li>
                            ))}
                          </AnimatePresence>
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── STEP 2: REVIEW & NOTES ── */}
                {currentStep === 'review' && (
                  <motion.div
                    key="review-step"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="px-5 py-4 space-y-4"
                  >
                    {/* Order summary */}
                    <div>
                      <h3 className="mb-2 font-heading text-xs font-bold uppercase tracking-wide text-zinc-700">
                        Order Summary
                      </h3>
                      <ul className="space-y-2">
                        {items.map((item) => (
                          <li key={item.id} className="flex items-center gap-2.5">
                            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-zinc-50 border border-zinc-100">
                              <ProductImage
                                src={item.image}
                                alt={item.name}
                                width={36}
                                height={36}
                                className="h-full w-full object-contain p-1"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-zinc-800 line-clamp-1">
                                {item.name}
                              </p>
                              <p className="text-sm text-zinc-500">Qty: {item.qty}</p>
                            </div>
                            <span className="shrink-0 text-sm font-bold text-zinc-900">
                              {formatCurrency(item.price * item.qty, item.currency)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Totals */}
                    <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-3 space-y-1.5">
                      <div className="flex justify-between text-sm text-zinc-600">
                        <span>
                          Subtotal ({totalItems} item{totalItems !== 1 ? 's' : ''})
                        </span>
                        <span className="font-semibold text-zinc-700">
                          {formatCurrency(total, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-zinc-600">
                        <span>Delivery</span>
                        <span className="font-medium text-zinc-500">Confirmed via WhatsApp</span>
                      </div>
                      <div className="border-t border-zinc-200 pt-1.5 flex justify-between">
                        <span className="text-sm font-bold text-zinc-900">Total</span>
                        <span className="font-heading text-base font-extrabold text-zinc-900">
                          {formatCurrency(total, currency)}
                        </span>
                      </div>
                    </div>

                    {/* Note */}
                    <div>
                      <label className="mb-1.5 block font-heading text-xs font-bold uppercase tracking-wide text-zinc-700">
                        Add a note{' '}
                        <span className="font-normal text-zinc-400 normal-case">(optional)</span>
                      </label>
                      <div className="mb-2 flex flex-wrap gap-2">
                        {NOTE_SUGGESTIONS.map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() =>
                              setNote((current) =>
                                current
                                  ? `${current.trim()}${current.trim().endsWith('.') ? ' ' : '. '}${suggestion}`
                                  : suggestion,
                              )
                            }
                            className="inline-flex min-h-10 items-center rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-600 transition hover:border-red-300 hover:text-red-600"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={3}
                        placeholder="E.g. delivery address, preferred colour, questions..."
                        className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm text-zinc-700 placeholder-zinc-400 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                      />
                    </div>

                    {/* WhatsApp message preview */}
                    <div>
                      <p className="mb-1.5 font-heading text-xs font-bold uppercase tracking-wide text-zinc-500">
                        Message preview
                      </p>
                      <div className="whitespace-pre-wrap rounded-xl border border-green-100 bg-green-50 p-3 font-mono text-sm leading-relaxed text-zinc-700">
                        {buildWhatsAppPreview(items, note)}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-zinc-100 bg-white px-5 py-4 space-y-2.5">
                {currentStep === 'cart' && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">
                        {totalItems} item{totalItems !== 1 ? 's' : ''}
                      </span>
                      <span className="font-heading text-lg font-extrabold text-zinc-900">
                        {formatCurrency(total, currency)}
                      </span>
                    </div>
                    <motion.button
                      onClick={() => setStep('review')}
                      whileTap={{ scale: 0.97 }}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-red-900/20 transition hover:bg-red-700 active:scale-95"
                    >
                      Review Before WhatsApp
                      <svg
                        width="14"
                        height="14"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                        />
                      </svg>
                    </motion.button>
                    <button
                      onClick={clearCart}
                      className="w-full text-[11px] font-medium text-zinc-300 hover:text-zinc-600 transition-colors"
                    >
                      Clear cart
                    </button>
                  </>
                )}

                {currentStep === 'review' && (
                  <>
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-center">
                      <p className="text-[11px] font-semibold text-zinc-700">
                        Stock, delivery, and final price are confirmed before payment.
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                        Use WhatsApp to complete the handoff. Cansan will respond with confirmation
                        and the next step.
                      </p>
                    </div>
                    <motion.a
                      href={waHref}
                      target="_blank"
                      rel="noreferrer"
                      whileTap={{ scale: 0.97 }}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-green-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-900/25 transition hover:bg-green-500"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                      </svg>
                      Send Order for Confirmation
                    </motion.a>
                    <button
                      onClick={() => setStep('cart')}
                      className="w-full text-[11px] font-medium text-zinc-400 hover:text-zinc-700 transition-colors"
                    >
                      ← Back to cart
                    </button>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
