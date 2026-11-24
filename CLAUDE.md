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

**Clientes actuales**: Wasai Lodge & Expeditions (Tambopata, Perú), Wildtrip (turismo aventura) y FlashpackerConnect (trekkings por el mundo, viajeros de EE.UU.; caso aún no publicado en la web).

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

1. **Hero** — imagen generada con IA (assets/hero-lodge.jpg): balcón de lodge de lujo en la selva, mujer en bata mirando la niebla sobre las montañas con desayuno servido en primer plano. Object-position ajustado (62% 40%) para que el overlay oscuro caiga sobre la esquina del dormitorio (poco relevante) y deje visible la vista + la mesa. Antes era una foto de stock de una cabaña junto a un lago (07-sep-2026), y antes de eso una foto de Rodrigo en tren. Se cambió a esta imagen (08-sep-2026) porque comunica mejor la experiencia aspiracional del huésped que el hero debe vender — la foto personal de Rodrigo se dejó solo en "Sobre mí". Nota: es una imagen generada con IA, no una foto real ni de ningún cliente — imagen genérica aspiracional, no atribuida a Wasai ni a otro cliente. Bajo los botones va la insignia oficial de Google Partner (assets/google-partner.svg, convertida del PDF oficial), pequeña y sutil. Los logos de Google Ads y Meta Ads van solo en el diagrama de Soluciones, no en las tarjetas.
2. **Problema** — 4 cards sobre fondo verde
3. **Soluciones** (#soluciones, beige) — mapa conceptual animado (dónde busca el viajero: Google, redes, IA → tu sitio → reserva directa), 3 tarjetas verdes con texto claro (todas iguales, no intercaladas): Adquisición (Google/Meta Ads), Visibilidad (SEO + AEO, id #seo-aeo) y Conversión y tecnología (CRO · Tracking · Automatización · IA, id #conversion). Se vende como sistema completo, no herramientas sueltas. AEO sin prometer aparecer en la IA (el SEO ayuda pero no lo garantiza); medición ligada al motor de reservas y al equipo comercial, no solo a consultas, cadena "El SEO no pasó de moda. Cambió de forma." y resumen de lo mensual + "distintos focos para cada mes" (sin numerar meses ni cantidades). CTA WhatsApp
4. **Metodología / Cómo trabajo** (verde) — 4 etapas en línea de tiempo (círculos numerados, sin tarjetas). Debajo, "+ Asesoría constante"
5. **Casos de éxito** (beige, sin sobretítulo) — Wasai y Wildtrip con fotos reales, logos y link "Visitar [sitio] ↗". FlashpackerConnect pendiente hasta que Brandon lo apruebe (assets flashpacker-* ya en /assets/)
6. **Sobre mí** (verde) — texto + foto de Rodrigo en la cordillera (rodrigo-montana-naranja.jpg)
7. **Auditoría de campañas** (#auditoria, beige) — texto + 3 pasos en línea vertical y CTA WhatsApp
8. **FAQ** (verde) — 9 preguntas con acordeón (incluye "¿Qué es el AEO?"). El JSON-LD FAQPage del <head> replica estas preguntas: si cambias una, actualiza ambos
9. **CTA final** (beige) — caja verde con botón WhatsApp + formulario

**Fondos**: alternar siempre beige / verde entre secciones.

**Estilo visual**: preferir mapas conceptuales, íconos y animaciones suaves sobre bloques largos de texto.

## Decisiones de diseño importantes (NO revertir)

- **Una sola foto personal en la web**: foto de Rodrigo en la cordillera en "Sobre mí" (con texto al lado). El hero usa una imagen generada con IA (balcón de lodge, no una foto real ni de Rodrigo) — decisión tomada 07-sep-2026 tras feedback de un consultor de marketing turístico, para que el hero venda la experiencia/problema del cliente y no a Rodrigo. No volver a poner una foto personal en el hero.
- El WhatsApp flotante usa el verde oficial de la marca WhatsApp (`#25D366`), no el verde del sitio — así se reconoce de inmediato como WhatsApp.
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

- No agregar más fotos personales de Rodrigo (evitar yoísmo) — la única foto personal que queda es la de "Sobre mí"
- No inventar métricas ni testimonios
- No usar fotos de stock genéricas para las secciones de Casos (esas llevan fotos reales de los clientes). El hero SÍ usa una foto de stock a propósito (ver "Decisiones de diseño importantes" arriba) — no revertir eso a la foto de Rodrigo en el tren.
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


## Tourism Growth Index (TGI)

### Producto y alcance

Activo tecnológico de Letequinesis bajo la marca personal de Rodrigo Letelier. Un lodge, hotel boutique u operador de experiencias introduce su dominio y obtiene un diagnóstico de su capacidad digital observable para atraer viajeros y facilitar reservas directas. El índice mide señales del sitio en la fecha del análisis. Sus resultados orientan prioridades comerciales y se sustentan en evidencias.

- **Público y gratuito en rodrigoletelier.cl.** Pedir solo el dominio. Mostrar el TGI cuando haya cobertura suficiente, el desglose, las evidencias principales y hasta tres acciones prioritarias. Entregar el diagnóstico sin exigir correo. Ofrecer después una auditoría o reunión mediante una llamada a la acción voluntaria.
- **Profesional y privado.** Usar el mismo motor y la misma rúbrica con acceso autenticado para prospección, reuniones y auditorías. Incorporar evidencias completas, revisión humana y un plan priorizado por impacto cualitativo y esfuerzo. Añadir comparación con competidores e informe PDF en iteraciones posteriores. Mostrar métricas internas autorizadas junto al diagnóstico y mantener comparable el TGI público.

### Rúbrica inicial

| Dimensión | Peso | Indicadores verificables |
| --- | ---: | --- |
| Visibilidad SEO y AEO | 25 % | Directivas de rastreo e indexación en las páginas muestreadas, títulos descriptivos, datos estructurados acordes al contenido visible y respuestas explícitas sobre destino, servicio o logística. Son señales de preparación para búsqueda y respuestas, sin verificar posiciones ni menciones en asistentes. |
| Conversión directa | 25 % | CTA visible en móvil, destino del CTA operativo y camino observable hasta disponibilidad, cotización o contacto directo. Distinguir reserva, WhatsApp/formulario y derivación a intermediarios. |
| Propuesta turística | 20 % | Oferta, destinatario y ubicación identificables. Diferenciadores concretos, itinerario o descripción de estancia, inclusiones y condiciones cuando correspondan. Cada evaluación semántica debe citar el texto que la sustenta. |
| Rendimiento y UX | 15 % | Rendimiento móvil con PageSpeed Insights/Lighthouse, legibilidad y desbordamiento horizontal, navegación y acceso al CTA. Identificar las métricas de laboratorio y las de campo por separado. |
| Ecosistema digital y tracking | 15 % | Enlaces operativos a perfiles oficiales, coherencia de los datos de contacto visibles y presencia observable de etiquetas de medición o mecanismos de consentimiento. La detección de una etiqueta solo acredita la señal observada. |

### Cálculo, evidencia y fuentes

- Versionar un catálogo de indicadores antes de puntuar el piloto. Cada indicador define su fuente, páginas requeridas, criterios de cumplimiento y estados aplicables. Para el MVP, usar igual peso dentro de cada dimensión y valores de 1, 0,5 o 0 según la rúbrica. Reservar el 0 para incumplimientos comprobados con el alcance de inspección requerido. Registrar aparte «no evaluable» por bloqueo, error o falta de evidencia, y «no aplica» cuando la rúbrica lo justifique.
- Calcular la cobertura de cada dimensión como indicadores evaluados sobre aplicables. Calcular su nota sobre los evaluados y publicarla solo con al menos dos indicadores evaluados y 70 % de cobertura. Publicar el TGI únicamente si las cinco dimensiones son evaluables. El total es la suma de sus notas de 0 a 100 multiplicadas por los pesos de la tabla. Redondear al final y mostrar fecha, cobertura y versión. Ante cobertura insuficiente, entregar observaciones parciales sin TGI.
- Registrar por observación la URL, fecha, fuente, indicador, estado y fragmento, selector o medición que permita verificarla. Empezar por la portada y hasta cuatro páginas públicas relevantes de oferta, reserva y contacto. Usar HTML, cabeceras, robots.txt, sitemap, datos estructurados, render móvil y enlaces públicos. Consultar PageSpeed Insights cuando esté disponible. Registrar límites y errores por fuente y respetar las restricciones de rastreo.
- La IA puede clasificar texto según una rúbrica explícita y explicar hallazgos con referencias a evidencias registradas. Validar esas referencias y usar cálculo determinista. Ante evidencia ambigua, marcar el indicador como no evaluable o enviarlo a revisión profesional.
- Un dominio público no permite determinar tráfico real, reservas, tasa de conversión, ingresos, ROAS ni atribución. La vista privada puede incluir datos de Search Console, GA4, plataformas publicitarias y motor de reservas con autorización del titular, indicando fuente y periodo. Una consulta por WhatsApp se distingue de una venta confirmada.

### Arquitectura y MVP

- Mantener el front-end HTML/CSS/JS del proyecto. Proponer un servicio servidor separado del navegador para validar el dominio, encolar el análisis, recolectar evidencias, calcular el índice y devolver el estado y el informe mediante un identificador opaco. Guardar dominio normalizado, estado, fecha, versión, cobertura y evidencias mínimas. Definir caducidad y cachear por dominio y versión según la vigencia de los datos.
- Limitar solicitudes, tiempo, tamaño y páginas por ejecución. Admitir solo destinos HTTP(S) públicos y volver a validarlos en cada redirección, con bloqueo de redes privadas y locales. Mantener claves en servidor, tratar el contenido rastreado como datos, y exigir autorización de servidor para expedientes profesionales. Mantener diagnósticos fuera de índices públicos y expedientes privados fuera de las respuestas de la API pública.
- Construir primero un piloto fuera de producción con un alojamiento y un operador de experiencias. Usar dominios autorizados para el piloto y revisión manual de evidencias y recomendaciones. Validar el flujo gratuito y una vista profesional mínima autenticada con el mismo análisis. Dejar PDF, benchmarks, conectores privados e integración comercial automatizada para después del piloto. Cualquier despliegue a producción requiere autorización de Rodrigo.

### Captación y benchmark futuro

Ofrecer una reunión o auditoría después del resultado. Si el visitante solicita contacto, guardar solo los datos necesarios con su consentimiento y vincularlos al diagnóstico internamente. Medir análisis iniciados y completados, diagnósticos con cobertura suficiente y solicitudes voluntarias. En prospección, revisar los hallazgos antes de usar el informe en reuniones. La herramienta pública es gratuita y la oportunidad comercial está en el trabajo posterior.

Crear un benchmark solo con diagnósticos autorizados para ese fin. Agrupar por segmento y, cuando el tamaño lo permita, por mercado. Comparar versiones y coberturas equivalentes, deduplicar dominios, publicar periodo, tamaño y sesgos de muestra, y suprimir cohortes pequeñas. Con muestra suficiente, evaluar medianas y cuartiles agregados para lodges, hoteles boutique, operadores de aventura y ecoturismo, y un eventual informe regional.

### Criterios de aceptación del MVP

- [ ] Un dominio válido basta para iniciar el flujo gratuito y consultar su estado. Entradas inválidas o restringidas muestran un mensaje claro. El informe se puede consultar sin entregar correo.
- [ ] El resultado muestra evidencias trazables, alcance, fecha, cobertura y versión. Con las mismas evidencias y versión, ambas vistas calculan el mismo TGI con pesos 25/25/20/15/15.
- [ ] Las pruebas cubren rastreo bloqueado, respuestas lentas, redirecciones a destinos no permitidos y fallas de PageSpeed. La cobertura insuficiente entrega un diagnóstico parcial y omite la nota global.
- [ ] Las recomendaciones se vinculan a observaciones verificables. El informe distingue señales, estimaciones y métricas privadas autorizadas. La vista profesional exige autenticación y sus datos se mantienen fuera del flujo público.
- [ ] Ambos tipos de negocio completan el piloto y un revisor puede reproducir el cálculo y comprobar los hallazgos con las fuentes registradas. La publicación queda sujeta a autorización.
