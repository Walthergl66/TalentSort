# Sistema de Evaluación de Usabilidad - TalentSort

## 📊 Resumen

TalentSort implementa tres instrumentos estándar de evaluación de usabilidad:

1. **CSAT** (Customer Satisfaction Score) - Satisfacción del usuario
2. **NASA-TLX** (Task Load Index) - Carga cognitiva
3. **SUS** (System Usability Scale) - Usabilidad global

---

## 1. 🎯 CSAT - Customer Satisfaction Score

### Propósito
Medir la satisfacción del usuario con la interfaz y la experiencia general.

### Cuándo se activa
- Después de 10 minutos de sesión activa
- Al finalizar una sesión larga (>5 minutos)
- Se muestra máximo una vez cada 7 días

### Escala
Likert 1-5:
- 1: Muy insatisfecho 😞
- 2: Insatisfecho 😕
- 3: Neutral 😐
- 4: Satisfecho 🙂
- 5: Muy satisfecho 😄

### Dimensiones evaluadas (13 ítems)
1. Satisfacción global
2. Facilidad de uso
3. Claridad de la información
4. Fluidez de interacción
5. Confianza del usuario
6. Rapidez percibida
7. Consistencia
8. Control percibido
9. Estética visual
10. Comodidad de uso
11. Claridad de retroalimentación
12. Satisfacción con el resultado
13. Experiencia general

### Formato
- Presentación paginada (5 preguntas por página)
- Barra de progreso visible
- Campo de comentarios opcional
- Tiempo estimado: 3-4 minutos

### Datos almacenados
```typescript
{
  user_id: UUID,
  session_id: string,
  created_at: timestamp,
  // 13 respuestas numéricas
  satisfaccion_global: 1-5,
  facilidad_uso: 1-5,
  // ...
  comentarios: string (opcional),
  // Metadata
  user_role: string,
  page_context: string,
  device_type: 'mobile' | 'desktop',
  browser_info: string
}
```

---

## 2. 🧠 NASA-TLX - Task Load Index

### Propósito
Evaluar la carga cognitiva y el esfuerzo requerido para completar una tarea específica.

### Cuándo se activa
- Inmediatamente después de completar una tarea importante
- Trigger manual con `triggerTaskCompleteSurvey('Nombre de la tarea')`

### Escala
Numérica 1-10:
- 1: Muy bajo
- 10: Muy alto

**Nota:** La dimensión "Rendimiento" está invertida (10 = excelente, 1 = muy bajo)

### Dimensiones evaluadas (10 ítems)
1. 🧠 Demanda mental
2. 💪 Demanda física
3. ⏱️ Demanda temporal
4. 🎯 Rendimiento (invertido)
5. ⚡ Esfuerzo
6. 😤 Frustración
7. 📚 Sobrecarga informativa
8. 🔀 Complejidad percibida
9. 😴 Fatiga mental
10. 👁️ Atención requerida

### Formato
- Presentación individual (una pregunta a la vez)
- Escala visual de 1-10 con botones grandes
- Campo de comentarios opcional
- Tiempo estimado: 2-3 minutos

### Ejemplo de trigger manual
```typescript
import { triggerTaskCompleteSurvey } from '@/components/usability'

// Después de que el usuario complete una acción importante
const handleCreateVacancy = async () => {
  // ... lógica de creación
  triggerTaskCompleteSurvey('Crear nueva vacante')
}
```

### Datos almacenados
```typescript
{
  user_id: UUID,
  task_id: string,
  task_name: string,
  task_duration_seconds: number,
  task_completed: boolean,
  created_at: timestamp,
  // 10 respuestas numéricas
  demanda_mental: 1-10,
  demanda_fisica: 1-10,
  // ...
  comentarios: string (opcional),
  // Metadata
  user_role: string,
  device_type: string
}
```

---

## 3. 📋 SUS - System Usability Scale

### Propósito
Evaluar la usabilidad global del sistema de manera estandarizada.

### Cuándo se activa
- Al finalizar una sesión significativa (>5 minutos)
- Alternando con CSAT (50% probabilidad de cada uno)
- Se muestra máximo una vez cada 7 días

### Escala
Likert 1-5:
- 1: Totalmente en desacuerdo
- 2: En desacuerdo
- 3: Neutral
- 4: De acuerdo
- 5: Totalmente de acuerdo

### Preguntas (10 ítems)
1. ✅ Creo que me gustaría utilizar este sistema frecuentemente (positivo)
2. ❌ Encontré el sistema innecesariamente complejo (negativo)
3. ✅ Pensé que el sistema era fácil de usar (positivo)
4. ❌ Creo que necesitaría apoyo técnico (negativo)
5. ✅ Las funciones estaban bien integradas (positivo)
6. ❌ Había demasiada inconsistencia (negativo)
7. ✅ La mayoría aprenderían rápido (positivo)
8. ❌ Encontré el sistema muy complicado (negativo)
9. ✅ Me sentí muy confiado/a (positivo)
10. ❌ Necesité aprender muchas cosas antes (negativo)

### Cálculo del puntaje SUS
```typescript
// Preguntas impares (positivas): suma (respuesta - 1)
// Preguntas pares (negativas): suma (5 - respuesta)
// Puntaje = (suma total / 40) * 100
```

### Interpretación del puntaje
| Puntaje | Clasificación | Color | Descripción |
|---------|--------------|-------|-------------|
| 85-100 | Excelente | 🟢 Verde | Usabilidad excepcional |
| 73-84 | Bueno | 🔵 Azul | Buena usabilidad |
| 52-72 | Aceptable | 🟡 Amarillo | Usabilidad pasable pero mejorable |
| 25-51 | Pobre | 🟠 Naranja | Necesita mejoras significativas |
| 0-24 | Muy pobre | 🔴 Rojo | Usabilidad muy deficiente |

**Promedio de la industria:** ~68 puntos

### Formato
- Presentación individual (una pregunta a la vez)
- Botones de radio estilo checklist
- Pantalla de resultados con puntaje calculado
- Campo de comentarios opcional
- Tiempo estimado: 3-4 minutos

### Datos almacenados
```typescript
{
  user_id: UUID,
  session_id: string,
  session_duration_minutes: number,
  pages_visited: number,
  created_at: timestamp,
  // 10 respuestas numéricas
  uso_frecuente: 1-5,
  complejidad_innecesaria: 1-5,
  // ...
  sus_score: number (0-100),
  comentarios: string (opcional),
  // Metadata
  user_role: string,
  device_type: string
}
```

---

## 4. ⚙️ Configuración y Uso

### Integración en la aplicación

El sistema ya está integrado en `DashboardLayout`:

```tsx
<UsabilitySurveyManager
  userId={user.id}
  userRole={profile.role}
  enabled={true}
/>
```

### Desactivar encuestas

Para desactivar temporalmente:

```tsx
<UsabilitySurveyManager
  userId={user.id}
  userRole={profile.role}
  enabled={false} // Deshabilitar
/>
```

### Frecuencia de encuestas

- **Mínimo entre encuestas:** 7 días
- **Encuestas saltadas:** Permiten reaparecer más pronto
- **Duración mínima de sesión:** 5 minutos para CSAT/SUS
- **Trigger automático CSAT:** 10 minutos de sesión

### Almacenamiento local

```typescript
// Última encuesta completada
localStorage.getItem(`lastSurvey_${userId}`)

// Páginas visitadas en la sesión
sessionStorage.getItem('pagesVisited')
```

---

## 5. 📊 Base de Datos

### Tablas creadas

1. **usability_csat** - Respuestas CSAT
2. **usability_nasa_tlx** - Respuestas NASA-TLX
3. **usability_sus** - Respuestas SUS

### Script SQL

Ejecutar: `sql/create_usability_surveys.sql`

### Row Level Security (RLS)

- Usuarios pueden ver solo sus propias respuestas
- Admins pueden ver todas las respuestas
- Inserción solo del propio usuario

### Consultas útiles

```sql
-- Promedio de satisfacción CSAT por usuario
SELECT 
  user_role,
  AVG(satisfaccion_global) as avg_satisfaction,
  COUNT(*) as total_responses
FROM usability_csat
GROUP BY user_role;

-- Puntaje SUS promedio
SELECT 
  AVG(sus_score) as avg_sus_score,
  user_role,
  device_type
FROM usability_sus
GROUP BY user_role, device_type;

-- Carga cognitiva promedio por tarea
SELECT 
  task_name,
  AVG(demanda_mental) as avg_mental_demand,
  AVG(frustracion) as avg_frustration,
  COUNT(*) as completions
FROM usability_nasa_tlx
GROUP BY task_name
ORDER BY avg_mental_demand DESC;
```

---

## 6. 🎨 Diseño y UX

### Características de diseño

- **Modal full-screen** con overlay difuminado
- **Gradientes coloridos** para cada encuesta:
  - CSAT: Azul → Púrpura
  - NASA-TLX: Púrpura → Rosa
  - SUS: Índigo → Azul
- **Dark mode** completo
- **Emojis visuales** para escalas
- **Barras de progreso** animadas
- **Validación en tiempo real**
- **Botones grandes** y accesibles (WCAG 2.5.5)

### Accesibilidad

- ✅ Navegación por teclado
- ✅ ARIA labels
- ✅ Alto contraste
- ✅ Foco visible
- ✅ Botones ≥ 44×44px
- ✅ Texto escalable

---

## 7. 🚀 Triggers Personalizados

### Ejemplo 1: Después de subir CV

```typescript
// En components/cv/CVUpload.tsx
const handleUploadSuccess = async () => {
  // ... lógica de subida
  triggerTaskCompleteSurvey('Subir CV')
}
```

### Ejemplo 2: Después de postularse a empleo

```typescript
// En pages/jobs/[id].tsx
const handleApply = async () => {
  // ... lógica de postulación
  triggerTaskCompleteSurvey('Postularse a empleo')
}
```

### Ejemplo 3: Después de crear vacante

```typescript
// En dashboard/company/vacancies/new.tsx
const handleCreateVacancy = async () => {
  // ... lógica de creación
  triggerTaskCompleteSurvey('Crear nueva vacante')
}
```

---

## 8. 📈 Análisis de Resultados

### KPIs clave

**CSAT:**
- Puntaje promedio de satisfacción
- Dimensiones más bajas (áreas de mejora)
- Satisfacción por rol de usuario
- Tendencias temporales

**NASA-TLX:**
- Tareas con mayor carga cognitiva
- Niveles de frustración
- Tareas que requieren mejoras
- Comparación antes/después de cambios

**SUS:**
- Puntaje SUS promedio (objetivo: >68)
- Distribución de puntajes
- Comparación con benchmarks de la industria
- Evolución temporal

### Dashboard de análisis

Crear en `/dashboard/analytics/usability`:

```typescript
// Componente para visualizar resultados
import { CSATAnalytics } from '@/components/analytics/CSATAnalytics'
import { NASATLXAnalytics } from '@/components/analytics/NASATLXAnalytics'
import { SUSAnalytics } from '@/components/analytics/SUSAnalytics'
```

---

## 9. 🔧 Troubleshooting

### Las encuestas no aparecen

1. Verificar `enabled={true}` en UsabilitySurveyManager
2. Revisar localStorage: `localStorage.getItem('lastSurvey_userId')`
3. Asegurar sesión activa >5 minutos
4. Verificar que no se haya mostrado en últimos 7 días

### Error al guardar respuestas

1. Verificar tablas creadas: `create_usability_surveys.sql`
2. Revisar políticas RLS
3. Verificar que el usuario esté autenticado
4. Revisar console.error en DevTools

### Encuestas muy frecuentes

```typescript
// Ajustar frecuencia en UsabilitySurveyManager.tsx
const daysSinceLastSurvey = (Date.now() - parseInt(lastSurveyTime)) / (1000 * 60 * 60 * 24)
if (daysSinceLastSurvey < 14) { // Cambiar de 7 a 14 días
  return
}
```

---

## 10. 📚 Referencias

- [SUS: A 'Quick and Dirty' Usability Scale](https://www.usability.gov/how-to-and-tools/methods/system-usability-scale.html)
- [NASA-TLX: Task Load Index](https://humansystems.arc.nasa.gov/groups/tlx/)
- [Customer Satisfaction (CSAT) Metrics](https://www.qualtrics.com/experience-management/customer/csat/)

---

## 📞 Soporte

Para preguntas sobre el sistema de evaluación de usabilidad, contactar al equipo de desarrollo.

**Última actualización:** 14 de enero de 2026  
**Versión:** 1.0
