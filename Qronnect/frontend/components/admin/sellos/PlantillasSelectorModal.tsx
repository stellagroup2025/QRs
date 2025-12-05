'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Sparkles } from 'lucide-react';
import {
  obtenerTodasLasPlantillas,
  obtenerSectores,
  obtenerPlantillasPorSector,
  PlantillaSello,
  aplicarPlantilla,
} from '@/lib/plantillas-sellos';
import { CrearProgramaSellosRequest } from '@/types/sellos';

interface PlantillasSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSeleccionarPlantilla: (programa: CrearProgramaSellosRequest) => void;
}

export function PlantillasSelectorModal({
  open,
  onOpenChange,
  onSeleccionarPlantilla,
}: PlantillasSelectorModalProps) {
  const [busqueda, setBusqueda] = useState('');
  const [sectorActivo, setSectorActivo] = useState<string>('Todos');

  const sectores = ['Todos', ...obtenerSectores()];
  const todasPlantillas = obtenerTodasLasPlantillas();

  // Filtrar plantillas
  const plantillasFiltradas = todasPlantillas.filter((plantilla) => {
    const coincideBusqueda =
      busqueda === '' ||
      plantilla.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      plantilla.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      plantilla.sector.toLowerCase().includes(busqueda.toLowerCase());

    const coincideSector = sectorActivo === 'Todos' || plantilla.sector === sectorActivo;

    return coincideBusqueda && coincideSector;
  });

  const handleSeleccionarPlantilla = (plantilla: PlantillaSello) => {
    const programaBase = aplicarPlantilla(plantilla);
    onSeleccionarPlantilla(programaBase);
    onOpenChange(false);
  };

  const obtenerBadgeTipoPremio = (tipo: string) => {
    switch (tipo) {
      case 'descuento':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Descuento</Badge>;
      case 'producto_gratis':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Producto Gratis</Badge>;
      case 'servicio_gratis':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Servicio Gratis</Badge>;
      case 'puntos':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Puntos Extra</Badge>;
      default:
        return <Badge variant="outline">Otro</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            Plantillas de Programas de Sellos
          </DialogTitle>
          <DialogDescription>
            Selecciona una plantilla predefinida para tu sector y personalizala según tus necesidades
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar plantillas..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs por sector */}
          <Tabs value={sectorActivo} onValueChange={setSectorActivo} className="w-full">
            <div className="overflow-x-auto pb-2">
              <TabsList className="inline-flex w-auto min-w-full">
                {sectores.map((sector) => (
                  <TabsTrigger key={sector} value={sector} className="whitespace-nowrap">
                    {sector}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value={sectorActivo} className="mt-4">
              {plantillasFiltradas.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No se encontraron plantillas que coincidan con tu búsqueda</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plantillasFiltradas.map((plantilla) => (
                    <Card
                      key={plantilla.id}
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleSeleccionarPlantilla(plantilla)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-3xl">{plantilla.icono}</span>
                            <div>
                              <CardTitle className="text-base">{plantilla.nombre}</CardTitle>
                              <p className="text-xs text-muted-foreground mt-1">{plantilla.sector}</p>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <CardDescription className="text-sm">{plantilla.descripcion}</CardDescription>

                        <div className="flex flex-wrap gap-2 items-center">
                          <Badge variant="secondary" className="font-mono">
                            {plantilla.config.num_sellos} sellos
                          </Badge>
                          {obtenerBadgeTipoPremio(plantilla.config.tipo_premio)}
                        </div>

                        <div className="pt-2 border-t">
                          <p className="text-sm font-medium text-slate-700">
                            🎁 {plantilla.config.descripcion_premio}
                          </p>
                          {plantilla.config.tipo_premio === 'descuento' && plantilla.config.valor_descuento && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {plantilla.config.valor_descuento}% de descuento
                            </p>
                          )}
                          {plantilla.config.tipo_premio === 'puntos' && plantilla.config.valor_puntos && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {plantilla.config.valor_puntos} puntos
                            </p>
                          )}
                        </div>

                        <Button className="w-full" size="sm">
                          Usar esta plantilla
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Estadísticas */}
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center">
              {plantillasFiltradas.length} plantillas disponibles
              {sectorActivo !== 'Todos' && ` en ${sectorActivo}`}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
