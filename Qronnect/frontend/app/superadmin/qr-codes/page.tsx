'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { QrCode, Plus, Download, RefreshCw, Search, BarChart, Package, ArrowLeft } from 'lucide-react';
import { QrCode as QrCodeType, QrPoolEstadisticas, getEstadoColor, getEstadoLabel } from '@/types/qr-codes';
import { useRouter } from 'next/navigation';
import {
  generarQrCodes,
  listarQrCodes,
  obtenerEstadisticas,
  exportarCsv,
  descargarCsv,
} from '@/lib/api/qr-codes';

export default function QrCodesPoolPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState<QrCodeType[]>([]);
  const [estadisticas, setEstadisticas] = useState<QrPoolEstadisticas | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroLote, setFiltroLote] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [modalGenerar, setModalGenerar] = useState(false);
  const [generando, setGenerando] = useState(false);

  // Form para generar QR codes
  const [cantidad, setCantidad] = useState(100);
  const [lote, setLote] = useState(`LOTE-${new Date().toISOString().split('T')[0]}`);

  useEffect(() => {
    cargarDatos();
  }, [filtroEstado, filtroLote]);

  const cargarDatos = async () => {
    try {
      const token = localStorage.getItem('superadmin_token');
      if (!token) return;

      // Convertir 'todos' a undefined para el API
      const estadoParam = filtroEstado === 'todos' ? undefined : filtroEstado;
      const loteParam = filtroLote === 'todos' ? undefined : filtroLote;

      const [qrs, stats] = await Promise.all([
        listarQrCodes(token, estadoParam, loteParam),
        obtenerEstadisticas(token),
      ]);

      setQrCodes(qrs);
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los QR codes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerar = async () => {
    setGenerando(true);
    try {
      const token = localStorage.getItem('superadmin_token');
      if (!token) return;

      const result = await generarQrCodes(token, { cantidad, lote });

      toast({
        title: '¡QR Codes Generados!',
        description: `Se generaron ${result.cantidad_generada} QR codes en el lote ${result.lote}`,
      });

      setModalGenerar(false);
      await cargarDatos();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudieron generar los QR codes',
        variant: 'destructive',
      });
    } finally {
      setGenerando(false);
    }
  };

  const handleExportar = async () => {
    if (!filtroLote || filtroLote === 'todos') {
      toast({
        title: 'Selecciona un lote',
        description: 'Debes filtrar por un lote específico para exportar',
        variant: 'destructive',
      });
      return;
    }

    try {
      const token = localStorage.getItem('superadmin_token');
      if (!token) return;

      const blob = await exportarCsv(token, filtroLote);
      descargarCsv(blob, `qr-codes-${filtroLote}.csv`);

      toast({
        title: 'CSV Exportado',
        description: `Descargado: qr-codes-${filtroLote}.csv`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo exportar el CSV',
        variant: 'destructive',
      });
    }
  };

  const qrCodesFiltrados = qrCodes.filter((qr) => {
    if (!busqueda) return true;
    const search = busqueda.toLowerCase();
    return (
      qr.hash.toLowerCase().includes(search) ||
      qr.qr_url.toLowerCase().includes(search) ||
      qr.tienda?.nombre?.toLowerCase().includes(search)
    );
  });

  const downloadQr = async (qrData: string, hash: string) => {
    try {
      const imageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrData)}`;
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-${hash}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'QR Descargado',
        description: `QR ${hash} guardado correctamente`
      });
    } catch (error) {
      console.error('Error downloading QR:', error);
      toast({
        title: 'Error',
        description: 'No se pudo descargar la imagen del QR',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/superadmin')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <QrCode className="h-8 w-8" />
              Pool de QR Codes
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestión de QR codes genéricos pre-impresos
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => cargarDatos()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Dialog open={modalGenerar} onOpenChange={setModalGenerar}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generar QR Codes
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generar Lote de QR Codes</DialogTitle>
                <DialogDescription>
                  Genera múltiples QR codes únicos para imprimir en pegatinas
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="cantidad">Cantidad</Label>
                  <Input
                    id="cantidad"
                    type="number"
                    min="1"
                    max="10000"
                    value={cantidad}
                    onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">Máximo: 10,000 por lote</p>
                </div>
                <div>
                  <Label htmlFor="lote">Nombre del Lote</Label>
                  <Input
                    id="lote"
                    value={lote}
                    onChange={(e) => setLote(e.target.value)}
                    placeholder="LOTE-2024-001"
                  />
                </div>
                <Button className="w-full" onClick={handleGenerar} disabled={generando}>
                  {generando ? 'Generando...' : `Generar ${cantidad} QR Codes`}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{estadisticas.disponibles}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Asignados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{estadisticas.asignados}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Desactivados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{estadisticas.desactivados}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Escaneos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.total_escaneos}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Hash, URL, tienda..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Estado</Label>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="disponible">Disponible</SelectItem>
                  <SelectItem value="asignado">Asignado</SelectItem>
                  <SelectItem value="desactivado">Desactivado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Lote</Label>
              <Select value={filtroLote} onValueChange={setFiltroLote}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {estadisticas?.lotes.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full" onClick={handleExportar} disabled={!filtroLote || filtroLote === 'todos'}>
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de QR Codes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            QR Codes ({qrCodesFiltrados.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {qrCodesFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay QR codes que mostrar</p>
              <Button className="mt-4" onClick={() => setModalGenerar(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Generar Primer Lote
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Hash</th>
                    <th className="text-left p-2">URL</th>
                    <th className="text-left p-2">Estado</th>
                    <th className="text-left p-2">Tienda</th>
                    <th className="text-left p-2">Lote</th>
                    <th className="text-left p-2">Escaneos</th>
                    <th className="text-left p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {qrCodesFiltrados.slice(0, 50).map((qr) => (
                    <tr key={qr.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {qr.hash}
                        </code>
                      </td>
                      <td className="p-2">
                        <a
                          href={qr.qr_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {qr.qr_url}
                        </a>
                      </td>
                      <td className="p-2">
                        <Badge style={{ backgroundColor: getEstadoColor(qr.estado) }}>
                          {getEstadoLabel(qr.estado)}
                        </Badge>
                      </td>
                      <td className="p-2 text-sm">
                        {qr.tienda ? qr.tienda.nombre : '-'}
                      </td>
                      <td className="p-2 text-sm">{qr.lote || '-'}</td>
                      <td className="p-2 text-sm">{qr.total_escaneos}</td>
                      <td className="p-2 flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadQr(qr.qr_url, qr.hash)}
                          title="Descargar QR"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <BarChart className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {qrCodesFiltrados.length > 50 && (
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Mostrando 50 de {qrCodesFiltrados.length} resultados
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
