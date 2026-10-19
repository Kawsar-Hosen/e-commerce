import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ExternalLink, Megaphone, Pencil, Plus, Power, Trash2 } from 'lucide-react';
import type { Banner } from '@shobdox/shared-types';
import { MOCK_ANNOUNCEMENTS } from '@shobdox/shared-mock-data';
import { formatDate, toBanglaDigits } from '@shobdox/shared-utils';
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  IconButton,
  PageHeader,
  Pagination,
  SearchInput,
  SegmentedControl,
  SectionHeader,
  type Tone,
} from '@/components/ui';
import { useBanners } from '@/hooks/useCatalog';
import { useDebouncedValue } from '@/hooks/useCommon';
import { useDataStore } from '@/store/data.store';
import { toast } from '@/store/ui.store';
import { BannerFormModal } from '@/features/admin/BannerFormModal';
import { BannerPreview } from '@/features/admin/BannerPreview';
import { usePagination } from '@/features/admin/usePagination';

type PlacementFilter = 'all' | Banner['placement'];

const PLACEMENT_LABELS: Record<Banner['placement'], string> = {
  hero: 'হিরো স্লাইডার',
  strip: 'প্রোমো স্ট্রিপ',
  category: 'ক্যাটাগরি সেকশন',
  footer: 'ফুটারের আগে',
};

const ANNOUNCEMENT_TONES: Record<'primary' | 'accent' | 'dark', Tone> = {
  primary: 'primary',
  accent: 'accent',
  dark: 'neutral',
};

/**
 * Banner manager.
 *
 * Every banner is previewed with the same `BannerPreview` the form modal uses,
 * so what the admin sees is what the storefront hero renders. Announcements are
 * pulled straight from `MOCK_ANNOUNCEMENTS` and are read-only by design.
 */
export default function AdminBannersPage() {
  const banners = useBanners();
  const [search, setSearch] = useState('');
  const searchTerm = useDebouncedValue(search);
  const [placement, setPlacement] = useState<PlacementFilter>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return banners
      .filter((banner) => {
        if (placement !== 'all' && banner.placement !== placement) return false;
        if (term && !`${banner.title} ${banner.subtitle} ${banner.href}`.toLowerCase().includes(term)) return false;
        return true;
      })
      .sort((a, b) => a.placement.localeCompare(b.placement) || a.displayOrder - b.displayOrder);
  }, [banners, searchTerm, placement]);

  const { page, totalPages, pageRows, totalRows, setPage, resetPage } = usePagination(filtered, 6);
  useEffect(() => resetPage(), [placement, searchTerm, resetPage]);

  const toggleActive = (banner: Banner) => {
    useDataStore.getState().upsertBanner({ ...banner, isActive: !banner.isActive });
    toast({
      tone: 'success',
      title: banner.isActive ? 'ব্যানার লুকানো হয়েছে' : 'ব্যানার দেখানো হচ্ছে',
      description: banner.title,
    });
  };

  const move = (banner: Banner, direction: -1 | 1) => {
    const siblings = banners
      .filter((candidate) => candidate.placement === banner.placement)
      .sort((a, b) => a.displayOrder - b.displayOrder);
    const index = siblings.findIndex((candidate) => candidate.id === banner.id);
    const target = siblings[index + direction];
    if (!target) return;

    const store = useDataStore.getState();
    store.upsertBanner({ ...banner, displayOrder: target.displayOrder });
    store.upsertBanner({ ...target, displayOrder: banner.displayOrder });
    toast({ tone: 'info', title: 'ক্রম আপডেট হয়েছে', description: banner.title });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    useDataStore.getState().deleteBanner(deleteTarget.id);
    toast({ tone: 'success', title: 'ব্যানার মুছে ফেলা হয়েছে', description: deleteTarget.title });
    setDeleteTarget(null);
  };

  return (
    <>
      <PageHeader
        title="ব্যানার ও ঘোষণা"
        description="স্টোরফ্রন্টের হিরো, স্ট্রিপ ও ফুটার ব্যানার পরিচালনা করুন — লাইভ প্রিভিউসহ।"
        actions={
          <Button
            onClick={() => {
              setEditing(undefined);
              setModalOpen(true);
            }}
            leftIcon={<Plus aria-hidden className="size-4" />}
          >
            নতুন ব্যানার
          </Button>
        }
      />

      <Card className="mb-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <SearchInput value={search} onValueChange={setSearch} placeholder="শিরোনাম বা লিংক দিয়ে খুঁজুন…" label="ব্যানার খুঁজুন" />
        <SegmentedControl
          label="প্লেসমেন্ট ফিল্টার"
          value={placement}
          onChange={setPlacement}
          options={[
            { value: 'all', label: 'সব' },
            { value: 'hero', label: 'হিরো' },
            { value: 'strip', label: 'স্ট্রিপ' },
            { value: 'category', label: 'ক্যাটাগরি' },
            { value: 'footer', label: 'ফুটার' },
          ]}
        />
      </Card>

      {pageRows.length === 0 ? (
        <Card>
          <p className="text-sm text-text-secondary">কোনো ব্যানার মেলেনি — ফিল্টার বদলান বা নতুন ব্যানার তৈরি করুন।</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {pageRows.map((banner) => (
            <Card key={banner.id} as="section">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
                <BannerPreview
                  title={banner.title}
                  subtitle={banner.subtitle}
                  ctaLabel={banner.ctaLabel}
                  theme={banner.theme}
                  placementLabel={PLACEMENT_LABELS[banner.placement]}
                />

                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={banner.isActive ? 'success' : 'neutral'} size="sm">
                      {banner.isActive ? 'দেখানো হচ্ছে' : 'লুকানো'}
                    </Badge>
                    <Badge tone="info" size="sm">
                      {PLACEMENT_LABELS[banner.placement]} · ক্রম {toBanglaDigits(banner.displayOrder)}
                    </Badge>
                  </div>

                  <p className="text-xs text-text-secondary">
                    মেয়াদ: {formatDate(banner.startsAt)} – {formatDate(banner.endsAt)}
                  </p>
                  <p className="truncate font-num text-xs text-text-muted">{banner.href}</p>

                  <div className="flex flex-wrap items-center gap-1">
                    <IconButton label="উপরে সরান" variant="ghost" size="sm" onClick={() => move(banner, -1)}>
                      <ArrowUp aria-hidden className="size-4" />
                    </IconButton>
                    <IconButton label="নিচে সরান" variant="ghost" size="sm" onClick={() => move(banner, 1)}>
                      <ArrowDown aria-hidden className="size-4" />
                    </IconButton>
                    <IconButton
                      label="ব্যানার সম্পাদনা"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditing(banner);
                        setModalOpen(true);
                      }}
                    >
                      <Pencil aria-hidden className="size-4" />
                    </IconButton>
                    <IconButton
                      label={banner.isActive ? 'লুকান' : 'দেখান'}
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(banner)}
                    >
                      <Power aria-hidden className={banner.isActive ? 'size-4 text-success' : 'size-4'} />
                    </IconButton>
                    <IconButton label="ব্যানার মুছুন" variant="ghost" size="sm" onClick={() => setDeleteTarget(banner)}>
                      <Trash2 aria-hidden className="size-4 text-error" />
                    </IconButton>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-text-secondary">মোট {toBanglaDigits(totalRows)}টি ব্যানার</p>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Card className="mt-5">
        <SectionHeader
          title="ঘোষণা বার"
          subtitle="স্টোরফ্রন্টের উপরের ঘোষণাগুলো কোডে সংরক্ষিত — এখানে শুধু দেখা যায়।"
        />
        <ul className="divide-y divide-divider">
          {MOCK_ANNOUNCEMENTS.map((announcement) => (
            <li key={announcement.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <div className="flex min-w-0 items-center gap-2">
                <Megaphone aria-hidden className="size-4 shrink-0 text-text-secondary" />
                <div className="min-w-0">
                  <p className="truncate text-sm text-text-primary">{announcement.messageBn ?? announcement.message}</p>
                  <p className="truncate text-xs text-text-secondary">{announcement.message}</p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Badge tone={ANNOUNCEMENT_TONES[announcement.tone]} size="sm">
                  {announcement.tone}
                </Badge>
                <Badge tone={announcement.isActive ? 'success' : 'neutral'} size="sm">
                  {announcement.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                </Badge>
                {announcement.href ? (
                  <a
                    href={announcement.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    লিংক
                    <ExternalLink aria-hidden className="size-3" />
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <BannerFormModal open={modalOpen} onClose={() => setModalOpen(false)} existing={editing} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="ব্যানার মুছে ফেলবেন?"
        message={`${deleteTarget?.title ?? ''} মুছে ফেললে স্টোরফ্রন্ট থেকে সাথে সাথে সরবে।`}
        confirmLabel="হ্যাঁ, মুছে ফেলুন"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}
