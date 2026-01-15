// Small helper for consuming Server-Sent Events (SSE) streams that follow the
// OpenAI-compatible chat.completion.chunk format.

export async function streamOpenAITextFromSSE(
  resp: Response,
  onDelta: (delta: string) => void,
): Promise<void> {
  if (!resp.body) throw new Error("No response body");

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";
  let dataLines: string[] = [];

  const flushEvent = (): boolean => {
    if (dataLines.length === 0) return false;

    const data = dataLines.join("\n").trim();
    dataLines = [];

    if (!data) return false;
    if (data === "[DONE]") return true;

    try {
      const parsed = JSON.parse(data);
      const content = parsed?.choices?.[0]?.delta?.content;
      if (typeof content === "string" && content.length > 0) onDelta(content);
    } catch {
      // Ignore malformed/incomplete events.
    }

    return false;
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);

      // Blank line ends an SSE event.
      if (line === "") {
        const isDone = flushEvent();
        if (isDone) return;
        continue;
      }

      // Comments/keepalives
      if (line.startsWith(":")) continue;

      // We only care about data: lines.
      if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).trimStart());
      }
    }
  }

  // Flush any trailing event without a final blank line.
  flushEvent();
}

export function extractAssistantMessageFromNonStreamResponse(data: any): string | null {
  const content =
    data?.message ??
    data?.choices?.[0]?.message?.content ??
    data?.choices?.[0]?.delta?.content ??
    null;

  return typeof content === "string" ? content : null;
}
