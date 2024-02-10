import { getVectorStoreProvider } from '@/utils/helpers';
import { ManualPDFLoader } from '@/utils/manualPDFLoader';
import { createPineconeIndex } from '@/utils/pinecone-client';
import { createSupabaseClient } from '@/utils/supabase-client';
import { DirectoryLoader } from 'langchain/document_loaders';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase';

/* Name of directory to retrieve your files from */
const filePath = 'docs';

export const run = async () => {
  try {
    /*load raw docs from the all files in the directory */
    /**
     * Insert other loaders for different file types in a similar format
     *
     * For example:
     * ".docx": (path:string) => new ManualDocxLoader(path),
     */
    const directoryLoader = new DirectoryLoader(filePath, {
      '.pdf': (path: string) => new ManualPDFLoader(path),
    });

    // const loader = new PDFLoader(filePath);
    const rawDocs = await directoryLoader.load();

    /* Split text into chunks */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await textSplitter.splitDocuments(rawDocs);
    console.log('split docs', docs);

    console.log('creating vector store...');
    /*create and store the embeddings in the vectorStore*/
    const embeddings = new OpenAIEmbeddings();

    if (getVectorStoreProvider() === 'pinecone') {
      const pineconeIndex = await createPineconeIndex({
        apiKey: process.env.PINECONE_API_KEY,
        environment: process.env.PINECONE_ENVIRONMENT,
        indexName: process.env.PINECONE_INDEX_NAME,
      });

      await PineconeStore.fromDocuments(docs, embeddings, {
        pineconeIndex,
      });
    } else if (getVectorStoreProvider() === 'supabase') {
      const client = createSupabaseClient({
        url: process.env.SUPABASE_URL,
        privateKey: process.env.SUPABASE_PRIVATE_KEY,
      });

      await SupabaseVectorStore.fromDocuments(docs, embeddings, {
        client,
        tableName: 'documents',
        queryName: 'match_documents',
      });
    } else {
      throw new Error('No credentials');
    }

    const client = createSupabaseClient({
      url: process.env.SUPABASE_URL,
      privateKey: process.env.SUPABASE_PRIVATE_KEY,
    });
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
  }
};

(async () => {
  await run();
  console.log('ingestion complete');
})();
