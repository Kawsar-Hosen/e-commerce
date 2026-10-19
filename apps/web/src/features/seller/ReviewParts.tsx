import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { BadgeCheck, Star } from 'lucide-react';
import type { Product, ProductReview } from '@shobdox/shared-types';
import { Avatar, Badge, Button, Card, Modal, Progress, Rating, Textarea } from '@/components/ui';
import { formatDate, toBanglaDigits } from '@/lib/format';

/** Review UI shared by the seller review screen. */

export interface ReviewRow {
  product: Product;
  review: ProductReview;
}

export function RatingSummary({ rows }: { rows: ReviewRow[] }) {
  const total = rows.length;
  const average = total === 0 ? 0 : rows.reduce((sum, row) => sum + row.review.rating, 0) / total;
  const distribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: rows.filter((row) => row.review.rating === rating).length,
  }));

  return (
    <Card>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="shrink-0 text-center sm:text-left">
          <p className="font-num text-5xl font-extrabold text-text-primary">{toBanglaDigits(average.toFixed(1))}</p>
          <Rating value={average} size="sm" showValue={false} label={`গড় রেটিং ${average.toFixed(1)} / ৫`} />
          <p className="mt-1 text-xs text-text-secondary">{toBanglaDigits(total)}টি রিভিউ</p>
        </div>

        <ul className="flex-1 space-y-2">
          {distribution.map(({ rating, count }) => (
            <li key={rating} className="flex items-center gap-2">
              <span className="flex w-12 shrink-0 items-center gap-1 text-xs text-text-secondary">
                <Star aria-hidden className="size-3 fill-accent text-accent" />
                {toBanglaDigits(rating)}
              </span>
              <Progress value={count} max={Math.max(1, total)} size="sm" className="flex-1" label={`${rating} স্টার রিভিউ`} />
              <span className="w-8 shrink-0 text-right font-num text-xs text-text-primary">{toBanglaDigits(count)}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

export function ReviewItem({ row, onReply }: { row: ReviewRow; onReply: (row: ReviewRow) => void }) {
  const { product, review } = row;

  return (
    <li className="rounded-card border border-border bg-surface p-3">
      <div className="flex items-start gap-3">
        <Avatar name={review.authorName} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-text-primary">{review.authorName}</p>
            {review.isVerifiedPurchase ? (
              <Badge tone="success" size="sm">
                <BadgeCheck aria-hidden className="size-3" />
                যাচাইকৃত ক্রয়
              </Badge>
            ) : null}
            <span className="text-xs text-text-secondary">{formatDate(review.createdAt)}</span>
          </div>
          <Rating value={review.rating} size="sm" showValue={false} className="mt-1" label={`রেটিং ${review.rating} / ৫`} />
          {review.title ? <p className="mt-1 text-sm font-medium text-text-primary">{review.title}</p> : null}
          <p className="mt-1 text-sm leading-relaxed text-text-secondary">{review.body}</p>

          <p className="mt-2 text-xs text-text-secondary">
            পণ্য:{' '}
            <Link to={`/product/${product.slug}`} className="font-medium text-primary hover:underline">
              {product.titleBn ?? product.title}
            </Link>
          </p>

          {review.reply ? (
            <div className="mt-2 rounded-card border-l-2 border-primary bg-primary-soft/60 px-3 py-2">
              <p className="text-xs font-semibold text-primary-dark">আপনার উত্তর · {formatDate(review.reply.createdAt)}</p>
              <p className="mt-0.5 text-sm text-text-primary">{review.reply.body}</p>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="mt-2" onClick={() => onReply(row)}>
              উত্তর দিন
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}

export function ReviewReplyModal({
  target,
  onClose,
  onSubmit,
}: {
  target?: ReviewRow;
  onClose: () => void;
  onSubmit: (target: ReviewRow, body: string) => void;
}) {
  const [body, setBody] = useState('');

  useEffect(() => {
    setBody('');
  }, [target?.review.id]);

  return (
    <Modal
      open={Boolean(target)}
      onClose={onClose}
      title="রিভিউয়ের উত্তর দিন"
      description={target ? `${target.review.authorName} · ${target.product.titleBn ?? target.product.title}` : undefined}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            বাতিল
          </Button>
          <Button
            disabled={body.trim().length < 2}
            onClick={() => {
              if (!target || body.trim().length < 2) return;
              onSubmit(target, body.trim());
            }}
          >
            উত্তর প্রকাশ করুন
          </Button>
        </>
      }
    >
      <Textarea
        label="আপনার উত্তর"
        rows={4}
        value={body}
        placeholder="যেমন: ধন্যবাদ! পণ্যটি পছন্দ হওয়ায় আমরা আনন্দিত।"
        onChange={(event) => setBody(event.target.value)}
      />
      <p className="mt-3 rounded-card bg-warning-soft px-3 py-2 text-xs text-amber-900">
        ডেমো: উত্তরটি শুধু এই ব্রাউজারের ডেটা স্টোরে সংরক্ষিত হবে — কোনো ইমেইল বা নোটিফিকেশন পাঠানো হয় না।
      </p>
    </Modal>
  );
}
