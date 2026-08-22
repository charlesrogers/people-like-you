import type { IntlFormStrings } from '@/components/IntlWaitlistForm'

/**
 * Hand-written content for the country pages (specs/organic-search-international.md).
 * One page per top-10 membership country, written in the country's primary search
 * language (Charles, 2026-08-22: in-language for every country, no phased gating).
 *
 * Rules: numbers on-page come from src/data/seo-countries.json (official Church
 * statistics, 31 Dec 2025) and are cited; no activity-rate or gender-ratio estimates
 * anywhere; every CTA is the honest Scenario-C waitlist ("not in your country yet"),
 * never an implied service.
 */

export type CountryContent = {
  slug: string
  lang: 'en' | 'es' | 'pt'
  countryCode: string
  h1: string
  metaTitle: string
  metaDescription: string
  labels: { numbers: string; meaning: string; meet: string; honest: string; faq: string }
  statLabels: { members: string; congregations: string; missions: string; temples: string }
  numbersCaption: string
  intro: string[]
  meaning: string[]
  meet: string[]
  honest: string[]
  faq: { q: string; a: string }[]
  form: IntlFormStrings
}

// ── Shared per-language strings ────────────────────────────────────────────────

const ES_LABELS = {
  numbers: 'La Iglesia en números',
  meaning: 'Qué significa esto para los solteros',
  meet: 'Cómo se conocen los solteros SUD aquí',
  honest: 'El problema honesto de este mercado',
  faq: 'Preguntas frecuentes',
}
const ES_STATS = { members: 'Miembros', congregations: 'Congregaciones (barrios y ramas)', missions: 'Misiones', temples: 'Templos' }
const ES_CAPTION = 'Fuente: estadísticas oficiales de La Iglesia de Jesucristo de los Santos de los Últimos Días, al 31 de diciembre de 2025.'

const esForm = (pais: string, placeholder: string): IntlFormStrings => ({
  title: `People Like You aún no llega a ${pais}`,
  body:
    `PLY es un casamentero, no otra app de deslizar: una presentación real al día, con la razón por la que ustedes dos encajarían. Todavía no operamos en ${pais} — y no vamos a fingir lo contrario. Déjanos tu número: cuántas personas se apunten aquí es exactamente lo que decide a dónde llegamos primero.`,
  placeholder,
  button: 'Avísame primero',
  saving: 'Guardando…',
  successTitle: 'Estás en la lista.',
  successBody: `Te escribiremos una sola vez: el día que abramos en ${pais}. Cada amigo que se apunte con tu enlace acerca ese día.`,
  shareLabel: 'Comparte tu enlace',
  copied: '¡Copiado!',
  privacy: 'Un solo mensaje si abrimos cerca de ti. Sin spam, sin cadenas diarias.',
  invalid: 'Ingresa un número válido con código de país.',
  generic: 'Algo salió mal. Inténtalo de nuevo.',
})

const esFaq = (pais: string) => [
  {
    q: '¿People Like You es solo para miembros de la Iglesia?',
    a: `No — es un servicio de presentaciones para personas que salen con el matrimonio en mente, sea cual sea su fe. Preguntamos por tu fe y tu nivel de observancia al crear tu perfil, y nunca te presentamos a alguien incompatible con lo que no es negociable para ti.`,
  },
  {
    q: `¿Cuándo llega a ${pais}?`,
    a: `No hay fecha, y no vamos a inventar una. Abrimos cada lugar cuando hay suficientes personas apuntadas — por densidad, no por calendario. Por eso la lista de espera importa: es literalmente el dato que decide a dónde vamos.`,
  },
  {
    q: '¿Cuánto cuesta?',
    a: 'Apuntarse a la lista es gratis, y nunca se cobrará nada sin avisarte primero.',
  },
]

// ── The nine countries ─────────────────────────────────────────────────────────

export const COUNTRY_CONTENT: Record<string, CountryContent> = {
  mexico: {
    slug: 'mexico',
    lang: 'es',
    countryCode: 'MX',
    h1: 'Solteros SUD en México',
    metaTitle: 'Solteros SUD en México — Las cifras reales',
    metaDescription:
      'México tiene más de 1.5 millones de Santos de los Últimos Días en 1,875 congregaciones y 14 templos. Qué significa eso para los solteros de la Iglesia, con honestidad.',
    labels: ES_LABELS,
    statLabels: ES_STATS,
    numbersCaption: ES_CAPTION,
    intro: [
      `Durante décadas, México fue el país con más Santos de los Últimos Días fuera de Estados Unidos — más de un millón y medio de miembros, catorce templos, y una historia con la Iglesia que va desde las colonias de Chihuahua hasta el Centro de Capacitación Misional de la Ciudad de México. Si eres soltero y miembro en México, no te falta comunidad. Lo que falta es otra cosa.`,
    ],
    meaning: [
      `Un millón y medio de miembros suena a abundancia, pero la vida real de un soltero SUD mexicano depende de dónde vive. En la Ciudad de México, el Estado de México, Puebla o Monterrey, hay estacas fuertes, institutos activos y actividades de JAS cada mes. En ciudades medianas, tu barrio puede tener tres solteros de tu edad — y ya salieron entre ellos o son primos.`,
      `El resultado es un mercado partido en dos: los solteros de las grandes ciudades, con comunidad pero perdidos en la escala urbana, y los de todo lo demás, con fe pero sin pool. Los dos terminan en las mismas apps genéricas donde ser miembro activo es un filtro que no existe.`,
    ],
    meet: [
      `La infraestructura clásica funciona: convenciones de JAS que juntan a varias estacas, instituto, bailes, viajes al templo, y las actividades multiestaca que todo el mundo sabe que en el fondo son para eso. Una convención buena puede juntar a cientos de solteros de toda una región — y ahí está el detalle: de toda una región.`,
      `Porque el patrón que todo JAS mexicano conoce es conocer a alguien increíble en la convención… que vive a cinco horas de camión. La comunidad ya funciona a escala regional; las presentaciones, no.`,
    ],
    honest: [
      `El problema honesto de México: la distancia entre la cifra oficial y tu vida real. El país tiene una membresía enorme, pero para un soltero practicante de 25 o 30 años, el pool efectivo de su ciudad es pequeño, se conoce de memoria, y se renueva despacio. Las convenciones dan esperanza dos veces al año; el resto del año, el mercado es tu barrio y el de junto. Lo que este mercado necesita no es otra actividad — es que alguien encuentre, entre toda esa membresía dispersa, a la persona compatible contigo y te la presente con razones.`,
    ],
    faq: esFaq('México'),
    form: esForm('México', '+52 55 1234 5678'),
  },

  peru: {
    slug: 'peru',
    lang: 'es',
    countryCode: 'PE',
    h1: 'Solteros SUD en el Perú',
    metaTitle: 'Solteros SUD en el Perú — Las cifras reales',
    metaDescription:
      'El Perú tiene 667,836 Santos de los Últimos Días en 809 congregaciones y 4 templos — una de las membresías más densas de Sudamérica. Qué significa para los solteros de la Iglesia.',
    labels: ES_LABELS,
    statLabels: ES_STATS,
    numbersCaption: ES_CAPTION,
    intro: [
      `El Perú es uno de los países más Santos de los Últimos Días del mundo en proporción a su población: casi 670,000 miembros, cuatro templos, y en Lima una de las concentraciones de miembros más grandes de cualquier ciudad fuera de Estados Unidos. Ser JAS en el Perú es pertenecer a una comunidad grande de verdad — con todo lo bueno y lo complicado que eso trae.`,
    ],
    meaning: [
      `La membresía peruana está fuertemente centralizada: Lima concentra una parte enorme de los miembros del país, con dos templos en la misma ciudad. Para un soltero limeño eso significa un pool real — estacas por toda la ciudad, institutos llenos, actividades constantes. Para un soltero de provincia — Arequipa, Trujillo, Cusco, Iquitos — significa lo contrario: una comunidad fiel pero chica, donde las opciones se agotan rápido y "conocer gente nueva" implica un boleto de bus.`,
      `Y aun en Lima, la escala engaña: la ciudad es tan grande y el tráfico tan brutal que Lima Norte y Surco son, en la práctica, dos mercados distintos que casi no se tocan.`,
    ],
    meet: [
      `El sistema JAS peruano es de los más activos de la Iglesia: convenciones nacionales y de área que se planean con meses de anticipación, instituto, bailes de estaca, viajes al templo, servicio. Una convención grande en Lima puede reunir a más solteros SUD que los que existen en países enteros de Europa.`,
      `Después de la convención, el patrón conocido: los grupos de WhatsApp se enfrían, cada quien vuelve a su estaca, y la persona que te interesó vive al otro lado de la ciudad — o en otra región. El encuentro existe; el seguimiento es el hueco.`,
    ],
    honest: [
      `El problema honesto del Perú: la comunidad es grande pero el mecanismo de presentación sigue siendo el azar — quién te tocó en el grupo de la convención, quién llegó nuevo a tu barrio, a quién conoce tu hermana. Con cientos de miles de miembros, la persona compatible contigo casi seguro existe en el país; lo que no existe es la manera de encontrarla sin que el azar coopere. Eso es exactamente lo que un casamentero hace y una app de deslizar no.`,
    ],
    faq: esFaq('el Perú'),
    form: esForm('el Perú', '+51 987 654 321'),
  },

  chile: {
    slug: 'chile',
    lang: 'es',
    countryCode: 'CL',
    h1: 'Solteros SUD en Chile',
    metaTitle: 'Solteros SUD en Chile — Las cifras reales',
    metaDescription:
      'Chile tiene 624,203 Santos de los Últimos Días en 578 congregaciones y 3 templos — una de las proporciones más altas del mundo. Qué significa para los solteros de la Iglesia.',
    labels: ES_LABELS,
    statLabels: ES_STATS,
    numbersCaption: ES_CAPTION,
    intro: [
      `En proporción a su población, Chile es uno de los países más Santos de los Últimos Días del planeta: más de 620,000 miembros en un país de veinte millones. Santiago es una de las grandes capitales de la Iglesia en el mundo hispano. Y aun así, ser soltero SUD en Chile tiene una geografía que ningún otro país impone.`,
    ],
    meaning: [
      `Chile mide 4,300 kilómetros de largo. La membresía se concentra en Santiago y el centro, pero hay estacas de Arica a Punta Arenas — y para un soltero de Antofagasta o de Temuco, el "pool nacional" es una abstracción: lo real es su estaca, las dos de al lado, y lo que aparezca en la convención anual. En Santiago el problema se invierte: la comunidad es grande, pero la ciudad también, y las comunas dispersan a los JAS en burbujas que apenas se cruzan.`,
    ],
    meet: [
      `Chile hace bien lo institucional: convenciones de JAS con historia, instituto, bailes, actividades multiestaca, y una cultura de barrio fuerte donde los hermanos mayores y las mamás del barrio ejercen de casamenteros no oficiales con entusiasmo variable. El viaje al templo de Santiago — y ahora Concepción — sigue siendo el gran evento social del año para media membresía.`,
      `Pero el mecanismo de fondo es el mismo de siempre: proximidad más suerte. Y en un país con la geografía de Chile, la proximidad es un filtro brutal que deja fuera a casi todos.`,
    ],
    honest: [
      `El problema honesto de Chile: la proporción alta esconde pools locales chicos. Ser el país "más SUD" del cono sur no cambia que, a los 28 años y en una estaca de regiones, las opciones que no saliste ya a conocer se cuentan con una mano. Los JAS chilenos no necesitan que les digan que asistan a más actividades — ya fueron a todas. Necesitan alcance: que la búsqueda cubra el país entero y que las presentaciones lleguen con la razón de por qué esta persona, aunque viva a tres regiones de distancia, vale la pena.`,
    ],
    faq: esFaq('Chile'),
    form: esForm('Chile', '+56 9 8765 4321'),
  },

  argentina: {
    slug: 'argentina',
    lang: 'es',
    countryCode: 'AR',
    h1: 'Solteros SUD en la Argentina',
    metaTitle: 'Solteros SUD en la Argentina — Las cifras reales',
    metaDescription:
      'La Argentina tiene 505,819 Santos de los Últimos Días en 742 congregaciones y 5 templos. Qué significa eso para los solteros de la Iglesia, con honestidad.',
    labels: ES_LABELS,
    statLabels: ES_STATS,
    numbersCaption: ES_CAPTION,
    intro: [
      `Medio millón de Santos de los Últimos Días, cinco templos de Buenos Aires a Salta, y una cultura JAS con décadas de historia: la Argentina es una de las grandes membresías del mundo. También es un país donde ser joven, soltero y practicante se cruza con una realidad que ningún manual de la Iglesia cubre: la economía.`,
    ],
    meaning: [
      `La membresía argentina se extiende de verdad por el país — el Gran Buenos Aires como núcleo, pero con estacas fuertes en Córdoba, Rosario, Mendoza, Tucumán, Salta. Para un JAS eso significa que casi siempre hay una comunidad local real. Lo que no siempre hay es masa crítica de tu edad: las camadas de solteros de cada estaca son chicas, se conocen desde la Primaria, y el que no encontró pareja ahí queda esperando el próximo baile multiestaca.`,
      `Súmale el factor argentino: una parte de cada generación JAS emigra — a España, a Estados Unidos, adonde el trabajo llame — y el pool local se achica justo en los años que más importa.`,
    ],
    meet: [
      `La Argentina hace las convenciones de JAS con una seriedad que otros países envidian: eventos de área que juntan a solteros de todo el país, instituto, bailes de estaca con tradición propia, viajes al templo. La comunidad sabe juntarse — el asado post-actividad es una institución tan real como el instituto.`,
      `El patrón, sin embargo, es conocido: la convención abre una ventana de dos días sobre un pool nacional, y después cada quien vuelve a los treinta rostros de siempre de su estaca. El país tiene el pool; lo que falta es el puente entre convención y convención.`,
    ],
    honest: [
      `El problema honesto de la Argentina: el desgaste. Entre pools locales chicos, distancias grandes y la sangría constante de la emigración, muchos JAS argentinos llegan a los treinta habiendo hecho todo bien — instituto, convenciones, actividades — y sintiendo que el sistema les quedó chico. No es falta de fe ni de esfuerzo; es un mecanismo de encuentro que depende del azar en un país donde el azar tiene medio millón de miembros para repartir. Un casamentero que busque en serio, a escala nacional y con razones, es exactamente la pieza que falta.`,
    ],
    faq: esFaq('la Argentina'),
    form: esForm('la Argentina', '+54 9 11 2345 6789'),
  },

  guatemala: {
    slug: 'guatemala',
    lang: 'es',
    countryCode: 'GT',
    h1: 'Solteros SUD en Guatemala',
    metaTitle: 'Solteros SUD en Guatemala — Las cifras reales',
    metaDescription:
      'Guatemala tiene 297,143 Santos de los Últimos Días en 441 congregaciones y 3 templos — una de las proporciones más altas de América. Qué significa para los solteros de la Iglesia.',
    labels: ES_LABELS,
    statLabels: ES_STATS,
    numbersCaption: ES_CAPTION,
    intro: [
      `Guatemala es, en proporción, uno de los países más Santos de los Últimos Días de todo el continente: casi 300,000 miembros en un país de dieciocho millones, con templos en la capital y en Quetzaltenango y una membresía con raíces profundas, de la ciudad al altiplano. Aquí la Iglesia no es una rareza — es parte del paisaje.`,
    ],
    meaning: [
      `Para un soltero SUD guatemalteco, esa densidad tiene dos caras. La buena: comunidad de verdad — barrios establecidos, institutos activos, familias con tres generaciones en la Iglesia. La otra: Guatemala es un país chico y la comunidad se conoce entera. En la capital, los JAS de las distintas estacas se cruzan desde la adolescencia; en Xela o en el altiplano, el pool de tu edad cabe en dos mesas de actividad. A los veinticinco, la pregunta no es dónde están los solteros — es si queda alguno que no conozcas de memoria.`,
    ],
    meet: [
      `Convenciones de JAS, instituto, bailes, servicio, viajes al templo: la maquinaria clásica, y en Guatemala funciona con una participación que países más grandes envidiarían. Las convenciones nacionales son el evento del año — la oportunidad real de conocer a alguien de otra región.`,
      `Y como en toda comunidad chica y fiel, la emigración pega directo: cada año, parte de la generación JAS se va al norte, y el que se queda ve su pool encogerse sin que ninguna actividad lo compense.`,
    ],
    honest: [
      `El problema honesto de Guatemala: la comunidad es densa pero el mercado es chico y cerrado. Todo el mundo conoce el historial de todo el mundo, las segundas oportunidades son incómodas en un círculo así, y el soltero que no encontró pareja en su generación de estaca carga con esa etiqueta en cada actividad. Lo que un mercado así necesita no es más exposición — es presentaciones frescas, elegidas por compatibilidad real, que crucen las líneas de estaca y de región que el círculo social nunca cruza solo.`,
    ],
    faq: esFaq('Guatemala'),
    form: esForm('Guatemala', '+502 5123 4567'),
  },

  ecuador: {
    slug: 'ecuador',
    lang: 'es',
    countryCode: 'EC',
    h1: 'Solteros SUD en el Ecuador',
    metaTitle: 'Solteros SUD en el Ecuador — Las cifras reales',
    metaDescription:
      'El Ecuador tiene 279,046 Santos de los Últimos Días en 338 congregaciones y 2 templos. Qué significa eso para los solteros de la Iglesia, con honestidad.',
    labels: ES_LABELS,
    statLabels: ES_STATS,
    numbersCaption: ES_CAPTION,
    intro: [
      `Con casi 280,000 miembros en un país de dieciocho millones, el Ecuador tiene una de las membresías más sólidas de Sudamérica — y una de las más concentradas: Guayaquil y Quito, cada una con su templo, sostienen entre las dos el corazón de la Iglesia ecuatoriana.`,
    ],
    meaning: [
      `Esa concentración define la vida del soltero SUD ecuatoriano. Si vives en Guayaquil o Quito, tienes comunidad real: estacas múltiples, instituto, actividades constantes, un templo a minutos. Si vives en Cuenca, en Ambato, en la costa o en el oriente, tu comunidad es fiel pero chica, y el pool de solteros de tu edad se agota en una temporada de actividades.`,
      `Entre las dos capitales de la Iglesia ecuatoriana hay ocho horas de carretera — y en la práctica, dos mercados separados que se ven las caras una o dos veces al año.`,
    ],
    meet: [
      `El sistema JAS ecuatoriano gira alrededor de las convenciones — los eventos que por fin juntan Quito, Guayaquil y las provincias en un solo lugar — más el instituto, los bailes de estaca y los viajes al templo. La comunidad es cálida y participativa; el que llega nuevo a un barrio es notado, recibido y, con suerte, presentado.`,
      `El límite es estructural: entre convención y convención, tu mercado real es tu ciudad. Y para la mitad del país, esa ciudad tiene un pool que ya conoces entero.`,
    ],
    honest: [
      `El problema honesto del Ecuador: dos ciudades con masa crítica y un país entero sin ella. El soltero de provincia hace todo lo que el sistema sugiere y aun así su pool efectivo son las mismas veinte personas — y la emigración se lleva a varias cada año. Lo que falta no es comunidad ni compromiso: es un mecanismo que busque a escala nacional, encuentre a la persona compatible esté donde esté, y la presente con razones que justifiquen la distancia.`,
    ],
    faq: esFaq('el Ecuador'),
    form: esForm('el Ecuador', '+593 99 123 4567'),
  },

  brasil: {
    slug: 'brasil',
    lang: 'pt',
    countryCode: 'BR',
    h1: 'Solteiros SUD no Brasil',
    metaTitle: 'Solteiros SUD no Brasil — Os números reais',
    metaDescription:
      'O Brasil é agora o segundo país do mundo em número de santos dos últimos dias: mais de 1,5 milhão de membros, 2.008 congregações e 11 templos. O que isso significa para os solteiros da Igreja.',
    labels: {
      numbers: 'A Igreja em números',
      meaning: 'O que isso significa para os solteiros',
      meet: 'Como os solteiros SUD se conhecem aqui',
      honest: 'O problema honesto deste mercado',
      faq: 'Perguntas frequentes',
    },
    statLabels: { members: 'Membros', congregations: 'Congregações (alas e ramos)', missions: 'Missões', temples: 'Templos' },
    numbersCaption: 'Fonte: estatísticas oficiais de A Igreja de Jesus Cristo dos Santos dos Últimos Dias, em 31 de dezembro de 2025.',
    intro: [
      `Aconteceu em 2025 e quase ninguém percebeu: o Brasil ultrapassou o México e é hoje o segundo país do mundo em número de santos dos últimos dias — mais de um milhão e meio de membros, mais de duas mil alas e ramos, onze templos em funcionamento. Fora dos Estados Unidos, nenhum país tem mais membros. Se você é solteiro e membro no Brasil, você faz parte da segunda maior comunidade SUD do planeta. E mesmo assim, encontrar alguém continua difícil. Por quê?`,
    ],
    meaning: [
      `Porque o Brasil é um continente. A membresia é forte em São Paulo — provavelmente a maior concentração de membros fora dos EUA — e sólida no Sul, no Nordeste, no Norte; mas "1,5 milhão de membros" vira, na prática, o pool da sua estaca e das vizinhas. Um JAS de Campinas e um de Fortaleza pertencem à mesma segunda maior membresia do mundo e nunca vão se cruzar.`,
      `A escala também esconde o dado que importa: dentro de qualquer ala, os solteiros da sua faixa etária são meia dúzia — e a essa altura vocês já se conhecem, já saíram, ou já são melhores amigos, que é o jeito mais definitivo de não casar.`,
    ],
    meet: [
      `O Brasil faz o circuito institucional em escala industrial: conferências de JAS que lotam ginásios, instituto, bailes de estaca, caravanas ao templo, projetos de serviço. Uma conferência grande em São Paulo reúne mais solteiros SUD do que existem em países inteiros — e as amizades (e os namoros) que saem dali sustentam a comunidade o ano todo.`,
      `Mas o padrão que todo JAS brasileiro reconhece: o evento acaba, o grupo do WhatsApp esfria, e a pessoa interessante mora a seiscentos quilômetros. O encontro em escala nacional já existe duas vezes por ano; o que não existe é a ponte no meio.`,
    ],
    honest: [
      `O problema honesto do Brasil: ser o segundo país da Igreja no mundo e continuar dependendo da sorte para casar. O pool nacional é gigantesco; o mecanismo de apresentação continua sendo a proximidade — quem chegou na sua ala, quem sua irmã conhece, quem sentou do seu lado na conferência. Com uma membresia deste tamanho, a pessoa certa para você quase certamente existe no país. O que nunca existiu foi alguém cujo trabalho seja encontrá-la — e apresentar vocês dois com as razões pelas quais funcionaria. É exatamente isso que um casamenteiro faz e que nenhum aplicativo de deslizar jamais fez.`,
    ],
    faq: [
      {
        q: 'O People Like You é só para membros da Igreja?',
        a: `Não — é um serviço de apresentações para pessoas que namoram pensando em casamento, seja qual for a fé. Perguntamos sobre sua fé e sua observância ao criar o perfil, e nunca apresentamos você a alguém incompatível com o que é inegociável para você.`,
      },
      {
        q: 'Quando chega ao Brasil?',
        a: `Não há data, e não vamos inventar uma. Cada lugar abre quando há gente suficiente na lista — por densidade, não por calendário. É por isso que a lista de espera importa: ela é literalmente o dado que decide para onde vamos primeiro.`,
      },
      {
        q: 'Quanto custa?',
        a: 'Entrar na lista de espera é grátis, e nada será cobrado sem avisar você primeiro.',
      },
    ],
    form: {
      title: 'O People Like You ainda não chegou ao Brasil',
      body:
        'O PLY é um casamenteiro, não mais um app de deslizar: uma apresentação real por dia, com a razão pela qual vocês dois combinariam. Ainda não operamos no Brasil — e não vamos fingir o contrário. Deixe seu número: quantas pessoas se inscrevem aqui é exatamente o que decide aonde chegamos primeiro.',
      placeholder: '+55 11 91234-5678',
      button: 'Me avise primeiro',
      saving: 'Salvando…',
      successTitle: 'Você está na lista.',
      successBody: 'Vamos escrever uma única vez: no dia em que abrirmos no Brasil. Cada amigo que entrar com o seu link aproxima esse dia.',
      shareLabel: 'Compartilhe seu link',
      copied: 'Copiado!',
      privacy: 'Uma única mensagem se abrirmos perto de você. Sem spam.',
      invalid: 'Digite um número válido com código do país.',
      generic: 'Algo deu errado. Tente de novo.',
    },
  },

  philippines: {
    slug: 'philippines',
    lang: 'en',
    countryCode: 'PH',
    h1: 'LDS singles in the Philippines',
    metaTitle: 'LDS Singles in the Philippines — The Real Numbers',
    metaDescription:
      'The Philippines has 905,082 Latter-day Saints in 1,370 congregations — the largest membership in Asia, with 5 more temples under construction. What that means for single members.',
    labels: {
      numbers: 'The Church in numbers',
      meaning: 'What that means for singles',
      meet: 'How LDS singles actually meet here',
      honest: 'The honest problem with this market',
      faq: 'Common questions',
    },
    statLabels: { members: 'Members', congregations: 'Congregations (wards & branches)', missions: 'Missions', temples: 'Temples' },
    numbersCaption: 'Source: official statistics of The Church of Jesus Christ of Latter-day Saints, as of 31 December 2025.',
    intro: [
      `The Philippines is the Church's Asian capital and one of its fastest-growing homes anywhere: over 900,000 members, more than in any country in Asia, with three temples operating and five more under construction at once — a construction pace almost nowhere else on earth matches. Filipino members are also among the youngest in the worldwide Church, which means one thing: the Philippines is full of LDS singles.`,
    ],
    meaning: [
      `A young membership spread across seven thousand islands. That's the whole equation. Metro Manila and Cebu have real critical mass — multiple stakes, busy institutes, young single adult programs that actually fill rooms. But membership runs through the provinces too, and for a single member in a provincial branch, the eligible pool is a handful of people you've known since seminary, plus whoever the next multi-stake activity brings within reach.`,
      `Filipino LDS singles are also unusually online — the community's group chats and pages are where much of its social life actually happens, which says the demand for meeting beyond your ward is already proven. What's missing is anything better than a feed on the other end.`,
    ],
    meet: [
      `YSA conventions are the backbone — stake and area events that singles plan months around, because everyone understands they're the realistic way to meet someone new. Institute fills the weekly gap, temple trips are social events as much as spiritual ones, and the service-project circuit does quiet matchmaking of its own.`,
      `And beneath all of it, the pattern every Filipino member knows: someone finally clicks with someone — and then a work contract comes through, and one of them is in Dubai or Riyadh or Singapore within the year. The OFW reality shapes this market more than any activity calendar does.`,
    ],
    honest: [
      `The honest problem with the Philippines: the community's timeline and the economy's timeline don't cooperate. The membership is young, sincere, and marriage-minded, but the years when people most want to find someone are exactly the years work scatters them — across islands, across the Gulf, across the world. A market like that can't rely on slow proximity; by the time proximity works, someone's visa came through. What it needs is search that covers the whole national pool and introductions that come with real reasons — fast enough to matter before the next contract does.`,
    ],
    faq: [
      {
        q: 'Is People Like You an LDS-only app?',
        a: `No — it's a matchmaker for people who date with marriage in mind, whatever their faith. We ask about faith and observance during onboarding and never introduce you to someone whose answers would be a dealbreaker for you.`,
      },
      {
        q: 'When does it reach the Philippines?',
        a: `There's no date, and we won't invent one. Each place opens when enough people have joined the list — density, not a calendar. That's exactly why the waitlist matters: it's the data that decides where we go first.`,
      },
      {
        q: 'What does it cost?',
        a: `Joining the waitlist is free, and nothing is ever charged without telling you first.`,
      },
    ],
    form: {
      title: `People Like You hasn't reached the Philippines yet`,
      body:
        `PLY is a matchmaker, not another swipe app: one real introduction a day, with the reason you two would work. We don't operate in the Philippines yet — and we won't pretend otherwise. Leave your number: how many people join here is exactly what decides where we go first.`,
      placeholder: '+63 917 123 4567',
      button: 'Tell me first',
      saving: 'Saving…',
      successTitle: `You're on the list.`,
      successBody: `We'll text exactly once: the day we open in the Philippines. Every friend who joins with your link brings that day closer.`,
      shareLabel: 'Share your link',
      copied: 'Copied!',
      privacy: `One text if we open near you. No spam, no daily nudges.`,
      invalid: 'Please enter a valid phone number with country code.',
      generic: 'Something went wrong. Please try again.',
    },
  },

  nigeria: {
    slug: 'nigeria',
    lang: 'en',
    countryCode: 'NG',
    h1: 'LDS singles in Nigeria',
    metaTitle: 'LDS Singles in Nigeria — The Real Numbers',
    metaDescription:
      'Nigeria has 274,043 Latter-day Saints in 880 congregations — the fastest-rising membership in the worldwide Church. What that means for single members, honestly.',
    labels: {
      numbers: 'The Church in numbers',
      meaning: 'What that means for singles',
      meet: 'How LDS singles actually meet here',
      honest: 'The honest problem with this market',
      faq: 'Common questions',
    },
    statLabels: { members: 'Members', congregations: 'Congregations (wards & branches)', missions: 'Missions', temples: 'Temples' },
    numbersCaption: 'Source: official statistics of The Church of Jesus Christ of Latter-day Saints, as of 31 December 2025.',
    intro: [
      `No large membership in the Church is growing like Nigeria's. In 2019 it ranked thirteenth in the world; today it's tenth and climbing, with 274,000 members meeting in 880 congregations — strikingly many congregations for its membership, because new ones keep opening. The Church in Nigeria is young in every sense: young in history, young in age, and full of single members building something that has never existed here before.`,
    ],
    meaning: [
      `Growth this fast has a particular texture for singles. The community is concentrated in the south — the historic heartland around Aba and the southeast, plus fast-growing congregations in Lagos and Abuja — and most members are first-generation, which means most singles can't rely on the deep family-and-ward networks that do the matchmaking in older LDS countries. The infrastructure adults elsewhere take for granted — established YSA programs, decades of institute tradition, parents who met at a Church dance — is being built right now, by this generation, as they go.`,
    ],
    meet: [
      `Stake and district YSA programs, institute, temple trips to Aba, and the conventions that pull singles across state lines — the machinery exists and it's growing every year. Nigerian wards are also simply social in a way many Western wards aren't: the congregation genuinely functions as extended family, and introductions through members are normal, expected, even enthusiastic.`,
      `The limits are practical: distances are long, travel is expensive, and a single member in Lagos and one in Port Harcourt might as well be in different countries. The community's warmth doesn't yet have reach to match.`,
    ],
    honest: [
      `The honest problem with Nigeria: the pool is growing faster than the ways to search it. Every year brings thousands of new members — including, statistically, people who'd be right for you — but the mechanisms for finding them remain the ward you attend and the conventions you can afford to reach. First-generation members carry the extra weight of finding someone who shares a faith their own families may not. A community this young, this committed, and this scattered is exactly where introductions chosen on real compatibility — with the reasons attached — matter most.`,
    ],
    faq: [
      {
        q: 'Is People Like You an LDS-only app?',
        a: `No — it's a matchmaker for people who date with marriage in mind, whatever their faith. We ask about faith and observance during onboarding and never introduce you to someone whose answers would be a dealbreaker for you.`,
      },
      {
        q: 'When does it reach Nigeria?',
        a: `There's no date, and we won't invent one. Each place opens when enough people have joined the list — density, not a calendar. The waitlist is the data that decides where we go first.`,
      },
      {
        q: 'What does it cost?',
        a: `Joining the waitlist is free, and nothing is ever charged without telling you first.`,
      },
    ],
    form: {
      title: `People Like You hasn't reached Nigeria yet`,
      body:
        `PLY is a matchmaker, not another swipe app: one real introduction a day, with the reason you two would work. We don't operate in Nigeria yet — and we won't pretend otherwise. Leave your number: how many people join here is exactly what decides where we go first.`,
      placeholder: '+234 803 123 4567',
      button: 'Tell me first',
      saving: 'Saving…',
      successTitle: `You're on the list.`,
      successBody: `We'll text exactly once: the day we open in Nigeria. Every friend who joins with your link brings that day closer.`,
      shareLabel: 'Share your link',
      copied: 'Copied!',
      privacy: `One text if we open near you. No spam, no daily nudges.`,
      invalid: 'Please enter a valid phone number with country code.',
      generic: 'Something went wrong. Please try again.',
    },
  },
}
