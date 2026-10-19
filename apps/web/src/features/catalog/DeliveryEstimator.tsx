import { useState } from 'react';
import { MapPin } from 'lucide-react';
import type { Product } from '@shobdox/shared-types';
import {
  BD_DIVISIONS,
  addDays,
  findDivision,
  formatDate,
  formatTaka,
  isInsideDhakaCity,
  toBanglaDigits,
} from '@shobdox/shared-utils';
import { Select } from '@/components/ui';

/**
 * Delivery estimator.
 *
 * Uses the same windows and fees as the checkout (`estimateDeliveryDate`,
 * `DeliveryInfo`), so the date promised here cannot contradict the order the
 * shopper is about to place.
 */

export function DeliveryEstimator({ product }: { product: Product }) {
  const [divisionId, setDivisionId] = useState(BD_DIVISIONS[0]?.id ?? 'dhaka');
  const [districtName, setDistrictName] = useState<string>('');

  const division = findDivision(divisionId) ?? BD_DIVISIONS[0];
  const districts = division?.districts ?? [];
  // A district picked under another division would silently fall back to the
  // first one — deriving it (instead of storing it) keeps the two selects in sync.
  const district = districts.some((candidate) => candidate.name === districtName)
    ? districtName
    : (districts[0]?.name ?? '');

  const inside = division && district ? isInsideDhakaCity(division.name, district) : false;
  const window = inside ? product.delivery.insideDhaka : product.delivery.outsideDhaka;
  const fee = inside ? product.delivery.deliveryFeeInsideDhaka : product.delivery.deliveryFeeOutsideDhaka;

  const today = new Date();
  const earliest = addDays(today, window.min);
  const latest = addDays(today, window.max);

  return (
    <section
      aria-labelledby="delivery-estimator"
      className="rounded-card border border-border bg-surface p-3.5"
    >
      <h3 id="delivery-estimator" className="flex items-center gap-2 text-sm font-semibold text-text-primary">
        <MapPin aria-hidden className="size-4 text-primary" />
        কোথায় ডেলিভারি হবে?
      </h3>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Select
          label="বিভাগ"
          value={divisionId}
          onChange={(event) => {
            setDivisionId(event.target.value);
            setDistrictName('');
          }}
          options={BD_DIVISIONS.map((item) => ({ value: item.id, label: item.nameBn }))}
        />

        <Select
          label="জেলা"
          value={district}
          onChange={(event) => setDistrictName(event.target.value)}
          options={districts.map((item) => ({ value: item.name, label: item.nameBn }))}
        />
      </div>

      <dl className="mt-3 space-y-1.5 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <dt className="text-text-secondary">আনুমানিক ডেলিভারি</dt>
          <dd className="font-medium text-text-primary">
            {formatDate(earliest)} – {formatDate(latest)}
          </dd>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <dt className="text-text-secondary">ডেলিভারি চার্জ</dt>
          <dd className="font-num font-medium text-text-primary">{formatTaka(fee)}</dd>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <dt className="text-text-secondary">ডেলিভারি সময়</dt>
          <dd className="font-num text-text-primary">
            {toBanglaDigits(window.min)}–{toBanglaDigits(window.max)} দিন
          </dd>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <dt className="text-text-secondary">ক্যাশ অন ডেলিভারি</dt>
          <dd className="text-text-primary">
            {product.delivery.cashOnDeliveryAvailable ? 'পাওয়া যাচ্ছে' : 'পাওয়া যাচ্ছে না'}
          </dd>
        </div>
      </dl>

      <p className="mt-2 text-xs text-text-muted">
        তারিখগুলো অনুমানভিত্তিক (ডেমো) — ডেলিভারি অংশীদারের উপর নির্ভর করে বদলাতে পারে।
      </p>
    </section>
  );
}
