export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface CreateApiKeyResponse extends ApiKey {
  /** Full API key — only shown once at creation time */
  key: string;
}
