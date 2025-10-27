Accesibilidad — componente reutilizable

Instrucciones rápidas:

- Envolver la aplicación con `AccessibilityProvider` y montar `AccessibilityMenu` en `layout.tsx` para que esté disponible en todas las páginas.
- `useAccessibility()` exporta estado y funciones: `state`, `setState`, `reset`, `speakPage`.
- Las opciones se persisten en `localStorage` bajo la clave `a11y:settings`.

Opciones implementadas (mapeadas a pautas WCAG 2.2):
- Alto contraste (1.4.3)
- Escala de fuente / tamaño de texto (1.4.4)
- Espaciado de texto (1.4.12)
- Foco visible / navegación por teclado (2.4.7, 2.1.1)
- Reducir animaciones (2.2.2)
- Botones grandes / objetivo (2.5.5)
- Lectura por voz (TTS) (3.1.5 / usabilidad)
- Subtítulos / transcripciones (toggle, debe integrarse con reproductores)

Nueva opción:
- Leer al pasar el cursor (hover-to-speak): cuando se activa junto con TTS, el sistema leerá el texto del elemento sobre el que pase el cursor del ratón. Esto se implementa con un listener `pointerover` y la Web Speech API. Se evita leer el propio menú y hay un pequeño debounce para no repetir lectura innecesaria.

Alto contraste y foco visible aplicados a toda la página:
- Cuando activas "Alto contraste" en el menú, la clase `.a11y-high-contrast` se añade al elemento `html` y hay reglas CSS específicas que forzan colores de fondo/primer plano altos en enlaces, botones, inputs y otras regiones comunes para mejorar la legibilidad en toda la página.
- Cuando activas "Navegación por teclado" se añade `.a11y-keyboard-nav` y las reglas de foco visible se aplican globalmente (outline y sombra) para asegurar que el foco sea perceptible en enlaces, botones, campos de formulario y otros elementos interactivos.

Recomendación: algunos componentes o librerías pueden tener estilos específicos que oculten el foco por defecto; si ocurre, añade la clase `a11y-keyboard-nav` como ancestro o asegúrate de que los selectores no estén más específicos que las reglas introducidas aquí. Si quieres, puedo adaptar estos estilos a Tailwind o a tu sistema de diseño para mayor consistencia.

Niveles de contraste:
- El menú ahora permite elegir `Suave`, `Medio` o `Alto`. Cada preset ajusta fondo, color de texto y color de acento para mantener una buena relación de contraste sin que el resultado sea visualmente agresivo.
- Recomendación: prueba los tres niveles en pantallas con diferentes condiciones de iluminación. `Medio` es un buen punto de partida; `Alto` es útil en situaciones de lectura con luz intensa o para usuarios con requisitos de contraste máximo.

Notas:
- Algunas funciones (subtítulos automáticos, intérprete en lengua de señas o transcripciones precisas) requieren integración con el reproductor de video o servicios externos. Este componente ofrece toggles y banderas que esos reproductores pueden leer para habilitar funciones específicas.
