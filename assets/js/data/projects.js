/* ============================================================
   ESTUDIO UMBRAL · Datos de detalle de proyectos
   ---------------------------------------------------------------------------
   El HTML de cada tarjeta contiene lo esencial (nombre, tipo, ubicación,
   año, foto y descripción breve). Este archivo agrega SOLO el contenido
   extendido del modal: párrafo largo, ficha técnica y galería extra.
   Para editar un proyecto: cambiá el texto acá y, si hace falta, la ficha
   en index.html (ambos se identifican por la misma "clave" slug).
   ============================================================ */
(function (global) {
  "use strict";

  var UMBRAL = global.UMBRAL || (global.UMBRAL = {});

  UMBRAL.projectDetails = {
    terreno: {
      longText: [
        "La casa se organiza en torno a un patio que funciona como habitación sin techo: da luz al núcleo de día y protege del viento del oeste por las tardes. Todos los ambientes principales miran adentro, y las aberturas secundarias toman el paisaje sin exponerse.",
        "Se eligió un sistema constructivo simple y honesto: muros de hormigón visto que sostienen y aíslan, carpintería de pino termotratado que baja la escala al tacto y un zócalo de piedra local que resuelve el encuentro con el terreno.",
        "El equipamiento se resuelve con piezas de carpintería fija, de modo que la casa envejezca con pocos muebles y ninguno imprescindible."
      ],
      specs: [
        { k: "Superficie", v: "168 m² cubiertos" },
        { k: "Sistema", v: "Muro de hormigón visto + cubierta ventilada" },
        { k: "Materiales", v: "Hormigón, pino termotratado, piedra local" },
        { k: "Estado", v: "Proyecto de demostración" }
      ],
      gallery: [
        { src: "assets/img/g-terreno-a-1400.jpg", alt: "Interior del patio de la casa con banco corrido de madera y muro mineral en sombra.", cap: "Patio interior · banco corrido" },
        { src: "assets/img/g-terreno-b-1400.jpg", alt: "Vista exterior de la vivienda al atardecer con iluminación cálida en las aberturas.", cap: "Acceso al anochecer" }
      ]
    },

    mitre: {
      longText: [
        "El departamento tenía buena altura libre pero tres divisiones heredadas que robaban luz a cada ambiente. La reforma propone un único eje de circulación con almacenamiento continuo y libera la planta hacia la calle.",
        "El mueble corrido de suelo a techo hace de tapia y de guardarropa a la vez: oculta la ropa, ordena la circulación y devuelve a los ambientes su proporción original.",
        "Se recuperó el piso original donde estaba en buen estado y se repuso el resto con la misma madera, aceptando la mezcla como parte de la historia del lugar."
      ],
      specs: [
        { k: "Superficie", v: "74 m²" },
        { k: "Alcance", v: "Reforma integral + equipamiento" },
        { k: "Materiales", v: "Madera recuperada, cal, latón" },
        { k: "Estado", v: "Proyecto de demostración" }
      ],
      gallery: [
        { src: "assets/img/g-mitre-a-1400.jpg", alt: "Dormitorio minimalista con caja de madera, ropa de cama clara y luz lateral.", cap: "Dormitorio · cama-cajonera" },
        { src: "assets/img/g-mitre-b-1400.jpg", alt: "Baño revestido en tonos piedra con pileta exenta y grifería de líneas simples.", cap: "Baño · piedra y grifería sobria" }
      ]
    },

    cauce: {
      longText: [
        "Un estudio de treinta y dos metros cuadrados donde todo tenía que ocurrir sin que nada se pisara: trabajar, reunirse, guardar y, de vez en cuando, no hacer nada.",
        "Una única pieza de carpintería de roble resuelve las cuatro funciones. Alrededor, el resto queda libre: la mesa central se corre, las sillas se apilan y el espacio cambia de programa en diez minutos.",
        "La iluminación se trabaja en tres capas —trabajo, ambiente y acento— para que el mismo lugar sirva a una videollamada de la mañana y a una cena larga."
      ],
      specs: [
        { k: "Superficie", v: "32 m²" },
        { k: "Alcance", v: "Diseño de interiores y mobiliario a medida" },
        { k: "Materiales", v: "Robble, acero pintado, linóleo" },
        { k: "Estado", v: "Proyecto de demostración" }
      ],
      gallery: [
        { src: "assets/img/g-cauce-a-1400.jpg", alt: "Rincón de descanso con butaca, alfombra y estantería abierta junto a la ventana.", cap: "Rincón de descanso" },
        { src: "assets/img/g-cauce-b-1400.jpg", alt: "Cocina compacta con frentes lisos, mesada clara y planta maceta sobre la repisa.", cap: "Cocina de apoyo" }
      ]
    },

    loma: {
      longText: [
        "El terreno baja en pendiente suave hacia el oeste. En lugar de terrazarlo todo, la casa lo sigue: dos volúmenes desplazados que se apoyan en la cota natural y dejan entre ambos un alero protegido.",
        "Ese alero es la entrada, el vestíbulo y el comedor de verano. Es el espacio donde la arquitectura se vuelve umbral: ni adentro ni afuera, con sombra suficiente a mediodía.",
        "La fachada oeste se protege con un voladizo calculado para cortar el sol de verano y dejar entrar el de invierno, cuando la luz llega casi rasante."
      ],
      specs: [
        { k: "Superficie", v: "142 m² en dos plantas" },
        { k: "Sistema", v: "Dos volúmenes sobre losa, alero intermediario" },
        { k: "Materiales", v: "Muro blanco, madera, aluminio anodizado" },
        { k: "Estado", v: "Proyecto de demostración" }
      ],
      gallery: [
        { src: "assets/img/g-loma-a-1400.jpg", alt: "Estar con ventanal alto, cortinas ligeras y mobiliario de líneas bajas.", cap: "Estar hacia el alero" },
        { src: "assets/img/g-loma-b-1400.jpg", alt: "Exterior de la casa entre vegetación con terraza de madera y sombra proyectada.", cap: "Terraza al oeste" }
      ]
    },

    ribera: {
      longText: [
        "La consigna fue sustractiva: quitar divisiones, quitar trimamientos, quitar capas hasta llegar a lo que el piso tenía para dar. Lo que quedó en pie se reparó; lo que sobraba, desapareció.",
        "La cocina se mudó al frente, donde antes había un pasillo sin uso, y ganó una relación directa con la calle. Los dormitorios quedaron hacia el fondo, en silencio, con luz de patio.",
        "El mobiliario se proyectó a medida para liberar superficie: mesada continua, biblioteca empotrada y un mueble bajo que corre bajo toda la ventana del estar."
      ],
      specs: [
        { k: "Superficie", v: "96 m²" },
        { k: "Alcance", v: "Reforma + amoblamiento a medida" },
        { k: "Materiales", v: "Piso recuperado, roble, pintura mate" },
        { k: "Estado", v: "Proyecto de demostración" }
      ],
      gallery: [
        { src: "assets/img/g-ribera-a-1400.jpg", alt: "Cocina de líneas rectas con isla baja, frentes lisos y ventanal amplio.", cap: "Cocina hacia la calle" },
        { src: "assets/img/g-ribera-b-1400.jpg", alt: "Pasillo con biblioteca empotrada de madera iluminado por luz natural.", cap: "Biblioteca empotrada" }
      ]
    },

    pehuen: {
      longText: [
        "Una construcción de los años sesenta, firme en su estructura pero hermética en su relación con el paisaje. La rehabilitación conserva lo que funciona y reemplaza lo que no: envolvente, instalaciones y aberturas.",
        "El frente se abre por completo hacia el valle con carpintería de gran formato, mientras que la parte posterior queda casi ciega, protegida de los vientos fríos de la ladera.",
        "Se incorporó una instalación de bajo consumo y se revistieron los muros interiores con madera de la zona, dejando a la vista las huellas de la construcción original en los sectores comunes."
      ],
      specs: [
        { k: "Superficie", v: "110 m² + galería" },
        { k: "Alcance", v: "Rehabilitación energética integral" },
        { k: "Materiales", v: "Madera local, doble vidrio, acero" },
        { k: "Estado", v: "Proyecto de demostración" }
      ],
      gallery: [
        { src: "assets/img/g-pehuen-a-1400.jpg", alt: "Escalera interior de madera junto a muro claro, iluminada por una claraboya.", cap: "Escalera y claraboya" },
        { src: "assets/img/g-pehuen-b-1400.jpg", alt: "Ambiente principal con ventanal hacia el valle, madera en paredes y techo inclinado.", cap: "Estar hacia el valle" }
      ]
    }
  };
})(window);
