import { useCallback, useRef, useState } from 'react';
import { Upload, X, Link as LinkIcon } from 'lucide-react';
import { Input } from '@/portal/components/ui/input';
import { Button } from '@/portal/components/ui/button';
import { API_BASE_URL } from '@/portal/api/config';
import { getStoredAccessToken } from '@/portal/api/tokenStorage';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  previewHeight?: string;
  folder?: string;
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
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
          throw new Error(err.detail || 'Upload failed');
        }

        const data: { url: string; ftp_synced?: boolean } = await res.json();
        onChange(data.url);
        if (data.ftp_synced) {
          // Image is already live on GoDaddy
        }
      } catch (err) {
        console.error('Upload failed:', err);
      } finally {
        setUploading(false);
        if (fileRef.current) fileRef.current.value = '';
      }
    },
    [onChange],
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
            accept="image/*"
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
