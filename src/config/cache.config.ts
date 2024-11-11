import { CacheModuleOptions } from '@nestjs/common';

export const cacheConfig: CacheModuleOptions = {
  store: require('cache-manager-redis-store'),
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT, 10),
  ttl: 600,
};
