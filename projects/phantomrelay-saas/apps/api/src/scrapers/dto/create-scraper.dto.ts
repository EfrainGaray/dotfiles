import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';

export class CreateScraperDto {
  @IsString()
  name!: string;

  @IsString()
  url!: string;

  @IsEnum(['HTTP', 'HEADLESS', 'STEALTH', 'HUMAN', 'AUTO'])
  @IsOptional()
  mode?: 'HTTP' | 'HEADLESS' | 'STEALTH' | 'HUMAN' | 'AUTO';

  @IsObject()
  @IsOptional()
  config?: Record<string, unknown>;
}
