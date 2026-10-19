import { useState } from 'react';
import { Link } from 'react-router';
import { Megaphone, X } from 'lucide-react';
import { MOCK_ANNOUNCEMENTS } from '@shobdox/shared-mock-data';
import { cn } from '@/lib/cn';

/** Rotating announcement strip above the header. Dismissible, keyboard reachable. */

const TONE_CLASSES: Record<string, string> = {
  primary: 'bg-primary-dark text-text-inverse',
  accent: 'bg-accent text-on-accent',
  dark: 'bg-surface-inverse text-text-inverse',
};

export function AnnouncementBar() {
  const announcements = MOCK_ANNOUNCEMENTS.filter((item) => item.isActive);
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || announcements.length === 0) return null;

  const current = announcements[index] ?? announcements[0];
  if (!current) return null;

  return (
    <div className={cn('no-print relative text-xs', TONE_CLASSES[current.tone] ?? TONE_CLASSES['primary'])}>
      <div className="page-shell flex h-9 items-center justify-center gap-2 pr-8">
        <Megaphone aria-hidden className="size-3.5 shrink-0 opacity-90" />

        <p className="truncate text-center font-medium">
          {current.href ? (
            <Link to={current.href} className="hover:underline">
              {current.messageBn ?? current.message}
            </Link>
          ) : (
            (current.messageBn ?? current.message)
          )}
        </p>

        {announcements.length > 1 ? (
          <button
            type="button"
            onClick={() => setIndex((value) => (value + 1) % announcements.length)}
            className="ml-2 shrink-0 rounded-chip bg-black/15 px-2 py-0.5 font-num text-[11px] hover:bg-black/25"
            aria-label="পরবর্তী ঘোষণা"
          >
            {index + 1}/{announcements.length}
          </button>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="ঘোষণা বন্ধ করুন"
        className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full hover:bg-black/20"
      >
        <X aria-hidden className="size-3.5" />
      </button>
    </div>
  );
}
