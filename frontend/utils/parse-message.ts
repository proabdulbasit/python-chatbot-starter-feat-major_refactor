import type { Message } from 'ai';
import { Document } from 'langchain/document';

export function parseMessage({ content }: Message) {
  let answer = content;
  let documents: Document[] = [];

  const separator = '##SOURCE_DOCUMENTS##';
  const index = content.indexOf(separator);

  if (index !== -1) {
    const start = index + separator.length;
    const docs = content.substring(start);

    answer = answer.substring(0, index);

    try {
      documents = JSON.parse(docs);
    } catch (error) {
      // do nothing
    }
  }

  return {
    answer,
    documents,
  };
}
