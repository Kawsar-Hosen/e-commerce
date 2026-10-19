import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Home, LayoutGrid, PackageSearch, Search } from 'lucide-react';
import { Button, ButtonLink, Card, PageHeader, SearchInput } from '@/components/ui';
import { useProducts, useTopLevelCategories } from '@/hooks/useCatalog';
import { bestSellers } from '@shobdox/shared-business-logic';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { ProductRail } from '@/features/checkout/ProductRail';

/** Friendly Bangla 404 with a working search box and shortcuts back in. */
export default function NotFoundPage() {
  const navigate = useNavigate();
  const products = useProducts();
  const categories = useTopLevelCategories();
  const [query, setQuery] = useState('');

  const popular = bestSellers(products, 4);

  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `/shop?q=${encodeURIComponent(trimmed)}` : '/shop');
  };

  return (
    <>
      <PageHeader
        title="পেজটি খুঁজে পাওয়া যায়নি"
        description="ঠিকানাটি হয়তো ভুল, অথবা পেজটি সরিয়ে ফেলা হয়েছে।"
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        <Card className="text-center">
          <p aria-hidden className="font-num text-6xl font-extrabold text-primary lg:text-7xl">
            {toBanglaDigits(404)}
          </p>
          <p className="mt-2 break-words text-3xl font-bold text-text-primary">উফ! পথ হারিয়ে গেছেন</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
            তবুও হাল ছাড়বেন না — নিচে পণ্য খুঁজুন, অথবা হোমপেজ বা ক্যাটাগরি থেকে আবার শুরু করুন।
          </p>

          <form onSubmit={onSearch} role="search" className="mx-auto mt-4 flex max-w-md flex-col gap-2 sm:flex-row">
            <div className="min-w-0 sm:flex-1">
              <SearchInput
                value={query}
                onValueChange={setQuery}
                placeholder="পণ্য, ব্র্যান্ড বা ক্যাটাগরি…"
                label="পণ্য খুঁজুন"
              />
            </div>
            <Button type="submit" leftIcon={<Search aria-hidden className="size-4" />}>
              খুঁজুন
            </Button>
          </form>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <ButtonLink to="/" leftIcon={<Home aria-hidden className="size-4" />}>
              হোমপেজে যান
            </ButtonLink>
            <ButtonLink to="/categories" variant="outline" leftIcon={<LayoutGrid aria-hidden className="size-4" />}>
              ক্যাটাগরি দেখুন
            </ButtonLink>
            <ButtonLink to="/help/faq" variant="ghost" leftIcon={<PackageSearch aria-hidden className="size-4" />}>
              সহায়তা কেন্দ্র
            </ButtonLink>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-text-primary">ক্যাটাগরি থেকে খুঁজুন</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {categories.map((category) => (
              <li key={category.id}>
                <ButtonLink to={`/category/${category.slug}`} variant="outline" size="sm">
                  {category.nameBn}
                </ButtonLink>
              </li>
            ))}
          </ul>

          <h2 className="mt-4 text-lg font-bold text-text-primary">জনপ্রিয় পাতা</h2>
          <ul className="mt-2 space-y-1.5">
            <li>
              <ButtonLink to="/shop" variant="link" size="sm">
                সব পণ্য
              </ButtonLink>
            </li>
            <li>
              <ButtonLink to="/track" variant="link" size="sm">
                অর্ডার ট্র্যাকিং
              </ButtonLink>
            </li>
            <li>
              <ButtonLink to="/cart" variant="link" size="sm">
                কার্ট
              </ButtonLink>
            </li>
            <li>
              <ButtonLink to="/help/contact" variant="link" size="sm">
                যোগাযোগ
              </ButtonLink>
            </li>
          </ul>
        </Card>
      </div>

      <ProductRail title="সবচেয়ে জনপ্রিয় পণ্য" products={popular} href="/shop" />
    </>
  );
}
