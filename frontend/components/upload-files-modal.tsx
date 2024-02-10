import { FileUploadArea } from '@/components/FileUploadArea';
import { WebUpload } from '@/components/WebsiteUrlUpload';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { IconPlus } from '@/components/ui/icons';
import { file_upload_config } from '@/config/fileuploadconfig';
import { useToast } from '@/hooks/use-toast';
import { urlPattern } from '@/utils/helpers';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { Separator } from './ui/separator';
import { apiBaseUrl } from '@/utils/constants';

export default function UploadFilesModal() {
  const [isUploadView, setIsUploadView] = useState(false);
  const [files, setFiles] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingUrl, setIsUploadingUrl] = useState(false);
  const [url, setUrl] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();
  const { toast } = useToast();

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  const handleUploadClick = () => {
    setIsUploadView(true);
  };

  const handleCancelClick = () => {
    setIsUploadView(false);
  };

  const handleDocumentsDeletion = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/delete-documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('data', data);

      if (data.error) {
        toast({
          title: 'Something went wrong',
          description: data.error,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      toast({
        title: 'Success',
        description: 'Your documents have been deleted',
        variant: 'default',
      });
      setLoading(false);
      setIsOpen(false);
      router.push('/');
    } catch (error) {
      setLoading(false);
      console.log('error', error);
    }
  };

  // handle file upload
  async function handleFileUpload() {
    setIsUploading(true);

    toast({
      title: 'Uploading files',
      description: 'Please wait while we upload your files',
      variant: 'default',
    });

    const formData = new FormData();
    Array.from(files || []).forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`${apiBaseUrl}/api/ingest`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      console.log('data', data);

      if (data.error) {
        toast({
          title: 'Something went wrong',
          description: data.error,
          variant: 'destructive',
        });
        setIsUploading(false);
      } else {
        toast({
          title: 'Your files have been uploaded successfully',
          variant: 'default',
        });
        setIsUploadView(false);
        router.push('/');
      }
    } catch (error: any) {
      console.log(error);
      toast({
        title: 'Something went wrong, please try again',
        description: error.message || '',
        variant: 'destructive',
      });
      setIsUploading(false);
    }

    setIsUploading(false);
    setFiles(null);
  }

  // handle web url submission
  async function handleUrlUpload() {
    if (url.length === 0) {
      toast({
        title: 'Error',
        description: 'URL is required',
        variant: 'destructive',
      });
      return;
    }

    if (!urlPattern.test(url)) {
      toast({
        title: 'Error',
        description: 'Invalid URL',
        variant: 'destructive',
      });
      return;
    }
    const urlInput = url.trim();

    setIsUploadingUrl(true);
    setUrl(urlInput);

    try {
      const response = await fetch(`${apiBaseUrl}/api/ingest-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: urlInput,
        }),
      });
      const data = await response.json();
      if (data.error) {
        toast({
          title: 'Something went wrong',
          description: data.error,
          variant: 'destructive',
        });
        setIsUploadingUrl(false);
      } else {
        toast({
          title: 'Your website url has been uploaded successfully',
        });
        setIsUploadView(false);
        router.push('/');
      }
    } catch (error: any) {
      console.log(error);
      toast({
        title: 'Something went wrong, please try again',
        description: error.message || '',
        variant: 'destructive',
      });
      setIsUploadingUrl(false);
    }

    setIsUploadingUrl(false);
    setUrl('');
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => setIsOpen(open)}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="absolute left-0 top-4 h-8 w-8 rounded-full bg-slate-100 p-0 sm:left-4"
        >
          <IconPlus />
          <span className="sr-only">Upload Files</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {isUploadView ? (
          <>
            <FileUploadArea
              setFiles={setFiles}
              isUploading={isUploading}
              handleFileUpload={handleFileUpload}
              files={files}
              maxFileSizeMB={file_upload_config.max_file_size_mb}
              maxNumFiles={file_upload_config.max_num_files_upload}
            />
            <Separator />
            <WebUpload
              handleUrlUpload={handleUrlUpload}
              isUploadingUrl={isUploadingUrl}
              handleUrlChange={handleUrlChange}
              url={url}
            />
            <DialogFooter className="mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelClick}
              >
                Cancel
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader className="space-y-8">
              <DialogTitle>Upload or Delete Files</DialogTitle>
              <DialogDescription className="space-y-2">
                <p className="font-bold">
                  If you do not need to upload or delete files, you can close
                  this window.
                </p>
                <p>
                  Make sure you have already uploaded a file or website url
                  before using the chat. If not, click {'upload new document'}.
                </p>
                <p>
                  If you have already uploaded but prefer to use a new file or
                  website url, please click {'delete documents'} first before
                  re-uploading.
                </p>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-8 gap-4">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDocumentsDeletion}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete documents
              </Button>
              <Button type="button" onClick={handleUploadClick}>
                Upload new document
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
