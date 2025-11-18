'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  useAddress,
  useAddressBalance,
  useAddressTransactions,
  useAddressTokens,
  useAddressCounters,
} from '@/lib/hooks/useAddress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TransactionCard } from '@/components/transactions/TransactionCard';
import { Pagination } from '@/components/ui/pagination';
import { ContractVerification } from '@/components/contracts/ContractVerification';
import { ContractInteraction } from '@/components/contracts/ContractInteraction';
import { NFTGallery } from '@/components/nft/NFTGallery';
import { AddressTag } from '@/components/address/AddressTag';
import {
  formatWeiToEther,
  copyToClipboard,
} from '@/lib/utils/format';
import { transactionsToCSV, downloadCSV, generateFilename } from '@/lib/utils/export';
import { ExportButton } from '@/components/ui/export-button';
import {
  ArrowLeft,
  Copy,
  Check,
  User,
  Wallet,
  FileCode,
  Coins,
  ArrowRightLeft,
  Zap,
  Activity,
  Image,
} from 'lucide-react';

export default function AddressPage({ params }: { params: { address: string } }) {
  const { address } = params;
  const { data: addressInfo, isLoading, error, refetch } = useAddress(address);
  const { data: balance } = useAddressBalance(address);
  const { data: counters } = useAddressCounters(address);
  const [txPage, setTxPage] = useState(1);
  const { data: transactions } = useAddressTransactions(address, { page: txPage });
  const { data: tokens } = useAddressTokens(address);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <ErrorState
          title="Failed to load address"
          message={(error as Error).message}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (!addressInfo) {
    return (
      <ErrorState
        title="Address not found"
        message="The requested address could not be found."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {addressInfo.is_contract ? (
              <FileCode className="h-6 w-6 text-blue-600" />
            ) : (
              <User className="h-6 w-6 text-muted-foreground" />
            )}
            <h1 className="text-2xl font-bold sm:text-3xl">
              {addressInfo.is_contract ? 'Contract' : 'Address'}
            </h1>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <code className="break-all text-sm text-muted-foreground sm:text-base">{address}</code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(address, 'address')}
              className="h-6 w-6 p-0"
            >
              {copiedField === 'address' ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
          {addressInfo.name && (
            <div className="mt-1 text-lg font-medium text-blue-600">{addressInfo.name}</div>
          )}
          <div className="mt-2">
            <AddressTag address={address} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {addressInfo.is_contract && (
            <Badge variant="secondary">Contract</Badge>
          )}
          {addressInfo.is_verified && (
            <Badge variant="success">Verified</Badge>
          )}
          {addressInfo.ens_domain_name && (
            <Badge variant="outline">{addressInfo.ens_domain_name}</Badge>
          )}
        </div>
      </div>

      {/* Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Balance Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="h-5 w-5" />
              Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {balance ? formatWeiToEther(balance.coin_balance) : '0'} ANDE
            </div>
            {balance?.exchange_rate && (
              <div className="mt-1 text-sm text-muted-foreground">
                ≈ ${(parseFloat(formatWeiToEther(balance.coin_balance)) * parseFloat(balance.exchange_rate)).toFixed(2)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Token Holdings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Coins className="h-5 w-5" />
              Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tokens?.items.length || 0}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Token types held
            </div>
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ArrowRightLeft className="h-5 w-5" />
              Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {counters?.transactions_count ? parseInt(counters.transactions_count).toLocaleString() : (transactions?.items.length || 0)}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {counters?.transactions_count ? 'Total transactions' : 'Recent transactions'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats - Gas & Token Transfers */}
      {counters && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Token Transfers Counter */}
          {counters.token_transfers_count && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-5 w-5" />
                  Token Transfers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {parseInt(counters.token_transfers_count).toLocaleString()}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Total token transfers
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gas Usage */}
          {counters.gas_usage_count && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="h-5 w-5" />
                  Gas Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {parseInt(counters.gas_usage_count).toLocaleString()}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Total gas used
                </div>
              </CardContent>
            </Card>
          )}

          {/* Validations (if validator) */}
          {counters.validations_count && parseInt(counters.validations_count) > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Check className="h-5 w-5" />
                  Validations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {parseInt(counters.validations_count).toLocaleString()}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Blocks validated
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Contract Info (if applicable) */}
      {addressInfo.is_contract && (
        <Card>
          <CardHeader>
            <CardTitle>Contract Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {addressInfo.creator_address_hash && (
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                <span className="text-sm text-muted-foreground">Creator:</span>
                <Link
                  href={`/address/${addressInfo.creator_address_hash}`}
                  className="font-mono text-sm text-blue-600 hover:underline"
                >
                  {addressInfo.creator_address_hash}
                </Link>
              </div>
            )}
            {addressInfo.creation_tx_hash && (
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                <span className="text-sm text-muted-foreground">Creation Tx:</span>
                <Link
                  href={`/tx/${addressInfo.creation_tx_hash}`}
                  className="font-mono text-sm text-blue-600 hover:underline"
                >
                  {addressInfo.creation_tx_hash}
                </Link>
              </div>
            )}
            {addressInfo.is_verified && (
              <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/10">
                <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
                  <Check className="h-4 w-4" />
                  Contract Source Code Verified
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="transactions">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          {tokens && tokens.items.length > 0 && (
            <TabsTrigger value="tokens" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Tokens ({tokens.items.length})
            </TabsTrigger>
          )}
          <TabsTrigger value="nfts" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            NFTs
          </TabsTrigger>
          {addressInfo.is_contract && (
            <TabsTrigger value="contract" className="flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              Contract
            </TabsTrigger>
          )}
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          {transactions && transactions.items.length > 0 ? (
            <>
              <div className="flex justify-end">
                <ExportButton
                  onExport={() => {
                    const csv = transactionsToCSV(transactions.items);
                    const filename = generateFilename(`address_${address.slice(0, 8)}_transactions`);
                    downloadCSV(csv, filename);
                  }}
                />
              </div>
              <div className="space-y-4">
                {transactions.items.map((tx) => (
                  <TransactionCard key={tx.hash} tx={tx} showBlock />
                ))}
              </div>
              <Pagination
                currentPage={txPage}
                hasNextPage={!!transactions.next_page_params}
                onPageChange={setTxPage}
                className="py-4"
              />
            </>
          ) : (
            <EmptyState
              icon={ArrowRightLeft}
              title="No transactions found"
              description="This address has no transactions yet."
            />
          )}
        </TabsContent>

        {/* Tokens Tab */}
        {tokens && tokens.items.length > 0 && (
          <TabsContent value="tokens">
            <Card>
              <CardHeader>
                <CardTitle>Token Holdings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tokens.items.map((token) => (
                    <div
                      key={token.token.address}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-3">
                        {token.token.icon_url && (
                          <img
                            src={token.token.icon_url}
                            alt={token.token.name}
                            className="h-8 w-8 rounded-full"
                          />
                        )}
                        <div>
                          <Link
                            href={`/tokens/${token.token.address}`}
                            className="font-semibold text-blue-600 hover:underline"
                          >
                            {token.token.name}
                          </Link>
                          <div className="text-sm text-muted-foreground">{token.token.symbol}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-semibold">{token.value}</div>
                        <Badge variant="outline" className="mt-1">
                          {token.token.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* NFTs Tab */}
        <TabsContent value="nfts">
          <NFTGallery address={address} />
        </TabsContent>

        {/* Contract Tab */}
        {addressInfo.is_contract && (
          <TabsContent value="contract" className="space-y-6">
            <ContractVerification address={address} />
            <ContractInteraction address={address} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
