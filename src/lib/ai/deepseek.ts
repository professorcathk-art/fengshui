const HOST = "https://api.deepseek.com/chat/completions";

export async function deepseekChat(input: {
  system: string;
  userText: string;
  imageDataUrl?: string;
}) {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error("DEEPSEEK_API_KEY is not set.");

  const userContent = input.imageDataUrl
    ? [
        { type: "text", text: input.userText },
        {
          type: "image_url",
          image_url: { url: input.imageDataUrl, detail: "low" },
        },
      ]
    : input.userText;

  const response = await fetch(HOST, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek-flash",
      messages: [
        { role: "system", content: input.system },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
      thinking: { type: "disabled" },
    }),
  });

  const payload = (await response.json()) as {
    error?: { message?: string };
    choices?: { message?: { content?: string } }[];
  };

  if (!response.ok) {
    throw new Error(payload.error?.message || "DeepSeek request failed.");
  }

  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("DeepSeek returned an empty response.");
  return content;
}

export function parseJsonObject(content: string) {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced?.[1] ?? content;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("The model did not return JSON.");
  return JSON.parse(raw.slice(start, end + 1)) as unknown;
}
