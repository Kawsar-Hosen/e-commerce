import { useEffect, useMemo, useState } from 'react';
import { useCurrentSeller } from '@/components/layout/SellerLayout';
import {
  ButtonLink,
  Card,
  DemoNotice,
  EmptyState,
  PageHeader,
  Pagination,
  SearchInput,
  SegmentedControl,
  Select,
  Tabs,
} from '@/components/ui';
import { RatingSummary, ReviewItem, ReviewReplyModal, type ReviewRow } from '@/features/seller/ReviewParts';
import { useDataStore } from '@/store/data.store';
import { toast } from '@/store/ui.store';
import { toBanglaDigits } from '@/lib/format';

/**
 * Reviews left on this seller's products.
 *
 * Replies are appended straight onto the product's `reviews` array via
 * `upsertProduct()`, which persists to the same demo store the storefront reads
 * from — there is no email or notification behind it, as the modal says.
 */

const PAGE_SIZE = 5;

type RatingTab = 'all' | '5' | '4' | '3' | '2' | '1';
type ReplyFilter = 'all' | 'replied' | 'unanswered';
type SortKey = 'newest' | 'oldest' | 'highest' | 'lowest';

const REPLY_OPTIONS: Array<{ value: ReplyFilter; label: string }> = [
  { value: 'all', label: 'সব' },
  { value: 'unanswered', label: 'উত্তর বাকি' },
  { value: 'replied', label: 'উত্তর দেওয়া' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'নতুন আগে' },
  { value: 'oldest', label: 'পুরনো আগে' },
  { value: 'highest', label: 'উচ্চ রেটিং আগে' },
  { value: 'lowest', label: 'নিম্ন রেটিং আগে' },
];

export default function SellerReviewsPage() {
  const seller = useCurrentSeller();
  const products = useDataStore((state) => state.products);
  const upsertProduct = useDataStore((state) => state.upsertProduct);
  const [query, setQuery] = useState('');
  const [ratingTab, setRatingTab] = useState<RatingTab>('all');
  const [replyFilter, setReplyFilter] = useState<ReplyFilter>('all');
  const [sort, setSort] = useState<SortKey>('newest');
  const [page, setPage] = useState(1);
  const [replyTarget, setReplyTarget] = useState<ReviewRow>();

  const allRows = useMemo<ReviewRow[]>(
    () =>
      products
        .filter((product) => product.sellerId === seller.id)
        .flatMap((product) => product.reviews.map((review) => ({ product, review })))
        .sort((a, b) => new Date(b.review.createdAt).getTime() - new Date(a.review.createdAt).getTime()),
    [products, seller.id],
  );

  useEffect(() => {
    setPage(1);
  }, [query, ratingTab, replyFilter, sort]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = allRows.filter((row) => {
      const title = row.product.titleBn ?? row.product.title;
      const matchesQuery =
        needle === '' ||
        `${row.review.authorName} ${row.review.title ?? ''} ${row.review.body} ${title}`
          .toLowerCase()
          .includes(needle);
      const matchesRating = ratingTab === 'all' || row.review.rating === Number(ratingTab);
      const matchesReply =
        replyFilter === 'all' ||
        (replyFilter === 'replied' ? Boolean(row.review.reply) : !row.review.reply);
      return matchesQuery && matchesRating && matchesReply;
    });

    switch (sort) {
      case 'oldest':
        return list.sort((a, b) => new Date(a.review.createdAt).getTime() - new Date(b.review.createdAt).getTime());
      case 'highest':
        return list.sort((a, b) => b.review.rating - a.review.rating);
      case 'lowest':
        return list.sort((a, b) => a.review.rating - b.review.rating);
      default:
        return list;
    }
  }, [allRows, query, ratingTab, replyFilter, sort]);

  const tabs = useMemo(() => {
    const items: Array<{ id: RatingTab; label: string; count: number }> = [
      { id: 'all', label: 'সব', count: allRows.length },
    ];
    [5, 4, 3, 2, 1].forEach((rating) => {
      const count = allRows.filter((row) => row.review.rating === rating).length;
      if (count > 0) items.push({ id: String(rating) as RatingTab, label: `${toBanglaDigits(rating)} ★`, count });
    });
    return items;
  }, [allRows]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const unansweredCount = allRows.filter((row) => !row.review.reply).length;

  const submitReply = (row: ReviewRow, body: string) => {
    const reply = { body, createdAt: new Date().toISOString() };
    upsertProduct({
      ...row.product,
      reviews: row.product.reviews.map((candidate) =>
        candidate.id === row.review.id ? { ...candidate, reply } : candidate,
      ),
      updatedAt: reply.createdAt,
    });
    toast({
      tone: 'success',
      title: 'উত্তর সংরক্ষণ হয়েছে',
      description: `${row.review.authorName} — ${row.product.titleBn ?? row.product.title}`,
    });
    setReplyTarget(undefined);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="রিভিউ ও রেটিং"
        description={`আপনার পণ্যের সব রিভিউ — এখন ${toBanglaDigits(unansweredCount)}টির উত্তর বাকি।`}
        actions={
          <ButtonLink to="/seller/products" variant="outline">
            আমার পণ্য
          </ButtonLink>
        }
      />

      <RatingSummary rows={allRows} />

      <Card className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
          <SearchInput
            value={query}
            onValueChange={setQuery}
            placeholder="গ্রাহক, রিভিউ বা পণ্যের নাম…"
            label="রিভিউ খুঁজুন"
          />
          <Select
            label="সাজান"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            options={SORT_OPTIONS}
          />
          <SegmentedControl
            label="উত্তরের অবস্থা"
            value={replyFilter}
            onChange={setReplyFilter}
            options={REPLY_OPTIONS.map((option) =>
              option.value === 'unanswered'
                ? { ...option, label: `উত্তর বাকি (${toBanglaDigits(unansweredCount)})` }
                : option,
            )}
          />
        </div>

        <Tabs
          items={tabs.map((tab) => ({ id: tab.id, label: tab.label, count: tab.count }))}
          activeId={ratingTab}
          onChange={(id) => setRatingTab(id as RatingTab)}
          aria-label="রেটিং অনুযায়ী ফিল্টার"
        />
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          title="কোনো রিভিউ মেলেনি"
          description="ফিল্টার বা সার্চ বদলে আবার দেখুন।"
        />
      ) : (
        <>
          <Card className="p-0">
            <ul className="divide-y divide-divider p-3">
              {paged.map((row) => (
                <ReviewItem key={row.review.id} row={row} onReply={setReplyTarget} />
              ))}
            </ul>
          </Card>

          <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />

          <p className="text-center text-xs text-text-secondary">
            {toBanglaDigits(filtered.length)}টির মধ্যে{' '}
            {toBanglaDigits((safePage - 1) * PAGE_SIZE + 1)}–{toBanglaDigits((safePage - 1) * PAGE_SIZE + paged.length)} দেখানো হচ্ছে
          </p>
        </>
      )}

      <DemoNotice title="ডেমো রিভিউ সিস্টেম">
        উত্তর সংরক্ষণ করলে তা এই ব্রাউজারের ডেটা স্টোরে যায় — কোনো ইমেইল, নোটিফিকেশন বা বাইরের সিস্টেমে পাঠানো হয় না।
      </DemoNotice>

      <ReviewReplyModal target={replyTarget} onClose={() => setReplyTarget(undefined)} onSubmit={submitReply} />
    </div>
  );
}
