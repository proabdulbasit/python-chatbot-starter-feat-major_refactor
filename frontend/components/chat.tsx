import { useChat } from 'ai/react';

interface ChatProps {}

import { ChatList } from '@/components/chat-list';
import { ChatPanel } from '@/components/chat-panel';
import { EmptyScreen } from '@/components/empty-screen';
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor';
import { useToast } from '@/hooks/use-toast';
import { apiBaseUrl } from "../utils/constants";

export default function Chat({}: ChatProps) {
  const { toast } = useToast();
  const { messages, append, reload, stop, isLoading, input, setInput } =
    useChat({
      api: `${apiBaseUrl}/api/chat`,
      onError(error) {
        toast({ title: error.message, variant: 'destructive' });
      },
    });

  return (
    <>
      <div className="pb-[200px] pt-4 md:pt-10">
        {messages.length ? (
          <>
            <ChatList messages={messages} />
            <ChatScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          <EmptyScreen setInput={setInput} />
        )}
      </div>
      <ChatPanel
        isLoading={isLoading}
        stop={stop}
        append={append}
        reload={reload}
        messages={messages}
        input={input}
        setInput={setInput}
      />
    </>
  );
}
