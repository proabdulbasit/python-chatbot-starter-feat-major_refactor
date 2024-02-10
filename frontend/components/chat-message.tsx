import { Message } from 'ai';
import ReactMarkdown from 'react-markdown';

import { ChatMessageActions } from '@/components/chat-message-actions';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { IconOpenAI, IconUser } from '@/components/ui/icons';
import { cn } from '@/utils/cn';
import { parseMessage } from '@/utils/parse-message';

export interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message, ...props }: ChatMessageProps) {
  const { answer, documents } = parseMessage(message);

  return (
    <div
      className={cn('group relative mb-4 flex items-start md:-ml-12')}
      {...props}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow',
          message.role === 'user'
            ? 'bg-background'
            : 'bg-primary text-primary-foreground',
        )}
      >
        {message.role === 'user' ? <IconUser /> : <IconOpenAI />}
      </div>
      <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
        <ReactMarkdown>{answer}</ReactMarkdown>
        {!!documents && documents.length > 0 && (
          <>
            <Accordion type="single" collapsible>
              {documents.map((doc, index) => (
                <div key={`sourceDoc-${index}`}>
                  <AccordionItem value={`item-${index}`}>
                    <AccordionTrigger>
                      <h3>Source {index + 1}</h3>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ReactMarkdown linkTarget="_blank">
                        {doc.pageContent}
                      </ReactMarkdown>
                      <p className="mt-2">
                        <b>Source:</b> {doc.metadata?.source}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </div>
              ))}
            </Accordion>
          </>
        )}
        <ChatMessageActions message={message} />
      </div>
    </div>
  );
}
