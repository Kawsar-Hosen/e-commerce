import { useEffect, useMemo, useState } from 'react';
import { PackagePlus, SlidersHorizontal } from 'lucide-react';
import type { Product, ProductStatus, StockStatus } from '@shobdox/shared-types';
import { useCurrentSeller } from '@/components/layout/SellerLayout';
import {
  Button,
  ButtonLink,
  Card,
  ConfirmDialog,
  EmptyState,
  PageHeader,
  Pagination,
  SearchInput,
  Select,
} from '@/components/ui';
import { BulkStockModal } from '@/features/seller/BulkStockModal';
import { ProductCardItem, ProductTableRow } from '@/features/seller/ProductRows';
import { useSellerProducts } from '@/hooks/useCatalog';
import { useDataStore } from '@/store/data.store';
import { toast } from '@/store/ui.store';
import { toBanglaDigits } from '@/lib/format';

/** The seller's own catalogue with search, filters, sort, bulk stock and row actions. */

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: 'all', label: 'সব অবস্থা' },
  { value: 'active', label: 'সক্রিয়' },
  { value: 'draft', label: 'খসড়া' },
  { value: 'archived', label: 'আর্কাইভ' },
];

const STOCK_OPTIONS = [
  { value: 'all', label: 'সব স্টক' },
  { value: 'in-stock', label: 'স্টকে আছে' },
  { value: 'low-stock', label: 'স্টক কম' },
  { value: 'out-of-stock', label: 'স্টক শেষ' },
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'সাম্প্রতিক আপডেট' },
  { value: 'price-desc', label: 'দাম: বেশি থেকে কম' },
  { value: 'price-asc', label: 'দাম: কম থেকে বেশি' },
  { value: 'sold-desc', label: 'সর্বাধিক বিক্রি' },
  { value: 'stock-asc', label: 'স্টক: কম আগে' },
];

type SortKey = 'recent' | 'price-desc' | 'price-asc' | 'sold-desc' | 'stock-asc';

export default function SellerProductsPage() {
  const seller = useCurrentSeller();
  const products = useSellerProducts(seller.id);
  const upsertProduct = useDataStore((state) => state.upsertProduct);
  const duplicateProduct = useDataStore((state) => state.duplicateProduct);
  const deleteProduct = useDataStore((state) => state.deleteProduct);

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | ProductStatus>('all');
  const [stock, setStock] = useState<'all' | StockStatus>('all');
  const [sort, setSort] = useState<SortKey>('recent');
  const [page, setPage] = useState(1);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Product>();

  useEffect(() => {
    setPage(1);
  }, [query, status, stock, sort]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = products.filter((product) => {
      const haystack = `${product.title} ${product.titleBn ?? ''} ${product.slug} ${product.variants
        .map((variant) => variant.sku)
        .join(' ')}`.toLowerCase();
      const matchesQuery = needle === '' || haystack.includes(needle);
      const matchesStatus = status === 'all' || product.status === status;
      const matchesStock = stock === 'all' || product.stockStatus === stock;
      return matchesQuery && matchesStatus && matchesStock;
    });

    switch (sort) {
      case 'price-desc':
        return [...list].sort((a, b) => b.price - a.price);
      case 'price-asc':
        return [...list].sort((a, b) => a.price - b.price);
      case 'sold-desc':
        return [...list].sort((a, b) => b.sold - a.sold);
      case 'stock-asc':
        return [...list].sort((a, b) => a.stock - b.stock);
      default:
        return [...list].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
    }
  }, [products, query, status, stock, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const totalStock = filtered.reduce((total, product) => total + product.stock, 0);

  const toggleStatus = (product: Product) => {
    const next: ProductStatus = product.status === 'active' ? 'archived' : 'active';
    upsertProduct({ ...product, status: next });
    toast({
      tone: 'success',
      title: next === 'active' ? 'পণ্য সক্রিয় করা হয়েছে' : 'পণ্য আর্কাইভ করা হয়েছে',
      description: product.titleBn ?? product.title,
    });
  };

  const duplicate = (product: Product) => {
    const copy = duplicateProduct(product.id);
    toast(
      copy
        ? { tone: 'success', title: 'কপি তৈরি হয়েছে (খসড়া)', description: copy.title }
        : { tone: 'error', title: 'কপি করা যায়নি' },
    );
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteProduct(pendingDelete.id);
    toast({ tone: 'success', title: 'পণ্য মুছে ফেলা হয়েছে', description: pendingDelete.titleBn ?? pendingDelete.title });
    setPendingDelete(undefined);
  };

  const handlers = { onToggleStatus: toggleStatus, onDuplicate: duplicate, onDelete: setPendingDelete };

  return (
    <div className="space-y-5">
      <PageHeader
        title="আমার পণ্য"
        description={`${toBanglaDigits(products.length)}টি পণ্য · মোট স্টক ${toBanglaDigits(totalStock)} ইউনিট`}
        actions={
          <>
            <Button variant="outline" leftIcon={<SlidersHorizontal aria-hidden className="size-4" />} onClick={() => setBulkOpen(true)}>
              বাল্ক স্টক
            </Button>
            <ButtonLink to="/seller/products/new" leftIcon={<PackagePlus aria-hidden className="size-4" />}>
              নতুন পণ্য
            </ButtonLink>
          </>
        }
      />

      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <SearchInput
            className="min-w-56 flex-1"
            value={query}
            onValueChange={setQuery}
            placeholder="নাম, SKU বা স্লাগ খুঁজুন…"
            label="পণ্য খুঁজুন"
          />
          <Select label="অবস্থা" className="w-36" options={STATUS_OPTIONS} value={status} onChange={(event) => setStatus(event.target.value as 'all' | ProductStatus)} />
          <Select label="স্টক" className="w-36" options={STOCK_OPTIONS} value={stock} onChange={(event) => setStock(event.target.value as 'all' | StockStatus)} />
          <Select label="সাজান" className="w-44" options={SORT_OPTIONS} value={sort} onChange={(event) => setSort(event.target.value as SortKey)} />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          title="কোনো পণ্য পাওয়া যায়নি"
          description="ফিল্টার বদলে দেখুন, অথবা নতুন পণ্য যোগ করুন।"
          action={
            <ButtonLink to="/seller/products/new" leftIcon={<PackagePlus aria-hidden className="size-4" />}>
              নতুন পণ্য
            </ButtonLink>
          }
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-card border border-border bg-surface shadow-xs lg:block">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">আপনার পণ্যের তালিকা</caption>
              <thead className="bg-surface-muted/70">
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-secondary">
                  <th scope="col" className="px-3 py-2.5 font-medium">পণ্য</th>
                  <th scope="col" className="px-3 py-2.5 text-right font-medium">দাম</th>
                  <th scope="col" className="px-3 py-2.5 text-right font-medium">স্টক</th>
                  <th scope="col" className="px-3 py-2.5 text-right font-medium">বিক্রি</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">অবস্থা</th>
                  <th scope="col" className="px-3 py-2.5 text-right font-medium">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((product) => (
                  <ProductTableRow key={product.id} product={product} {...handlers} />
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-2 lg:hidden">
            {paged.map((product) => (
              <ProductCardItem key={product.id} product={product} {...handlers} />
            ))}
          </ul>

          <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
          <p className="text-center text-xs text-text-secondary">
            {toBanglaDigits(filtered.length)}টি পণ্যের মধ্যে {toBanglaDigits(paged.length)}টি দেখানো হচ্ছে
          </p>
        </>
      )}

      <BulkStockModal open={bulkOpen} onClose={() => setBulkOpen(false)} products={products} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(undefined)}
        title="পণ্য মুছে ফেলবেন?"
        message={pendingDelete ? `“${pendingDelete.titleBn ?? pendingDelete.title}” স্থায়ীভাবে ডেমো ডেটা থেকে মুছে যাবে। এটি ফেরানো যাবে না।` : ''}
        confirmLabel="মুছে ফেলুন"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
