import type { ComponentType } from 'react';
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
import { toBanglaDigits } from '@shobdox/shared-utils';
import { IconButton } from '@/components/ui';
import { toast } from '@/store/ui.store';

/**
 * One row of the admin category tree.
 *
 * Knows nothing about the store: it draws the icon/name/counts it is handed and
 * reports reorder/edit/delete clicks upward. Deletion is blocked while the row
 * still has sub-categories or products, and says why instead of failing
 * silently — the reason is baked into the button's label and a toast.
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

export interface CategoryTreeRowProps {
  category: Category;
  depth: 0 | 1;
  childCount: number;
  productCount: number;
  onMove: (category: Category, direction: -1 | 1) => void;
  onEdit: (category: Category) => void;
  onDeleteRequest: (category: Category) => void;
}

export function CategoryTreeRow({
  category,
  depth,
  childCount,
  productCount,
  onMove,
  onEdit,
  onDeleteRequest,
}: CategoryTreeRowProps) {
  const Icon = ICONS[category.icon] ?? Sparkles;
  const blockedReason =
    childCount > 0
      ? `${toBanglaDigits(childCount)}টি সাব-ক্যাটাগরি আগে সরান`
      : productCount > 0
        ? `${toBanglaDigits(productCount)}টি পণ্য এই ক্যাটাগরিতে আছে`
        : null;

  return (
    <li className="flex flex-wrap items-center gap-2 border-b border-divider py-2.5 last:border-b-0">
      <span
        className={
          depth === 1
            ? 'ml-6 flex min-w-0 flex-1 items-center gap-2'
            : 'flex min-w-0 flex-1 items-center gap-2'
        }
      >
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
        <IconButton label="উপরে সরান" variant="ghost" size="sm" onClick={() => onMove(category, -1)}>
          <ArrowUp aria-hidden className="size-4" />
        </IconButton>
        <IconButton label="নিচে সরান" variant="ghost" size="sm" onClick={() => onMove(category, 1)}>
          <ArrowDown aria-hidden className="size-4" />
        </IconButton>
        <IconButton label="ক্যাটাগরি সম্পাদনা" variant="ghost" size="sm" onClick={() => onEdit(category)}>
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
            onDeleteRequest(category);
          }}
        >
          <Trash2 aria-hidden className={blockedReason ? 'size-4' : 'size-4 text-error'} />
        </IconButton>
      </span>
    </li>
  );
}
