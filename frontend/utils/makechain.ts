import { PromptTemplate } from 'langchain/prompts';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase';
import {
  QA_CHAIN_PROMPT,
  QUESTION_GENERATOR_CHAIN_PROMPT,
} from '@/config/prompts';
import {
  QA_CHAIN_MODEL,
  QA_CHAIN_TEMPERATURE,
  QUESTION_GENERATOR_CHAIN_MODEL,
  QUESTION_GENERATOR_CHAIN_TEMPERATURE,
  SOURCE_DOCUMENTS_TOTAL
} from '@/config/variables';

export const makeChain = (
  vectorStore: SupabaseVectorStore | PineconeStore,
  openAIApiKey: string | undefined,
) => {
  if (!openAIApiKey) {
    throw new Error('Missing environment variable OPENAI_API_KEY');
  }

  // A separate model instance is required for generating the question.
  // Otherwise it streams the intermediate steps to the client as well.
  // See: https://github.com/vercel-labs/ai/issues/246#issuecomment-1620806999

  // NOTE: Disallow streaming
  const questionGeneratorModel = new ChatOpenAI({
    openAIApiKey,
    modelName: QUESTION_GENERATOR_CHAIN_MODEL,
    temperature: QUESTION_GENERATOR_CHAIN_TEMPERATURE,
  });

  // NOTE: Allow streaming
  const qaModel = new ChatOpenAI({
    openAIApiKey,
    modelName: QA_CHAIN_MODEL,
    temperature: QA_CHAIN_TEMPERATURE,
    streaming: true,
  });

  // NOTE: Main prompt used by the model to generate a response
  const prompt = new PromptTemplate({
    template: QA_CHAIN_PROMPT,
    inputVariables: ["question", "context"],
  });

  const chain = ConversationalRetrievalQAChain.fromLLM(
    qaModel,
    vectorStore.asRetriever(SOURCE_DOCUMENTS_TOTAL),
    {
      questionGeneratorChainOptions: {
        llm: questionGeneratorModel,
        template: QUESTION_GENERATOR_CHAIN_PROMPT,
      },
      qaChainOptions: {
        type: 'stuff',
        prompt: prompt,
      },
      verbose: true,
      returnSourceDocuments: true,
    },
  );

  return chain;
};
