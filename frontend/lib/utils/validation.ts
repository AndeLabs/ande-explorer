/**
 * Search type detection and validation utilities
 */

export type SearchType = 'transaction' | 'address' | 'block' | 'token' | 'unknown';

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate transaction hash
 */
export function isValidTxHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Validate block number
 */
export function isValidBlockNumber(value: string): boolean {
  return /^\d+$/.test(value);
}

/**
 * Validate block hash
 */
export function isValidBlockHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Detect search query type
 */
export function detectSearchType(query: string): SearchType {
  const trimmed = query.trim();

  // Transaction hash (0x + 64 hex chars)
  if (isValidTxHash(trimmed)) {
    return 'transaction';
  }

  // Block hash (0x + 64 hex chars)
  if (isValidBlockHash(trimmed)) {
    return 'block';
  }

  // Address (0x + 40 hex chars)
  if (isValidAddress(trimmed)) {
    return 'address';
  }

  // Block number (digits only)
  if (isValidBlockNumber(trimmed)) {
    return 'block';
  }

  // ENS domain (future feature)
  if (/^[a-zA-Z0-9-]+\.eth$/.test(trimmed)) {
    return 'address'; // Will need ENS resolution
  }

  return 'unknown';
}

/**
 * Get search route based on query type
 */
export function getSearchRoute(query: string): string {
  const type = detectSearchType(query);

  switch (type) {
    case 'transaction':
      return `/tx/${query}`;
    case 'address':
      return `/address/${query}`;
    case 'block':
      return `/blocks/${query}`;
    case 'token':
      return `/tokens/${query}`;
    default:
      return `/search?q=${encodeURIComponent(query)}`;
  }
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}
