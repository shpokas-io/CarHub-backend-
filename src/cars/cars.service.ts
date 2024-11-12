import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { CreateCarDto } from './dto/create-car.dto';

@Injectable()
export class CarsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getAllCars() {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('cars')
        .select('*');

      if (error) {
        throw new InternalServerErrorException(
          'Error fetching cars from the database',
          error.message,
        );
      }
      return data;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching cars',
        error.message,
      );
    }
  }

  async createCar(createCarDto: CreateCarDto) {
    try {
      const { make, model, year, color, mileage } = createCarDto;
      const { data, error } = await this.supabaseService
        .getClient()
        .from('cars')
        .insert([{ make, model, year, color, mileage }])
        .single();

      if (error) {
        throw new InternalServerErrorException(
          'Error creating car in the database',
          error.message,
        );
      }
      return data;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error creating car',
        error.message,
      );
    }
  }
}
