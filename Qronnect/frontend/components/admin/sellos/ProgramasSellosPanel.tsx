'use client';

import { useState, useEffect } from 'react';
import { ProgramaSellos } from '@/types/sellos';
import { obtenerProgramasSellos, eliminarProgramaSello } from '@/lib/api/sellos';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, BarChart3, Eye, EyeOff, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { ProgramaSelloFormModal } from './ProgramaSelloFormModal';
import { PlantillasSelectorModal } from './PlantillasSelectorModal';
import { formatearPremio, obtenerTextoTipoPremio } from '@/types/sellos';
import { CrearProgramaSellosRequest } from '@/types/sellos';

interface ProgramasSellosPanelProps {
  token: string;
  domain: string;
}

export function ProgramasSellosPanel({ token, domain }: ProgramasSellosPanelProps) {
  const [programas, setProgramas] = useState<ProgramaSellos[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalPlantillasAbierto, setModalPlantillasAbierto] = useState(false);
  const [programaEditar, setProgramaEditar] = useState<ProgramaSellos | null>(null);
  const [programaDesdePlantilla, setProgramaDesdePlantilla] = useState<CrearProgramaSellosRequest | null>(null);
  const [mostrarInactivos, setMostrarInactivos] = useState(false);

  useEffect(() => {
    cargarProgramas();
  }, []);

  const cargarProgramas = async () => {
    try {
      setLoading(true);
      const data = await obtenerProgramasSellos(token, domain); // Trae todos (activos e inactivos)
      setProgramas(data);
    } catch (error) {
      console.error('Error al cargar programas:', error);
      toast.error('Error al cargar programas de sellos');
    } finally {
      setLoading(false);
    }
  };

  const programasFiltrados = programas.filter(p => mostrarInactivos || p.activo);

  const handleCrear = () => {
    setProgramaEditar(null);
    setProgramaDesdePlantilla(null);
    setModalAbierto(true);
  };

  const handleEditar = (programa: ProgramaSellos) => {
    setProgramaEditar(programa);
    setProgramaDesdePlantilla(null);
    setModalAbierto(true);
  };

  const handleEliminar = async (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de desactivar el programa "${nombre}"?`)) {
      return;
    }

    try {
      await eliminarProgramaSello(id, token, domain);
      toast.success('Programa eliminado/desactivado correctamente');
      cargarProgramas();
    } catch (error) {
      console.error('Error al eliminar programa:', error);
      toast.error('Error al desactivar programa');
    }
  };

  const handleModalClose = (actualizado: boolean) => {
    setModalAbierto(false);
    setProgramaEditar(null);
    setProgramaDesdePlantilla(null);
    if (actualizado) {
      cargarProgramas();
    }
  };

  const handleAbrirPlantillas = () => {
    setModalPlantillasAbierto(true);
  };

  const handleSeleccionarPlantilla = (programa: CrearProgramaSellosRequest) => {
    setProgramaDesdePlantilla(programa);
    setProgramaEditar(null);
    setModalAbierto(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Programas de Sellos</h2>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Gestiona tus programas de fidelización por sellos
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handleAbrirPlantillas} className="w-full sm:w-auto">
            <Sparkles className="mr-2 h-4 w-4 text-yellow-500" />
            Ver Plantillas
          </Button>
          <Button
            variant="outline"
            onClick={() => setMostrarInactivos(!mostrarInactivos)}
            className="w-full sm:w-auto"
          >
            {mostrarInactivos ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Ocultar Inactivos
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Ver Inactivos
              </>
            )}
          </Button>
          <Button onClick={handleCrear} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Programa
          </Button>
        </div>
      </div>

      {/* Lista de programas */}
      {programas.length === 0 ? (
        <Card className="p-12 text-center dark:bg-slate-900 dark:border-slate-800">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-muted p-6">
              <Plus className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No hay programas de sellos</h3>
              <p className="text-muted-foreground mt-1">
                Crea tu primer programa de fidelización por sellos
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleAbrirPlantillas}>
                <Sparkles className="mr-2 h-4 w-4 text-yellow-500" />
                Usar Plantilla
              </Button>
              <Button onClick={handleCrear}>
                <Plus className="mr-2 h-4 w-4" />
                Crear Programa
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {programasFiltrados.map((programa) => (
            <Card key={programa.id} className="p-6 dark:bg-slate-900 dark:border-slate-800">
              {/* Header con color */}
              <div
                className="h-2 -mx-6 -mt-6 rounded-t-lg mb-4"
                style={{ backgroundColor: programa.color || '#3B82F6' }}
              />

              {/* Badges de estado */}
              <div className="flex gap-2 mb-4">
                <Badge variant={programa.activo ? 'default' : 'secondary'}>
                  {programa.activo ? 'Activo' : 'Inactivo'}
                </Badge>
                <Badge variant="outline">
                  {programa.visible_cliente ? (
                    <>
                      <Eye className="mr-1 h-3 w-3" />
                      Visible
                    </>
                  ) : (
                    <>
                      <EyeOff className="mr-1 h-3 w-3" />
                      Oculto
                    </>
                  )}
                </Badge>
              </div>

              {/* Información principal */}
              <h3 className="text-xl font-bold mb-2">{programa.nombre}</h3>
              {programa.descripcion && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {programa.descripcion}
                </p>
              )}

              {/* Detalles del programa */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Sellos necesarios:</span>
                  <span className="font-semibold">{programa.sellos_requeridos}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tipo de premio:</span>
                  <span className="font-semibold">
                    {obtenerTextoTipoPremio(programa.tipo_premio)}
                  </span>
                </div>

                <div className="flex items-start justify-between text-sm">
                  <span className="text-muted-foreground">Premio:</span>
                  <span className="font-semibold text-right max-w-[60%]">
                    {formatearPremio(programa.tipo_premio, programa.premio_detalles)}
                  </span>
                </div>

                {programa.sellos_por_dia_max && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Límite diario:</span>
                    <span className="font-semibold">{programa.sellos_por_dia_max} sello(s)</span>
                  </div>
                )}

                {programa.dias_validez_cupon && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Validez cupón:</span>
                    <span className="font-semibold">{programa.dias_validez_cupon} días</span>
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEditar(programa)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEliminar(programa.id, programa.nombre)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de crear/editar */}
      {modalAbierto && (
        <ProgramaSelloFormModal
          programa={programaEditar}
          programaDesdePlantilla={programaDesdePlantilla}
          token={token}
          domain={domain}
          onClose={handleModalClose}
        />
      )}

      {/* Modal de plantillas */}
      <PlantillasSelectorModal
        open={modalPlantillasAbierto}
        onOpenChange={setModalPlantillasAbierto}
        onSeleccionarPlantilla={handleSeleccionarPlantilla}
      />
    </div>
  );
}
