import { useMemo, useState } from 'react';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import {
  Alert,
  Breadcrumbs,
  Button,
  ButtonLink,
  Card,
  ConfirmDialog,
  EmptyState,
  PageHeader,
} from '@/components/ui';
import { byIds } from '@shobdox/shared-business-logic';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { ProductCard } from '@/features/catalog/ProductCard';
import { useProductsByIds } from '@/hooks/useCatalog';
import { useCartStore } from '@/store/cart.store';
import { useWishlistStore } from '@/store/wishlist.store';
import { toast } from '@/store/ui.store';

/**
 * Saved products, stored in this browser only (`wishlist.store` persists ids).
 *
 * Cards come from the shared catalogue feature, so wishlist add/remove behaves
 * exactly like the shop grid and stock rules live in one place.
 */
export default function WishlistPage() {
  const productIds = useWishlistStore((state) => state.productIds);
  const clearWishlist = useWishlistStore((state) => state.clear);
  const addItem = useCartStore((state) => state.addItem);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const saved = useProductsByIds(productIds);
  // Keep the order the shopper saved them in, and drop products that no longer exist.
  const products = useMemo(() => byIds(saved, productIds), [saved, productIds]);

  const unavailableCount = products.filter((product) => !product.variants.some((variant) => variant.stock > 0)).length;

  const onAddAll = () => {
    let added = 0;
    const skipped: string[] = [];

    for (const product of products) {
      const variant = product.variants.find((candidate) => candidate.stock > 0);
      if (!variant) {
        skipped.push(product.titleBn ?? product.title);
        continue;
      }
      addItem(product, variant, 1);
      added += 1;
    }

    if (added === 0) {
      toast({
        tone: 'warning',
        title: 'কোনো পণ্য কার্টে যোগ করা যায়নি',
        description: 'উইশলিস্টের সব পণ্যই এখন স্টকে নেই।',
      });
      return;
    }

    toast({
      tone: 'success',
      title: `${toBanglaDigits(added)} টি পণ্য কার্টে যোগ হয়েছে`,
      description:
        skipped.length > 0
          ? `স্টকে নেই বলে বাদ পড়েছে: ${skipped.slice(0, 3).join(', ')}${skipped.length > 3 ? '…' : ''}`
          : undefined,
    });
  };

  const breadcrumbs = <Breadcrumbs items={[{ label: 'হোম', href: '/' }, { label: 'উইশলিস্ট' }]} />;

  if (products.length === 0) {
    return (
      <>
        <PageHeader title="উইশলিস্ট" breadcrumbs={breadcrumbs} />
        <EmptyState
          title="উইশলিস্ট খালি"
          description={
            productIds.length > 0
              ? 'সেভ করা পণ্যগুলো আর পাওয়া যাচ্ছে না — সেগুলো সরিয়ে ফেলা হয়েছে।'
              : 'হৃদয় আইকনে ট্যাপ করে পছন্দের পণ্য এখানে সেভ করে রাখুন।'
          }
          icon={<Heart aria-hidden className="size-6" />}
          action={
            <>
              <ButtonLink to="/shop">কেনাকাটা শুরু করুন</ButtonLink>
              {productIds.length > 0 ? (
                <Button variant="outline" onClick={() => clearWishlist()}>
                  খালি তালিকা পরিষ্কার করুন
                </Button>
              ) : null}
            </>
          }
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="উইশলিস্ট"
        description={`${toBanglaDigits(products.length)} টি সেভ করা পণ্য — শুধু এই ব্রাউজারে সংরক্ষিত।`}
        breadcrumbs={breadcrumbs}
        actions={
          <>
            <Button
              variant="secondary"
              leftIcon={<ShoppingCart aria-hidden className="size-4" />}
              onClick={onAddAll}
              disabled={products.length === unavailableCount}
            >
              সব কার্টে যোগ করুন
            </Button>
            <Button
              variant="ghost"
              leftIcon={<Trash2 aria-hidden className="size-4" />}
              onClick={() => setConfirmOpen(true)}
            >
              সব সরান
            </Button>
          </>
        }
      />

      <div className="space-y-4">
        <Alert tone="info" title="উইশলিস্ট শুধু এই ব্রাউজারে">
          অন্য ডিভাইস বা ব্রাউজারে এই তালিকা দেখা যাবে না, আর ডেমো ডেটা রিসেট করলে তালিকাটিও মুছে যাবে।
        </Alert>

        {unavailableCount > 0 ? (
          <Alert tone="warning" title={`${toBanglaDigits(unavailableCount)} টি পণ্য এখন স্টকে নেই`}>
            “সব কার্টে যোগ করুন” চাপলে স্টকে থাকা পণ্যগুলোই যোগ হবে — বাকিগুলো বাদ পড়ে যাবে এবং জানিয়ে দেওয়া হবে।
          </Alert>
        ) : null}

        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <li key={product.id} className="min-w-0">
              <ProductCard product={product} className="h-full" />
            </li>
          ))}
        </ul>

        <Card className="text-sm text-text-secondary">
          হৃদয় আইকনে চাপ দিলে পণ্যটি উইশলিস্ট থেকে সরে যাবে আর “কার্টে যোগ” চাপলে প্রথম স্টকে থাকা ভ্যারিয়েন্টটি
          কার্টে যাবে। স্টক শেষ হলে কার্টে যোগ বন্ধ থাকে।
        </Card>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="উইশলিস্টের সব পণ্য সরাবেন?"
        message="সেভ করা সব পণ্য উইশলিস্ট থেকে মুছে যাবে। এটি ফেরানো যাবে না।"
        confirmLabel="হ্যাঁ, সব সরান"
        onConfirm={() => {
          clearWishlist();
          setConfirmOpen(false);
          toast({ tone: 'info', title: 'উইশলিস্ট খালি করা হয়েছে' });
        }}
      />
    </>
  );
}
