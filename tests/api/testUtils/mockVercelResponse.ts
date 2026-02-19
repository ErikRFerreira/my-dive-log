export type MockVercelResponse = {
  headers: Record<string, string>;
  statusCode: number | null;
  jsonBody: unknown;
  ended: boolean;
  setHeader: (name: string, value: string) => MockVercelResponse;
  status: (code: number) => MockVercelResponse;
  json: (body: unknown) => MockVercelResponse;
  end: () => MockVercelResponse;
};

export function createMockVercelResponse(): MockVercelResponse {
  const response: MockVercelResponse = {
    headers: {},
    statusCode: null,
    jsonBody: undefined,
    ended: false,
    setHeader(name, value) {
      response.headers[name] = value;
      return response;
    },
    status(code) {
      response.statusCode = code;
      return response;
    },
    json(body) {
      response.jsonBody = body;
      return response;
    },
    end() {
      response.ended = true;
      return response;
    },
  };

  return response;
}
