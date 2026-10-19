import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Heart, MapPin, Package, RotateCcw, Wallet } from 'lucide-react';
import { profileSchema, type ProfileFormValues } from '@shobdox/shared-validation';
import { formatBdPhone, formatTaka, toBanglaDigits } from '@shobdox/shared-utils';
import { Alert, Avatar, Badge, Button, Card, ConfirmDialog, Input, StatTile } from '@/components/ui';
import { useCustomerOrders } from '@/hooks/useCatalog';
import { RecentOrdersPreview } from '@/features/account/RecentOrdersPreview';
import { ROLE_LABELS } from '@/features/account/labels';
import { useAuthStore } from '@/store/auth.store';
import { resetEverything } from '@/store/data.store';
import { useWishlistStore } from '@/store/wishlist.store';
import { toast } from '@/store/ui.store';

/** Shape produced by `profileSchema` after validation. */
type ProfileOutput = {
  name: string;
  phone: string;
  email?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'unspecified';
};

/** Customer profile: identity, quick stats, recent orders and a demo reset. */
export default function ProfilePage() {
  const user = useAuthStore((state) => state.session?.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const orders = useCustomerOrders(user?.id);
  const wishlistCount = useWishlistStore((state) => state.productIds.length);
  const [resetOpen, setResetOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues, unknown, ProfileOutput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      phone: user?.phone ?? '',
      email: user?.email ?? '',
      dateOfBirth: '',
      gender: 'unspecified',
    },
  });

  const stats = useMemo(() => {
    const settled = orders.filter((order) => order.status !== 'cancelled' && order.status !== 'returned');
    return {
      orderCount: orders.length,
      totalSpent: settled.reduce((total, order) => total + order.totals.total, 0),
      addressCount: user?.addresses.length ?? 0,
    };
  }, [orders, user]);

  // AccountLayout renders the demo sign-in card when there is no user, so this
  // branch is only reached for a brief moment while a sign-out is in flight.
  if (!user) return null;

  const onSubmit = async (values: ProfileOutput) => {
    // Short pause so the saving state is visible; nothing is transmitted.
    await new Promise((resolve) => window.setTimeout(resolve, 320));
    updateProfile({ name: values.name, phone: values.phone, email: values.email });
    toast({
      tone: 'success',
      title: 'প্রোফাইল আপডেট হয়েছে',
      description: 'পরিবর্তনগুলো শুধু এই ব্রাউজারে সংরক্ষিত হয়েছে।',
    });
    reset({
      name: values.name,
      phone: values.phone,
      email: values.email ?? '',
      dateOfBirth: '',
      gender: 'unspecified',
    });
  };

  const onResetDemo = async () => {
    setResetOpen(false);
    await resetEverything();
    toast({
      tone: 'success',
      title: 'ডেমো ডেটা রিসেট হয়েছে',
      description: 'পণ্য, অর্ডার, কার্ট, উইশলিস্ট ও নোটিফিকেশন আগের ফিক্সচারে ফিরে গেছে। সেশন অপরিবর্তিত।',
    });
  };

  return (
    <div className="space-y-5">
      <Card as="section">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={user.name} size="lg" />

          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold text-text-primary">শুভেচ্ছা, {user.name}</h1>
            <p className="mt-0.5 text-sm text-text-secondary">
              <span className="font-num">{formatBdPhone(user.phone)}</span>
              {user.email ? ` · ${user.email}` : ''}
            </p>

            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge tone="primary">{ROLE_LABELS[user.role]}</Badge>
              <Badge tone="neutral">ডেমো সেশন (mock)</Badge>
              {user.loyaltyPoints > 0 ? (
                <Badge tone="accent">লয়্যালটি পয়েন্ট {toBanglaDigits(user.loyaltyPoints)}</Badge>
              ) : null}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatTile
          label="মোট অর্ডার"
          value={toBanglaDigits(stats.orderCount)}
          icon={<Package aria-hidden className="size-4" />}
          href="/account/orders"
        />
        <StatTile
          label="মোট খরচ"
          value={formatTaka(stats.totalSpent)}
          icon={<Wallet aria-hidden className="size-4" />}
          tone="accent"
        />
        <StatTile
          label="উইশলিস্ট আইটেম"
          value={toBanglaDigits(wishlistCount)}
          icon={<Heart aria-hidden className="size-4" />}
          tone="error"
          href="/wishlist"
        />
        <StatTile
          label="সেভ করা ঠিকানা"
          value={toBanglaDigits(stats.addressCount)}
          icon={<MapPin aria-hidden className="size-4" />}
          tone="info"
          href="/account/addresses"
        />
      </div>

      <Card as="section">
        <h2 className="text-xl font-bold text-text-primary">প্রোফাইল তথ্য</h2>
        <p className="mt-1 text-sm text-text-secondary">
          নাম, ফোন ও ইমেইল এখানে বদলাতে পারেন — সবকিছু লোকাল ডেমো স্টোরেজে থাকে।
        </p>

        <form noValidate className="mt-3 grid gap-3 md:grid-cols-3" onSubmit={handleSubmit(onSubmit)}>
          <Input label="নাম" required autoComplete="name" error={errors.name?.message} {...register('name')} />
          <Input
            label="মোবাইল নম্বর"
            required
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Input
            label="ইমেইল (ঐচ্ছিক)"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="flex justify-end md:col-span-3">
            <Button type="submit" loading={isSubmitting}>
              সংরক্ষণ করুন
            </Button>
          </div>
        </form>
      </Card>

      <Card as="section">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-bold text-text-primary">সাম্প্রতিক অর্ডার</h2>
          <Link to="/account/orders" className="text-sm font-medium text-primary hover:underline">
            সব অর্ডার দেখুন
          </Link>
        </div>
        <RecentOrdersPreview orders={orders} />
      </Card>

      <Card as="section" className="border-error/30 bg-error-soft/30">
        <h2 className="text-xl font-bold text-text-primary">ডেমো ডেটা রিসেট</h2>
        <p className="mt-1 text-sm leading-relaxed text-text-secondary">
          পণ্য, অর্ডার, কার্ট, উইশলিস্ট ও নোটিফিকেশন আবার আসল ডেমো ফিক্সচারে ফিরে যাবে। আপনার ডেমো সেশন মুছবে না,
          কিন্তু নতুন করে করা সব পরিবর্তন হারিয়ে যাবে।
        </p>
        <Button
          variant="danger"
          className="mt-3"
          leftIcon={<RotateCcw aria-hidden className="size-4" />}
          onClick={() => setResetOpen(true)}
        >
          ডেমো ডেটা রিসেট করুন
        </Button>
      </Card>

      <ConfirmDialog
        open={resetOpen}
        title="ডেমো ডেটা রিসেট করবেন?"
        message="সব পণ্য, অর্ডার, কার্ট, উইশলিস্ট ও নোটিফিকেশন আসল ডেমো ফিক্সচারে ফিরে যাবে। এটি ফিরিয়ে আনা যাবে না।"
        confirmLabel="হ্যাঁ, রিসেট করুন"
        onConfirm={() => void onResetDemo()}
        onClose={() => setResetOpen(false)}
      >
        <Alert tone="warning" className="mt-3">
          এখানে কোনো প্রকৃত ডেটা নেই — রিসেট শুধু আপনার ব্রাউজারের লোকাল স্টোরেজে কাজ করে।
        </Alert>
      </ConfirmDialog>
    </div>
  );
}
