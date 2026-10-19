/**
 * The design system's public surface.
 *
 * Screens import from `@/components/ui`, never from an individual primitive
 * file, so the kit can be reorganised without touching pages.
 */
export { Button, ButtonLink, IconButton, buttonStyles } from './Button';
export { SmartImage, Thumb } from './SmartImage';
export { Card, SectionHeader, Badge, StatusDot, PageHeader } from './Card';
export { Field, Input, Textarea, Select, SearchInput } from './Form';
export { Checkbox, Switch, RadioGroup } from './Choice';
export { Modal, ConfirmDialog, Drawer, ToastHost } from './Overlay';
export {
  Price,
  Rating,
  StockBadge,
  QuantityStepper,
  Spinner,
  Skeleton,
  ProductCardSkeleton,
  ProductGridSkeleton,
  TableSkeleton,
} from './Display';
export {
  EmptyState,
  ErrorState,
  Alert,
  DemoNotice,
  Avatar,
  Progress,
  StatTile,
  Countdown,
  KeyValue,
  TableEmpty,
} from './Feedback';
export {
  Tabs,
  TabPanel,
  SegmentedControl,
  Accordion,
  Pagination,
  Breadcrumbs,
  Chip,
  FilterButton,
  ScrollRail,
} from './Nav';

export type { ButtonProps, ButtonLinkProps, ButtonVariant, ButtonSize } from './Button';
export type { CardProps, SectionHeaderProps, Tone } from './Card';
export type { FieldProps, InputProps, TextareaProps, SelectProps, SelectOption } from './Form';
export type { CheckboxProps, RadioOption } from './Choice';
export type { ModalProps, DrawerProps, ConfirmDialogProps } from './Overlay';
export type { PriceProps } from './Display';
export type { TabItem, Crumb } from './Nav';
