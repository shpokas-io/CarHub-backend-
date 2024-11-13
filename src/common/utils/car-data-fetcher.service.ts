import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CarDataFetcherService {
  private readonly logger = new Logger(CarDataFetcherService.name);
  private readonly carApiUrl = 'https://api.api-ninjas.com/v1/cars';
  private readonly unsplashApiUrl = 'https://api.unsplash.com/search/photos';

  constructor(private readonly configService: ConfigService) {}

  async fetchCarData(make: string) {
    const carApiKey = this.configService.get<string>('CAR_API_KEY');
    const unsplashAccessKey = this.configService.get<string>(
      'UNSPLASH_ACCESS_KEY',
    );

    try {
      const carResponse = await axios.get(this.carApiUrl, {
        headers: { 'X-Api-Key': carApiKey },
        params: { make },
      });
      const carDetails = carResponse.data.slice(0, 3); // Car limit

      const carsData = await Promise.all(
        carDetails.map(async (car) => {
          const carImageUrl = await this.fetchCarImage(
            car.make,
            car.model,
            car.year,
            unsplashAccessKey,
          );

          return {
            make: car.make,
            model: car.model,
            year: car.year,
            engine:
              car.engine ||
              (car.displacement ? `${car.displacement}L` : 'unknown'),
            color: 'Default Color',
            power: car.horsepower || car.cylinders * 25 || 0,
            cylinder: car.cylinders || null,
            drive: car.drive || 'unknown',
            car_image: carImageUrl,
          };
        }),
      );

      return carsData;
    } catch (error) {
      this.logger.error(`Error fetching car data: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch car data');
    }
  }

  private async fetchCarImage(
    make: string,
    model: string,
    year: number,
    accessKey: string,
  ) {
    try {
      const query = `${make} ${model} ${year} exterior car`;
      const response = await axios.get(this.unsplashApiUrl, {
        params: {
          query,
          client_id: accessKey,
          per_page: 3,
          orientation: 'landscape',
        },
      });

      const selectedImage =
        response.data.results.find((img) =>
          img.alt_description?.toLowerCase().includes('exterior'),
        ) || response.data.results[0];

      return (
        selectedImage?.urls.regular || 'https://via.placeholder.com/400x200'
      );
    } catch (error) {
      this.logger.warn(
        `Unsplash API error for ${make} ${model} ${year}: ${error.message}`,
      );
      return 'https://via.placeholder.com/400x200';
    }
  }
}
