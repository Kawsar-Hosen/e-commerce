import { useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { Button, IconButton, Input, Thumb } from '@/components/ui';
import type { ProductFormReturn } from './productFormModel';
import { SectionCard } from './ProductFormSections';

/**
 * "ছবি" section of the admin product form.
 *
 * The thumbnail and gallery are plain string fields, so they are edited with
 * `watch` + `setValue` instead of `useFieldArray`; ordering is changed by
 * swapping neighbouring entries, which keeps the first image as the thumbnail.
 */

export function ProductMediaSection({ form }: { form: ProductFormReturn }) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const [draft, setDraft] = useState('');
  const gallery = watch('gallery') ?? [];
  const alt = watch('titleBn') || watch('title') || 'পণ্যের ছবি';

  const addImage = () => {
    const url = draft.trim();
    if (!url) return;
    setValue('gallery', [...gallery, url], { shouldDirty: true });
    setDraft('');
  };

  const move = (index: number, direction: -1 | 1) => {
    const next = [...gallery];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    const [moved] = next.splice(index, 1);
    if (moved) next.splice(target, 0, moved);
    setValue('gallery', next, { shouldDirty: true });
  };

  return (
    <SectionCard title="ছবি" description="প্রথম ছবিটি পণ্যের থাম্বনেইল; বাকিগুলো গ্যালারিতে দেখা যায়।">
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
        <Input
          label="থাম্বনেইল URL"
          required
          placeholder="https://…"
          {...register('thumbnail')}
          error={errors.thumbnail?.message}
        />
        <div className="md:pt-7">
          <Thumb src={watch('thumbnail')} alt={alt} className="size-16" label={alt} />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-text-primary">গ্যালারি</p>
        <div className="mt-2 flex gap-2">
          <Input
            aria-label="নতুন ছবির URL"
            placeholder="https://…"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addImage();
              }
            }}
          />
          <Button variant="outline" onClick={addImage} leftIcon={<Plus aria-hidden className="size-4" />}>
            যোগ
          </Button>
        </div>

        {gallery.length === 0 ? (
          <p className="mt-2 text-sm text-text-secondary">এখনো কোনো গ্যালারি ছবি যোগ করা হয়নি।</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {gallery.map((url, index) => (
              <li key={`${url}-${index}`} className="flex items-center gap-3 rounded-card border border-border p-2">
                <Thumb src={url} alt={`${alt} — ছবি ${index + 2}`} className="size-12" />
                <span className="min-w-0 flex-1 truncate font-num text-xs text-text-secondary">{url}</span>
                <IconButton
                  label="উপরে সরান"
                  variant="ghost"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp aria-hidden className="size-4" />
                </IconButton>
                <IconButton
                  label="নিচে সরান"
                  variant="ghost"
                  size="sm"
                  disabled={index === gallery.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown aria-hidden className="size-4" />
                </IconButton>
                <IconButton
                  label={`ছবি ${index + 2} মুছুন`}
                  variant="ghost"
                  size="sm"
                  onClick={() => setValue('gallery', gallery.filter((_, i) => i !== index))}
                >
                  <Trash2 aria-hidden className="size-4" />
                </IconButton>
              </li>
            ))}
          </ul>
        )}
      </div>
    </SectionCard>
  );
}
