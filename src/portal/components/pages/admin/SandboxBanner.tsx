/**
 * SandboxBanner — top-of-page alert shown when a sandbox action has just fired.
 *
 * Renders a dismissible amber banner with the sandbox run result.
 */

import { Alert, AlertDescription, AlertTitle } from '@/portal/components/ui/alert';
import { FlaskConical, X } from 'lucide-react';
import { Button } from '@/portal/components/ui/button';

interface SandboxBannerProps {
  sentTo: string;
  emailType: string;
  onDismiss: () => void;
}

export function SandboxBanner({ sentTo, emailType, onDismiss }: SandboxBannerProps) {
  return (
    <Alert className="border-amber-300 bg-amber-50 mb-4">
      <FlaskConical className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Sandbox email sent</AlertTitle>
      <AlertDescription className="text-amber-700">
        A <strong>[SANDBOX] {emailType}</strong> email was sent to <strong>{sentTo}</strong>.
        No data was written to the database.
      </AlertDescription>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-6 w-6 p-0 text-amber-600 hover:text-amber-800"
        onClick={onDismiss}
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  );
}
