import { useCallback, useRef, useState } from 'react';
import { Upload, X, Link as LinkIcon } from 'lucide-react';
import { Input } from '@/portal/components/ui/input';
import { Button } from '@/portal/components/ui/button';
import { API_BASE_URL } from '@/portal/api/config';
import { getStoredAccessToken } from '@/portal/api/tokenStorage';
import { toast } from 'sonner';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  previewHeight?: string;
  folder?: string;
}

function compressImageFile(file: File, maxWidth = 1600, maxHeight = 1600, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.type === 'image/svg+xml' || file.type.includes('icon')) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      resolve(canvas.toDataURL(mime, quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    };
    img.src = url;
  });
}

export function ImageUpload({
  value,
  onChange,
  label,
  placeholder = 'Paste URL or upload a file...',
  previewHeight = 'h-32',
  folder = 'general',
}: ImageUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<'url' | 'upload'>('url');

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      let uploadedUrl: string | null = null;

      try {
        const formData = new FormData();
        formData.append('file', file);

        const token = getStoredAccessToken();
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE_URL}/uploads?folder=${encodeURIComponent(folder)}`, {
          method: 'POST',
          headers,
          body: formData,
          credentials: 'include',
        }).catch(() => null);

        if (res && res.ok) {
          const data: { url?: string } = await res.json().catch(() => ({}));
          if (data.url) {
            uploadedUrl = data.url;
          }
        }
      } catch {
        // Quietly fallback to client-side compressed image
      }

      try {
        if (uploadedUrl) {
          onChange(uploadedUrl);
          toast.success(`Image uploaded: ${file.name}`);
        } else {
          const dataUrl = await compressImageFile(file);
          onChange(dataUrl);
          toast.success(`Image attached: ${file.name}`);
        }
      } catch (readErr) {
        console.error('Failed to process image file:', readErr);
        toast.error(`Could not process image file ${file.name}`);
      } finally {
        setUploading(false);
        if (fileRef.current) fileRef.current.value = '';
      }
    },
    [folder, onChange],
  );

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}

      <div className="flex gap-1 mb-1">
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`text-xs px-2 py-0.5 rounded ${mode === 'url' ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <LinkIcon className="inline h-3 w-3 mr-1" />URL
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`text-xs px-2 py-0.5 rounded ${mode === 'upload' ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Upload className="inline h-3 w-3 mr-1" />Upload
        </button>
      </div>

      {mode === 'url' ? (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="text-sm"
        />
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50 px-4 py-3 cursor-pointer transition-colors"
        >
          <Upload className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-500">
            {uploading ? 'Uploading...' : 'Click to choose a file'}
          </span>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml,image/avif,image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>
      )}

      {value && (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Preview"
            className={`${previewHeight} rounded-lg object-cover border`}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 h-5 w-5 bg-black/50 hover:bg-black/70 text-white rounded-full"
            onClick={() => onChange('')}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
