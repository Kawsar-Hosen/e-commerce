import { PackagePlus } from 'lucide-react';
import type { InventoryAlert } from '@shobdox/shared-types';
import { LOW_STOCK_THRESHOLD } from '@shobdox/shared-business-logic';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { Badge, Button, Card, EmptyState, SectionHeader, type Tone } from '@/components/ui';
import { useDataStore } from '@/store/data.store';
import { toast } from '@/store/ui.store';

/** Units the quick action adds in one tap. */
export const RESTOCK_UNITS = 25;

const SEVERITY_META: Record<InventoryAlert['severity'], { label: string; tone: Tone }> = {
  critical: { label: 'স্টক শেষ', tone: 'danger' },
  warning: { label: 'খুব কম', tone: 'warning' },
  info: { label: 'কম', tone: 'info' },
};

/**
 * Inventory alerts with a working restock action.
 *
 * The alert carries the SKU rather than the variant id, so the matching variant
 * is looked up on the live product before `setProductStock()` writes through
 * `recalculateProduct()` — the same path the product form uses.
 */
export function InventoryAlertsCard({
  alerts,
  limit = 6,
  title = 'স্টক সতর্কতা',
  description = `থ্রেশহোল্ড ${toBanglaDigits(LOW_STOCK_THRESHOLD)} বা তার নিচে থাকা ভ্যারিয়েন্ট`,
}: {
  alerts: InventoryAlert[];
  limit?: number;
  title?: string;
  description?: string;
}) {
  const visible = alerts.slice(0, limit);

  const restock = (alert: InventoryAlert) => {
    const product = useDataStore.getState().products.find((candidate) => candidate.id === alert.productId);
    const variant = product?.variants.find((candidate) => candidate.sku === alert.sku);

    if (!product || !variant) {
      toast({ tone: 'error', title: 'ভ্যারিয়েন্ট খুঁজে পাওয়া যায়নি', description: alert.sku });
      return;
    }

    useDataStore.getState().setProductStock(product.id, variant.id, variant.stock + RESTOCK_UNITS);
    toast({
      tone: 'success',
      title: 'স্টক বাড়ানো হয়েছে',
      description: `${product.titleBn ?? product.title} — ${alert.variantLabel}: +${toBanglaDigits(RESTOCK_UNITS)}`,
    });
  };

  return (
    <Card>
      <SectionHeader title={title} subtitle={description} />

      {visible.length === 0 ? (
        <EmptyState title="কোনো সতর্কতা নেই" description="সব ভ্যারিয়েন্টের স্টক নিরাপদ সীমায় আছে।" />
      ) : (
        <ul className="divide-y divide-divider">
          {visible.map((alert) => {
            const meta = SEVERITY_META[alert.severity];
            return (
              <li key={alert.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text-primary">{alert.productTitle}</p>
                  <p className="text-xs text-text-secondary">
                    {alert.variantLabel} · <span className="font-num">{alert.sku}</span>
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Badge tone={meta.tone} size="sm">
                    {meta.label} · {toBanglaDigits(alert.stock)}
                  </Badge>
                  <Button
                    size="sm"
                    variant="secondary"
                    leftIcon={<PackagePlus aria-hidden className="size-3.5" />}
                    onClick={() => restock(alert)}
                  >
                    স্টক বাড়ান
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
