import { Module } from '@nestjs/common';
import { CarsService } from './cars.service';
import { CarsController } from './cars.controller';
import { SupabaseService } from 'src/supabase/supabase.service';

@Module({
  controllers: [CarsController],
  providers: [CarsService, SupabaseService],
})
export class CarsModule {}
