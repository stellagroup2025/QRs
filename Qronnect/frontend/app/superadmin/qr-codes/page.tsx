'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { QrCode, Plus, Download, RefreshCw, Search, BarChart, Package, ArrowLeft, CheckCircle, FileDown } from 'lucide-react';
import { QrCode as QrCodeType, QrPoolEstadisticas, getEstadoColor, getEstadoLabel } from '@/types/qr-codes';
import { useRouter } from 'next/navigation';
import {
  generarQrCodes,
  listarQrCodes,
  obtenerEstadisticas,
  exportarCsv,
  descargarCsv,
  marcarQrComoDescargado,
  marcarLoteComoDescargado,
} from '@/lib/api/qr-codes';
import jsPDF from 'jspdf';

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
  const [selectedQrs, setSelectedQrs] = useState<Set<string>>(new Set());
  const [downloadingPdf, setDownloadingPdf] = useState(false);

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
      setSelectedQrs(new Set()); // Reset selection on reload
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allHashes = qrCodesFiltrados.map(q => q.hash);
      setSelectedQrs(new Set(allHashes));
    } else {
      setSelectedQrs(new Set());
    }
  };

  const handleSelectRow = (hash: string, checked: boolean) => {
    const newSelected = new Set(selectedQrs);
    if (checked) {
      newSelected.add(hash);
    } else {
      newSelected.delete(hash);
    }
    setSelectedQrs(newSelected);
  };

  const downloadQr = async (qrData: string, hash: string) => {
    try {
      // 1. Marcar como descargado en backend
      const token = localStorage.getItem('superadmin_token');
      if (token) {
        await marcarQrComoDescargado(token, hash);
        // Actualizar estado local
        setQrCodes(prev => prev.map(q => q.hash === hash ? { ...q, descargado: true } : q));
      }

      // 2. Descargar imagen
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
        description: `QR ${hash} guardado y marcado como descargado`
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

  const handleDownloadBulkPdf = async () => {
    if (selectedQrs.size === 0) return;
    setDownloadingPdf(true);

    try {
      const doc = new jsPDF();
      const qrsToDownload = qrCodesFiltrados.filter(q => selectedQrs.has(q.hash));
      const pageHeight = doc.internal.pageSize.height;
      const pageWidth = doc.internal.pageSize.width;

      // Configuración de Grilla (A4)
      // 3 columnas x 5 filas = 15 pegatinas por página
      const cols = 3;
      const rows = 5;
      const marginX = 15;
      const marginY = 15;
      const qrSize = 50; // 50x50 mm
      const gapX = (pageWidth - (2 * marginX) - (cols * qrSize)) / (cols - 1);
      const gapY = (pageHeight - (2 * marginY) - (rows * qrSize)) / (rows - 1);

      let col = 0;
      let row = 0;

      for (let i = 0; i < qrsToDownload.length; i++) {
        const qr = qrsToDownload[i];

        // Nueva página si se llena
        if (i > 0 && i % (cols * rows) === 0) {
          doc.addPage();
          col = 0;
          row = 0;
        }

        // Obtener imagen del QR
        const imageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qr.qr_url)}`;
        const response = await fetch(imageUrl);
        const blob = await response.blob();

        // Convertir a Data URL
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });

        // Calcular posición
        const x = marginX + (col * (qrSize + gapX));
        const y = marginY + (row * (qrSize + gapY));

        // Dibujar QR
        doc.addImage(base64, 'PNG', x, y, qrSize, qrSize);

        // Añadir Hash debajo
        doc.setFontSize(10);
        doc.text(qr.hash, x + (qrSize / 2), y + qrSize + 5, { align: 'center' });

        // Avanzar posición
        col++;
        if (col >= cols) {
          col = 0;
          row++;
        }
      }

      doc.save(`qrs-bulk-${new Date().toISOString().split('T')[0]}.pdf`);

      // Marcar como descargados en lote
      const token = localStorage.getItem('superadmin_token');
      if (token) {
        await marcarLoteComoDescargado(token, Array.from(selectedQrs));
        // Actualizar estado local
        setQrCodes(prev => prev.map(q => selectedQrs.has(q.hash) ? { ...q, descargado: true } : q));
        setSelectedQrs(new Set()); // Limpiar selección
      }

      toast({
        title: 'PDF Generado',
        description: `${qrsToDownload.length} QRs descargados y marcados correctamente`,
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Falló la generación del PDF',
        variant: 'destructive',
      });
    } finally {
      setDownloadingPdf(false);
    }
  };

  const downloadDesignedQr = async (qrData: string, hash: string) => {
    try {
      // 1. Marcar como descargado en backend
      const token = localStorage.getItem('superadmin_token');
      if (token) {
        await marcarQrComoDescargado(token, hash);
        // Actualizar estado local
        setQrCodes(prev => prev.map(q => q.hash === hash ? { ...q, descargado: true } : q));
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No canvas context');

      const templateImg = new Image();
      templateImg.crossOrigin = "anonymous";
      templateImg.src = '/templates/qr-unete-al-club.jpg';

      await new Promise((resolve, reject) => {
        templateImg.onload = resolve;
        templateImg.onerror = reject;
      });

      canvas.width = templateImg.width;
      canvas.height = templateImg.height;

      ctx.drawImage(templateImg, 0, 0);

      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&format=png&data=${encodeURIComponent(qrData)}`;
      const qrResponse = await fetch(qrUrl);
      const qrBlob = await qrResponse.blob();
      const qrObjectUrl = URL.createObjectURL(qrBlob);

      const qrImg = new Image();
      qrImg.src = qrObjectUrl;

      await new Promise((resolve, reject) => {
        qrImg.onload = resolve;
        qrImg.onerror = reject;
      });

      const qrSize = canvas.width * 0.50;
      const qrX = (canvas.width - qrSize) / 2;
      const qrY = (canvas.height * 0.515) - (qrSize / 2);

      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      URL.revokeObjectURL(qrObjectUrl);

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `design-qr-${hash}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Diseño Generado',
        description: `Imagen guardada y marcada verificado`
      });

    } catch (error) {
      console.error('Error generating design:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar el diseño',
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
          {selectedQrs.size > 0 && (
            <Button
              variant="default"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleDownloadBulkPdf}
              disabled={downloadingPdf}
            >
              {downloadingPdf ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Esto tarda un poco...
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4 mr-2" />
                  Descargar PDF ({selectedQrs.size})
                </>
              )}
            </Button>
          )}
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
                    <th className="text-left p-2">
                      <Checkbox
                        checked={selectedQrs.size === qrCodesFiltrados.length && qrCodesFiltrados.length > 0}
                        onCheckedChange={handleSelectAll}
                        aria-label="Seleccionar todos"
                      />
                    </th>
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
                        <Checkbox
                          checked={selectedQrs.has(qr.hash)}
                          onCheckedChange={(checked) => handleSelectRow(qr.hash, !!checked)}
                        />
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                            {qr.hash}
                          </code>
                          {(qr as any).descargado && (
                            <div title="Ya descargado">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </div>
                          )}
                        </div>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadDesignedQr(qr.qr_url, qr.hash)}
                          title="Descargar Diseño"
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                        >
                          <Package className="h-4 w-4" />
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
