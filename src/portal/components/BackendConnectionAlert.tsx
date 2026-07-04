import React from 'react';
import { AlertTriangle } from 'lucide-react';

import type { BackendCatalogWarning } from '@/portal/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/portal/components/ui/alert';

interface BackendConnectionAlertProps {
  warning: BackendCatalogWarning;
}

export function BackendConnectionAlert({
  warning,
}: BackendConnectionAlertProps): React.ReactElement {
  return (
    <Alert className="border-amber-300 bg-amber-50 text-amber-900 [&>svg]:text-amber-600">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{warning.title}</AlertTitle>
      <AlertDescription>{warning.message}</AlertDescription>
    </Alert>
  );
}

export default BackendConnectionAlert;
