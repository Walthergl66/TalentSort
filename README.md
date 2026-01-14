# 🎯 TalentSort - Sistema de Reclutamiento Inteligente

## 📋 Descripción

TalentSort es una plataforma avanzada de reclutamiento que utiliza inteligencia artificial para analizar CVs, evaluar candidatos y optimizar el proceso de selección de personal. Diseñada con **arquitectura limpia** y **buenas prácticas de desarrollo**.

## 🏗️ Arquitectura

El proyecto sigue los principios de **Clean Architecture** y **Domain-Driven Design (DDD)**, organizando el código en capas bien definidas:

```
src/
├── core/                       # 🎯 Capa de Dominio
│   ├── entidades/             # Entidades del negocio
│   ├── objetos-valor/         # Value Objects inmutables
│   ├── repositorios/          # Interfaces de repositorios
│   └── casos-uso/             # Lógica de negocio
│
├── aplicacion/                # 📊 Capa de Aplicación
│   ├── dtos/                  # Data Transfer Objects
│   ├── validadores/           # Validaciones con Zod
│   └── servicios/             # Servicios de aplicación
│
├── infraestructura/           # 🔧 Capa de Infraestructura
│   ├── base-datos/            # Cliente Supabase
│   ├── repositorios/          # Implementaciones concretas
│   └── servicios-externos/    # Servicios externos (IA, etc.)
│
├── presentacion/              # 🎨 Capa de Presentación
│   ├── hooks/                 # Custom React Hooks
│   └── contextos/             # React Context
│
├── compartido/                # 🔄 Código Compartido
│   ├── constantes/            # Constantes de la aplicación
│   ├── errores/               # Manejo centralizado de errores
│   ├── tipos/                 # Tipos TypeScript compartidos
│   └── utilidades/            # Funciones de utilidad
│
├── components/                # 🧩 Componentes React
└── app/                       # 📱 Next.js App Router
```

### Principios de Arquitectura

1. **Separación de Responsabilidades**: Cada capa tiene una responsabilidad clara
2. **Inversión de Dependencias**: Las capas internas no dependen de las externas
3. **Independencia de Framework**: El dominio es independiente de Next.js/React
4. **Testeable**: Código fácil de probar mediante inyección de dependencias
5. **Mantenible**: Estructura clara y predecible

## 🚀 Características Principales

### ✨ Análisis de CVs con IA
- Extracción automática de texto de PDFs y documentos
- Análisis inteligente comparando CVs con requisitos de vacantes
- Puntuación y ranking automático de candidatos
- Identificación de fortalezas y áreas de mejora

### 👥 Gestión de Candidatos
- Perfiles detallados de candidatos
- Historial de aplicaciones
- Seguimiento del proceso de selección
- Panel de control con métricas

### 💼 Gestión de Vacantes
- Creación y publicación de vacantes
- Requisitos detallados y habilidades requeridas
- Gestión de estados (Abierta, Cerrada, Borrador)
- Análisis masivo de aplicaciones

### 🔐 Sistema de Autenticación
- Registro e inicio de sesión seguro
- Roles diferenciados (Empresa, Candidato, Admin)
- Niveles de suscripción (Gratuito, Profesional, Empresarial)
- Autenticación con Supabase

## 🛠️ Tecnologías

- **Next.js 15** - Framework React con App Router
- **React 19** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utilitarios
- **Supabase** - Base de datos y autenticación
- **IA Railway** - https://chatagent-saborforaneofork-production.up.railway.app

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno (.env.local)
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key
NEXT_PUBLIC_AI_API_URL=https://chatagent-saborforaneofork-production.up.railway.app

# Ejecutar en desarrollo
npm run dev
```

## 📚 Documentación de Arquitectura

Ver [ARQUITECTURA.md](./docs/ARQUITECTURA.md) para detalles completos.

---

⭐ Si este proyecto te resulta útil, considera darle una estrella en GitHub!
