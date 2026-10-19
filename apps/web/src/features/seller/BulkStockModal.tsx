import { useEffect, useMemo, useState } from 'react';
import { PackageSearch } from 'lucide-react';
import type { Product } from '@shobdox/shared-types';
import { Button, EmptyState, Input, Modal } from '@/components/ui';
import { useDataStore } from '@/store/data.store';
import { toast } from '@/store/ui.store';
import { toBanglaDigits } from '@/lib/format';
import { variantLabel } from './utils';

/**
 * Bulk stock editor: one number per variant, applied in a single pass.
 *
 * Values only become visible in the catalogue after "প্রয়োগ করুন" — cancelling
 * leaves the dataset untouched.
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
  const setProductStock = useDataStore((state) => state.setProductStock);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) setDrafts({});
  }, [open]);

  const rows = useMemo(
    () =>
      products.flatMap((product) =>
        product.variants.map((variant) => ({
          key: `${product.id}:${variant.id}`,
          product,
          variant,
        })),
      ),
    [products],
  );

  const changes = rows.filter(({ variant }) => {
    const raw = drafts[variant.id];
    return raw !== undefined && raw !== '' && Number(raw) !== variant.stock && !Number.isNaN(Number(raw));
  });

  const apply = () => {
    changes.forEach(({ product, variant }) => {
      const raw = drafts[variant.id];
      if (raw === undefined) return;
      setProductStock(product.id, variant.id, Number(raw));
    });
    toast({
      tone: 'success',
      title: 'স্টক আপডেট হয়েছে',
      description: `${toBanglaDigits(changes.length)}টি ভ্যারিয়েন্টের স্টক সংরক্ষণ করা হয়েছে`,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="বাল্ক স্টক আপডেট"
      description="যেসব ভ্যারিয়েন্টের স্টক বদলাতে চান সেগুলোর নতুন সংখ্যা লিখে প্রয়োগ করুন।"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            বাতিল
          </Button>
          <Button onClick={apply} disabled={changes.length === 0}>
            প্রয়োগ করুন ({toBanglaDigits(changes.length)})
          </Button>
        </>
      }
    >
      {rows.length === 0 ? (
        <EmptyState
          title="কোনো ভ্যারিয়েন্ট নেই"
          description="আগে একটি পণ্য যোগ করুন, তারপর স্টক আপডেট করা যাবে।"
          icon={<PackageSearch aria-hidden className="size-6" />}
        />
      ) : (
        <ul className="space-y-4">
          {products.map((product) => (
            <li key={product.id}>
              <p className="text-sm font-semibold text-text-primary">{product.titleBn ?? product.title}</p>
              <ul className="mt-2 space-y-2">
                {product.variants.map((variant) => (
                  <li key={variant.id} className="flex items-end gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs text-text-secondary">
                        {variantLabel(product, variant)} · <span className="font-num">{variant.sku}</span>
                      </p>
                      <p className="font-num text-xs text-text-muted">বর্তমান: {toBanglaDigits(variant.stock)}</p>
                    </div>
                    <Input
                      label={`${variant.sku} স্টক`}
                      type="number"
                      min={0}
                      inputMode="numeric"
                      wrapperClassName="w-28"
                      placeholder={String(variant.stock)}
                      value={drafts[variant.id] ?? ''}
                      onChange={(event) =>
                        setDrafts((current) => ({ ...current, [variant.id]: event.target.value }))
                      }
                    />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
