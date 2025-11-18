/**
 * Address Tags/Labels utility for storing user-defined labels for addresses
 * Uses localStorage for persistence
 */

export interface AddressTag {
  address: string;
  label: string;
  category?: 'exchange' | 'defi' | 'bridge' | 'nft' | 'dao' | 'custom';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'ande-address-tags';

/**
 * Get all address tags from localStorage
 */
export function getAllTags(): Record<string, AddressTag> {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Get tag for a specific address
 */
export function getTag(address: string): AddressTag | null {
  const tags = getAllTags();
  return tags[address.toLowerCase()] || null;
}

/**
 * Set tag for an address
 */
export function setTag(tag: Omit<AddressTag, 'createdAt' | 'updatedAt'>): void {
  const tags = getAllTags();
  const normalizedAddress = tag.address.toLowerCase();
  const now = new Date().toISOString();

  const existingTag = tags[normalizedAddress];

  tags[normalizedAddress] = {
    ...tag,
    address: normalizedAddress,
    createdAt: existingTag?.createdAt || now,
    updatedAt: now,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(tags));
}

/**
 * Remove tag for an address
 */
export function removeTag(address: string): void {
  const tags = getAllTags();
  delete tags[address.toLowerCase()];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tags));
}

/**
 * Search tags by label
 */
export function searchTags(query: string): AddressTag[] {
  const tags = getAllTags();
  const lowerQuery = query.toLowerCase();

  return Object.values(tags).filter(
    (tag) =>
      tag.label.toLowerCase().includes(lowerQuery) ||
      tag.address.includes(lowerQuery) ||
      tag.notes?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Export all tags as JSON
 */
export function exportTags(): string {
  return JSON.stringify(getAllTags(), null, 2);
}

/**
 * Import tags from JSON
 */
export function importTags(json: string): number {
  try {
    const imported = JSON.parse(json);
    const existing = getAllTags();

    let count = 0;
    for (const [address, tag] of Object.entries(imported)) {
      if (isValidTag(tag as AddressTag)) {
        existing[address.toLowerCase()] = tag as AddressTag;
        count++;
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    return count;
  } catch {
    throw new Error('Invalid JSON format');
  }
}

/**
 * Validate tag object
 */
function isValidTag(tag: any): tag is AddressTag {
  return (
    typeof tag === 'object' &&
    typeof tag.address === 'string' &&
    typeof tag.label === 'string' &&
    tag.address.length === 42
  );
}

/**
 * Get category color
 */
export function getCategoryColor(category?: string): string {
  switch (category) {
    case 'exchange':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'defi':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    case 'bridge':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    case 'nft':
      return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400';
    case 'dao':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  }
}

/**
 * Category options
 */
export const CATEGORY_OPTIONS = [
  { value: 'exchange', label: 'Exchange' },
  { value: 'defi', label: 'DeFi' },
  { value: 'bridge', label: 'Bridge' },
  { value: 'nft', label: 'NFT' },
  { value: 'dao', label: 'DAO' },
  { value: 'custom', label: 'Custom' },
] as const;
