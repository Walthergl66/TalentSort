# Componente SearchBar

Barra de búsqueda moderna y completamente funcional con soporte para sugerencias, navegación por teclado y accesibilidad completa.

## 🎯 Características

- ✅ **Búsqueda en tiempo real** con debounce automático
- ✅ **Sugerencias inteligentes** con navegación por teclado
- ✅ **Tres variantes de tamaño**: compact, default, large
- ✅ **Accesibilidad completa** (WCAG 2.1)
- ✅ **Responsive** con versión móvil
- ✅ **Animaciones suaves** y transiciones
- ✅ **i18n integrado** (español/inglés)
- ✅ **Temas personalizables**

## 📦 Uso Básico

```tsx
import SearchBar from '@/components/SearchBar'

export default function MyComponent() {
  const handleSearch = (query: string) => {
    console.log('Buscando:', query)
    // Tu lógica de búsqueda aquí
  }

  return (
    <SearchBar
      onSearch={handleSearch}
      placeholder="Buscar candidatos..."
    />
  )
}
```

## 🎨 Variantes

### Compact (para headers)
```tsx
<SearchBar
  onSearch={handleSearch}
  variant="compact"
  placeholder="Buscar..."
/>
```

### Default (uso general)
```tsx
<SearchBar
  onSearch={handleSearch}
  variant="default"
  placeholder="Buscar candidatos..."
/>
```

### Large (páginas de búsqueda)
```tsx
<SearchBar
  onSearch={handleSearch}
  variant="large"
  placeholder="¿Qué estás buscando?"
/>
```

## 🔍 Con Sugerencias

```tsx
const suggestions = [
  'React Developer',
  'Python Engineer',
  'UX Designer',
  'Product Manager'
]

<SearchBar
  onSearch={handleSearch}
  suggestions={suggestions}
  showSuggestions={true}
/>
```

## ⌨️ Atajos de Teclado

El componente soporta navegación completa por teclado:

- **Enter**: Ejecutar búsqueda
- **↑/↓**: Navegar entre sugerencias
- **Esc**: Cerrar sugerencias y desenfocar
- **Tab**: Navegación estándar

## 🎯 Props Disponibles

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `onSearch` | `(query: string) => void` | *requerido* | Callback cuando se ejecuta una búsqueda |
| `placeholder` | `string` | De i18n | Texto placeholder del input |
| `suggestions` | `string[]` | `[]` | Array de sugerencias |
| `className` | `string` | `''` | Clases CSS adicionales |
| `variant` | `'compact' \| 'default' \| 'large'` | `'default'` | Tamaño del componente |
| `showSuggestions` | `boolean` | `true` | Mostrar/ocultar sugerencias |
| `autoFocus` | `boolean` | `false` | Auto-enfocar al montar |

## 🌍 i18n

El componente usa `next-intl` para internacionalización. Las traducciones están en:

- `/messages/es.json` → sección `search`
- `/messages/en.json` → sección `search`

```json
{
  "search": {
    "placeholder": "Buscar...",
    "ariaLabel": "Campo de búsqueda",
    "clearSearch": "Limpiar búsqueda",
    "suggestions": "Sugerencias",
    "keyboardHints": "↑↓ para navegar • Enter para buscar • Esc para cerrar"
  }
}
```

## 🎨 Personalización de Estilos

El componente usa Tailwind CSS. Puedes personalizar con la prop `className`:

```tsx
<SearchBar
  onSearch={handleSearch}
  className="max-w-md mx-auto"
/>
```

## ♿ Accesibilidad

El componente incluye:

- Etiquetas ARIA apropiadas (`role`, `aria-label`, `aria-expanded`, etc.)
- Descripciones ocultas para lectores de pantalla
- Navegación completa por teclado
- Estados de foco visibles
- Contraste de colores WCAG AA

## 📱 Responsive

El componente es completamente responsive:

- **Mobile**: Se adapta al ancho del contenedor
- **Desktop**: Puede expandirse o usar ancho fijo según necesites
- En el Header: Se oculta en móvil y muestra un botón de búsqueda

## 🔧 Ejemplos de Integración

### En Header (con versión móvil)

```tsx
import SearchBar from '@/components/SearchBar'
import { useState } from 'react'

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <header>
      {/* Desktop */}
      <div className="hidden lg:block">
        <SearchBar onSearch={handleSearch} variant="compact" />
      </div>

      {/* Mobile toggle */}
      <button 
        className="lg:hidden"
        onClick={() => setIsSearchOpen(!isSearchOpen)}
      >
        🔍
      </button>

      {/* Mobile search */}
      {isSearchOpen && (
        <div className="lg:hidden">
          <SearchBar onSearch={handleSearch} autoFocus />
        </div>
      )}
    </header>
  )
}
```

### En Dashboard con Filtros

```tsx
export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [skills] = useState(['React', 'Python', 'Node.js'])

  return (
    <div>
      <SearchBar
        onSearch={setSearchTerm}
        suggestions={skills}
        placeholder="Buscar por nombre o habilidades..."
      />
      
      {/* Mostrar filtros activos */}
      {searchTerm && (
        <span className="badge">
          {searchTerm}
          <button onClick={() => setSearchTerm('')}>×</button>
        </span>
      )}
    </div>
  )
}
```

### En Página de Búsqueda Principal

```tsx
export default function SearchPage() {
  const [results, setResults] = useState([])
  
  const handleSearch = async (query: string) => {
    const data = await fetchResults(query)
    setResults(data)
  }

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-4xl mb-8">Buscar Talento</h1>
      
      <SearchBar
        onSearch={handleSearch}
        variant="large"
        suggestions={popularSearches}
      />

      <div className="mt-8">
        {results.map(result => (
          <ResultCard key={result.id} {...result} />
        ))}
      </div>
    </div>
  )
}
```

## 🚀 Performance

- **Debounce**: Puedes implementar debounce en el callback `onSearch` si lo necesitas
- **Virtualización**: Para listas grandes de sugerencias, considera usar `react-window`
- **Memoización**: El componente usa `useRef` y `useEffect` optimizados

## 🔄 Estados

El componente maneja internamente:

- Estado de focus/blur
- Estado de dropdown (abierto/cerrado)
- Índice de selección de sugerencias
- Estado del query

## 🎯 Casos de Uso

1. **Header principal** - Búsqueda global del sitio
2. **Dashboard de candidatos** - Filtrar por nombre/habilidades
3. **Página de búsqueda** - Búsqueda principal con resultados
4. **Filtros laterales** - Búsqueda rápida en filtros
5. **Modal de selección** - Buscar items en un modal

## 📝 Notas

- El componente no implementa debounce por defecto. Si lo necesitas, agrégalo en tu callback `onSearch`
- Las sugerencias se filtran automáticamente según el query
- El dropdown se cierra automáticamente al hacer click fuera
- El componente es controlado externamente (no maneja el estado de búsqueda global)

## 🐛 Troubleshooting

**Las sugerencias no aparecen:**
- Verifica que `showSuggestions={true}`
- Asegúrate de pasar un array de sugerencias válido
- Revisa que las sugerencias coincidan con el query

**Los estilos no se aplican:**
- Verifica que Tailwind CSS esté configurado correctamente
- Asegúrate de que las clases no estén siendo sobreescritas

**Los textos no se traducen:**
- Verifica que los archivos de traducción tengan la sección `search`
- Asegúrate de que `next-intl` esté configurado correctamente

## 📚 Referencias

- [Documentación de WCAG](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Search Role](https://www.w3.org/TR/wai-aria-1.2/#search)
- [Next.js i18n](https://next-intl-docs.vercel.app/)
