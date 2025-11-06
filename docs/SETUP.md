# Ande Network Explorer - Setup Guide

Complete setup and deployment guide for the Ande Network BlockScout explorer infrastructure.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Development Setup](#development-setup)
3. [Production Deployment](#production-deployment)
4. [Configuration](#configuration)
5. [Verification](#verification)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **OS:** Linux (Ubuntu 20.04+ recommended) or macOS
- **Docker:** 20.10+
- **Docker Compose:** 1.29+
- **RAM:** 16GB minimum (24GB+ recommended)
- **Disk Space:** 100GB+ for database and logs
- **Ports Available:**
  - 80 (HTTP)
  - 443 (HTTPS)
  - 3000-3001 (Frontend)
  - 4000-4001 (Backend)
  - 5432 (PostgreSQL)
  - 6379 (Redis)

### Installation

**Ubuntu/Debian:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

**macOS (with Homebrew):**
```bash
# Install Docker Desktop (includes Docker and Docker Compose)
brew install --cask docker

# Verify installation
docker --version
docker-compose --version
```

### Network Configuration

Ensure your RPC node is accessible from the explorer container:

```bash
# Test RPC connectivity
curl http://your-rpc-node:8545 -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

Expected response:
```json
{"jsonrpc":"2.0","result":"0xa4ba","id":1}
```

## Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/AndeLabs/ande-explorer.git
cd ande-explorer
```

### 2. Configure Environment

Copy and customize the environment template:

```bash
cp .env.example .env.main
```

Edit `.env.main` with your values:

```bash
# Required values to change:
DB_PASSWORD=your-secure-password-here
REDIS_PASSWORD=your-redis-password-here
RPC_URL=http://your-rpc-host:8545
SECRET_KEY_BASE=generate-with-: openssl rand -hex 32
SECRET_KEY_BASE_ADV=generate-with-: openssl rand -hex 32

# Recommended values to customize:
BLOCKSCOUT_HOST_MAIN=localhost
NETWORK_NAME_MAIN=Ande Network
```

Generate secure keys:
```bash
# Generate SECRET_KEY_BASE values
openssl rand -hex 32
openssl rand -hex 32
```

### 3. Start Services

```bash
# Start all services in development mode
bash infra/scripts/start.sh dev

# Or manually with docker-compose
cd docker
docker-compose up
```

Monitor startup:
```bash
# In another terminal, watch logs
docker-compose logs -f
```

### 4. Access the Application

Once services are running:

- **Main Explorer:** http://localhost:3000
- **Advanced Explorer:** http://localhost:3001
- **Main Backend API:** http://localhost:4000/api/v2
- **Advanced Backend API:** http://localhost:4001/api/v2
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379

### 5. Verify Setup

```bash
# Run health checks
bash infra/scripts/health-check.sh
```

Expected output:
```
✓ PostgreSQL is healthy
✓ Redis is healthy
✓ BlockScout Main Backend is healthy
✓ BlockScout Advanced Backend is healthy
✓ Main Frontend (port 3000) is responding
✓ Advanced Frontend (port 3001) is responding
```

## Production Deployment

### 1. Server Preparation

**Recommended Cloud Providers:**
- AWS EC2 (t3.xlarge or larger)
- Google Cloud Compute Engine (e2-standard-4 or larger)
- DigitalOcean App Platform
- Linode

**Server Setup:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker and Docker Compose (see Prerequisites section)

# Create deploy user (optional)
sudo useradd -m -G docker blockscout
sudo su - blockscout

# Create working directory
mkdir -p ~/ande-explorer
cd ~/ande-explorer
```

### 2. Clone Repository

```bash
git clone https://github.com/AndeLabs/ande-explorer.git .
```

### 3. Configure Production Environment

Create `.env.main` with production values:

```bash
# Copy template
cp .env.example .env.main

# Edit with production values
nano .env.main
```

**Important Production Settings:**
```bash
# Environment
ENV=prod

# Security
DB_PASSWORD=<generate-strong-password>
REDIS_PASSWORD=<generate-strong-password>
SECRET_KEY_BASE=<openssl rand -hex 32>
SECRET_KEY_BASE_ADV=<openssl rand -hex 32>

# Network - Point to your production RPC
RPC_URL=http://ev-reth-sequencer.internal:8545
RPC_WS_URL=ws://ev-reth-sequencer.internal:8546
CHAIN_ID=42170

# Hostnames (use your actual domain)
BLOCKSCOUT_HOST_MAIN=explorer.ande.network
BLOCKSCOUT_HOST_ADVANCED=explorer-advanced.ande.network
BLOCKSCOUT_PROTOCOL=https

# Networking
BLOCKSCOUT_PROTOCOL=https

# API Rate Limits (higher for production)
API_RATE_LIMIT_BY_KEY=100
API_RATE_LIMIT_BY_IP=500
API_RATE_LIMIT_BY_KEY_ADV=500
API_RATE_LIMIT_BY_IP_ADV=2000
```

### 4. Setup Cloudflare Tunnel

Integrate with your existing Cloudflare tunnel setup:

```bash
# In your cloudflare tunnel config (usually ~/.cloudflared/config.yml)
# Add ingress rules:

ingress:
  - hostname: explorer.ande.network
    service: http://localhost:80
  - hostname: explorer-advanced.ande.network
    service: http://localhost:80
  - service: http_status:404
```

Restart cloudflared:
```bash
sudo systemctl restart cloudflared
```

### 5. Start Production Services

```bash
# Start in production mode
bash infra/scripts/start.sh prod

# Verify services started
docker-compose ps
```

### 6. Setup Automated Backups

Create a cron job for daily backups:

```bash
# Edit crontab
crontab -e

# Add this line (backup at 2 AM UTC daily)
0 2 * * * bash /home/blockscout/ande-explorer/infra/scripts/backup.sh >> /home/blockscout/ande-explorer/logs/backup.log 2>&1

# Verify cron job
crontab -l
```

### 7. Setup Monitoring

Monitor service health:

```bash
# Manual health check
bash infra/scripts/health-check.sh

# Add to monitoring (cron every 5 minutes)
*/5 * * * * bash /home/blockscout/ande-explorer/infra/scripts/health-check.sh >> /home/blockscout/ande-explorer/logs/health.log 2>&1
```

### 8. Verify Production Deployment

```bash
# Check services
docker-compose ps

# Verify external access
curl -I https://explorer.ande.network
curl -I https://explorer-advanced.ande.network

# Check API endpoints
curl https://explorer.ande.network/api/v2/stats
curl https://explorer-advanced.ande.network/api/v2/stats

# Monitor logs
docker-compose logs -f --tail=50
```

## Configuration

### Environment Variables

All configuration is done via environment variables in `.env.main`:

```bash
# Database
DB_USER=blockscout
DB_PASSWORD=your-password
DB_NAME=blockscout
DB_PORT=5432

# Cache
REDIS_PASSWORD=your-redis-password
REDIS_PORT=6379

# RPC Node
RPC_URL=http://your-rpc:8545
RPC_WS_URL=ws://your-rpc:8546
CHAIN_ID=42170

# Explorers
BLOCKSCOUT_HOST_MAIN=explorer.ande.network
BLOCKSCOUT_HOST_ADVANCED=explorer-advanced.ande.network
BLOCKSCOUT_PROTOCOL=https

# Network Display
NETWORK_NAME_MAIN=Ande Network
NETWORK_NAME_ADVANCED=Ande Network (Analytics)

# Branding
LOGO_URL_MAIN=https://ande.network/logo.png
FOOTER_LOGO_URL_MAIN=https://ande.network/footer-logo.png

# Features
SHOW_PRICE_CHART=false
SHOW_MARKET_CAP_CHART=false
DISPLAY_TOKEN_ICONS=true
ENABLE_TXS_STATS=true
ENABLE_ADVANCED_ANALYTICS=true

# API Limits
API_RATE_LIMIT_BY_KEY=100
API_RATE_LIMIT_BY_IP=500
```

See `.env.example` for complete list of options.

### Branding Customization

See [BRANDING.md](BRANDING.md) for detailed branding configuration.

## Verification

### Health Checks

```bash
# Run automated health check
bash infra/scripts/health-check.sh

# Manual checks
# PostgreSQL
docker exec blockscout-postgres pg_isready -U blockscout

# Redis
docker exec blockscout-redis redis-cli ping

# Main Backend
curl http://localhost:4000/health

# Advanced Backend
curl http://localhost:4001/health
```

### API Endpoints

Test API functionality:

```bash
# Get network stats
curl https://explorer.ande.network/api/v2/stats

# Get account info
curl https://explorer.ande.network/api/v2/accounts/0x123...

# Get transactions
curl https://explorer.ande.network/api/v2/transactions
```

### Database Verification

```bash
# Check database size
docker exec blockscout-postgres psql -U blockscout -d blockscout -c \
  "SELECT datname, pg_size_pretty(pg_database_size(datname)) FROM pg_database WHERE datname='blockscout';"

# Check table counts
docker exec blockscout-postgres psql -U blockscout -d blockscout -c \
  "SELECT schemaname, COUNT(*) as table_count FROM pg_tables GROUP BY schemaname;"
```

## Troubleshooting

See [MAINTENANCE.md](MAINTENANCE.md) for detailed troubleshooting guides.

### Common Issues

**Services won't start:**
```bash
# Check logs
docker-compose logs blockscout-main-backend
docker-compose logs blockscout-postgres

# Verify Docker is running
docker ps

# Restart services
docker-compose restart
```

**High memory usage:**
```bash
# Check memory usage per container
docker stats

# Reduce cache sizes in .env.main or increase server RAM
```

**Database connection errors:**
```bash
# Check PostgreSQL is running and healthy
docker exec blockscout-postgres pg_isready -U blockscout

# Check database credentials in .env.main
# Verify DATABASE_URL format
```

**RPC connection issues:**
```bash
# Test RPC endpoint
curl http://your-rpc-host:8545 -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

# Check RPC_URL in .env.main
```

## Support Resources

- **BlockScout Docs:** https://docs.blockscout.com
- **Docker Docs:** https://docs.docker.com
- **Ande Labs:** https://github.com/AndeLabs

---

**Last Updated:** November 2024
**Status:** Production Ready
