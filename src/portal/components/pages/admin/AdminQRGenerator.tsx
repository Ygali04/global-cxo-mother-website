import type { JSX } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { toast } from 'sonner';
import { Copy, Download, ExternalLink, Pencil, Plus, QrCode, Trash2 } from 'lucide-react';

import { Badge } from '@/portal/components/ui/badge';
import { Button } from '@/portal/components/ui/button';
import { Card, CardContent } from '@/portal/components/ui/card';
import { Input } from '@/portal/components/ui/input';
import { Label } from '@/portal/components/ui/label';
import { Switch } from '@/portal/components/ui/switch';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/portal/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/portal/components/ui/table';
import { TableSkeleton } from '@/portal/components/ui/admin-skeletons';
import { API_BASE_URL } from '@/portal/api/config';
import { useQRCodes, useCreateQRCode, useUpdateQRCode, useDeleteQRCode } from '@/portal/hooks/useQRCodes';

// GCXO brand colors
const NAVY_DARK = '#1f2f62';
const BLUE_ACCENT = '#3EA8F9';

const BACKEND_BASE = API_BASE_URL.replace(/\/api$/, '');

function buildRedirectUrl(slug: string): string {
  return `${BACKEND_BASE}/qr/${slug}`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

// ---------------------------------------------------------------------------
// QR Preview (rendered client-side via qr-code-styling)
// ---------------------------------------------------------------------------

function QRPreview({ url, size = 240 }: { url: string; size?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    if (!url) return;
    const qr = new QRCodeStyling({
      width: size,
      height: size,
      data: url,
      margin: 8,
      dotsOptions: {
        color: NAVY_DARK,
        type: 'rounded',
      },
      cornersSquareOptions: {
        color: NAVY_DARK,
        type: 'extra-rounded',
      },
      cornersDotOptions: {
        color: BLUE_ACCENT,
        type: 'dot',
      },
      backgroundOptions: {
        color: '#ffffff',
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 6,
        imageSize: 0.35,
      },
      image: '/cxo-circle-logo.png',
    });
    qrRef.current = qr;
    if (ref.current) {
      // Safe: clearing our own container before the library appends a <canvas>
      while (ref.current.firstChild) ref.current.removeChild(ref.current.firstChild);
      qr.append(ref.current);
    }
  }, [url, size]);

  const handleDownload = useCallback(() => {
    qrRef.current?.download({ name: 'gcxo-qr-code', extension: 'png' });
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={ref}
        className="rounded-xl border-2 border-slate-100 bg-white p-2 shadow-sm"
      />
      <Button size="sm" variant="outline" onClick={handleDownload}>
        <Download className="mr-1.5 h-3.5 w-3.5" />
        Download PNG
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function AdminQRGenerator(): JSX.Element {
  const { data: codes = [], isLoading } = useQRCodes();
  const { mutateAsync: createMutate, isPending: creating } = useCreateQRCode();
  const { mutateAsync: updateMutate } = useUpdateQRCode();
  const { mutateAsync: deleteMutate } = useDeleteQRCode();

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createLabel, setCreateLabel] = useState('');
  const [createSlug, setCreateSlug] = useState('');
  const [createUrl, setCreateUrl] = useState('');
  const [slugManual, setSlugManual] = useState(false);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState('');
  const [editLabel, setEditLabel] = useState('');
  const [editUrl, setEditUrl] = useState('');

  // Preview dialog
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);

  const handleCreate = async () => {
    const slug = createSlug || slugify(createLabel);
    if (!createLabel.trim() || !createUrl.trim() || !slug) {
      toast.error('Label, URL, and slug are required');
      return;
    }
    try {
      await createMutate({ label: createLabel.trim(), slug, target_url: createUrl.trim() });
      toast.success('QR code created');
      setCreateOpen(false);
      setCreateLabel('');
      setCreateSlug('');
      setCreateUrl('');
      setSlugManual(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to create QR code');
    }
  };

  const handleEdit = async () => {
    if (!editLabel.trim() || !editUrl.trim()) {
      toast.error('Label and URL are required');
      return;
    }
    try {
      await updateMutate({ id: editId, data: { label: editLabel.trim(), target_url: editUrl.trim() } });
      toast.success('QR code updated');
      setEditOpen(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update');
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await updateMutate({ id, data: { is_active: !currentActive } });
      toast.success(currentActive ? 'QR code deactivated' : 'QR code activated');
    } catch {
      toast.error('Failed to toggle status');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutate(id);
      toast.success('QR code deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const copyRedirectUrl = (slug: string) => {
    void navigator.clipboard.writeText(buildRedirectUrl(slug));
    toast.success('Redirect URL copied');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">QR Code Generator</h1>
          <p className="mt-1 text-sm text-slate-600">
            Create branded, dynamic QR codes. Change the destination URL anytime — the same QR code keeps working.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          New QR Code
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <Card className="p-4"><TableSkeleton rows={4} columns={5} /></Card>
      ) : codes.length === 0 ? (
        <Card className="border-2 border-dashed border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <QrCode className="h-10 w-10 text-slate-300 mb-3" />
            <p className="text-base font-semibold text-slate-700">No QR codes yet</p>
            <p className="mt-1 text-sm text-slate-500">Create your first branded QR code to get started.</p>
            <Button className="mt-4" onClick={() => setCreateOpen(true)}>Create QR Code</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Scans</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {codes.map((code) => (
                <TableRow key={code.id}>
                  <TableCell className="font-medium text-slate-900">{code.label}</TableCell>
                  <TableCell>
                    <button
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-mono"
                      onClick={() => copyRedirectUrl(code.slug)}
                      title="Click to copy redirect URL"
                    >
                      /qr/{code.slug}
                      <Copy className="h-3 w-3" />
                    </button>
                  </TableCell>
                  <TableCell>
                    <a
                      href={code.target_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 max-w-[200px] truncate"
                    >
                      {code.target_url}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">{code.scan_count}</Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={code.is_active}
                      onCheckedChange={() => handleToggleActive(code.id, code.is_active)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => setPreviewSlug(code.slug)}
                      >
                        <QrCode className="mr-1 h-3.5 w-3.5" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          setEditId(code.id);
                          setEditLabel(code.label);
                          setEditUrl(code.target_url);
                          setEditOpen(true);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(code.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* ── Create Dialog ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create QR Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qr-label">Label</Label>
              <Input
                id="qr-label"
                placeholder="e.g. Spring 2026 Event Invite"
                value={createLabel}
                onChange={(e) => {
                  setCreateLabel(e.target.value);
                  if (!slugManual) setCreateSlug(slugify(e.target.value));
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qr-slug">Slug</Label>
              <Input
                id="qr-slug"
                placeholder="spring-2026-invite"
                value={createSlug}
                onChange={(e) => { setSlugManual(true); setCreateSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); }}
                className="font-mono text-sm"
              />
              <p className="text-xs text-slate-400">
                Redirect URL: {buildRedirectUrl(createSlug || 'your-slug')}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="qr-url">Destination URL</Label>
              <Input
                id="qr-url"
                type="url"
                placeholder="https://globalcxocircle.com/events/spring-2026"
                value={createUrl}
                onChange={(e) => setCreateUrl(e.target.value)}
              />
            </div>
            {/* Live preview */}
            {createUrl && createSlug && (
              <div className="border-t pt-4">
                <p className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-wide">Preview</p>
                <QRPreview url={buildRedirectUrl(createSlug)} size={200} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? 'Creating...' : 'Create QR Code'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit QR Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-label">Label</Label>
              <Input id="edit-label" value={editLabel} onChange={(e) => setEditLabel(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-url">Destination URL</Label>
              <Input id="edit-url" type="url" value={editUrl} onChange={(e) => setEditUrl(e.target.value)} />
              <p className="text-xs text-slate-400">
                Change the destination — the QR code image and redirect URL stay the same.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Preview Dialog ── */}
      <Dialog open={!!previewSlug} onOpenChange={(open) => { if (!open) setPreviewSlug(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>QR Code Preview</DialogTitle>
          </DialogHeader>
          {previewSlug && (
            <div className="flex flex-col items-center gap-4 py-2">
              <QRPreview url={buildRedirectUrl(previewSlug)} size={280} />
              <button
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-mono"
                onClick={() => { void navigator.clipboard.writeText(buildRedirectUrl(previewSlug)); toast.success('URL copied'); }}
              >
                {buildRedirectUrl(previewSlug)}
                <Copy className="h-3 w-3" />
              </button>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewSlug(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
