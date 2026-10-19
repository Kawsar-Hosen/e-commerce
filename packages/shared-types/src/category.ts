import type { EntityId } from './common';

export interface Category {
  id: EntityId;
  slug: string;
  name: string;
  nameBn: string;
  description: string;
  /** Emoji or icon key rendered when no image asset is available. */
  icon: string;
  image?: string;
  /** Tint used for category cards; resolves to a design token name. */
  accent: 'green' | 'amber' | 'blue' | 'purple' | 'cyan' | 'slate';
  parentId?: EntityId;
  productCount: number;
  isFeatured: boolean;
  displayOrder: number;
}

export interface Brand {
  id: EntityId;
  slug: string;
  name: string;
  nameBn?: string;
  /** Text-based lockup shown when no logo asset exists. */
  wordmark: string;
  description: string;
  origin: string;
  productCount: number;
  isFeatured: boolean;
}
