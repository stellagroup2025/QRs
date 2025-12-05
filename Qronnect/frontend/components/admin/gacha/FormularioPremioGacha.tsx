'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PremioGacha, TipoPremioGacha, RarezaPremio, getRarezaColor, getRarezaLabel, getTipoLabel } from '@/types/gacha';
import { crearPremio, actualizarPremio } from '@/lib/api/gacha';

interface FormularioPremioGachaProps {
  open: boolean;
  onClose: () => void;
  premio?: PremioGacha;
  onGuardado: () => void;
}

export function FormularioPremioGacha({ open, onClose, premio, onGuardado }: FormularioPremioGachaProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: premio?.nombre || '',
    descripcion: premio?.descripcion || '',
    tipo: premio?.tipo || TipoPremioGacha.DESCUENTO_PORCENTAJE,
    valor: premio?.valor || 5,
    rareza: premio?.rareza || RarezaPremio.COMUN,
    peso: premio?.peso || 100,
    dias_validez: premio?.dias_validez || 30,
    condiciones: premio?.condiciones || '',
    activo: premio?.activo ?? true,
    stock_limitado: premio?.stock_limitado || false,
    stock_actual: premio?.stock_actual || null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('admin_token');
      const domain = window.location.hostname.split('.')[0];
      const tenant = domain === 'localhost' ? 'demo-omar-77' : domain;

      if (!token) {
        throw new Error('No autenticado');
      }

      const data = {
        ...formData,
        color_rareza: getRarezaColor(formData.rareza as RarezaPremio),
      };

      if (premio) {
        await actualizarPremio(token, tenant, premio.id, data);
        toast({
          title: 'Premio actualizado',
          description: 'El premio se ha actualizado correctamente',
        });
      } else {
        await crearPremio(token, tenant, data);
        toast({
          title: 'Premio creado',
          description: 'El premio se ha creado correctamente',
        });
      }

      onGuardado();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar el premio',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{premio ? 'Editar Premio' : 'Crear Nuevo Premio'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre y Descripción */}
          <div>
            <Label htmlFor="nombre">Nombre del Premio *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="10% de descuento"
              required
            />
          </div>

          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descuento del 10% en tu próxima compra"
              rows={2}
            />
          </div>

          {/* Tipo y Valor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo">Tipo de Premio *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value as TipoPremioGacha })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TipoPremioGacha).map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {getTipoLabel(tipo)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="valor">
                Valor *{' '}
                {formData.tipo === TipoPremioGacha.DESCUENTO_PORCENTAJE && '(%)'}
                {formData.tipo === TipoPremioGacha.DESCUENTO_FIJO && '(€)'}
              </Label>
              <Input
                id="valor"
                type="number"
                min="0"
                step="0.01"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })}
                required
              />
            </div>
          </div>

          {/* Rareza y Peso */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rareza">Rareza *</Label>
              <Select
                value={formData.rareza}
                onValueChange={(value) => setFormData({ ...formData, rareza: value as RarezaPremio })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(RarezaPremio).map((rareza) => (
                    <SelectItem key={rareza} value={rareza}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getRarezaColor(rareza) }}
                        />
                        {getRarezaLabel(rareza)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Afecta el color y la presentación
              </p>
            </div>

            <div>
              <Label htmlFor="peso">Peso (Probabilidad) *</Label>
              <Input
                id="peso"
                type="number"
                min="1"
                value={formData.peso}
                onChange={(e) => setFormData({ ...formData, peso: parseInt(e.target.value) })}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Mayor peso = más probable
              </p>
            </div>
          </div>

          {/* Validez y Condiciones */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dias_validez">Días de Validez *</Label>
              <Input
                id="dias_validez"
                type="number"
                min="1"
                value={formData.dias_validez}
                onChange={(e) => setFormData({ ...formData, dias_validez: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="flex items-center justify-between pt-6">
              <div>
                <Label htmlFor="activo">Premio Activo</Label>
                <p className="text-xs text-muted-foreground">Disponible para ganar</p>
              </div>
              <Switch
                id="activo"
                checked={formData.activo}
                onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="condiciones">Condiciones de Canje</Label>
            <Textarea
              id="condiciones"
              value={formData.condiciones}
              onChange={(e) => setFormData({ ...formData, condiciones: e.target.value })}
              placeholder="Válido solo en compras superiores a 20€"
              rows={2}
            />
          </div>

          {/* Stock Limitado */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="stock_limitado">Stock Limitado</Label>
                <p className="text-xs text-muted-foreground">
                  Limita cuántas veces se puede ganar este premio
                </p>
              </div>
              <Switch
                id="stock_limitado"
                checked={formData.stock_limitado}
                onCheckedChange={(checked) => setFormData({ ...formData, stock_limitado: checked })}
              />
            </div>

            {formData.stock_limitado && (
              <div>
                <Label htmlFor="stock_actual">Stock Actual *</Label>
                <Input
                  id="stock_actual"
                  type="number"
                  min="0"
                  value={formData.stock_actual || 0}
                  onChange={(e) => setFormData({ ...formData, stock_actual: parseInt(e.target.value) || 0 })}
                  required={formData.stock_limitado}
                />
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : premio ? 'Actualizar' : 'Crear Premio'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
