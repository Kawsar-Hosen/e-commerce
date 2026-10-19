import { useEffect, useMemo, useState } from 'react';
import { Download, PackagePlus, Plus } from 'lucide-react';
import type { Product, ProductStatus } from '@shobdox/shared-types';
import { LOW_STOCK_THRESHOLD } from '@shobdox/shared-business-logic';
import { toBanglaDigits } from '@shobdox/shared-utils';
import {
  Button,
  ButtonLink,
  Card,
  ConfirmDialog,
  PageHeader,
  Pagination,
  SearchInput,
  SegmentedControl,
  Select,
  Thumb,
} from '@/components/ui';
import { useCategories, useProducts } from '@/hooks/useCatalog';
import { useDebouncedValue } from '@/hooks/useCommon';
import { useDataStore } from '@/store/data.store';
import { toast } from '@/store/ui.store';
import { ResponsiveTable } from '@/features/admin/ResponsiveTable';
import { ProductStatusBadge } from '@/features/admin/StatusBadges';
import { buildProductColumns } from '@/features/admin/productColumns';
import { BulkStockModal } from '@/features/admin/BulkStockModal';
import { exportCsv } from '@/features/admin/csv';
import { usePagination } from '@/features/admin/usePagination';

type StatusFilter = 'all' | ProductStatus;
type StockFilter = 'all' | 'low' | 'out';

/** Product list: search, filters, bulk stock, row actions and CSV export. */
export default function AdminProductsPage() {
  const products = useProducts();
  const categories = useCategories();

  const [search, setSearch] = useState('');
  const searchTerm = useDebouncedValue(search);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [stock, setStock] = useState<StockFilter>('all');
  const [categoryId, setCategoryId] = useState('all');
  const [selected, setSelected] = useState<Record<string, true>>({});
  const [bulkOpen, setBulkOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return products
      .filter((product) => {
        if (status !== 'all' && product.status !== status) return false;
        if (categoryId !== 'all' && product.categoryId !== categoryId) return false;
        if (stock === 'out' && product.stockStatus !== 'out-of-stock') return false;
        if (
          stock === 'low' &&
          !(product.stock > 0 && product.variants.some((variant) => variant.stock <= LOW_STOCK_THRESHOLD))
        ) {
          return false;
        }
        if (term) {
          const haystack = `${product.title} ${product.titleBn ?? ''} ${product.variants
            .map((variant) => variant.sku)
            .join(' ')}`.toLowerCase();
          if (!haystack.includes(term)) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [products, searchTerm, status, stock, categoryId]);

  const { page, totalPages, pageRows, totalRows, setPage, resetPage } = usePagination(filtered);
  useEffect(() => resetPage(), [searchTerm, status, stock, categoryId, resetPage]);

  const selectedIds = Object.keys(selected);
  const selectedProducts = useMemo(() => products.filter((product) => selected[product.id]), [products, selected]);
  const allPageSelected = pageRows.length > 0 && pageRows.every((product) => selected[product.id]);

  const toggle = (product: Product) =>
    setSelected((current) => {
      const next = { ...current };
      if (next[product.id]) delete next[product.id];
      else next[product.id] = true;
      return next;
    });

  const toggleAllOnPage = () =>
    setSelected((current) => {
      const next = { ...current };
      if (allPageSelected) for (const product of pageRows) delete next[product.id];
      else for (const product of pageRows) next[product.id] = true;
      return next;
    });

  const duplicate = (product: Product) => {
    const copy = useDataStore.getState().duplicateProduct(product.id);
    toast({
      tone: 'success',
      title: 'পণ্যের কপি তৈরি হয়েছে',
      description: copy ? `${copy.title} (খসড়া)` : product.title,
    });
  };

  const toggleArchive = (product: Product) => {
    useDataStore.getState().upsertProduct({
      ...product,
      status: product.status === 'archived' ? 'active' : 'archived',
    });
    toast({ tone: 'success', title: 'স্ট্যাটাস আপডেট হয়েছে', description: product.titleBn ?? product.title });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    useDataStore.getState().deleteProduct(deleteTarget.id);
    setSelected((current) => {
      const next = { ...current };
      delete next[deleteTarget.id];
      return next;
    });
    toast({ tone: 'success', title: 'পণ্য মুছে ফেলা হয়েছে', description: deleteTarget.titleBn ?? deleteTarget.title });
    setDeleteTarget(null);
  };

  const columns = buildProductColumns({
    onDuplicate: duplicate,
    onToggleArchive: toggleArchive,
    onDelete: setDeleteTarget,
  });

  return (
    <>
      <PageHeader
        title="পণ্য"
        description="পণ্য যোগ, সম্পাদনা, স্টক ও প্রকাশের অবস্থা এক জায়গায়।"
        actions={
          <>
            <Button
              variant="outline"
              leftIcon={<Download aria-hidden className="size-4" />}
              onClick={() =>
                exportCsv(
                  'shobdox-products.csv',
                  [
                    { header: 'নাম', value: (product) => product.titleBn ?? product.title },
                    { header: 'SKU', value: (product) => product.variants[0]?.sku ?? '' },
                    { header: 'দাম', value: (product) => product.price },
                    { header: 'স্টক', value: (product) => product.stock },
                    { header: 'স্ট্যাটাস', value: (product) => product.status },
                    { header: 'বিক্রয়', value: (product) => product.sold },
                  ],
                  filtered,
                )
              }
            >
              CSV এক্সপোর্ট
            </Button>
            <ButtonLink to="/admin/products/new" leftIcon={<Plus aria-hidden className="size-4" />}>
              নতুন পণ্য
            </ButtonLink>
          </>
        }
      />

      <Card className="mb-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto] lg:items-center">
          <SearchInput
            value={search}
            onValueChange={setSearch}
            placeholder="নাম, বাংলা নাম বা SKU দিয়ে খুঁজুন…"
            label="পণ্য খুঁজুন"
          />
          <SegmentedControl
            label="স্ট্যাটাস ফিল্টার"
            value={status}
            onChange={setStatus}
            options={[
              { value: 'all', label: 'সব' },
              { value: 'active', label: 'সক্রিয়' },
              { value: 'draft', label: 'খসড়া' },
              { value: 'archived', label: 'আর্কাইভড' },
            ]}
          />
          <SegmentedControl
            label="স্টক ফিল্টার"
            value={stock}
            onChange={setStock}
            options={[
              { value: 'all', label: 'স্টক: সব' },
              { value: 'low', label: 'কম স্টক' },
              { value: 'out', label: 'স্টক শেষ' },
            ]}
          />
          <Select
            aria-label="ক্যাটাগরি ফিল্টার"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            options={[
              { value: 'all', label: 'সব ক্যাটাগরি' },
              ...categories.map((category) => ({ value: category.id, label: category.nameBn })),
            ]}
          />
        </div>

        {selectedIds.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-card bg-primary-soft px-3 py-2">
            <p className="text-sm font-medium text-primary-dark">
              {toBanglaDigits(selectedIds.length)}টি পণ্য নির্বাচিত
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setBulkOpen(true)} leftIcon={<PackagePlus aria-hidden className="size-4" />}>
                বাল্ক স্টক আপডেট
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelected({})}>
                নির্বাচন বাতিল
              </Button>
            </div>
          </div>
        ) : null}
      </Card>

      <ResponsiveTable
        rows={pageRows}
        columns={columns}
        rowKey={(product) => product.id}
        caption={`পণ্যের তালিকা — মোট ${toBanglaDigits(totalRows)}টি`}
        mobileTitle={(product) => (
          <div className="flex items-center gap-2">
            <Thumb src={product.thumbnail} alt={product.titleBn ?? product.title} className="size-10" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text-primary">{product.titleBn ?? product.title}</p>
              <p className="font-num text-xs text-text-secondary">{product.variants[0]?.sku ?? product.slug}</p>
            </div>
          </div>
        )}
        mobileTrailing={(product) => <ProductStatusBadge status={product.status} />}
        mobileActions={(product) => (
          <>
            <ButtonLink to={`/admin/products/${product.id}/edit`} variant="outline" size="sm">
              সম্পাদনা
            </ButtonLink>
            <Button variant="ghost" size="sm" onClick={() => duplicate(product)}>
              কপি
            </Button>
            <Button variant="ghost" size="sm" onClick={() => toggleArchive(product)}>
              {product.status === 'archived' ? 'সক্রিয় করুন' : 'আর্কাইভ'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(product)}>
              মুছুন
            </Button>
          </>
        )}
        selection={{
          isSelected: (product) => Boolean(selected[product.id]),
          onToggle: toggle,
          label: (product) => `${product.titleBn ?? product.title} নির্বাচন করুন`,
          allSelected: allPageSelected,
          onToggleAll: toggleAllOnPage,
        }}
        empty={{ title: 'কোনো পণ্য পাওয়া যায়নি', description: 'ফিল্টার বদলান বা নতুন পণ্য যোগ করুন।' }}
      />

      <Pagination className="mt-4" page={page} totalPages={totalPages} onPageChange={setPage} />

      <BulkStockModal open={bulkOpen} onClose={() => setBulkOpen(false)} products={selectedProducts} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="পণ্য মুছে ফেলবেন?"
        message={`${deleteTarget?.titleBn ?? deleteTarget?.title ?? ''} মুছে ফেললে ডেমো রিসেট ছাড়া ফেরানো যাবে না।`}
        confirmLabel="হ্যাঁ, মুছে ফেলুন"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}
