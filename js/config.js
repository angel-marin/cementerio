// Todo lo que quieras personalizar sin tocar el código vive aquí.
export const CONFIG = {
  title: 'La noche del enterrador',

  // Escena que se carga al arrancar. Puedes cambiarla con ?escena=act3_brokenDreams en la URL.
  defaultScene: 'prologue',

  // Guardado automático en localStorage (progreso entre sesiones).
  persist: false,

  // Personalización de la sorpresa (se usará en la Fase 6).
  neighbor: {
    name: '',                 // nombre del vecino para la lápida o el grafiti
    secretMessage: '',        // mensaje final si encuentra los 18 sueños
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
    }
  },

  texts: {
    intro: 'Has saltado la tapia del camposanto y la verja se ha cerrado a tu espalda. Solo hay dos personas despiertas: un enterrador metido en su tumba y un niño sentado sobre una lápida.',
    startButton: 'Entrar en el cementerio',
    controlsDesktop: 'WASD para moverte, ratón para mirar, clic o E para hablar o tocar. Esc suelta el ratón. P abre el menú de depuración.',
    controlsTouch: 'Joystick a la izquierda para moverte, arrastra a la derecha para mirar y pulsa Usar para hablar o tocar. Toca tres veces el cuadro de bolsillos para el menú de depuración.',
    emptyInventory: 'Bolsillos vacíos',
    resume: 'Haz clic para volver al juego'
  }
};
