import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import axios from 'axios';
import { SupabaseService } from 'src/supabase/supabase.service';
import { CreateCarDto } from './dto/create-car.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CarsService {
  private readonly logger = new Logger(CarsService.name);
  private readonly carApiUrl = 'https://api.api-ninjas.com/v1/cars';
  private readonly unsplashApiUrl = 'https://api.unsplash.com/search/photos';

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {}

  async populateCars(make: string) {
    this.logger.log(`Starting to populate cars for make: ${make}`);
    try {
      this.logger.log(
        `Reaching out to main car API at ${this.carApiUrl} with make: ${make}`,
      );
      const carApiKey = this.configService.get<string>('CAR_API_KEY');
      this.logger.log(
        `Reaching out to main car API at ${this.carApiUrl} with make: ${make}`,
      );
      const carDetailsResponse = await axios.get(this.carApiUrl, {
        headers: { 'X-Api-Key': carApiKey },
        params: { make },
      });

      this.logger.log(`Received response from car API for make: ${make}`);
      this.logger.debug(
        `Car API response data: ${JSON.stringify(carDetailsResponse.data)}`,
      );

      const carDetails = carDetailsResponse.data;

      const carsToInsert = await Promise.all(
        carDetails.map(async (car) => {
          let carImageUrl = '';
          try {
            const unsplashAccessKey = this.configService.get<string>(
              'UNSPLASH_ACCESS_KEY',
            );
            this.logger.log(
              `Fetching image for model: ${car.model}, year: ${car.year} from Unsplash`,
            );

            const imageResponse = await axios.get(this.unsplashApiUrl, {
              params: {
                query: `${car.model} ${car.year}`,
                client_id: unsplashAccessKey,
                per_page: 1,
              },
            });

            if (
              imageResponse.data.results &&
              imageResponse.data.results.length > 0
            ) {
              carImageUrl = imageResponse.data.results[0].urls.small;
            } else {
              this.logger.warn(`No image found for ${car.model} ${car.year}`);
              carImageUrl = 'https://via.placeholder.com/150';
            }
          } catch (error) {
            this.logger.warn(
              `Unsplash API error for ${car.model} ${car.year}: ${error.message}`,
            );
          }

          const carData = {
            make: car.make,
            model: car.model,
            year: car.year,
            engine: car.engine || 'unknown',
            color: 'Default Color',
            power: car.horsepower || 0,
            car_image: carImageUrl,
          };
          this.logger.debug(
            `Prepared car data for insertion: ${JSON.stringify(carData)}`,
          );
          return carData;
        }),
      );
      this.logger.log(
        `Inserting ${carsToInsert.length} cars into the Supabase database`,
      );
      const supabase = this.supabaseService.getClient();
      const { error } = await supabase.from('cars').insert(carsToInsert);

      if (error) {
        this.logger.error(
          `Error inserting cars into the database: ${error.message}`,
        );
        throw new InternalServerErrorException(
          `Error inserting cars: ${error.message}`,
        );
      }

      this.logger.log(
        `Successfully inserted ${carsToInsert.length} cars into the database`,
      );
      return carsToInsert;
    } catch (error) {
      this.logger.error(`Failed to populate cars: ${error.message}`);
      throw new InternalServerErrorException(
        `Failed to populate cars: ${error.message}`,
      );
    }
  }

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
