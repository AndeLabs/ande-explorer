'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getSearchRoute, sanitizeInput } from '@/lib/utils/validation';

interface GlobalSearchProps {
  placeholder?: string;
  className?: string;
}

export function GlobalSearch({
  placeholder = 'Search by Address / Tx Hash / Block / Token',
  className = '',
}: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedQuery = sanitizeInput(query);

    if (!trimmedQuery) return;

    const route = getSearchRoute(trimmedQuery);
    router.push(route);

    // Clear input after search
    setQuery('');
  };

  return (
    <form onSubmit={handleSubmit} className={`w-full ${className}`}>
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="pl-10 pr-4"
          />
        </div>
        <Button type="submit" disabled={!query.trim()}>
          Search
        </Button>
      </div>
    </form>
  );
}
