import { streamText } from 'ai';
import { zai, zaiModel } from '@/lib/ai/z-ai-provider';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: zai(zaiModel),
    messages,
  });

  return result.toTextStreamResponse();
}
