// This is required to make the source documents available on the client through streaming.
// See: https://github.com/vercel-labs/ai/issues/246#issuecomment-1622203494
import { type AIStreamCallbacks, createCallbacksTransformer } from 'ai';
import { Document } from 'langchain/document';

export function LangChainStream(callbacks?: AIStreamCallbacks) {
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const runs = new Set();

  const handleError = async (e: Error, runId: string) => {
    runs.delete(runId);
    await writer.ready;
    await writer.abort(e);
  };

  const handleStart = async (runId: string) => {
    runs.add(runId);
  };

  const handleEnd = async (runId: string) => {
    runs.delete(runId);

    if (runs.size === 0) {
      await writer.ready;
      await writer.close();
    }
  };

  return {
    stream: stream.readable.pipeThrough(createCallbacksTransformer(callbacks)),
    handlers: {
      handleLLMNewToken: async (token: string) => {
        await writer.ready;
        await writer.write(token);
      },
      handleLLMStart: async (_llm: any, _prompts: string[], runId: string) => {
        handleStart(runId);
      },
      handleLLMEnd: async (_output: any, runId: string) => {
        await handleEnd(runId);
      },
      handleLLMError: async (e: Error, runId: string) => {
        await handleError(e, runId);
      },
      handleChainStart: async (_chain: any, _inputs: any, runId: string) => {
        handleStart(runId);
      },
      // Modified
      handleChainEnd: async (_outputs: any, runId: string) => {
        const docs = _outputs['sourceDocuments'] as Document[] | undefined;
        if (docs != null) {
          await writer.write(`\n##SOURCE_DOCUMENTS##${JSON.stringify(docs)}`);
        }
        await handleEnd(runId);
      },
      handleChainError: async (e: Error, runId: string) => {
        await handleError(e, runId);
      },
      handleToolStart: async (_tool: any, _input: string, runId: string) => {
        handleStart(runId);
      },
      handleToolEnd: async (_output: string, runId: string) => {
        await handleEnd(runId);
      },
      handleToolError: async (e: Error, runId: string) => {
        await handleError(e, runId);
      },
    },
  };
}
