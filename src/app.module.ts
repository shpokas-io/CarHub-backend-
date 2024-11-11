import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { cacheConfig } from './config/cache.config';

@Module({
  imports: [AuthModule, UsersModule, cacheConfig],
})
export class AppModule {}
