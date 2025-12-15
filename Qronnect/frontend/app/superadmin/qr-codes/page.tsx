'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { QrCode, Plus, Download, RefreshCw, Search, BarChart, Package, ArrowLeft, CheckCircle, FileDown, Settings2, Image as ImageIcon, Palette, Mail, Send } from 'lucide-react';
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
  enviarPdfPorEmail,
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

  // Modals
  const [modalGenerar, setModalGenerar] = useState(false);
  const [modalDownload, setModalDownload] = useState(false);

  // Loading states
  const [generando, setGenerando] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Selection
  const [selectedQrs, setSelectedQrs] = useState<Set<string>>(new Set());

  // Download Options
  const [pdfTitle, setPdfTitle] = useState('QR Codes Pool');
  const [qrStyle, setQrStyle] = useState<'standard' | 'brand' | 'custom'>('standard');
  const [customColor, setCustomColor] = useState('#000000');

  const [includeLogo, setIncludeLogo] = useState(false);

  // Email Options
  const [sendByEmail, setSendByEmail] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');

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

      const estadoParam = filtroEstado === 'todos' ? undefined : filtroEstado;
      const loteParam = filtroLote === 'todos' ? undefined : filtroLote;

      const [qrs, stats] = await Promise.all([
        listarQrCodes(token, estadoParam, loteParam),
        obtenerEstadisticas(token),
      ]);

      setQrCodes(qrs);
      setEstadisticas(stats);
      setSelectedQrs(new Set());
      setPdfTitle(`Lote ${new Date().toLocaleDateString()}`);
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
    // setModalDownload(false); // Mantener modal abierto si envía email, pero para feedback inmediato mejor cerrar o mostrar estado

    try {
      const doc = new jsPDF();
      const qrsToDownload = qrCodesFiltrados.filter(q => selectedQrs.has(q.hash));
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Load Template
      const templateImg = new Image();
      templateImg.crossOrigin = "anonymous";
      templateImg.src = '/templates/qr-unete-al-club.jpg';
      await new Promise((resolve, reject) => {
        templateImg.onload = resolve;
        templateImg.onerror = reject;
      });

      // Load Logo if needed
      let logoImg: HTMLImageElement | null = null;
      if (includeLogo) {
        logoImg = new Image();
        logoImg.crossOrigin = "anonymous";
        logoImg.src = '/LogoQronnect.png'; // Using the logo found in public
        await new Promise((resolve, reject) => {
          if (!logoImg) return;
          logoImg.onload = resolve;
          logoImg.onerror = () => { console.warn('No se pudo cargar el logo'); resolve(null); };
        });
      }

      // Config - 2x2 Layout (4 stickers per page)
      const margin = 0; // Full bleed
      const titleSpace = 0; // No title

      const availableWidth = pageWidth - (2 * margin);
      const availableHeight = pageHeight - (2 * margin) - titleSpace;

      const cols = 2;
      const rows = 2;

      const cellWidth = availableWidth / cols;
      const cellHeight = availableHeight / rows;

      const templateAspect = templateImg.height / templateImg.width;
      const cellAspect = cellHeight / cellWidth;

      let stickerWidth, stickerHeight;

      // Calculate dimensions to fit/fill cell maintaining aspect ratio
      // For stickers, we usually want to FILL the cell if it's the right shape, or FIT if not.
      // Assuming we want to maximize size within the cell:
      if (templateAspect > cellAspect) {
        stickerHeight = cellHeight;
        stickerWidth = stickerHeight / templateAspect;
      } else {
        stickerWidth = cellWidth;
        stickerHeight = stickerWidth * templateAspect;
      }

      const offsetX = (cellWidth - stickerWidth) / 2;
      const offsetY = (cellHeight - stickerHeight) / 2;

      const startX = margin;
      const startY = margin + titleSpace;

      let col = 0;
      let row = 0;

      // REMOVED Title
      // doc.setFontSize(16);
      // doc.text(pdfTitle, pageWidth / 2, 12, { align: 'center' });

      const canvas = document.createElement('canvas');
      canvas.width = templateImg.width;
      canvas.height = templateImg.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No canvas context');

      for (let i = 0; i < qrsToDownload.length; i++) {
        const qr = qrsToDownload[i];

        if (i > 0 && i % (cols * rows) === 0) {
          doc.addPage();
          // Title removed
          // doc.setFontSize(10);
          // doc.text(pdfTitle, pageWidth / 2, 10, { align: 'center' });
          col = 0;
          row = 0;
        }

        // Draw Template
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear
        ctx.drawImage(templateImg, 0, 0);

        // QR Params
        let qrColor = '0-0-0'; // default standard
        if (qrStyle === 'brand') qrColor = '7c3aed';
        if (qrStyle === 'custom') qrColor = customColor.replace('#', ''); // strip hex #

        // Use ECC High (H) if logo is included
        const ecc = includeLogo ? 'H' : 'M';

        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&format=png&color=${qrColor}&ecc=${ecc}&data=${encodeURIComponent(qr.qr_url)}`;
        const qrResponse = await fetch(qrUrl);
        const qrBlob = await qrResponse.blob();
        const qrBitmap = await createImageBitmap(qrBlob);

        const qrInfoSize = canvas.width * 0.50;
        const qrX = (canvas.width - qrInfoSize) / 2;
        const qrY = (canvas.height * 0.515) - (qrInfoSize / 2);

        ctx.drawImage(qrBitmap, qrX, qrY, qrInfoSize, qrInfoSize);

        // Draw Center Logo
        if (includeLogo && logoImg) {
          const logoSize = qrInfoSize * 0.23;
          const logoX = qrX + (qrInfoSize - logoSize) / 2;
          const logoY = qrY + (qrInfoSize - logoSize) / 2;

          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          const padding = 5;
          ctx.roundRect(logoX - padding / 2, logoY - padding / 2, logoSize + padding, logoSize + padding, 10);
          ctx.fill();

          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
        }

        const designBase64 = canvas.toDataURL('image/jpeg', 0.9);

        // Position Logic: Align to nearest corner
        // Col 0 (Left) -> x = 0
        // Col 1 (Right) -> x = pageWidth - stickerWidth
        // Row 0 (Top) -> y = 0
        // Row 1 (Bottom) -> y = pageHeight - stickerHeight

        let x = 0;
        let y = 0;

        if (col === 0) {
          x = 0; // Left
        } else {
          x = pageWidth - stickerWidth; // Right
        }

        if (row === 0) {
          y = 0; // Top
        } else {
          y = pageHeight - stickerHeight; // Bottom
        }

        // Apply margins if they were non-zero (currently 0)
        // x += (col === 0 ? margin : -margin);
        // y += (row === 0 ? margin + titleSpace : -margin);
        // implicit since margin is 0

        doc.addImage(designBase64, 'JPEG', x, y, stickerWidth, stickerHeight);

        doc.setFontSize(8);
        doc.setTextColor(100);
        // Adjust text position relative to new x,y
        doc.text(qr.hash, x + (stickerWidth / 2), y + stickerHeight - 2, { align: 'center' }); // -2 to fit inside bottom edge if tight

        col++;
        if (col >= cols) {
          col = 0;
          row++;
        }
      }

      // ACTION: Email or Download
      if (sendByEmail && emailAddress) {
        const pdfBlob = doc.output('blob');
        const token = localStorage.getItem('superadmin_token');
        if (token) {
          await enviarPdfPorEmail(token, {
            file: pdfBlob,
            email: emailAddress,
            subject: `Qronnect - ${pdfTitle}`
          });

          toast({
            title: 'Email Enviado',
            description: `PDF enviado correctamente a ${emailAddress}`
          });

          // Mark as downloaded
          await marcarLoteComoDescargado(token, Array.from(selectedQrs));
          setQrCodes(prev => prev.map(q => selectedQrs.has(q.hash) ? { ...q, descargado: true } : q));
          setSelectedQrs(new Set());
          setModalDownload(false);
        }
      } else {
        doc.save(`${pdfTitle.replace(/\s+/g, '-')}.pdf`);

        const token = localStorage.getItem('superadmin_token');
        if (token) {
          await marcarLoteComoDescargado(token, Array.from(selectedQrs));
          setQrCodes(prev => prev.map(q => selectedQrs.has(q.hash) ? { ...q, descargado: true } : q));
          setSelectedQrs(new Set());
          setModalDownload(false);
        }

        toast({
          title: 'PDF Generado',
          description: `${qrsToDownload.length} pegatinas generadas con éxito`,
        });
      }

    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Error al generar PDF',
        variant: 'destructive',
      });
    } finally {
      setDownloadingPdf(false);
    }
  };

  const downloadDesignedQr = async (qrData: string, hash: string) => {
    try {
      const token = localStorage.getItem('superadmin_token');
      if (token) {
        await marcarQrComoDescargado(token, hash);
        setQrCodes(prev => prev.map(q => q.hash === hash ? { ...q, descargado: true } : q));
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const templateImg = new Image();
      templateImg.crossOrigin = "anonymous";
      templateImg.src = '/templates/qr-unete-al-club.jpg';
      await new Promise((resolve) => { templateImg.onload = resolve; });

      canvas.width = templateImg.width;
      canvas.height = templateImg.height;
      ctx.drawImage(templateImg, 0, 0);

      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&format=png&data=${encodeURIComponent(qrData)}`;
      const qrResponse = await fetch(qrUrl);
      const qrBlob = await qrResponse.blob();
      const qrImg = new Image();
      qrImg.src = URL.createObjectURL(qrBlob);
      await new Promise((resolve) => { qrImg.onload = resolve; });

      const qrSize = canvas.width * 0.50;
      const qrX = (canvas.width - qrSize) / 2;
      const qrY = (canvas.height * 0.515) - (qrSize / 2);

      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `design-qr-${hash}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({ title: 'Diseño Generado' });
    } catch (e) { console.error(e); }
  }

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
            <Dialog open={modalDownload} onOpenChange={setModalDownload}>
              <DialogTrigger asChild>
                <Button
                  variant="default"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Descargar PDF ({selectedQrs.size})
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Opciones de Descarga</DialogTitle>
                  <DialogDescription>
                    Configura el apariencia de tu archivo PDF
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">Título</Label>
                    <Input
                      id="title"
                      value={pdfTitle}
                      onChange={(e) => setPdfTitle(e.target.value)}
                      className="col-span-3"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2">Estilo</Label>
                    <RadioGroup
                      value={qrStyle}
                      onValueChange={(v: 'standard' | 'brand' | 'custom') => setQrStyle(v)}
                      className="col-span-3 flex flex-col gap-2"
                    >
                      <div className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-muted/50">
                        <RadioGroupItem value="standard" id="Standard" />
                        <div className="flex-1">
                          <Label htmlFor="Standard" className="font-semibold cursor-pointer">Estándar</Label>
                          <p className="text-xs text-muted-foreground">Negro clásico</p>
                        </div>
                        <QrCode className="h-6 w-6 text-black" />
                      </div>
                      <div className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-muted/50">
                        <RadioGroupItem value="brand" id="Brand" />
                        <div className="flex-1">
                          <Label htmlFor="Brand" className="font-semibold cursor-pointer">Marca</Label>
                          <p className="text-xs text-muted-foreground">Violeta corporativo</p>
                        </div>
                        <QrCode className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-muted/50">
                        <RadioGroupItem value="custom" id="Custom" />
                        <div className="flex-1">
                          <Label htmlFor="Custom" className="font-semibold cursor-pointer">Personalizado</Label>
                          <p className="text-xs text-muted-foreground">Elige tu color</p>
                        </div>
                        {qrStyle === 'custom' && (
                          <div className="relative">
                            <Input
                              type="color"
                              value={customColor}
                              onChange={(e) => setCustomColor(e.target.value)}
                              className="h-8 w-12 p-0 border-none cursor-pointer"
                            />
                          </div>
                        )}
                        {qrStyle !== 'custom' && <Palette className="h-6 w-6 text-gray-400" />}
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Logo</Label>
                    <div className="col-span-3 flex items-center space-x-2">
                      <Switch id="logo-mode" checked={includeLogo} onCheckedChange={setIncludeLogo} />
                      <Label htmlFor="logo-mode" className="font-normal">
                        Incrustar Logo
                        {includeLogo && <Badge variant="outline" className="ml-2 text-xs">ECC High</Badge>}
                      </Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4 border-t pt-4">
                    <Label className="text-right">Email</Label>
                    <div className="col-span-3 space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch id="email-mode" checked={sendByEmail} onCheckedChange={setSendByEmail} />
                        <Label htmlFor="email-mode" className="font-normal">Enviar por correo</Label>
                        {sendByEmail && <Mail className="h-4 w-4 text-muted-foreground ml-auto" />}
                      </div>
                      {sendByEmail && (
                        <Input
                          placeholder="direccion@email.com"
                          type="email"
                          value={emailAddress}
                          onChange={(e) => setEmailAddress(e.target.value)}
                        />
                      )}
                    </div>
                  </div>

                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setModalDownload(false)}>Cancelar</Button>
                  <Button onClick={handleDownloadBulkPdf} disabled={downloadingPdf}>
                    {downloadingPdf ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Generando...
                      </>
                    ) : (
                      <>
                        {sendByEmail ? <Send className="h-4 w-4 mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                        {sendByEmail ? 'Enviar y Marcar' : 'Descargar'}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
