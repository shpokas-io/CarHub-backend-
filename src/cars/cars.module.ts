import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { CarsController } from './cars.controller';
import { CarsService } from './cars.service';
import { SupabaseService } from 'src/supabase/supabase.service';
import { CarDataFetcherService } from 'src/common/utils/car-data-fetcher.service';

@Module({
  imports: [AuthModule, ConfigModule],
  controllers: [CarsController],
  providers: [CarsService, SupabaseService, CarDataFetcherService],
})
export class CarsModule {}
