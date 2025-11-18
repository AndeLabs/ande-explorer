'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Check } from 'lucide-react';

interface ExportButtonProps {
  onExport: () => void;
  filename?: string;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function ExportButton({
  onExport,
  filename,
  disabled = false,
  variant = 'outline',
  size = 'sm',
  className = '',
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClick = async () => {
    setIsExporting(true);
    try {
      await onExport();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled || isExporting}
      className={className}
    >
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : showSuccess ? (
        <>
          <Check className="mr-2 h-4 w-4 text-green-600" />
          Exported!
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </>
      )}
    </Button>
  );
}
