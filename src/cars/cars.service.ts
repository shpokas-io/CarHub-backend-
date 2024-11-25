import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { CarDataFetcherService } from '../common/utils/car-data-fetcher.service';

@Injectable()
export class CarsService {
  private readonly logger = new Logger(CarsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly carDataFetcherService: CarDataFetcherService,
  ) {}

  async getAllCars() {
    try {
      const supabase = this.supabaseService.getClient();
      const { data: cars, error } = await supabase.from('cars').select('*');

      if (error) {
        this.logger.error(`Error fetching cars: ${error.message}`);
        throw new InternalServerErrorException(
          'Error fetching cars from database',
        );
      }

      return cars;
    } catch (error) {
      this.logger.error(`Unexpected error fetching cars: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch cars');
    }
  }

  async populateCars() {
    try {
      const carsData = await this.carDataFetcherService.fetchCarData();
      const supabase = this.supabaseService.getClient();

      const { error } = await supabase.from('cars').insert(carsData);

      if (error) {
        this.logger.error(`Error populating cars: ${error.message}`);
        throw new InternalServerErrorException(
          'Error populating cars database',
        );
      }

      return carsData;
    } catch (error) {
      this.logger.error(`Failed to populate cars: ${error.message}`);
      throw new InternalServerErrorException('Failed to populate cars');
    }
  }
}
