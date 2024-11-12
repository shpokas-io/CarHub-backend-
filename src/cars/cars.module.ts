import { Module } from '@nestjs/common';
import { CarsService } from './cars.service';
import { CarsController } from './cars.controller';
import { SupabaseService } from 'src/supabase/supabase.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CarsController],
  providers: [CarsService, SupabaseService],
})
export class CarsModule {}
