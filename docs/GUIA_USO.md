# 💡 Guía de Uso - Nueva Arquitectura

## Ejemplos Prácticos de Implementación

### 1. 🔍 Usar el Servicio de IA

#### Analizar un CV

```typescript
import { servicioIA } from '@/infraestructura/servicios-externos';

// En un componente o API route
async function analizarCV() {
  try {
    const solicitud = {
      textoCV: "Mi currículum...",
      descripcionPuesto: "Buscamos un desarrollador...",
      habilidadesRequeridas: ["React", "TypeScript", "Node.js"],
      anosExperienciaRequeridos: 3,
      requisitosAdicionales: ["Inglés avanzado"]
    };

    const resultado = await servicioIA.analizarCV(solicitud);

    console.log('Puntuación:', resultado.puntuacion);
    console.log('Fortalezas:', resultado.analisis.fortalezas);
    console.log('Recomendación:', resultado.analisis.recomendacion);

    return resultado;
  } catch (error) {
    console.error('Error al analizar:', error);
    throw error;
  }
}
```

#### Extraer Texto de un CV

```typescript
import { servicioIA } from '@/infraestructura/servicios-externos';

async function procesarArchivo(archivo: File) {
  // Validar archivo
  const validacion = servicioIA.validarArchivoCV(archivo);
  if (!validacion.esValido) {
    alert(validacion.error);
    return;
  }

  // Convertir a base64
  const base64 = await servicioIA.archivoABase64(archivo);

  // Extraer texto
  const resultado = await servicioIA.extraerTextoCV({
    archivoBase64: base64,
    nombreArchivo: archivo.name
  });

  console.log('Texto extraído:', resultado.texto);
  console.log('Páginas:', resultado.metadatos.paginas);
  
  return resultado;
}
```

### 2. 👤 Trabajar con Entidades

#### Crear un Usuario

```typescript
import { Usuario, PropiedadesUsuario } from '@/core/entidades';
import { RolUsuario, NivelSuscripcion } from '@/compartido/tipos/enumeraciones';

function crearNuevoUsuario() {
  try {
    const props: PropiedadesUsuario = {
      id: '123',
      email: 'usuario@ejemplo.com',
      nombreCompleto: 'Juan Pérez',
      nombreEmpresa: 'Mi Empresa SA',
      telefono: '+521234567890',
      rol: RolUsuario.EMPRESA,
      nivelSuscripcion: NivelSuscripcion.PROFESIONAL,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    };

    const usuario = Usuario.crear(props);

    // Usar métodos de negocio
    console.log('¿Es empresa?', usuario.esEmpresa());
    console.log('¿Tiene premium?', usuario.tieneSuscripcionPremium());

    // Actualizar perfil
    usuario.actualizarPerfil({
      nombreCompleto: 'Juan Carlos Pérez',
      telefono: '+521234567891'
    });

    return usuario;
  } catch (error) {
    // Manejará ErrorValidacion si hay problemas
    console.error('Error al crear usuario:', error);
    throw error;
  }
}
```

#### Crear una Vacante

```typescript
import { Vacante, PropiedadesVacante } from '@/core/entidades';
import { EstadoVacante, TipoEmpleo } from '@/compartido/tipos/enumeraciones';

function crearVacante() {
  const props: PropiedadesVacante = {
    id: 'vac-123',
    idEmpresa: 'emp-456',
    titulo: 'Desarrollador Full Stack Senior',
    descripcion: 'Buscamos un desarrollador con amplia experiencia...',
    requisitos: 'Experiencia en React, Node.js, TypeScript...',
    habilidadesRequeridas: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
    anosExperienciaMinimo: 5,
    anosExperienciaMaximo: 10,
    salarioMinimo: 50000,
    salarioMaximo: 80000,
    ubicacion: 'Ciudad de México',
    tipoEmpleo: TipoEmpleo.TIEMPO_COMPLETO,
    estado: EstadoVacante.BORRADOR,
    contadorAplicaciones: 0,
    fechaCreacion: new Date(),
    fechaActualizacion: new Date()
  };

  const vacante = Vacante.crear(props);

  // Publicar la vacante
  vacante.publicar();

  // Verificar estado
  console.log('¿Está abierta?', vacante.estaAbierta());

  return vacante;
}
```

### 3. 🔐 Objetos de Valor

#### Usar Email Validado

```typescript
import { Email } from '@/core/objetos-valor';
import { ErrorValidacion } from '@/compartido/errores';

function validarEmail(emailStr: string) {
  try {
    const email = Email.crear(emailStr);
    console.log('Email válido:', email.obtenerValor());
    return email;
  } catch (error) {
    if (error instanceof ErrorValidacion) {
      console.error('Email inválido:', error.message);
    }
    throw error;
  }
}

// Uso
validarEmail('usuario@ejemplo.com');  // ✅ OK
validarEmail('email-invalido');        // ❌ Lanza ErrorValidacion
```

#### Usar Puntuación

```typescript
import { Puntuacion } from '@/core/objetos-valor';

function evaluarCandidato(score: number) {
  const puntuacion = Puntuacion.crear(score);

  if (puntuacion.esExcelente()) {
    console.log('Candidato excelente!');
  } else if (puntuacion.esBuena()) {
    console.log('Buen candidato');
  } else {
    console.log('No cumple requisitos mínimos');
  }

  return puntuacion.obtenerValor();
}
```

### 4. 🛡️ Manejo de Errores

#### Patrón Result

```typescript
import { Resultado, exito, fallo, ejecutarSeguro } from '@/compartido/errores';

async function operacionSegura(): Promise<Resultado<string, Error>> {
  return ejecutarSeguro(async () => {
    // Código que puede fallar
    const resultado = await servicioIA.analizarCV({...});
    return 'Operación exitosa';
  });
}

// Uso
async function usarOperacion() {
  const resultado = await operacionSegura();

  if (resultado.exito) {
    console.log('Éxito:', resultado.valor);
  } else {
    console.error('Error:', resultado.error.message);
  }
}
```

#### Errores Tipados

```typescript
import {
  ErrorValidacion,
  ErrorAutenticacion,
  ErrorNoEncontrado,
  registrarError
} from '@/compartido/errores';

function manejarDiferentesErrores(error: unknown) {
  if (error instanceof ErrorValidacion) {
    console.log('Error de validación:', error.message);
    console.log('Detalles:', error.detalles);
  } else if (error instanceof ErrorAutenticacion) {
    console.log('Error de autenticación:', error.message);
    // Redirigir a login
  } else if (error instanceof ErrorNoEncontrado) {
    console.log('Recurso no encontrado:', error.message);
    // Mostrar 404
  }

  // Registrar en logs
  registrarError(error as Error, 'MiComponente');
}
```

### 5. 🧰 Utilidades

#### Validaciones

```typescript
import {
  esEmailValido,
  esTelefonoValido,
  esContrasenaSegura,
  sanitizarTexto
} from '@/compartido/utilidades';

function validarFormulario(datos: any) {
  // Validar email
  if (!esEmailValido(datos.email)) {
    throw new Error('Email inválido');
  }

  // Validar teléfono
  if (!esTelefonoValido(datos.telefono)) {
    throw new Error('Teléfono inválido');
  }

  // Validar contraseña
  const { esValida, errores } = esContrasenaSegura(datos.contrasena);
  if (!esValida) {
    throw new Error(`Contraseña débil: ${errores.join(', ')}`);
  }

  // Sanitizar texto
  datos.descripcion = sanitizarTexto(datos.descripcion);

  return datos;
}
```

#### Formato

```typescript
import {
  formatearMoneda,
  formatearFecha,
  formatearBytes,
  formatearPorcentaje
} from '@/compartido/utilidades';

function mostrarDatos() {
  // Formato de moneda
  console.log(formatearMoneda(50000)); // $50,000.00

  // Formato de fecha
  console.log(formatearFecha(new Date(), 'largo')); // 13 de enero de 2026
  console.log(formatearFecha(new Date(), 'relativo')); // hace 2 horas

  // Formato de bytes
  console.log(formatearBytes(1024 * 1024)); // 1.00 MB

  // Formato de porcentaje
  console.log(formatearPorcentaje(85.5)); // 86%
}
```

#### Funciones Asíncronas

```typescript
import {
  reintentar,
  conTimeout,
  debounce,
  throttle
} from '@/compartido/utilidades';

// Reintentar operación
async function operacionConReintentos() {
  return await reintentar(
    async () => {
      const response = await fetch('https://api.ejemplo.com');
      return response.json();
    },
    3,  // 3 intentos
    1000 // 1 segundo entre intentos
  );
}

// Con timeout
async function operacionConTimeout() {
  return await conTimeout(
    fetch('https://api.ejemplo.com'),
    5000, // 5 segundos máximo
    'La operación tardó demasiado'
  );
}

// Debounce para búsqueda
const buscarConDebounce = debounce(async (termino: string) => {
  const resultados = await buscarEnAPI(termino);
  mostrarResultados(resultados);
}, 300);

// Throttle para scroll
const manejarScrollConThrottle = throttle(() => {
  console.log('Scroll detectado');
  cargarMasResultados();
}, 1000);
```

### 6. 🎣 Custom Hooks (Ejemplo)

```typescript
// src/presentacion/hooks/useAnalisisCV.ts
import { useState } from 'react';
import { servicioIA } from '@/infraestructura/servicios-externos';
import { obtenerMensajeError } from '@/compartido/errores';

export function useAnalisisCV() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<any>(null);

  const analizar = async (archivo: File, vacante: any) => {
    setCargando(true);
    setError(null);

    try {
      // Validar archivo
      const validacion = servicioIA.validarArchivoCV(archivo);
      if (!validacion.esValido) {
        throw new Error(validacion.error);
      }

      // Extraer texto
      const base64 = await servicioIA.archivoABase64(archivo);
      const extraccion = await servicioIA.extraerTextoCV({
        archivoBase64: base64,
        nombreArchivo: archivo.name
      });

      // Analizar
      const analisis = await servicioIA.analizarCV({
        textoCV: extraccion.texto,
        descripcionPuesto: vacante.descripcion,
        habilidadesRequeridas: vacante.habilidades,
        anosExperienciaRequeridos: vacante.experienciaMinima
      });

      setResultado(analisis);
      return analisis;

    } catch (err) {
      const mensaje = obtenerMensajeError(err);
      setError(mensaje);
      throw err;
    } finally {
      setCargando(false);
    }
  };

  return {
    analizar,
    cargando,
    error,
    resultado
  };
}
```

### 7. 🔄 API Route Ejemplo

```typescript
// src/app/api/vacantes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Vacante } from '@/core/entidades';
import { registrarError } from '@/compartido/errores';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Crear entidad con validaciones
    const vacante = Vacante.crear({
      ...body,
      id: generarId(),
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    });

    // Guardar usando repositorio
    // const resultado = await repositorioVacantes.guardar(vacante);

    return NextResponse.json({
      exito: true,
      datos: {
        id: vacante.obtenerID(),
        titulo: vacante.obtenerTitulo()
      }
    });

  } catch (error) {
    registrarError(error as Error, 'POST /api/vacantes');

    return NextResponse.json(
      {
        exito: false,
        error: obtenerMensajeError(error)
      },
      { status: 500 }
    );
  }
}
```

### 8. 📱 Componente React Ejemplo

```typescript
// components/vacantes/FormularioVacante.tsx
'use client';

import { useState } from 'react';
import { Vacante } from '@/core/entidades';
import { ErrorValidacion } from '@/compartido/errores';

export default function FormularioVacante() {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    habilidades: []
  });
  const [errores, setErrores] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrores([]);

    try {
      // Crear entidad (esto valida automáticamente)
      const vacante = Vacante.crear({
        ...formData,
        // ... otros campos
      });

      // Enviar a API
      const response = await fetch('/api/vacantes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Vacante creada exitosamente');
      }

    } catch (error) {
      if (error instanceof ErrorValidacion) {
        setErrores([error.message]);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Formulario */}
      {errores.length > 0 && (
        <div className="errores">
          {errores.map((error, i) => (
            <p key={i}>{error}</p>
          ))}
        </div>
      )}
      <button type="submit">Crear Vacante</button>
    </form>
  );
}
```

## 🎓 Mejores Prácticas

1. **Siempre usar las entidades** para crear objetos del dominio
2. **Usar objetos de valor** para datos que requieren validación
3. **Manejar errores con el patrón Result** en operaciones críticas
4. **Usar utilidades compartidas** en lugar de duplicar código
5. **Documentar con JSDoc** todas las funciones públicas
6. **Validar en múltiples capas** (UI, Aplicación, Dominio)
7. **Usar constantes** en lugar de valores mágicos
8. **Registrar errores** con el sistema centralizado

---

Para más información, consulta [ARQUITECTURA.md](./ARQUITECTURA.md)
