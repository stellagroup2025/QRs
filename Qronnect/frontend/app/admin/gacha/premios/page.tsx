'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Plus, Edit, Trash2, Package, TrendingUp } from 'lucide-react';
import { AdminNav } from '@/components/AdminNav';
import { obtenerPremios, eliminarPremio, insertarPremiosPredefinidos } from '@/lib/api/gacha';
import { PremioGacha, getRarezaColor, getRarezaLabel, formatearPremio, getTipoLabel } from '@/types/gacha';
import { FormularioPremioGacha } from '@/components/admin/gacha/FormularioPremioGacha';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function GestionPremiosPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [premios, setPremios] = useState<PremioGacha[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [premioEditar, setPremioEditar] = useState<PremioGacha | undefined>();
  const [premioEliminar, setPremioEliminar] = useState<PremioGacha | null>(null);

  useEffect(() => {
    cargarPremios();
  }, []);

  const cargarPremios = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const domain = window.location.hostname.split('.')[0];
      const tenant = domain === 'localhost' ? 'demo-omar-77' : domain;

      if (!token) return;

      const data = await obtenerPremios(token, tenant);
      setPremios(data);
    } catch (error) {
      console.error('Error cargando premios:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los premios',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCrear = () => {
    setPremioEditar(undefined);
    setModalOpen(true);
  };

  const handleEditar = (premio: PremioGacha) => {
    setPremioEditar(premio);
    setModalOpen(true);
  };

  const handleEliminar = async () => {
    if (!premioEliminar) return;

    try {
      const token = localStorage.getItem('admin_token');
      const domain = window.location.hostname.split('.')[0];
      const tenant = domain === 'localhost' ? 'demo-omar-77' : domain;

      if (!token) return;

      await eliminarPremio(token, tenant, premioEliminar.id);

      toast({
        title: 'Premio eliminado',
        description: 'El premio se ha desactivado correctamente',
      });

      setPremioEliminar(null);
      await cargarPremios();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el premio',
        variant: 'destructive',
      });
    }
  };

  const handleInsertarPredefinidos = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const domain = window.location.hostname.split('.')[0];
      const tenant = domain === 'localhost' ? 'demo-omar-77' : domain;

      if (!token) return;

      await insertarPremiosPredefinidos(token, tenant);

      toast({
        title: 'Premios insertados',
        description: 'Los premios predefinidos se han añadido correctamente',
      });

      await cargarPremios();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron insertar los premios predefinidos',
        variant: 'destructive',
      });
    }
  };

  const calcularProbabilidad = (premio: PremioGacha): number => {
    const totalPeso = premios
      .filter((p) => p.activo && (!p.stock_limitado || (p.stock_actual && p.stock_actual > 0)))
      .reduce((sum, p) => sum + p.peso, 0);

    if (totalPeso === 0) return 0;
    return (premio.peso / totalPeso) * 100;
  };

  const premiosPorRareza = {
    legendario: premios.filter((p) => p.rareza === 'legendario'),
    epico: premios.filter((p) => p.rareza === 'epico'),
    raro: premios.filter((p) => p.rareza === 'raro'),
    comun: premios.filter((p) => p.rareza === 'comun'),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <div className="flex items-center justify-center h-screen">
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-8 w-8" />
              Gestión de Premios
            </h1>
            <p className="text-muted-foreground mt-1">
              Configura los premios disponibles y sus probabilidades
            </p>
          </div>
          <div className="flex gap-2">
            {premios.length === 0 && (
              <Button onClick={handleInsertarPredefinidos} size="lg" variant="outline">
                <Package className="h-4 w-4 mr-2" />
                Insertar Premios Predefinidos
              </Button>
            )}
            <Button onClick={handleCrear} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Premio
          </Button>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Premios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{premios.length}</div>
              <p className="text-xs text-muted-foreground">
                {premios.filter((p) => p.activo).length} activos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Legendarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {premiosPorRareza.legendario.length}
              </div>
              <p className="text-xs text-muted-foreground">Más raros</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Épicos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {premiosPorRareza.epico.length}
              </div>
              <p className="text-xs text-muted-foreground">Muy raros</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Con Stock Limitado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {premios.filter((p) => p.stock_limitado).length}
              </div>
              <p className="text-xs text-muted-foreground">Premios exclusivos</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Premios por Rareza */}
        {(['legendario', 'epico', 'raro', 'comun'] as const).map((rareza) => {
          const premiosRareza = premiosPorRareza[rareza];
          if (premiosRareza.length === 0) return null;

          return (
            <Card key={rareza}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getRarezaColor(rareza) }}
                    />
                    <CardTitle>{getRarezaLabel(rareza)}</CardTitle>
                  </div>
                  <Badge variant="secondary">{premiosRareza.length} premios</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {premiosRareza.map((premio) => (
                    <div
                      key={premio.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{premio.nombre}</h3>
                          {!premio.activo && <Badge variant="secondary">Inactivo</Badge>}
                          {premio.stock_limitado && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              Stock: {premio.stock_actual}
                            </Badge>
                          )}
                        </div>
                        {premio.descripcion && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {premio.descripcion}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="font-medium">
                            {formatearPremio(premio.tipo, premio.valor)}
                          </span>
                          <span className="text-muted-foreground">
                            {getTipoLabel(premio.tipo)}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <TrendingUp className="h-3 w-3" />
                            {calcularProbabilidad(premio).toFixed(2)}% probabilidad
                          </span>
                          <span className="text-muted-foreground">
                            Peso: {premio.peso}
                          </span>
                          <span className="text-muted-foreground">
                            Válido {premio.dias_validez} días
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditar(premio)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPremioEliminar(premio)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {premios.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay premios configurados</h3>
                <p className="text-muted-foreground mb-4">
                  Crea tu primer premio para comenzar
                </p>
                <Button onClick={handleCrear}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Premio
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal Formulario */}
      <FormularioPremioGacha
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        premio={premioEditar}
        onGuardado={cargarPremios}
      />

      {/* Dialog Confirmar Eliminación */}
      <AlertDialog open={!!premioEliminar} onOpenChange={() => setPremioEliminar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar este premio?</AlertDialogTitle>
            <AlertDialogDescription>
              El premio "{premioEliminar?.nombre}" será desactivado y no estará disponible para
              nuevas tiradas. Los premios ya ganados no se verán afectados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleEliminar}>Desactivar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
