# Ande Network Explorer - Architecture

Comprehensive architecture documentation for the Ande Network BlockScout explorer infrastructure.

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│         ANDE NETWORK EXPLORER INFRASTRUCTURE                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────┐    ┌──────────────────────┐      │
│  │ explorer.ande.net    │    │explorer-advanced...  │      │
│  │ (Main UI)            │    │ (Analytics)          │      │
│  │                      │    │                      │      │
│  │ BlockScout Frontend  │    │ BlockScout Frontend  │      │
│  │ (Next.js/React)      │    │ (Next.js/React)      │      │
│  │ Port 3000            │    │ Port 3001            │      │
│  └──────────┬───────────┘    └──────────┬───────────┘      │
│             │                            │                  │
│             ├────────────────────────────┤                  │
│             │      Nginx Reverse Proxy   │                  │
│             │      (Load Balancing)      │                  │
│             │      Port 80/443           │                  │
│             └────────────────────────────┘                  │
│             │                            │                  │
│  ┌──────────▼────────────────────────────▼──────────┐      │
│  │    BlockScout Backend (Elixir/Phoenix)           │      │
│  ├────────────────────────────────────────────────┤      │
│  │ Main Backend (Port 4000)                       │      │
│  │ Advanced Backend (Port 4001)                   │      │
│  │                                                 │      │
│  │ - Transaction Indexing                         │      │
│  │ - Smart Contract Verification                  │      │
│  │ - API Endpoints                                │      │
│  │ - Data Processing                              │      │
│  └────────────────────────────────────────────────┘      │
│             │                            │                  │
│             └────────────────────────────┘                  │
│                          │                                  │
│              ┌───────────▼────────────┐                    │
│              │   PostgreSQL Database   │                    │
│              │   (Shared Indexation)   │                    │
│              │                         │                    │
│              │ - Transaction Data      │                    │
│              │ - Block Data            │                    │
│              │ - Address Data          │                    │
│              │ - Smart Contracts       │                    │
│              │ - Tokens & Holders      │                    │
│              └────────────┬────────────┘                    │
│                           │                                 │
│              ┌────────────▼────────────┐                   │
│              │   Redis Cache Layer     │                   │
│              │   (Performance)         │                   │
│              │                         │                   │
│              │ - API Response Cache    │                   │
│              │ - Session Storage       │                   │
│              │ - Real-time Updates     │                   │
│              └────────────┬────────────┘                   │
│                           │                                 │
│              ┌────────────▼────────────┐                   │
│              │  RPC Node (Ande Chain)  │                   │
│              │  (ev-reth-sequencer)    │                   │
│              │                         │                   │
│              │ - Chain Data Source     │                   │
│              │ - Block Production      │                   │
│              │ - Transaction Pool      │                   │
│              └─────────────────────────┘                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
         │                                           │
         │                                           │
    ┌────▼─────┐                              ┌─────▼────┐
    │ Cloudflare│                              │ Metrics/ │
    │ Tunnel    │                              │ Monitoring
    │ (Reverse  │                              │          │
    │ Proxy)    │                              └──────────┘
    └──────────┘
```

## Component Details

### 1. Frontend Layer (Next.js)

**BlockScout Frontend Application**
- **Type:** React/Next.js SPA
- **Ports:** 3000 (main), 3001 (advanced)
- **Features:**
  - Server-side rendering (SSR) for SEO
  - Real-time updates via WebSocket
  - Responsive design
  - Multi-language support
  - Dark/Light theme

**Key Files:**
- `/` - Homepage with network stats
- `/blocks` - Block explorer
- `/txs` - Transaction explorer
- `/address/:address` - Address details
- `/token/:address` - Token details
- `/api/v2` - API documentation

**Environment Variables:**
```bash
NEXT_PUBLIC_API_HOST=explorer.ande.network
NEXT_PUBLIC_NETWORK_NAME=Ande Network
NEXT_PUBLIC_NETWORK_ID=42170
```

### 2. Reverse Proxy Layer (Nginx)

**Purpose:** Route requests, load balancing, SSL termination

**Configuration:**
- Listens on ports 80 (HTTP) and 443 (HTTPS)
- Routes to frontend and backend services
- Implements rate limiting
- Enables gzip compression
- Caches static assets

**Key Routes:**
```
/ → blockscout-main-frontend:3000
/api/ → blockscout-main-backend:4000
(same for advanced instance on separate domain)
```

**Rate Limiting:**
- General: 50 requests/second per IP
- API: 100 requests/second per IP
- Advanced API: 500 requests/second per IP

### 3. Backend Layer (Elixir/Phoenix)

**BlockScout Backend**
- **Type:** Elixir application with Phoenix framework
- **Ports:** 4000 (main), 4001 (advanced)
- **Database:** PostgreSQL
- **Cache:** Redis

**Core Functions:**
- **Indexing:** Monitors RPC node, processes blocks/transactions
- **Data Processing:** Parses smart contracts, tracks tokens
- **API Server:** Exposes REST endpoints
- **Job Processing:** Background jobs for verification, analytics

**Key Endpoints:**
```
GET /api/v2/stats - Network statistics
GET /api/v2/blocks - Block listing
GET /api/v2/txs - Transaction listing
GET /api/v2/accounts/:address - Address details
GET /api/v2/tokens - Token listing
POST /api/v2/smart-contracts - Contract verification
```

**Architecture:**
```
Request → Plug Pipeline → Router → Controller → 
           Model/Service → Database/Cache → Response
```

### 4. Data Layer (PostgreSQL)

**Database Schema:**

```
┌─────────────────────────────────────┐
│         BLOCKSCOUT DATABASE         │
├─────────────────────────────────────┤
│                                     │
│ Blocks Table                        │
│ ├─ block_number (PK)                │
│ ├─ hash                             │
│ ├─ timestamp                        │
│ ├─ miner_address                    │
│ └─ gas_used                         │
│                                     │
│ Transactions Table                  │
│ ├─ hash (PK)                        │
│ ├─ block_number (FK)                │
│ ├─ from_address                     │
│ ├─ to_address                       │
│ ├─ value                            │
│ ├─ gas_price                        │
│ └─ input                            │
│                                     │
│ Addresses Table                     │
│ ├─ address (PK)                     │
│ ├─ balance                          │
│ ├─ transaction_count                │
│ └─ contract_code                    │
│                                     │
│ Smart Contracts Table               │
│ ├─ address (PK)                     │
│ ├─ name                             │
│ ├─ source_code                      │
│ ├─ abi                              │
│ └─ constructor_arguments            │
│                                     │
│ Tokens Table (ERC-20)               │
│ ├─ contract_address (PK)            │
│ ├─ name                             │
│ ├─ symbol                           │
│ ├─ decimals                         │
│ ├─ total_supply                     │
│ └─ holder_count                     │
│                                     │
│ Token Transfers Table               │
│ ├─ transaction_hash (FK)            │
│ ├─ from_address                     │
│ ├─ to_address                       │
│ └─ value                            │
│                                     │
└─────────────────────────────────────┘
```

**Key Indexes:**
- Block number, hash (for fast block lookup)
- Transaction hash (for fast tx lookup)
- Address (for address search)
- Block timestamp (for time range queries)

**Performance Considerations:**
- Partitioning by block number for very large datasets
- Regular VACUUM and REINDEX operations
- Query optimization with EXPLAIN ANALYZE
- Monitoring with pg_stat_statements

### 5. Cache Layer (Redis)

**Purpose:** High-speed caching for frequently accessed data

**Cache Keys:**
```
blocks:latest          - Latest blocks
transactions:latest    - Latest transactions
address:{address}      - Address balance/stats
token:{address}        - Token information
stats:network          - Network statistics
session:{session_id}   - User sessions
```

**Cache TTL (Time To Live):**
- Network stats: 30 seconds
- Address data: 5 minutes
- Block data: 1 hour
- Token data: 1 hour
- Static content: 24 hours

**Memory Management:**
- Redis memory limit: 4GB default
- Eviction policy: allkeys-lru (least recently used)
- Persistence: AOF (Append Only File)

### 6. RPC Node Integration

**Connection:**
```
BlockScout Backend → HTTP/WebSocket → RPC Node
```

**RPC Methods Used:**
```
eth_blockNumber         - Current block number
eth_getBlock            - Get block data
eth_getTransaction      - Get transaction data
eth_getTransactionReceipt - Get receipt
eth_getCode             - Get contract bytecode
eth_call                - Execute contract calls
eth_getLogs             - Get contract events
```

**Connection Pooling:**
- Multiple HTTP connections for redundancy
- WebSocket for real-time events
- Automatic reconnection on failure

## Data Flow

### Block Processing Flow

```
1. RPC Node publishes new block
   ↓
2. BlockScout detects block (polling or WebSocket)
   ↓
3. Fetch block data (eth_getBlock)
   ↓
4. Fetch transactions (eth_getTransaction)
   ↓
5. Fetch receipts (eth_getTransactionReceipt)
   ↓
6. Process contract interactions
   ↓
7. Parse events/logs (eth_getLogs)
   ↓
8. Index in PostgreSQL
   ↓
9. Update Redis cache
   ↓
10. Frontend displays data
```

### Transaction Lookup Flow

```
User searches "0xabcd..."
   ↓
Frontend calls API: /api/v2/txs/0xabcd
   ↓
Backend checks Redis cache
   ├─ Cache HIT: Return cached data
   └─ Cache MISS:
       ├─ Query PostgreSQL
       ├─ Store in Redis (5 min TTL)
       └─ Return to frontend
```

## Deployment Architecture

### Development Environment

- Single host
- Services in containers
- Local database and cache
- Direct access to services
- Port mapping: 3000, 3001, 4000, 4001, 5432, 6379

### Production Environment

```
Internet
  ↓
Cloudflare Tunnel
  ↓
Nginx (Reverse Proxy)
  ├─ explorer.ande.network → Frontend/Backend
  └─ explorer-advanced.ande.network → Frontend/Backend
  ↓
Docker Network (blockscout-network)
  ├─ blockscout-main-frontend:3000
  ├─ blockscout-main-backend:4000
  ├─ blockscout-advanced-frontend:3000
  ├─ blockscout-advanced-backend:4001
  ├─ postgres:5432
  └─ redis:6379
```

## Security Architecture

### Network Isolation

- Docker network isolation (blockscout-network)
- No direct external access to backend
- All traffic through Nginx proxy
- Cloudflare DDoS protection

### Database Security

- Credentials in environment variables
- Network isolation within Docker
- PostgreSQL native authentication
- Regular backups with encryption

### API Security

- Rate limiting per IP and API key
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS protection (Content Security Policy headers)
- CORS configuration

### Secrets Management

```bash
# Secrets stored in environment variables:
- DB_PASSWORD
- REDIS_PASSWORD
- SECRET_KEY_BASE
- API_KEYS (future)

# Never commit to Git:
- .env files (in .gitignore)
- Database credentials
- API keys
```

## Scaling Considerations

### Horizontal Scaling

**Frontend Instances:**
- Deploy multiple frontend containers
- Nginx load balancing (least_conn)
- Shared backend and database

**Backend Instances:**
- Deploy multiple backend containers
- Distributed job processing
- Shared database and cache

**Load Balancer Configuration:**
```nginx
upstream blockscout_backend {
    least_conn;
    server backend1:4000;
    server backend2:4000;
    server backend3:4000;
}
```

### Vertical Scaling

**Database Performance:**
```
- Increase PostgreSQL shared_buffers
- Increase work_mem for complex queries
- Add read replicas for heavy queries
- Upgrade to SSD storage
```

**Redis Performance:**
```
- Increase maxmemory
- Optimize key expiration
- Use Redis Cluster for larger deployments
- Monitor with redis-cli INFO
```

### Database Optimization

**Indexing Strategy:**
```sql
-- Essential indexes
CREATE INDEX idx_blocks_number ON blocks(block_number);
CREATE INDEX idx_blocks_hash ON blocks(hash);
CREATE INDEX idx_txs_hash ON transactions(hash);
CREATE INDEX idx_txs_block_number ON transactions(block_number);
CREATE INDEX idx_addresses ON addresses(address);
```

**Query Optimization:**
```sql
-- Use EXPLAIN ANALYZE
EXPLAIN ANALYZE SELECT ... FROM transactions WHERE block_number > 100000;

-- Monitor slow queries
log_min_duration_statement = 1000  -- Log queries > 1 second
```

## Monitoring and Observability

### Key Metrics

- **Uptime:** Service availability percentage
- **Response Time:** API endpoint latency
- **Throughput:** Requests per second
- **Error Rate:** Failed requests percentage
- **Database Size:** PostgreSQL storage usage
- **Cache Hit Rate:** Redis effectiveness
- **Block Processing Time:** Time to index blocks

### Logging

```
Services write logs to:
- Docker: stdout/stderr (json-file driver)
- Files: volumes/*/logs/
- Aggregation: (future - ELK stack)
```

### Health Checks

```bash
# Automated checks every 30 seconds:
GET /health endpoints
Database connectivity
Cache connectivity
RPC node connectivity
```

## Disaster Recovery

### Backup Strategy

```
Daily automated backups:
- Time: 2 AM UTC
- Location: /backups/blockscout_backup_YYYYMMDD_HHMMSS.sql.gz
- Retention: 7 days
- Size: ~500MB-2GB (compressed)
```

### Recovery Procedure

```bash
# 1. Stop services
bash infra/scripts/stop.sh

# 2. Restore database
gunzip < backups/blockscout_backup_*.sql.gz | \
  docker exec -i blockscout-postgres psql -U blockscout -d blockscout

# 3. Restart services
bash infra/scripts/start.sh prod

# 4. Verify data
bash infra/scripts/health-check.sh
```

### Failover Strategy

- Run secondary explorer instance (read-only)
- PostgreSQL replication to standby server
- Automatic DNS failover via Cloudflare

---

**Last Updated:** November 2024
**Version:** 1.0
