import { IsEnum, IsUrl } from 'class-validator';

export class AddProxyDto {
  @IsUrl()
  url!: string;

  @IsEnum(['HTTP', 'HTTPS', 'SOCKS5'])
  protocol!: 'HTTP' | 'HTTPS' | 'SOCKS5';
}
