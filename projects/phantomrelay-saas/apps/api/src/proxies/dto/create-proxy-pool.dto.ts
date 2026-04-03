import { IsEnum, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ProxyEntryDto {
  @IsUrl()
  url!: string;

  @IsEnum(['HTTP', 'HTTPS', 'SOCKS5'])
  protocol!: 'HTTP' | 'HTTPS' | 'SOCKS5';
}

export class CreateProxyPoolDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @ValidateNested({ each: true })
  @Type(() => ProxyEntryDto)
  proxies!: ProxyEntryDto[];
}
