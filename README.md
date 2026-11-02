# La noche del enterrador

Escape room en primera persona para navegador, hecho con Babylon.js. Una sorpresa basada en el vídeo corto "El sepulturero".

Estado: **Fase 6 completada**: la historia está entera, con los extras (18 sueños escondidos, grafiti con el nombre del vecino, mensaje oculto), sonido, menú de pausa, guardado y ajuste de calidad. El prototipo original sigue como escena `prototype` y hay una escena de pruebas (`test_mechanics`).

El juego arranca en el prólogo y, al terminar cada acto, pasa solo al siguiente. Para saltar a otra escena: `?escena=act3_brokenDreams` al final de la URL o el menú `P`. El cementerio de pruebas original sigue disponible con `?escena=prototype`. La escena de arranque se cambia en `defaultScene` (`js/config.js`).

## Cómo probarlo

El juego usa módulos ES, así que no se puede abrir con doble clic en `index.html` (el navegador bloquea los módulos desde `file://`). Dos opciones:

1. **Servidor local**, desde esta carpeta: `python3 -m http.server 8000` y abre http://localhost:8000
2. **GitHub Pages**: sube la carpeta tal cual (sin paso de build) y activa Pages en `Settings -> Pages -> Deploy from a branch -> main / (root)`.

Parámetros de la URL: `?escena=act3_brokenDreams` abre una escena concreta (y no usa ni pisa la partida guardada); `?calidad=baja` reduce sombras, grano y resolución para móviles lentos.

## Controles

| | Ordenador | Móvil |
|---|---|---|
| Moverse | WASD o flechas | Joystick izquierdo |
| Mirar | Ratón | Arrastrar con el dedo a la derecha |
| Hablar / tocar | Clic o `E` | Botón **Usar** |
| Linterna (desde que coges el farol) | `F` | Botón **Linterna** |
| Diario | `J` | Botón **Diario** (arriba a la izquierda) |
| Ir más deprisa (solo en el camino del Acto 4) | `Mayús` | no hay |
| Mantener «Usar» (Acto 6) | mantener `E` o el botón del ratón | mantener el botón **Usar** |
| Menú de pausa | `Esc` o botón **Menú** | botón **Menú** (arriba a la derecha) |
| Silenciar el sonido | `M` | desde el menú |
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
js/mechanics/            flashlight.js, thread.js, followDream.js, dreamFragment.js, tether.js (todas hechas)
js/scenes/               prologue, act1 a act7 y epilogue (hechas);
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


## Lo que hay en la Fase 5

- **Acto 5, "Cuanto menos veas" (la cripta oscura):**
  - **Puzle 9, apaga la luz:** con la linterna encendida solo se ven paredes. A oscuras brillan cinco símbolos (círculo, triángulo, cuadrado, rombo y cruz) que se encienden en un orden; hay que pulsarlos en ese mismo orden. Equivocarse solo hace que se vuelvan a mostrar. Abre una puerta de piedra.
  - **Puzle 10, brillo inverso:** tres salas con paredes. La luz hace desaparecer los sueños y la oscuridad los muestra: se sigue su brillo hasta una salida que también solo brilla a oscuras. Se puede encender la linterna un momento para ver las paredes.
- **Acto 6, "Las dudas":**
  - **Puzle 11, sostén tu sueño:** el sueño atado se mantiene encendido con **Usar mantenido** mientras cuatro sombras (las dudas) se le acercan despacio y las voces susurran («no vas a poder», «es una tontería», «déjalo»). Cuanto más avanza, más brilla y menos le afectan. Si se apaga, vuelve a encenderse y se retrocede a un punto de control, sin castigo. Los números están en `HOLD` (`act6_doubts.js`).
  - **La Gente (jefe final):** una figura hecha de voces, sin ataques. Se supera con tres tramos: a oscuras siguiendo el brillo, siguiendo al sueño y atando el hilo sin tocar sus brazos.
- **Acto 7, "El sueño del sepulturero":**
  - **Puzle 12, ¿dónde está su sueño?:** al amanecer hay ocho sitios con pistas (tumbas cuidadas, un farolillo y su casa). Con cinco pistas el sepulturero deja responder; las respuestas equivocadas se contestan con calma. Su sueño es el propio cementerio.
  - **Despedida:** las frases del vídeo y el sepulturero se va hacia su casa. Si se han encontrado los 18 sueños escondidos (extra de la Fase 6), aparece el mensaje oculto: `CONFIG.neighbor.secretMessage`, o uno por defecto si está vacío.
- **Epílogo, "Cumplió su palabra":** el niño, ya mayor (los ojos a 1,78 m). Un camino con un recuerdo por cada sueño que salvó, el cementerio vacío, el banco del sepulturero con su sombrero y, si cogiste el juguete en el prólogo, el juguete. Al salir, créditos con el nombre del vecino (`CONFIG.neighbor.name`) y un botón al vídeo original (`CONFIG.neighbor.videoUrl`, solo aparece si se rellena).

Los datos de cada mapa se exportan: `SYMBOLS`, `SEQUENCE` y `ROOMS` (Acto 5), `HOLD` y `LAYOUT` (Acto 6), `LAYOUT` (actos 7 y epílogo).

### Sueños escondidos

`state.addHidden(id)` guarda un sueño escondido, `state.hiddenCount()` los cuenta y `state.setJournal(entry)` crea o actualiza una entrada del diario. Más abajo, en «Lo que hay en la Fase 6», están los detalles y cómo personalizarlos.

### Novedades para los actos

```js
ctx.input.isUseHeld();                    // ¿está Usar mantenido? (E, ratón o botón táctil)
fl.addShadowObject(mesh, { pickable: true, useShadowMaterial: false });   // solo se ve (y se puede usar) a oscuras
fl.clearShadowObjects();                  // olvida los objetos de sombra al cambiar de etapa
K.orbTrail(ctx, h, fl, [[x, z], ...]);    // rastro de brillos que solo se ve a oscuras (_kit.js)
K.skyDome(ctx, h, { dawn: true });        // cielo del amanecer, sin luna
tether.brightness = 0.5;                  // brillo del sueño atado (0 a 1)
ctx.ui.showCredits({ title, lines, linkLabel, linkUrl, button, onClick });
```


## Lo que hay en la Fase 6

- **18 sueños escondidos** (uno por cada minuto del vídeo), dos en cada escena. Son brillos pequeños que suenan suavemente desde su posición. Cada uno revela una frase del vídeo y se anota en el diario, en una entrada que se va completando («Sueños escondidos 7/18»). Los ya cogidos no reaparecen.
- **Mensaje oculto y final secreto:** con los 18, el Acto 7 muestra un mensaje dedicado (`CONFIG.neighbor.secretMessage`) y los créditos del epílogo añaden un «Final secreto» con el mismo texto.
- **Grafiti con el nombre del vecino** (`CONFIG.neighbor.name`): aparece escrito con tiza en una pared del prólogo, del Acto 4 y del epílogo, y en los créditos. Sin nombre, no aparece nada.
- **Sonido sin ficheros:** viento, ambiente de interior, rumor de cripta y alba con pájaros; música de acordes lentos; pasos al andar; y **sonido espacial**: los sueños y los brillos escondidos suenan desde donde están (con auriculares se nota mejor). `M` silencia y se recuerda.
- **Menú de pausa** (`Esc` o botón Menú): continuar, **reiniciar el acto** (no se pierde nada, así que nunca se queda un puzle bloqueado), sonido, calidad gráfica, diario y volver al inicio.
- **Guardado automático:** se guarda al empezar cada acto. Al volver, la pantalla de inicio ofrece **Continuar** (el acto guardado, con diario, inventario y sueños escondidos) o **Nueva partida**. Con `?escena=` en la URL no se toca la partida guardada.
- **Calidad adaptable:** si los fotogramas por segundo caen durante unos segundos, se apagan sombras, grano y brillo y se baja un poco la resolución. También se puede forzar en el menú o con `?calidad=baja`.
- **Pulido:** pantalla de carga, aviso si el navegador no tiene WebGL, aviso para girar el móvil en horizontal.

## Personalizar la sorpresa (todo en `js/config.js`)

```js
neighbor: {
  name: 'Marta',                          // nombre para el grafiti y los créditos
  secretMessage: 'Tu mensaje aquí.',      // mensaje oculto (vacío = uno por defecto)
  graffiti: '{name} estuvo aquí',         // texto del grafiti
  videoUrl: 'https://...'                 // botón «Ver el vídeo original» en los créditos
},
hiddenDreams: { lines: [...18 frases...], spots: { prologue: [['h01', x, y, z], ...], ... } }
```

- Las 18 frases de los sueños escondidos y sus posiciones (`spots`) se pueden cambiar. El identificador (`h01` a `h18`) decide qué frase muestra.
- Para probar rápido el final secreto sin buscar los 18, abre la consola del navegador y escribe: `__juego.state.setFlag('hidden', Array.from({length: 18}, (_, i) => 'h' + String(i + 1).padStart(2, '0')))`, luego salta al Acto 7 con `P`.
- Para borrar la partida guardada: **Nueva partida** en la pantalla de inicio, o `localStorage.clear()` en la consola.

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
ctx.audio.emitter({ freq, vol, pulse, position });   // sonido espacial: .setPosition(v3), .setVolume(v), .dispose()
ctx.goTo('act3_brokenDreams');            // cambia de escena con fundido
```

Cada escena puede exportar `ambient` (`'viento'`, `'interior'`, `'cripta'` o `'alba'`) para elegir su sonido de fondo. `K.hiddenDreams(ctx, h, id)` coloca los sueños escondidos de esa escena y `K.graffiti(ctx, h, { x, y, z, ry })` el grafiti.

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

1. Crea `js/scenes/miActo.js` con `id`, `title` y `load(ctx)`. Para una escena provisional, `_placeholder.js` ofrece `makePlaceholder({ id, title, note })`; para una real, copia un acto corto como el Acto 2.
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
5. Fase 5: actos 5, 6 y 7 y epílogo (hecha)
6. Fase 6: extras, audio y pulido (hecha)
