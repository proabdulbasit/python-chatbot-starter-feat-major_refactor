import Link from 'next/link';
import * as React from 'react';
import ActionPanel from './action-panel';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center flex-col justify-center sm:flex-row sm:justify-between w-full sm:h-16 px-4 py-4 sm:py-0 gap-4 border-b shrink-0 backdrop-blur-xl bg-gradient-to-b from-background/10 via-background/50 to-background/80">
      <Link href="/">
        <h1 className="font-bold text-xl">AI Chatbot Starter</h1>
      </Link>
      <div className="flex items-center justify-end space-x-2">
        <ActionPanel />
      </div>
    </header>
  );
}
