'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useContract } from '@/lib/hooks/useContract';
import { api } from '@/lib/api/client';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BookOpen,
  PenTool,
  Play,
  Loader2,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Wallet,
} from 'lucide-react';

interface ContractInteractionProps {
  address: string;
}

interface MethodInput {
  name: string;
  type: string;
}

interface ContractMethod {
  name: string;
  type: 'function';
  stateMutability: 'view' | 'pure' | 'nonpayable' | 'payable';
  inputs: MethodInput[];
  outputs: MethodInput[];
}

export function ContractInteraction({ address }: ContractInteractionProps) {
  const { data: contract, isLoading, error } = useContract(address);
  const [expandedMethods, setExpandedMethods] = useState<Set<string>>(new Set());
  const [methodInputs, setMethodInputs] = useState<Record<string, Record<string, string>>>({});
  const [methodResults, setMethodResults] = useState<Record<string, any>>({});
  const [loadingMethods, setLoadingMethods] = useState<Set<string>>(new Set());
  const [methodErrors, setMethodErrors] = useState<Record<string, string>>({});

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
  if (error || !contract?.is_verified || !contract?.abi) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            Contract Interaction Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This contract must be verified to interact with it. Once verified, you can read and write to the contract.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Parse ABI to get methods
  const methods: ContractMethod[] = contract.abi.filter(
    (item: any) => item.type === 'function'
  );

  const readMethods = methods.filter(
    (m) => m.stateMutability === 'view' || m.stateMutability === 'pure'
  );

  const writeMethods = methods.filter(
    (m) => m.stateMutability === 'nonpayable' || m.stateMutability === 'payable'
  );

  const toggleMethod = (methodName: string) => {
    const newExpanded = new Set(expandedMethods);
    if (newExpanded.has(methodName)) {
      newExpanded.delete(methodName);
    } else {
      newExpanded.add(methodName);
    }
    setExpandedMethods(newExpanded);
  };

  const handleInputChange = (methodName: string, inputName: string, value: string) => {
    setMethodInputs((prev) => ({
      ...prev,
      [methodName]: {
        ...prev[methodName],
        [inputName]: value,
      },
    }));
  };

  const executeReadMethod = async (method: ContractMethod) => {
    const methodKey = method.name;

    // Set loading
    setLoadingMethods((prev) => new Set(prev).add(methodKey));
    setMethodErrors((prev) => ({ ...prev, [methodKey]: '' }));

    try {
      // Get input values
      const args = method.inputs.map((input) => {
        const value = methodInputs[methodKey]?.[input.name] || '';
        // Parse arrays if needed
        if (input.type.includes('[]')) {
          try {
            return JSON.parse(value);
          } catch {
            return value.split(',').map((v) => v.trim());
          }
        }
        return value;
      });

      // Call the contract method
      const result = await api.readContract(address, method.name, args);

      setMethodResults((prev) => ({
        ...prev,
        [methodKey]: result,
      }));
    } catch (err) {
      setMethodErrors((prev) => ({
        ...prev,
        [methodKey]: err instanceof Error ? err.message : 'Failed to execute method',
      }));
    } finally {
      setLoadingMethods((prev) => {
        const newSet = new Set(prev);
        newSet.delete(methodKey);
        return newSet;
      });
    }
  };

  const renderMethodCard = (method: ContractMethod, isWrite: boolean) => {
    const methodKey = method.name;
    const isExpanded = expandedMethods.has(methodKey);
    const isLoading = loadingMethods.has(methodKey);
    const result = methodResults[methodKey];
    const error = methodErrors[methodKey];

    return (
      <div
        key={methodKey}
        className="rounded-lg border bg-card transition-colors hover:bg-muted/30"
      >
        {/* Method Header */}
        <button
          onClick={() => toggleMethod(methodKey)}
          className="flex w-full items-center justify-between p-4 text-left"
        >
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="font-mono font-semibold">{method.name}</span>
            {method.stateMutability === 'payable' && (
              <Badge variant="warning" className="text-xs">
                payable
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {method.inputs.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {method.inputs.length} input{method.inputs.length !== 1 ? 's' : ''}
              </Badge>
            )}
            {method.outputs.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {method.outputs.length} output{method.outputs.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </button>

        {/* Method Body */}
        {isExpanded && (
          <div className="border-t p-4">
            {/* Inputs */}
            {method.inputs.length > 0 && (
              <div className="mb-4 space-y-3">
                <div className="text-sm font-medium text-muted-foreground">Inputs:</div>
                {method.inputs.map((input, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-32 shrink-0">
                      <span className="font-mono text-sm">{input.name}</span>
                      <span className="ml-1 text-xs text-muted-foreground">({input.type})</span>
                    </div>
                    <Input
                      placeholder={`Enter ${input.type}`}
                      value={methodInputs[methodKey]?.[input.name] || ''}
                      onChange={(e) => handleInputChange(methodKey, input.name, e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Execute Button */}
            {isWrite ? (
              <Button disabled className="w-full gap-2">
                <Wallet className="h-4 w-4" />
                Connect Wallet to Write
              </Button>
            ) : (
              <Button
                onClick={() => executeReadMethod(method)}
                disabled={isLoading}
                className="w-full gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Querying...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Query
                  </>
                )}
              </Button>
            )}

            {/* Result */}
            {result !== undefined && (
              <div className="mt-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Result:
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <pre className="overflow-auto font-mono text-sm">
                    {typeof result === 'object'
                      ? JSON.stringify(result, null, 2)
                      : String(result)}
                  </pre>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  Error:
                </div>
                <div className="rounded-lg bg-destructive/10 p-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </div>
            )}

            {/* Output Types */}
            {method.outputs.length > 0 && !result && (
              <div className="mt-4 text-xs text-muted-foreground">
                <span className="font-medium">Returns: </span>
                {method.outputs.map((o) => `${o.name || 'value'} (${o.type})`).join(', ')}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Contract Interaction
          </CardTitle>
          <Badge variant="success" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            {methods.length} Methods
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Read and write to the contract using its verified ABI
        </p>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="read" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="read" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Read ({readMethods.length})
            </TabsTrigger>
            <TabsTrigger value="write" className="flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              Write ({writeMethods.length})
            </TabsTrigger>
          </TabsList>

          {/* Read Tab */}
          <TabsContent value="read" className="mt-4 space-y-3">
            {readMethods.length > 0 ? (
              readMethods.map((method) => renderMethodCard(method, false))
            ) : (
              <div className="rounded-lg border p-8 text-center text-muted-foreground">
                No read methods available
              </div>
            )}
          </TabsContent>

          {/* Write Tab */}
          <TabsContent value="write" className="mt-4 space-y-3">
            <div className="mb-4 rounded-lg bg-blue-50 p-4 text-sm dark:bg-blue-900/10">
              <div className="flex items-start gap-2">
                <Wallet className="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-semibold text-blue-900 dark:text-blue-100">
                    Wallet Connection Required
                  </p>
                  <p className="mt-1 text-blue-800 dark:text-blue-200">
                    To write to this contract, you need to connect your Web3 wallet (MetaMask, etc.).
                    Make sure you're connected to ANDE Chain (Chain ID: 6174).
                  </p>
                </div>
              </div>
            </div>

            {writeMethods.length > 0 ? (
              writeMethods.map((method) => renderMethodCard(method, true))
            ) : (
              <div className="rounded-lg border p-8 text-center text-muted-foreground">
                No write methods available
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
