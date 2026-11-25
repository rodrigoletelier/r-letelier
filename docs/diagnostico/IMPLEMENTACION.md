# Tourism Growth Index: cómo está construido el diagnóstico

Estado al 25-nov-2026, versión del motor **1.8**. Este documento describe lo que está implementado en el repo `r-letelier` (rodrigoletelier.cl). Está pensado para auditoría: cada regla de puntaje está aquí y en el código citado.

> La carpeta `docs/` está en `.vercelignore`: no se publica en la web.

## 1. Qué hace

El visitante escribe la dirección de su sitio. En unos segundos ve:

- Un índice de 0 a 100 o, si falta evidencia, un "Diagnóstico parcial" sin número.
- Cinco barras, una por área.
- Sus 3 prioridades.
- Un botón "Ver informe completo" que pide su correo y le envía el informe completo. Rodrigo recibe una copia oculta (bcc).

No hay cuestionario. Todo sale de leer el sitio público, igual que lo haría un viajero o Google. El bot se identifica como bot: no se disfraza de navegador.

## 2. Dónde vive cada pieza

| Archivo | Qué hace |
|---|---|
| `api/diagnostico.js` | Lee el sitio y devuelve la lista de chequeos (JSON). Exporta `runDiagnosis` y `analyze`. |
| `api/velocidad.js` | Llama a Google PageSpeed Insights (móvil) con `PAGESPEED_API_KEY` y devuelve puntaje y LCP. |
| `api/informe.js` | POST {email, url, lang, speed}: repite el diagnóstico, calcula el índice y envía el correo por Resend (`RESEND_API_KEY`). |
| `assets/diag-inline.js` | Caja del diagnóstico en la portada (#diagnostico / #diagnostic): formulario, espera, resultado, prioridades y formulario de correo. |
| `diagnostico/index.html`, `en/diagnostic/index.html` | Landing independiente del diagnóstico (ES/EN), con la misma lógica de puntaje en el navegador. |
| `index.html`, `en/index.html` | La caja va al final de la sección Soluciones. Menú y pie enlazan al ancla. |

Variables de entorno en Vercel:
- `PAGESPEED_API_KEY`: Production y Preview.
- `RESEND_API_KEY`: solo Production. El correo solo se puede probar en la web publicada.

## 3. Flujo

1. El navegador llama `GET /api/diagnostico?url=...&lang=es|en` y, en paralelo, `GET /api/velocidad?url=...`. PageSpeed tarda hasta un minuto; mientras tanto se muestra un contador.
2. `runDiagnosis`:
   - Descarga la portada: 6 s de tiempo máximo, y si HTTPS falla, prueba HTTP.
   - Si la respuesta es 5xx, 403 o muy corta (menos de 5.000 bytes), reintenta con un User-Agent más simple. Algunos sitios, como panguechile.com, bloquean el primero.
   - En paralelo descarga:
     - la página de reservas, si está en el mismo dominio;
     - `robots.txt` y `sitemap.xml`;
     - el contenedor de Google Tag Manager, si hay uno;
     - hasta 2 páginas de oferta (rutas tipo /tour, /programa, /habitacion, /project, etc.).
   - Si esas páginas no muestran precios y han pasado menos de 5 s, entra 2 enlaces más profundos.
3. `analyze` devuelve los chequeos. Cada uno tiene:
   - `status`: 1 (bien), 0.75, 0.5 (mejorable), 0 (falta) o `null` (sin evidencia);
   - `w`: peso (el motor de reservas pesa 2, el resto 1);
   - `label` y `detail`.
4. El navegador agrega el chequeo de velocidad y calcula el índice (sección 5).
5. "Ver informe completo" envía `POST /api/informe`, que repite el análisis en el servidor y manda el correo.

Límites:
- diagnóstico: 6 por minuto por IP;
- velocidad: 6 por minuto por IP;
- informe: 3 cada 10 minutos por IP.

Los resultados del diagnóstico se guardan en caché del CDN durante 1 hora.

## 4. Chequeos por área

Peso de cada área en el índice: Visibilidad 25, Reserva directa 25, Propuesta 20, Velocidad y móvil 15, Medición y redes 15.

### Visibilidad en Google y la IA (`visibilidad`)
| id | 1 | 0.5 | 0 |
|---|---|---|---|
| title | título de 15 a 70 caracteres y no genérico | genérico ("Inicio…", "Home…", "Bienvenido…") o largo fuera de rango | sin título |
| desc | meta descripción de 50 a 170 caracteres | demasiado corta o larga | no tiene |
| noindex | (solo aparece si hay problema) | – | la portada tiene `noindex` |
| schema | JSON-LD de tipo turístico (Hotel, LodgingBusiness, TouristTrip, LocalBusiness…) | JSON-LD genérico | no tiene |
| content (nuevo 1.8) | 250 palabras visibles o más | de 120 a 249 | menos de 120. `null` si el sitio se arma con JavaScript |
| h1 | tiene H1 | – | no tiene |
| sitemap | lo encontramos en robots.txt, en /sitemap.xml o en un `<link rel=sitemap>` | – | no lo encontramos |
| lang | hreflang, /en/ o un plugin de traducción | solo un idioma | – |

### Reserva directa (`conversion`)
| id | 1 | 0.5 | 0 / null |
|---|---|---|---|
| engine (peso 2) | motor reconocido: lista `ENGINES`, ~32 motores, Bananadesk agregado en 1.8 | hay un camino a reservar: input de fecha, enlace de reservas o texto "reservar/reservas/book now…" | 0 si no hay nada. `null` si el sitio se arma con JavaScript |
| ota | no enlaza a OTAs | – | enlaza a Booking, Expedia, Airbnb, etc. |
| whatsapp | wa.me, api.whatsapp o un widget conocido | – | no tiene |
| contact | tel:, mailto: o formulario en la portada | – | no tiene |

### Propuesta para el viajero (`propuesta`)
| id | 1 | 0.75 / 0.5 |
|---|---|---|
| offer | enlaces a habitaciones, tours, programas o experiencias | 0.5 si no los encontramos |
| price | precio de referencia en la portada | 0.75 si solo aparece dentro de las páginas de oferta (nuevo 1.7). 0.5 si no aparece |
| reviews | TripAdvisor, Google Maps, testimonios o reseñas | 0.5 si no hay |

### Velocidad y móvil (`rendimiento`)
| id | 1 | 0.5 | 0 |
|---|---|---|---|
| https | sí | – | no |
| viewport | meta viewport | – | no tiene |
| speed | PageSpeed móvil de 90 o más | de 50 a 89 | menos de 50 (`null` si PageSpeed falla) |

### Medición y redes (`tracking`)
| id | 1 | 0.5 | 0 |
|---|---|---|---|
| ga4 | encontramos GA4, también dentro de GTM | – | no lo encontramos (`null` si hay GTM pero no pudimos leerlo) |
| adtags | píxel de Meta y etiqueta de Google Ads | solo uno de los dos | ninguno |
| social | enlaces a Instagram y Facebook | solo uno | ninguno |

"Medición y redes" responde a una pregunta: ¿puede el negocio saber de dónde vienen sus reservas, y puede la publicidad aprender de ellas? En las prioridades, estos puntos aparecen bajo el servicio "Conversión y tecnología" (tarjeta CRO · Tracking · IA). Hasta la versión 1.7 aparecían bajo "Adquisición".

## 5. Cómo se calcula el índice

- **Puntaje de un área** = suma de (`status` × `w`) dividida por la suma de `w`, contando solo los chequeos con evidencia (los que no son `null`). Tiene un **tope de 90 %**: lo que falta solo se puede ver con datos reales de campañas y reservas.
- **Cuándo un área tiene evidencia suficiente:** si tiene al menos 2 chequeos con evidencia y estos son al menos el 70 % de los chequeos del área. Si no, la barra muestra "–".
- **Índice total** = suma de (puntaje del área × peso del área). Solo se muestra si **las 5 áreas** tienen evidencia suficiente. Si falta alguna, el resultado es "Diagnóstico parcial", sin número. Por diseño, el máximo posible es 90.
- **Niveles** (desde 1.8, ajustados al techo de 90):

  | Índice | Nivel |
  |---|---|
  | 75 o más | "Tu web tiene una base sólida" |
  | 50 a 74 | "Vas bien, pero hay fugas" |
  | menos de 50 | "Hay mucho espacio para crecer" |

  Antes de 1.8 los cortes eran 70 y 40.
- **Colores de las barras:** verde desde 70 %, ocre desde 40 %, terracota bajo 40 %.
- **3 prioridades:** chequeos con `status` menor que 1, ordenados por gravedad y luego por la lista `PRIORITY`:

  ```
  noindex, engine, ota, ga4, speed, whatsapp, schema, content, adtags, desc,
  reviews, sitemap, price, offer, contact, lang, title, h1, viewport, https, social
  ```

## 6. Qué NO mide (límites conocidos)

- **Reseñas de Google:** no consultamos Google Business Profile ni el número de reseñas. Solo vemos si el sitio enlaza o muestra reseñas.
- **Posicionamiento real:** no sabemos en qué lugar aparece el sitio en Google ni si una IA lo recomienda. "Visibilidad" mide si el sitio está *preparado* para ser encontrado: título, descripción, schema, texto, sitemap e idiomas.
- **Si el motor funciona:** detectamos que existe un motor (o un camino a reservar), no que la reserva se complete. Un motor roto puntúa igual que uno que funciona.
- **Sitios armados con JavaScript** (Wix, React, etc.): si la portada trae menos de ~600 caracteres de texto sin scripts y no es WordPress, varios chequeos quedan en `null` y el resultado suele ser parcial. Desde 1.8, un WordPress con poco texto ya no se trata como sitio JavaScript: se evalúa como página pobre.
- **Solo la portada**, más unas pocas páginas internas para precios y reservas.
- **Medición:** si GA4 o los píxeles se cargan por un gestor de consentimiento o por scripts de servidor, puede que no los veamos.

## 7. Caso de prueba: ferrari406.cl (25-nov-2026)

Con la versión 1.7 salía "Diagnóstico parcial" y Visibilidad en 50 %, para una página muy pobre. Las causas:

1. Hay ~120 palabras visibles, así que el motor la tomó por un sitio JavaScript. Por eso Reserva directa quedó en "–" y el motor no apareció en las prioridades.
2. "Inicio - Ferrari 406" contaba como título claro.
3. El sitemap automático de WordPress y el schema genérico de Yoast/Elementor sumaban puntos.
4. Bananadesk no estaba en la lista de motores. En todo caso se carga por JavaScript dentro de `#reservas`, así que quizás tampoco se vea en el HTML.

Cambios de 1.8:
- WordPress con poco texto se evalúa normal.
- Nuevo chequeo `content` (cantidad de texto).
- Los títulos genéricos valen 0.5.
- "Reservas" cuenta como camino a reservar.
- Se agregó Bananadesk.
- Nuevos cortes de nivel.

Con un HTML equivalente, el cálculo esperado queda en ~45/100: "Hay mucho espacio para crecer".

## 8. Historial

| Versión | Cambios |
|---|---|
| 1.0 (PR #6) | Diagnóstico automático en /diagnostico, 5 áreas, PageSpeed desde el navegador. |
| 1.1–1.5 (PR #7, #8) | Inglés, caja en la portada, lectura de GTM, motores ampliados. |
| 1.6 (PR #9) | Resultado dentro de la portada, informe por correo (Resend), tope de 90 %, motor con peso 2, reintento con User-Agent simple. |
| 1.7 (PR #10) | Precios dentro de páginas internas (0.75), segundo salto de enlaces, texto visible sin scripts. La caja reemplaza al botón "¿Te recomienda la IA?". |
| 1.8 | Ver sección 7. |

## 9. Preguntas abiertas para la auditoría

1. ¿Los pesos de área (25/25/20/15/15) y del motor (2) reflejan bien lo que más hace perder reservas directas?
2. ¿Conviene sumar Google Business Profile (reseñas y nota) con la API de Places? Tiene costo y requiere otra clave.
3. ¿Debe un sitio sin motor ni WhatsApp ni contacto tener un tope de índice general (por ejemplo, 40)?
4. ¿El umbral de texto (120/250 palabras) es razonable para portadas de lodges, que suelen tener mucha foto?
5. ¿Probar el motor de verdad (abrir el widget y buscar disponibilidad)? Requiere un navegador sin interfaz: más lento y más caro.
