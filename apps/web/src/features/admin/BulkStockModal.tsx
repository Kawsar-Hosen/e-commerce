import { useEffect, useState } from 'react';
import type { Product } from '@shobdox/shared-types';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { Button, Input, Modal } from '@/components/ui';
import { useDataStore } from '@/store/data.store';
import { toast } from '@/store/ui.store';

/**
 * Bulk stock update.
 *
 * One row per variant of every selected product. Values are held as strings so
 * a half-typed number never becomes `NaN`; only changed rows are written, all
 * through `setProductStock()` so `recalculateProduct()` keeps prices and stock
 * status in sync.
 */
export function BulkStockModal({
  open,
  onClose,
  products,
}: {
  open: boolean;
  onClose: () => void;
  products: Product[];
}) {
  const [draft, setDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    const next: Record<string, string> = {};
    for (const product of products) {
      for (const variant of product.variants) next[variant.id] = String(variant.stock);
    }
    setDraft(next);
  }, [open, products]);

  const apply = () => {
    const store = useDataStore.getState();
    let changed = 0;

    for (const product of products) {
      for (const variant of product.variants) {
        const raw = draft[variant.id];
        if (raw === undefined || raw === '') continue;
        const value = Math.max(0, Math.floor(Number(raw)));
        if (!Number.isFinite(value) || value === variant.stock) continue;
        store.setProductStock(product.id, variant.id, value);
        changed += 1;
      }
    }

    toast(
      changed > 0
        ? { tone: 'success', title: `${toBanglaDigits(changed)}টি ভ্যারিয়েন্টের স্টক আপডেট হয়েছে` }
        : { tone: 'info', title: 'কোনো পরিবর্তন করা হয়নি' },
    );
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="বাল্ক স্টক আপডেট"
      description={`${toBanglaDigits(products.length)}টি পণ্যের ভ্যারিয়েন্ট স্টক একসাথে ঠিক করুন।`}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            বাতিল
          </Button>
          <Button onClick={apply}>স্টক সংরক্ষণ করুন</Button>
        </>
      }
    >
      {products.length === 0 ? (
        <p className="text-sm text-text-secondary">আগে তালিকা থেকে অন্তত একটি পণ্য নির্বাচন করুন।</p>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <section key={product.id} className="rounded-card border border-border p-3">
              <h3 className="text-sm font-semibold text-text-primary">{product.titleBn ?? product.title}</h3>
              <p className="font-num text-xs text-text-secondary">{product.slug}</p>

              <div className="mt-2 grid gap-3 md:grid-cols-2">
                {product.variants.map((variant) => (
                  <Input
                    key={variant.id}
                    label={`${variant.sku} · ${Object.values(variant.optionValues).length > 0 ? Object.values(variant.optionValues).join(' / ') : 'ডিফল্ট'}`}
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={draft[variant.id] ?? ''}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, [variant.id]: event.target.value }))
                    }
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </Modal>
  );
}
