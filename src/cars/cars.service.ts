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

  async populateCars(make: string) {
    this.logger.log(`Starting to populate cars for make: ${make}`);
    try {
      const carsData = await this.carDataFetcherService.fetchCarData(make);
      this.logger.log(
        `Inserting ${carsData.length} cars into the Supabase database`,
      );

      const supabase = this.supabaseService.getClient();
      const { error } = await supabase.from('cars').insert(carsData);

      if (error) {
        this.logger.error(
          `Error inserting cars into the database: ${error.message}`,
        );
        throw new InternalServerErrorException(
          `Error inserting cars: ${error.message}`,
        );
      }

      this.logger.log(
        `Successfully inserted ${carsData.length} cars into the database`,
      );
      return carsData;
    } catch (error) {
      this.logger.error(`Failed to populate cars: ${error.message}`);
      throw new InternalServerErrorException(
        `Failed to populate cars: ${error.message}`,
      );
    }
  }

  // Add getAllCars method
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

  // Add createCar method
  async createCar(createCarDto: CreateCarDto) {
    try {
      const {
        make,
        model,
        year,
        color,
        engine,
        transmission,
        drive,
        cylinder,
      } = createCarDto;
      const { data, error } = await this.supabaseService
        .getClient()
        .from('cars')
        .insert([
          { make, model, year, color, engine, transmission, drive, cylinder },
        ])
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
