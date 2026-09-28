# Troubleshooting Runbook

## Common Issues and Solutions

### Application Issues

#### Issue: Application Not Starting

**Symptoms**:
- Service shows "Crashed" in Render Dashboard
- Logs show startup errors
- Health check failing

**Diagnosis**:
1. Check Render Dashboard logs
2. Look for error messages in startup
3. Check environment variables

**Solutions**:
```bash
# Check logs
render logs

# Common fixes:
# 1. Missing environment variables
# 2. Database connection string incorrect
# 3. Port conflict
# 4. Missing dependencies
```

#### Issue: Slow Response Times

**Symptoms**:
- API responses > 2s
- Frontend loading slowly
- High latency

**Diagnosis**:
1. Check Render Dashboard metrics
2. Look for slow queries in logs
3. Check database performance

**Solutions**:
```bash
# Check database queries
npx prisma studio

# Common fixes:
# 1. Add database indexes
# 2. Optimize queries
# 3. Enable caching
# 4. Upgrade service plan
```

#### Issue: Memory Leaks

**Symptoms**:
- Memory usage increasing over time
- Service crashes periodically
- Out of memory errors

**Diagnosis**:
1. Check memory usage in Render Dashboard
2. Look for memory-related errors in logs
3. Profile application locally

**Solutions**:
```bash
# Common fixes:
# 1. Fix memory leaks in code
# 2. Increase memory limit
# 3. Implement graceful restart
# 4. Add memory monitoring
```

### Database Issues

#### Issue: Database Connection Failed

**Symptoms**:
- "Cannot connect to database" errors
- Health check shows database disconnected
- Application crashes on startup

**Diagnosis**:
1. Check DATABASE_URL environment variable
2. Check database service status
3. Check network connectivity

**Solutions**:
```bash
# Test connection
psql $DATABASE_URL

# Common fixes:
# 1. Verify DATABASE_URL is correct
# 2. Check database service is running
# 3. Check firewall rules
# 4. Restart database service
```

#### Issue: Slow Database Queries

**Symptoms**:
- API responses slow
- Database timeout errors
- High CPU usage on database

**Diagnosis**:
1. Enable query logging
2. Use EXPLAIN ANALYZE
3. Check database metrics

**Solutions**:
```sql
-- Analyze slow query
EXPLAIN ANALYZE SELECT * FROM orders WHERE status = 'pending';

-- Common fixes:
-- 1. Add indexes
-- 2. Optimize queries
-- 3. Update statistics
-- 4. Partition large tables
```

#### Issue: Database Lock Contention

**Symptoms**:
- "Lock wait timeout exceeded" errors
- Transactions failing
- Slow updates

**Diagnosis**:
1. Check for long-running transactions
2. Look for lock conflicts in logs
3. Monitor lock wait times

**Solutions**:
```sql
-- Check for locks
SELECT * FROM pg_locks;

-- Common fixes:
-- 1. Reduce transaction duration
-- 2. Use optimistic locking
-- 3. Add retry logic
-- 4. Kill blocking transactions
```

### Storage Issues

#### Issue: Storage Full

**Symptoms**:
- Upload failures
- "No space left on device" errors
- Cannot write files

**Diagnosis**:
1. Check storage usage
2. Look for large files
3. Check cleanup logs

**Solutions**:
```bash
# Check storage usage
du -sh uploads/

# Common fixes:
# 1. Run cleanup service
# 2. Delete old files manually
# 3. Compress images
# 4. Upgrade storage plan
```

#### Issue: File Upload Failures

**Symptoms**:
- Upload errors
- "File too large" errors
- MIME type validation errors

**Diagnosis**:
1. Check upload logs
2. Verify file size limits
3. Check MIME type validation

**Solutions**:
```bash
# Common fixes:
# 1. Increase upload size limit
# 2. Fix MIME type validation
# 3. Check disk space
# 4. Verify file permissions
```

### External API Issues

#### Issue: ViaCEP API Down

**Symptoms**:
- CEP lookup failures
- "Connection timeout" errors
- Freight calculation failing

**Diagnosis**:
1. Check ViaCEP service status
2. Look for timeout errors in logs
3. Test API manually

**Solutions**:
```bash
# Test API
curl https://viacep.com.br/ws/01001000/json/

# Common fixes:
# 1. Circuit breaker should activate
# 2. Fallback to default freight
# 3. Retry with exponential backoff
# 4. Check cache for cached CEPs
```

#### Issue: Holiday API Down

**Symptoms**:
- Holiday lookup failures
- Date calculation errors
- Delivery date issues

**Diagnosis**:
1. Check Brasil API status
2. Look for timeout errors
3. Test API manually

**Solutions**:
```bash
# Test API
curl https://brasilapi.com.br/api/feriados/v1/2024

# Common fixes:
# 1. Circuit breaker should activate
# 2. Fallback to days calculation
# 3. Use cached holidays
# 4. Manual holiday table
```

### Performance Issues

#### Issue: High CPU Usage

**Symptoms**:
- CPU usage > 80%
- Slow response times
- Service throttling

**Diagnosis**:
1. Check CPU metrics in Render Dashboard
2. Look for CPU-intensive operations
3. Profile application

**Solutions**:
```bash
# Common fixes:
# 1. Optimize algorithms
# 2. Add caching
# 3. Implement rate limiting
# 4. Scale horizontally
```

#### Issue: High Memory Usage

**Symptoms**:
- Memory usage > 80%
- Out of memory errors
- Service crashes

**Diagnosis**:
1. Check memory metrics
2. Look for memory leaks
3. Profile memory usage

**Solutions**:
```bash
# Common fixes:
# 1. Fix memory leaks
# 2. Optimize data structures
# 3. Implement caching
# 4. Increase memory limit
```

### Security Issues

#### Issue: Unauthorized Access

**Symptoms**:
- Failed login attempts
- Unauthorized API calls
- Suspicious activity

**Diagnosis**:
1. Check auth logs
2. Review access logs
3. Check for compromised tokens

**Solutions**:
```bash
# Common fixes:
# 1. Rotate compromised tokens
# 2. Enable 2FA
# 3. Review user permissions
# 4. Implement rate limiting
```

#### Issue: SQL Injection Attempts

**Symptoms**:
- Suspicious query patterns
- SQL errors in logs
- Data integrity issues

**Diagnosis**:
1. Check query logs
2. Look for SQL injection patterns
3. Review input validation

**Solutions**:
```bash
# Common fixes:
# 1. Use parameterized queries
# 2. Validate all inputs
# 3. Implement WAF
# 4. Audit code for vulnerabilities
```

## Debugging Tools

### Logs

**Render Dashboard Logs**:
```bash
# View logs
render logs

# Follow logs
render logs --follow

# Filter logs
render logs --grep "error"
```

**Local Debugging**:
```bash
# Enable debug mode
DEBUG=true npm run dev

# Check logs
tail -f logs/app.log
```

### Database Debugging

**Prisma Studio**:
```bash
npx prisma studio
```

**SQL Console**:
```bash
psql $DATABASE_URL
```

### Performance Profiling

**Node.js Profiler**:
```bash
node --prof app.js
```

**Render Metrics**:
- CPU usage
- Memory usage
- Response time
- Error rate

## Emergency Procedures

### Service Down

1. **Check status**:
   - Render Dashboard
   - Health check endpoint
   - UptimeRobot alerts

2. **Identify cause**:
   - Check logs
   - Check metrics
   - Check external dependencies

3. **Fix or rollback**:
   - Fix if quick fix available
   - Rollback if critical issue
   - Escalate if necessary

4. **Communicate**:
   - Notify stakeholders
   - Update status page
   - Document incident

### Data Loss

1. **Stop writes**:
   - Stop application
   - Prevent further data loss

2. **Assess damage**:
   - Identify lost data
   - Check backups
   - Estimate recovery time

3. **Recover data**:
   - Restore from backup
   - Verify integrity
   - Test functionality

4. **Prevent recurrence**:
   - Implement better backups
   - Add monitoring
   - Update procedures

## Escalation Matrix

| Severity | Response Time | Escalation |
|----------|---------------|------------|
| P1 - Critical | 15 minutes | Tech Lead + Support |
| P2 - High | 1 hour | Tech Lead |
| P3 - Medium | 4 hours | Developer |
| P4 - Low | 24 hours | Developer |

## Contact Information

- **Tech Lead**: [contact]
- **Database Admin**: [contact]
- **Render Support**: https://render.com/support
- **Emergency**: [contact]

## Documentation Updates

After resolving any issue:
1. Document the issue
2. Document the solution
3. Update this runbook
4. Share with team
