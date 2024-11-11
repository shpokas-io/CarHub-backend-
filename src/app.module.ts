import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { cacheConfig } from './config/cache.config';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [AuthModule, UsersModule, cacheConfig, SupabaseModule],
})
export class AppModule {}
