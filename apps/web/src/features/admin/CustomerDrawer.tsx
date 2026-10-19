import { useState } from 'react';
import { Link } from 'react-router';
import { Copy, Mail, MapPin, Phone } from 'lucide-react';
import type { CustomerRow } from '@shobdox/shared-types';
import {
  Avatar,
  Badge,
  DemoNotice,
  Drawer,
  EmptyState,
  IconButton,
  KeyValue,
  Button,
  Switch,
} from '@/components/ui';
import { useCustomerOrders } from '@/hooks/useCatalog';
import { useCopyToClipboard } from '@/hooks/useCommon';
import { formatDate, formatRelativeTime, formatTaka, toBanglaDigits } from '@shobdox/shared-utils';
import { toast } from '@/store/ui.store';
import { CUSTOMER_SEGMENT_LABELS, CustomerStatusBadge, OrderStatusBadge } from './StatusBadges';

/**
 * Customer profile drawer.
 *
 * Shows the aggregate row plus the live demo orders for that account. The
 * block/unblock control is local to this screen: the shared `User` type has no
 * status field, so the demo cannot persist a block — the notice below the
 * switch says exactly that instead of pretending otherwise.
 */

export function CustomerDrawer({ row, onClose }: { row?: CustomerRow; onClose: () => void }) {
  return (
    <Drawer open={Boolean(row)} onClose={onClose} title="গ্রাহক প্রোফাইল" widthClassName="sm:max-w-lg">
      {row ? <CustomerBody key={row.id} row={row} onClose={onClose} /> : null}
    </Drawer>
  );
}

function CustomerBody({ row, onClose }: { row: CustomerRow; onClose: () => void }) {
  const orders = useCustomerOrders(row.id);
  const { copied, copy } = useCopyToClipboard();
  const [blocked, setBlocked] = useState(row.status === 'blocked');

  const toggleBlocked = (value: boolean) => {
    setBlocked(value);
    toast(
      value
        ? { tone: 'warning', title: 'গ্রাহক ব্লক করা হয়েছে', description: 'শুধু এই ড্রয়ারে দেখানো হচ্ছে — ডেমো সীমাবদ্ধতা।' }
        : { tone: 'success', title: 'গ্রাহকের ব্লক তুলে নেওয়া হয়েছে' },
    );
  };

  return (
    <div className="space-y-5">
      <header className="flex items-start gap-3">
        <Avatar name={row.name} size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-bold text-text-primary">{row.name}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge tone={row.segment === 'vip' ? 'accent' : row.segment === 'at-risk' ? 'warning' : 'info'} size="sm">
              {CUSTOMER_SEGMENT_LABELS[row.segment]}
            </Badge>
            <CustomerStatusBadge status={blocked ? 'blocked' : row.status} />
          </div>
        </div>
      </header>

      <ul className="space-y-2 text-sm">
        <li className="flex items-center gap-2 text-text-secondary">
          <Phone aria-hidden className="size-4 shrink-0" />
          <span className="font-num">{row.phone}</span>
          <IconButton
            label={copied ? 'কপি হয়েছে' : 'নম্বর কপি করুন'}
            variant="ghost"
            size="sm"
            onClick={() => copy(row.phone)}
          >
            <Copy aria-hidden className="size-3.5" />
          </IconButton>
        </li>
        {row.email ? (
          <li className="flex items-center gap-2 text-text-secondary">
            <Mail aria-hidden className="size-4 shrink-0" />
            <span className="truncate">{row.email}</span>
          </li>
        ) : null}
        <li className="flex items-center gap-2 text-text-secondary">
          <MapPin aria-hidden className="size-4 shrink-0" />
          <span>{row.district}</span>
        </li>
      </ul>

      <dl className="rounded-card border border-border px-3">
        <KeyValue label="মোট অর্ডার">{toBanglaDigits(row.orders)}</KeyValue>
        <KeyValue label="মোট খরচ">{formatTaka(row.totalSpent)}</KeyValue>
        <KeyValue label="গড় অর্ডার মূল্য">{formatTaka(row.averageOrderValue)}</KeyValue>
        <KeyValue label="যোগদান">{formatDate(row.joinedAt)}</KeyValue>
        {row.lastOrderAt ? <KeyValue label="শেষ অর্ডার">{formatRelativeTime(row.lastOrderAt)}</KeyValue> : null}
      </dl>

      <section aria-label="সাম্প্রতিক অর্ডার">
        <h3 className="text-base font-semibold text-text-primary">সাম্প্রতিক অর্ডার</h3>
        {orders.length === 0 ? (
          <EmptyState
            className="mt-2"
            title="এই ডেমো অ্যাকাউন্টে সরাসরি অর্ডার নেই"
            description="সিন্থেটিক ডেমো সারির জন্য লাইভ অর্ডার সংরক্ষিত থাকে না।"
          />
        ) : (
          <ul className="mt-2 space-y-2">
            {orders.slice(0, 5).map((order) => (
              <li key={order.id}>
                <Link
                  to={`/admin/orders/${order.id}`}
                  onClick={onClose}
                  className="flex items-center justify-between gap-3 rounded-card border border-border px-3 py-2 transition-colors hover:border-primary hover:bg-surface-muted/60"
                >
                  <span className="min-w-0">
                    <span className="block font-num text-sm font-medium text-text-primary">{order.orderNumber}</span>
                    <span className="block text-xs text-text-secondary">{formatDate(order.placedAt)}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <OrderStatusBadge status={order.status} />
                    <span className="font-num text-sm font-semibold text-text-primary">{formatTaka(order.totals.total)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="গ্রাহক নিয়ন্ত্রণ" className="rounded-card border border-border p-3">
        <Switch
          checked={blocked}
          onChange={toggleBlocked}
          label="গ্রাহক ব্লক করা হয়েছে"
          description="ব্লক করা গ্রাহক ডেমো চেকআউটে দিতে পারবেন না (শুধু এই স্ক্রিনে দেখানো হয়)।"
        />
        <DemoNotice className="mt-3" title="সীমাবদ্ধতা">
          শেয়ার্ড ডেটা মডেলে গ্রাহকের স্ট্যাটাস সংরক্ষণ করা হয় না — তাই এখানকার ব্লক/আনব্লক শুধু ভিজ্যুয়াল, রিফ্রেশে
          হারিয়ে যাবে।
        </DemoNotice>
      </section>

      <div className="flex justify-end">
        <Button variant="ghost" onClick={onClose}>
          বন্ধ করুন
        </Button>
      </div>
    </div>
  );
}
