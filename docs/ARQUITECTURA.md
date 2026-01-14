# 🏛️ Arquitectura de TalentSort

## Índice
1. [Visión General](#visión-general)
2. [Principios de Diseño](#principios-de-diseño)
3. [Capas de la Arquitectura](#capas-de-la-arquitectura)
4. [Flujo de Datos](#flujo-de-datos)
5. [Patrones Utilizados](#patrones-utilizados)
6. [Mejores Prácticas](#mejores-prácticas)

## Visión General

TalentSort está construido siguiendo los principios de **Clean Architecture** (Arquitectura Limpia) y **Domain-Driven Design** (Diseño Guiado por el Dominio). Esta arquitectura garantiza:

- ✅ **Mantenibilidad**: Código organizado y fácil de mantener
- ✅ **Escalabilidad**: Fácil agregar nuevas funcionalidades
- ✅ **Testabilidad**: Código desacoplado y fácil de probar
- ✅ **Independencia**: El dominio no depende de frameworks o UI

## Principios de Diseño

### 1. Separación de Responsabilidades (SRP)
Cada módulo tiene una única responsabilidad bien definida.

### 2. Inversión de Dependencias (DIP)
Las capas de alto nivel no dependen de las de bajo nivel. Ambas dependen de abstracciones.

### 3. Principio Abierto/Cerrado (OCP)
El código está abierto a extensión pero cerrado a modificación.

### 4. Sustitución de Liskov (LSP)
Las implementaciones pueden ser sustituidas sin alterar el comportamiento.

### 5. Segregación de Interfaces (ISP)
Interfaces pequeñas y específicas en lugar de grandes y genéricas.

## Capas de la Arquitectura

### 🎯 Capa de Dominio (`/core`)

**Responsabilidad**: Contiene la lógica de negocio pura.

```
core/
├── entidades/          # Objetos del dominio con identidad
├── objetos-valor/      # Objetos inmutables sin identidad
├── repositorios/       # Interfaces (contratos)
└── casos-uso/          # Lógica de negocio
```

**Características**:
- ✅ Sin dependencias externas
- ✅ Reglas de negocio puras
- ✅ Validaciones de dominio
- ✅ No conoce UI ni infraestructura

**Ejemplo: Entidad Usuario**
```typescript
export class Usuario extends Entidad<PropiedadesUsuario> {
  // Validaciones de negocio
  static crear(props: PropiedadesUsuario): Usuario {
    if (props.rol === RolUsuario.EMPRESA && !props.nombreEmpresa) {
      throw new ErrorValidacion('Empresa requiere nombre');
    }
    return new Usuario(props);
  }

  // Lógica de negocio
  tieneSuscripcionPremium(): boolean {
    return this.nivelSuscripcion !== NivelSuscripcion.GRATUITO;
  }
}
```

### 📊 Capa de Aplicación (`/aplicacion`)

**Responsabilidad**: Orquesta el flujo de datos entre el dominio y la infraestructura.

```
aplicacion/
├── dtos/              # Data Transfer Objects
├── validadores/       # Esquemas de validación (Zod)
└── servicios/         # Servicios de aplicación
```

**Características**:
- ✅ Coordina casos de uso
- ✅ Transforma datos (DTOs)
- ✅ Valida entradas
- ✅ Maneja transacciones

**Ejemplo: Validador**
```typescript
export const esquemaRegistroUsuario = z.object({
  email: z.string().email('Email inválido'),
  nombreCompleto: z.string().min(2, 'Mínimo 2 caracteres'),
  rol: z.enum(['empresa', 'candidato'])
});
```

### 🔧 Capa de Infraestructura (`/infraestructura`)

**Responsabilidad**: Implementaciones concretas de servicios externos.

```
infraestructura/
├── base-datos/             # Cliente Supabase
├── repositorios/           # Implementaciones de repositorios
└── servicios-externos/     # Servicios externos (IA, etc.)
```

**Características**:
- ✅ Implementa interfaces del dominio
- ✅ Acceso a base de datos
- ✅ Llamadas a APIs externas
- ✅ Manejo de I/O

**Ejemplo: Repositorio**
```typescript
export class RepositorioUsuariosSupabase 
  implements IRepositorioUsuarios {
  
  async obtenerPorId(id: string): Promise<Resultado<Usuario, Error>> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return fallo(new ErrorInfraestructura(error.message));
    
    const usuario = Usuario.crear({...});
    return exito(usuario);
  }
}
```

### 🎨 Capa de Presentación (`/presentacion` y `/components`)

**Responsabilidad**: Interfaz de usuario y lógica de presentación.

```
presentacion/
├── hooks/              # Custom React Hooks
└── contextos/          # React Context

components/
├── auth/               # Componentes de autenticación
├── dashboard/          # Componentes del dashboard
├── cv/                 # Componentes de CVs
└── ...                 # Otros componentes
```

**Características**:
- ✅ Componentes React
- ✅ Manejo de estado UI
- ✅ Hooks personalizados
- ✅ Contextos de React

**Ejemplo: Hook Personalizado**
```typescript
export function useAnalisisCV() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analizar = async (cv: File, vacante: Vacante) => {
    setCargando(true);
    try {
      // Usar caso de uso
      const resultado = await casoUsoAnalisisCV.ejecutar(cv, vacante);
      return resultado;
    } catch (err) {
      setError(obtenerMensajeError(err));
    } finally {
      setCargando(false);
    }
  };

  return { analizar, cargando, error };
}
```

### 🔄 Capa Compartida (`/compartido`)

**Responsabilidad**: Código utilizado por todas las capas.

```
compartido/
├── constantes/         # Constantes globales
├── errores/            # Clases de error
├── tipos/              # Tipos TypeScript
└── utilidades/         # Funciones de utilidad
```

**Características**:
- ✅ Reutilizable
- ✅ Sin dependencias específicas
- ✅ Utilidades genéricas
- ✅ Tipos compartidos

## Flujo de Datos

### Flujo de una Petición HTTP

```
1. Usuario interactúa con UI
   ↓
2. Componente React llama hook personalizado
   ↓
3. Hook ejecuta caso de uso del dominio
   ↓
4. Caso de uso usa repositorio (interfaz)
   ↓
5. Repositorio concreto accede a Supabase
   ↓
6. Datos regresan transformados como entidades
   ↓
7. Componente actualiza UI
```

### Ejemplo Completo: Crear Usuario

```typescript
// 1. UI Component
function FormularioRegistro() {
  const { registrar } = useAutenticacion();
  
  const handleSubmit = async (datos) => {
    await registrar(datos);
  };
}

// 2. Hook Personalizado
function useAutenticacion() {
  const registrar = async (datos) => {
    const resultado = await casoUsoRegistro.ejecutar(datos);
    if (!resultado.exito) throw resultado.error;
    return resultado.valor;
  };
}

// 3. Caso de Uso
class CasoUsoRegistrarUsuario {
  constructor(
    private repositorioUsuarios: IRepositorioUsuarios
  ) {}

  async ejecutar(datos: DatosRegistro): Promise<Resultado<Usuario>> {
    // Validar
    const validacion = validarDatosRegistro(datos);
    if (!validacion.exito) return fallo(validacion.error);

    // Crear entidad
    const usuario = Usuario.crear({...});

    // Guardar usando repositorio
    return await this.repositorioUsuarios.guardar(usuario);
  }
}

// 4. Repositorio
class RepositorioUsuariosSupabase {
  async guardar(usuario: Usuario): Promise<Resultado<Usuario>> {
    const { error } = await supabase
      .from('user_profiles')
      .insert({...});

    if (error) return fallo(new ErrorInfraestructura(error.message));
    return exito(usuario);
  }
}
```

## Patrones Utilizados

### 1. Repository Pattern
Abstrae el acceso a datos.

```typescript
interface IRepositorioUsuarios {
  obtenerPorId(id: string): Promise<Resultado<Usuario>>;
  guardar(usuario: Usuario): Promise<Resultado<Usuario>>;
}
```

### 2. Value Object Pattern
Objetos inmutables con validación.

```typescript
class Email {
  private constructor(private readonly valor: string) {}

  static crear(email: string): Email {
    if (!esEmailValido(email)) {
      throw new ErrorValidacion('Email inválido');
    }
    return new Email(email);
  }
}
```

### 3. Result Pattern
Manejo explícito de errores sin excepciones.

```typescript
type Resultado<T, E = Error> =
  | { exito: true; valor: T }
  | { exito: false; error: E };
```

### 4. Dependency Injection
Inversión de control para testabilidad.

```typescript
class CasoUsoAnalisisCV {
  constructor(
    private servicioIA: IServicioIA,
    private repositorioCVs: IRepositorioCVs
  ) {}
}
```

### 5. Singleton Pattern
Instancia única de servicios.

```typescript
export class ServicioIA {
  private static instancia: ServicioIA;
  
  static obtenerInstancia(): ServicioIA {
    if (!ServicioIA.instancia) {
      ServicioIA.instancia = new ServicioIA();
    }
    return ServicioIA.instancia;
  }
}
```

## Mejores Prácticas

### Código

1. **Nombres en Español**: Todo el código en español para consistencia
2. **Tipado Fuerte**: Usar TypeScript al máximo
3. **Funciones Pequeñas**: Máximo 20-30 líneas
4. **Sin Magic Numbers**: Usar constantes nombradas
5. **Comentarios JSDoc**: Documentar funciones públicas

### Estructura

1. **Un Archivo, Una Responsabilidad**: Cada archivo una clase/función principal
2. **Index.ts para Exports**: Exportaciones centralizadas
3. **Carpetas por Feature**: Agrupar por funcionalidad
4. **Tests al Lado**: Tests cerca del código que prueban

### Validación

1. **Múltiples Capas**: Validar en UI, aplicación y dominio
2. **Fail Fast**: Validar lo antes posible
3. **Mensajes Claros**: Errores descriptivos y accionables
4. **Objetos de Valor**: Para validaciones de dominio

### Errores

1. **Jerarquía de Errores**: Clases específicas por tipo
2. **Logging Centralizado**: Función única de logging
3. **No Silencios Errores**: Siempre manejar o propagar
4. **Contexto en Errores**: Incluir información útil

## Ejemplo de Implementación Completa

Ver [EJEMPLOS.md](./EJEMPLOS.md) para ejemplos completos de implementación.

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────┐
│           PRESENTACIÓN                  │
│  (UI Components, Hooks, Context)        │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│           APLICACIÓN                    │
│  (DTOs, Validadores, Servicios)         │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│            DOMINIO                      │
│  (Entidades, Casos de Uso, Interfaces)  │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│        INFRAESTRUCTURA                  │
│  (Supabase, IA, Implementaciones)       │
└─────────────────────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│       SERVICIOS EXTERNOS                │
│  (Base de Datos, APIs, Filesystem)      │
└─────────────────────────────────────────┘
```

---

📚 **Recursos Adicionales**:
- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/tags/domain%20driven%20design.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
