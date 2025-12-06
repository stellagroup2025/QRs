'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { QrCode, Scan, Link2 } from 'lucide-react';
import { asignarQr } from '@/lib/api/qr-codes';

interface AsignarQrModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idTienda: string;
  nombreTienda: string;
  onSuccess?: () => void;
}

export default function AsignarQrModal({
  open,
  onOpenChange,
  idTienda,
  nombreTienda,
  onSuccess,
}: AsignarQrModalProps) {
  const { toast } = useToast();
  const [hash, setHash] = useState('');
  const [asignando, setAsignando] = useState(false);

  const handleAsignar = async () => {
    if (!hash.trim()) {
      toast({
        title: 'Hash requerido',
        description: 'Debes ingresar el hash del QR code',
        variant: 'destructive',
      });
      return;
    }

    setAsignando(true);
    try {
      const token = localStorage.getItem('superadmin_token');
      if (!token) {
        toast({
          title: 'No autenticado',
          description: 'Debes iniciar sesión como superadmin',
          variant: 'destructive',
        });
        return;
      }

      await asignarQr(token, {
        hash: hash.trim(),
        id_tienda: idTienda,
      });

      toast({
        title: '¡QR Code Asignado!',
        description: `El QR "${hash}" ha sido asignado a ${nombreTienda}`,
      });

      setHash('');
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo asignar el QR code',
        variant: 'destructive',
      });
    } finally {
      setAsignando(false);
    }
  };

  const extraerHashDeUrl = (url: string): string => {
    // Intenta extraer el hash de URLs como:
    // https://qronnect.es/q/abc123XYZ9
    // qronnect.es/q/abc123XYZ9
    // /q/abc123XYZ9
    // abc123XYZ9
    const match = url.match(/\/q\/([a-zA-Z0-9]+)/);
    if (match) {
      return match[1];
    }
    // Si no tiene formato de URL, asumir que es el hash directamente
    return url.trim();
  };

  const handlePegar = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const extractedHash = extraerHashDeUrl(text);
      setHash(extractedHash);

      toast({
        title: 'Pegado desde portapapeles',
        description: `Hash detectado: ${extractedHash}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo leer del portapapeles',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Asignar QR Code a Tienda
          </DialogTitle>
          <DialogDescription>
            Asigna un QR code pre-impreso a <strong>{nombreTienda}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Instrucciones */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-2">
              <Scan className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Cómo asignar un QR:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-800">
                  <li>Escanea el QR code con tu teléfono</li>
                  <li>Copia la URL completa</li>
                  <li>Pégala aquí abajo (se extraerá el hash automáticamente)</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Input para el hash */}
          <div className="space-y-2">
            <Label htmlFor="hash">Hash del QR Code</Label>
            <div className="flex gap-2">
              <Input
                id="hash"
                placeholder="abc123XYZ9 o pega la URL completa"
                value={hash}
                onChange={(e) => {
                  const value = e.target.value;
                  // Intentar extraer hash si parece una URL
                  if (value.includes('/q/')) {
                    setHash(extraerHashDeUrl(value));
                  } else {
                    setHash(value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAsignar();
                  }
                }}
              />
              <Button variant="outline" onClick={handlePegar}>
                <Link2 className="h-4 w-4 mr-2" />
                Pegar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Puedes pegar la URL completa (ej: https://qronnect.es/q/abc123XYZ9) o solo el hash
            </p>
          </div>

          {/* Preview del hash */}
          {hash && (
            <div className="bg-muted rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Hash detectado:</p>
              <code className="text-sm font-mono font-semibold">{hash}</code>
              <p className="text-xs text-muted-foreground mt-1">
                URL: https://qronnect.es/q/{hash}
              </p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleAsignar} disabled={asignando || !hash} className="flex-1">
              {asignando ? 'Asignando...' : 'Asignar QR Code'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
