import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RelayService {
  private readonly logger = new Logger(RelayService.name);
  private readonly relayUrl: string;

  constructor(private readonly config: ConfigService) {
    this.relayUrl = this.config.get<string>('RELAY_API_URL', 'http://localhost:3000');
  }

  async execute(config: Record<string, unknown>): Promise<unknown> {
    this.logger.log(`Executing relay request to ${this.relayUrl}`);

    const response = await fetch(`${this.relayUrl}/api/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Relay request failed: ${response.status} - ${errorBody}`);
    }

    return response.json();
  }
}
