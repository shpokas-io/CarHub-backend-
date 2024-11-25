import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CarsService } from './cars.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Get()
  async getAllCars() {
    return this.carsService.getAllCars();
  }

  @Post('populate')
  @UseGuards(JwtAuthGuard)
  async populateCars() {
    return this.carsService.populateCars();
  }
}
