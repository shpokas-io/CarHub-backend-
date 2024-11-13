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

  async fetchCarData() {
    const carApiKey = this.configService.get<string>('CAR_API_KEY');
    const unsplashAccessKey = this.configService.get<string>(
      'UNSPLASH_ACCESS_KEY',
    );

    try {
      const carsData = await Promise.all(
        Array.from({ length: 10 }).map(async () => {
          const carMake = this.getRandomCarMake();
          const carResponse = await axios.get(this.carApiUrl, {
            headers: { 'X-Api-Key': carApiKey },
            params: { make: carMake },
          });

          const carDetails = this.selectRandomCar(carResponse.data);
          const year = this.getRandomYear();
          const power = this.calculatePower(
            carDetails.cylinders,
            carDetails.displacement,
          );

          const carImageUrl = await this.fetchCarImage(
            carDetails.make,
            carDetails.model,
            year,
            unsplashAccessKey,
          );

          return {
            make: carDetails.make,
            model: carDetails.model,
            year,
            engine:
              carDetails.engine ||
              (carDetails.displacement
                ? `${carDetails.displacement}L`
                : 'unknown'),
            color: 'Default Color',
            power,
            cylinder: carDetails.cylinders || null,
            drive: carDetails.drive || 'unknown',
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

  private getRandomCarMake(): string {
    const carMakes = [
      'Toyota',
      'Ford',
      'Honda',
      'Chevrolet',
      'Nissan',
      'BMW',
      'Mercedes',
      'Audi',
    ];
    return carMakes[Math.floor(Math.random() * carMakes.length)];
  }

  private getRandomYear(): number {
    return Math.floor(Math.random() * (2022 - 1980 + 1)) + 1980;
  }

  private calculatePower(cylinders: number, displacement: number): number {
    return cylinders && displacement
      ? Math.round(cylinders * displacement * 25) // Updated multiplier for more variety
      : 100;
  }

  private selectRandomCar(carList: any[]): any {
    const randomIndex = Math.floor(Math.random() * carList.length);
    return carList[randomIndex];
  }

  private async fetchCarImage(
    make: string,
    model: string,
    year: number,
    accessKey: string,
  ) {
    try {
      const query = `${make} ${model} ${year} car exterior view`;
      const response = await axios.get(this.unsplashApiUrl, {
        params: {
          query,
          client_id: accessKey,
          per_page: 1,
          orientation: 'landscape',
        },
      });

      return (
        response.data.results[0]?.urls.regular ||
        'https://via.placeholder.com/400x200'
      );
    } catch (error) {
      this.logger.warn(
        `Unsplash API error for ${make} ${model} ${year}: ${error.message}`,
      );
      return 'https://via.placeholder.com/400x200';
    }
  }
}
