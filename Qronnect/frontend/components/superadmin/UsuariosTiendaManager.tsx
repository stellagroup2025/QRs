'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Users, Plus, Edit, Trash2, Shield, ShieldCheck, Smartphone, Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface UsuarioTienda {
  id: string
  nombre: string
  email: string
  telefono?: string
  rol: 'owner' | 'comercial'
  sms_2fa_activo: boolean
  sms_2fa_telefono?: string
  activo: boolean
  ultimo_acceso?: string
  creado_en: string
}

interface UsuariosTiendaManagerProps {
  tiendaId: string
}

export function UsuariosTiendaManager({ tiendaId }: UsuariosTiendaManagerProps) {
  const { toast } = useToast()
  const { confirm } = useConfirmDialog()
  const [usuarios, setUsuarios] = useState<UsuarioTienda[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<UsuarioTienda | null>(null)
  const [saving, setSaving] = useState(false)
  const [showPin, setShowPin] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    pin: '',
    rol: 'comercial' as 'owner' | 'comercial',
    sms_2fa_activo: false,
    sms_2fa_telefono: '',
    activo: true,
  })

  useEffect(() => {
    fetchUsuarios()
  }, [tiendaId])

  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem('superadmin_token')
      const response = await fetch(`${API_URL}/api/superadmin/tiendas/${tiendaId}/usuarios`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (!response.ok) throw new Error('Error al cargar usuarios')

      const data = await response.json()
      setUsuarios(data)
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los usuarios',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (usuario?: UsuarioTienda) => {
    if (usuario) {
      setEditingUsuario(usuario)
      setFormData({
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono || '',
        pin: '', // No mostrar PIN al editar
        rol: usuario.rol,
        sms_2fa_activo: usuario.sms_2fa_activo,
        sms_2fa_telefono: usuario.sms_2fa_telefono || '',
        activo: usuario.activo,
      })
    } else {
      setEditingUsuario(null)
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        pin: '',
        rol: 'comercial',
        sms_2fa_activo: false,
        sms_2fa_telefono: '',
        activo: true,
      })
    }
    setShowPin(false)
    setModalOpen(true)
  }

  const handleSave = async () => {
    // Validaciones
    if (!formData.nombre || !formData.email) {
      toast({
        title: 'Campos requeridos',
        description: 'Nombre y email son obligatorios',
        variant: 'destructive',
      })
      return
    }

    if (!editingUsuario && !formData.pin) {
      toast({
        title: 'PIN requerido',
        description: 'El PIN es obligatorio para nuevos usuarios',
        variant: 'destructive',
      })
      return
    }

    if (formData.pin && (formData.pin.length < 4 || formData.pin.length > 6)) {
      toast({
        title: 'PIN inválido',
        description: 'El PIN debe tener entre 4 y 6 dígitos',
        variant: 'destructive',
      })
      return
    }

    if (formData.sms_2fa_activo && !formData.sms_2fa_telefono) {
      toast({
        title: 'Teléfono requerido',
        description: 'Debe proporcionar un teléfono para activar 2FA',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem('superadmin_token')
      const url = editingUsuario
        ? `${API_URL}/api/superadmin/tiendas/${tiendaId}/usuarios/${editingUsuario.id}`
        : `${API_URL}/api/superadmin/tiendas/${tiendaId}/usuarios`

      const method = editingUsuario ? 'PUT' : 'POST'

      // No enviar PIN vacío en actualización
      const dataToSend = { ...formData }
      if (editingUsuario && !formData.pin) {
        delete (dataToSend as any).pin
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al guardar usuario')
      }

      toast({
        title: editingUsuario ? 'Usuario actualizado' : 'Usuario creado',
        description: editingUsuario
          ? 'Los datos del usuario se actualizaron correctamente'
          : 'El usuario se creó correctamente y ya puede iniciar sesión',
      })
      setModalOpen(false)
      fetchUsuarios()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar el usuario',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, nombre: string) => {
    const confirmed = await confirm({
      title: '¿Eliminar usuario?',
      description: `Se eliminará a "${nombre}" y no podrá acceder al panel.`,
      confirmText: 'Eliminar',
      variant: 'destructive',
    })
    if (!confirmed) return

    try {
      const token = localStorage.getItem('superadmin_token')
      const response = await fetch(`${API_URL}/api/superadmin/tiendas/${tiendaId}/usuarios/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (!response.ok) throw new Error('Error al eliminar')

      toast({
        title: 'Usuario eliminado',
        description: `El usuario "${nombre}" fue eliminado correctamente`,
      })
      fetchUsuarios()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el usuario',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Usuarios de la Tienda
            </CardTitle>
            <CardDescription>
              Gestiona los usuarios con acceso al panel de administración
            </CardDescription>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {usuarios.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No hay usuarios configurados</p>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Usuario
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead className="text-center">Rol</TableHead>
                <TableHead className="text-center">2FA</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold">{usuario.nombre}</p>
                      <p className="text-xs text-muted-foreground">{usuario.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {usuario.telefono || (
                      <span className="text-xs text-muted-foreground">Sin teléfono</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={usuario.rol === 'owner' ? 'default' : 'secondary'}
                      className="flex items-center justify-center w-fit mx-auto"
                    >
                      {usuario.rol === 'owner' ? (
                        <>
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          Owner
                        </>
                      ) : (
                        <>
                          <Shield className="h-3 w-3 mr-1" />
                          Comercial
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {usuario.sms_2fa_activo ? (
                      <div className="flex flex-col items-center">
                        <Badge variant="default" className="bg-green-600">
                          <Smartphone className="h-3 w-3 mr-1" />
                          Activo
                        </Badge>
                        <span className="text-xs text-muted-foreground mt-1">
                          {usuario.sms_2fa_telefono}
                        </span>
                      </div>
                    ) : (
                      <Badge variant="outline">Desactivado</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={usuario.activo ? 'default' : 'destructive'}>
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenModal(usuario)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(usuario.id, usuario.nombre)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Modal de Crear/Editar */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
            </DialogTitle>
            <DialogDescription>
              {editingUsuario
                ? 'Actualiza la información del usuario'
                : 'Crea un nuevo usuario para acceder al panel de administración'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Juan Pérez"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="juan@ejemplo.com"
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono (opcional)</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="+34612345678"
              />
            </div>

            {/* PIN */}
            <div className="space-y-2">
              <Label htmlFor="pin">
                PIN (4-6 dígitos) {!editingUsuario && '*'}
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="pin"
                  type={showPin ? 'text' : 'password'}
                  value={formData.pin}
                  onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  placeholder={editingUsuario ? 'Dejar vacío para no cambiar' : '1234'}
                  maxLength={6}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowPin(!showPin)}
                >
                  {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {editingUsuario
                  ? 'Solo completa si quieres cambiar el PIN actual'
                  : 'El usuario usará este PIN para iniciar sesión'}
              </p>
            </div>

            {/* Rol */}
            <div className="space-y-2">
              <Label htmlFor="rol">Rol *</Label>
              <Select
                value={formData.rol}
                onValueChange={(value: 'owner' | 'comercial') =>
                  setFormData({ ...formData, rol: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">
                    <div className="flex items-center">
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Owner (Admin completo)
                    </div>
                  </SelectItem>
                  <SelectItem value="comercial">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Comercial (Trabajador)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {formData.rol === 'owner'
                  ? 'Acceso total a todas las funciones'
                  : 'Acceso limitado para operaciones diarias'}
              </p>
            </div>

            {/* 2FA */}
            <div className="space-y-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sms_2fa_activo" className="flex items-center">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Autenticación en Dos Pasos (2FA)
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Requiere código SMS en cada login
                  </p>
                </div>
                <Switch
                  id="sms_2fa_activo"
                  checked={formData.sms_2fa_activo}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, sms_2fa_activo: checked })
                  }
                />
              </div>

              {formData.sms_2fa_activo && (
                <div className="space-y-2">
                  <Label htmlFor="sms_2fa_telefono">Teléfono para 2FA *</Label>
                  <Input
                    id="sms_2fa_telefono"
                    value={formData.sms_2fa_telefono}
                    onChange={(e) =>
                      setFormData({ ...formData, sms_2fa_telefono: e.target.value })
                    }
                    placeholder="+34612345678"
                  />
                  <p className="text-xs text-muted-foreground">
                    Se enviará un código SMS a este número en cada login
                  </p>
                </div>
              )}
            </div>

            {/* Estado */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="activo">Estado del Usuario</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Los usuarios inactivos no pueden iniciar sesión
                </p>
              </div>
              <Switch
                id="activo"
                checked={formData.activo}
                onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : editingUsuario ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
