import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { BadgeCheck, MessageSquarePlus, Star, ThumbsUp } from 'lucide-react';
import type { Product, ProductReview } from '@shobdox/shared-types';
import { formatRelativeTime, toBanglaDigits } from '@shobdox/shared-utils';
import { cn } from '@/lib/cn';
import {
  Avatar,
  Button,
  ButtonLink,
  Card,
  EmptyState,
  Modal,
  Progress,
  SegmentedControl,
  Textarea,
  Input,
} from '@/components/ui';
import { Rating } from '@/components/ui/Display';
import { useAuthStore } from '@/store/auth.store';
import { useDataStore } from '@/store/data.store';
import { toast } from '@/store/ui.store';

/**
 * Ratings and reviews.
 *
 * Reviews are seeded fixtures; a shopper can add one and it is persisted with
 * the product (and folded into the average). The form says plainly that this is
 * a local demo change — nothing is moderated or sent anywhere.
 */

type ReviewSort = 'newest' | 'highest' | 'helpful';

export function ReviewSection({ product }: { product: Product }) {
  const user = useAuthStore((state) => state.session?.user);
  const addProductReview = useDataStore((state) => state.addProductReview);

  const [sort, setSort] = useState<ReviewSort>('newest');
  const [visible, setVisible] = useState(3);
  const [helpful, setHelpful] = useState<Record<string, number>>({});
  const [writing, setWriting] = useState(false);
  const [draft, setDraft] = useState({ rating: 5, title: '', body: '' });
  const [error, setError] = useState<string>();

  const distribution = useMemo(() => {
    const buckets: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const review of product.reviews) buckets[review.rating] = (buckets[review.rating] ?? 0) + 1;

    const total = Math.max(1, product.reviews.length);
    return [5, 4, 3, 2, 1].map((star) => {
      const count = buckets[star] ?? 0;
      return { star, count, percent: Math.round((count / total) * 100) };
    });
  }, [product.reviews]);

  const sorted = useMemo(() => {
    const list = [...product.reviews];
    if (sort === 'highest') list.sort((a, b) => b.rating - a.rating);
    else if (sort === 'helpful') list.sort((a, b) => b.helpfulCount - a.helpfulCount);
    else list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }, [product.reviews, sort]);

  const submitReview = () => {
    if (draft.body.trim().length < 10) {
      setError('রিভিউটি অন্তত ১০ অক্ষরের হতে হবে যাতে অন্যরা বুঝতে পারেন।');
      return;
    }

    addProductReview(product.id, {
      id: `${product.id}-local-${Date.now()}`,
      authorName: user?.name ?? 'ডেমো গ্রাহক',
      rating: draft.rating as ProductReview['rating'],
      title: draft.title.trim() || undefined,
      body: draft.body.trim(),
      createdAt: new Date().toISOString(),
      isVerifiedPurchase: false,
      helpfulCount: 0,
    });

    setWriting(false);
    setDraft({ rating: 5, title: '', body: '' });
    setError(undefined);
    toast({
      tone: 'success',
      title: 'রিভিউ যোগ হয়েছে',
      description: 'ডেমো রিভিউটি শুধু আপনার ব্রাউজারে সংরক্ষিত হয়েছে এবং গড় রেটিংয়ে যুক্ত হয়েছে।',
    });
  };

  return (
    <Card className="space-y-5" padded={false}>
      <div className="border-b border-divider px-4 py-4 sm:px-5">
        <h2 className="text-2xl font-bold text-text-primary">রেটিং ও রিভিউ</h2>

        <div className="mt-3 grid gap-4 sm:grid-cols-[auto_1fr] sm:gap-8">
          <div className="text-center sm:text-left">
            <p className="font-num text-5xl font-bold text-text-primary">
              {toBanglaDigits(product.rating.toFixed(1))}
            </p>
            <Rating value={product.rating} showValue={false} size="md" className="mt-1 justify-center sm:justify-start" />
            <p className="mt-1 text-xs text-text-secondary">
              {toBanglaDigits(product.reviewCount)}টি রেটিং
            </p>
          </div>

          <ul className="space-y-1.5">
            {distribution.map((row) => (
              <li key={row.star} className="flex items-center gap-2">
                <span className="flex w-12 items-center gap-1 font-num text-xs text-text-secondary">
                  {toBanglaDigits(row.star)}
                  <Star aria-hidden className="size-3 fill-accent text-accent" />
                </span>
                <Progress value={row.percent} size="sm" label={`${row.star} স্টার`} />
                <span className="w-10 text-right font-num text-xs text-text-secondary">
                  {toBanglaDigits(row.count)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-3 text-xs text-text-muted">
          রেটিংগুলো ডেমো ডেটা — লিখিত রিভিউয়ের সাথে গড় মিলতে পারে না, কারণ বাস্তব দোকানে শত শত রেটিং থাকে।
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5">
        <SegmentedControl
          label="রিভিউ সাজান"
          value={sort}
          onChange={setSort}
          options={[
            { value: 'newest', label: 'নতুন' },
            { value: 'highest', label: 'সর্বোচ্চ রেটিং' },
            { value: 'helpful', label: 'সহায়ক' },
          ]}
        />

        {user ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWriting(true)}
            leftIcon={<MessageSquarePlus aria-hidden className="size-4" />}
          >
            রিভিউ লিখুন
          </Button>
        ) : (
          <ButtonLink to="/signin" variant="outline" size="sm">
            রিভিউ লিখতে লগ ইন করুন
          </ButtonLink>
        )}
      </div>

      <div className="px-4 pb-4 sm:px-5">
        {sorted.length === 0 ? (
          <EmptyState
            title="এখনো কোনো লিখিত রিভিউ নেই"
            description="প্রথম রিভিউটি আপনিই লিখতে পারেন — এটি ডেমো ডেটায় যুক্ত হবে।"
            action={
              user ? (
                <Button onClick={() => setWriting(true)}>রিভিউ লিখুন</Button>
              ) : (
                <ButtonLink to="/signin">লগ ইন করুন</ButtonLink>
              )
            }
          />
        ) : (
          <ul className="space-y-4">
            {sorted.slice(0, visible).map((review) => {
              const extra = helpful[review.id] ?? 0;

              return (
                <li key={review.id} className="rounded-card border border-border bg-surface p-3.5">
                  <div className="flex items-start gap-3">
                    <Avatar name={review.authorName} size="sm" />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-text-primary">{review.authorName}</span>
                        {review.isVerifiedPurchase ? (
                          <span className="inline-flex items-center gap-0.5 text-xs font-medium text-success">
                            <BadgeCheck aria-hidden className="size-3.5" />
                            যাচাইকৃত ক্রেতা
                          </span>
                        ) : null}
                        <span className="text-xs text-text-muted">{formatRelativeTime(review.createdAt)}</span>
                      </div>

                      <Rating value={review.rating} size="sm" showValue={false} className="mt-1" />

                      {review.title ? (
                        <p className="mt-1.5 text-sm font-semibold text-text-primary">{review.title}</p>
                      ) : null}
                      <p className="mt-1 text-sm leading-relaxed text-text-secondary">{review.body}</p>

                      {review.reply ? (
                        <div className="mt-2.5 rounded-card border-l-2 border-primary bg-primary-soft/50 px-3 py-2">
                          <p className="text-xs font-semibold text-primary-dark">বিক্রেতার উত্তর</p>
                          <p className="mt-0.5 text-sm text-text-secondary">{review.reply.body}</p>
                        </div>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => setHelpful((current) => ({ ...current, [review.id]: extra + 1 }))}
                        className={cn(
                          'mt-2.5 inline-flex items-center gap-1.5 rounded-button border px-2.5 py-1 text-xs font-medium transition-colors',
                          extra > 0
                            ? 'border-primary bg-primary-soft text-primary-dark'
                            : 'border-border-strong text-text-secondary hover:border-primary hover:text-primary',
                        )}
                        aria-label="রিভিউটি সহায়ক ছিল"
                      >
                        <ThumbsUp aria-hidden className="size-3.5" />
                        সহায়ক ({toBanglaDigits(review.helpfulCount + extra)})
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {visible < sorted.length ? (
          <Button variant="outline" fullWidth className="mt-4" onClick={() => setVisible((value) => value + 3)}>
            আরও রিভিউ দেখুন ({toBanglaDigits(sorted.length - visible)})
          </Button>
        ) : null}
      </div>

      <Modal
        open={writing}
        onClose={() => setWriting(false)}
        title="রিভিউ লিখুন"
        description="ডেমো রিভিউ — এটি শুধু এই ব্রাউজারে সংরক্ষিত হবে এবং কোনো মডারেশন হবে না।"
        footer={
          <>
            <Button variant="ghost" onClick={() => setWriting(false)}>
              বাতিল
            </Button>
            <Button onClick={submitReview}>রিভিউ জমা দিন</Button>
          </>
        }
      >
        <div className="space-y-4">
          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-text-primary">রেটিং দিন</legend>
            <div className="flex gap-1" role="radiogroup" aria-label="রেটিং">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  role="radio"
                  aria-checked={draft.rating === star}
                  aria-label={`${star} স্টার`}
                  onClick={() => setDraft((current) => ({ ...current, rating: star }))}
                  className="flex size-9 items-center justify-center rounded-button hover:bg-surface-muted"
                >
                  <Star
                    aria-hidden
                    className={cn(
                      'size-5',
                      star <= draft.rating ? 'fill-accent text-accent' : 'text-border-strong',
                    )}
                  />
                </button>
              ))}
            </div>
          </fieldset>

          <Input
            label="শিরোনাম (ঐচ্ছিক)"
            value={draft.title}
            onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            placeholder="যেমন: দাম অনুযায়ী দুর্দান্ত"
          />

          <Textarea
            label="আপনার অভিজ্ঞতা"
            required
            value={draft.body}
            onChange={(event) => setDraft((current) => ({ ...current, body: event.target.value }))}
            error={error}
            hint="কমপক্ষে ১০ অক্ষর লিখুন।"
            placeholder="পণ্যটি কেমন লেগেছে, ডেলিভারি কেমন ছিল — বিস্তারিত লিখুন।"
          />

          <p className="text-xs text-text-muted">
            আপনি <span className="font-medium">{user?.name}</span> নামে রিভিউ করছেন (ডেমো সেশন)।
          </p>
        </div>
      </Modal>

      <p className="border-t border-divider px-4 py-3 text-xs text-text-muted sm:px-5">
        সমস্ত রিভিউ ডেমো ডেটা —{' '}
        <Link to="/help/faq" className="text-primary hover:underline">
          বিস্তারিত জানুন
        </Link>
        ।
      </p>
    </Card>
  );
}
