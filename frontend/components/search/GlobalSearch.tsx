'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2, FileText, User, Hash, Coins } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getSearchRoute, sanitizeInput, detectSearchType } from '@/lib/utils/validation';
import { api } from '@/lib/api/client';

interface GlobalSearchProps {
  placeholder?: string;
  className?: string;
}

export function GlobalSearch({
  placeholder = 'Search by Address / Tx Hash / Block / Token',
  className = '',
}: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Quick search for autocomplete
  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['quick-search', query],
    queryFn: async () => {
      if (query.length < 3) return [];
      try {
        return await api.quickSearch(query);
      } catch {
        return [];
      }
    },
    enabled: query.length >= 3,
    staleTime: 30_000,
  });

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedQuery = sanitizeInput(query);

    if (!trimmedQuery) return;

    const route = getSearchRoute(trimmedQuery);
    router.push(route);

    // Clear input and hide suggestions
    setQuery('');
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: any) => {
    const route = suggestion.url || getSearchRoute(suggestion.address || suggestion.tx_hash || suggestion.block_hash || '');
    router.push(route);
    setQuery('');
    setShowSuggestions(false);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'address':
      case 'contract':
        return <User className="h-4 w-4" />;
      case 'transaction':
        return <FileText className="h-4 w-4" />;
      case 'block':
        return <Hash className="h-4 w-4" />;
      case 'token':
        return <Coins className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative w-full ${className}`}>
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(e.target.value.length >= 3);
            }}
            onFocus={() => query.length >= 3 && setShowSuggestions(true)}
            placeholder={placeholder}
            className="pl-10 pr-10"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
        <Button type="submit" disabled={!query.trim()}>
          Search
        </Button>
      </div>

      {/* Autocomplete Suggestions */}
      {showSuggestions && suggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute left-0 right-14 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border bg-background shadow-lg"
        >
          {suggestions.map((suggestion: any, index: number) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors last:border-0 hover:bg-muted"
            >
              <div className="text-muted-foreground">{getIconForType(suggestion.type)}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{suggestion.name || 'Unknown'}</span>
                  {suggestion.is_smart_contract_verified && (
                    <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Verified
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {suggestion.address && (
                    <span className="font-mono">{suggestion.address.slice(0, 10)}...{suggestion.address.slice(-8)}</span>
                  )}
                  {suggestion.tx_hash && (
                    <span className="font-mono">{suggestion.tx_hash.slice(0, 10)}...{suggestion.tx_hash.slice(-8)}</span>
                  )}
                  {suggestion.block_number && (
                    <span>Block #{suggestion.block_number.toLocaleString()}</span>
                  )}
                </div>
              </div>
              <div className="text-xs text-muted-foreground capitalize">{suggestion.type}</div>
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
