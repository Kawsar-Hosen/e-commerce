import { useMemo } from 'react';
import { Card } from '@/components/ui';
import { optionValueId } from '@shobdox/shared-business-logic';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { OPTIONAL_NUMBER, type ProductFormReturn } from './productFormModel';

/**
 * Editable variant matrix.
 *
 * One row per generated combination. SKU, price, compare-at price and stock are
 * hand-editable; the combination itself is derived from the option editor, so
 * it renders as text. A table on `md`+, cards on phones — no sideways scroll.
 */

export function VariantMatrixEditor({ form }: { form: ProductFormReturn }) {
  const {
    register,
    watch,
    formState: { errors },
  } = form;
  // `watch` returns a fresh array when the fallback kicks in, which would make
  // every memo below recompute each render — memoise the fallback instead.
  const watchedOptions = watch('options');
  const options = useMemo(() => watchedOptions ?? [], [watchedOptions]);
  const watchedVariants = watch('variants');
  const variants = useMemo(() => watchedVariants ?? [], [watchedVariants]);

  const combinationLabels = useMemo(() => {
    const labelOfValue = new Map<string, string>();
    for (const option of options) {
      for (const value of option.values) {
        labelOfValue.set(optionValueId(option.id, value.label), value.labelBn || value.label);
      }
    }
    return (optionValues: Record<string, string>) => {
      const labels = Object.values(optionValues).map((valueId) => labelOfValue.get(valueId) ?? valueId);
      return labels.filter(Boolean).join(' / ') || 'ডিফল্ট';
    };
  }, [options]);

  const totalStock = variants.reduce((sum, variant) => sum + (Number.isFinite(variant.stock) ? variant.stock : 0), 0);

  return (
    <Card as="section">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">ভ্যারিয়েন্ট ম্যাট্রিক্স</h2>
          <p className="mt-0.5 text-sm text-text-secondary">
            এখানকার সারিগুলোই সংরক্ষিত হবে — মোট স্টক{' '}
            <span className="font-num font-semibold text-text-primary">{toBanglaDigits(totalStock)}</span>।
          </p>
        </div>
        <span className="rounded-chip bg-surface-muted px-2.5 py-1 text-sm text-text-secondary">
          {toBanglaDigits(variants.length)}টি ভ্যারিয়েন্ট
        </span>
      </div>

      {variants.length === 0 ? (
        <p className="mt-3 text-sm text-error" role="alert">
          {errors.variants?.message ?? errors.variants?.root?.message ?? 'কমপক্ষে একটি ভ্যারিয়েন্ট প্রয়োজন।'}
        </p>
      ) : (
        <>
          <div className="mt-4 hidden md:block">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">ভ্যারিয়েন্টের SKU, দাম ও স্টক</caption>
              <thead>
                <tr className="border-b border-border text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  <th scope="col" className="px-2 py-2">
                    কম্বিনেশন
                  </th>
                  <th scope="col" className="px-2 py-2">
                    SKU
                  </th>
                  <th scope="col" className="px-2 py-2">
                    দাম (৳)
                  </th>
                  <th scope="col" className="px-2 py-2">
                    আগের দাম (৳)
                  </th>
                  <th scope="col" className="px-2 py-2">
                    স্টক
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {variants.map((variant, index) => (
                  <tr key={variant.id || index}>
                    <td className="px-2 py-2 text-text-secondary">{combinationLabels(variant.optionValues)}</td>
                    <td className="px-2 py-2">
                      <input
                        aria-label={`ভ্যারিয়েন্ট ${index + 1} এর SKU`}
                        className="h-9 w-32 rounded-input border border-border-strong bg-surface px-2 font-num text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                        {...register(`variants.${index}.sku`)}
                      />
                      {errors.variants?.[index]?.sku?.message ? (
                        <p className="mt-1 text-xs font-medium text-error">{errors.variants[index]?.sku?.message}</p>
                      ) : null}
                    </td>
                    <td className="px-2 py-2">
                      <input
                        aria-label={`ভ্যারিয়েন্ট ${index + 1} এর দাম`}
                        type="number"
                        min={1}
                        className="h-9 w-24 rounded-input border border-border-strong bg-surface px-2 font-num text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                        {...register(`variants.${index}.price`, { valueAsNumber: true })}
                      />
                      {errors.variants?.[index]?.price?.message ? (
                        <p className="mt-1 text-xs font-medium text-error">{errors.variants[index]?.price?.message}</p>
                      ) : null}
                    </td>
                    <td className="px-2 py-2">
                      <input
                        aria-label={`ভ্যারিয়েন্ট ${index + 1} এর আগের দাম`}
                        type="number"
                        min={1}
                        placeholder="—"
                        className="h-9 w-24 rounded-input border border-border-strong bg-surface px-2 font-num text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                        {...register(`variants.${index}.compareAtPrice`, OPTIONAL_NUMBER)}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        aria-label={`ভ্যারিয়েন্ট ${index + 1} এর স্টক`}
                        type="number"
                        min={0}
                        className="h-9 w-20 rounded-input border border-border-strong bg-surface px-2 font-num text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                        {...register(`variants.${index}.stock`, { valueAsNumber: true })}
                      />
                      {errors.variants?.[index]?.stock?.message ? (
                        <p className="mt-1 text-xs font-medium text-error">{errors.variants[index]?.stock?.message}</p>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-4 space-y-3 md:hidden">
            {variants.map((variant, index) => (
              <li key={variant.id || index} className="rounded-card border border-border p-3">
                <p className="text-sm font-medium text-text-primary">{combinationLabels(variant.optionValues)}</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input
                    aria-label={`ভ্যারিয়েন্ট ${index + 1} এর SKU`}
                    placeholder="SKU"
                    className="h-10 rounded-input border border-border-strong bg-surface px-2 font-num text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                    {...register(`variants.${index}.sku`)}
                  />
                  <input
                    aria-label={`ভ্যারিয়েন্ট ${index + 1} এর দাম`}
                    placeholder="দাম"
                    type="number"
                    min={1}
                    className="h-10 rounded-input border border-border-strong bg-surface px-2 font-num text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                    {...register(`variants.${index}.price`, { valueAsNumber: true })}
                  />
                  <input
                    aria-label={`ভ্যারিয়েন্ট ${index + 1} এর আগের দাম`}
                    placeholder="আগের দাম"
                    type="number"
                    min={1}
                    className="h-10 rounded-input border border-border-strong bg-surface px-2 font-num text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                    {...register(`variants.${index}.compareAtPrice`, OPTIONAL_NUMBER)}
                  />
                  <input
                    aria-label={`ভ্যারিয়েন্ট ${index + 1} এর স্টক`}
                    placeholder="স্টক"
                    type="number"
                    min={0}
                    className="h-10 rounded-input border border-border-strong bg-surface px-2 font-num text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                    {...register(`variants.${index}.stock`, { valueAsNumber: true })}
                  />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
