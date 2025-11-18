'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  useTransaction,
  useInternalTransactions,
  useTransactionLogs,
} from '@/lib/hooks/useTransactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { InternalTransactionsTree } from '@/components/transactions/InternalTransactionsTree';
import {
  formatTimeAgo,
  formatFullDate,
  formatWeiToEther,
  formatWeiToGwei,
  formatAddress,
  copyToClipboard,
} from '@/lib/utils/format';
import {
  ArrowLeft,
  Copy,
  Check,
  ArrowRightLeft,
  FileText,
  Zap,
  Hash,
} from 'lucide-react';

export default function TransactionDetailsPage({ params }: { params: { hash: string } }) {
  const { hash } = params;
  const { data: tx, isLoading, error, refetch } = useTransaction(hash);
  const { data: internalTxs } = useInternalTransactions(hash);
  const { data: logs } = useTransactionLogs(hash);
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
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/tx">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Transactions
          </Link>
        </Button>
        <ErrorState
          title="Failed to load transaction"
          message={(error as Error).message}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (!tx) {
    return (
      <ErrorState
        title="Transaction not found"
        message="The requested transaction could not be found."
      />
    );
  }

  const statusVariant = {
    ok: 'success' as const,
    error: 'destructive' as const,
    pending: 'warning' as const,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/tx">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <h1 className="break-all text-2xl font-bold sm:text-3xl">Transaction Details</h1>
          <div className="mt-2 flex items-center gap-2">
            <code className="text-sm text-muted-foreground sm:text-base">{hash}</code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(hash, 'hash')}
              className="h-6 w-6 p-0"
            >
              {copiedField === 'hash' ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
        <Badge variant={statusVariant[tx.status]} className="shrink-0">
          {tx.status.toUpperCase()}
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Overview
          </TabsTrigger>
          {internalTxs && internalTxs.length > 0 && (
            <TabsTrigger value="internal" className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" />
              Internal Txns ({internalTxs.length})
            </TabsTrigger>
          )}
          {logs && logs.length > 0 && (
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Logs ({logs.length})
            </TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Transaction Info */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status */}
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={statusVariant[tx.status]}>{tx.status.toUpperCase()}</Badge>
                </div>

                {/* Block */}
                {tx.block && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Block:</span>
                    <Link
                      href={`/blocks/${tx.block}`}
                      className="font-mono text-blue-600 hover:underline"
                    >
                      {tx.block.toLocaleString()}
                    </Link>
                  </div>
                )}

                {/* Timestamp */}
                {tx.timestamp && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Timestamp:</span>
                    <div className="text-right">
                      <div className="font-medium">{formatTimeAgo(new Date(tx.timestamp))}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatFullDate(new Date(tx.timestamp))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Confirmations */}
                {tx.confirmations && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Confirmations:</span>
                    <span className="font-semibold">{tx.confirmations.toLocaleString()}</span>
                  </div>
                )}

                {/* Method */}
                {tx.method && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Method:</span>
                    <Badge variant="outline" className="font-mono">
                      {tx.method}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Addresses */}
            <Card>
              <CardHeader>
                <CardTitle>From / To</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* From */}
                <div>
                  <div className="mb-2 text-sm text-muted-foreground">From:</div>
                  <Link
                    href={`/address/${tx.from}`}
                    className="block break-all rounded bg-muted p-3 font-mono text-sm text-blue-600 hover:underline"
                  >
                    {tx.from}
                  </Link>
                </div>

                {/* To */}
                <div>
                  <div className="mb-2 text-sm text-muted-foreground">To:</div>
                  {tx.to ? (
                    <Link
                      href={`/address/${tx.to}`}
                      className="block break-all rounded bg-muted p-3 font-mono text-sm text-blue-600 hover:underline"
                    >
                      {tx.to}
                    </Link>
                  ) : (
                    <div className="rounded bg-muted p-3 text-sm italic text-muted-foreground">
                      [Contract Creation]
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Value & Fee */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Value
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="text-xl font-bold">{formatWeiToEther(tx.value)} ANDE</span>
                </div>

                {/* Transaction Fee */}
                {tx.fee && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Transaction Fee:</span>
                    <span className="font-mono">{formatWeiToEther(tx.fee.value)} ANDE</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gas */}
            <Card>
              <CardHeader>
                <CardTitle>Gas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Gas Price */}
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Gas Price:</span>
                  <span className="font-mono">{formatWeiToGwei(tx.gas_price)} Gwei</span>
                </div>

                {/* Gas Limit */}
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Gas Limit:</span>
                  <span className="font-mono">{parseInt(tx.gas_limit).toLocaleString()}</span>
                </div>

                {/* Gas Used */}
                {tx.gas_used && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Gas Used:</span>
                    <span className="font-mono font-semibold">
                      {parseInt(tx.gas_used).toLocaleString()} (
                      {((parseInt(tx.gas_used) / parseInt(tx.gas_limit)) * 100).toFixed(2)}%)
                    </span>
                  </div>
                )}

                {/* Max Fee Per Gas (EIP-1559) */}
                {tx.max_fee_per_gas && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Max Fee Per Gas:</span>
                    <span className="font-mono">
                      {formatWeiToGwei(tx.max_fee_per_gas)} Gwei
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Input Data */}
          {tx.raw_input && tx.raw_input !== '0x' && (
            <Card>
              <CardHeader>
                <CardTitle>Input Data</CardTitle>
              </CardHeader>
              <CardContent>
                <code className="block break-all rounded bg-muted p-4 font-mono text-xs">
                  {tx.raw_input}
                </code>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Internal Transactions Tab */}
        {internalTxs && internalTxs.length > 0 && (
          <TabsContent value="internal">
            <InternalTransactionsTree transactions={internalTxs} />
          </TabsContent>
        )}

        {/* Logs Tab */}
        {logs && logs.length > 0 && (
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Event Logs ({logs.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {logs.map((log, index) => (
                    <div key={index} className="rounded-lg border p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-semibold">Log Index: {log.index}</span>
                        <Link
                          href={`/address/${log.address}`}
                          className="font-mono text-sm text-blue-600 hover:underline"
                        >
                          {formatAddress(log.address)}
                        </Link>
                      </div>
                      <div className="space-y-2 text-sm">
                        {log.topics.map((topic, i) => (
                          <div key={i}>
                            <span className="text-muted-foreground">Topic {i}:</span>
                            <code className="ml-2 font-mono text-xs">{topic}</code>
                          </div>
                        ))}
                        {log.data && (
                          <div>
                            <span className="text-muted-foreground">Data:</span>
                            <code className="ml-2 break-all font-mono text-xs">{log.data}</code>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
