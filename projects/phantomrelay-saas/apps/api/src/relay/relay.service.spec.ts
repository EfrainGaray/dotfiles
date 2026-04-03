import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RelayService, RelayError } from './relay.service';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockConfig = {
  get: jest.fn((key: string, defaultValue?: string) => {
    const values: Record<string, string> = {
      RELAY_API_URL: 'http://localhost:3000',
      RELAY_API_KEY: 'test-api-key',
    };
    return values[key] ?? defaultValue ?? undefined;
  }),
};

describe('RelayService', () => {
  let service: RelayService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RelayService,
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<RelayService>(RelayService);
  });

  describe('execute', () => {
    it('should call correct URL with mapped config', async () => {
      const engineResponse = {
        taskId: 'task-1',
        status: 'success',
        mode: 'headless',
        html: '<html><body>Hello</body></html>',
        text: 'Hello',
        latencyMs: 150,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(engineResponse),
      });

      const result = await service.execute('https://example.com', 'headless', {
        engine: 'chrome',
        timeout: 15000,
        screenshot: true,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/scrape',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-api-key',
          }),
        }),
      );

      // Verify payload includes mapped fields
      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody).toEqual(
        expect.objectContaining({
          url: 'https://example.com',
          mode: 'headless',
          engine: 'chrome',
          timeout: 15000,
          screenshot: true,
          extractText: true,
        }),
      );

      expect(result).toEqual(engineResponse);
    });

    it('should handle timeout (AbortError)', async () => {
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValue(abortError);

      await expect(
        service.execute('https://example.com', 'headless', { timeout: 1000 }),
      ).rejects.toThrow(RelayError);

      await expect(
        service.execute('https://example.com', 'headless', { timeout: 1000 }),
      ).rejects.toMatchObject({ code: 'RELAY_TIMEOUT' });
    });

    it('should handle connection refused', async () => {
      const connError = new Error('connect ECONNREFUSED 127.0.0.1:3000');
      mockFetch.mockRejectedValue(connError);

      await expect(
        service.execute('https://example.com', 'headless', {}),
      ).rejects.toThrow(RelayError);

      await expect(
        service.execute('https://example.com', 'headless', {}),
      ).rejects.toMatchObject({ code: 'RELAY_UNREACHABLE' });
    });

    it('should map engine response correctly', async () => {
      const fullResponse = {
        taskId: 'task-2',
        status: 'success',
        mode: 'stealth',
        html: '<html/>',
        text: 'Extracted text',
        latencyMs: 300,
        screenshot: 'https://r2.example.com/screenshot.png',
        har: { log: { entries: [] } },
        detectionSignals: [
          { type: 'captcha', confidence: 0.9, evidence: 'reCAPTCHA detected' },
        ],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(fullResponse),
      });

      const result = await service.execute('https://example.com', 'stealth', {});

      expect(result.taskId).toBe('task-2');
      expect(result.status).toBe('success');
      expect(result.latencyMs).toBe(300);
      expect(result.screenshot).toBe('https://r2.example.com/screenshot.png');
      expect(result.har).toEqual({ log: { entries: [] } });
      expect(result.detectionSignals).toHaveLength(1);
      expect(result.detectionSignals![0].type).toBe('captcha');
    });

    it('should throw RelayError on non-ok HTTP response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 502,
        text: () => Promise.resolve('Bad Gateway'),
      });

      await expect(
        service.execute('https://example.com', 'headless', {}),
      ).rejects.toThrow(RelayError);

      await expect(
        service.execute('https://example.com', 'headless', {}),
      ).rejects.toMatchObject({ code: 'ENGINE_HTTP_502' });
    });
  });
});
