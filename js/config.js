// Todo lo que quieras personalizar sin tocar el código vive aquí.
export const CONFIG = {
  title: 'La noche del enterrador',

  // Escena con la que arranca el juego. Para saltar a otra, añade ?escena=act3_brokenDreams a la URL
  // (o ?escena=prototype para el cementerio de pruebas original) o usa el menú de depuración (tecla P).
  defaultScene: 'prologue',

  // Guardado automático en localStorage (progreso entre sesiones).
  persist: true,

  // Personalización de la sorpresa (se usará en la Fase 6).
  // Sueños escondidos: uno por cada minuto del vídeo (18). Cada uno revela una frase; reunirlos todos desbloquea el mensaje oculto.
  // spots: por escena, [id, x, y, z]. El id (h01...h18) decide qué frase muestra.
  hiddenDreams: {
    total: 18,
    lines: [
      'Esa noche no iba a ser una noche cualquiera.',
      'Hoy no iba a dormir.',
      'Hoy no tocaba juegos y a la cama.',
      'Le habían dicho que ya no era un niño.',
      'Era hora de aprender lo que era la vida.',
      'Para eso, fuera al cementerio del pueblo de noche.',
      'No iba a estar solo: iba a acompañar al sepulturero.',
      '«Así sabría lo que es la vida». Palabras de su padre.',
      'El sepulturero tenía fama de ser hosco y solitario.',
      'Pero era un buen hombre.',
      'Le gustaban las cosas sencillas.',
      'A nadie le gusta mi trabajo, pero alguien debe hacerlo.',
      'Lo que pongo dentro de esos ataúdes son sueños.',
      'Hay que atarlos siempre, bien fuerte a tu corazón y a tu cabeza.',
      'Haz que te sigan todo el camino.',
      'Y que cuanto menos veas, más fuerte sea su brillo.',
      'Me propuse que todos los sueños tuvieran un buen fin.',
      'Nada permitió que acabaran en el Cementerio de los Sueños.'
    ],
    spots: {
      prologue: [['h01', 2.2, 2.2, 0.5], ['h02', -3.6, 1.4, 6.0]],
      act1_simple: [['h03', -3.2, 1.75, 0.5], ['h04', 3.1, 1.25, 2.2]],
      act2_smallGrave: [['h05', 0.2, 0.7, 5.2], ['h06', -0.5, 0.6, -5.2]],
      act3_brokenDreams: [['h07', 6.6, 0.9, 5.6], ['h08', -6.9, 0.8, -6.9]],
      act4_tieDreams: [['h09', -6.4, 0.9, 6.4], ['h10', 6.4, 0.9, -6.4]],
      act5_lessYouSee: [['h11', -6.0, 1.0, 5.2], ['h12', 6.0, 1.0, -5.8]],
      act6_doubts: [['h13', 6.5, 0.9, 6.5], ['h14', -6.5, 0.9, -6.5]],
      act7_gravediggerDream: [['h15', 6.4, 0.9, 4.4], ['h16', -6.4, 0.9, -6.3]],
      epilogue: [['h17', 6.3, 1.0, -6.2], ['h18', -6.4, 1.0, 5.0]]
    }
  },

  neighbor: {
    name: '',                 // nombre del vecino para la lápida o el grafiti
    secretMessage: '',        // mensaje final si encuentra los 18 sueños (si está vacío se usa uno por defecto)
    graffiti: '{name} estuvo aquí',   // texto del grafiti con tiza; {name} se sustituye por el nombre
    videoUrl: ''              // enlace al vídeo original para los créditos
  },

  // Nombre visible de cada objeto del inventario.
  items: {
    llave: 'Llave oxidada',
    juguete: 'Juguete',
    pala: 'Pala',
    farol: 'Farol',
    llaves: 'Llaves'
  },


  // Guion de la Fase 3. Las líneas con name son diálogos; las que son texto suelto, voz en off o avisos.
  story: {
    prologue: {
      intro: [
        'Esa noche no iba a ser una noche cualquiera.',
        'Hoy no iba a dormir. Hoy no tocaba juegos y a la cama.',
        'Le habían dicho que ya no era un niño y que era hora de aprender lo que era la vida.',
        'Y que, para eso, fuera al cementerio del pueblo de noche.',
        'Pero no iba a estar solo. Iba a acompañar al sepulturero una noche de trabajo.',
        '«Así sabría lo que es la vida». Palabras de su padre.'
      ],
      tutorial: {
        moveDesktop: 'Muévete con W, A, S y D.',
        moveTouch: 'Muévete con el joystick de la izquierda.',
        lookDesktop: 'Mira alrededor moviendo el ratón.',
        lookTouch: 'Mira alrededor arrastrando el dedo por la derecha.',
        interactDesktop: 'Acércate a la ventana, apunta con la cruz y pulsa E o haz clic.',
        interactTouch: 'Acércate a la ventana, apunta con la cruz y pulsa Usar.',
        exit: 'Cuando quieras, sal por la puerta del norte. Si te apetece, llévate algo contigo.'
      },
      window: 'La luna está alta y no hay luz en ninguna casa del pueblo.',
      toyLook: 'Tu juguete de siempre. Hoy no tocaba juegos, pero quizá te apetezca llevarlo.',
      toyTake: 'Te guardas el juguete en el bolsillo.',
      toyReminder: 'Tu juguete se ha quedado sobre el taburete.',
      desk: 'Tu escritorio. Los deberes de mañana siguen sin hacer.',
      bed: 'Tu cama. Esta noche no la vas a usar.',
      wardrobe: 'El armario está cerrado. Dentro solo hay ropa de invierno.',
      mirror: 'Tu reflejo te devuelve la mirada. Parece más pequeño de lo que te sientes.',
      fatherAtDoor: { name: 'Padre', text: 'Ve con cuidado y haz caso al sepulturero.' },
      streetMid: [
        'El sepulturero tenía fama de ser un personaje hosco y solitario.',
        'Quizás por su trabajo. Quizás por su experiencia. Pero era un buen hombre.'
      ],
      streetEnd: [
        'Le gustaban las cosas sencillas:',
        'la comida sencilla, la casa sencilla, el trabajo sencillo.'
      ],
      houses: ['Una casa a oscuras. Todos duermen.', 'Las ventanas de esta casa están cerradas. Dentro respira alguien.']
    },

    act1: {
      title: 'Acto 1: Lo sencillo',
      welcome: [
        { name: 'Sepulturero', text: '¡Ah! ¡Eres tú! Es hora de trabajar. Aún me extraña que tu padre decidiera traerte aquí. Un sitio extraño para un niño como tú.' },
        { name: 'Niño', text: 'He venido para saber lo que es la vida.' },
        { name: 'Sepulturero', text: 'Buen sitio para aprender eso.' },
        { name: 'Sepulturero', text: 'Antes de salir, cenamos. Y llevamos lo de siempre: la pala, el farol y las llaves. Todo muy sencillo.' }
      ],
      cenaHints: [
        'Hoy cenamos sencillo, chico. Lo que no necesita explicación.',
        'Lo que sale de la tierra, del horno o del cazo. Lo que solo sirve para adornar, se queda en la despensa.',
        'Tres cosas en la mesa, ni una más. Empieza por el pan.'
      ],
      herramientasHints: {
        pala: 'La pala descansa donde la tierra me espera: junto a la puerta de atrás.',
        farol: 'El farol cuelga donde lo veo desde la cama, para no tropezar de noche.',
        llaves: 'Las llaves, en el abrigo viejo. El que cuelga junto a la chimenea.'
      },
      herramientasAll: 'Pala, farol y llaves. Ya podemos ir.',
      foods: {
        pan: { name: 'Pan', look: 'Una hogaza redonda, todavía tibia.', simple: true },
        sopa: { name: 'Sopa', look: 'Sopa de verduras. Huele a casa.', simple: true },
        queso: { name: 'Queso', look: 'Queso curado, duro como una piedra buena.', simple: true },
        tarta: { name: 'Tarta', look: 'Una tarta de tres pisos con nata. Demasiado adorno para esta casa.', simple: false },
        ostras: { name: 'Ostras', look: 'Ostras con limón. Aquí nadie sabría abrirlas.', simple: false },
        pavo: { name: 'Pavo', look: 'Un pavo relleno de trufas. Es comida para otra gente.', simple: false }
      },
      cenaWrong: ['Eso no es sencillo, chico. Pruébalo con otra cosa.', 'Demasiado adorno. Piensa en lo que no necesita explicación.'],
      cenaDone: [
        { name: 'Sepulturero', text: 'Así se cena, chico. Sin prisas y sin adornos.' },
        { name: 'Niño', text: 'Está buenísimo.' },
        { name: 'Sepulturero', text: 'Lo sencillo siempre lo está.' }
      ],
      pick: {
        pala: 'Coges la pala. Pesa más de lo que parece.',
        farol: 'Descuelgas el farol. Con F, o con el botón Linterna, lo enciendes y lo apagas.',
        llaves: 'Rebuscas en el abrigo viejo y encuentras un manojo de llaves.'
      },
      look: {
        abrigo: 'Un abrigo viejo, muy gastado. Alguien lo ha remendado muchas veces.',
        chimenea: 'La chimenea está encendida. Es la única luz cálida del pueblo.',
        cama: 'Una cama pequeña y bien hecha, a la manera del sepulturero.',
        mesa: 'La mesa está vacía. Falta la cena.',
        puerta: 'La puerta de la calle.'
      },
      notYet: 'Todavía falta algo antes de salir: la cena y las herramientas.',
      leaving: 'Cuando el reloj de la iglesia dio las doce, salieron los dos hacia el fondo del cementerio.',
      journal: { id: 'casa', title: 'La casa del sepulturero', text: 'Pan, sopa y queso. Una casa pequeña, ordenada a su manera. Dice que le gustan las cosas sencillas.' }
    },

    act2: {
      title: 'Acto 2: La tumba pequeña',
      intro: [
        { name: 'Sepulturero', text: 'Aquí es. Tú coges la pala y yo marco. Con respeto, chico: la tierra no tiene prisa.' }
      ],
      digPrompt: 'Pulsa Usar cuando el anillo llegue al centro. Con calma.',
      digHint: 'Cavar la tumba',
      tooFast: ['Despacio, chico. La tierra no tiene prisa.', 'Más lento. Con respeto.', 'Respira. Otra vez, sin prisa.'],
      missed: ['Sigue, con calma.', 'No pasa nada. Cuando quieras.'],
      digDone: [
        { name: 'Sepulturero', text: 'Ya está. Así se hace: con respeto.' },
        { name: 'Sepulturero', text: 'Descansemos un momento. Pregunta lo que quieras, chico.' }
      ],
      questionPrompt: 'Puedes preguntarle al sepulturero:',
      questions: {
        pequeno: {
          label: '¿Por qué es tan pequeño?',
          lines: [
            { name: 'Niño', text: '¿Por qué es tan pequeño?' },
            { name: 'Sepulturero', text: 'Porque lo que contiene es pequeño. Apenas ha llegado a vivir dos años.' }
          ],
          journal: { id: 'pequeno', title: 'La tumba pequeña', text: 'Apenas ha llegado a vivir dos años. Por eso es tan pequeño.' }
        },
        dentro: {
          label: '¿Qué hay dentro?',
          lines: [
            { name: 'Niño', text: 'Aún no he entendido muy bien su trabajo, señor. Sé que usted entierra ataúdes y cuida de las tumbas, pero ¿qué es lo que hay dentro?' },
            { name: 'Sepulturero', text: 'Presta atención, pequeño. Lo que yo pongo dentro de esos ataúdes son sueños. Sueños que se rompen. Sueños que se han muerto.' },
            { name: 'Sepulturero', text: 'La gente me los trae deshechos y yo les doy un lugar para que vengan y vean lo que una vez tuvieron.' }
          ],
          journal: { id: 'dentro', title: 'Lo que hay dentro', text: 'Dentro de los ataúdes hay sueños: sueños que se rompen y sueños que se han muerto. El sepulturero les da un lugar para que la gente venga y vea lo que una vez tuvo.' }
        },
        trabajo: {
          label: '¿Y su trabajo?',
          lines: [
            { name: 'Niño', text: '¿Y su trabajo? ¿Le gusta?' },
            { name: 'Sepulturero', text: 'A nadie le gusta mi trabajo, pero alguien debe hacerlo.' }
          ],
          journal: { id: 'trabajo', title: 'El trabajo', text: 'A nadie le gusta el trabajo del sepulturero, pero alguien debe hacerlo.' }
        }
      },
      emotional: [
        { name: 'Sepulturero', text: 'Aunque no lo creas, aunque pienses que estoy acostumbrado, se me rompe el corazón cada vez que tengo que enterrar uno de estos.' },
        { name: 'Niño', text: 'Lo siento, señor.' },
        { name: 'Sepulturero', text: 'No lo sientas. Por eso lo hago yo, y lo hago bien.' }
      ],
      emotionalNarration: 'Nadie dijo nada durante un rato. La noche seguía siendo la misma, pero algo había cambiado.',
      look: {
        ataud: 'Un ataúd muy pequeño, de madera clara. Alguien le ha dejado una flor.',
        tumba: 'La tumba ya está lista. Huele a tierra recién abierta.',
        sepulturero: 'El sepulturero espera a tu lado.'
      },
      newEntry: 'Nueva entrada en el diario (J)'
    },

    act3: {
      title: 'Acto 3: Sueños rotos',
      intro: [
        { name: 'Sepulturero', text: 'La mayoría no llega a los seis o siete años, cuando uno deja de seguirlos. Pero otros, como este, no llegan ni a los dos.' },
        { name: 'Sepulturero', text: 'Por el cementerio hay trozos de sueños rotos. Recógelos entre las lápidas, chico, y devuélveles su forma.' }
      ],
      objective: 'Busca los fragmentos que brillan entre las lápidas. Cada sueño tiene tres.',
      fragmentsHelp: 'Cuando tengas fragmentos, acércate a la lápida del sueño y coloca cada uno en la silueta que le corresponda.',
      dreamTombs: {
        cohete: 'La lápida de un sueño roto. Sobre ella flotan las siluetas de un cohete.',
        violin: 'La lápida de un sueño roto. Sobre ella flotan las siluetas de un violín.',
        balon: 'La lápida de un sueño roto. Sobre ella flotan las siluetas de un balón.'
      },
      dreamDone: {
        cohete: { id: 'cohete', title: 'Un cohete', text: 'Alguien soñó con llegar a la luna. El cohete estaba roto en tres trozos y ahora vuelve a ser uno.' },
        violin: { id: 'violin', title: 'Un violín', text: 'Un violín que nadie llegó a tocar. Entero otra vez, espera su primera canción.' },
        balon: { id: 'balon', title: 'Un balón', text: 'Un balón que se pinchó en el primer partido. Entero otra vez, espera a alguien con quien rodar.' }
      },
      oneDone: ['Un sueño entero ya no está roto: está dormido, esperando.'],
      allDone: [
        'Los tres sueños volvieron a ser sueños.',
        'Pero los de seis y siete años no se quedan quietos: se escapan cuando uno deja de seguirlos.'
      ],
      follow: {
        hint: 'Seguir el sueño',
        busy: 'Un sueño que se escapa. Síguelo con calma.',
        prompt: 'Sigue la luz. Si te alejas, esperará.',
        wait: 'El sueño espera. Acércate.',
        arrived6: 'El sueño de seis años descansa por fin junto a su lápida.',
        arrived7: 'El sueño de siete años descansa por fin junto a su lápida.',
        tomb6: 'La lápida de un niño de seis años. Alguien ha dejado un lazo.',
        tomb7: 'La lápida de un niño de siete años. Tiene un dibujo a lápiz grabado.',
        next: 'Se oye otro sueño escapándose, más allá de las lápidas.'
      },
      journalFollow: { id: 'escapan', title: 'Los que se alejan', text: 'Los sueños de seis y siete años se escapan cuando uno deja de seguirlos. Hay que ir tras ellos con calma, sin perderlos de vista.' },
      slabsRise: 'Las lápidas de la cripta se han soltado de la tierra. Algo las pide en orden.',
      slabsSealed: 'Las lápidas siguen selladas. Antes, ayuda a los sueños que se escapan.',
      slabHintPick: 'Mover esta lápida',
      slabHintSwap: 'Cambiarla de sitio con la elegida',
      slabSorted: 'Las edades quedan en orden y la cripta se abre.',
      plaque: 'En la puerta de la cripta hay una placa: «De los más pequeños a los mayores».',
      crypt: 'La puerta de la cripta. Sigue cerrada.',
      cryptOpen: [
        { name: 'Sepulturero', text: '¡Por eso, chico, es importante que cuides de tus sueños!' },
        { name: 'Sepulturero', text: 'Hay que atarlos siempre, bien fuerte a tu corazón y a tu cabeza. Ven, entra: te enseño cómo.' }
      ],
      journalCrypt: { id: 'cripta', title: 'La cripta', text: 'De los más pequeños a los mayores: así se abre la cripta.' },
      enter: 'Entra en la cripta por la puerta abierta.'
    },

    act4: {
      title: 'Acto 4: Atar los sueños',
      intro: [
        { name: 'Sepulturero', text: 'Un sueño que no está atado se pierde. Une tu corazón con tu cabeza con este hilo, y que no se cruce con nada.' },
        { name: 'Niño', text: '¿Y si se cruza?' },
        { name: 'Sepulturero', text: 'Entonces se recoge solo y lo intentas otra vez. Los nudos buenos se hacen despacio.' }
      ],
      knotHint: { A: 'Coger el hilo del corazón', carrying: 'Soltar el hilo', B: 'Atar a la cabeza', Bwait: 'La cabeza (primero coge el hilo)' },
      knotStart: 'Lleva el hilo del corazón hasta la cabeza sin cruzarlo ni tocar los charcos.',
      knotBreak: {
        propio: 'El hilo se ha cruzado consigo mismo. Se recoge solo; vuelve a intentarlo con calma.',
        otro: 'El hilo ha tocado otro hilo. Se recoge solo; rodéalo por un extremo.',
        obstaculo: 'El hilo ha tocado un charco. Se recoge solo; pasa lejos de él.'
      },
      knotTied: ['Hilo atado. El nudo aguanta.', 'Segundo nudo atado. Cada vez más fuerte.', 'Tercer nudo atado. Este no se suelta.'],
      knotLevels: ['Primer nudo: un hilo atravesado.', 'Segundo nudo: dos hilos y un charco.', 'Tercer nudo: un laberinto de hilos y charcos.'],
      knotDone: [
        { name: 'Sepulturero', text: 'Muy bien, chico. Los sueños se atan siempre despacio y bien fuerte.' },
        { name: 'Sepulturero', text: 'Ahora lo más difícil: haz que te sigan todo el camino.' }
      ],
      journalKnot: { id: 'nudo', title: 'El nudo', text: 'Hay que atar los sueños siempre, bien fuerte a tu corazón y a tu cabeza. Los nudos buenos se hacen despacio.' },
      courseIntro: 'Lleva el sueño atado detrás de ti, con calma. Si giras de golpe, corres (Mayús) o el sueño roza algo, se soltará y volverá al inicio del tramo. No pasa nada: vuelve a por él.',
      courseTie: 'Atar el sueño',
      courseTied: 'Sueño atado. Camina despacio y da rodeos amplios.',
      courseDrop: 'Dejar el sueño aquí',
      courseRest: 'El sueño descansa un momento. Cuando quieras, vuelve a atarlo.',
      courseWait: 'El sueño ya está atado.',
      courseTooFar: 'Todavía tienes que llevar el sueño hasta aquí.',
      released: {
        obstaculo: 'El sueño ha rozado algo y se ha soltado. Ha vuelto al inicio del tramo.',
        giro: 'Has girado de golpe y el sueño se ha soltado. Ha vuelto al inicio del tramo.',
        prisa: 'Ibas muy deprisa y el sueño se ha soltado. Ha vuelto al inicio del tramo.',
        lejos: 'Te has alejado demasiado y el sueño se ha soltado. Ha vuelto al inicio del tramo.'
      },
      sections: [
        { name: 'La verja', intro: 'Primer tramo: la verja. Pasa por la abertura sin girar de golpe.', done: 'Tramo de la verja superado.' },
        { name: 'El charco', intro: 'Segundo tramo: el charco. Da un rodeo amplio para que el sueño no lo roce.', done: 'Tramo del charco superado.' },
        { name: 'Las ramas', intro: 'Tercer tramo: las ramas. Zigzaguea despacio entre ellas.', done: 'Tramo de las ramas superado.' }
      ],
      look: {
        corazon: 'El punto del corazón. Late despacio.',
        cabeza: 'El punto de la cabeza. Brilla quieto.',
        charco: 'Un charco hondo. El hilo no puede tocarlo.',
        verja: 'Una verja baja. El sueño no puede atravesarla.',
        ramas: 'Ramas secas que cuelgan. Se enganchan en todo.',
        pedestal: 'Un pedestal donde el sueño puede descansar.'
      },
      courseDone: [
        { name: 'Sepulturero', text: 'Lo has conseguido. Haz que te sigan todo el camino, chico.' },
        { name: 'Sepulturero', text: 'Y que cuanto menos veas, más fuerte sea su brillo. Pero eso lo verás ahora.' }
      ],
      journalCourse: { id: 'siguen', title: 'Que te sigan', text: 'Los sueños se llevan con calma: sin giros bruscos ni prisas, y dando rodeos amplios para que no se enganchen.' },
      newEntry: 'Nueva entrada en el diario (J)'
    },

    act5: {
      title: 'Acto 5: Cuanto menos veas',
      intro: [
        { name: 'Sepulturero', text: 'Aquí abajo la luz estorba, chico. Haz que te sigan todo el camino. Y que cuanto menos veas, más fuerte sea su brillo.' }
      ],
      tipOn: 'Con la linterna encendida solo ves paredes. Apágala (F o el botón Linterna) y mira bien.',
      tipOff: 'Los símbolos brillan en la oscuridad. Fíjate en el orden en que se encienden.',
      tipRepeat: 'Pulsa los símbolos en el mismo orden en que se encendieron. Si te equivocas, volverán a mostrarse.',
      wrong: 'No era ese. Mira otra vez cómo se encienden.',
      symbolHint: 'Pulsar el símbolo',
      symbolsSolved: 'Los cinco símbolos responden a la vez y una puerta de piedra se abre al este.',
      journalSymbols: { id: 'simbolos', title: 'La luz estorba', text: 'En la cripta, con la linterna encendida solo se ven paredes. A oscuras, lo importante brilla.' },
      doorOpen: 'La puerta de piedra está abierta. Atraviésala.',
      rooms: [
        'Primera sala: la luz hace desaparecer los sueños. Apaga la linterna y sigue su brillo hasta la salida.',
        'Segunda sala: más paredes y menos luz. Enciende la linterna un momento si te pierdes; luego, apágala y sigue el brillo.',
        'Tercera sala: el camino da muchas vueltas. Cuanto menos veas, más fuerte brilla.'
      ],
      roomDone: ['Primera sala superada.', 'Segunda sala superada.'],
      lost: 'Notas una pared fría. Enciende la linterna un momento para ver dónde estás.',
      endDialogue: [
        { name: 'Sepulturero', text: '¿Lo ves, chico? Cuanto menos ves, más fuerte brilla.' },
        { name: 'Sepulturero', text: 'Ahora sal. Fuera te esperan los que dicen que no se puede.' }
      ],
      journalDark: { id: 'brillo', title: 'Brillo inverso', text: 'Cuanto menos veas, más fuerte es el brillo de los sueños. A veces hay que apagar la luz para ver bien.' }
    },

    act6: {
      title: 'Acto 6: Las dudas',
      intro: [
        'Fuera, el aire se llena de voces que no son de nadie.',
        'Dicen cosas que ya habías oído. No hacen daño: solo intentan apagar.'
      ],
      doubts: ['No vas a poder.', 'Es una tontería.', 'Déjalo.', '¿Para qué intentarlo?', 'Eso no sirve de nada.', 'Ya eres mayor para estas cosas.', 'Los demás se rieron.', 'Mejor no lo intentes.'],
      holdTie: 'Atar el sueño',
      holdPromptDesktop: 'Mantén pulsada E (o el botón del ratón) para sostener tu sueño, y aléjate de las sombras.',
      holdPromptTouch: 'Mantén pulsado Usar para sostener tu sueño, y aléjate de las sombras con el joystick.',
      barText: 'Sostén tu sueño: que el anillo se acerque al centro.',
      extinguished: 'El sueño parpadea y se apaga un instante... y vuelve a encenderse. Cuando quieras, sigue.',
      checkpoint: 'Cada vez brilla más fuerte.',
      holdDone: ['El sueño no se apagó.', 'Las voces se juntan en una sola, enorme.'],
      journalHold: { id: 'sosten', title: 'Sostén tu sueño', text: 'Las dudas apagan, pero un sueño sostenido brilla cada vez más fuerte. Hay que alejarse de las sombras y no soltarlo.' },
      bossIntro: ['Las voces se hicieron una figura: La Gente.', 'No pega ni persigue. Solo dice que no se puede.'],
      bossVoices: ['¿Y si fracasas?', 'Eso no es para ti.', 'Todos lo dijeron.', 'Hazte mayor.', 'Déjalo estar.'],
      legs: [
        'Primer tramo, en la oscuridad: apaga la linterna y sigue el brillo hasta el primer pedestal.',
        'Segundo tramo: sigue al sueño sin perderlo hasta el segundo pedestal.',
        'Último tramo: ata el hilo del corazón a la cabeza, sin tocar los brazos de La Gente.'
      ],
      legDone: ['Una de las voces se queda en silencio.', 'Otra voz calla. Quedan pocas.'],
      pedestal: 'Un pedestal donde el sueño puede descansar.',
      bossDone: [
        'La Gente se deshizo en voces pequeñas.',
        'Y cada una dijo algo distinto: «sigue», «puedes», «hazlo a tu manera».'
      ],
      afterVoices: ['Sigue.', 'Puedes.', 'Hazlo a tu manera.'],
      journalBoss: { id: 'gente', title: 'La Gente', text: 'La Gente dice que no se puede. Se supera con calma: en la oscuridad, siguiendo al sueño y atándolo bien fuerte.' },
      look: { sombra: 'Una zona de sombra. Mejor no acercarse.', gente: 'La Gente: una figura hecha de voces.', brazo: 'Un brazo de La Gente: un hilo hecho de voces. No lo toques.' }
    },

    act7: {
      title: 'Acto 7: El sueño del sepulturero',
      dawn: ['Amaneció sin que nadie lo notara.', 'El cementerio, a la luz del alba, parecía distinto.'],
      intro: [
        { name: 'Sepulturero', text: 'Has llegado lejos, chico.' },
        { name: 'Niño', text: '¡Pero, señor! ¿Y su sueño?' },
        { name: 'Sepulturero', text: 'El mío está aquí, pequeño. Lo puse aquí dentro.' }
      ],
      task: 'El sepulturero dice que su sueño está «aquí dentro». Mira a tu alrededor con calma: ¿dónde puede estar? Cuando lo sepas, díselo.',
      clueCount: (n, total) => 'Pistas: ' + n + '/' + total,
      clues: {
        t1: 'Una tumba antigua con flores frescas. Alguien las cambia cada semana.',
        t2: 'Las letras de esta lápida están repasadas una a una, con cuidado.',
        t3: 'La hierba de esta tumba está recortada a mano, no a máquina.',
        t4: 'Hay una piedra pequeña sobre esta tumba, siempre en el mismo sitio.',
        t5: 'Una lápida sin nombre, pero muy cuidada: alguien le habla cada noche.',
        t6: 'La tumba pequeña, la de dos años. Tiene un lazo recién atado.',
        lamp: 'Un farolillo con la mecha recién cortada. Está siempre encendido para los que duermen.',
        house: 'La casa del sepulturero: sencilla, sin caprichos. Su sueño no está guardado aquí dentro.'
      },
      needClues: 5,
      talkHints: ['Mira a tu alrededor, pequeño. ¿Qué tienen en común las cosas de este sitio?', 'Fíjate en cómo están las tumbas. Y en quién las cuida.'],
      tellHint: 'Decirle dónde está su sueño',
      ask: '¿Dónde está el sueño del sepulturero?',
      options: {
        casa: 'En su casa, guardado en un cajón',
        ataud: 'En el ataúd del fondo, bajo candado',
        bolsillo: 'En el bolsillo de su abrigo',
        todo: 'En todo el cementerio: en cada tumba cuidada'
      },
      wrong: {
        casa: 'Mi casa es sencilla, chico. No guardo nada que no se use.',
        ataud: 'El ataúd solo guarda lo que se rompió. Mi sueño no está roto.',
        bolsillo: 'Ahí solo caben las llaves. Mi sueño es más grande.'
      },
      notEnough: 'Aún no has mirado lo bastante. Fíjate en cómo están las tumbas.',
      solved: [
        { name: 'Niño', text: 'Su sueño es el cementerio. Cada tumba cuidada es un sueño que tuvo un buen fin.' },
        { name: 'Sepulturero', text: '(Ríe) El mío está aquí, pequeño. Lo puse aquí dentro. Me propuse que todos los sueños tuvieran un buen fin.' },
        { name: 'Sepulturero', text: 'Chico, espero que cuides bien de tus sueños.' },
        { name: 'Niño', text: '¡Sí, señor! He aprendido de usted que hay que cuidar bien de ellos.' },
        { name: 'Niño', text: 'Aunque usted sea un buen hombre, no quiero que mis sueños acaben aquí con usted. ¡Intentaré cumplir todos y cada uno de mis sueños!' }
      ],
      farewell: ['El sepulturero sonrió, se quitó el sombrero y echó a andar hacia su casa.', 'En paz.'],
      journalDream: { id: 'sueno', title: 'El sueño del sepulturero', text: 'Su sueño es el propio cementerio: cada tumba cuidada es un sueño que tuvo un buen fin.' },
      secretTitle: 'Mensaje oculto',
      secretDefault: 'Has encontrado todos los sueños escondidos. Gracias por cuidar de ellos.'
    },

    epilogue: {
      title: 'Epílogo: Cumplió su palabra',
      intro: [
        'Y cumplió su palabra.',
        'Por mucho que la gente le dijera, por muchas dudas que él tuviera, nada permitió que acabaran en el Cementerio de los Sueños.'
      ],
      jump: 'Pasaron los años.',
      tip: 'Recorre el camino y mira lo que fue de tus sueños.',
      emptyPlaque: 'El cementerio de los sueños está vacío. Ningún sueño acabó aquí.',
      stand: 'Un recuerdo',
      achievements: [
        { id: 'cohete', puzzle: 'p4_cohete', dream: 'cohete', title: 'El cohete', text: 'Dibujó un cohete en su cuaderno y, años después, ayudó a construir uno de verdad.' },
        { id: 'violin', puzzle: 'p4_violin', dream: 'violin', title: 'El violín', text: 'Aprendió a tocar. La primera noche que dio un concierto, dedicó la primera canción al sepulturero.' },
        { id: 'balon', puzzle: 'p4_balon', dream: 'balon', title: 'El balón', text: 'Jugó cada domingo con los niños del barrio. Ese balón nunca volvió a pincharse.' },
        { id: 'escapan', puzzle: 'p5_suenos', title: 'Los que se escapan', text: 'Siguió a sus sueños de seis y de siete años sin perderlos de vista, y alcanzó los dos.' },
        { id: 'nudo', puzzle: 'p7_nudo', title: 'El nudo', text: 'Aprendió a atar sus sueños bien fuerte a su corazón y a su cabeza. Ninguno se le perdió por el camino.' },
        { id: 'siguen', puzzle: 'p8_siguen', title: 'Que te sigan', text: 'Hizo que sus sueños le siguieran todo el camino, sin prisas y dando rodeos amplios.' },
        { id: 'brillo', puzzle: 'p10_brillo', title: 'Cuanto menos veas', text: 'Cuando todo se puso oscuro, supo fiarse del brillo de lo que de verdad importaba.' },
        { id: 'sosten', puzzle: 'p11_sosten', title: 'Sostén tu sueño', text: 'Las dudas siguieron llegando. Él siguió sosteniendo su sueño, cada vez más fuerte.' }
      ],
      bench: 'El banco del sepulturero. Hace tiempo que se jubiló, pero su sombrero sigue aquí.',
      toy: 'Tu juguete de siempre. Lo has guardado todos estos años.',
      gate: 'Salir del cementerio',
      gateText: 'La verja del cementerio, abierta. Ya no hay nada que encerrar.',
      credits: {
        title: 'Fin',
        lines: ['La noche del enterrador.', 'Un juego basado en el vídeo corto «El sepulturero».', '«Chico, espero que cuides bien de tus sueños.»'],
        forName: (n) => 'Para ' + n + '.',
        secretTitle: 'Final secreto',
        linkLabel: 'Ver el vídeo original',
        button: 'Volver a empezar'
      }
    }
  },

  texts: {
    intro: 'Esta noche no vas a dormir. Un niño, un sepulturero y un cementerio lleno de sueños: así se aprende lo que es la vida.',
    startButton: 'Empezar',
    controlsDesktop: 'WASD para moverte, ratón para mirar, clic o E para hablar o tocar. Esc abre el menú de pausa, M silencia el sonido y J abre el diario.',
    controlsTouch: 'Joystick a la izquierda para moverte, arrastra a la derecha para mirar y pulsa Usar para hablar o tocar. El botón Menú está arriba a la derecha.',
    emptyInventory: 'Bolsillos vacíos',
    hidden: {
      hint: 'Un sueño escondido',
      found: (n, total, line) => 'Sueño escondido ' + n + '/' + total + ': «' + line + '»',
      allFound: '¡Has reunido los 18 sueños escondidos!',
      journalTitle: (n, total) => 'Sueños escondidos (' + n + '/' + total + ')',
      graffitiLook: 'Alguien ha escrito aquí con tiza.'
    },
    rotate: 'Para jugar mejor, gira el móvil en horizontal.',
    resume: 'Haz clic para volver al juego'
  }
};
