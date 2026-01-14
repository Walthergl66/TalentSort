# 📋 GUÍA DE VERIFICACIÓN - ACCESIBILIDAD Y USABILIDAD

Esta guía te ayudará a verificar que TalentSort cumple con los criterios WCAG de accesibilidad y que los parámetros de usabilidad están funcionando correctamente.

---

## 🎯 PARTE 1: VERIFICACIÓN DE ACCESIBILIDAD WCAG

### Método 1: Usar el Verificador Integrado

1. **Acceder como Administrador**
   ```
   Ruta: /dashboard/admin/accessibility
   ```

2. **Revisar Criterios**
   - El verificador lista 20 criterios WCAG implementados
   - Cada criterio incluye instrucciones específicas de prueba
   - Marca cada uno como ✅ Cumplido o ❌ No cumplido

3. **Exportar Reporte**
   - Usa el botón "Descargar Reporte" al final de la página
   - Genera archivo de texto con resultados

### Método 2: Pruebas Manuales Paso a Paso

#### A. ACCESIBILIDAD MOTRIZ

**M1 - Bypass Blocks (WCAG 2.4.1 - Nivel A)**
- [ ] Recargar la página del dashboard
- [ ] Presionar Tab una vez
- [ ] ✅ Debe aparecer enlace "Skip to main content"
- [ ] Presionar Tab de nuevo
- [ ] ✅ Debe aparecer enlace "Skip to navigation"
- [ ] Presionar Enter en cualquiera
- [ ] ✅ El foco debe saltar al contenido/navegación

**M2 - Keyboard Navigation (WCAG 2.1.1 - Nivel A)**
- [ ] Usar SOLO el teclado (Tab, Shift+Tab, Enter, Espacio, Flechas)
- [ ] Navegar por todo el dashboard
- [ ] ✅ Todos los botones deben ser accesibles
- [ ] ✅ Todos los enlaces deben funcionar
- [ ] ✅ Menús y modales deben abrirse/cerrarse

**M3 - Focus Visible (WCAG 2.4.7 - Nivel AA)**
- [ ] Presionar Tab repetidamente
- [ ] ✅ Cada elemento enfocado debe tener outline azul visible (3-4px)
- [ ] ✅ El outline debe tener suficiente contraste (mínimo 3:1)
- [ ] Probar en modo claro y oscuro

**M4 - Target Size (WCAG 2.5.8 - Nivel AA)**
- [ ] Abrir DevTools (F12)
- [ ] Inspeccionar botones
- [ ] ✅ Width y height deben ser mínimo 44px
- [ ] Probar en móvil real o emulador
- [ ] ✅ Los botones deben ser fáciles de tocar

**M5 - Timing Adjustable (WCAG 2.2.1 - Nivel A)**
- [ ] Iniciar sesión
- [ ] Esperar 28 minutos (o modificar timeout en TimeoutExtender.tsx para probar)
- [ ] ✅ Debe aparecer modal de advertencia 2 minutos antes
- [ ] ✅ Modal debe tener role="alert" (verificar en DevTools)
- [ ] Presionar "Extender sesión"
- [ ] ✅ La sesión debe extenderse 30 minutos más

**M6 - Focus Not Obscured (WCAG 2.4.11 - Nivel AA)**
- [ ] Navegar con Tab por toda la página
- [ ] ✅ El elemento enfocado NUNCA debe quedar oculto detrás del header
- [ ] ✅ Debe hacer scroll automático si es necesario
- [ ] Verificar con elementos al final de la página

#### B. ACCESIBILIDAD VISUAL

**V1 - Contrast Minimum (WCAG 1.4.3 - Nivel AA)**

Herramientas recomendadas:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Extensión de Chrome: "WCAG Color Contrast Checker"

Verificar:
- [ ] Texto negro sobre blanco: ✅ Debe ser 21:1
- [ ] Texto gris sobre blanco: ✅ Mínimo 4.5:1
- [ ] Texto en modo oscuro: ✅ Mínimo 4.5:1
- [ ] Enlaces azules: ✅ Mínimo 4.5:1

**V2 - Reflow (WCAG 1.4.10 - Nivel AA)**
- [ ] Abrir DevTools (F12)
- [ ] Responsive Design Mode
- [ ] Establecer viewport: 320 x 568 px
- [ ] ✅ NO debe aparecer scroll horizontal
- [ ] ✅ Todo el contenido debe ser legible
- [ ] ✅ Navegación debe funcionar

**V3 - Non-text Contrast (WCAG 1.4.11 - Nivel AA)**
- [ ] Inspeccionar botones con DevTools
- [ ] Verificar contraste de bordes: ✅ Mínimo 3:1
- [ ] Verificar iconos: ✅ Mínimo 3:1
- [ ] Usar Contrast Checker en elementos UI

**V4 - Text Spacing (WCAG 1.4.12 - Nivel AA)**

Probar aplicando este CSS en DevTools:
```css
* {
  line-height: 1.5 !important;
  letter-spacing: 0.12em !important;
  word-spacing: 0.16em !important;
  paragraph-spacing: 2em !important;
}
```
- [ ] ✅ No debe perderse contenido
- [ ] ✅ Textos deben seguir legibles
- [ ] ✅ Layout no debe romperse

**V5 - Three Flashes (WCAG 2.3.1 - Nivel A)**
- [ ] Revisar todas las animaciones
- [ ] ✅ No debe haber parpadeos rápidos
- [ ] ✅ Transiciones deben ser suaves
- [ ] ✅ Sin efectos epilépticos

**V6 - Content on Hover/Focus (WCAG 1.4.13 - Nivel AA)**
- [ ] Hacer hover sobre tooltips
- [ ] ✅ Debe poder cerrarse con Esc
- [ ] Mover mouse sobre el tooltip
- [ ] ✅ No debe desaparecer mientras el cursor está encima
- [ ] ✅ Debe ser persistente hasta que el usuario lo cierre

#### C. ACCESIBILIDAD AUDITIVA

**A1 - Audio/Video Alternatives (WCAG 1.2.1 - Nivel A)**
- [ ] Localizar componente VideoPlayer
- [ ] ✅ Debe tener transcripción o descripción
- [ ] ✅ Controles deben ser accesibles por teclado

**A2 - Captions (WCAG 1.2.2 - Nivel A)**
- [ ] Reproducir video en VideoPlayer
- [ ] ✅ Debe tener opción de subtítulos
- [ ] ✅ Subtítulos deben estar sincronizados
- [ ] ✅ Texto debe ser legible

**A3 - Audio Control (WCAG 1.4.2 - Nivel A)**
- [ ] Cargar todas las páginas
- [ ] ✅ NO debe haber audio automático
- [ ] Si lo hay, verificar botón de pausa
- [ ] ✅ Control de volumen debe estar presente

**A4 - Pause, Stop, Hide (WCAG 2.2.2 - Nivel A)**
- [ ] Identificar contenido animado (carruseles, etc.)
- [ ] ✅ Debe tener controles de pausa
- [ ] Activar prefers-reduced-motion en sistema
- [ ] ✅ Animaciones deben detenerse o reducirse

### 🧪 Herramientas Automatizadas Recomendadas

1. **Extensiones de Navegador**
   - [WAVE](https://wave.webaim.org/extension/)
   - [axe DevTools](https://www.deque.com/axe/devtools/)
   - [Lighthouse](https://developers.google.com/web/tools/lighthouse) (incluido en Chrome DevTools)

2. **Correr Lighthouse**
   ```bash
   # En Chrome DevTools
   1. F12
   2. Pestaña "Lighthouse"
   3. Categorías: ✓ Accessibility
   4. Analizar página
   5. Objetivo: Puntaje > 90
   ```

3. **Screen Readers**
   - **Windows**: NVDA (gratuito) o JAWS
   - **Mac**: VoiceOver (integrado, Cmd+F5)
   - **Verificar**: Toda la página debe ser navegable y comprensible

---

## 📊 PARTE 2: VERIFICACIÓN DE PARÁMETROS DE USABILIDAD

### Paso 1: Crear las Tablas en Supabase

1. **Abrir Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/[tu-proyecto]/editor
   ```

2. **Ejecutar el Script SQL**
   - Copiar contenido de: `sql/create_usability_surveys.sql`
   - Pegar en SQL Editor
   - Ejecutar (Run)
   - ✅ Verificar que se crearon 3 tablas:
     - usability_csat
     - usability_nasa_tlx
     - usability_sus

3. **Verificar RLS Policies**
   - Ir a Authentication > Policies
   - ✅ Cada tabla debe tener 2 policies (user, admin)

### Paso 2: Probar los Surveys

#### A. Probar CSAT (Satisfacción del Cliente)

**Trigger Automático:**
- [ ] Iniciar sesión
- [ ] Navegar por el dashboard por 10+ minutos
- [ ] ✅ Debe aparecer survey CSAT automáticamente

**Trigger Manual:**
```javascript
// En consola del navegador:
window.dispatchEvent(new CustomEvent('triggerCSATSurvey'))
```

**Verificar Survey:**
- [ ] ✅ Aparece modal con 13 preguntas
- [ ] ✅ Escala 1-5 con emojis
- [ ] ✅ Paginación (5 preguntas por página)
- [ ] ✅ Barra de progreso funciona
- [ ] ✅ Validación: no permite siguiente sin responder
- [ ] Completar survey
- [ ] ✅ Mensaje de éxito al finalizar

**Verificar Base de Datos:**
```sql
SELECT * FROM usability_csat ORDER BY created_at DESC LIMIT 1;
```
- [ ] ✅ Registro debe existir
- [ ] ✅ Todas las 13 respuestas guardadas (1-5)
- [ ] ✅ user_id correcto
- [ ] ✅ Metadata (role, device, etc.) presente

#### B. Probar NASA-TLX (Carga Cognitiva)

**Trigger Manual:**
```javascript
// En consola del navegador:
window.dispatchEvent(new CustomEvent('taskCompleted', {
  detail: {
    taskName: 'Subir CV',
    duration: 120 // segundos
  }
}))
```

**Verificar Survey:**
- [ ] ✅ Aparece modal con información de tarea
- [ ] ✅ 10 dimensiones, una a la vez
- [ ] ✅ Escala 1-10 con botones visuales grandes
- [ ] ✅ Navegación adelante/atrás funciona
- [ ] ✅ Pregunta "rendimiento" invertida (10 = mejor)
- [ ] Completar survey
- [ ] ✅ Confirmación al finalizar

**Verificar Base de Datos:**
```sql
SELECT * FROM usability_nasa_tlx ORDER BY created_at DESC LIMIT 1;
```
- [ ] ✅ Registro existe
- [ ] ✅ 10 dimensiones guardadas (1-10)
- [ ] ✅ task_name y task_duration correctos
- [ ] ✅ user_id correcto

#### C. Probar SUS (System Usability Scale)

**Trigger Automático:**
- [ ] Usar la aplicación por 10+ minutos
- [ ] ✅ Debe alternar con CSAT después de la primera vez

**Trigger Manual:**
```javascript
window.dispatchEvent(new CustomEvent('triggerSUSSurvey'))
```

**Verificar Survey:**
- [ ] ✅ Aparece modal con 10 preguntas
- [ ] ✅ Escala 1-5 (radio buttons)
- [ ] ✅ Una pregunta a la vez
- [ ] ✅ Preguntas alternadas (positivas/negativas)
- [ ] Completar survey
- [ ] ✅ Pantalla de resultados aparece
- [ ] ✅ Muestra puntaje SUS (0-100)
- [ ] ✅ Muestra clasificación (Excelente/Bueno/etc.)

**Verificar Cálculo:**
El puntaje SUS debe calcularse así:
```
Preguntas impares (1,3,5,7,9): contribución = respuesta - 1
Preguntas pares (2,4,6,8,10): contribución = 5 - respuesta
Puntaje SUS = (suma de contribuciones / 40) * 100
```

Ejemplo:
```
Respuestas: [5,1,5,1,5,1,5,1,5,1]
Impares: (5-1) + (5-1) + (5-1) + (5-1) + (5-1) = 20
Pares: (5-1) + (5-1) + (5-1) + (5-1) + (5-1) = 20
Total: 40
Puntaje: (40/40) * 100 = 100
```

**Verificar Base de Datos:**
```sql
SELECT * FROM usability_sus ORDER BY created_at DESC LIMIT 1;
```
- [ ] ✅ Registro existe
- [ ] ✅ 10 respuestas guardadas (1-5)
- [ ] ✅ sus_score calculado correctamente
- [ ] ✅ session_duration_minutes registrado

### Paso 3: Ver Resultados en Dashboard

1. **Acceder como Admin**
   ```
   Ruta: /dashboard/admin/usability
   ```

2. **Verificar Tabs**
   - [ ] ✅ Tab CSAT muestra estadísticas
   - [ ] ✅ Tab NASA-TLX muestra top tareas
   - [ ] ✅ Tab SUS muestra puntaje promedio

3. **Verificar Estadísticas**
   - [ ] ✅ Total de respuestas correcto
   - [ ] ✅ Promedios calculados
   - [ ] ✅ Distribución por rol funciona
   - [ ] ✅ Gráficos visuales presentes

### Paso 4: Cooldown Testing

**Verificar que NO aparezcan surveys repetidos:**
- [ ] Completar un CSAT
- [ ] ✅ NO debe aparecer otro CSAT por 7 días
- [ ] Verificar localStorage:
   ```javascript
   localStorage.getItem('lastUsabilitySurvey')
   ```
- [ ] ✅ Debe tener timestamp reciente

**Forzar reset (solo para testing):**
```javascript
localStorage.removeItem('lastUsabilitySurvey')
sessionStorage.removeItem('sessionStartTime')
```

### Paso 5: Triggers en Acciones Reales

**Agregar triggers en componentes clave:**

**En CVUpload.tsx (al completar subida):**
```typescript
// Después de subida exitosa
window.dispatchEvent(new CustomEvent('taskCompleted', {
  detail: {
    taskName: 'Subir CV',
    duration: Math.floor((Date.now() - startTime) / 1000)
  }
}))
```

**En JobApplication (al aplicar):**
```typescript
// Después de aplicación exitosa
window.dispatchEvent(new CustomEvent('taskCompleted', {
  detail: {
    taskName: 'Aplicar a vacante',
    duration: Math.floor((Date.now() - startTime) / 1000)
  }
}))
```

**En VacancyForm (al crear vacante):**
```typescript
// Después de crear vacante
window.dispatchEvent(new CustomEvent('taskCompleted', {
  detail: {
    taskName: 'Crear vacante',
    duration: Math.floor((Date.now() - startTime) / 1000)
  }
}))
```

---

## 🎯 CHECKLIST RÁPIDO - RESUMEN

### Accesibilidad
- [ ] Skip links funcionan (Tab en inicio)
- [ ] Navegación 100% por teclado
- [ ] Focus visible (outline azul 3-4px)
- [ ] Botones mínimo 44x44px
- [ ] Timeout extendible (modal a 28min)
- [ ] Focus nunca oculto por headers
- [ ] Contraste texto ≥ 4.5:1
- [ ] Sin scroll horizontal a 320px
- [ ] Contraste UI ≥ 3:1
- [ ] Text spacing no rompe layout
- [ ] Sin flasheos rápidos
- [ ] Tooltips dismissables con Esc
- [ ] Videos con transcripción
- [ ] Subtítulos sincronizados
- [ ] Sin audio automático
- [ ] Animaciones pausables

### Usabilidad
- [ ] Tablas creadas en Supabase (3)
- [ ] RLS policies activas (6 total)
- [ ] CSAT aparece automáticamente
- [ ] CSAT guarda 13 respuestas
- [ ] NASA-TLX aparece en tasks
- [ ] NASA-TLX guarda 10 dimensiones
- [ ] SUS calcula puntaje correctamente
- [ ] SUS guarda sus_score
- [ ] Cooldown 7 días funciona
- [ ] Dashboard admin accesible
- [ ] Estadísticas calculadas
- [ ] Exportar reportes funciona

---

## 📞 SOLUCIÓN DE PROBLEMAS

### Accesibilidad

**Problema: Skip links no aparecen**
```css
/* Verificar en accessibility.css */
.skip-link:focus {
  clip: auto;
  height: auto;
  overflow: visible;
  position: absolute;
  width: auto;
  z-index: 100000;
}
```

**Problema: Focus no visible**
```css
/* Debe existir en accessibility.css */
*:focus-visible {
  outline: 3px solid #3b82f6;
  outline-offset: 2px;
}
```

### Usabilidad

**Problema: Survey no aparece**
1. Verificar que UsabilitySurveyManager está en DashboardLayout
2. Verificar console.log para errores
3. Verificar localStorage cooldown
4. Verificar que pasaron 5+ minutos de sesión

**Problema: No se guarda en BD**
1. Verificar que tablas existen en Supabase
2. Verificar RLS policies
3. Verificar auth.uid() del usuario
4. Revisar console para errores de Supabase

**Problema: Dashboard vacío**
1. Verificar rol = 'admin' en user_profiles
2. Verificar que hay registros en tablas
3. Revisar console para errores de cálculo

---

## ✅ CRITERIOS DE ÉXITO

### Accesibilidad
- **Nivel A**: 100% de criterios Nivel A cumplidos (obligatorio)
- **Nivel AA**: 100% de criterios Nivel AA cumplidos (obligatorio)
- **Nivel AAA**: 50%+ de criterios Nivel AAA cumplidos (deseable)
- **Lighthouse**: Puntaje ≥ 90 en Accesibilidad

### Usabilidad
- **CSAT**: Promedio ≥ 4.0 (satisfacción alta)
- **NASA-TLX**: Demanda Mental < 7, Frustración < 5 (carga aceptable)
- **SUS**: Puntaje ≥ 73 (usabilidad buena)
- **Participación**: ≥ 20% usuarios completan surveys

---

## 📚 REFERENCIAS

### Accesibilidad
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [WebAIM Resources](https://webaim.org/resources/)

### Usabilidad
- [SUS Calculator](https://www.usability.gov/how-to-and-tools/methods/system-usability-scale.html)
- [NASA-TLX Guide](https://humansystems.arc.nasa.gov/groups/tlx/)
- [CSAT Best Practices](https://www.questionpro.com/blog/customer-satisfaction-score-csat/)

---

**Última actualización**: 14 de enero de 2026
