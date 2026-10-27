# Guía de trabajo — Propuesta 06 Verde

Esta carpeta es la variante verde independiente de `dampak-mockup-naranja/`. Es una copia estructural y funcional; el naranja original permanece intacto en su carpeta.

## Antes de editar

- Conserva el orden: Header, Apertura, Servicios, Casos de éxito, Qué opinan nuestros clientes, Quiénes somos, Contacto y Footer.
- Mantén el tema oscuro por defecto y el selector claro/oscuro.
- El verde de la marca es el color exacto del segundo logo en `logo-dampak.pdf`: **`#8CE60D`**. No lo cambies, apagues ni reemplaces.
- Para texto verde sobre fondo claro usa `--accent-text: #3E7000`; el relleno, el bloque de apertura y el logo conservan `#8CE60D`.
- No copies tokens/assets de la versión naranja encima de esta carpeta. El logo verde se extrajo de la marca suministrada; `assets/PROVENANCE.md` registra su origen.
- La apertura lleva «Hagamos» en una sola línea (`white-space: nowrap`) y completa el titular en otras dos líneas; solo «Hagamos» lleva fondo verde.
- La rotación de proyectos dura 4,2 s, se pausa con hover/foco, si sale de pantalla o la pestaña queda oculta.
- Casos y vista previa mantienen su ventana de navegador; opiniones usan slider automático con pausa; el equipo tiene retratos circulares pequeños con cabecera horizontal y progreso ligado al scroll.
- Los siete grandes bloques comparten el contenedor máximo de 1440 px.
- Testimonios, contacto y footer tienen fondo a todo el ancho, con contenido alineado al contenedor común.
- Máximo tres familias: Bricolage Grotesque, Schibsted Grotesk y Spline Sans Mono.

## CMS, copy y contenido

El contenido y los campos siguen el contrato de `dampak-mockup-naranja/AGENTS.md`: contenido editable separado de CSS/JS, casos con URL y alt, testimonios con autorización, perfiles con retrato autorizado y validación server-side al conectar el formulario. Conserva el español colombiano con «tú»; no inventes métricas, clientes ni capacidades.

Los testimonios siguen siendo ejemplos ficticios. El número de WhatsApp y las redes están pendientes. Los legales son borradores y deben revisarse profesionalmente. Los archivos de `assets/team/` son marcadores neutros; sustitúyelos por retratos autorizados con los mismos nombres.

## Accesibilidad y movimiento

- HTML semántico, un `h1`, foco visible, contraste comprobado en oscuro y claro y controles con estados accesibles.
- Slider: avance automático cada 7 s con animación, pausa visible, botones anterior/siguiente y una cita visible; se detiene con foco, hover, fuera de pantalla o movimiento reducido.
- Carril del equipo: el perfil activo expone `aria-current="step"`; el marcador se oculta con movimiento reducido, pero la etapa resaltada permanece.
- Menú, formulario y autoavance respetan teclado y `prefers-reduced-motion`.
- El scroll se actualiza una vez por frame; las animaciones de hover se limitan a `transform`, `opacity` y color.

## Verificación

```bash
.agents/skills/impeccable/scripts/impeccable detect dampak-mockup-verde
P06_BASE=http://127.0.0.1:8000/dampak-mockup-verde/ node /tmp/opencode/pdfview/p06-test.js
```
