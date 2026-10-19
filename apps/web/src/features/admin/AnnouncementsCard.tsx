import { ExternalLink, Megaphone } from 'lucide-react';
import { MOCK_ANNOUNCEMENTS } from '@shobdox/shared-mock-data';
import { Badge, Card, SectionHeader, type Tone } from '@/components/ui';

/**
 * Read-only view of the storefront announcement bar.
 *
 * The announcements ship with the mock data and are rendered by the storefront
 * from the same source, so this card intentionally offers no editing controls.
 */

const ANNOUNCEMENT_TONES: Record<'primary' | 'accent' | 'dark', Tone> = {
  primary: 'primary',
  accent: 'accent',
  dark: 'neutral',
};

export function AnnouncementsCard() {
  return (
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
  );
}
