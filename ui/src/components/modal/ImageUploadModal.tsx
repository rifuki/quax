"use client";

import { useState, useRef, useCallback } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  title?: string;
  description?: string;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

type UploadState = 
  | { status: 'idle' }
  | { status: 'selecting' }
  | { status: 'preview'; file: File; previewUrl: string }
  | { status: 'uploading'; progress: number }
  | { status: 'success' }
  | { status: 'error'; message: string };

export function ImageUploadModal({
  isOpen,
  onClose,
  onUpload,
  title = "Upload Image",
  description = "Select an image to upload. Maximum file size is 5MB.",
  maxSizeMB = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
}: ImageUploadModalProps) {
  const [state, setState] = useState<UploadState>({ status: 'idle' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  const acceptedExtensions = acceptedTypes.map(t => t.split('/')[1]).join(', ');

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Accepted: ${acceptedExtensions}`;
    }
    if (file.size > maxSizeBytes) {
      return `File too large. Maximum size: ${maxSizeMB}MB`;
    }
    return null;
  };

  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = useCallback(async (file: File) => {
    const error = validateFile(file);
    if (error) {
      setState({ status: 'error', message: error });
      return;
    }

    try {
      const previewUrl = await createPreview(file);
      setState({ status: 'preview', file, previewUrl });
    } catch {
      setState({ status: 'error', message: 'Failed to preview image' });
    }
  }, [maxSizeBytes, acceptedTypes]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    if (state.status === 'idle' || state.status === 'error') {
      setState({ status: 'selecting' });
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0 && state.status === 'selecting') {
      setState({ status: 'idle' });
    }
  };

  const handleUpload = async () => {
    if (state.status !== 'preview') return;
    
    setState({ status: 'uploading', progress: 0 });
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setState(prev => {
        if (prev.status === 'uploading' && prev.progress < 90) {
          return { ...prev, progress: prev.progress + 10 };
        }
        return prev;
      });
    }, 200);

    try {
      await onUpload(state.file);
      clearInterval(progressInterval);
      setState({ status: 'success' });
      // Auto close after success
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      clearInterval(progressInterval);
      setState({ 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Upload failed' 
      });
    }
  };

  const handleClose = () => {
    // Cleanup preview URL
    if (state.status === 'preview') {
      URL.revokeObjectURL(state.previewUrl);
    }
    setState({ status: 'idle' });
    onClose();
  };

  const isDragging = state.status === 'selecting';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
        />

        <div className="mt-4">
          {/* Error State */}
          {state.status === 'error' && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          {/* Uploading State */}
          {state.status === 'uploading' && (
            <div className="space-y-4 py-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Upload className="h-8 w-8 text-primary animate-bounce" />
                </div>
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </div>
              <Progress value={state.progress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">
                {state.progress}%
              </p>
            </div>
          )}

          {/* Success State */}
          {state.status === 'success' && (
            <div className="py-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <p className="font-medium">Upload successful!</p>
              <p className="text-sm text-muted-foreground">Your image has been updated</p>
            </div>
          )}

          {/* Preview State */}
          {state.status === 'preview' && (
            <div className="space-y-4">
              <div className="relative aspect-square max-h-64 overflow-hidden rounded-lg border bg-muted">
                <img
                  src={state.previewUrl}
                  alt="Preview"
                  className="h-full w-full object-contain"
                />
                <button
                  onClick={() => setState({ status: 'idle' })}
                  className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setState({ status: 'idle' })}>
                  Cancel
                </Button>
                <Button onClick={handleUpload}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </div>
            </div>
          )}

          {/* Idle/Selecting State */}
          {(state.status === 'idle' || state.status === 'selecting') && (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              className={cn(
                "relative border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer",
                "hover:border-primary/50 hover:bg-muted/50",
                isDragging && "border-primary bg-primary/5"
              )}
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {acceptedExtensions.toUpperCase()} up to {maxSizeMB}MB
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
