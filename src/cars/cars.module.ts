import { Module } from '@nestjs/common';
import { CarsService } from './cars.service';
import { ConfigModule } from '@nestjs/config';
import { CarsController } from './cars.controller';
import { SupabaseService } from 'src/supabase/supabase.service';
import { AuthModule } from 'src/auth/auth.module';
import { CarDataFetcherService } from 'src/common/utils/car-data-fetcher.service';

@Module({
  imports: [AuthModule, ConfigModule],
  controllers: [CarsController],
  providers: [CarsService, SupabaseService, CarDataFetcherService],
})
export class CarsModule {}
