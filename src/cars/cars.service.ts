import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { CarDataFetcherService } from '../common/utils/car-data-fetcher.service';
import { CreateCarDto } from './dto/create-car.dto';

@Injectable()
export class CarsService {
  private readonly logger = new Logger(CarsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly carDataFetcherService: CarDataFetcherService,
  ) {}

  async getAllCars(): Promise<CreateCarDto[]> {
    try {
      const supabase = this.supabaseService.getClient();
      const { data: cars, error } = await supabase.from('cars').select('*');

      if (error) {
        this.logAndThrowError(
          'Error fetching cars from database',
          error.message,
        );
      }

      return cars;
    } catch (error) {
      this.logAndThrowError('Unexpected error fetching cars', error.message);
    }
  }

  async populateCars(): Promise<CreateCarDto[]> {
    try {
      const carsData = await this.carDataFetcherService.fetchCarData();
      const supabase = this.supabaseService.getClient();

      const { error } = await supabase.from('cars').insert(carsData);

      if (error) {
        this.logAndThrowError('Error populating cars database', error.message);
      }

      return carsData;
    } catch (error) {
      this.logAndThrowError('Failed to populate cars', error.message);
    }
  }

  private logAndThrowError(logMessage: string, errorMessage: string): never {
    this.logger.error(`${logMessage}: ${errorMessage}`);
    throw new InternalServerErrorException(logMessage);
  }
}
