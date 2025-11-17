import Image from 'next/image';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { config } from '@/lib/config';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 py-20 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />

      <div className="container-custom relative">
        <div className="mx-auto max-w-3xl text-center">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <Image
              src="/logo-192.png"
              alt="ANDE Logo"
              width={120}
              height={120}
              className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 drop-shadow-2xl"
              priority
            />
          </div>

          {/* Title */}
          <h1 className="mb-4 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            Explore {config.chain.name}
          </h1>

          {/* Subtitle */}
          <p className="mb-8 text-xl text-blue-100 sm:text-2xl">
            Fast, Reliable, and Professional Blockchain Explorer
          </p>

          {/* Search */}
          <div className="mx-auto max-w-2xl">
            <GlobalSearch className="mb-6" />
          </div>

          {/* Info */}
          <p className="text-sm text-blue-200">
            Search for blocks, transactions, addresses, tokens, and smart contracts
          </p>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full text-background"
        >
          <path
            d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
}
