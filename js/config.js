// Todo lo que quieras personalizar sin tocar el código vive aquí.
export const CONFIG = {
  title: 'La noche del enterrador',

  // Escena que se carga al arrancar. Puedes cambiarla con ?escena=act3_brokenDreams en la URL.
  defaultScene: 'prototype',

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
    llave: 'Llave oxidada'
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
