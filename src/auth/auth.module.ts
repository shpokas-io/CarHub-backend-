import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SupabaseService } from '../supabase/supabase.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { jwtConfig } from '../config/jwt.config';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: jwtConfig,
    }),
  ],
  providers: [AuthService, JwtStrategy, SupabaseService],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
