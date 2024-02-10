# AI Chatbot Starter - Create a ChatGPT-powered Chatbot for Your Custom Data

The tech stack used is Next.js, TypeScript, Tailwind CSS, Supabase / Pinecone, and OpenAI. LangChain is a framework that makes it easier to build scalable AI/LLM apps and chatbots. Supabase OR Pinecone is used as a vectorstore for storing embeddings and the texts from your custom data to later retrieve similar docs.

## Development

1. Make sure you have installed node and yarn

[Node installation](https://nodejs.org/en/download)
[yarn installation](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable)

yarn installation in your terminal after installing node

`npm install -g yarn`

**If you run into permission errors run `sudo npm install -g yarn` instead, then enter your computer password.**

Check that both are installed.

```sh
node -v
yarn -v
```

Node must be at least version 18.x.x

2. Install packages

```sh
yarn install
```

You should see a `node_modules` folder afterwards.

3. Set up your `.env` file and insert credentials for your chosen vector store. Copy `.env.example` into `.env`. Your `.env` file should look like either of the one, depending upon what you want to use as your vector store:

```
OPENAI_API_KEY=

SUPABASE_URL=
SUPABASE_PRIVATE_KEY=
```

OR

```
OPENAI_API_KEY=

PINECONE_API_KEY=
PINECONE_ENVIRONMENT=
PINECONE_INDEX_NAME=
PINECONE_NAME_SPACE=
```

Your `namespace` is a special named section in Pinecone where you may choose to store and retrieve embeddings for specific purposes. Without a `namespace`, there will be search for embeddings across your entire vectorstore index. **If your environment is `gcp-starter` Pinecone limits disable `namespace` and the ability to delete all embeddings in your vectorstore. In this case, you can either upgrade to a pro plan or use Supabase instead.**

*NOTE*: Your credentials should be identical to those used in your deployment server environment variable settings.

- Visit [OpenAI](https://help.openai.com/en/articles/4936850-where-do-i-find-my-secret-api-key) to retrieve API key.
- Visit [Supabase](https://supabase.com/dashboard/project/_/settings/api) to retrieve your keys.
  ![How to retrieve your Supabase credentials](/public/supabase-credentials.png)
- Visit [Pinecone](https://pinecone.io/) to create and retrieve your API keys, and also retrieve your environment, api keys, and index name from the dashboard.

---

## If using Pinecone as your vector store:

After signing up for Pinecone. Click on `API keys` on the navbar to get your `PINECONE_ENVIRONMENT` AND `PINECONE_API_KEY` which should be inserted into your `.env` file.

![API keys dashboard](/public/pinecone_dashboard_3.png)

Create a new index in the `indexes` navbar section. Call the index a memorable name and make sure to add dimensions as number: `1536`

![Index dashboard](/public/pinecone_dashboard_2.png)

Your new index should show a dashboard that displays your vectors alongside namespaces.

![Vectors dashboard](/public/pinecone_dashboard_1.png)

Optional: If you want to create and use pinecone namespaces, simply add a name to the `PINECONE_NAME_SPACE` variable in your `.env` file.

If you are not sure what a namespace is, you can read more [here](https://docs.pinecone.io/docs/namespaces)

## If using Supabase as your vector store:

![How to create a new query in the SQL Editor tab in your Supabase dashboard](/public/supabase-sql-editor.png)
![How to set up the documents table and match_documents function](/public/supabase-sql-editor-2.png)

1. Go to the SQL Editor tab in your Supabase dashboard
2. Click on `New Query`
3. Select `New blank query` from the dropdown
4. Set up the `documents` table and `match_documents` function by pasting the following snippet in the SQL Editor:

```
-- Enable the pgvector extension to work with embedding vectors
create extension vector;

-- Create a table to store your documents
create table documents (
  id bigserial primary key,
  content text, -- corresponds to Document.pageContent
  metadata jsonb, -- corresponds to Document.metadata
  embedding vector(1536) -- 1536 works for OpenAI embeddings, change if needed
);

-- Create a function to search for documents
create function match_documents (
  query_embedding vector(1536),
  match_count int DEFAULT null,
  filter jsonb DEFAULT '{}'
) returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
#variable_conflict use_column
begin
  return query
  select
    id,
    content,
    metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where metadata @> filter
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

5. Click on `Run` to save the results

## If you want to "ingest" manually

### Convert your files to embeddings

**This repo can load multiple files**

1. Inside `docs` folder, add your files or folders that contain the files.

2. Run the script `yarn run ingest` to 'ingest' and embed your docs. If you run into errors troubleshoot below.

3. Check the Table Editor in your Supabase dashboard to verify your vectors have been added.

**You can also manually ingest other file types by adding more loaders to the `DirectoryLoader`**

### Chat with your docs

Run `yarn dev` or `npm run dev` in your terminal to load `localhost:3000` and chat with your docs.

## If you want to "ingest" via the UI upload

First, run `yarn dev` to load `localhost:3000`, then click on `Upload documents` to pop up the upload modal.

Drag or upload a file into the upload area and then click `Upload`. Or enter a website url and then click `Search`. You should then see a success message indicating you're ready to chat with your chatbot.

## Adapting for your use case

In `config/prompts.ts`, you can change the `QUESTION_GENERATOR_CHAIN_PROMPT` and `QA_CHAIN_PROMPT` prompts for your own usecase. Please pay attention to the NOTE attached for each parameter in the file that explains what they do.

You can also modify the `QUESTION_GENERATOR_CHAIN_MODEL`, `QUESTION_GENERATOR_CHAIN_TEMPERATURE`, `QA_CHAIN_MODEL` and `QA_CHAIN_TEMPERATURE` in `config/variables.ts`. Please pay attention to the NOTE attached for each parameter in the file.

In `components/empty-screen.tsx` you can change the default UI message.


## Troubleshooting

**General errors**

- Make sure you're running the latest Node version. Run `node -v`
- Make sure you're using the same versions of LangChain and Pinecone as this repo.
- Check that you've created an `.env` file that contains your valid (and working) API keys.
- If you change `modelName` in `OpenAI` note that you need access to `gpt-4` for it to work.
- Make sure you have access to `gpt-4` if you decide to use it. Test your openAI keys outside the repo and make sure it works and that you have enough API credits.
- Your pdf file is corrupted and cannot be parsed.

## Key files

`config/fileuploadconfig.ts`: Controls to the maxfilesize and maxnumberfiles allowed per upload. These settings are preconfigured for Vercel serveless function limits.

`utils/extractTextFromFiles.ts`: handles the logic for 'loading' various file types.

`utils/manualPDFLoader.ts`: this file is used for the manual ingest process run in `ingest-data.ts`

`utils/customPDFLoader`: The PDF 'loader' that parses the uploaded files into LangChain `Documents`. Modify the `metadata` as required.

`utils/formidable.ts`: Responsible for parsing uploading files.

`utils/makechain.ts`: Logic responsible for combining question to standalone question, retrieving relevant docs and then outputting a final result. Change the `OpenAIChat` `modelName` to `gpt-3.5-turbo` if you don't have access to `gpt-4`. Modify the `QA_Prompt` for your use case.

`utils/supabase-client.ts`: The supabase client that uses the credentials from the `.env` file.

`utils/pinecone-client.ts`: The pinecone client that uses the credentials from the `.env` file.

`api/ingest.ts`: Api route responsible for 'ingesting' the uploaded files.

`api/ingest-url.ts`: Api route responsible for 'ingesting' uploaded url.

`api/delete-documents.ts`: Api route responsible for deleting all the documents from the database.

`api/chat.ts`: Api route responsible for the 'chat' process, including retrieval of relevant documents.

`components/FileUploadArea.tsx`: The file upload drop area. Modify the accepted files here as well the number of files allowed and max file size.

`components/WebsiteUrlUpload.tsx`: The website url input.

`components/action-panel.tsx`: The component that renders the action buttons at the top of the chatbot.

`components/empty-screen.tsx`: The component that renders on first load of the chatbot. It displays the welcome message and initial message prompts.

`components/chat.tsx`: The main component that renders the chatbot.

## Deployment (going live)

**Please note that eslint and typescript errors are ignored in the `next.config.js` file by default. If you would like to throw errors during production build remove these configs**

There are a couple of high-level options for deploying your app:

a.
Deploying to a VM or container
Persistent filesystem means you can save and load files from disk
Always-running process means you can cache some things in memory
You can support long-running requests, such as WebSockets

b.
Deploying to a serverless environment
No persistent filesystem means you can load files from disk, but not save them for later
Cold start means you can't cache things in memory and expect them to be cached between requests
Function timeouts mean you can't support long-running requests, such as WebSockets
Some other considerations include:

Options:

- [Vercel](https://vercel.com/docs/concepts/deployments/overview)
- [Fly.io](https://fly.io/)
- [Render](https://render.com/docs/deploy-to-render)

