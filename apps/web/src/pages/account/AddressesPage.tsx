import { useState } from 'react';
import { MapPin, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import type { Address } from '@shobdox/shared-types';
import type { AddressParsed } from '@shobdox/shared-validation';
import { formatBdPhone } from '@shobdox/shared-utils';
import { Alert, Badge, Button, Card, ConfirmDialog, EmptyState, Modal, PageHeader } from '@/components/ui';
import { AddressForm } from '@/features/account/AddressForm';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/store/ui.store';

/** Address book. Everything is stored locally via the mock profile store. */
export default function AddressesPage() {
  const user = useAuthStore((state) => state.session?.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);

  // `'new'` opens an empty form, an `Address` opens it pre-filled.
  const [editing, setEditing] = useState<Address | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null);

  if (!user) return null;
  const addresses = user.addresses;

  const saveAddress = (values: AddressParsed) => {
    const editingId = editing === null || editing === 'new' ? undefined : editing.id;
    const id = editingId ?? `addr-demo-${Date.now().toString(36)}`;

    const nextAddress: Address = {
      id,
      label: values.label,
      fullName: values.fullName,
      phone: values.phone,
      division: values.division,
      district: values.district,
      area: values.area,
      addressLine: values.addressLine,
      landmark: values.landmark,
      postcode: values.postcode,
      isDefault: values.isDefault,
    };

    let next = editingId
      ? addresses.map((address) => (address.id === editingId ? nextAddress : address))
      : [...addresses, nextAddress];

    // The first address is always the default; an explicit checkbox wins otherwise.
    const shouldDefault = values.isDefault || next.length === 1;
    next = next.map((address) =>
      shouldDefault
        ? { ...address, isDefault: address.id === id }
        : address.id === id
          ? { ...address, isDefault: false }
          : address,
    );

    // Unchecking the default must not leave the book without one.
    if (next.length > 0 && !next.some((address) => address.isDefault)) {
      next = next.map((address, index) => (index === 0 ? { ...address, isDefault: true } : address));
    }

    updateProfile({ addresses: next });
    toast({
      tone: 'success',
      title: editingId ? 'ঠিকানা আপডেট হয়েছে' : 'নতুন ঠিকানা যোগ হয়েছে',
      description: 'পরিবর্তন শুধু এই ব্রাউজারের লোকাল স্টোরেজে সংরক্ষিত হয়েছে।',
    });
    setEditing(null);
  };

  const makeDefault = (id: string) => {
    updateProfile({ addresses: addresses.map((address) => ({ ...address, isDefault: address.id === id })) });
    toast({
      tone: 'success',
      title: 'ডিফল্ট ঠিকানা আপডেট হয়েছে',
      description: 'চেকআউটে এই ঠিকানাটি আগে দেখানো হবে।',
    });
  };

  const requestDelete = (address: Address) => {
    if (addresses.length <= 1) {
      // Blocking is explained instead of silently failing.
      toast({
        tone: 'warning',
        title: 'শেষ ঠিকানাটি মোছা যাবে না',
        description: 'ডেলিভারির জন্য অন্তত একটি ঠিকানা থাকা দরকার। আগে নতুন একটি ঠিকানা যোগ করুন।',
      });
      return;
    }
    setDeleteTarget(address);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const rest = addresses.filter((address) => address.id !== deleteTarget.id);
    // Never leave the book without a default address.
    const next = rest.some((address) => address.isDefault)
      ? rest
      : rest.map((address, index) => (index === 0 ? { ...address, isDefault: true } : address));

    updateProfile({ addresses: next });
    toast({ tone: 'info', title: 'ঠিকানা মোছে ফেলা হয়েছে', description: deleteTarget.label ?? deleteTarget.addressLine });
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="আমার ঠিকানা"
        description="ডেলিভারির ঠিকানা যোগ করুন, সম্পাদনা করুন বা ডিফল্ট ঠিকানা বদলান।"
        actions={
          <Button leftIcon={<Plus aria-hidden className="size-4" />} onClick={() => setEditing('new')}>
            নতুন ঠিকানা
          </Button>
        }
      />

      <Alert tone="info">
        ঠিকানাগুলো শুধু এই ব্রাউজারের লোকাল স্টোরেজে থাকে — কোনো সার্ভারে পাঠানো হয় না। ‘ডেমো ডেটা রিসেট’ করলে
        ঠিকানাও আগের ফিক্সচার অবস্থায় ফিরে যাবে।
      </Alert>

      {addresses.length === 0 ? (
        <EmptyState
          icon={<MapPin aria-hidden className="size-6" />}
          title="কোনো সেভ করা ঠিকানা নেই"
          description="চেকআউট দ্রুত করতে একটি ডেলিভারি ঠিকানা যোগ করুন — এটি ডেমো ডেটা।"
          action={
            <Button leftIcon={<Plus aria-hidden className="size-4" />} onClick={() => setEditing('new')}>
              প্রথম ঠিকানা যোগ করুন
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {addresses.map((address) => (
            <li key={address.id}>
              <Card className="flex h-full flex-col">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-base font-semibold text-text-primary">
                    <MapPin aria-hidden className="size-4 text-text-muted" />
                    {address.label ?? 'ঠিকানা'}
                  </span>
                  {address.isDefault ? (
                    <Badge tone="success" size="sm">
                      ডিফল্ট
                    </Badge>
                  ) : null}
                </div>

                <p className="mt-2 text-sm font-medium text-text-primary">{address.fullName}</p>
                <p className="font-num text-sm text-text-secondary">{formatBdPhone(address.phone)}</p>
                <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                  {address.addressLine}, {address.area}, {address.district}, {address.division}
                  {address.postcode ? ` — ${address.postcode}` : ''}
                </p>
                {address.landmark ? (
                  <p className="mt-0.5 text-xs text-text-muted">নিকটবর্তী চিহ্ন: {address.landmark}</p>
                ) : null}

                <div className="mt-auto" aria-hidden />
                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-divider pt-3">
                  {!address.isDefault ? (
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Star aria-hidden className="size-4" />}
                      onClick={() => makeDefault(address.id)}
                    >
                      ডিফল্ট করুন
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<Pencil aria-hidden className="size-4" />}
                    onClick={() => setEditing(address)}
                  >
                    সম্পাদনা
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-error hover:bg-error-soft"
                    leftIcon={<Trash2 aria-hidden className="size-4" />}
                    onClick={() => requestDelete(address)}
                  >
                    মুছুন
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' || editing === null ? 'নতুন ঠিকানা' : 'ঠিকানা সম্পাদনা'}
        description="ঠিকানাটি শুধু এই ডেমো ব্রাউজারে সংরক্ষিত হবে।"
        size="lg"
      >
        {editing !== null ? (
          <AddressForm
            key={editing === 'new' ? 'new' : editing.id}
            initial={editing === 'new' ? undefined : editing}
            submitLabel={editing === 'new' ? 'ঠিকানা যোগ করুন' : 'পরিবর্তন সংরক্ষণ করুন'}
            onSubmit={saveAddress}
            onCancel={() => setEditing(null)}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="ঠিকানাটি মুছবেন?"
        message={
          deleteTarget
            ? `‘${deleteTarget.label ?? 'ঠিকানা'}’ (${deleteTarget.addressLine}) মুছে ফেলা হবে। এটি শুধু এই ব্রাউজার থেকে মুছে যাবে।`
            : ''
        }
        confirmLabel="হ্যাঁ, মুছুন"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
