const dns = require('dns').promises;
const net = require('net');

const UA = 'Mozilla/5.0 (compatible; RLDiagnostico/1.0; +https://www.rodrigoletelier.cl/diagnostico/)';
const UA_PLAIN = 'RLDiagnostico/1.0 (+https://www.rodrigoletelier.cl/diagnostico/)';
const MAX_BYTES = 1500000;
const hits = new Map();

const ENGINES = [
  ['Cloudbeds', /cloudbeds\.com/],
  ['SiteMinder', /siteminder|thebookingbutton|direct-book\.com/],
  ['Little Hotelier', /littlehotelier/],
  ['Mews', /mews\.(com|li)\/(distributor|booking)|mews-distributor|app\.mews\.com/],
  ['SynXis', /synxis\.com/],
  ['iHotelier', /ihotelier|travelclick/],
  ['Bookassist', /bookassist/],
  ['Simple Booking', /simplebooking/],
  ['Beds24', /beds24\.com/],
  ['Lodgify', /lodgify\.com/],
  ['Hostaway', /hostaway/],
  ['Guesty', /guesty/],
  ['Avirato', /avirato/],
  ['Roiback', /roiback/],
  ['HotelRunner', /hotelrunner/],
  ['Sirvoy', /sirvoy/],
  ['ResNexus', /resnexus/],
  ['WebRezPro', /webrezpro/],
  ['Omnibees', /omnibees/],
  ['Asksuite', /asksuite/],
  ['Motor de reservas WordPress', /motopress|wp-hotel-booking|hbook|vikbooking|mphb-/],
  ['Wix Hotels', /wix-hotels|hotels\.wixapps/],
  ['FareHarbor', /fareharbor\.com/],
  ['Bókun', /bokun\.(io|is)|widgets\.bokun/],
  ['Rezdy', /rezdy\.com/],
  ['Checkfront', /checkfront\.com/],
  ['Peek', /peek\.com\/|book\.peek/],
  ['Xola', /xola\.com/],
  ['TrekkSoft', /trekksoft/],
  ['Regiondo', /regiondo/],
  ['WeTravel', /wetravel\.com/],
  ['TourCMS', /tourcms/],
  ['Turitop', /turitop/]
];
const OTAS = [
  ['Booking.com', /href=["'][^"']*booking\.com\/hotel/],
  ['Expedia', /href=["'][^"']*expedia\./],
  ['Airbnb', /href=["'][^"']*airbnb\.[a-z.]+\/rooms/],
  ['Hotels.com', /href=["'][^"']*hotels\.com\/ho/],
  ['Despegar', /href=["'][^"']*despegar\./],
  ['GetYourGuide', /href=["'][^"']*getyourguide\./],
  ['Viator', /href=["'][^"']*viator\.com/]
];

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const p = ip.split('.').map(Number);
    return p[0] === 10 || p[0] === 127 || p[0] === 0 ||
      (p[0] === 169 && p[1] === 254) ||
      (p[0] === 172 && p[1] >= 16 && p[1] <= 31) ||
      (p[0] === 192 && p[1] === 168) ||
      (p[0] === 100 && p[1] >= 64 && p[1] <= 127) ||
      p[0] >= 224;
  }
  const v = ip.toLowerCase();
  if (v.startsWith('::ffff:')) return isPrivateIp(v.slice(7));
  return v === '::1' || v === '::' || v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe80');
}

async function assertPublic(u) {
  if (!/^https?:$/.test(u.protocol)) throw new Error('bad_url');
  if (u.port && !['80', '443'].includes(u.port)) throw new Error('bad_url');
  const host = u.hostname;
  if (!host.includes('.') || /\.(local|internal|localhost)$/i.test(host)) throw new Error('bad_url');
  if (net.isIP(host)) throw new Error('bad_url');
  const addrs = await dns.lookup(host, { all: true });
  if (!addrs.length || addrs.some((a) => isPrivateIp(a.address))) throw new Error('bad_url');
}

async function safeFetch(start, timeoutMs, wantBody = true, ua = UA) {
  let url = new URL(start);
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    for (let hop = 0; hop < 5; hop++) {
      await assertPublic(url);
      const r = await fetch(url, { redirect: 'manual', signal: ctrl.signal, headers: { 'User-Agent': ua, Accept: 'text/html,*/*;q=0.8', 'Accept-Language': 'es,en;q=0.8' } });
      if (r.status >= 300 && r.status < 400 && r.headers.get('location')) {
        url = new URL(r.headers.get('location'), url);
        continue;
      }
      if (!wantBody) return { status: r.status, url: url.href, body: '' };
      const reader = r.body ? r.body.getReader() : null;
      let size = 0;
      const chunks = [];
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.length;
          chunks.push(value);
          if (size > MAX_BYTES) { ctrl.abort(); break; }
        }
      }
      return { status: r.status, url: url.href, body: Buffer.concat(chunks.map((c) => Buffer.from(c))).toString('utf8') };
    }
    throw new Error('too_many_redirects');
  } finally {
    clearTimeout(t);
  }
}

function meta(html, name) {
  const re = new RegExp('<meta[^>]+(?:name|property)=["\']' + name + '["\'][^>]*>', 'i');
  const tag = (html.match(re) || [])[0];
  if (!tag) return null;
  const c = tag.match(/content=["']([^"']*)["']/i);
  return c ? c[1].trim() : '';
}

function textOf(s) {
  return (s || '').replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (m, n) => String.fromCharCode(+n))
    .replace(/\s+/g, ' ').trim();
}

function findBookingLink(html, base) {
  const re = /<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const href = m[1];
    const label = textOf(m[2]).toLowerCase();
    if (/^(mailto|tel|javascript|whatsapp):/i.test(href)) continue;
    if (/reserv|book|disponib|availability|tarifas|rates/.test(href.toLowerCase() + ' ' + label)) {
      try {
        const u = new URL(href, base);
        if (/^https?:$/.test(u.protocol)) return u.href;
      } catch (e) { /* ignore */ }
    }
  }
  return null;
}

function findOfferLinks(html, base, skip) {
  const re = /<a\b[^>]*href=["']([^"'#]+)["']/gi;
  const out = [];
  let m;
  while ((m = re.exec(html)) && out.length < 2) {
    try {
      const u = new URL(m[1], base);
      if (u.hostname !== base.hostname || u.href === base.href || u.href === skip) continue;
      if (/\/(project|proyecto|tours?|programas?|programs?|experiencias?|experiences?|excursion|habitacion|rooms?|suites?|paquetes?|packages?|trek|expedic|viajes?|trips?|actividades|activities)/i.test(u.pathname) && !out.includes(u.href)) out.push(u.href);
    } catch (e) { /* ignore */ }
  }
  return out;
}

const EN = {
  'Precios solo dentro de cada programa': 'Prices only inside each program page',
  'Un "desde USD X" en la portada ayuda al viajero a decidir antes de hacer clic.': 'A "from USD X" on your home page helps travelers decide before they click.',
  'Motor de reservas detectado': 'Booking engine detected',
  'Hay un camino a reservar, pero no identificamos el motor': 'There is a path to book, but we could not identify the engine',
  'Revisa que el viajero pueda ver disponibilidad y pagar sin salir de tu marca.': 'Make sure travelers can check availability and pay without leaving your brand.',
  'Motor de reservas: tu sitio carga con JavaScript y no pudimos verlo': 'Booking engine: your site loads with JavaScript and we could not see it',
  'No encontramos un motor de reservas': 'We found no booking engine',
  'El viajero no ve cómo reservar o pagar directo en tu sitio.': 'Travelers cannot see how to book or pay directly on your site.',
  'Tu sitio envía viajeros a OTAs': 'Your site sends travelers to OTAs',
  'Enlaces a OTAs: no pudimos verlo (sitio cargado con JavaScript)': 'OTA links: we could not check (site loads with JavaScript)',
  'No envía viajeros a OTAs': 'Does not send travelers to OTAs',
  'Botón de WhatsApp': 'WhatsApp button',
  'WhatsApp: no pudimos verlo (sitio cargado con JavaScript)': 'WhatsApp: we could not check (site loads with JavaScript)',
  'Sin botón de WhatsApp': 'No WhatsApp button',
  'Muchos viajeros latinoamericanos prefieren consultar por WhatsApp antes de reservar.': 'Many travelers prefer to ask a quick question on WhatsApp before they book.',
  'Teléfono, correo o formulario visibles': 'Phone, email or form visible',
  'Contacto: no pudimos verlo (sitio cargado con JavaScript)': 'Contact details: we could not check (site loads with JavaScript)',
  'No encontramos datos de contacto directo': 'We found no direct contact details',
  'El viajero con dudas no tiene cómo preguntarte sin salir del sitio.': 'A traveler with questions has no way to ask you without leaving the site.',
  'Oferta identificable (habitaciones, tours o programas)': 'Clear offer (rooms, tours or programs)',
  'No encontramos páginas de habitaciones, tours o programas': 'We found no pages for rooms, tours or programs',
  'Cuesta entender qué vendes y qué incluye.': 'It is hard to tell what you sell and what is included.',
  'Precios o tarifas de referencia visibles': 'Reference prices or rates visible',
  'No vimos precios de referencia': 'We saw no reference prices',
  'Un "desde USD X" ayuda al viajero a decidir y filtra consultas.': 'A "from USD X" helps travelers decide and filters inquiries.',
  'Reseñas o testimonios': 'Reviews or testimonials',
  'No vimos reseñas ni testimonios en tu portada': 'We saw no reviews or testimonials on your home page',
  'La confianza es clave para reservar directo y no en una OTA.': 'Trust is what makes travelers book direct instead of on an OTA.',
  'Encontrado dentro de Google Tag Manager.': 'Found inside Google Tag Manager.',
  'Google Analytics 4: no pudimos leer tu Google Tag Manager': 'Google Analytics 4: we could not read your Google Tag Manager',
  'No encontramos Google Analytics 4': 'We found no Google Analytics 4',
  'Sin analítica no sabes de dónde llegan tus reservas.': 'Without analytics you cannot tell where your bookings come from.',
  'Píxel de Meta y etiqueta de Google Ads': 'Meta pixel and Google Ads tag',
  'Tus campañas pueden aprender de las reservas.': 'Your campaigns can learn from bookings.',
  'Píxel de Meta, pero sin etiqueta de Google Ads': 'Meta pixel, but no Google Ads tag',
  'Etiqueta de Google Ads, pero sin píxel de Meta': 'Google Ads tag, but no Meta pixel',
  'Sin ella, Google Ads no sabe qué clics terminan en reserva.': 'Without it, Google Ads cannot tell which clicks turn into bookings.',
  'Sin píxel, Instagram y Facebook no aprenden de quienes reservan.': 'Without the pixel, Instagram and Facebook cannot learn from the people who book.',
  'Etiquetas de publicidad: no pudimos leer tu Google Tag Manager': 'Ad tags: we could not read your Google Tag Manager',
  'Sin píxel de Meta ni etiqueta de Google Ads': 'No Meta pixel and no Google Ads tag',
  'Tus campañas no pueden saber qué anuncios traen reservas.': 'Your campaigns cannot tell which ads bring bookings.',
  'Enlaces a Instagram y Facebook': 'Links to Instagram and Facebook',
  'Solo un perfil social enlazado': 'Only one social profile linked',
  'Sin enlaces a redes sociales': 'No links to social media',
  'La página no tiene título': 'The page has no title',
  'Título poco descriptivo': 'Title is not descriptive',
  'Título claro': 'Clear title',
  'Sin meta descripción': 'No meta description',
  'Google inventa el texto que muestra bajo tu enlace.': 'Google makes up the text it shows under your link.',
  'Meta descripción muy corta o muy larga': 'Meta description too short or too long',
  'Meta descripción': 'Meta description',
  'La portada pide no aparecer en Google (noindex)': 'Your home page asks Google not to index it (noindex)',
  'Es urgente revisarlo.': 'This needs fixing urgently.',
  'Datos estructurados (schema)': 'Structured data (schema)',
  'Ayudan a Google y a los asistentes de IA a entender qué ofreces.': 'It helps Google and AI assistants understand what you offer.',
  'Datos estructurados genéricos': 'Generic structured data',
  'No describen tu alojamiento o experiencia.': 'It does not describe your lodging or experience.',
  'Sin datos estructurados': 'No structured data',
  'Google y la IA tienen menos información para recomendarte.': 'Google and AI assistants have less information to recommend you.',
  'Título principal (H1)': 'Main heading (H1)',
  'Sin título principal (H1)': 'No main heading (H1)',
  'Sitemap para Google': 'Sitemap for Google',
  'No encontramos sitemap': 'We found no sitemap',
  'Ayuda a Google a encontrar todas tus páginas.': 'It helps Google find all your pages.',
  'Versión en otro idioma': 'Version in another language',
  'Solo un idioma': 'Only one language',
  'Si recibes viajeros extranjeros, una versión en inglés amplía tu alcance.': 'If you host travelers from abroad, a second language widens your reach.',
  'Sitio seguro (HTTPS)': 'Secure site (HTTPS)',
  'El sitio no usa HTTPS': 'The site does not use HTTPS',
  'Los navegadores lo marcan como "no seguro".': 'Browsers flag it as "not secure".',
  'Preparado para móvil': 'Mobile-ready',
  'No está adaptado a móvil': 'Not adapted for mobile',
  'La mayoría de los viajeros busca desde el teléfono.': 'Most travelers search from their phone.'
};

function toEnglish(s) {
  if (!s) return s;
  if (EN[s]) return EN[s];
  const ota = s.match(/^Enlaces a (.+)\. Cada reserva por ahí paga comisión\.$/);
  if (ota) return 'Links to ' + ota[1] + '. Every booking there pays a commission.';
  return s;
}

const WA_WIDGETS = /wp-whatsapp|njt-whatsapp|nta-wa-|joinchat|ht-ctc|click-to-chat|whatsapp-button|getbutton\.io|wati\.io|elfsight[^"']{0,40}whatsapp|whatsapp-widget|qlwapp|creame-whatsapp|floating-whatsapp|wa-chat-widget|whatsapp-chat/i;

const WEIGHT = { engine: 2 };

function check(id, area, status, label, detail) {
  return { id, area, status, label, detail, w: WEIGHT[id] || 1 };
}

function analyze(html, extraHtml, ctx) {
  const lower = html.toLowerCase();
  const tags = (lower + ' ' + (ctx.gtmJs || '').toLowerCase());
  const gtmRead = !!ctx.gtmJs;
  const all = (html + ' ' + (extraHtml || '')).toLowerCase();
  const out = [];

  const engine = ENGINES.find(([, re]) => re.test(all));
  const dateInputs = /<input[^>]+type=["']date["']/i.test(all);
  const bookingLinkExternal = ctx.bookingLink && new URL(ctx.bookingLink).hostname !== ctx.host;
  const bookText = /book now|book your stay|check availability|reserva ahora|reservar ahora|ver disponibilidad|consultar disponibilidad|reserve now|reservar/.test(textOf(all).toLowerCase());
  const jsRendered = textOf(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, '')).length < 600;
  if (engine) out.push(check('engine', 'conversion', 1, 'Motor de reservas detectado', engine[0]));
  else if (dateInputs || bookingLinkExternal || ctx.bookingLink || bookText) out.push(check('engine', 'conversion', 0.5, 'Hay un camino a reservar, pero no identificamos el motor', 'Revisa que el viajero pueda ver disponibilidad y pagar sin salir de tu marca.'));
  else if (jsRendered) out.push(check('engine', 'conversion', null, 'Motor de reservas: tu sitio carga con JavaScript y no pudimos verlo', ''));
  else out.push(check('engine', 'conversion', 0, 'No encontramos un motor de reservas', 'El viajero no ve cómo reservar o pagar directo en tu sitio.'));

  const otas = OTAS.filter(([, re]) => re.test(all)).map(([n]) => n);
  out.push(otas.length
    ? check('ota', 'conversion', 0, 'Tu sitio envía viajeros a OTAs', 'Enlaces a ' + otas.join(', ') + '. Cada reserva por ahí paga comisión.')
    : jsRendered ? check('ota', 'conversion', null, 'Enlaces a OTAs: no pudimos verlo (sitio cargado con JavaScript)', '') : check('ota', 'conversion', 1, 'No envía viajeros a OTAs', ''));

  const wa = /wa\.me\/|api\.whatsapp\.com|whatsapp:\/\/|web\.whatsapp\.com\/send/.test(all) || WA_WIDGETS.test(html);
  out.push(wa ? check('whatsapp', 'conversion', 1, 'Botón de WhatsApp', '') : jsRendered ? check('whatsapp', 'conversion', null, 'WhatsApp: no pudimos verlo (sitio cargado con JavaScript)', '') : check('whatsapp', 'conversion', 0, 'Sin botón de WhatsApp', 'Muchos viajeros latinoamericanos prefieren consultar por WhatsApp antes de reservar.'));

  const contact = /href=["'](tel:|mailto:)|<form[\s>]/.test(all);
  out.push(contact ? check('contact', 'conversion', 1, 'Teléfono, correo o formulario visibles', '') : jsRendered ? check('contact', 'conversion', null, 'Contacto: no pudimos verlo (sitio cargado con JavaScript)', '') : check('contact', 'conversion', 0, 'No encontramos datos de contacto directo', 'El viajero con dudas no tiene cómo preguntarte sin salir del sitio.'));

  const offer = /href=["'][^"']*(habitacion|rooms?|suites?|villas?|tents?|casitas?|cabins?|cabanas|cabañas|accommodation|alojamiento|stay|tours?|experiencias|experiences|programas|expedici|itinerar|paquetes|packages|actividades|activities)/.test(all);
  out.push(offer ? check('offer', 'propuesta', 1, 'Oferta identificable (habitaciones, tours o programas)', '') : check('offer', 'propuesta', 0.5, 'No encontramos páginas de habitaciones, tours o programas', 'Cuesta entender qué vendes y qué incluye.'));
  const PRICE = /(usd|us\$|clp|€|eur|\$)\s?\d{2,3}([.,]\d{3})*|desde\s+\$|from\s+\$|per night|por noche|por persona|per person/;
  const price = PRICE.test(textOf(all).toLowerCase());
  const innerPrice = !price && ctx.offerHtml && PRICE.test(textOf(ctx.offerHtml).toLowerCase());
  out.push(price ? check('price', 'propuesta', 1, 'Precios o tarifas de referencia visibles', '')
    : innerPrice ? check('price', 'propuesta', 0.75, 'Precios solo dentro de cada programa', 'Un "desde USD X" en la portada ayuda al viajero a decidir antes de hacer clic.')
      : check('price', 'propuesta', 0.5, 'No vimos precios de referencia', 'Un "desde USD X" ayuda al viajero a decidir y filtra consultas.'));
  const reviews = /tripadvisor\.|google\.com\/maps|g\.page|testimoni|reseñas|opiniones|reviews|guest stories/.test(all);
  out.push(reviews ? check('reviews', 'propuesta', 1, 'Reseñas o testimonios', '') : check('reviews', 'propuesta', 0.5, 'No vimos reseñas ni testimonios en tu portada', 'La confianza es clave para reservar directo y no en una OTA.'));

  const gtm = /googletagmanager\.com\/gtm\.js|gtm-[a-z0-9]{4,}/.test(lower);
  const hidden = gtm && !gtmRead;
  const ga4 = /gtag\/js\?id=g-|['"]g-[a-z0-9]{6,}['"]|\bg-[a-z0-9]{8,10}\b/.test(tags);
  out.push(ga4 ? check('ga4', 'tracking', 1, 'Google Analytics 4', gtmRead ? 'Encontrado dentro de Google Tag Manager.' : '')
    : hidden ? check('ga4', 'tracking', null, 'Google Analytics 4: no pudimos leer tu Google Tag Manager', '')
      : check('ga4', 'tracking', 0, 'No encontramos Google Analytics 4', 'Sin analítica no sabes de dónde llegan tus reservas.'));
  const pixel = /connect\.facebook\.net[^"']{0,40}fbevents|fbq\(\s*\\?['"]init|facebook\.com\/tr\?id=|pixelyoursite|facebook-for-wordpress|official-facebook-pixel|pixel-caffeine|facebook-pixel/.test(tags);
  const ads = /aw-\d{6,}|googleadservices\.com\/pagead\/conversion/.test(tags);
  out.push(pixel && ads ? check('adtags', 'tracking', 1, 'Píxel de Meta y etiqueta de Google Ads', 'Tus campañas pueden aprender de las reservas.')
    : pixel || ads ? check('adtags', 'tracking', 0.5, pixel ? 'Píxel de Meta, pero sin etiqueta de Google Ads' : 'Etiqueta de Google Ads, pero sin píxel de Meta', pixel ? 'Sin ella, Google Ads no sabe qué clics terminan en reserva.' : 'Sin píxel, Instagram y Facebook no aprenden de quienes reservan.')
      : hidden ? check('adtags', 'tracking', null, 'Etiquetas de publicidad: no pudimos leer tu Google Tag Manager', '')
        : check('adtags', 'tracking', 0, 'Sin píxel de Meta ni etiqueta de Google Ads', 'Tus campañas no pueden saber qué anuncios traen reservas.'));
  const social = ['instagram.com', 'facebook.com'].filter((d) => all.includes(d));
  out.push(social.length === 2 ? check('social', 'tracking', 1, 'Enlaces a Instagram y Facebook', '') : check('social', 'tracking', social.length ? 0.5 : 0, social.length ? 'Solo un perfil social enlazado' : 'Sin enlaces a redes sociales', ''));

  const title = textOf((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]);
  out.push(!title ? check('title', 'visibilidad', 0, 'La página no tiene título', '')
    : title.length < 15 || title.length > 70 ? check('title', 'visibilidad', 0.5, 'Título poco descriptivo', '"' + title.slice(0, 80) + '"')
      : check('title', 'visibilidad', 1, 'Título claro', '"' + title + '"'));
  const desc = meta(html, 'description');
  out.push(!desc ? check('desc', 'visibilidad', 0, 'Sin meta descripción', 'Google inventa el texto que muestra bajo tu enlace.')
    : desc.length < 50 || desc.length > 170 ? check('desc', 'visibilidad', 0.5, 'Meta descripción muy corta o muy larga', '')
      : check('desc', 'visibilidad', 1, 'Meta descripción', ''));
  const robotsMeta = meta(html, 'robots') || '';
  if (/noindex/i.test(robotsMeta)) out.push(check('noindex', 'visibilidad', 0, 'La portada pide no aparecer en Google (noindex)', 'Es urgente revisarlo.'));
  const ld = (html.match(/<script[^>]+application\/ld\+json[^>]*>[\s\S]*?<\/script>/gi) || []).join(' ');
  const ldTravel = /"@type"\s*:\s*\[?\s*"(hotel|lodgingbusiness|resort|bedandbreakfast|campground|hostel|motel|touristtrip|touristattraction|travelagency|tourtrip|localbusiness|product|event)"/i.test(ld);
  out.push(ldTravel ? check('schema', 'visibilidad', 1, 'Datos estructurados (schema)', 'Ayudan a Google y a los asistentes de IA a entender qué ofreces.')
    : ld ? check('schema', 'visibilidad', 0.5, 'Datos estructurados genéricos', 'No describen tu alojamiento o experiencia.')
      : check('schema', 'visibilidad', 0, 'Sin datos estructurados', 'Google y la IA tienen menos información para recomendarte.'));
  const h1 = /<h1[\s>]/i.test(html);
  out.push(h1 ? check('h1', 'visibilidad', 1, 'Título principal (H1)', '') : check('h1', 'visibilidad', 0, 'Sin título principal (H1)', ''));
  out.push(ctx.sitemap ? check('sitemap', 'visibilidad', 1, 'Sitemap para Google', '') : check('sitemap', 'visibilidad', 0, 'No encontramos sitemap', 'Ayuda a Google a encontrar todas tus páginas.'));
  const multi = /hreflang=["']en|hreflang=["']es|href=["'][^"']*\/en\/|lang=["']en|gtranslate|weglot|translatepress/.test(lower);
  out.push(multi ? check('lang', 'visibilidad', 1, 'Versión en otro idioma', '') : check('lang', 'visibilidad', 0.5, 'Solo un idioma', 'Si recibes viajeros extranjeros, una versión en inglés amplía tu alcance.'));

  out.push(ctx.https ? check('https', 'rendimiento', 1, 'Sitio seguro (HTTPS)', '') : check('https', 'rendimiento', 0, 'El sitio no usa HTTPS', 'Los navegadores lo marcan como "no seguro".'));
  out.push(/<meta[^>]+name=["']viewport["']/i.test(html) ? check('viewport', 'rendimiento', 1, 'Preparado para móvil', '') : check('viewport', 'rendimiento', 0, 'No está adaptado a móvil', 'La mayoría de los viajeros busca desde el teléfono.'));

  return { checks: out, title, engine: engine ? engine[0] : null };
}

async function runDiagnosis(input, lang) {
  let raw = String(input || '').trim();
  if (!raw || raw.length > 200) return { status: 400, body: { error: 'bad_url' } };
  if (!/^https?:\/\//i.test(raw)) raw = 'https://' + raw;
  let start;
  try { start = new URL(raw); start.hash = ''; } catch (e) { return { status: 400, body: { error: 'bad_url' } }; }

  try {
    let home;
    try {
      home = await safeFetch(start.href, 6000);
    } catch (e) {
      if (e.message === 'bad_url') throw e;
      if (start.protocol === 'https:') {
        start.protocol = 'http:';
        home = await safeFetch(start.href, 4000);
      } else throw e;
    }
    let ua = UA;
    const thin = home.status < 400 && (!home.body || home.body.length < 5000);
    if (home.status >= 500 || home.status === 403 || thin) {
      const retry = await safeFetch(home.url || start.href, 5000, true, UA_PLAIN).catch(() => null);
      if (retry && retry.status < 400 && retry.body && (!thin || retry.body.length > home.body.length)) { home = retry; ua = UA_PLAIN; }
      else if (thin) console.warn('diagnostico: respuesta corta', start.host, home.status, home.body ? home.body.length : 0);
    }
    if (home.status === 401 || home.status === 403 || home.status === 429) return { status: 422, body: { error: 'blocked', status: home.status } };
    if (home.status >= 400 || !home.body) return { status: 422, body: { error: 'unreachable', status: home.status } };

    const finalUrl = new URL(home.url);
    const host = finalUrl.hostname;
    const bookingLink = findBookingLink(home.body, finalUrl);
    const sameHost = bookingLink && new URL(bookingLink).hostname === host;

    const gtmId = (home.body.match(/GTM-[A-Z0-9]{4,10}/) || [])[0];
    const offerLinks = findOfferLinks(home.body, finalUrl, bookingLink);
    const [extra, robots, sitemap, gtmJs, ...offers] = await Promise.all([
      sameHost && bookingLink !== finalUrl.href ? safeFetch(bookingLink, 3500).catch(() => null) : null,
      safeFetch(finalUrl.origin + '/robots.txt', 2500).catch(() => null),
      safeFetch(finalUrl.origin + '/sitemap.xml', 2500, false).catch(() => null),
      gtmId ? safeFetch('https://www.googletagmanager.com/gtm.js?id=' + gtmId, 3500).catch(() => null) : null,
      ...offerLinks.map((u) => safeFetch(u, 3500, true, ua).catch(() => null))
    ]);
    const robotsSitemap = robots && robots.status < 400 && /^sitemap:/im.test(robots.body);
    const hasSitemap = robotsSitemap || (sitemap && sitemap.status < 400) || /sitemap/i.test(home.body.match(/<link[^>]+rel=["']sitemap["'][^>]*>/i) || '');

    const result = analyze(home.body, extra && extra.status < 400 ? extra.body : '', {
      host, bookingLink, https: finalUrl.protocol === 'https:', sitemap: !!hasSitemap,
      gtmJs: gtmJs && gtmJs.status < 400 ? gtmJs.body : '',
      offerHtml: offers.filter((o) => o && o.status < 400 && o.body).map((o) => o.body).join('\n')
    });

    return {
      status: 200,
      body: {
        url: finalUrl.href,
        host,
        title: result.title,
        engine: result.engine,
        checks: lang === 'en' ? result.checks.map((c) => ({ ...c, label: toEnglish(c.label), detail: toEnglish(c.detail) })) : result.checks,
        analyzedAt: new Date().toISOString(),
        version: '1.7'
      }
    };
  } catch (e) {
    return e.message === 'bad_url' ? { status: 400, body: { error: 'bad_url' } } : { status: 422, body: { error: 'unreachable' } };
  }
}

const handler = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'GET') { res.status(405).json({ error: 'method' }); return; }

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'x';
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 60000);
  if (recent.length >= 6) { res.status(429).json({ error: 'rate' }); return; }
  recent.push(now);
  hits.set(ip, recent);

  const lang = req.query && req.query.lang === 'en' ? 'en' : 'es';
  const r = await runDiagnosis(req.query && req.query.url, lang);
  if (r.status === 200) res.setHeader('Cache-Control', 'public, s-maxage=3600, max-age=0');
  res.status(r.status).json(r.body);
};

module.exports = handler;
module.exports.analyze = analyze;
module.exports.runDiagnosis = runDiagnosis;
