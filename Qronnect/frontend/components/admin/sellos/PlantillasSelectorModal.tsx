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
  plantillaAFormulario,
} from '@/lib/plantillas-sellos';

interface PlantillasSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSeleccionarPlantilla: (programa: any) => void;
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
    const programaFormulario = plantillaAFormulario(plantilla);
    onSeleccionarPlantilla(programaFormulario);
    onOpenChange(false);
  };

  const obtenerBadgeTipoPremio = (tipo: string) => {
    switch (tipo) {
      case 'producto':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Producto Gratis</Badge>;
      case 'descuento_porcentaje':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Descuento %</Badge>;
      case 'descuento_fijo':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Descuento €</Badge>;
      case 'puntos':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Puntos Extra</Badge>;
      case 'texto':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Otro</Badge>;
      default:
        return <Badge variant="outline">Otro</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[95vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
            Plantillas de Programas de Sellos
          </DialogTitle>
          <DialogDescription className="text-sm">
            Selecciona una plantilla predefinida para tu sector y personalizala según tus necesidades
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-x-hidden">
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
            <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              <TabsList className="inline-flex w-auto min-w-full">
                {sectores.map((sector) => (
                  <TabsTrigger key={sector} value={sector} className="whitespace-nowrap text-xs sm:text-sm">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {plantillasFiltradas.map((plantilla) => (
                    <Card
                      key={plantilla.id}
                      className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                      onClick={() => handleSeleccionarPlantilla(plantilla)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-2xl sm:text-3xl flex-shrink-0">{plantilla.icono_emoji}</span>
                            <div className="min-w-0 flex-1">
                              <CardTitle className="text-sm sm:text-base truncate">{plantilla.nombre}</CardTitle>
                              <p className="text-xs text-muted-foreground mt-1 truncate">{plantilla.sector}</p>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <CardDescription className="text-xs sm:text-sm line-clamp-2">{plantilla.descripcion}</CardDescription>

                        <div className="flex flex-wrap gap-2 items-center">
                          <Badge variant="secondary" className="font-mono text-xs">
                            {plantilla.sellos_requeridos} sellos
                          </Badge>
                          {obtenerBadgeTipoPremio(plantilla.tipo_premio)}
                        </div>

                        <div className="pt-2 border-t">
                          <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 line-clamp-2">
                            🎁 {plantilla.premio_detalles.nombre || plantilla.premio_detalles.descripcion || 'Premio incluido'}
                          </p>
                          {plantilla.tipo_premio === 'descuento_porcentaje' && plantilla.premio_detalles.porcentaje && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {plantilla.premio_detalles.porcentaje}% de descuento
                            </p>
                          )}
                          {plantilla.tipo_premio === 'puntos' && plantilla.premio_detalles.puntos && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {plantilla.premio_detalles.puntos} puntos
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
