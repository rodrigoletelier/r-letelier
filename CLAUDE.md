# Rodrigo Letelier — Marketing Turístico

Contexto del proyecto para Claude Code. Leer al inicio de cada sesión.

## Quién es Rodrigo

Rodrigo Letelier es administrador en ecoturismo con 8 años de experiencia en marketing digital. Está construyendo su marca personal como **especialista en marketing turístico para Latinoamérica**, enfocado en:

- Lodges
- Hoteles boutique
- Experiencias turísticas de naturaleza

## Posicionamiento

**Promesa**: más reservas directas para empresas turísticas, menos dependencia de OTAs.

**Diferenciador**: "Turismo primero, marketing después." Su formación en ecoturismo le permite entender la venta de experiencias turísticas desde adentro, no solo desde la plataforma de publicidad.

**Mercado**: empresas turísticas en distintos países de Latinoamérica. Trabaja desde Chile pero apunta internacionalmente. Trabaja en español e inglés.

**Clientes actuales**: Wasai Lodge & Expeditions (Tambopata, Perú) y Wildtrip (turismo aventura).

## Stack técnico

- **HTML + CSS + vanilla JS** en un solo archivo (`index.html`)
- Sin frameworks, sin build process
- Fuentes: Fraunces (serif, para titulares) e Inter (sans, cuerpo) — vía Google Fonts
- Imágenes en `/assets/` (webp y jpg)
- Animaciones CSS suaves, sin librerías externas

## Hosting y dominios

- **Hosting**: Vercel (cuenta personal de Rodrigo)
- **Repositorio GitHub**: `r-letelier` (en cuenta personal)
- **URL temporal**: la que asigne Vercel al hacer el nuevo deploy
- **Dominio final**: rodrigoletelier.cl (registrado en NIC.cl, pendiente conectar a Vercel)

## Paleta de colores

```css
--green-950: #071a13;   /* verde más profundo, fondos oscuros */
--green-900: #0d2b20;
--green-800: #143d2d;
--green-700: #1f4d3a;
--green-500: #6f9464;   /* verde botones / acentos */
--sage:      #a6b891;   /* verde salvia, eyebrows */
--sand:      #f4f0e8;   /* fondo principal claro */
--sand-2:    #ebe3d5;   /* beige secundario */
--ink:       #1e2420;   /* texto principal */
--muted:     #657168;   /* texto secundario */
```

## Estructura de secciones

1. **Hero** — foto de Rodrigo en tren panorámico como background, overlay verde oscuro (gradiente diagonal) para legibilidad del texto.
2. **Problema** — 4 cards sobre fondo verde
3. **Servicios** — 4 servicios numerados
4. **Metodología** — proceso de 4 etapas (diagnóstico, estrategia, activación, optimización)
5. **Casos** — Wasai y Wildtrip con fotos reales y logos
6. **Stack & capacidades** — 6 cards de herramientas
7. **Sobre mí** — texto + foto de Rodrigo en la cordillera (rodrigo-montana-naranja.jpg)
8. **FAQ** — 6 preguntas con acordeón
9. **CTA final** — caja verde con botón WhatsApp

## Decisiones de diseño importantes (NO revertir)

- **Dos fotos personales en la web**: foto del tren panorámico en el hero (background con overlay) y foto en la cordillera en "Sobre mí" (con texto al lado).
- **Marca personal**, no estudio. Esto puede cambiar a futuro pero por ahora es Rodrigo Letelier como persona.
- **Sin métricas atribuibles**. Rodrigo tiene pocos clientes y prefiere no exponer datos privados. Mostramos capacidades, no números.
- **Tono profesional pero cálido**. Nada de jerga de agencia, nada de promesas exageradas tipo "10x ROI".

## Contacto

- WhatsApp: +56 9 6617 0884 (formato URL: `wa.me/56966170884`)
- Email: hola@rodrigoletelier.cl

## Lo que falta / próximos pasos

- **Conectar dominio rodrigoletelier.cl a Vercel** (apuntar DNS desde NIC.cl)
- **Testimonios** de Wasai y Wildtrip cuando estén disponibles
- **Sección de resultados/métricas** cuando Rodrigo tenga más casos o pueda exponer datos
- **Email hola@rodrigoletelier.cl** — configurar cuando el dominio esté listo
- **Versión en inglés** cuando empiece a apuntar a mercados internacionales con más fuerza
- **Blog o recursos** para SEO orgánico de palabras clave como "marketing turístico", "reservas directas hotel", etc.

## Lo que NO hacer

- No agregar más fotos personales de Rodrigo (evitar yoísmo)
- No inventar métricas ni testimonios
- No usar fotos de stock genéricas
- No prometer resultados específicos sin respaldo
- No revertir la marca a "Reserve Atelier" — ese fue un nombre anterior, ya descartado

## Convenciones de código

- Indentación: 2 espacios
- Comentarios mínimos en HTML (el código se explica solo)
- CSS organizado por secciones con comentarios `/* === SECCIÓN === */`
- IDs en kebab-case (`#sobre-mi`, `#casos`)
- Clases en kebab-case (`.problem-card`, `.case-image`)

## Tono de voz para copy

- Directo y claro, sin jerga de agencia
- Cálido pero profesional
- Frases cortas
- Verbos en presente
- Sin superlativos ("la mejor", "incomparable") ni clichés ("transformar tu negocio")
- Hablar de "viajeros", "huéspedes", "experiencias" — no de "users", "leads", "funnels"
