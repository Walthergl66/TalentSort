# Funcionalidad de CV para Candidatos

Este documento describe las nuevas funcionalidades añadidas para que los usuarios puedan gestionar sus CVs como candidatos.

## 📁 Estructura de Archivos Creados

```
/dashboard/cv/
├── page.tsx              # Lista de CVs del usuario
├── upload/
│   └── page.tsx          # Subida y análisis de CV
└── [id]/
    └── page.tsx          # Detalles específicos del CV
```

## 🚀 Características Principales

### 1. Subida de CV (`/dashboard/cv/upload`)
- **Drag & Drop**: Arrastra y suelta archivos
- **Formatos soportados**: PDF, DOC, DOCX
- **Tamaño máximo**: 10MB
- **Análisis automático**: IA procesa el CV y extrae información
- **Validación**: Verifica tipo y tamaño de archivo

### 2. Lista de CVs (`/dashboard/cv`)
- **Vista general**: Todos los CVs subidos por el usuario
- **Puntuación IA**: Muestra score de 0-100
- **Información extraída**: Habilidades, experiencia, posición
- **Gestión**: Ver detalles o eliminar CVs
- **Estados visuales**: Barras de progreso y códigos de color

### 3. Detalles del CV (`/dashboard/cv/[id]`)
- **Análisis completo**: Información detallada extraída por IA
- **Fortalezas identificadas**: Puntos fuertes del candidato
- **Áreas de mejora**: Sugerencias de la IA
- **Recomendaciones**: Consejos personalizados
- **Información del archivo**: Metadata y estadísticas

## 🤖 Análisis de IA

El sistema simula un análisis completo de IA que incluye:

### Información Extraída
- Nombre del candidato
- Email de contacto
- Posición actual
- Años de experiencia
- Habilidades técnicas
- Expectativa salarial

### Evaluación Inteligente
- **Puntuación (0-100)**: Evaluación general del CV
- **Fortalezas**: Aspectos positivos identificados
- **Áreas de mejora**: Sugerencias específicas
- **Resumen**: Análisis textual del perfil

## 📊 Dashboard Actualizado

### Nuevas Métricas Orientadas al Candidato
1. **Postulaciones**: Total de aplicaciones enviadas
2. **Aplicado Hoy**: Actividad diaria
3. **Completitud Perfil**: Porcentaje basado en CV
4. **Trabajos Disponibles**: Oportunidades en el mercado
5. **Entrevistas**: Programadas o pendientes
6. **Ofertas**: Recibidas del mercado

### Navegación Actualizada
- **Mi CV**: Gestión de currículums
- **Buscar Trabajos**: Explorar oportunidades
- **Mis Postulaciones**: Estado de aplicaciones
- **Mi Perfil**: Información personal

## 🗄️ Base de Datos

### Nueva Tabla: `user_cvs`
```sql
CREATE TABLE user_cvs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  file_name TEXT NOT NULL,
  file_size BIGINT,
  candidate_name TEXT,
  experience_years INTEGER,
  skills TEXT[],
  current_position TEXT,
  ai_score INTEGER,
  strengths TEXT[],
  areas_improvement TEXT[],
  salary_expectation TEXT,
  status TEXT DEFAULT 'processed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Seguridad (RLS)
- Los usuarios solo pueden ver/editar sus propios CVs
- Políticas de Row Level Security implementadas
- Triggers automáticos para `updated_at`

## 🎨 Componentes UI

### Características de Diseño
- **Responsive**: Adaptado para móvil y escritorio
- **Accesible**: Etiquetas ARIA y navegación por teclado
- **Drag & Drop**: Interfaz intuitiva para subir archivos
- **Estados visuales**: Loading, success, error
- **Progreso visual**: Barras y indicadores de puntuación

### Códigos de Color para Puntuación
- **Verde (80-100%)**: Excelente CV
- **Amarillo (60-79%)**: Buen CV con mejoras
- **Rojo (0-59%)**: Necesita mejoras significativas

## 🔄 Integración con Dashboard Existente

### Componentes Actualizados
1. **OverviewStats**: Métricas orientadas al candidato
2. **QuickActions**: Botones para funciones de CV
3. **NavigationMenu**: Enlaces a secciones de candidato
4. **CandidatePipeline**: Estados de postulaciones
5. **RecentActivity**: Actividad de aplicaciones
6. **SkillsAnalytics**: Análisis del mercado laboral

## 📝 Próximos Pasos

1. **Implementar backend real**: Procesamiento de archivos con IA
2. **Integrar con APIs de trabajo**: Indeed, LinkedIn, etc.
3. **Matching automático**: Sugerir trabajos basados en CV
4. **Notificaciones**: Alertas de nuevas oportunidades
5. **Optimización de CV**: Sugerencias de mejora específicas

## 🚀 Cómo Usar

1. **Navegar a CV**: Desde el dashboard, ir a "Mi CV"
2. **Subir archivo**: Usar "Subir Nuevo CV"
3. **Revisar análisis**: Ver puntuación y recomendaciones
4. **Gestionar CVs**: Eliminar o ver detalles
5. **Optimizar**: Seguir sugerencias de IA para mejorar

---

**Nota**: Esta implementación simula el procesamiento de IA. En producción, se integraría con servicios reales de análisis de CV como OpenAI GPT-4, Google Document AI, o Microsoft Cognitive Services.