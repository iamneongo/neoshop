const GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0";
const REQUEST_TIMEOUT_MS = 15000;

export type OutlookReaderConfig = {
  email: string;
  refreshToken: string;
  clientId: string;
  clientSecret?: string;
  tenantId: string;
};

type TokenResponse = {
  access_token?: string;
  scope?: string;
  error?: string;
  error_description?: string;
};

export type OutlookMessageSummary = {
  id?: string;
  subject?: string | null;
  receivedDateTime?: string;
  isRead?: boolean;
  hasAttachments?: boolean;
  bodyPreview?: string;
  webLink?: string;
  internetMessageId?: string;
  from?: {
    emailAddress?: {
      name?: string | null;
      address?: string | null;
    };
  } | null;
  body?: {
    contentType?: string;
    content?: string;
  } | null;
};

type GraphListResponse = {
  value?: OutlookMessageSummary[];
};

function envOutlookReaderConfig(): OutlookReaderConfig {
  return {
    email: process.env.OUTLOOK_READER_EMAIL?.trim() || "",
    refreshToken: process.env.OUTLOOK_READER_REFRESH_TOKEN?.trim() || "",
    clientId: process.env.OUTLOOK_READER_CLIENT_ID?.trim() || "",
    tenantId: process.env.OUTLOOK_READER_TENANT_ID?.trim() || "consumers",
    clientSecret: process.env.OUTLOOK_READER_CLIENT_SECRET?.trim(),
  };
}

function getOutlookReaderConfig(override?: Partial<OutlookReaderConfig>): OutlookReaderConfig {
  const merged = {
    ...envOutlookReaderConfig(),
    ...override,
  };

  if (!merged.email || !merged.refreshToken || !merged.clientId) {
    throw new Error("Thiếu cấu hình Outlook Reader.");
  }

  return merged;
}

async function fetchWithTimeout(input: string, init?: RequestInit, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(timer);
  }
}

async function getAccessToken(override?: Partial<OutlookReaderConfig>) {
  const config = getOutlookReaderConfig(override);
  const tokenEndpoint = `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`;
  const bodies = [new URLSearchParams({
    client_id: config.clientId,
    grant_type: "refresh_token",
    refresh_token: config.refreshToken,
  })];
  const configuredScope = process.env.OUTLOOK_READER_SCOPE?.trim();

  if (configuredScope) {
    bodies.unshift(new URLSearchParams({
      client_id: config.clientId,
      grant_type: "refresh_token",
      refresh_token: config.refreshToken,
      scope: configuredScope,
    }));
  }

  for (const body of bodies) {
    if (config.clientSecret) {
      body.set("client_secret", config.clientSecret);
    }

    const response = await fetchWithTimeout(tokenEndpoint, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const data = (await response.json().catch(() => ({}))) as TokenResponse;

    if (response.ok && data.access_token) {
      return data.access_token;
    }

    if (body.get("scope")) {
      continue;
    }

    throw new Error(data.error_description || data.error || "Không thể lấy access token Outlook.");
  }

  throw new Error("Không thể lấy access token Outlook.");
}

function graphHeaders(accessToken: string): HeadersInit {
  return {
    authorization: `Bearer ${accessToken}`,
    prefer: 'outlook.body-content-type="text"',
  };
}

function listSelect(includeBody: boolean) {
  const fields = [
    "id",
    "subject",
    "from",
    "receivedDateTime",
    "isRead",
    "hasAttachments",
    "bodyPreview",
    "webLink",
    "internetMessageId",
  ];

  if (includeBody) {
    fields.push("body");
  }

  return fields.join(",");
}

function messageSelect() {
  return [
    "id",
    "subject",
    "from",
    "toRecipients",
    "ccRecipients",
    "bccRecipients",
    "receivedDateTime",
    "sentDateTime",
    "isRead",
    "hasAttachments",
    "bodyPreview",
    "body",
    "webLink",
    "internetMessageId",
  ].join(",");
}

export async function listOutlookMessages(input?: { top?: number; includeBody?: boolean }) {
  return listOutlookMessagesWithConfig(undefined, input);
}

export async function listOutlookMessagesWithConfig(
  configOverride?: Partial<OutlookReaderConfig>,
  input?: { top?: number; includeBody?: boolean }
) {
  const config = getOutlookReaderConfig(configOverride);
  const accessToken = await getAccessToken(config);
  const top = Math.min(Math.max(input?.top ?? 10, 1), 50);
  const includeBody = input?.includeBody === true;
  const params = new URLSearchParams({
    $top: String(top),
    $orderby: "receivedDateTime DESC",
    $select: listSelect(includeBody),
  });
  const url = `${GRAPH_BASE_URL}/me/messages?${params.toString()}`;
  const response = await fetchWithTimeout(url, {
    headers: graphHeaders(accessToken),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || "Không thể lấy danh sách email Outlook.");
  }

  const data = (await response.json()) as GraphListResponse;
  return {
    mailbox: config.email,
    messages: data.value || [],
  };
}

export async function getOutlookMessage(messageId: string) {
  return getOutlookMessageWithConfig(undefined, messageId);
}

export async function getOutlookMessageWithConfig(
  configOverride: Partial<OutlookReaderConfig> | undefined,
  messageId: string
) {
  const config = getOutlookReaderConfig(configOverride);
  const accessToken = await getAccessToken(config);
  const params = new URLSearchParams({
    $select: messageSelect(),
  });
  const url = `${GRAPH_BASE_URL}/me/messages/${encodeURIComponent(messageId)}?${params.toString()}`;
  const response = await fetchWithTimeout(url, {
    headers: graphHeaders(accessToken),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || "Không thể lấy nội dung email Outlook.");
  }

  const message = (await response.json()) as OutlookMessageSummary;
  return {
    mailbox: config.email,
    message,
  };
}
