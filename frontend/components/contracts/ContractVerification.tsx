'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useContract } from '@/lib/hooks/useContract';
import { Skeleton } from '@/components/ui/skeleton';
import { copyToClipboard, formatAddress } from '@/lib/utils/format';
import {
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  FileCode,
  FileJson,
  Settings,
  Shield,
  Code2,
  Layers,
} from 'lucide-react';
import Link from 'next/link';

interface ContractVerificationProps {
  address: string;
}

export function ContractVerification({ address }: ContractVerificationProps) {
  const { data: contract, isLoading, error } = useContract(address);
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
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Error or not verified
  if (error || !contract?.is_verified) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-muted-foreground" />
            Contract Not Verified
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This contract has not been verified on the blockchain explorer.
            Verification allows users to read and interact with the contract's source code.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Format ABI for display
  const formattedABI = contract.abi ? JSON.stringify(contract.abi, null, 2) : 'No ABI available';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Contract Verified
          </CardTitle>
          <Badge variant="success" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Verified
          </Badge>
        </div>
        {contract.verified_at && (
          <p className="text-sm text-muted-foreground">
            Verified on {new Date(contract.verified_at).toLocaleDateString()}
          </p>
        )}
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="code" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="code" className="flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              Source Code
            </TabsTrigger>
            <TabsTrigger value="abi" className="flex items-center gap-2">
              <FileJson className="h-4 w-4" />
              ABI
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Source Code Tab */}
          <TabsContent value="code" className="space-y-4">
            {/* Contract Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <span className="text-sm text-muted-foreground">Contract Name:</span>
                <div className="mt-1 font-semibold">{contract.name || 'Unknown'}</div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Language:</span>
                <div className="mt-1 font-semibold capitalize">{contract.language || 'Solidity'}</div>
              </div>
            </div>

            {/* Source Code */}
            <div className="relative">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Source Code</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(contract.source_code || '', 'source')}
                  className="h-8"
                >
                  {copiedField === 'source' ? (
                    <>
                      <Check className="mr-2 h-3 w-3 text-green-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-3 w-3" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="max-h-[600px] overflow-auto rounded-lg border bg-muted/50">
                <pre className="p-4 text-xs leading-relaxed">
                  <code className="font-mono">{contract.source_code || 'No source code available'}</code>
                </pre>
              </div>
            </div>

            {/* Constructor Arguments */}
            {contract.has_constructor_args && contract.constructor_args && (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Constructor Arguments (ABI-Encoded)</span>
                </div>
                <div className="rounded-lg border bg-muted/50 p-4">
                  <code className="break-all font-mono text-xs">{contract.constructor_args}</code>
                </div>
              </div>
            )}

            {/* External Libraries */}
            {contract.external_libraries && contract.external_libraries.length > 0 && (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">External Libraries</span>
                </div>
                <div className="space-y-2">
                  {contract.external_libraries.map((lib: any, index: number) => (
                    <div key={index} className="rounded-lg border bg-muted/50 p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm">{lib.name}</span>
                        <Link
                          href={`/address/${lib.address}`}
                          className="font-mono text-sm text-blue-600 hover:underline"
                        >
                          {formatAddress(lib.address)}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ABI Tab */}
          <TabsContent value="abi" className="space-y-4">
            <div className="relative">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileJson className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Contract ABI</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(formattedABI, 'abi')}
                  className="h-8"
                >
                  {copiedField === 'abi' ? (
                    <>
                      <Check className="mr-2 h-3 w-3 text-green-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-3 w-3" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="max-h-[600px] overflow-auto rounded-lg border bg-muted/50">
                <pre className="p-4 text-xs leading-relaxed">
                  <code className="font-mono">{formattedABI}</code>
                </pre>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              The Contract Application Binary Interface (ABI) is the standard way to interact with contracts
              in the Ethereum ecosystem, both from outside the blockchain and for contract-to-contract interaction.
            </p>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Compiler Info */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Compiler Settings</span>
              </div>
              <div className="grid gap-4 rounded-lg border bg-muted/50 p-4 md:grid-cols-2">
                <div>
                  <span className="text-sm text-muted-foreground">Compiler Version:</span>
                  <div className="mt-1 font-mono text-sm">{contract.compiler_version || 'Unknown'}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Optimization:</span>
                  <div className="mt-1">
                    <Badge variant={contract.optimization_enabled ? 'success' : 'secondary'}>
                      {contract.optimization_enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Language:</span>
                  <div className="mt-1 font-mono text-sm capitalize">{contract.language || 'Solidity'}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">License:</span>
                  <div className="mt-1 font-mono text-sm">{contract.license_type || 'None'}</div>
                </div>
              </div>
            </div>

            {/* Proxy Info */}
            {contract.is_proxy && (
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Proxy Contract</span>
                </div>
                <div className="rounded-lg border bg-blue-50 p-4 dark:bg-blue-900/20">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    This is a proxy contract. It delegates calls to implementation contracts.
                  </p>
                  {contract.implementations && contract.implementations.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Implementation Contracts:
                      </span>
                      {contract.implementations.map((impl: any, index: number) => (
                        <Link
                          key={index}
                          href={`/address/${impl.address}`}
                          className="block font-mono text-sm text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {impl.name || formatAddress(impl.address)}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <h4 className="mb-2 text-sm font-semibold">About Contract Verification</h4>
              <p className="text-sm text-muted-foreground">
                Contract verification allows you to review the source code and interact with the contract's
                methods. Verified contracts increase transparency and trust in the blockchain ecosystem.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
