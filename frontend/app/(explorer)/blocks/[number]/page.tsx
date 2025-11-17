/**
 * Block Detail Page - ANDE Explorer
 * Página completa de detalles de bloque con información profesional
 */

'use client';

import { use } from 'react';
import { useBlock } from '@/lib/hooks/useHybridData';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ number: string }>;
}

export default function BlockDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const blockNumber = BigInt(resolvedParams.number);

  const { data: block, isLoading, error } = useBlock(blockNumber);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !block) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-2">Block Not Found</h2>
          <p className="text-red-600">El bloque #{resolvedParams.number} no fue encontrado.</p>
        </div>
      </div>
    );
  }

  const timestamp = new Date(Number(block.timestamp) * 1000);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Block #{block.number.toString()}
        </h1>
        <p className="text-gray-600">
          {formatDistanceToNow(timestamp, { addSuffix: true, locale: es })}
        </p>
      </div>

      {/* Main Info Card */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-6">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
          <h2 className="text-lg font-semibold text-gray-900">Block Information</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {/* Block Height */}
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-sm font-medium text-gray-500">Block Height</div>
            <div className="md:col-span-2 text-sm text-gray-900 font-mono">
              {block.number.toString()}
            </div>
          </div>

          {/* Timestamp */}
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-sm font-medium text-gray-500">Timestamp</div>
            <div className="md:col-span-2">
              <div className="text-sm text-gray-900">
                {timestamp.toLocaleString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                ({formatDistanceToNow(timestamp, { addSuffix: true, locale: es })})
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-sm font-medium text-gray-500">Transactions</div>
            <div className="md:col-span-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {block.transactionCount} transactions
              </span>
            </div>
          </div>

          {/* Miner */}
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-sm font-medium text-gray-500">Miner</div>
            <div className="md:col-span-2">
              <Link
                href={`/address/${block.miner}`}
                className="text-sm text-blue-600 hover:text-blue-800 font-mono break-all"
              >
                {block.miner}
              </Link>
            </div>
          </div>

          {/* Gas Used */}
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-sm font-medium text-gray-500">Gas Used</div>
            <div className="md:col-span-2">
              <div className="text-sm text-gray-900 font-mono">
                {block.gasUsed.toLocaleString()}
                <span className="text-gray-500 ml-2">
                  ({((Number(block.gasUsed) / Number(block.gasLimit)) * 100).toFixed(2)}%)
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(Number(block.gasUsed) / Number(block.gasLimit)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Gas Limit */}
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-sm font-medium text-gray-500">Gas Limit</div>
            <div className="md:col-span-2 text-sm text-gray-900 font-mono">
              {block.gasLimit.toLocaleString()}
            </div>
          </div>

          {/* Base Fee Per Gas */}
          {block.baseFeePerGas && (
            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-sm font-medium text-gray-500">Base Fee Per Gas</div>
              <div className="md:col-span-2 text-sm text-gray-900 font-mono">
                {(Number(block.baseFeePerGas) / 1e9).toFixed(2)} Gwei
                <span className="text-gray-500 ml-2">
                  ({Number(block.baseFeePerGas).toLocaleString()} wei)
                </span>
              </div>
            </div>
          )}

          {/* Block Hash */}
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-sm font-medium text-gray-500">Block Hash</div>
            <div className="md:col-span-2 text-sm text-gray-900 font-mono break-all">
              {block.hash}
            </div>
          </div>

          {/* Parent Hash */}
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-sm font-medium text-gray-500">Parent Hash</div>
            <div className="md:col-span-2">
              <Link
                href={`/blocks/${(block.number - 1n).toString()}`}
                className="text-sm text-blue-600 hover:text-blue-800 font-mono break-all"
              >
                {block.parentHash}
              </Link>
            </div>
          </div>

          {/* Difficulty */}
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-sm font-medium text-gray-500">Difficulty</div>
            <div className="md:col-span-2 text-sm text-gray-900 font-mono">
              {block.difficulty.toLocaleString()}
            </div>
          </div>

          {/* Total Difficulty */}
          {block.totalDifficulty && (
            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-sm font-medium text-gray-500">Total Difficulty</div>
              <div className="md:col-span-2 text-sm text-gray-900 font-mono">
                {block.totalDifficulty.toLocaleString()}
              </div>
            </div>
          )}

          {/* Size */}
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-sm font-medium text-gray-500">Size</div>
            <div className="md:col-span-2 text-sm text-gray-900 font-mono">
              {block.size.toLocaleString()} bytes
            </div>
          </div>

          {/* Nonce */}
          {block.nonce && (
            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-sm font-medium text-gray-500">Nonce</div>
              <div className="md:col-span-2 text-sm text-gray-900 font-mono">
                {block.nonce}
              </div>
            </div>
          )}

          {/* Extra Data */}
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-sm font-medium text-gray-500">Extra Data</div>
            <div className="md:col-span-2 text-sm text-gray-900 font-mono break-all">
              {block.extraData}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        {block.number > 0n && (
          <Link
            href={`/blocks/${(block.number - 1n).toString()}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            ← Previous Block
          </Link>
        )}

        <Link
          href={`/blocks/${(block.number + 1n).toString()}`}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 ml-auto"
        >
          Next Block →
        </Link>
      </div>

      {/* Transactions List */}
      {block.transactionCount > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Transactions ({block.transactionCount})
            </h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-500">
              Ver transacciones en la lista de transacciones del bloque...
            </p>
            {/* TODO: Implementar lista de transacciones */}
          </div>
        </div>
      )}
    </div>
  );
}
