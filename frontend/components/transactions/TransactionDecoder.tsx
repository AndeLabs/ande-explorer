'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { copyToClipboard } from '@/lib/utils/format';
import {
  Code,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  FileCode2,
  Binary,
  Braces,
} from 'lucide-react';

interface DecodedInput {
  method_call: string;
  method_id: string;
  parameters: Array<{
    name: string;
    type: string;
    value: any;
  }>;
}

interface TransactionDecoderProps {
  rawInput: string;
  decodedInput: DecodedInput | null;
}

export function TransactionDecoder({ rawInput, decodedInput }: TransactionDecoderProps) {
  const [showRaw, setShowRaw] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [expandedParams, setExpandedParams] = useState<Set<number>>(new Set());

  const handleCopy = async (text: string, field: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const toggleParam = (index: number) => {
    const newExpanded = new Set(expandedParams);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedParams(newExpanded);
  };

  // If no input data
  if (!rawInput || rawInput === '0x') {
    return null;
  }

  // Format value for display
  const formatValue = (value: any, type: string): string => {
    if (value === null || value === undefined) return 'null';

    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length === 0) return '[]';
      return JSON.stringify(value, null, 2);
    }

    // Handle objects
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }

    // Handle booleans
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }

    // Handle big numbers
    if (type.includes('uint') || type.includes('int')) {
      try {
        const num = BigInt(value);
        return num.toLocaleString();
      } catch {
        return String(value);
      }
    }

    return String(value);
  };

  // Get type color
  const getTypeColor = (type: string): string => {
    if (type.includes('address')) return 'text-blue-600';
    if (type.includes('uint') || type.includes('int')) return 'text-green-600';
    if (type.includes('bool')) return 'text-purple-600';
    if (type.includes('bytes')) return 'text-orange-600';
    if (type.includes('string')) return 'text-pink-600';
    return 'text-muted-foreground';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Input Data
          </CardTitle>
          <div className="flex items-center gap-2">
            {decodedInput && (
              <Badge variant="success" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <FileCode2 className="mr-1 h-3 w-3" />
                Decoded
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRaw(!showRaw)}
              className="h-8"
            >
              {showRaw ? (
                <>
                  <Braces className="mr-2 h-3 w-3" />
                  Show Decoded
                </>
              ) : (
                <>
                  <Binary className="mr-2 h-3 w-3" />
                  Show Raw
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {showRaw || !decodedInput ? (
          /* Raw Input Data */
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Raw Input:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(rawInput, 'raw')}
                className="h-6"
              >
                {copiedField === 'raw' ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
            <code className="block max-h-64 overflow-auto break-all rounded-lg bg-muted p-4 font-mono text-xs">
              {rawInput}
            </code>

            {/* Method ID */}
            {rawInput.length >= 10 && (
              <div className="mt-4">
                <span className="text-sm font-medium text-muted-foreground">Method ID: </span>
                <code className="font-mono text-sm">{rawInput.slice(0, 10)}</code>
              </div>
            )}
          </div>
        ) : (
          /* Decoded Input Data */
          <div className="space-y-4">
            {/* Method Call */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="mb-1 text-sm text-muted-foreground">Function</div>
                  <code className="text-lg font-semibold">{decodedInput.method_call}</code>
                </div>
                <div className="text-right">
                  <div className="mb-1 text-sm text-muted-foreground">Method ID</div>
                  <code className="font-mono text-sm">{decodedInput.method_id}</code>
                </div>
              </div>
            </div>

            {/* Parameters */}
            {decodedInput.parameters.length > 0 && (
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Braces className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Parameters ({decodedInput.parameters.length})</span>
                </div>
                <div className="space-y-2">
                  {decodedInput.parameters.map((param, index) => {
                    const isExpanded = expandedParams.has(index);
                    const formattedValue = formatValue(param.value, param.type);
                    const isLongValue = formattedValue.length > 66 || formattedValue.includes('\n');

                    return (
                      <div
                        key={index}
                        className="rounded-lg border bg-card"
                      >
                        <button
                          onClick={() => isLongValue && toggleParam(index)}
                          className={`flex w-full items-center justify-between p-3 text-left ${
                            isLongValue ? 'cursor-pointer hover:bg-muted/50' : 'cursor-default'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {isLongValue && (
                              isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )
                            )}
                            <div>
                              <span className="font-mono font-medium">{param.name || `param${index}`}</span>
                              <span className={`ml-2 text-sm ${getTypeColor(param.type)}`}>
                                ({param.type})
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(String(param.value), `param-${index}`);
                            }}
                            className="h-6"
                          >
                            {copiedField === `param-${index}` ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </button>

                        <div className={`border-t px-3 pb-3 pt-2 ${isLongValue && !isExpanded ? 'hidden' : ''}`}>
                          <pre className="overflow-auto rounded bg-muted p-2 font-mono text-sm">
                            {formattedValue}
                          </pre>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No parameters */}
            {decodedInput.parameters.length === 0 && (
              <div className="rounded-lg border p-4 text-center text-sm text-muted-foreground">
                This function has no parameters
              </div>
            )}
          </div>
        )}

        {/* Info about decoding */}
        <div className="mt-4 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          <strong>About Input Data:</strong> This is the data sent to the contract when calling a function.
          Decoded data shows the function name and parameters in a human-readable format.
        </div>
      </CardContent>
    </Card>
  );
}
