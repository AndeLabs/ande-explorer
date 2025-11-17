# ANDE Explorer 🔍

> Professional blockchain explorer for ANDE Chain - Fast, Modern, and User-Friendly

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

## ✨ Features

- 🚀 **Real-time Updates** - Live block and transaction feed via WebSocket
- ⚡ **Lightning Fast** - Direct RPC connection with intelligent caching
- 🎨 **Modern UI** - Clean design with ANDE institutional colors
- 📱 **Responsive** - Optimized for all devices
- 🔍 **Smart Search** - Find blocks, transactions, and addresses instantly
- 📊 **Network Stats** - Live metrics and analytics dashboard
- 🌐 **Multi-chain Ready** - Built for scalability

## 🎯 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- ANDE Chain RPC endpoint (default: `http://192.168.0.8:8545`)

### Installation

```bash
# Clone the repository
git clone https://github.com/AndeLabs/ande-explorer.git
cd ande-explorer

# Install dependencies
cd frontend
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your RPC endpoint

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
# RPC Configuration
NEXT_PUBLIC_RPC_URL=http://192.168.0.8:8545
NEXT_PUBLIC_WS_URL=ws://192.168.0.8:8546

# Chain Configuration
NEXT_PUBLIC_CHAIN_ID=42170
NEXT_PUBLIC_CHAIN_NAME=Ande Chain

# Features
NEXT_PUBLIC_ENABLE_WEBSOCKETS=true
NEXT_PUBLIC_SHOW_GAS_TRACKER=true
```

See [.env.example](./frontend/.env.example) for all available options.

## 🏗️ Architecture

ANDE Explorer uses a modern, performance-optimized architecture:

```
┌─────────────────┐
│   Next.js App   │  ← React 18, App Router, RSC
├─────────────────┤
│  React Query    │  ← Data fetching, caching
├─────────────────┤
│  viem Client    │  ← Direct RPC connection
├─────────────────┤
│  ANDE Chain     │  ← http://192.168.0.8:8545
└─────────────────┘
```

### Key Technologies

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom ANDE theme
- **Data Fetching**: TanStack Query + viem
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation.

## 🎨 Design System

ANDE Explorer uses the official ANDE institutional color palette:

### Primary Colors
- **Azul Profundo** `#2455B8` - Headers, primary buttons, key links
- **Naranja Vibrante** `#FF9F1C` - Call-to-action, highlights

### Secondary Colors
- **Lavanda Suave** `#BFA4FF` - Alternate backgrounds, cards
- **Durazno Claro** `#FFC77D` - Soft backgrounds, secondary elements

### Neutral Colors
- **Gris Claro** `#F4F4F4` - Clean backgrounds
- **Gris Medio** `#9A9A9A` - Secondary text
- **Gris Oscuro** `#393939` - Primary text

## 📦 Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

See [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🔍 Usage Examples

### Search for a Block

Navigate to `/blocks/12345` or use the search bar:

```typescript
// Programmatic search
import { useBlock } from '@/lib/hooks/useBlocksRPC';

const { data: block } = useBlock(12345n);
```

### Get Address Balance

```typescript
import { useAddressBalance } from '@/lib/hooks/useAddressRPC';

const { data: balance } = useAddressBalance('0x...');
console.log(balance.formatted); // "1.234 ETH"
```

### Watch New Blocks

```typescript
import { useWatchBlocks } from '@/lib/hooks/useBlocksRPC';

useWatchBlocks((block) => {
  console.log('New block:', block.number);
});
```

## 🧪 Development

### Run Tests

```bash
npm run test
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

### Format Code

```bash
npm run format
```

## 📊 Performance

ANDE Explorer is optimized for speed:

- **First Contentful Paint**: < 1.0s
- **Largest Contentful Paint**: < 2.5s  
- **Time to Interactive**: < 3.0s
- **API Response Time**: < 200ms

Performance is continuously monitored and optimized.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.

## 🔗 Links

- **Live Explorer**: [https://explorer.ande.network](https://explorer.ande.network)
- **ANDE Chain**: [https://github.com/AndeLabs/ande-chain](https://github.com/AndeLabs/ande-chain)
- **Documentation**: [https://docs.ande.network](https://docs.ande.network)
- **Discord**: [https://discord.gg/andechain](https://discord.gg/andechain)

## 👥 Team

Built with ❤️ by [ANDE Labs](https://ande.network)

## 🙏 Acknowledgments

- [Blockscout](https://github.com/blockscout/blockscout) - Architecture inspiration
- [viem](https://viem.sh/) - Excellent Ethereum library
- [TanStack Query](https://tanstack.com/query) - Powerful data synchronization
- [Next.js](https://nextjs.org/) - Amazing React framework

---

**Status**: Production Ready (MVP)  
**Version**: 2.0.0  
**Last Updated**: 2025-11-16
