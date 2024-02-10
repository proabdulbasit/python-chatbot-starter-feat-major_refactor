import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { urlPattern } from '@/utils/helpers';
import { Loader2 } from 'lucide-react';

interface WebUploadProps {
  handleUrlUpload: () => void;
  isUploadingUrl: boolean;
  handleUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  url: string;
}

export function WebUpload({
  handleUrlUpload,
  isUploadingUrl,
  handleUrlChange,
  url,
}: WebUploadProps) {
  return (
    <div className="flex flex-col items-start gap-2 max-w-sm">
      <h2>Insert a Website Url</h2>
      <div className="flex w-full items-center space-x-2">
        <Input
          type="text"
          placeholder="https://openai.com/blog/chatgpt"
          className="w-full"
          onChange={handleUrlChange}
          value={url}
        />
        <Button
          type="button"
          onClick={handleUrlUpload}
          disabled={isUploadingUrl || url.length === 0 || !urlPattern.test(url)}
        >
          {isUploadingUrl && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Search
        </Button>
      </div>
    </div>
  );
}
