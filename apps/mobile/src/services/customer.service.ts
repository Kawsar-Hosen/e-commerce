/**
 * Customer writes that the demo checkout performs.
 *
 * Addresses are stored on the mock customer row (persisted in the data store) so
 * the checkout can offer a saved address next time — still a local-only write.
 */

import type { Address, User } from '@shobdox/shared-types';
import { useDataStore } from '../store/data.store';

export interface NewAddressInput {
  label?: string;
  fullName: string;
  phone: string;
  email?: string;
  division: string;
  district: string;
  area: string;
  addressLine: string;
  landmark?: string;
  postcode?: string;
  isDefault?: boolean;
}

/**
 * Adds an address to the customer's address book, replacing the default when a
 * matching line already exists. Returns the updated customer.
 */
export function saveCustomerAddress(user: User, input: NewAddressInput): User {
  const duplicate = user.addresses.find(
    (address) =>
      address.addressLine === input.addressLine &&
      address.area === input.area &&
      address.district === input.district,
  );

  const address: Address = {
    id: duplicate?.id ?? `addr-demo-${Date.now().toString(36)}`,
    label: input.label,
    fullName: input.fullName,
    phone: input.phone,
    division: input.division,
    district: input.district,
    area: input.area,
    addressLine: input.addressLine,
    landmark: input.landmark,
    postcode: input.postcode,
    isDefault: true,
  };

  const others = user.addresses
    .filter((candidate) => candidate.id !== address.id)
    .map((candidate) => ({ ...candidate, isDefault: false }));

  const updated: User = { ...user, addresses: [address, ...others] };
  useDataStore.getState().updateCustomer(updated);
  return updated;
}
