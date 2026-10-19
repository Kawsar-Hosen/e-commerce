import { useMemo, useState, type ComponentType } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Baby,
  BookOpen,
  Dumbbell,
  Footprints,
  Headphones,
  HeartPulse,
  Home,
  Pencil,
  Plus,
  RotateCcw,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Sparkles,
  Trash2,
  Trophy,
  Truck,
  Tv,
  Wallet,
  Watch,
} from 'lucide-react';
import type { Category } from '@shobdox/shared-types';
import { Button, Card, ConfirmDialog, IconButton, PageHeader, SearchInput } from '@/components/ui';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { useCategories } from '@/hooks/useCatalog';
import { useDebouncedValue } from '@/hooks/useCommon';
import { useDataStore } from '@/store/data.store';
import { toast } from '@/store/ui.store';
import { CategoryFormModal } from '@/features/admin/CategoryFormModal';

/**
 * Category tree.
 *
 * Two levels only (the schema enforces it): top-level categories with their
 * children. Reordering swaps `displayOrder` between siblings; deleting is
 * blocked while products or sub-categories still reference the row, and says
 * why instead of silently failing.
 */

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  Tv,
  Smartphone,
  Shirt,
  Sparkles,
  Home,
  ShoppingBasket,
  BookOpen,
  Baby,
  Trophy,
  Watch,
  Footprints,
  HeartPulse,
  Dumbbell,
  Headphones,
  RotateCcw,
  Truck,
  Wallet,
};

export default function AdminCategoriesPage() {
  const categories = useCategories();
  const [search, setSearch] = useState('');
  const searchTerm = useDebouncedValue(search);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | undefined>();
  const [parentPreset, setParentPreset] = useState<string | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const term = searchTerm.trim().toLowerCase();
  const matches = (category: Category) =>
    !term ||
    category.name.toLowerCase().includes(term) ||
    category.nameBn.includes(searchTerm.trim()) ||
    category.slug.includes(term);

  const childrenOf = (parentId: string) =>
    categories
      .filter((category) => category.parentId === parentId)
      .sort((a, b) => a.displayOrder - b.displayOrder);

  const topLevel = useMemo(
    () =>
      categories
        .filter((category) => !category.parentId)
        .filter((category) => matches(category) || childrenOf(category.id).some(matches))
        .sort((a, b) => a.displayOrder - b.displayOrder),
    // `matches`/`childrenOf` are cheap derivations of the two inputs below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categories, searchTerm],
  );

  const openCreate = (parentId?: string) => {
    setEditing(undefined);
    setParentPreset(parentId);
    setModalOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setParentPreset(undefined);
    setModalOpen(true);
  };

  const move = (category: Category, direction: -1 | 1) => {
    const siblings = categories
      .filter((candidate) => candidate.parentId === category.parentId)
      .sort((a, b) => a.displayOrder - b.displayOrder);
    const index = siblings.findIndex((candidate) => candidate.id === category.id);
    const target = siblings[index + direction];
    if (!target) return;

    const store = useDataStore.getState();
    store.upsertCategory({ ...category, displayOrder: target.displayOrder });
    store.upsertCategory({ ...target, displayOrder: category.displayOrder });
    toast({ tone: 'info', title: 'ক্রম আপডেট হয়েছে', description: category.nameBn });
  };

  const references = (category: Category) => {
    const children = childrenOf(category.id);
    const productCount = category.productCount + children.reduce((sum, child) => sum + child.productCount, 0);
    return { childCount: children.length, productCount };
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    useDataStore.getState().deleteCategory(deleteTarget.id);
    toast({ tone: 'success', title: 'ক্যাটাগরি মুছে ফেলা হয়েছে', description: deleteTarget.nameBn });
    setDeleteTarget(null);
  };

  const renderRow = (category: Category, depth: 0 | 1) => {
    const Icon = ICONS[category.icon] ?? Sparkles;
    const { childCount, productCount } = references(category);
    const blockedReason =
      childCount > 0
        ? `${toBanglaDigits(childCount)}টি সাব-ক্যাটাগরি আগে সরান`
        : productCount > 0
          ? `${toBanglaDigits(productCount)}টি পণ্য এই ক্যাটাগরিতে আছে`
          : null;

    return (
      <li
        key={category.id}
        className="flex flex-wrap items-center gap-2 border-b border-divider py-2.5 last:border-b-0"
      >
        <span className={depth === 1 ? 'ml-6 flex min-w-0 flex-1 items-center gap-2' : 'flex min-w-0 flex-1 items-center gap-2'}>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-card bg-surface-muted text-primary">
            <Icon className="size-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-text-primary">
              {category.nameBn} <span className="text-text-secondary">({category.name})</span>
            </span>
            <span className="block truncate font-num text-xs text-text-secondary">
              /{category.slug} · ক্রম {toBanglaDigits(category.displayOrder)}
            </span>
          </span>
        </span>

        <span className="shrink-0 rounded-chip bg-surface-muted px-2 py-0.5 font-num text-xs text-text-secondary">
          {toBanglaDigits(productCount)} পণ্য
        </span>

        <span className="flex shrink-0 items-center gap-0.5">
          <IconButton label="উপরে সরান" variant="ghost" size="sm" onClick={() => move(category, -1)}>
            <ArrowUp aria-hidden className="size-4" />
          </IconButton>
          <IconButton label="নিচে সরান" variant="ghost" size="sm" onClick={() => move(category, 1)}>
            <ArrowDown aria-hidden className="size-4" />
          </IconButton>
          <IconButton label="ক্যাটাগরি সম্পাদনা" variant="ghost" size="sm" onClick={() => openEdit(category)}>
            <Pencil aria-hidden className="size-4" />
          </IconButton>
          <IconButton
            label={blockedReason ? `মুছুন — ${blockedReason}` : 'ক্যাটাগরি মুছুন'}
            variant="ghost"
            size="sm"
            disabled={Boolean(blockedReason)}
            onClick={() => {
              if (blockedReason) {
                toast({ tone: 'warning', title: 'মোছা যাবে না', description: blockedReason });
                return;
              }
              setDeleteTarget(category);
            }}
          >
            <Trash2 aria-hidden className={blockedReason ? 'size-4' : 'size-4 text-error'} />
          </IconButton>
        </span>
      </li>
    );
  };

  return (
    <>
      <PageHeader
        title="ক্যাটাগরি"
        description="দুই স্তরের ক্যাটাগরি গাছ — ক্রম বদলালে স্টোরফ্রন্টের মেনুতেও পরিবর্তন আসে।"
        actions={
          <Button onClick={() => openCreate()} leftIcon={<Plus aria-hidden className="size-4" />}>
            নতুন ক্যাটাগরি
          </Button>
        }
      />

      <Card className="mb-4">
        <SearchInput
          value={search}
          onValueChange={setSearch}
          placeholder="নাম, বাংলা নাম বা স্লাগ দিয়ে খুঁজুন…"
          label="ক্যাটাগরি খুঁজুন"
        />
      </Card>

      {topLevel.length === 0 ? (
        <Card>
          <p className="text-sm text-text-secondary">কোনো ক্যাটাগরি মেলেনি — ফিল্টার বদলান বা নতুন ক্যাটাগরি যোগ করুন।</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {topLevel.map((parent) => {
            const children = childrenOf(parent.id).filter((child) => matches(child) || matches(parent));
            return (
              <Card key={parent.id} as="section">
                <ul>{renderRow(parent, 0)}</ul>

                {children.length > 0 ? (
                  <ul className="mt-1">{children.map((child) => renderRow(child, 1))}</ul>
                ) : (
                  <p className="mt-1 pl-6 text-xs text-text-secondary">এই ক্যাটাগরিতে কোনো সাব-ক্যাটাগরি নেই।</p>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  leftIcon={<Plus aria-hidden className="size-4" />}
                  onClick={() => openCreate(parent.id)}
                >
                  সাব-ক্যাটাগরি যোগ করুন
                </Button>
              </Card>
            );
          })}
        </div>
      )}

      <CategoryFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        existing={editing}
        categories={categories}
        defaultParentId={parentPreset}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="ক্যাটাগরি মুছে ফেলবেন?"
        message={`${deleteTarget?.nameBn ?? ''} মুছে ফেললে স্টোরফ্রন্টের মেনু থেকেও সরবে।`}
        confirmLabel="হ্যাঁ, মুছে ফেলুন"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}
