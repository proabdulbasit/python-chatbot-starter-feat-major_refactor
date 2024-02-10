// NOTE: It is mandatory to have {question} and {chat_history} placeholders in your `QUESTION_GENERATOR_CHAIN_PROMPT` prompt.
// This prompt affects how the model generates a standalone question based on chat history
export const QUESTION_GENERATOR_CHAIN_PROMPT = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

// NOTE: It is mandatory to have {question} and {context} placeholders in your `QA_CHAIN_PROMPT` prompt.
// This prompt affects how the model generates a final response based on the context source docs retrieved from your vector store.
export const QA_CHAIN_PROMPT = `You are an AI assistant. Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
Question: {question}
=========
{context}
=========
Answer in Markdown:
`;
