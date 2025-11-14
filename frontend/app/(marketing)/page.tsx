import { Hero } from '@/components/marketing/Hero';
import { StatsGrid } from '@/components/stats/StatsGrid';
import Link from 'next/link';
import { ArrowRight, Zap, Shield, BarChart3, Code, Coins, Image } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <Hero />

      <StatsGrid />

      {/* Features Section */}
      <section className="bg-muted/40 py-16">
        <div className="container-custom">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Powerful Features</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to explore the blockchain
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <Card className="p-6 card-hover">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Real-time Data</h3>
              <p className="text-sm text-muted-foreground">
                Get instant updates on blocks, transactions, and network stats with WebSocket connections.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="p-6 card-hover">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Contract Verification</h3>
              <p className="text-sm text-muted-foreground">
                Verify and interact with smart contracts. View source code, ABI, and contract methods.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="p-6 card-hover">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Analytics Dashboard</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive charts and statistics to analyze network activity and trends.
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className="p-6 card-hover">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
                <Code className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Developer API</h3>
              <p className="text-sm text-muted-foreground">
                RESTful API and WebSocket endpoints for building blockchain applications.
              </p>
            </Card>

            {/* Feature 5 */}
            <Card className="p-6 card-hover">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
                <Coins className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Token Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Track ERC-20, ERC-721, and ERC-1155 tokens with real-time prices and transfers.
              </p>
            </Card>

            {/* Feature 6 */}
            <Card className="p-6 card-hover">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-pink-100 dark:bg-pink-900/20">
                <Image className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">NFT Support</h3>
              <p className="text-sm text-muted-foreground">
                Browse and track NFTs with metadata, ownership history, and transfer details.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container-custom">
          <Card className="bg-gradient-to-br from-blue-600 to-purple-600 p-12 text-center text-white">
            <h2 className="mb-4 text-3xl font-bold">Start Exploring Now</h2>
            <p className="mb-8 text-xl text-blue-100">
              Search for any transaction, address, block, or token
            </p>
            <Link
              href="/blocks"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-blue-600 transition-all hover:bg-blue-50"
            >
              View Latest Blocks
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Card>
        </div>
      </section>
    </div>
  );
}
