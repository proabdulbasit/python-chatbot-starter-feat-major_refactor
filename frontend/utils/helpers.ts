export const urlPattern = new RegExp(
  '^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$',
  'i',
);

export const getVectorStoreProvider = () => {
  const pineconeApiKey = process.env.PINECONE_API_KEY;
  const pineconeEnvironment = process.env.PINECONE_ENVIRONMENT;
  const pineconeIndexName = process.env.PINECONE_INDEX_NAME;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabasePrivateKey = process.env.SUPABASE_PRIVATE_KEY;

  if (!!pineconeApiKey && !!pineconeEnvironment && !!pineconeIndexName) {
    return 'pinecone';
  }

  if (!!supabaseUrl && !!supabasePrivateKey) {
    return 'supabase';
  }

  return null;
};
