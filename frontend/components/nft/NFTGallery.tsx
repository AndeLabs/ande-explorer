'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { formatAddress } from '@/lib/utils/format';
import Link from 'next/link';
import {
  Image as ImageIcon,
  ExternalLink,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  FileQuestion,
} from 'lucide-react';

interface NFTGalleryProps {
  address: string;
}

interface NFTInstance {
  id: string;
  token: {
    address: string;
    name: string;
    symbol: string;
    type: string;
  };
  metadata?: {
    name?: string;
    description?: string;
    image?: string;
    attributes?: Array<{
      trait_type: string;
      value: string;
    }>;
  };
  image_url?: string;
}

export function NFTGallery({ address }: NFTGalleryProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['address-nfts', address, page],
    queryFn: async () => {
      // Fetch ERC-721 and ERC-1155 tokens for the address
      const tokens = await api.getAddressTokens(address);
      const nftTokens = tokens.items?.filter(
        (token: any) => token.token.type === 'ERC-721' || token.token.type === 'ERC-1155'
      ) || [];
      return nftTokens;
    },
    enabled: !!address,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            NFT Collection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data || data.length === 0) {
    return null; // Don't show if no NFTs
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            NFT Collection
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{data.length} NFTs</Badge>
            <div className="flex rounded-lg border">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {data.map((nft: any, index: number) => (
              <NFTCard key={index} nft={nft} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((nft: any, index: number) => (
              <NFTListItem key={index} nft={nft} />
            ))}
          </div>
        )}

        {/* Info about NFTs */}
        <div className="mt-6 rounded-lg bg-muted/50 p-4 text-sm">
          <h4 className="font-semibold">About NFTs</h4>
          <p className="mt-1 text-muted-foreground">
            Non-Fungible Tokens (NFTs) are unique digital assets stored on the blockchain.
            Each NFT has a distinct identifier and metadata that makes it one-of-a-kind.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function NFTCard({ nft }: { nft: any }) {
  const imageUrl = nft.token?.icon_url || nft.image_url;
  const name = nft.token?.name || 'Unknown NFT';
  const tokenId = nft.id || nft.value;

  return (
    <Link
      href={`/tokens/${nft.token.address}`}
      className="group block overflow-hidden rounded-lg border bg-card transition-all hover:border-blue-400 hover:shadow-lg"
    >
      {/* Image */}
      <div className="relative aspect-square bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`flex h-full w-full items-center justify-center ${imageUrl ? 'hidden' : ''}`}>
          <FileQuestion className="h-12 w-12 text-muted-foreground" />
        </div>
        <Badge
          variant="secondary"
          className="absolute right-2 top-2 text-xs"
        >
          {nft.token.type}
        </Badge>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="truncate font-semibold">{name}</h3>
        <p className="truncate text-sm text-muted-foreground">{nft.token.symbol}</p>
        {tokenId && (
          <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
            #{tokenId}
          </p>
        )}
      </div>
    </Link>
  );
}

function NFTListItem({ nft }: { nft: any }) {
  const imageUrl = nft.token?.icon_url || nft.image_url;
  const name = nft.token?.name || 'Unknown NFT';
  const tokenId = nft.id || nft.value;

  return (
    <Link
      href={`/tokens/${nft.token.address}`}
      className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:border-blue-400 hover:bg-muted/50"
    >
      {/* Thumbnail */}
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <FileQuestion className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{name}</h3>
          <Badge variant="outline" className="text-xs">
            {nft.token.type}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{nft.token.symbol}</p>
        {tokenId && (
          <p className="font-mono text-xs text-muted-foreground">
            Token ID: #{tokenId}
          </p>
        )}
      </div>

      {/* Contract Address */}
      <div className="text-right">
        <p className="font-mono text-sm text-blue-600">
          {formatAddress(nft.token.address)}
        </p>
        <ExternalLink className="ml-auto mt-1 h-4 w-4 text-muted-foreground" />
      </div>
    </Link>
  );
}
