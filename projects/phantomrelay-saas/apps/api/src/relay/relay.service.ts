import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface RelayRequest {
  url: string;
  mode: 'http' | 'headless' | 'stealth' | 'human' | 'auto';
  engine?: 'chrome' | 'firefox';
  waitFor?: 'load' | 'domcontentloaded' | 'networkidle';
  timeout?: number;
  extractText?: boolean;
  screenshot?: boolean;
  har?: boolean;
  captchaSolve?: boolean;
  profileId?: string;
  extraHeaders?: Record<string, string>;
  actions?: Array<{
    type: string;
    selector?: string;
    text?: string;
    ms?: number;
    fn?: string;
    url?: string;
    value?: string;
    y?: number;
    x?: number;
    button?: 'left' | 'right' | 'middle';
    clearFirst?: boolean;
  }>;
}

export interface RelayResponse {
  taskId: string;
  status: 'success' | 'blocked' | 'captcha' | 'error' | 'timeout' | 'dead_letter';
  mode: string;
  html: string;
  text?: string;
  latencyMs: number;
  screenshot?: string;
  har?: unknown;
  detectionSignals?: Array<{
    type: string;
    confidence: number;
    evidence: string;
  }>;
  error?: {
    code: string;
    message: string;
  };
}

@Injectable()
export class RelayService {
  private readonly logger = new Logger(RelayService.name);
  private readonly relayUrl: string;
  private readonly relayApiKey: string | undefined;

  constructor(private readonly config: ConfigService) {
    this.relayUrl = this.config.get<string>('RELAY_API_URL', 'http://localhost:3000');
    this.relayApiKey = this.config.get<string>('RELAY_API_KEY');
  }

  /**
   * Build the relay request payload from a SaaS scraper config.
   * Maps ScraperMode + config JSON to the engine's POST /scrape format.
   */
  private buildPayload(
    url: string,
    mode: string,
    scraperConfig: Record<string, unknown>,
  ): RelayRequest {
    return {
      url,
      mode: (mode.toLowerCase() as RelayRequest['mode']) ?? 'headless',
      engine: (scraperConfig.engine as RelayRequest['engine']) ?? 'chrome',
      waitFor: scraperConfig.waitFor as RelayRequest['waitFor'],
      timeout: (scraperConfig.timeout as number) ?? 30_000,
      extractText: true,
      screenshot: (scraperConfig.screenshot as boolean) ?? false,
      har: (scraperConfig.har as boolean) ?? false,
      captchaSolve: (scraperConfig.captchaSolve as boolean) ?? false,
      profileId: scraperConfig.profileId as string | undefined,
      extraHeaders: scraperConfig.extraHeaders as Record<string, string> | undefined,
      actions: scraperConfig.actions as RelayRequest['actions'],
    };
  }

  /**
   * Execute a scrape request against the PhantomRelay engine.
   */
  async execute(
    url: string,
    mode: string,
    scraperConfig: Record<string, unknown>,
  ): Promise<RelayResponse> {
    const payload = this.buildPayload(url, mode, scraperConfig);
    this.logger.log(`Executing scrape: ${url} [mode=${mode}]`);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.relayApiKey) {
      headers['Authorization'] = `Bearer ${this.relayApiKey}`;
    }

    const controller = new AbortController();
    const timeoutMs = (payload.timeout ?? 30_000) + 10_000; // engine timeout + 10s buffer
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${this.relayUrl}/scrape`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'unknown');
        throw new RelayError(
          `ENGINE_HTTP_${response.status}`,
          `Relay engine returned ${response.status}: ${errorBody}`,
        );
      }

      const result = (await response.json()) as RelayResponse;
      this.logger.log(`Scrape completed: taskId=${result.taskId} status=${result.status} latency=${result.latencyMs}ms`);
      return result;
    } catch (err) {
      if (err instanceof RelayError) throw err;

      const error = err as Error;
      if (error.name === 'AbortError') {
        throw new RelayError('RELAY_TIMEOUT', `Relay request timed out after ${timeoutMs}ms`);
      }
      if (error.message?.includes('ECONNREFUSED')) {
        throw new RelayError('RELAY_UNREACHABLE', `Cannot connect to relay engine at ${this.relayUrl}`);
      }
      throw new RelayError('RELAY_ERROR', error.message ?? 'Unknown relay error');
    } finally {
      clearTimeout(timer);
    }
  }
}

export class RelayError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'RelayError';
  }
}
