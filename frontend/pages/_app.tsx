import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import '@/styles/base.css';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <TooltipProvider>
      <Component {...pageProps} />
      <Toaster />
    </TooltipProvider>
  );
}

export default MyApp;
