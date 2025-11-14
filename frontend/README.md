# ANDE Explorer - Frontend

Professional blockchain explorer for Ande Chain built with Next.js 14, React 18, and TypeScript.

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript 5
- **Styling**: TailwindCSS 3
- **Data Fetching**: TanStack Query (React Query)
- **API Client**: Axios
- **Blockchain Utils**: Viem
- **Charts**: Recharts
- **Icons**: Lucide React
- **Theme**: next-themes
- **State Management**: Zustand

## 📁 Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── (marketing)/             # Marketing pages (Home, etc.)
│   ├── (explorer)/              # Explorer pages (Blocks, Tx, Address)
│   ├── api/                     # API routes
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/
│   ├── ui/                      # Reusable UI components (Shadcn)
│   ├── blocks/                  # Block-specific components
│   ├── transactions/            # Transaction components
│   ├── address/                 # Address components
│   ├── tokens/                  # Token components
│   ├── stats/                   # Statistics components
│   ├── charts/                  # Chart components
│   ├── search/                  # Search components
│   └── layout/                  # Layout components (Header, Footer)
├── lib/
│   ├── api/                     # API client
│   ├── hooks/                   # React hooks
│   ├── utils/                   # Utility functions
│   ├── types/                   # TypeScript types
│   ├── config/                  # Configuration
│   └── providers/               # React providers
└── public/                      # Static assets

## 🛠️ Development

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Edit .env.local with your configuration
```

### Environment Variables

```bash
# Chain Configuration
NEXT_PUBLIC_CHAIN_ID=42170
NEXT_PUBLIC_CHAIN_NAME="Ande Chain"
NEXT_PUBLIC_NETWORK_CURRENCY=ETH

# API Endpoints
NEXT_PUBLIC_API_URL=https://explorer-advanced.ande.chain/api
NEXT_PUBLIC_WS_URL=wss://explorer-advanced.ande.chain/ws
NEXT_PUBLIC_RPC_URL=https://rpc.ande.chain

# Features
NEXT_PUBLIC_ENABLE_WEBSOCKETS=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### Running Development Server

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Building for Production

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Code Quality

```bash
# Lint code
npm run lint

# Type check
npm run type-check

# Format code
npm run format
```

## 📦 Key Features

### 🔍 Smart Search
- Auto-detects search type (address, transaction, block, token)
- Real-time validation
- Intelligent routing

### 📊 Real-time Stats
- Network statistics with auto-refresh
- Latest block information
- Gas price tracking
- Transaction metrics

### 🎨 Modern UI/UX
- Responsive design (mobile-first)
- Dark mode support
- Smooth animations
- Loading states

### ⚡ Performance
- Server-side rendering (SSR)
- Optimized data fetching
- Code splitting
- Image optimization
- Caching strategies

### 🔐 Security
- Security headers configured
- Input validation and sanitization
- XSS protection
- CORS configuration

## 🏗️ Architecture

### Data Fetching Pattern

```typescript
// Using React Query hooks
const { data, isLoading, error } = useNetworkStats();

// Custom hook example
export function useBlock(heightOrHash: string) {
  return useQuery({
    queryKey: ['block', heightOrHash],
    queryFn: () => api.getBlock(heightOrHash),
    staleTime: Infinity, // Blocks don't change
  });
}
```

### API Client

```typescript
// Centralized API client
import { api } from '@/lib/api/client';

// Get network stats
const stats = await api.getNetworkStats();

// Get block
const block = await api.getBlock(12345);

// Get transaction
const tx = await api.getTransaction('0x...');
```

### Utility Functions

```typescript
import { formatAddress, formatWeiToEther } from '@/lib/utils/format';
import { detectSearchType } from '@/lib/utils/validation';
import { cn } from '@/lib/utils/cn';

// Format address
const short = formatAddress('0x1234...', 6, 4); // 0x1234...5678

// Format wei to ether
const eth = formatWeiToEther('1000000000000000000'); // 1.0000

// Detect search type
const type = detectSearchType('0x1234...'); // 'address'

// Merge classNames
const classes = cn('base-class', condition && 'conditional-class');
```

## 🎯 Next Steps

### Sprint 2: Core Explorer Pages

1. **Blocks Page** (`/blocks`)
   - List of recent blocks
   - Block details page
   - Block transactions

2. **Transactions Page** (`/tx`)
   - List of recent transactions
   - Transaction details
   - Internal transactions
   - Logs and events

3. **Address Page** (`/address/[address]`)
   - Address overview
   - Balance and transactions
   - Token holdings
   - NFTs

4. **Tokens Page** (`/tokens`)
   - Token list
   - Token details
   - Token holders
   - Token transfers

### Sprint 3: Real-time Features

1. **WebSocket Integration**
   - Real-time block updates
   - Real-time transaction feed
   - Live gas prices

2. **Analytics Dashboard** (`/analytics`)
   - Transaction charts
   - Gas price history
   - Network activity
   - Top addresses

### Sprint 4: Advanced Features

1. **Contract Verification**
   - View source code
   - Read/write contract methods
   - Contract events

2. **NFT Support**
   - NFT gallery
   - NFT metadata
   - Transfer history

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run linting and type checking
4. Create a pull request

## 📝 License

This project is part of the ANDE Explorer ecosystem.

---

Built with ❤️ by the Ande Labs team
```
