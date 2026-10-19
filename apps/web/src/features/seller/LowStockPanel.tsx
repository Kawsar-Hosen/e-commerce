import { useState, type FormEvent } from 'react';
import type { InventoryAlert } from '@shobdox/shared-types';
import { LOW_STOCK_THRESHOLD } from '@shobdox/shared-business-logic';
import { Badge, Button, Card, EmptyState, Input, SectionHeader } from '@/components/ui';
import { useDataStore } from '@/store/data.store';
import { toast } from '@/store/ui.store';
import { toBanglaDigits } from '@/lib/format';
import type { Tone } from '@/components/ui';

/** Severity chip tones for the low-stock queue. */
const SEVERITY_TONES: Record<InventoryAlert['severity'], Tone> = {
  critical: 'danger',
  warning: 'warning',
  info: 'info',
};

/**
 * "স্টক কম" panel with an inline stock update per variant.
 *
 * `InventoryAlert.id` is `${productId}-${variantId}`; slicing the product prefix
 * back off is how we recover the variant id for `setProductStock`.
 */
export function LowStockPanel({ alerts }: { alerts: InventoryAlert[] }) {
  const setProductStock = useDataStore((state) => state.setProductStock);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const submit = (event: FormEvent, alert: InventoryAlert) => {
    event.preventDefault();
    const raw = drafts[alert.id];
    const nextStock = Number(raw);
    if (raw === undefined || raw === '' || Number.isNaN(nextStock) || nextStock < 0) {
      toast({ tone: 'error', title: 'সঠিক স্টক সংখ্যা দিন' });
      return;
    }

    const variantId = alert.id.startsWith(`${alert.productId}-`)
      ? alert.id.slice(alert.productId.length + 1)
      : alert.id;

    setProductStock(alert.productId, variantId, nextStock);
    setDrafts((current) => {
      const next = { ...current };
      delete next[alert.id];
      return next;
    });
    toast({
      tone: 'success',
      title: 'স্টক আপডেট হয়েছে',
      description: `${alert.productTitle} · ${alert.sku} → ${toBanglaDigits(Math.floor(nextStock))} ইউনিট`,
    });
  };

  return (
    <Card>
      <SectionHeader
        title="স্টক কম"
        subtitle={`${toBanglaDigits(LOW_STOCK_THRESHOLD)} বা তার কম স্টকে সতর্কতা`}
        href="/seller/products"
        linkLabel="সব পণ্য"
      />

      {alerts.length === 0 ? (
        <EmptyState
          title="স্টক ঠিক আছে"
          description="এই মুহূর্তে কোনো ভ্যারিয়েন্ট সতর্কতার সীমার নিচে নেই।"
        />
      ) : (
        <ul className="space-y-2.5">
          {alerts.map((alert) => (
            <li key={alert.id} className="rounded-card border border-border bg-surface p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text-primary">{alert.productTitle}</p>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    {alert.variantLabel} · <span className="font-num">{alert.sku}</span>
                  </p>
                </div>
                <Badge tone={SEVERITY_TONES[alert.severity]} size="sm">
                  {alert.stock === 0 ? 'স্টক শেষ' : `${toBanglaDigits(alert.stock)}টি বাকি`}
                </Badge>
              </div>

              <form className="mt-2.5 flex items-end gap-2" onSubmit={(event) => submit(event, alert)}>
                <Input
                  label="নতুন স্টক"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  wrapperClassName="w-28"
                  value={drafts[alert.id] ?? ''}
                  placeholder={String(alert.stock)}
                  onChange={(event) =>
                    setDrafts((current) => ({ ...current, [alert.id]: event.target.value }))
                  }
                />
                <Button type="submit" size="sm" variant="outline">
                  আপডেট
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
