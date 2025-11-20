'use client';

/**
 * Network Links Card
 *
 * Displays useful network links (RPC, Faucet, Docs, etc.)
 * Automatically shows/hides links based on configuration.
 */

import { useNetworkConfig } from '@/lib/hooks/useNetworkInfo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Droplet, Code, FileText, Globe, Github } from 'lucide-react';

interface LinkItem {
  label: string;
  url: string;
  icon: React.ReactNode;
  description: string;
}

export function NetworkLinksCard() {
  const network = useNetworkConfig();

  // Build links array from configuration
  const links: LinkItem[] = [];

  if (network.links.rpc) {
    links.push({
      label: 'RPC Endpoint',
      url: network.links.rpc,
      icon: <Code className="h-4 w-4" />,
      description: 'Connect your wallet or dApp',
    });
  }

  if (network.links.faucet) {
    links.push({
      label: 'Faucet',
      url: network.links.faucet,
      icon: <Droplet className="h-4 w-4" />,
      description: 'Get test tokens',
    });
  }

  if (network.links.docs) {
    links.push({
      label: 'Documentation',
      url: network.links.docs,
      icon: <FileText className="h-4 w-4" />,
      description: 'Learn about the network',
    });
  }

  if (network.links.website) {
    links.push({
      label: 'Website',
      url: network.links.website,
      icon: <Globe className="h-4 w-4" />,
      description: 'Official website',
    });
  }

  if (network.links.github) {
    links.push({
      label: 'GitHub',
      url: network.links.github,
      icon: <Github className="h-4 w-4" />,
      description: 'Source code',
    });
  }

  // Don't render if no links are configured
  if (links.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5 text-primary" />
          Quick Links
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button
                variant="outline"
                className="h-auto w-full justify-start p-4 hover:bg-muted/50"
              >
                <div className="flex w-full items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {link.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">{link.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {link.description}
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
              </Button>
            </a>
          ))}
        </div>

        {/* RPC Info Box */}
        {network.links.rpc && (
          <div className="mt-4 rounded-lg bg-muted/50 p-3">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">
              Add to MetaMask:
            </p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network Name:</span>
                <span className="font-mono font-semibold">{network.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Chain ID:</span>
                <span className="font-mono font-semibold">{network.chainId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Currency:</span>
                <span className="font-mono font-semibold">{network.currency.symbol}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
