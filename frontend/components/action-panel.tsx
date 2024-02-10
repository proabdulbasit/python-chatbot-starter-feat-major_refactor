import { file_upload_config } from '@/config/fileuploadconfig';
import { useToast } from '@/hooks/use-toast';
import { urlPattern } from '@/utils/helpers';
import { Separator } from '@radix-ui/react-separator';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { FileUploadArea } from './FileUploadArea';
import { WebUpload } from './WebsiteUrlUpload';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { Button, buttonVariants } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { apiBaseUrl } from '@/utils/constants';

const ActionPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [files, setFiles] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingUrl, setIsUploadingUrl] = useState(false);
  const [url, setUrl] = useState<string>('');

  const { toast } = useToast();

  const handleDocumentsDeletion = async () => {
    setIsLoading(true);

    toast({
      title: 'Deleting documents',
      description: 'Please wait while we delete your documents',
    });

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
        return;
      }

      toast({
        title: 'Your documents have been deleted successfully',
      });
    } catch (error) {
      console.log('error', error);
    } finally {
      setIsLoading(false);
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
        });
        setIsOpen(false);
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
        setIsOpen(false);
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
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Delete Documents</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete all documents?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all
              your previously uploaded documents from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              className={buttonVariants({ variant: 'destructive' })}
              onClick={handleDocumentsDeletion}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isOpen} onOpenChange={(open: boolean) => setIsOpen(open)}>
        <DialogTrigger asChild>
          <Button>Upload Documents</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload Documents</DialogTitle>
            <DialogDescription>
              If you have already uploaded but prefer to use a new file or
              website url, please delete documents first before re-uploading.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ActionPanel;
