export class CreateCarDto {
  id: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  engine: string;
  transmission: string;
  drive: string;
  cylinder: string;
}
