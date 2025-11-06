Type: CNAME
Name: explorer
Value: cname.vercel-dns.com
TTL: 60 (or lowest available)
```

#### 2. Advanced Explorer - explorer-advanced.ande.chain

```
Type: CNAME
Name: explorer-advanced
Value: cname.vercel-dns.com
TTL: 60 (or lowest available)
```

#### 3. Verification Record (Optional but recommended)

```
Type: TXT
Name: _vercel
Value: v=spf1 include:_spf.vercel-mx.com ~all
TTL: 300
```

## Vercel Configuration Steps

### 1. Add Domain to Vercel Project

```bash
# Using Vercel CLI
vercel domains add explorer.ande.chain
vercel domains add explorer-advanced.ande.chain
```

Or through Vercel Dashboard:
1. Go to your `ande-explorer` project
2. Navigate to Settings → Domains
3. Add `explorer.ande.chain`
4. Add `explorer-advanced.ande.chain`

### 2. Verify DNS Configuration

Once DNS records are configured, verify propagation:

```bash
# Check CNAME resolution
dig CNAME explorer.ande.chain
dig CNAME explorer-advanced.ande.chain

# Or with nslookup
nslookup explorer.ande.chain
nslookup explorer-advanced.ande.chain
```

Expected output should show:
```
explorer.ande.chain. canonical name = cname.vercel-dns.com.
```

## SSL/TLS Certificate Setup

Vercel automatically handles SSL certificates once:
1. DNS records are correctly configured
2. Domain ownership is verified
3. DNS propagation is complete (typically 5-60 minutes)

### SSL Certificate Status Check

```bash
# Check SSL certificate
openssl s_client -connect explorer.ande.chain:443 -servername explorer.ande.chain
```

## Production Deployment

### 1. Update Environment Configuration

Ensure your `.env` file has the correct domain configuration:

```bash
BLOCKSCOUT_HOST_MAIN=explorer.ande.chain
BLOCKSCOUT_HOST_ADVANCED=explorer-advanced.ande.chain
BLOCKSCOUT_PROTOCOL=https
```

### 2. Update Nginx Configuration

The Nginx configuration in `infra/nginx/sites/main.conf` and `infra/nginx/sites/advanced.conf` are already configured for these domains.

### 3. Deploy to Production

```bash
# Start services with production configuration
bash infra/scripts/start.sh prod
```

## Troubleshooting

### Common Issues

#### 1. DNS Not Propagating

```bash
# Check DNS propagation from multiple locations
dig +trace explorer.ande.chain
dig +trace explorer-advanced.ande.chain
```

Solution: Wait for DNS propagation (5-60 minutes), verify DNS records are correct.

#### 2. SSL Certificate Issues

```bash
# Check certificate details
openssl s_client -connect explorer.ande.chain:443 -showcerts
```

Solution: Verify DNS records, wait for propagation, or manually request certificate in Vercel dashboard.

#### 3. Domain Not Verified in Vercel

Solution: Ensure DNS records are correctly configured and wait for propagation.

### Verification Commands

#### Health Check Endpoints

```bash
# Main Explorer Health
curl https://explorer.ande.chain/_health

# Advanced Explorer Health
curl https://explorer-advanced.ande.chain/_health
```

#### API Endpoints

```bash
# Main API
curl https://explorer.ande.chain/api/v2/health

# Advanced API
curl https://explorer-advanced.ande.chain/api/v2/health
```

## Security Considerations

### 1. DNSSEC

If your DNS provider supports DNSSEC, enable it for additional security.

### 2. CAA Records (Optional)

```
Type: CAA
Name: @
Value: 0 issue "letsencrypt.org; caid=letsencrypt"
```

### 3. SPF/DKIM

Configure email authentication if using email services:

```
Type: TXT
Name: @
Value: v=spf1 include:_spf.vercel-mx.com ~all
```

## Monitoring

### 1. Uptime Monitoring

Set up monitoring for both domains:
- Main: `https://explorer.ande.chain`
- Advanced: `https://explorer-advanced.ande.chain`

### 2. SSL Certificate Monitoring

Monitor certificate expiry dates through:
- Vercel dashboard notifications
- External monitoring services
- Custom health checks

### 3. DNS Monitoring

Monitor DNS configuration changes and propagation:
- Use DNS monitoring services
- Set up alerts for CNAME record changes

## Migration Notes

If migrating from existing domains:

1. Update all internal configuration files
2. Update external references and documentation
3. Implement proper redirects during transition
4. Monitor for broken links or references

## Support

For DNS-related issues:
- Contact your DNS provider support
- Check Vercel documentation: https://vercel.com/docs/concepts/projects/custom-domains

For application issues:
- Check Vercel function logs
- Verify Docker container health
- Review nginx error logs