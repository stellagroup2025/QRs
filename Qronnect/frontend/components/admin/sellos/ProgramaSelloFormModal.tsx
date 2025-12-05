'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  ProgramaSellos,
  TipoPremioSello,
  CrearProgramaSellosRequest,
  obtenerTextoTipoPremio,
} from '@/types/sellos';
import { crearProgramaSellos, actualizarProgramaSello } from '@/lib/api/sellos';
import { toast } from 'sonner';

interface ProgramaSelloFormModalProps {
  programa: ProgramaSellos | null;
  programaDesdePlantilla?: any | null;
  token: string;
  domain: string;
  onClose: (actualizado: boolean) => void;
}

export function ProgramaSelloFormModal({ programa, programaDesdePlantilla, token, domain, onClose }: ProgramaSelloFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CrearProgramaSellosRequest>({
    nombre: '',
    descripcion: '',
    icono: 'stamp',
    color: '#3B82F6',
    sellos_requeridos: 10,
    tipo_premio: TipoPremioSello.PRODUCTO,
    premio_detalles: { nombre: '', descripcion: '' },
    instrucciones_canje: 'Presenta este cupón al personal para canjearlo',
    dias_validez_cupon: 30,
    sellos_por_dia_max: 1,
    requiere_compra_minima: false,
    activo: true,
    visible_cliente: true,
  });

  // Cargar datos si es edición o plantilla
  useEffect(() => {
    if (programa) {
      // Modo edición - cargar programa existente
      setFormData({
        nombre: programa.nombre,
        descripcion: programa.descripcion,
        icono: programa.icono,
        color: programa.color,
        sellos_requeridos: programa.sellos_requeridos,
        tipo_premio: programa.tipo_premio,
        premio_detalles: programa.premio_detalles,
        instrucciones_canje: programa.instrucciones_canje,
        dias_validez_cupon: programa.dias_validez_cupon,
        sellos_por_dia_max: programa.sellos_por_dia_max,
        requiere_compra_minima: programa.requiere_compra_minima,
        compra_minima: programa.compra_minima,
        activo: programa.activo,
        visible_cliente: programa.visible_cliente,
      });
    } else if (programaDesdePlantilla) {
      // Modo plantilla - pre-rellenar con datos de la plantilla
      setFormData({
        ...formData,
        ...programaDesdePlantilla,
      });
    }
  }, [programa, programaDesdePlantilla]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (programa) {
        await actualizarProgramaSello(programa.id, formData, token, domain);
        toast.success('Programa actualizado exitosamente');
      } else {
        await crearProgramaSellos(formData, token, domain);
        toast.success('Programa creado exitosamente');
      }
      onClose(true);
    } catch (error: any) {
      console.error('Error al guardar programa:', error);
      toast.error(error.message || 'Error al guardar programa');
    } finally {
      setLoading(false);
    }
  };

  const handleTipoPremioChange = (tipo: TipoPremioSello) => {
    setFormData({
      ...formData,
      tipo_premio: tipo,
      premio_detalles: getDefaultPremioDetalles(tipo),
    });
  };

  const getDefaultPremioDetalles = (tipo: TipoPremioSello) => {
    switch (tipo) {
      case TipoPremioSello.PRODUCTO:
        return { nombre: '', descripcion: '' };
      case TipoPremioSello.DESCUENTO_PORCENTAJE:
        return { porcentaje: 10, max_descuento: 0 };
      case TipoPremioSello.DESCUENTO_FIJO:
        return { monto: 5, moneda: 'EUR' };
      case TipoPremioSello.PUNTOS:
        return { puntos: 100 };
      case TipoPremioSello.TEXTO:
        return { texto: '', instrucciones: '' };
      default:
        return {};
    }
  };

  const renderPremioDetallesFields = () => {
    switch (formData.tipo_premio) {
      case TipoPremioSello.PRODUCTO:
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="premio_nombre">Nombre del producto/servicio *</Label>
              <Input
                id="premio_nombre"
                value={(formData.premio_detalles as any).nombre || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    premio_detalles: {
                      ...(formData.premio_detalles as any),
                      nombre: e.target.value,
                    },
                  })
                }
                placeholder="Ej: Café gratis, Corte de pelo gratis"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="premio_descripcion">Descripción (opcional)</Label>
              <Textarea
                id="premio_descripcion"
                value={(formData.premio_detalles as any).descripcion || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    premio_detalles: {
                      ...(formData.premio_detalles as any),
                      descripcion: e.target.value,
                    },
                  })
                }
                placeholder="Descripción detallada del premio"
                rows={2}
              />
            </div>
          </>
        );

      case TipoPremioSello.DESCUENTO_PORCENTAJE:
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="premio_porcentaje">Porcentaje de descuento *</Label>
              <Input
                id="premio_porcentaje"
                type="number"
                min="1"
                max="100"
                value={(formData.premio_detalles as any).porcentaje || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    premio_detalles: {
                      ...(formData.premio_detalles as any),
                      porcentaje: parseInt(e.target.value),
                    },
                  })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="premio_max_descuento">Descuento máximo € (opcional)</Label>
              <Input
                id="premio_max_descuento"
                type="number"
                min="0"
                step="0.01"
                value={(formData.premio_detalles as any).max_descuento || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    premio_detalles: {
                      ...(formData.premio_detalles as any),
                      max_descuento: parseFloat(e.target.value),
                    },
                  })
                }
                placeholder="0 = sin límite"
              />
            </div>
          </div>
        );

      case TipoPremioSello.DESCUENTO_FIJO:
        return (
          <div className="space-y-2">
            <Label htmlFor="premio_monto">Monto de descuento (€) *</Label>
            <Input
              id="premio_monto"
              type="number"
              min="0.01"
              step="0.01"
              value={(formData.premio_detalles as any).monto || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  premio_detalles: {
                    ...(formData.premio_detalles as any),
                    monto: parseFloat(e.target.value),
                  },
                })
              }
              required
            />
          </div>
        );

      case TipoPremioSello.PUNTOS:
        return (
          <div className="space-y-2">
            <Label htmlFor="premio_puntos">Cantidad de puntos *</Label>
            <Input
              id="premio_puntos"
              type="number"
              min="1"
              value={(formData.premio_detalles as any).puntos || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  premio_detalles: {
                    ...(formData.premio_detalles as any),
                    puntos: parseInt(e.target.value),
                  },
                })
              }
              required
            />
          </div>
        );

      case TipoPremioSello.TEXTO:
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="premio_texto">Descripción del premio *</Label>
              <Input
                id="premio_texto"
                value={(formData.premio_detalles as any).texto || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    premio_detalles: {
                      ...(formData.premio_detalles as any),
                      texto: e.target.value,
                    },
                  })
                }
                placeholder="Ej: Postre del día gratis"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="premio_instrucciones_texto">Instrucciones adicionales</Label>
              <Textarea
                id="premio_instrucciones_texto"
                value={(formData.premio_detalles as any).instrucciones || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    premio_detalles: {
                      ...(formData.premio_detalles as any),
                      instrucciones: e.target.value,
                    },
                  })
                }
                placeholder="Ej: Válido de lunes a viernes"
                rows={2}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose(false)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {programa ? 'Editar Programa de Sellos' : 'Nuevo Programa de Sellos'}
          </DialogTitle>
          <DialogDescription>
            {programa
              ? 'Actualiza la configuración de tu programa de tarjetas de sellos'
              : 'Crea un nuevo programa de fidelización con tarjetas de sellos para tus clientes'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Información Básica</h3>

            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del programa *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Cafetería - 10 cafés"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Ej: Compra 10 cafés y llévate el 11º gratis"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icono">Icono</Label>
                <Input
                  id="icono"
                  value={formData.icono}
                  onChange={(e) => setFormData({ ...formData, icono: e.target.value })}
                  placeholder="stamp"
                />
                <p className="text-xs text-muted-foreground">
                  Nombre del icono de lucide-react
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-20"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#3B82F6"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Configuración de sellos */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Configuración de Sellos
            </h3>

            <div className="space-y-2">
              <Label htmlFor="sellos_requeridos">Sellos necesarios *</Label>
              <Input
                id="sellos_requeridos"
                type="number"
                min="1"
                value={formData.sellos_requeridos}
                onChange={(e) =>
                  setFormData({ ...formData, sellos_requeridos: parseInt(e.target.value) })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sellos_por_dia_max">Límite de sellos por día</Label>
                <Input
                  id="sellos_por_dia_max"
                  type="number"
                  min="1"
                  value={formData.sellos_por_dia_max}
                  onChange={(e) =>
                    setFormData({ ...formData, sellos_por_dia_max: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dias_validez_cupon">Validez del cupón (días)</Label>
                <Input
                  id="dias_validez_cupon"
                  type="number"
                  min="1"
                  value={formData.dias_validez_cupon}
                  onChange={(e) =>
                    setFormData({ ...formData, dias_validez_cupon: parseInt(e.target.value) })
                  }
                />
              </div>
            </div>
          </div>

          {/* Premio */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Premio</h3>

            <div className="space-y-2">
              <Label htmlFor="tipo_premio">Tipo de premio *</Label>
              <Select
                value={formData.tipo_premio}
                onValueChange={(value) => handleTipoPremioChange(value as TipoPremioSello)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TipoPremioSello).map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {obtenerTextoTipoPremio(tipo)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {renderPremioDetallesFields()}

            <div className="space-y-2">
              <Label htmlFor="instrucciones_canje">Instrucciones de canje</Label>
              <Textarea
                id="instrucciones_canje"
                value={formData.instrucciones_canje}
                onChange={(e) =>
                  setFormData({ ...formData, instrucciones_canje: e.target.value })
                }
                rows={2}
              />
            </div>
          </div>

          {/* Estado */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Estado</h3>

            <div className="flex items-center justify-between">
              <Label htmlFor="activo">Programa activo</Label>
              <Switch
                id="activo"
                checked={formData.activo}
                onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="visible_cliente">Visible para clientes</Label>
              <Switch
                id="visible_cliente"
                checked={formData.visible_cliente}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, visible_cliente: checked })
                }
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onClose(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : programa ? 'Actualizar' : 'Crear Programa'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
