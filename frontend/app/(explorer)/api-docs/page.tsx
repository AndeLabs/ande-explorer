'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { copyToClipboard } from '@/lib/utils/format';
import {
  BookOpen,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Code,
  Terminal,
} from 'lucide-react';

interface ApiEndpoint {
  method: 'GET' | 'POST';
  path: string;
  description: string;
  parameters?: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  example?: string;
  response?: string;
}

interface ApiSection {
  title: string;
  description: string;
  endpoints: ApiEndpoint[];
}

const API_SECTIONS: ApiSection[] = [
  {
    title: 'Blocks',
    description: 'Retrieve block information and statistics',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v2/blocks',
        description: 'Get a list of blocks with pagination',
        parameters: [
          { name: 'type', type: 'string', required: false, description: 'Block type filter: "block" or "reorg"' },
        ],
        example: 'curl "https://explorer.ande.network/api/v2/blocks"',
        response: '{"items": [{"height": 12345, "hash": "0x...", ...}], "next_page_params": {...}}',
      },
      {
        method: 'GET',
        path: '/api/v2/blocks/{height_or_hash}',
        description: 'Get block details by height or hash',
        parameters: [
          { name: 'height_or_hash', type: 'string', required: true, description: 'Block number or hash' },
        ],
        example: 'curl "https://explorer.ande.network/api/v2/blocks/12345"',
      },
    ],
  },
  {
    title: 'Transactions',
    description: 'Query transaction data and details',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v2/transactions',
        description: 'Get a list of transactions with pagination',
        parameters: [
          { name: 'filter', type: 'string', required: false, description: 'Filter by type: "pending", "validated"' },
        ],
        example: 'curl "https://explorer.ande.network/api/v2/transactions"',
      },
      {
        method: 'GET',
        path: '/api/v2/transactions/{hash}',
        description: 'Get transaction details by hash',
        parameters: [
          { name: 'hash', type: 'string', required: true, description: 'Transaction hash (0x...)' },
        ],
        example: 'curl "https://explorer.ande.network/api/v2/transactions/0x..."',
      },
      {
        method: 'GET',
        path: '/api/v2/transactions/{hash}/internal-transactions',
        description: 'Get internal transactions for a transaction',
        example: 'curl "https://explorer.ande.network/api/v2/transactions/0x.../internal-transactions"',
      },
      {
        method: 'GET',
        path: '/api/v2/transactions/{hash}/logs',
        description: 'Get event logs for a transaction',
        example: 'curl "https://explorer.ande.network/api/v2/transactions/0x.../logs"',
      },
    ],
  },
  {
    title: 'Addresses',
    description: 'Address balances, transactions, and token holdings',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v2/addresses/{address}',
        description: 'Get address information',
        parameters: [
          { name: 'address', type: 'string', required: true, description: 'Address (0x...)' },
        ],
        example: 'curl "https://explorer.ande.network/api/v2/addresses/0x..."',
      },
      {
        method: 'GET',
        path: '/api/v2/addresses/{address}/transactions',
        description: 'Get transactions for an address',
        parameters: [
          { name: 'filter', type: 'string', required: false, description: 'Filter: "to", "from"' },
        ],
        example: 'curl "https://explorer.ande.network/api/v2/addresses/0x.../transactions"',
      },
      {
        method: 'GET',
        path: '/api/v2/addresses/{address}/token-balances',
        description: 'Get token balances for an address',
        example: 'curl "https://explorer.ande.network/api/v2/addresses/0x.../token-balances"',
      },
      {
        method: 'GET',
        path: '/api/v2/addresses/{address}/counters',
        description: 'Get address statistics counters',
        example: 'curl "https://explorer.ande.network/api/v2/addresses/0x.../counters"',
      },
    ],
  },
  {
    title: 'Tokens',
    description: 'Token information and transfers',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v2/tokens',
        description: 'Get a list of tokens',
        parameters: [
          { name: 'q', type: 'string', required: false, description: 'Search query' },
          { name: 'type', type: 'string', required: false, description: 'Token type: "ERC-20", "ERC-721", "ERC-1155"' },
        ],
        example: 'curl "https://explorer.ande.network/api/v2/tokens?type=ERC-20"',
      },
      {
        method: 'GET',
        path: '/api/v2/tokens/{address}',
        description: 'Get token details by contract address',
        example: 'curl "https://explorer.ande.network/api/v2/tokens/0x..."',
      },
      {
        method: 'GET',
        path: '/api/v2/tokens/{address}/transfers',
        description: 'Get token transfers',
        example: 'curl "https://explorer.ande.network/api/v2/tokens/0x.../transfers"',
      },
      {
        method: 'GET',
        path: '/api/v2/tokens/{address}/holders',
        description: 'Get token holders',
        example: 'curl "https://explorer.ande.network/api/v2/tokens/0x.../holders"',
      },
    ],
  },
  {
    title: 'Smart Contracts',
    description: 'Contract verification and interaction',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v2/smart-contracts/{address}',
        description: 'Get contract information and ABI',
        example: 'curl "https://explorer.ande.network/api/v2/smart-contracts/0x..."',
      },
      {
        method: 'POST',
        path: '/api/v2/smart-contracts/{address}/query-read-method',
        description: 'Call a read method on a verified contract',
        parameters: [
          { name: 'args', type: 'array', required: true, description: 'Method arguments' },
          { name: 'method_id', type: 'string', required: true, description: 'Method selector (4 bytes)' },
        ],
        example: 'curl -X POST "https://explorer.ande.network/api/v2/smart-contracts/0x.../query-read-method" -d \'{"args": [], "method_id": "0x..."}\'',
      },
    ],
  },
  {
    title: 'Statistics',
    description: 'Network statistics and charts',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v2/stats',
        description: 'Get network statistics',
        example: 'curl "https://explorer.ande.network/api/v2/stats"',
        response: '{"total_blocks": "12345", "total_transactions": "67890", ...}',
      },
      {
        method: 'GET',
        path: '/api/v2/stats/charts/transactions',
        description: 'Get daily transaction count chart data',
        example: 'curl "https://explorer.ande.network/api/v2/stats/charts/transactions"',
      },
      {
        method: 'GET',
        path: '/api/v2/stats/charts/market',
        description: 'Get market chart data',
        example: 'curl "https://explorer.ande.network/api/v2/stats/charts/market"',
      },
    ],
  },
  {
    title: 'Search',
    description: 'Universal search across the network',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v2/search',
        description: 'Search for addresses, transactions, blocks, and tokens',
        parameters: [
          { name: 'q', type: 'string', required: true, description: 'Search query' },
        ],
        example: 'curl "https://explorer.ande.network/api/v2/search?q=0x..."',
      },
      {
        method: 'GET',
        path: '/api/v2/search/quick',
        description: 'Quick search with limited results',
        example: 'curl "https://explorer.ande.network/api/v2/search/quick?q=token"',
      },
    ],
  },
];

export default function ApiDocsPage() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Blocks']));
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const toggleSection = (title: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(title)) {
      newExpanded.delete(title);
    } else {
      newExpanded.add(title);
    }
    setExpandedSections(newExpanded);
  };

  const handleCopy = async (text: string, field: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const getMethodColor = (method: string) => {
    return method === 'GET'
      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">API Documentation</h1>
        </div>
        <p className="text-muted-foreground">
          The ANDE Explorer provides a comprehensive REST API for accessing blockchain data.
          All endpoints return JSON responses and support pagination where applicable.
        </p>
      </div>

      {/* Base URL */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Terminal className="h-5 w-5" />
            Base URL
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg bg-muted p-4">
            <code className="font-mono">https://explorer.ande.network/api/v2</code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy('https://explorer.ande.network/api/v2', 'base-url')}
            >
              {copiedField === 'base-url' ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limiting */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rate Limiting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>The API has rate limiting to ensure fair usage:</p>
          <ul className="list-inside list-disc space-y-1 text-muted-foreground">
            <li>50 requests per second per IP address</li>
            <li>Responses include rate limit headers</li>
            <li>Exceeding limits returns HTTP 429</li>
          </ul>
        </CardContent>
      </Card>

      {/* API Sections */}
      <div className="space-y-4">
        {API_SECTIONS.map((section) => (
          <Card key={section.title}>
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full text-left"
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
                </div>
                {expandedSections.has(section.title) ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </CardHeader>
            </button>

            {expandedSections.has(section.title) && (
              <CardContent className="space-y-4 border-t pt-4">
                {section.endpoints.map((endpoint, index) => (
                  <div key={index} className="rounded-lg border p-4">
                    {/* Endpoint header */}
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Badge className={getMethodColor(endpoint.method)}>{endpoint.method}</Badge>
                      <code className="font-mono text-sm">{endpoint.path}</code>
                    </div>

                    {/* Description */}
                    <p className="mb-3 text-sm text-muted-foreground">{endpoint.description}</p>

                    {/* Parameters */}
                    {endpoint.parameters && endpoint.parameters.length > 0 && (
                      <div className="mb-3">
                        <h4 className="mb-2 text-sm font-semibold">Parameters</h4>
                        <div className="space-y-2">
                          {endpoint.parameters.map((param) => (
                            <div key={param.name} className="flex items-start gap-2 text-sm">
                              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                                {param.name}
                              </code>
                              <span className="text-muted-foreground">
                                ({param.type}){param.required && <span className="text-red-500">*</span>}
                              </span>
                              <span className="text-muted-foreground">- {param.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Example */}
                    {endpoint.example && (
                      <div className="mb-3">
                        <div className="mb-2 flex items-center justify-between">
                          <h4 className="text-sm font-semibold">Example</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(endpoint.example!, `example-${index}`)}
                            className="h-6"
                          >
                            {copiedField === `example-${index}` ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <pre className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs">
                          {endpoint.example}
                        </pre>
                      </div>
                    )}

                    {/* Response */}
                    {endpoint.response && (
                      <div>
                        <h4 className="mb-2 text-sm font-semibold">Response</h4>
                        <pre className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs">
                          {endpoint.response}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* JSON-RPC */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Code className="h-5 w-5" />
            JSON-RPC Endpoint
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            For direct blockchain interaction via JSON-RPC, use the ANDE Chain RPC endpoint:
          </p>
          <div className="flex items-center justify-between rounded-lg bg-muted p-4">
            <code className="font-mono">https://rpc.ande.network</code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy('https://rpc.ande.network', 'rpc-url')}
            >
              {copiedField === 'rpc-url' ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="text-sm">
            <p className="font-semibold">Chain ID: 6174</p>
            <p className="text-muted-foreground">Supported methods: eth_*, net_*, web3_*</p>
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Support</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            For API support or to report issues, please visit our{' '}
            <a
              href="https://github.com/AndeLabs/ande-explorer"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              GitHub repository
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
