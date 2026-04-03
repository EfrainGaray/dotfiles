import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';

export class UpdateScraperDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsEnum(['HTTP', 'HEADLESS', 'STEALTH', 'HUMAN', 'AUTO'])
  @IsOptional()
  mode?: 'HTTP' | 'HEADLESS' | 'STEALTH' | 'HUMAN' | 'AUTO';

  @IsObject()
  @IsOptional()
  config?: Record<string, unknown>;
}
