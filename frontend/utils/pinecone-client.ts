import { PineconeClient } from '@pinecone-database/pinecone';

export const createPineconeIndex = async ({
  apiKey,
  environment,
  indexName,
}: {
  apiKey?: string;
  environment?: string;
  indexName?: string;
}) => {
  if (!apiKey) throw new Error(`Missing environment variable PINECONE_API_KEY`);
  if (!environment)
    throw new Error(`Missing environment variable PINECONE_ENVIRONMENT`);
  if (!indexName)
    throw new Error(`Missing environment variable PINECONE_INDEX_NAME`);

  const pinecone = new PineconeClient();

  await pinecone.init({
    apiKey,
    environment,
  });

  const index = pinecone.Index(indexName);

  return index;
};
