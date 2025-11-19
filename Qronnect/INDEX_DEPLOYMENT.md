# 📑 Índice de Archivos de Deployment

**Guía rápida de qué archivo leer según tu necesidad**

---

## 🎯 ¿Qué necesitas?

### 1. "Quiero deployar AHORA (en 15 minutos)"
→ **QUICK_DEPLOY.md**

### 2. "Quiero entender todo el proceso primero"
→ **GUIA_DEPLOYMENT_VERCEL.md**

### 3. "Quiero un checklist para no olvidar nada"
→ **CHECKLIST_DEPLOYMENT.md**

### 4. "Quiero una visión general"
→ **README_PRODUCCION.md**

### 5. "¿Qué archivos se crearon?"
→ **DEPLOYMENT_SUMMARY.md**

### 6. "¿Cuánto va a costar?"
→ **README_PRODUCCION.md** (sección Costes)

### 7. "¿Cómo funciona el multi-dominio?"
→ **RESUMEN_DEPLOYMENT.md** (sección Multi-dominio)

### 8. "Algo no funciona, necesito ayuda"
→ **GUIA_DEPLOYMENT_VERCEL.md** (sección Troubleshooting)

---

## 📚 Todos los Documentos

| Archivo | Tamaño | Tiempo de lectura | Propósito |
|---------|--------|-------------------|-----------|
| **README_PRODUCCION.md** | ~200 líneas | 10 min | Punto de entrada principal |
| **QUICK_DEPLOY.md** | ~150 líneas | 5 min | Guía rápida, comandos directos |
| **GUIA_DEPLOYMENT_VERCEL.md** | ~600 líneas | 30 min | Guía completa paso a paso |
| **CHECKLIST_DEPLOYMENT.md** | ~300 líneas | 5 min | Lista de tareas interactiva |
| **DEPLOYMENT_SUMMARY.md** | ~250 líneas | 10 min | Resumen de archivos creados |
| **RESUMEN_DEPLOYMENT.md** | ~400 líneas | 15 min | Resumen ejecutivo (ya existía) |

---

## 🔧 Archivos de Configuración

### Backend
- `backend/Procfile` - Para Railway/Heroku
- `backend/railway.json` - Configuración Railway
- `backend/render.yaml` - Configuración Render
- `backend/.env.production` - Template de variables

### Frontend
- `frontend/vercel.json` - Configuración Vercel
- `frontend/.env.production` - Template de variables
- `frontend/next.config.mjs` - Config Next.js (modificado)

### Código Actualizado
- `backend/src/main.ts` - CORS mejorado
- `backend/src/app.controller.ts` - Health check añadido

---

## 🚀 Scripts

- `scripts/deploy.sh` - Deployment automatizado

---

## 📖 Lectura Recomendada (Orden)

### Primera vez:
1. **README_PRODUCCION.md** (10 min) - Visión general
2. **QUICK_DEPLOY.md** (5 min) - Comandos básicos
3. **CHECKLIST_DEPLOYMENT.md** (usar durante deployment)

### Si quieres profundizar:
4. **GUIA_DEPLOYMENT_VERCEL.md** (30 min) - Detalles completos

### Si algo falla:
5. **GUIA_DEPLOYMENT_VERCEL.md** → Sección Troubleshooting

---

## ⏱️ Tiempo Total Estimado

- **Lectura básica:** 15-20 min
- **Lectura completa:** 1 hora
- **Deployment:** 30-45 min
- **Total primera vez:** ~1.5-2 horas

---

**Siguiente paso:** Abre `README_PRODUCCION.md`
