// Vocabulario de Habla (ver docs/diccionario.md y docs/organizacion.md).
//
// Formato de cada lista: palabras separadas por coma (o por "|" si son frases con comas).
//   "palta=aguacate"  → se muestra "palta"; "aguacate" sirve para buscar el pictograma y en el buscador.
//   "bañar(se)"       → verbo reflexivo (me baño, te bañas…).
//   "pelota#noun"     → cambia la clase gramatical solo para esa palabra.

import type { WordClass } from '../lib/types'

export interface VocabGroup {
  name: string
  cls: WordClass
  words: string
  /** Consulta para el pictograma de la subcarpeta. */
  icon?: string
}

export interface VocabFolder {
  id: string
  name: string
  icon: string
  /** Se abre como ventana emergente (Palabritas, Preguntas). */
  popup?: boolean
  /** Frases de arranque al comienzo de la carpeta. */
  starters?: string
  groups: VocabGroup[]
}

/** Palabras de Inicio con su clase (las posiciones están en layouts.ts). */
export const HOME_WORDS: Record<WordClass, string> = {
  pron: 'yo, tú, él, ella, nosotros, ellos, ustedes, eso, esto, aquello',
  verb:
    'querer, ir, ser, estar, tener, hacer, poder, gustar, necesitar, ayudar, dar, venir, ver, mirar, decir, saber, ' +
    'comer, tomar=beber, jugar, parar, terminar, poner, pensar, hay=haber, doler, salir, volver, abrir, sentir, ' +
    'escuchar, esperar, buscar',
  det: 'el, un',
  prep: 'a, de, en, con, para, por, sin',
  conj: 'y, o, pero, porque, que, si',
  quest: 'qué, dónde, quién, cuándo, cómo, por qué',
  adv: 'aquí, ahí, allá=allí, arriba, abajo, adentro=dentro, afuera=fuera, ahora, después, ya, hoy, mañana, ayer, otra vez, muy, también, menos, bien, mal, algo, nada, más',
  adj: 'otro, todo, mucho, poco, bueno, malo, grande, chico=pequeño, diferente, mismo',
  neg: 'no',
  social: 'sí, hola, chao=adiós, por favor, gracias, ya terminé=terminar, ayuda=ayudar, no sé=no saber, espera=esperar',
  noun: '',
  misc: '',
}

export const FOLDERS: VocabFolder[] = [
  {
    id: 'palabritas',
    name: 'Palabritas',
    icon: 'palabra',
    popup: true,
    groups: [
      { name: 'Artículos', cls: 'det', words: 'el, la, los, las, lo, un, una, unos, unas, al, del' },
      { name: 'Preposiciones', cls: 'prep', words: 'a, ante, bajo, con, contra, de, desde, durante, en, entre, hacia, hasta, para, por, según, sin, sobre, tras' },
      { name: 'Lugar', cls: 'prep', words: 'al lado de, cerca de, lejos de, delante de, detrás de, encima de, debajo de, dentro de, fuera de, enfrente de, alrededor de, antes de, después de' },
      { name: 'Unir ideas', cls: 'conj', words: 'y, o, ni, pero, sino, porque, que, si, cuando, como, aunque, mientras, entonces, pues, así que, o sea, además, por eso' },
      { name: 'Personas', cls: 'pron', words: 'yo, tú, él, ella, usted, nosotros, nosotras, ustedes, ellos, ellas, me, te, se, lo, la, le, nos, los, las, les, mí, ti, conmigo, contigo' },
      { name: 'De quién', cls: 'pron', words: 'mi, mis, tu, tus, su, sus, nuestro, nuestra, mío, mía, tuyo, tuya, suyo, suya' },
      { name: 'Este, ese', cls: 'pron', words: 'este, esta, estos, estas, esto, ese, esa, esos, esas, eso, aquel, aquella, aquello' },
      { name: 'Alguien, algo', cls: 'pron', words: 'alguien, nadie, algo, nada, alguno, ninguno, cualquiera, todos, cada uno, lo que' },
      { name: 'Cantidad', cls: 'adj', words: 'más, menos, mucho, poco, todo, bastante, demasiado, harto, varios, cada, medio, mitad, otro, mismo, tanto, suficiente, casi, solo, entero' },
      { name: 'Sí, no, quizás', cls: 'adv', words: 'sí#social, no#neg, también, tampoco, nunca, jamás, quizás, tal vez, a lo mejor, claro, por supuesto, de verdad, en serio, obvio, ni idea' },
      { name: 'Cómo', cls: 'adv', words: 'así, bien, mal, mejor, peor, rápido, lento, despacio, fuerte, suave, juntos, solo, igual, de nuevo, otra vez, al revés, a propósito, sin querer' },
    ],
  },
  {
    id: 'preguntas',
    name: 'Preguntas',
    icon: 'pregunta',
    popup: true,
    groups: [
      { name: 'Palabras', cls: 'quest', words: 'qué, quién, quiénes, dónde, adónde, cuándo, cómo, por qué, para qué, cuál, cuáles, cuánto, cuántos, de quién' },
      {
        name: 'Frases',
        cls: 'quest',
        words:
          '¿qué es eso?|¿qué pasa?|¿qué pasó?|¿qué hora es?|¿qué vamos a hacer?|¿qué hay de comer?|¿dónde está?|¿dónde vamos?|' +
          '¿quién es?|¿quién viene?|¿de quién es?|¿cuándo vamos?|¿cuándo termina?|¿cuándo viene?|¿cómo estás?|¿cómo te llamas?|' +
          '¿cómo se hace?|¿cómo se dice?|¿por qué?|¿para qué sirve?|¿puedo?|¿me ayudas?|¿me das?|¿vamos?|¿jugamos?|' +
          '¿me escuchas?|¿cuánto falta?|¿cuánto cuesta?|¿cuántos años tienes?|¿te gusta?|¿quieres?|¿estás bien?|¿verdad?',
      },
    ],
  },
  {
    id: 'personas',
    name: 'Personas',
    icon: 'familia',
    starters: 'quiero ver a|¿dónde está?|llama a|¿quién es?',
    groups: [
      { name: 'Familia', cls: 'noun', icon: 'familia', words: 'mamá, papá, hermano, hermana, abuelo, abuela, tata=abuelo, tío, tía, primo, prima, hijo, hija, bebé, guagua=bebé, esposo, esposa, pololo=novio, polola=novia, sobrino, sobrina, padrino, madrina, familia, mascota' },
      { name: 'Gente', cls: 'noun', icon: 'personas', words: 'amigo, amiga, compañero, compañera, niño, niña, hombre, mujer, señor, señora, joven, persona, gente, vecino, vecina, visita' },
      { name: 'Escuela y terapia', cls: 'noun', icon: 'profesor', words: 'profesor, profesora, tía=profesora, tío=profesor, educadora, asistente, director, directora, fonoaudiólogo=logopeda, terapeuta ocupacional=terapeuta, kinesiólogo=fisioterapeuta, psicólogo, psicopedagogo' },
      { name: 'Comunidad', cls: 'noun', icon: 'policía', words: 'doctor=médico, doctora=médica, enfermero, enfermera, dentista, carabinero=policía, bombero, chofer=conductor, vendedor, cajero, cartero, cocinero, garzón=camarero, guardia, nana=niñera' },
    ],
  },
  {
    id: 'acciones',
    name: 'Acciones',
    icon: 'acción',
    starters: 'quiero|vamos a|puedo|necesito|ayúdame a|no quiero',
    groups: [
      { name: 'Necesidades', cls: 'verb', icon: 'dormir', words: 'comer, tomar=beber, tragar, masticar, dormir, despertar(se)=despertar, descansar, acostar(se)=acostar, levantar(se)=levantar, bañar(se)=bañar, duchar(se)=ducharse, lavar(se)=lavar, secar(se)=secar, peinar(se)=peinar, cepillar(se) los dientes=cepillar los dientes, vestir(se)=vestir, desvestir(se)=desvestir, poner(se)=poner, sacar(se)=quitar, ir al baño=váter, hacer pipí=orinar, hacer caca=defecar, sonar(se) la nariz=sonarse, respirar, toser, estornudar, vomitar, sangrar, doler, picar, sudar, tener frío=frío, tener calor=calor, tener hambre=hambre, tener sed=sed, tener sueño=sueño' },
      { name: 'Moverse', cls: 'verb', icon: 'correr', words: 'ir, venir, volver, llegar, salir, entrar, caminar=andar, correr, saltar, subir, bajar, sentar(se)=sentar, parar(se)=levantarse, agachar(se)=agacharse, caer(se)=caer, girar, dar vuelta=girar, empujar, tirar, arrastrar, mover(se)=mover, quedar(se)=quedarse, esperar, seguir, alcanzar, nadar, trepar, bailar, columpiar(se)=columpiar, andar en bici=montar en bicicleta, manejar=conducir' },
      { name: 'Manos y cosas', cls: 'verb', icon: 'coger', words: 'dar, tomar=coger, agarrar=coger, poner, sacar, traer, llevar, abrir, cerrar, tocar, apretar, soltar, lanzar, atrapar, guardar, ordenar, buscar, encontrar, perder, esconder, mostrar, compartir, prestar, devolver, cambiar, cortar, pegar, romper, arreglar, construir, armar=montar, desarmar=desmontar, llenar, vaciar, echar, mezclar, revolver=remover, servir, prender=encender, apagar, cargar, enchufar, colgar, doblar, envolver, limpiar, lavar, secar, barrer, botar=tirar a la basura' },
      { name: 'Hablar y pensar', cls: 'verb', icon: 'hablar', words: 'decir, hablar, contar, preguntar, responder, llamar, gritar, susurrar, cantar, explicar, repetir, escuchar, oír, mirar, ver, leer, escribir, deletrear, saber, conocer, pensar, creer, entender, acordar(se)=recordar, olvidar, aprender, enseñar, estudiar, elegir, decidir, probar, intentar, imaginar, soñar, adivinar, mentir, prometer, avisar, pedir, invitar, saludar, despedir(se)=despedir' },
      { name: 'Sentir', cls: 'verb', icon: 'sentir', words: 'querer, gustar, encantar, odiar, sentir, molestar, importar, preocupar(se)=preocupar, asustar(se)=asustar, enojar(se)=enfadarse, aburrir(se)=aburrir, cansar(se)=cansar, calmar(se)=calmar, relajar(se)=relajar, reír(se)=reír, sonreír, llorar, abrazar, besar, acariciar, cuidar, ayudar, pelear, perdonar, disculpar(se)=disculpar, extrañar=echar de menos, confiar, ganar, perder, portarse bien, portarse mal' },
      { name: 'Casa y escuela', cls: 'verb', icon: 'cocinar', words: 'jugar, pintar, dibujar, colorear, recortar, escribir, leer, contar, sumar, restar, cocinar, freír, hornear, calentar, enfriar, comprar, pagar, vender, trabajar, ver tele=ver la televisión, ver videos=vídeo, escuchar música, sacar fotos=fotografiar, grabar, mandar mensaje=mensaje, llamar por teléfono=llamar por teléfono, pasear, viajar, visitar, celebrar, regalar, patear=chutar' },
      { name: 'Ser y estar', cls: 'verb', icon: 'ser', words: 'ser, estar, tener, hacer, poder, deber, tener que, ir a, acabar de, empezar, terminar, seguir, parecer, pasar, quedar, faltar, sobrar, valer, costar, necesitar' },
    ],
  },
  {
    id: 'describir',
    name: 'Describir',
    icon: 'descripción',
    starters: 'es|está|es muy|me parece',
    groups: [
      { name: 'Opinión', cls: 'adj', icon: 'bueno', words: 'bueno, malo, rico, asqueroso, bonito, lindo=bonito, feo, divertido, aburrido, fácil, difícil, genial, bacán=genial, entretenido, raro, importante, favorito, perfecto, horrible, increíble, peligroso, seguro, correcto, incorrecto' },
      { name: 'Tamaño y forma', cls: 'adj', icon: 'tamaño', words: 'grande, chico=pequeño, mediano, enorme, alto, bajo, largo, corto, ancho, angosto=estrecho, gordo, flaco=delgado, grueso, delgado, redondo, cuadrado, recto' },
      { name: 'Cómo está', cls: 'adj', icon: 'caliente', words: 'caliente, tibio, frío, helado, duro, blando, suave, áspero, liso, mojado, seco, limpio, sucio, nuevo, viejo, roto, lleno, vacío, abierto, cerrado, prendido=encendido, apagado, pesado, liviano=ligero, fuerte, débil, pegajoso' },
      { name: 'Sabor y olor', cls: 'adj', icon: 'sabor', words: 'dulce, salado, ácido, amargo, picante, sabroso, desabrido=soso, quemado, crudo, cocido, apestoso=mal olor' },
      { name: 'Comparar', cls: 'adj', icon: 'comparar', words: 'igual, diferente, parecido, mismo, mejor, peor, mayor, menor, primero, último, siguiente, rápido, lento, ruidoso, silencioso, claro, oscuro' },
      { name: 'Personas', cls: 'adj', icon: 'simpático', words: 'joven, viejo, simpático, pesado=antipático, amable, chistoso=gracioso, tímido, valiente, inteligente, cariñoso, ordenado, desordenado, travieso, educado' },
      { name: 'Colores', cls: 'adj', icon: 'colores', words: 'rojo, azul, amarillo, verde, naranjo=naranja, morado, rosado=rosa, blanco, negro, café=marrón, gris, celeste, dorado, plateado' },
      { name: 'Formas', cls: 'noun', icon: 'formas', words: 'círculo, cuadrado, triángulo, rectángulo, estrella, corazón, óvalo, rombo, línea, punto' },
    ],
  },
  {
    id: 'sentimientos',
    name: 'Sentimientos',
    icon: 'emociones',
    starters: 'estoy|me siento|no estoy|¿cómo estás?',
    groups: [
      {
        name: 'Sentimientos',
        cls: 'adj',
        words:
          'feliz=contento, contento, triste, enojado=enfadado, furioso, asustado, nervioso, preocupado, tranquilo, cansado, aburrido, sorprendido, ' +
          'emocionado, orgulloso, avergonzado, celoso, confundido, frustrado, solo, aliviado, enamorado, cómodo, incómodo, relajado, ' +
          'enfermo, mareado, bien#adv, mal#adv, más o menos#social',
      },
      {
        name: 'Frases',
        cls: 'social',
        words:
          'tengo hambre=hambre|tengo sed=sed|tengo sueño=sueño|tengo frío=frío|tengo calor=calor|tengo miedo=miedo|tengo pena=triste|' +
          'me da vergüenza=vergüenza|necesito un descanso=descansar|necesito estar solo=solo|quiero un abrazo=abrazo|estoy bien=bien|no estoy bien=mal',
      },
    ],
  },
  {
    id: 'cuerpo',
    name: 'Cuerpo y salud',
    icon: 'cuerpo',
    starters: 'me duele|me pica|me golpeé|mira mi',
    groups: [
      { name: 'Cuerpo', cls: 'noun', icon: 'cuerpo', words: 'cabeza, pelo, cara, frente, ojos=ojo, cejas=ceja, nariz, boca, labios=labio, dientes=diente, lengua, orejas=oreja, cachetes=mejilla, cuello, garganta, hombro, brazo, codo, mano, dedos=dedo, uñas=uña, pecho, guata=barriga, ombligo, espalda, cintura, poto=culo, pierna, rodilla, pie, piel, sangre, huesos=hueso, corazón, cuerpo, pene, vulva' },
      { name: 'Salud', cls: 'noun', icon: 'médico', words: 'dolor, fiebre, resfrío=resfriado, tos, mocos, alergia, herida, moretón=hematoma, quemadura, picadura, vómito, diarrea, mareo, remedio=medicamento, jarabe, pastilla, inhalador, vacuna, inyección, termómetro, curita=tirita, venda, crema, silla de ruedas, lentes=gafas, audífono, hospital, consultorio=centro de salud, ambulancia' },
      { name: 'Higiene', cls: 'noun', icon: 'higiene', words: 'baño=váter, taza del baño=inodoro, pelela=orinal, pañal, papel higiénico, toalla, jabón, champú, cepillo de dientes, pasta de dientes, peineta=peine, cepillo, toallitas húmedas, pañuelo, desodorante, ducha, tina=bañera, lavamanos=lavabo' },
    ],
  },
  {
    id: 'comida',
    name: 'Comida',
    icon: 'comida',
    starters: 'quiero comer|tengo hambre|me gusta|no me gusta|ya no quiero|está rico',
    groups: [
      { name: 'Comidas del día', cls: 'noun', icon: 'desayuno', words: 'desayuno, almuerzo=comida, once=merienda, cena, colación=tentempié, postre' },
      { name: 'Desayuno y once', cls: 'noun', icon: 'pan', words: 'pan, marraqueta=pan, hallulla=pan, tostada, mantequilla, mermelada, manjar=dulce de leche, palta=aguacate, jamón, queso, huevo, huevo revuelto, cereal, avena, yogur, leche, panqueque=crepe, galletas=galleta' },
      { name: 'Frutas', cls: 'noun', icon: 'fruta', words: 'manzana, plátano, naranja, mandarina, pera, uva, frutilla=fresa, sandía, melón, durazno=melocotón, ciruela, kiwi, piña, mango, cereza, arándano, frambuesa, limón, chirimoya, fruta picada=macedonia' },
      { name: 'Verduras', cls: 'noun', icon: 'verdura', words: 'tomate, lechuga, zanahoria, papa=patata, choclo=maíz, arvejas=guisante, porotos verdes=judías verdes, brócoli, coliflor, zapallo=calabaza, zapallo italiano=calabacín, pepino, cebolla, ajo, pimentón=pimiento, betarraga=remolacha, espinaca, apio, champiñones=champiñón, ensalada' },
      { name: 'Platos', cls: 'noun', icon: 'plato', words: 'arroz, fideos=pasta, tallarines=espaguetis, puré, papas fritas=patatas fritas, pollo, carne, pescado, vienesa=salchicha, hamburguesa, pizza, sopa, cazuela=estofado, porotos=judías, lentejas, garbanzos, pastel de choclo=pastel, empanada, completo=perrito caliente, sándwich=bocadillo, tortilla, tacos=taco, sushi, nuggets=nuggets de pollo, milanesa=filete empanado, croquetas, huevo frito, guiso' },
      { name: 'Snacks y dulces', cls: 'noun', icon: 'golosinas', words: 'galleta, papas de bolsa=patatas fritas, ramitas=snack, cabritas=palomitas, chocolate, dulces=caramelo, chicle, helado, torta=tarta, queque=bizcocho, alfajor, gomitas=gominola, barra de cereal, flan, gelatina, arroz con leche, mote con huesillo=melocotón, compota' },
      { name: 'Bebidas', cls: 'noun', icon: 'bebida', words: 'agua, agua con gas, leche, leche con chocolate=cacao, jugo=zumo, bebida=refresco, té, café, chocolate caliente, batido, agua de hierbas=infusión, mamadera=biberón, vaso, botella, taza, bombilla=pajita, hielo' },
      { name: 'Para la comida', cls: 'noun', icon: 'sal', words: 'sal, azúcar, aceite, vinagre, mayonesa, ketchup, mostaza, pebre=salsa, salsa, pimienta, miel' },
    ],
  },
  {
    id: 'cosas',
    name: 'Cosas',
    icon: 'objetos',
    starters: 'quiero|dame|¿dónde está?|necesito',
    groups: [
      { name: 'Casa', cls: 'noun', icon: 'casa', words: 'cama, almohada, frazada=manta, sábana, cojín, sillón=sofá, silla, mesa, escritorio, repisa=estante, closet=armario, cajón, puerta, ventana, cortina, lámpara, luz, enchufe, alfombra, espejo, reloj, estufa=calefactor, ventilador, llave, basurero=papelera, escalera, ascensor' },
      { name: 'Cocina', cls: 'noun', icon: 'cocina', words: 'plato, vaso, taza, cuchara, tenedor, cuchillo, cucharita, servilleta, olla, sartén, hervidor, refrigerador=nevera, congelador, cocina, horno, microondas, lavaplatos=fregadero, táper, bolsa, mantel' },
      { name: 'Tecnología', cls: 'noun', icon: 'ordenador', words: 'celular=móvil, teléfono, tablet=tableta, computador=ordenador, tele=televisión, control remoto=mando a distancia, audífonos=auriculares, parlante=altavoz, cargador, cable, batería, internet, wifi, cámara, consola, video=vídeo, foto, música, juego, YouTube=video, mensaje, contraseña' },
      { name: 'Mis cosas', cls: 'noun', icon: 'mochila', words: 'mochila, bolso, billetera=cartera, plata=dinero, llaves=llave, lentes=gafas, reloj, paraguas, botella, peluche, chupete, tuto=manta' },
    ],
  },
  {
    id: 'ropa',
    name: 'Ropa',
    icon: 'ropa',
    starters: 'quiero ponerme|sácame|me aprieta|ayúdame a vestirme',
    groups: [
      { name: 'Ropa', cls: 'noun', words: 'polera=camiseta, camisa, blusa, polerón=sudadera, chaleco=jersey, chaqueta, parka=abrigo, pantalón, buzo=chándal, jeans=vaqueros, short=pantalón corto, falda, vestido, calzones=bragas, calzoncillos, calcetines=calcetín, pantys=medias, pijama, zapatos=zapato, zapatillas=zapatillas de deporte, botas=bota, sandalias=sandalia, pantuflas=zapatillas de casa, gorro, jockey=gorra, bufanda, guantes=guante, cinturón, uniforme, delantal, traje de baño=bañador, lentes de sol=gafas de sol, aros=pendientes, collar, pulsera, cierre=cremallera, botones=botón, cordones=cordón' },
    ],
  },
  {
    id: 'lugares',
    name: 'Lugares',
    icon: 'lugares',
    starters: 'quiero ir a|vamos a|estoy en|¿dónde está?',
    groups: [
      { name: 'Casa', cls: 'noun', icon: 'casa', words: 'casa, pieza=dormitorio, baño=cuarto de baño, cocina, living=salón, comedor, patio, jardín, terraza, garage=garaje, casa de la abuela=casa, casa del papá=casa, casa de la mamá=casa' },
      { name: 'Barrio', cls: 'noun', icon: 'ciudad', words: 'colegio, jardín infantil=guardería, sala=aula, gimnasio, biblioteca, casino=comedor escolar, parque, plaza, juegos=parque infantil, supermercado, almacén=tienda, feria=mercado, mall=centro comercial, tienda, farmacia, panadería, restaurante, cine, piscina, iglesia, banco, consultorio=centro de salud, hospital, dentista, terapia, peluquería' },
      { name: 'Paseos', cls: 'noun', icon: 'excursión', words: 'calle, vereda=acera, playa, mar, río, lago, cerro=montaña, campo, bosque, nieve, zoológico, granja, circo, museo, estadio, cancha=campo de fútbol, aeropuerto, estación, ciudad' },
      { name: 'Transporte', cls: 'noun', icon: 'transporte', words: 'auto=coche, micro=autobús, metro, tren, taxi, camión, camioneta=furgoneta, moto, bicicleta, scooter=patinete, patineta=monopatín, avión, helicóptero, barco, bote=barca, ambulancia, carro de bomberos=camión de bomberos, auto de policía=coche de policía, coche de guagua=cochecito, silla de auto=silla de coche, cinturón de seguridad, paradero=parada de autobús, semáforo' },
    ],
  },
  {
    id: 'animales',
    name: 'Animales',
    icon: 'animales',
    starters: 'mira|quiero ver|me gusta|¿qué animal es?',
    groups: [
      { name: 'Mascotas', cls: 'noun', icon: 'mascota', words: 'perro, gato, pez, hámster, conejo, tortuga, loro, canario, cuy=cobaya' },
      { name: 'Granja', cls: 'noun', icon: 'granja', words: 'vaca, caballo, chancho=cerdo, oveja, cabra, gallina, gallo, pollito, pato, burro, pavo' },
      { name: 'Salvajes', cls: 'noun', icon: 'león', words: 'león, tigre, elefante, jirafa, mono, oso, cebra, hipopótamo, rinoceronte, cocodrilo, serpiente, lobo, zorro, ciervo, canguro, koala, panda, puma, cóndor, dinosaurio' },
      { name: 'Mar', cls: 'noun', icon: 'mar', words: 'ballena, delfín, tiburón, pulpo, medusa, estrella de mar, cangrejo, foca, lobo marino=león marino, pingüino' },
      { name: 'Bichos', cls: 'noun', icon: 'insecto', words: 'mariposa, abeja, hormiga, mosca, zancudo=mosquito, araña, chinita=mariquita, caracol, gusano, saltamontes, pájaro, paloma, búho, águila, gaviota' },
      { name: 'Naturaleza', cls: 'noun', icon: 'naturaleza', words: 'sol, luna, estrella, cielo, nube, lluvia, nieve, viento, arcoíris, tormenta, trueno, rayo, temblor=terremoto, árbol, flor, pasto=césped, hoja, planta, tierra, arena, piedra, fuego, volcán' },
      { name: 'Clima', cls: 'social', icon: 'tiempo atmosférico', words: 'hace calor=calor|hace frío=frío|está lloviendo=llover|está nublado=nublado|hay sol=sol|está temblando=terremoto' },
    ],
  },
  {
    id: 'tiempo',
    name: 'Tiempo',
    icon: 'calendario',
    starters: '¿qué hora es?|¿cuándo?|¿qué día es hoy?',
    groups: [
      { name: 'Cuándo', cls: 'adv', icon: 'cuándo', words: 'hoy, mañana, ayer, ahora, después, antes, luego, pronto, temprano, tarde, todavía, ya, siempre, nunca, a veces, al tiro=inmediatamente, un ratito=rato, en la mañana=mañana, en la tarde=tarde, en la noche=noche, el fin de semana=fin de semana' },
      { name: 'Día y hora', cls: 'noun', icon: 'reloj', words: 'mañana, mediodía, tarde, noche, día, hora, minuto, semana, mes, año, cumpleaños, reloj, calendario, la una, las dos, las tres, y media, en punto' },
      { name: 'Días', cls: 'noun', icon: 'semana', words: 'lunes, martes, miércoles, jueves, viernes, sábado, domingo, fin de semana' },
      { name: 'Meses', cls: 'noun', icon: 'mes', words: 'enero, febrero, marzo, abril, mayo, junio, julio, agosto, septiembre, octubre, noviembre, diciembre, verano, otoño, invierno, primavera, vacaciones' },
    ],
  },
  {
    id: 'numeros',
    name: 'Números',
    icon: 'números',
    groups: [
      { name: 'Números', cls: 'adj', words: 'cero, uno, dos, tres, cuatro, cinco, seis, siete, ocho, nueve, diez, once, doce, trece, catorce, quince, veinte, treinta, cuarenta, cincuenta, cien, mil, primero, segundo, tercero, último, la mitad=mitad, el doble=doble, número#noun, contar#verb' },
    ],
  },
  {
    id: 'escuela',
    name: 'Escuela',
    icon: 'colegio',
    starters: 'necesito|no entiendo|ya terminé|¿me ayudas?|¿puedo ir al baño?',
    groups: [
      { name: 'Materiales', cls: 'noun', icon: 'material escolar', words: 'lápiz, lápices de colores, lápiz pasta=bolígrafo, plumón=rotulador, goma=goma de borrar, sacapuntas, regla, tijeras, pegamento, cuaderno, libro, hoja=papel, carpeta, estuche, mochila, pizarra, computador=ordenador, tablet=tableta' },
      { name: 'En clase', cls: 'noun', icon: 'clase', words: 'tarea=deberes, prueba=examen, nota, trabajo, dibujo, recreo, colación=tentempié, clase, sala=aula, patio, biblioteca, gimnasio, fila, turno, campana, horario, cuento, canción, letras=letra, números=número' },
      { name: 'Ramos', cls: 'noun', icon: 'asignatura', words: 'educación física, matemáticas, lenguaje=lengua, ciencias, historia, música, arte=plástica, inglés, religión' },
    ],
  },
  {
    id: 'diversion',
    name: 'Diversión',
    icon: 'jugar',
    starters: 'quiero jugar|¿jugamos?|me toca|te toca|otra vez|gané|perdí',
    groups: [
      { name: 'Juguetes', cls: 'noun', icon: 'juguete', words: 'pelota, muñeca, peluche, autitos=coche de juguete, legos=construcciones, puzzle, plasticina=plastilina, burbujas=pompas de jabón, globo, cuerda, trompo=peonza, yoyo, volantín=cometa, pistola de agua, títeres=títere, cocinita=cocina de juguete, disfraz, cartas, dados, juego de mesa, memorice=memoria, dominó' },
      { name: 'Juegos', cls: 'noun', icon: 'juego', words: 'escondida=escondite, pinta=pillapilla, saltar la cuerda=saltar a la comba, columpio, resbalín=tobogán, balancín, arenero, manualidades, plaza' },
      { name: 'Deportes', cls: 'noun', icon: 'deporte', words: 'fútbol, básquetbol=baloncesto, tenis, natación, gimnasia, atletismo, ciclismo, vóleibol=voleibol, patinaje, karate, gol, partido, equipo, cancha=campo de fútbol' },
      { name: 'Tele y música', cls: 'noun', icon: 'televisión', words: 'tele=televisión, monitos=dibujos animados, película, serie, video=vídeo, YouTube=video, videojuego, canción, música, radio, audífonos=auriculares, más fuerte#social=volumen, más despacio#social=bajo' },
      { name: 'Fiestas', cls: 'noun', icon: 'fiesta', words: 'cumpleaños, fiesta, torta=tarta, velas=vela, regalo, globos=globo, sorpresa, invitación, Navidad, Viejito Pascuero=Papá Noel, árbol de Navidad, Año Nuevo, Fiestas Patrias=bandera de Chile, fonda=fiesta, cueca=baile, empanadas=empanada, Semana Santa, conejo de Pascua=conejo, huevos de chocolate=huevo de chocolate, Halloween, Día de la Madre, Día del Padre, Día del Niño, vacaciones, paseo=excursión, matrimonio=boda' },
      { name: 'Saludos de fiesta', cls: 'social', icon: 'felicitar', words: '¡feliz cumpleaños!=cumpleaños|¡feliz Navidad!=Navidad|¡feliz año nuevo!=Año Nuevo|¡felicidades!=felicitar|¡salud!=brindar' },
    ],
  },
  {
    id: 'platica',
    name: 'Plática',
    icon: 'conversar',
    groups: [
      { name: 'Saludos', cls: 'social', icon: 'hola', words: 'hola|chao=adiós|buenos días|buenas tardes|buenas noches|¿cómo estás?=cómo estás|¿qué tal?=qué tal|bien, ¿y tú?=bien|nos vemos=hasta luego|hasta mañana|hasta luego|que te vaya bien=adiós|bienvenido' },
      { name: 'Cortesía', cls: 'social', icon: 'gracias', words: 'por favor|gracias|muchas gracias=gracias|de nada|perdón|lo siento=perdón|disculpa=perdón|con permiso=permiso|salud=estornudar|buen provecho=que aproveche' },
      { name: 'Quiero decir algo', cls: 'social', icon: 'hablar', words: 'quiero algo=querer|te quiero decir algo=decir|tengo una pregunta=pregunta|algo va mal=problema|te cuento lo que pasó=contar|vamos a…=ir|me equivoqué=error|eso no es lo que quería decir=no|no está aquí=no está|lo voy a deletrear=deletrear|espera, estoy pensando=pensar|déjame terminar=terminar|es parecido a…=parecido' },
      { name: 'Responder', cls: 'social', icon: 'sí', words: 'sí|no#neg|tal vez=quizás|no sé=no saber|no me acuerdo=olvidar|creo que sí=sí|creo que no=no|obvio=claro|claro|de acuerdo|ya=vale|bueno=vale|puede ser=quizás|más o menos|no importa|me da lo mismo=igual|tú elige=elegir' },
      { name: 'Reacciones', cls: 'social', icon: 'sorpresa', words: '¡genial!=fantástico|¡bacán!=fantástico|¡qué bueno!=bueno|¡qué rico!=rico|¡qué lata!=aburrido|¡qué pena!=triste|¡wow!=sorpresa|¡uy!=sorpresa|¡ay!=dolor|¡qué asco!=asco|¡qué miedo!=miedo|¡qué divertido!=divertido|¡no puede ser!=sorpresa|¡en serio!=sorpresa|¡bien hecho!=muy bien|¡felicitaciones!=felicitar|¡vamos!=ánimo|¡cuidado!=cuidado|¡basta!=parar|¡para!=parar|¡ya po!=ya' },
      { name: 'Opinar', cls: 'social', icon: 'opinar', words: 'me gusta=gustar|no me gusta=no gustar|me encanta=encantar|lo odio=odiar|yo también|yo tampoco|a mí sí=sí|a mí no=no|tienes razón=razón|no estoy de acuerdo=desacuerdo|es verdad=verdad|es mentira=mentira|cuéntame más=contar|¿y tú?=tú|¿qué hiciste?=hacer|¿qué opinas?=opinar|otra vez=repetir|ya terminé=terminar|estoy listo=preparado|mi turno=turno|tu turno=turno|te quiero=querer|te extraño=echar de menos|eres mi amigo=amigo' },
      { name: 'Mis noticias', cls: 'social', icon: 'noticia', words: 'hoy fui a…=ir|el fin de semana…=fin de semana|ayer…=ayer|adivina qué…=adivinar|tengo algo que mostrarte=mostrar' },
      { name: 'Sobre mí', cls: 'social', icon: 'yo', words: 'me llamo…=nombre|tengo … años=edad|vivo en…=vivir|mi colegio es…=colegio|mi curso es…=clase|mi mamá se llama…=mamá|mi papá se llama…=papá|mi mascota es…=mascota|mi comida favorita es…=comida|mi juego favorito es…=jugar|mi color favorito es…=colores|uso este aparato para hablar=comunicador|dame tiempo para responder=esperar|entiendo todo lo que dices=entender' },
    ],
  },
  {
    id: 'ayuda',
    name: 'Ayuda',
    icon: 'ayuda',
    groups: [
      {
        name: 'Ayuda',
        cls: 'social',
        words:
          '¡ayúdame!=ayudar|necesito ayuda=ayuda|me duele=dolor|me siento mal=enfermo|estoy enfermo=enfermo|quiero ir al baño=váter|' +
          'necesito cambiarme=cambiar|tengo frío=frío|tengo calor=calor|tengo hambre=hambre|tengo sed=sed|estoy cansado=cansado|' +
          'necesito un descanso=descansar|hay mucho ruido=ruido|me molesta=molestar|déjame tranquilo=tranquilo|no me toques=no tocar|' +
          'tengo miedo=miedo|estoy perdido=perdido|llama a mi mamá=mamá|llama a mi papá=papá|quiero irme a la casa=casa|no entiendo=no entender|' +
          'repite por favor=repetir|más despacio=despacio|espera por favor=esperar|algo está roto=roto|no funciona=estropeado|' +
          'se acabó la batería=batería|cárgame el tablet=cargar|no puedo hablar, uso este aparato=comunicador|¡emergencia!=emergencia|' +
          'llama a una ambulancia=ambulancia',
      },
    ],
  },
]

/** Carpetas que aparecen en "Más…" (página 2 de Inicio en los tamaños chicos). */
export const MORE_FOLDERS = [
  'personas', 'acciones', 'describir', 'sentimientos', 'cuerpo', 'comida', 'cosas', 'ropa', 'lugares',
  'animales', 'tiempo', 'numeros', 'escuela', 'diversion', 'platica', 'ayuda', 'palabritas', 'preguntas',
]

export interface ParsedEntry {
  label: string
  alt?: string
  cls?: WordClass
}

export function parseList(words: string): ParsedEntry[] {
  const parts = words.includes('|') ? words.split('|') : words.split(',')
  return parts
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      let rest = p
      let cls: WordClass | undefined
      const hash = rest.match(/#(\w+)/)
      if (hash) {
        cls = hash[1] as WordClass
        rest = rest.replace(hash[0], '')
      }
      const [label, alt] = rest.split('=').map((s) => s.trim())
      return { label, alt: alt || undefined, cls }
    })
}
