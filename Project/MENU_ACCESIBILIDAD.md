# Menú de Accesibilidad - TalentSort

## 📋 Descripción General

El menú de accesibilidad de TalentSort cumple con los requisitos de WCAG 2.2 y proporciona una experiencia inclusiva para todos los usuarios. El menú está disponible en todas las páginas de la aplicación, incluida la página principal (Home).

## ✨ Características Implementadas

### 1. **Lateral Expandible**
- El menú se posiciona en la esquina inferior derecha de la pantalla
- Se expande lateralmente con animación suave
- Diseño responsivo que se adapta a diferentes tamaños de pantalla
- Máxima altura adaptable para evitar desbordamiento

### 2. **Atajos de Teclado**
El menú incluye múltiples atajos de teclado para acceso rápido:

| Atajo | Función |
|-------|---------|
| `Alt + A` | Abrir/Cerrar menú |
| `Alt + 1` | Activar/Desactivar alto contraste |
| `Alt + 2` | Aumentar tamaño de texto |
| `Alt + 3` | Reducir tamaño de texto |
| `Alt + 4` | Activar navegación por teclado |
| `Alt + 5` | Leer página con síntesis de voz |
| `ESC` | Cerrar menú y submenús |

### 3. **Atajos de Textos**
Todos los atajos de teclado están visualmente indicados en el menú:
- Panel informativo en la parte superior del menú
- Etiquetas `<kbd>` junto a cada opción relevante
- Estilo visual distintivo para identificar rápidamente los atajos

### 4. **Submenús Contextuales**
El menú está organizado en tres categorías principales que se pueden expandir/contraer:

#### 🎨 Visual
- Alto contraste (3 niveles: Suave, Medio, Alto)
- Ajuste de tamaño de texto (80% - 160%)
- Espaciado entre letras y líneas

#### ⌨️ Motriz / Operable
- Navegación mejorada por teclado
- Botones grandes
- Reducción de animaciones

#### 🔊 Audible / Multimedia
- Subtítulos y transcripciones automáticas
- Lectura al pasar el cursor (hover-to-speak)
- Transcripción en vivo (Web Speech API)
- Controles de síntesis de voz

## 🎯 Características Especiales

### Diseño Visual
- **Botón de acceso**: Rojo (#ef4444) con icono de accesibilidad
- **Menú desplegable**: Fondo blanco con sombras sutiles
- **Iconos**: Cada categoría tiene un icono representativo
- **Indicadores visuales**: Flechas que muestran el estado expandido/contraído

### Animaciones
- Entrada del menú con `slideInRight`
- Expansión de submenús con `slideDown`
- Transiciones suaves en hover y focus
- Respeta la preferencia de movimiento reducido del usuario

### Accesibilidad
- Atributos ARIA correctos (`aria-expanded`, `aria-label`, etc.)
- Navegación por teclado completa
- Focus visible y destacado
- Contraste de color AAA
- Compatible con lectores de pantalla

## 🚀 Uso

### En el Home
El menú está integrado en la página principal mediante:

```tsx
import { AccessibilityProvider } from '@/components/Accesibilidad/AccessibilityProvider'
import { AccessibilityMenu } from '@/components/Accesibilidad/AccessibilityMenu'

export default function Home() {
  return (
    <AccessibilityProvider>
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <AccessibilityMenu />
        {/* Resto del contenido */}
      </div>
    </AccessibilityProvider>
  )
}
```

### Activación
1. **Con ratón**: Clic en el botón rojo "Accesibilidad" en la esquina inferior derecha
2. **Con teclado**: Presionar `Alt + A` desde cualquier lugar de la página

### Navegación
1. Usar `Tab` para navegar entre opciones
2. Usar `Enter` o `Espacio` para activar opciones
3. Usar flechas `↑` `↓` en campos de selección
4. Presionar `ESC` para cerrar

## 📱 Responsive

El menú se adapta automáticamente a diferentes dispositivos:
- **Desktop**: Ancho fijo de 320px
- **Tablet**: Ancho adaptable con max-width
- **Mobile**: Ocupa el ancho disponible menos márgenes

## 🎨 Personalización

### Estados de Contraste
- **Suave**: Fondo #0b1320, ideal para uso prolongado
- **Medio**: Fondo #0f1724, equilibrio entre legibilidad y comodidad
- **Alto**: Fondo #020617, máximo contraste para usuarios con baja visión

### Escalado de Fuente
- Rango: 80% a 160%
- Incrementos: 10%
- Se aplica globalmente mediante variable CSS `--a11y-font-scale`

## 🔧 Tecnologías Utilizadas

- **React Hooks**: `useState`, `useEffect`, `useRef`
- **Context API**: Para estado global de accesibilidad
- **Web Speech API**: Para síntesis de voz
- **CSS Variables**: Para personalización dinámica
- **Tailwind CSS**: Para utilidades de estilo

## 📊 Cumplimiento WCAG 2.2

El menú cumple con los siguientes criterios:

| Criterio | Nivel | Estado |
|----------|-------|--------|
| 1.4.3 Contraste (Mínimo) | AA | ✅ Cumple |
| 1.4.6 Contraste (Mejorado) | AAA | ✅ Cumple |
| 2.1.1 Teclado | A | ✅ Cumple |
| 2.4.7 Foco Visible | AA | ✅ Cumple |
| 3.2.4 Identificación Consistente | AA | ✅ Cumple |
| 4.1.3 Mensajes de Estado | AA | ✅ Cumple |

## 🆘 Solución de Problemas

### El menú no aparece
- Verificar que `AccessibilityProvider` envuelve el componente
- Comprobar que no hay conflictos de z-index
- Revisar la consola del navegador por errores

### Los atajos no funcionan
- Asegurarse de que la página tiene focus
- Verificar que no hay conflictos con atajos del navegador
- Probar en modo incógnito para descartar extensiones

### El lector de pantalla no lee
- Verificar permisos del navegador
- Comprobar que el navegador soporta Web Speech API
- Revisar configuración de audio del sistema

## 📝 Notas de Desarrollo

- El estado del menú persiste durante la sesión
- Las preferencias se pueden expandir para guardarse en localStorage
- El componente es completamente reutilizable en otras páginas
- Compatible con Next.js 14+ y React 18+

## 🔄 Próximas Mejoras

- [ ] Persistencia de preferencias con localStorage
- [ ] Más opciones de personalización de color
- [ ] Temas precargados (Alto contraste oscuro/claro)
- [ ] Exportar/Importar configuración
- [ ] Integración con preferencias del sistema operativo
