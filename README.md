# La noche del enterrador

Escape room en primera persona para navegador, hecho con Babylon.js. Una sorpresa basada en el vídeo corto "El sepulturero".

Estado: **Fase 4 completada** (prólogo y actos 1 a 4). El prototipo original sigue como escena `prototype`, hay una escena de pruebas (`test_mechanics`) y los actos 5-7 y el epílogo son marcadores a la espera de las siguientes fases.

El juego arranca en el prólogo y, al terminar cada acto, pasa solo al siguiente. Para saltar a otra escena: `?escena=act3_brokenDreams` al final de la URL o el menú `P`. El cementerio de pruebas original sigue disponible con `?escena=prototype`. La escena de arranque se cambia en `defaultScene` (`js/config.js`).

## Cómo probarlo

El juego usa módulos ES, así que no se puede abrir con doble clic en `index.html` (el navegador bloquea los módulos desde `file://`). Dos opciones:

1. **Servidor local**, desde esta carpeta: `python3 -m http.server 8000` y abre http://localhost:8000
2. **GitHub Pages**: sube la carpeta tal cual (sin paso de build) y activa Pages en `Settings -> Pages -> Deploy from a branch -> main / (root)`.

Para abrir una escena concreta: `?escena=act3_brokenDreams` al final de la URL (por defecto arranca el prólogo).

## Controles

| | Ordenador | Móvil |
|---|---|---|
| Moverse | WASD o flechas | Joystick izquierdo |
| Mirar | Ratón | Arrastrar con el dedo a la derecha |
| Hablar / tocar | Clic o `E` | Botón **Usar** |
| Linterna (desde que coges el farol) | `F` | Botón **Linterna** |
| Diario | `J` | Botón **Diario** (arriba a la izquierda) |
| Ir más deprisa (solo en el camino del Acto 4) | `Mayús` | no hay |
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
js/mechanics/            flashlight.js, thread.js, followDream.js, dreamFragment.js, tether.js (hechas)
js/scenes/               prologue y act1-act4 (hechas); act5-act7 y epilogue (marcadores);
                         prototype (el cementerio original), test_mechanics y _kit.js (piezas compartidas)
assets/models/           child.glb, trees.glb, rocks.glb, landscape.glb
assets/audio/            música y efectos (vacío por ahora)
```


## Guion y textos

Todos los textos de la historia (voz en off, diálogos, pistas, avisos y entradas del diario) están en `js/config.js`, dentro de `CONFIG.story`. Se pueden cambiar sin tocar el código. Los diálogos son listas de `{ name, text }`; la voz en off es una lista de frases sueltas.

## Lo que hay en la Fase 3

- **Prólogo:** cuarto del niño con voz en off subtitulada, tutorial de movimiento, mirada e interacción, juguete opcional (bandera `juguete`, que usará el epílogo) y camino por el pueblo hasta la puerta del cementerio.
- **Acto 1, "Lo sencillo":** casa del sepulturero. Puzle 1, la cena sencilla (6 alimentos, 3 correctos; los demás se devuelven con una frase amable). Puzle 2, las herramientas (pala, farol y llaves, con una pista oral cada una); el farol activa la linterna.
- **Acto 2, "La tumba pequeña":** puzle 3, cavar con respeto (anillo de ritmo; ir demasiado rápido solo reinicia el compás y el sepulturero te frena con calma; saltarse un compás tampoco castiga). Después, tres preguntas al sepulturero, cada una con su entrada en el diario, y el momento emotivo con música suave.

Los parámetros del ritmo están en `RHYTHM` (`act2_smallGrave.js`): `period` (segundos por compás), `window` (margen para acertar) y `beats` (compases necesarios).


## Lo que hay en la Fase 4

- **Acto 3, "Sueños rotos":**
  - **Puzle 4, rompecabezas de sueños:** nueve fragmentos brillantes repartidos entre las lápidas (tres por sueño: cohete, violín y balón). Sobre la lápida de cada sueño flotan tres siluetas fantasma; en cada una se coloca el fragmento que encaja. Equivocarse no cuesta nada. Cada sueño completo añade una entrada al diario.
  - **Puzle 5, los que se alejan:** dos sueños (seis y siete años) se escapan; hay que seguirlos hasta su lápida con `followDream.js`. Si te quedas atrás, esperan.
  - **Puzle 6, el orden de las edades:** cinco lápidas (2, 4, 5, 6 y 7 años) desordenadas frente a la cripta. Se elige una y luego otra para intercambiarlas; ordenadas de menor a mayor, la cripta se abre y lleva al Acto 4.
- **Acto 4, "Atar los sueños":**
  - **Puzle 7, el nudo:** llevar un hilo del corazón a la cabeza con `thread.js`, sin cruzar otros hilos, ni a sí mismo, ni los charcos. Tres niveles: un hilo atravesado, dos hilos y un charco, y un laberinto de hilos y charcos.
  - **Puzle 8, que te sigan:** llevar un sueño atado con `tether.js` por tres tramos (la verja, el charco y las ramas). Se suelta y vuelve al inicio del tramo, sin castigo, si giras de golpe, si corres (Mayús), si te alejas demasiado o si el sueño roza un obstáculo (corta las esquinas: hay que dar rodeos amplios).

Los datos de cada mapa se exportan para poder retocarlos: `LAYOUT` (Acto 3), `LEVELS` y `COURSE` (Acto 4, cada nivel con su ruta `solution` o `path` de ejemplo). Los umbrales del sueño atado están en `TETHER` (`js/mechanics/tether.js`).

### Fragmentos (`dreamFragment.js`)

```js
const frag = createFragment(ctx, h, { dream: 'cohete', piece: 'punta', position: V3, onCollected });
const pz = createDreamPuzzle(ctx, h, { dream: 'cohete', origin: V3, onPlaced, onSolved });
```

Los sueños y sus piezas están en `DREAMS`. Los fragmentos recogidos se guardan en `state.flags.fragments`, y `fragmentStatus()` da el texto de la línea de estado (`ctx.ui.setStatus(texto)`). Para añadir un sueño nuevo: una entrada en `DREAMS` y su geometría en `buildPiece`.

### Sueño atado (`tether.js`)

```js
const t = createTether(ctx, h, { home: V3, solids: [rect], hazards: [rect] });
t.tie();                     // atarlo (hay que estar cerca)
t.setHome(V3);               // nuevo inicio de tramo
t.rest();                    // dejarlo donde está
t.onReleased = (motivo) => {};   // 'obstaculo' | 'giro' | 'prisa' | 'lejos'
```

`ctx.player.canRun = true` activa Mayús para correr; `ctx.player.velocity` da la velocidad real del último fotograma.

## Utilidades para los actos (contexto `ctx`)

```js
await ctx.whenStarted();                  // espera a que el jugador pulse "Entrar"
await ctx.wait(1.5);                      // pausa en segundos de juego
await ctx.waitUntil(() => cond());        // espera a que se cumpla una condición
await ctx.ui.dialogue([{ name, text }]);  // diálogo con avance (E, clic o Usar)
await ctx.ui.narrateAll(['frase', ...]);  // voz en off subtitulada
const id = await ctx.ui.choose({ name, text, options: [{ id, label, disabled }] });
ctx.ui.rhythm.show(texto) / .update(fase, progreso) / .flash('ok') / .hide();
ctx.useHandler = fn;                      // captura "Usar" (minijuegos); ponlo a null al terminar
ctx.player.moveLocked = true;             // se puede mirar pero no andar
ctx.state.addJournal({ id, title, text }) // entrada en el diario
ctx.ui.setStatus('texto');                // línea de estado bajo el inventario ('' la oculta)
ctx.audio.startPad('noche' | 'suave');    // música ambiente generada (sin ficheros); stopPad() la apaga
ctx.goTo('act3_brokenDreams');            // cambia de escena con fundido
```

`js/scenes/_kit.js` reúne las piezas compartidas: materiales en grises, cielo con luna, muros, farolillos, lápidas, verja, el sepulturero de cuerpo entero (`buildGravedigger`, con `holdHat()` y `update()`) y los árboles y rocas del modelo.

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

`ctx` contiene: `scene`, `camera`, `cast(mesh)` (sombras), `player`, `interaction`, `ui`, `audio`, `state`, `input`, `game` (`started`, `startTime`), `goTo(id)` y `addUpdater(fn)`.

`ctx.addUpdater((dt) => { ... })` registra una función que se ejecuta cada fotograma mientras la escena esté activa y devuelve otra función para quitarla. Las mecánicas lo usan para actualizarse solas; al cambiar de escena se descartan.

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


## Mecánicas (js/mechanics/)

Cada una se crea con `createX(ctx, opciones)`, se actualiza sola y se limpia con `dispose()`. Las puedes ver funcionando en la escena `test_mechanics` (menú `P` o `?escena=test_mechanics`).

### Linterna (`flashlight.js`)

```js
const fl = createFlashlight(ctx, { startOn: true });
fl.onToggle = (isOn) => { ... };                  // los puzles reaccionan aquí
fl.addShadowObject(mesh, { flag: 'simbolos' });   // visible solo con la linterna apagada
fl.setAvailable(false);                           // p. ej. hasta recoger el farol
```

Foco de luz pegado a la cámara. Tecla `F` o botón **Linterna** en móvil. Los objetos de sombra usan un material emisivo tenue y aparecen y desaparecen con un fundido; si pasas `flag`, solo se muestran cuando esa bandera está activa (`setFlag('simbolos')`). Para escenas oscuras usa `sceneOptions = { moon: false, hemiIntensity: 0.1 }`.

### Hilo (`thread.js`)

```js
const t = createThread(ctx, { from: V3(x, 0.85, z), obstacles: [rect o malla], others: [otroHilo] });
t.start();                       // el hilo empieza a seguir al jugador
t.connect(V3(x, 0.85, z));       // lo ata en el destino
t.retract();                     // lo recoge con calma
t.onConnected = () => {};
t.onBroken = (motivo) => {};     // 'propio' | 'otro' | 'obstaculo'; se recoge solo, sin penalización
```

Todo se comprueba en el plano del suelo. Un hilo que roza a otro, a sí mismo o a una zona marcada cuenta como cruzado. `obstacles` son rectángulos `[minX, maxX, minZ, maxZ]` o mallas. Para dejar un hilo ya atado como obstáculo de otro: `h.start(); h.connect(punto);` y pásalo en `others`.

### Seguir el sueño (`followDream.js`)

```js
const d = createFollowDream(ctx, { path: [V3, V3, ...], speed: 1.3, maxDistance: 6 });
d.onArrived = () => {};
d.onWait = (esperando) => {};     // opcional: aviso al empezar y terminar la espera
d.start(); d.reset();
```

Una esfera luminosa recorre una curva suave a velocidad constante. Si el jugador se aleja más de `maxDistance`, se detiene y parpadea hasta que vuelva (sin castigo).

## Modelos

Los `.glb` se cargan con `loadModel(scene, 'fichero.glb')` desde `assets/models/`. El terreno (`landscape.glb`) y la luna del escenario original se usan en la escena `prototype`: el terreno queda justo por debajo del suelo y solo se ve más allá de los muros. Los modelos con esqueleto se detectan mal con el raycast (Babylon usa la malla sin deformar), así que se usa una caja invisible para interactuar (ver el niño en `scenes/prototype.js`).

## Hoja de ruta

1. Fase 1: refactor y estructura (hecha)
2. Fase 2: mecánicas base (linterna, hilo, seguir el sueño) con una escena de pruebas (hecha)
3. Fase 3: prólogo, acto 1 y acto 2 (hecha)
4. Fase 4: actos 3 y 4 (hecha)
5. Fase 5: actos 5, 6 y 7 y epílogo
6. Fase 6: extras, audio y pulido
