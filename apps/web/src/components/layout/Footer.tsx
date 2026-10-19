import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight, Headphones, Mail, MapPin, Phone, Send, ShieldCheck, Truck } from 'lucide-react';
import { CUSTOMER_BENEFITS, DELIVERY_PARTNERS, FOOTER_COLUMNS, FOOTER_PAYMENT_METHODS } from '@shobdox/shared-mock-data';
import { APP_NAME, APP_TAGLINE, SUPPORT_PHONE } from '@/lib/constants';
import { Alert, ConfirmDialog, DemoNotice } from '@/components/ui';
import { resetEverything } from '@/store/data.store';
import { toast } from '@/store/ui.store';

/** Storefront footer: links, benefits, payment/delivery marks and demo controls. */

export function Footer() {
  const [email, setEmail] = useState('');
  const [resetOpen, setResetOpen] = useState(false);

  const onSubscribe = (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast({ tone: 'error', title: 'ইমেইল ঠিকানাটি ঠিক নয়', description: 'যেমন: name@example.com' });
      return;
    }
    setEmail('');
    toast({
      tone: 'success',
      title: 'নিউজলেটার সাবস্ক্রিপশন ডেমো',
      description: 'এই ডেমোতে কোনো ইমেইল পাঠানো হয় না — তথ্য শুধু এই ব্রাউজারে থাকে।',
    });
  };

  return (
    <footer className="no-print mt-10 border-t border-border bg-surface">
      <div className="page-shell py-8">
        {/* benefits */}
        <ul className="grid gap-3 border-b border-divider pb-6 sm:grid-cols-2 xl:grid-cols-4">
          {CUSTOMER_BENEFITS.map((benefit) => (
            <li key={benefit.id} className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-card bg-primary-soft text-primary-dark">
                {benefit.icon === 'Truck' ? (
                  <Truck aria-hidden className="size-4" />
                ) : benefit.icon === 'Wallet' ? (
                  <ShieldCheck aria-hidden className="size-4" />
                ) : benefit.icon === 'RotateCcw' ? (
                  <Send aria-hidden className="size-4" />
                ) : (
                  <Headphones aria-hidden className="size-4" />
                )}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-text-primary">{benefit.title}</span>
                <span className="block text-xs text-text-secondary">{benefit.description}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="grid gap-8 py-6 md:grid-cols-2 xl:grid-cols-5">
          {/* brand + newsletter */}
          <div className="xl:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-card bg-primary font-num text-lg font-extrabold text-on-primary">
                S
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-num text-lg font-extrabold text-primary-dark">{APP_NAME}</span>
                <span className="text-[10px] text-text-secondary">{APP_TAGLINE}</span>
              </span>
            </Link>

            <p className="mt-3 max-w-sm text-sm text-text-secondary">
              বাংলাদেশি বিক্রেতাদের জন্য একটি আধুনিক মার্কেটপ্লেস — ফ্যাশন, ইলেকট্রনিক্স, হোম, বিউটি ও গ্রোসারি এক
              জায়গায়। সারা দেশে দ্রুত ডেলিভারি ও ক্যাশ অন ডেলিভারি সুবিধা।
            </p>

            <form onSubmit={onSubscribe} className="mt-4 max-w-sm">
              <label htmlFor="newsletter" className="mb-1 block text-sm font-medium text-text-primary">
                অফার ও নতুন পণ্যের খবর পেতে
              </label>
              <div className="flex gap-2">
                <input
                  id="newsletter"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="আপনার ইমেইল"
                  className="h-10 min-w-0 flex-1 rounded-input border border-border-strong px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="submit"
                  className="h-10 shrink-0 rounded-button bg-primary px-4 text-sm font-medium text-on-primary hover:bg-primary-dark"
                >
                  সাবস্ক্রাইব
                </button>
              </div>
              <p className="mt-1 text-xs text-text-muted">ডেমো ফর্ম — কোনো ইমেইল সংরক্ষণ বা প্রেরণ হয় না।</p>
            </form>

            <ul className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-text-secondary">
              {['ফেসবুক', 'ইউটিউব', 'ইনস্টাগ্রাম'].map((channel) => (
                <li key={channel}>
                  <button
                    type="button"
                    onClick={() =>
                      toast({
                        tone: 'info',
                        title: `${channel} পেজ (ডেমো)`,
                        description: 'এই ডেমোতে কোনো প্রকৃত সোশ্যাল পেজ নেই — লিংক কাজ করে না।',
                      })
                    }
                    className="inline-flex items-center gap-1 text-xs hover:text-primary hover:underline"
                  >
                    <ArrowUpRight aria-hidden className="size-3.5" />
                    {channel}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* link columns */}
          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.id} aria-label={column.title}>
              <h2 className="mb-3 text-sm font-bold text-text-primary">{column.title}</h2>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={`${column.id}-${link.href}-${link.label}`}>
                    <Link to={link.href} className="text-sm text-text-secondary hover:text-primary hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* contact + demo controls */}
        <div className="grid gap-4 border-t border-divider pt-6 md:grid-cols-2">
          <div className="space-y-2 text-sm text-text-secondary">
            <p className="flex items-center gap-2">
              <Phone aria-hidden className="size-4" /> হটলাইন: <span className="font-num">{SUPPORT_PHONE}</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail aria-hidden className="size-4" /> support@shobdox.example (ডেমো)
            </p>
            <p className="flex items-start gap-2">
              <MapPin aria-hidden className="mt-0.5 size-4" /> ঢাকা, বাংলাদেশ
            </p>
          </div>

          <div className="space-y-3">
            <DemoNotice title="ডেমো প্রজেক্ট">
              কোনো লেনদেন, পেমেন্ট বা ডেলিভারি বাস্তবে হয় না। ডেটা শুধু এই ব্রাউজারে (localStorage) সংরক্ষিত থাকে।
            </DemoNotice>

            <button
              type="button"
              onClick={() => setResetOpen(true)}
              className="w-full rounded-button border border-error/40 bg-error-soft/40 px-4 py-2 text-sm font-medium text-red-800 hover:bg-error-soft"
            >
              ডেমো ডেটা রিসেট করুন
            </button>
          </div>
        </div>

        {/* payment + delivery marks */}
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-divider pt-4 text-xs text-text-secondary">
          <span className="font-medium text-text-primary">পেমেন্ট:</span>
          {FOOTER_PAYMENT_METHODS.map((method) => (
            <span key={method} className="rounded-chip bg-surface-muted px-2 py-1">
              {method}
            </span>
          ))}
          <span className="ml-2 font-medium text-text-primary">ডেলিভারি:</span>
          {DELIVERY_PARTNERS.map((partner) => (
            <span key={partner} className="rounded-chip bg-surface-muted px-2 py-1">
              {partner}
            </span>
          ))}
        </div>

        <p className="mt-4 text-xs text-text-muted">
          © {new Date().getFullYear()} {APP_NAME} — ডেমো প্রকল্প। ব্যবহৃত সব ব্র্যান্ড নাম শুধু উপস্থাপনার জন্য।
        </p>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="ডেমো ডেটা রিসেট করবেন?"
        message="আপনার সব পরিবর্তন (অ্যাডমিন এডিট, নতুন অর্ডার, কার্ট, উইশলিস্ট) মুছে গিয়ে প্রাথমিক ডেমো ডেটা ফিরে আসবে। এটি ফেরানো যাবে না।"
        confirmLabel="হ্যাঁ, রিসেট করুন"
        cancelLabel="বাতিল"
        onConfirm={() => {
          void resetEverything().then(() => toast({ tone: 'success', title: 'ডেমো ডেটা রিসেট হয়েছে' }));
          setResetOpen(false);
        }}
      >
        <Alert tone="warning" className="mt-3">
          রিসেট করার পর কার্ট, উইশলিস্ট ও সব এডিট প্রাথমিক অবস্থায় ফিরে যাবে।
        </Alert>
      </ConfirmDialog>
    </footer>
  );
}
