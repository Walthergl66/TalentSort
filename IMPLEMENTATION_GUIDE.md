# 🚀 Sistema de Reclutamiento con IA - Documentación Completa

## 📋 Estructura Implementada

### ✅ Completado

#### 1. **Configuración Base**
- ✅ Variables de entorno para API de IA (`iausabilidad-production.up.railway.app`)
- ✅ Cliente de servicio AI (`/lib/aiService.ts`)
- ✅ Tipos TypeScript completos (`/types/database.ts`)

#### 2. **API Routes**
- ✅ `/api/cv/extract` - Extrae texto de CVs (PDF/DOCX)
- ✅ `/api/cv/analyze` - Analiza un CV contra requisitos
- ✅ `/api/applications/analyze-bulk` - Analiza múltiples aplicaciones

#### 3. **Componentes**
- ✅ `CVUpload` - Subida de CV con validación de 3 páginas
- ✅ `JobVacancyForm` - CRUD de vacantes para empresas

#### 4. **Base de Datos**
- ✅ Schema SQL completo con RLS
- ✅ Tablas: profiles, candidate_cvs, job_vacancies, job_applications

## 🎯 Flujo de Usuario

### Para CANDIDATOS:
1. Registrarse seleccionando rol "candidato"
2. Subir CV (máx 3 páginas, se extrae texto con IA)
3. Buscar vacantes abiertas
4. Postular con su CV
5. Ver estado de postulaciones

### Para EMPRESAS:
1. Registrarse seleccionando rol "empresa"
2. Crear vacantes con requisitos detallados
3. Recibir postulaciones de candidatos
4. **Analizar con IA**: Click en "Analizar Candidatos"
5. Ver ranking automático con scores
6. Revisar análisis individual de cada candidato

## 🔧 Próximos Pasos para Completar

### 1. Actualizar RegisterForm
```typescript
// Agregar selector de rol en el registro
<select name="role">
  <option value="candidate">Soy Candidato</option>
  <option value="company">Soy Empresa</option>
</select>
```

### 2. Crear Página de Vacantes
```typescript
// /app/[locale]/jobs/page.tsx
- Lista de todas las vacantes abiertas
- Filtros por ubicación, tipo, habilidades
- Botón "Postular" para cada vacante
```

### 3. Crear Dashboard Candidato
```typescript
// /app/[locale]/dashboard/candidate/page.tsx
- Mis CVs subidos
- Botón para subir nuevo CV
- Mis postulaciones (con estado)
- Vacantes recomendadas
```

### 4. Crear Dashboard Empresa
```typescript
// /app/[locale]/dashboard/company/page.tsx
- Mis vacantes publicadas
- Botón crear nueva vacante
- Ver postulaciones por vacante
- Botón "Analizar con IA" -> Ejecuta análisis masivo
```

### 5. Página de Ranking
```typescript
// /app/[locale]/dashboard/company/jobs/[jobId]/applicants/page.tsx
- Tabla con candidatos ordenados por score
- Columnas: Nombre, Score IA, % Match, Estado
- Click en candidato -> Ver detalles + análisis completo
- Botones: Shortlist, Rechazar, Contactar
```

## 📡 Integración con API de IA

La API debe tener estos endpoints:

### POST `/api/extract-cv`
```json
Request:
{
  "fileBase64": "base64_string",
  "fileName": "cv.pdf"
}

Response:
{
  "text": "extracted text...",
  "metadata": {
    "pages": 2,
    "size": 124556,
    "format": "pdf"
  }
}
```

### POST `/api/analyze-cv`
```json
Request:
{
  "cvText": "Desarrollador con 5 años...",
  "jobRequirements": "React, Node.js, 3+ años...",
  "jobTitle": "Full Stack Developer"
}

Response:
{
  "score": 85,
  "match_percentage": 82,
  "strengths": ["5 años experiencia React", "Conoce Node.js"],
  "weaknesses": ["No menciona TypeScript"],
  "recommendation": "Candidato fuerte...",
  "skills_match": {
    "required": ["React", "Node.js", "TypeScript"],
    "found": ["React", "Node.js"],
    "missing": ["TypeScript"]
  },
  "experience_analysis": {
    "years": 5,
    "relevance": "high"
  }
}
```

## 🗄️ Ejecutar Schema en Supabase

1. Ve a tu proyecto en Supabase Dashboard
2. SQL Editor
3. Copia y pega el contenido de `/sql/complete_schema.sql`
4. Ejecutar

## 🎨 Componentes Adicionales Necesarios

### JobApplicationForm
```typescript
// Formulario para que candidatos postulen
// Incluye: CV selection, cover letter opcional
```

### ApplicantsList  
```typescript
// Lista de candidatos para una vacante
// Con scores, filtros, acciones
```

### ApplicantDetail
```typescript
// Vista detallada de un candidato
// CV completo, análisis IA, historial
```

### JobsList
```typescript
// Lista pública de vacantes
// Para que candidatos busquen trabajos
```

## 🔐 Seguridad Implementada

- ✅ RLS en todas las tablas
- ✅ Solo candidatos ven sus CVs
- ✅ Solo empresas ven aplicaciones a sus vacantes
- ✅ Validación de tamaño y tipo de archivo
- ✅ Sanitización de inputs

## 📊 Métricas y Analytics

Considera agregar:
- Tiempo promedio de respuesta a aplicaciones
- Tasa de conversión (postulaciones -> contrataciones)
- Skills más demandados
- Scores promedio por vacante

## 🚀 Deploy

1. Configura variables de entorno en producción
2. Verifica que la API de IA esté accesible
3. Habilita CORS en la API de IA
4. Sube límites de storage si es necesario

## 📝 Notas Importantes

- La IA analiza TEXTO del CV, no el PDF directamente
- Máximo 3 páginas = ~300KB para PDFs
- Análisis masivo puede tardar (1-2 seg por CV)
- Implementa rate limiting en producción
- Cachea resultados de análisis para no re-procesar

---

**Estado Actual**: 70% completado
**Falta**: Interfaces de usuario (dashboards y listados)
**Tiempo estimado para completar**: 4-6 horas de desarrollo
