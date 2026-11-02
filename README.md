# La noche del enterrador

Escape room en primera persona para navegador, hecho con Babylon.js. Una sorpresa basada en el vídeo corto "El sepulturero".

Estado: **Fase 1 completada** (refactor y estructura). El prototipo original funciona como una escena más (`prototype`) y los actos 1-7 son marcadores a la espera de las siguientes fases.

## Cómo probarlo

El juego usa módulos ES, así que no se puede abrir con doble clic en `index.html` (el navegador bloquea los módulos desde `file://`). Dos opciones:

1. **Servidor local**, desde esta carpeta: `python3 -m http.server 8000` y abre http://localhost:8000
2. **GitHub Pages**: sube la carpeta tal cual (sin paso de build) y activa Pages en `Settings -> Pages -> Deploy from a branch -> main / (root)`.

Para abrir una escena concreta: `?escena=act3_brokenDreams` al final de la URL.

## Controles

| | Ordenador | Móvil |
|---|---|---|
| Moverse | WASD o flechas | Joystick izquierdo |
| Mirar | Ratón | Arrastrar con el dedo a la derecha |
| Hablar / tocar | Clic o `E` | Botón **Usar** |
| Linterna (Fase 2) | `F` | Botón **Linterna** |
| Menú de depuración | `P` | Tres toques sobre el cuadro de bolsillos |

## Estructura

```
index.html               HTML mínimo y carga de js/main.js
css/style.css            estilos
js/config.js             textos, nombre del vecino, mensaje secreto, opciones
js/main.js               arranque, bucle, gestor de escenas, menú de depuración
js/core/
  engine.js              motor, escena base, luces, niebla, grano y viñeta
  helpers.js             texturas, materiales, geometría y carga de modelos
  player.js              cámara en primera persona, movimiento y colisiones
  input.js               teclado, ratón, joystick táctil, botones
  interaction.js         selección con la mirada y acción Usar
  state.js               actos, puzles resueltos, inventario y banderas
  ui.js                  pistas, diálogos, subtítulos, inventario, candado, pantallas
  audio.js               efectos sintéticos, música y sonido espacial (ganchos)
js/mechanics/            linterna, hilo, seguir el sueño, fragmentos (esqueletos, Fase 2 y 4)
js/scenes/               una escena por acto + prototype (el cementerio original)
assets/models/           child.glb, trees.glb, rocks.glb
assets/audio/            música y efectos (vacío por ahora)
```

## Cómo funciona una escena

Cada escena es un módulo que exporta:

```js
export const id = 'act1_simple';
export const title = 'Acto 1: Lo sencillo';
export const sceneOptions = {};          // opciones de la escena base: niebla, luces, etc. (opcional)
export async function load(ctx) { ... } // construye el mundo
export function unload(ctx) { ... }     // limpia temporizadores propios (opcional)
export function update(dt, ctx) { ... } // se llama cada fotograma (opcional)
```

El gestor crea una escena de Babylon nueva para cada escena de juego y la destruye al salir, así que `unload` solo tiene que cancelar lo que no sea de Babylon (temporizadores, listeners).

`ctx` contiene: `scene`, `camera`, `cast(mesh)` (sombras), `player`, `interaction`, `ui`, `audio`, `state`, `input`, `game` (`started`, `startTime`) y `goTo(id)`.

## Cómo añadir un acto nuevo

1. Crea `js/scenes/miActo.js` con `id`, `title` y `load(ctx)` (copia un marcador existente como punto de partida).
2. Impórtalo y añádelo a la lista `SCENES` de `js/main.js`.
3. Aparecerá solo en el menú de depuración. Para enlazarlo desde otro acto, llama a `ctx.goTo('miActo')`.

## Cómo añadir un objeto interactivo o un puzle

```js
import * as game from '../core/state.js';

ctx.interaction.add(meshes, {
  hint: () => (game.hasItem('llave') ? 'Abrir con la llave' : 'Examinar la puerta'),
  onUse: () => {
    if (!game.hasItem('llave')) return ctx.ui.toast('Está cerrada.');
    game.solvePuzzle('mi_puzle');
    ctx.ui.toast('Se abre.');
  }
});
```

- `ctx.ui.say(nombre, texto)` para diálogos, `ctx.ui.narrate(texto)` para voz en off, `ctx.ui.keypad({ code, onSolved })` para candados numéricos.
- Inventario y progreso: `addItem`, `hasItem`, `setFlag`, `hasFlag`, `solvePuzzle`, `isSolved` en `core/state.js`. Pon `persist: true` en `config.js` para guardar en `localStorage`.
- Los nombres visibles de los objetos del inventario van en `CONFIG.items`.

## Modelos

Los `.glb` se cargan con `loadModel(scene, 'fichero.glb')` desde `assets/models/`. Los modelos con esqueleto se detectan mal con el raycast (Babylon usa la malla sin deformar), así que se usa una caja invisible para interactuar (ver el niño en `scenes/prototype.js`).

## Hoja de ruta

1. Fase 1: refactor y estructura (hecha)
2. Fase 2: mecánicas base (linterna, hilo, seguir el sueño) con una escena de pruebas
3. Fase 3: prólogo, acto 1 y acto 2
4. Fase 4: actos 3 y 4
5. Fase 5: actos 5, 6 y 7 y epílogo
6. Fase 6: extras, audio y pulido
