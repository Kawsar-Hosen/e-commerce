import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  BellRing,
  Check,
  Heart,
  MapPin,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Zap,
} from 'lucide-react';
import type { Product, ProductOption } from '@shobdox/shared-types';
import {
  defaultOptionSelection,
  findVariantByOptions,
  variantCompareAtPrice,
  variantSaving,
  variantStockStatus,
  variantUnitPrice,
} from '@shobdox/shared-business-logic';
import { formatTaka, toBanglaDigits } from '@shobdox/shared-utils';
import { cn } from '@/lib/cn';
import { Alert, Badge, Button, QuantityStepper, StockBadge } from '@/components/ui';
import { Price } from '@/components/ui/Display';
import { useCartStore } from '@/store/cart.store';
import { useWishlistStore } from '@/store/wishlist.store';
import { useDataStore } from '@/store/data.store';
import { toast } from '@/store/ui.store';
import { useCopyToClipboard } from '@/hooks/useCommon';

/**
 * The purchase panel: option pickers, the variant they resolve to, stock, and
 * the cart actions.
 *
 * Option resolution goes through `findVariantByOptions()` from the shared
 * business logic, so the price and stock a shopper sees here are the same ones
 * the cart and the order pipeline will use.
 */

export function ProductBuyBox({ product }: { product: Product }) {
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const wishlisted = useWishlistStore((state) => state.productIds.includes(product.id));
  const addNotification = useDataStore((state) => state.addNotification);
  const { copied, copy } = useCopyToClipboard();

  const [selection, setSelection] = useState<Record<string, string>>(() => defaultOptionSelection(product));
  const [quantity, setQuantity] = useState(1);

  const variant = useMemo(() => findVariantByOptions(product, selection), [product, selection]);
  // `variantUnitPrice` treats a zero variant price as "use the product price",
  // which `??` would miss because 0 is a real number.
  const unitPrice = variant ? variantUnitPrice(product, variant) : product.price;
  const compareAt = variant ? variantCompareAtPrice(product, variant) : product.compareAtPrice;
  const saving = variant ? variantSaving(product, variant) : 0;
  const stock = variant?.stock ?? 0;
  const stockStatus = variant ? variantStockStatus(variant) : product.stockStatus;
  const maxQuantity = Math.max(1, Math.min(10, stock));

  const selectValue = (optionId: string, valueId: string) => {
    setSelection((current) => ({ ...current, [optionId]: valueId }));
    setQuantity(1);
  };

  const addToCart = () => {
    if (!variant || variant.stock <= 0) return;
    addItem(product, variant, quantity);
  };

  const buyNow = () => {
    if (!variant || variant.stock <= 0) return;
    addItem(product, variant, quantity);
    navigate('/checkout');
  };

  const notifyWhenBack = () => {
    addNotification({
      id: `notify-${product.id}-${Date.now()}`,
      kind: 'price-drop',
      title: 'স্টক এলে জানানো হবে',
      body: `${product.titleBn ?? product.title} — পণ্যটি আবার স্টকে এলে এই ডেমো নোটিফিকেশনটি দেখানো হবে।`,
      createdAt: new Date().toISOString(),
      read: false,
      href: `/product/${product.slug}`,
      image: product.thumbnail,
    });

    toast({
      tone: 'success',
      title: 'অনুরোধ সংরক্ষিত',
      description: 'ডেমোতে নোটিফিকেশন শুধু আপনার ব্রাউজারে জমা থাকে — কোনো ইমেইল বা SMS পাঠানো হয় না।',
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        {product.brandId ? (
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{product.shortDescription}</p>
        ) : null}
        <h1 className="text-3xl font-bold leading-snug text-text-primary">
          {product.titleBn ?? product.title}
        </h1>
        <p className="text-sm text-text-secondary">{product.title}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Price
          value={unitPrice}
          compareAt={compareAt}
          discountPercent={product.discountPercent}
          size="xl"
        />
        {saving > 0 ? (
          <Badge tone="success">সাশ্রয় {formatTaka(saving)}</Badge>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <StockBadge status={stockStatus} stock={stock} />
        {variant ? (
          <span className="font-num text-xs text-text-muted">
            SKU: {variant.sku}
          </span>
        ) : null}
        <span className="font-num text-xs text-text-muted">
          {toBanglaDigits(product.sold)}টি বিক্রি হয়েছে
        </span>
      </div>

      {!variant && product.options.length > 0 ? (
        <Alert tone="warning" title="এই সমন্বয়টি পাওয়া যাচ্ছে না">
          নির্বাচিত অপশনগুলোর কোনো ভ্যারিয়েন্ট নেই। অন্য একটি সমন্বয় বেছে নিন।
        </Alert>
      ) : null}

      {/* options */}
      {product.options.map((option) => (
        <OptionPicker
          key={option.id}
          option={option}
          selectedValueId={selection[option.id]}
          onSelect={(valueId) => selectValue(option.id, valueId)}
          product={product}
        />
      ))}

      {/* quantity + actions */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-primary">পরিমাণ</span>
          <QuantityStepper
            value={quantity}
            min={1}
            max={maxQuantity}
            onDecrease={() => setQuantity((value) => Math.max(1, value - 1))}
            onIncrease={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}
          />
        </div>

        {stock > 0 && stock <= 10 ? (
          <span className="text-xs font-medium text-warning">
            মাত্র {toBanglaDigits(stock)}টি বাকি
          </span>
        ) : null}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Button
          size="lg"
          fullWidth
          onClick={addToCart}
          disabled={stock <= 0 || !variant}
          leftIcon={<ShoppingCart aria-hidden className="size-4" />}
        >
          কার্টে যোগ করুন
        </Button>

        <Button
          size="lg"
          variant="accent"
          fullWidth
          onClick={buyNow}
          disabled={stock <= 0 || !variant}
          leftIcon={<Zap aria-hidden className="size-4" />}
        >
          এখনই কিনুন
        </Button>
      </div>

      {stock <= 0 ? (
        <Button
          variant="outline"
          fullWidth
          onClick={notifyWhenBack}
          leftIcon={<BellRing aria-hidden className="size-4" />}
        >
          স্টক এলে জানান
        </Button>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          variant="ghost"
          onClick={() => toggleWishlist(product.id, product.titleBn ?? product.title)}
          aria-pressed={wishlisted}
          leftIcon={<Heart aria-hidden className={cn('size-4', wishlisted && 'fill-error text-error')} />}
        >
          {wishlisted ? 'উইশলিস্টে আছে' : 'উইশলিস্টে রাখুন'}
        </Button>

        <Button
          variant="ghost"
          onClick={() => {
            copy(`${window.location.origin}/product/${product.slug}`);
            toast({
              tone: copied ? 'info' : 'success',
              title: 'লিংক কপি হয়েছে',
              description: 'পণ্যটির লিংক ক্লিপবোর্ডে কপি করা হয়েছে।',
            });
          }}
          leftIcon={<Share2 aria-hidden className="size-4" />}
        >
          শেয়ার করুন
        </Button>
      </div>

      {/* delivery & policy */}
      <ul className="space-y-2 rounded-card border border-border bg-surface p-3 text-sm">
        <li className="flex items-start gap-2 text-text-secondary">
          <Truck aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>
            ঢাকার ভেতরে <span className="font-num">{toBanglaDigits(product.delivery.insideDhaka.min)}–{toBanglaDigits(product.delivery.insideDhaka.max)}</span> দিনে ডেলিভারি, চার্জ{' '}
            <span className="font-num">{formatTaka(product.delivery.deliveryFeeInsideDhaka)}</span>।
          </span>
        </li>
        <li className="flex items-start gap-2 text-text-secondary">
          <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>
            ঢাকার বাইরে <span className="font-num">{toBanglaDigits(product.delivery.outsideDhaka.min)}–{toBanglaDigits(product.delivery.outsideDhaka.max)}</span> দিনে ডেলিভারি, চার্জ{' '}
            <span className="font-num">{formatTaka(product.delivery.deliveryFeeOutsideDhaka)}</span>।
            {product.delivery.cashOnDeliveryAvailable ? ' ক্যাশ অন ডেলিভারি সুবিধা আছে।' : ''}
          </span>
        </li>
        <li className="flex items-start gap-2 text-text-secondary">
          <RotateCcw aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>
            <span className="font-num">{toBanglaDigits(product.returnPolicyDays)}</span> দিনের মধ্যে সহজ রিটার্ন (শর্ত প্রযোজ্য)।
          </span>
        </li>
        {product.warranty ? (
          <li className="flex items-start gap-2 text-text-secondary">
            <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{product.warranty}</span>
          </li>
        ) : null}
      </ul>

      <p className="text-xs text-text-muted">
        ডেমো পণ্য — এখান থেকে কোনো প্রকৃত অর্ডার, পেমেন্ট বা ডেলিভারি হয় না।{' '}
        <Link to="/help/payment" className="text-primary hover:underline">
          পেমেন্ট ও ডেমো সম্পর্কে জানুন
        </Link>
        ।
      </p>
    </div>
  );
}

/* --------------------------------------------------------------- options */

function OptionPicker({
  option,
  selectedValueId,
  onSelect,
  product,
}: {
  option: ProductOption;
  selectedValueId?: string;
  onSelect: (valueId: string) => void;
  product: Product;
}) {
  const label = option.nameBn ?? option.name;
  const groupId = `option-${product.id}-${option.id}`;

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-text-primary">
        {label}
        {selectedValueId ? (
          <span className="ml-2 font-normal text-text-secondary">
            {option.values.find((value) => value.id === selectedValueId)?.labelBn ??
              option.values.find((value) => value.id === selectedValueId)?.label}
          </span>
        ) : null}
      </legend>

      {option.display === 'select' ? (
        <select
          id={groupId}
          value={selectedValueId ?? ''}
          onChange={(event) => onSelect(event.target.value)}
          className="h-10 w-full rounded-input border border-border-strong bg-surface px-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {option.values.map((value) => (
            <option key={value.id} value={value.id}>
              {value.labelBn ?? value.label}
              {value.priceDelta ? ` (+${formatTaka(value.priceDelta)})` : ''}
            </option>
          ))}
        </select>
      ) : (
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
          {option.values.map((value) => {
            const selected = value.id === selectedValueId;
            const soldOut = !product.variants.some(
              (variant) => variant.optionValues[option.id] === value.id && variant.stock > 0,
            );

            return (
              <button
                key={value.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onSelect(value.id)}
                disabled={soldOut}
                title={soldOut ? 'স্টক নেই' : undefined}
                className={cn(
                  'relative inline-flex items-center gap-2 rounded-button border px-3 py-2 text-sm font-medium transition-colors',
                  selected
                    ? 'border-primary bg-primary-soft text-primary-dark'
                    : 'border-border-strong bg-surface text-text-primary hover:border-primary',
                  soldOut && 'cursor-not-allowed opacity-45',
                )}
              >
                {option.display === 'swatch' ? (
                  <span
                    aria-hidden
                    className="size-4 rounded-full border border-black/10"
                    style={{ backgroundColor: value.hex ?? '#E2E8F0' }}
                  />
                ) : null}

                <span>{value.labelBn ?? value.label}</span>

                {value.priceDelta ? (
                  <span className="font-num text-xs text-text-secondary">
                    +{formatTaka(value.priceDelta)}
                  </span>
                ) : null}

                {selected ? <Check aria-hidden className="size-3.5" /> : null}

                {soldOut ? (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="absolute inset-x-0 top-1/2 h-px bg-border-strong" aria-hidden />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </fieldset>
  );
}
