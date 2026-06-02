export interface ProductTranslation {
  name: string;
  description: string;
  shortDescription: string;
}

export interface ProductData {
  id: string;
  slug: string;
  images: string[];
  price: number;
  originalPrice: number | null;
  currency: string;
  priceId: string;
  badge: string | null;
  featured: boolean;
  inStock: boolean;
  stripeProductName: string;
  sortOrder: number;
  translations: {
    'pt-BR': ProductTranslation;
    'en': ProductTranslation;
    'es': ProductTranslation;
    'de': ProductTranslation;
  };
}

export const PRODUCTS: ProductData[] = [
  {
    id: 'starter-pack',
    slug: 'starter-pack',
    images: [
      '/assets/de-boxbundle-002_1780421261995.webp',
      '/assets/de-boxbundle-003_1780421261995.webp',
    ],
    price: 1990,
    originalPrice: null,
    currency: 'brl',
    priceId: '',
    badge: null,
    featured: true,
    inStock: true,
    stripeProductName: 'Starter Pack - Álbum Oficial',
    sortOrder: 1,
    translations: {
      'pt-BR': {
        name: 'Starter Pack - Álbum Oficial',
        shortDescription: 'Álbum oficial da Copa do Mundo FIFA 2026',
        description: 'Comece sua coleção com o álbum oficial da Copa do Mundo FIFA 2026. Produto licenciado pela FIFA com design premium e espaços para todas as figurinhas da competição.',
      },
      'en': {
        name: 'Starter Pack - Official Album',
        shortDescription: 'Official FIFA World Cup 2026 album',
        description: 'Start your collection with the official FIFA World Cup 2026 album. FIFA-licensed product with premium design and spaces for all competition stickers.',
      },
      'es': {
        name: 'Starter Pack - Álbum Oficial',
        shortDescription: 'Álbum oficial de la Copa del Mundo FIFA 2026',
        description: 'Comienza tu colección con el álbum oficial de la Copa del Mundo FIFA 2026. Producto con licencia FIFA con diseño premium y espacios para todos los stickers de la competición.',
      },
      'de': {
        name: 'Starter Pack - Offizielles Album',
        shortDescription: 'Offizielles FIFA Fußball-Weltmeisterschaft 2026 Album',
        description: 'Beginne deine Sammlung mit dem offiziellen FIFA Fußball-Weltmeisterschaft 2026 Album. FIFA-lizenziertes Produkt mit Premium-Design und Platz für alle Sticker des Turniers.',
      },
    },
  },
  {
    id: 'box-100-packs',
    slug: 'box-bundle',
    images: [
      '/assets/de2-boxbundle-001_1780429019754.webp',
      '/assets/de2-boxbundle-002_1780429019753.webp',
      '/assets/de2-boxbundle-003_1780429019753.webp',
      '/assets/de2-boxbundle-004_1780429019745.webp',
      '/assets/de2-boxbundle-005_1780429019745.webp',
      '/assets/de2-boxbundle-006_1780429019745.webp',
      '/assets/de2-boxbundle-007_1780429019744.webp',
      '/assets/de2-boxbundle-008_1780429019744.webp',
      '/assets/de2-boxbundle-009_1780429019741.webp',
    ],
    price: 3600,
    originalPrice: null,
    currency: 'eur',
    priceId: '',
    badge: 'offer',
    featured: true,
    inStock: true,
    stripeProductName: 'Box-Bundle FIFA World Cup 2026',
    sortOrder: 2,
    translations: {
      'pt-BR': {
        name: 'Box-Bundle – Coleção Oficial de Figurinhas FIFA World Cup 2026™',
        shortDescription: 'Álbum softcover + caixa com 50 envelopes (356 figurinhas no total)',
        description: `O Box-Bundle Panini para a Copa do Mundo FIFA 2026™ contém um álbum de figurinhas (com 6 figurinhas) e uma caixa com 50 envelopes de 7 figurinhas cada = 356 figurinhas no total para o início perfeito da sua coleção.

Como clássico entre os bundles, este set é ideal para mergulhar diretamente no mundo das figurinhas Panini. Iniciante ou colecionador experiente: com este bundle, você nunca erra!

Conteúdo do Box-Bundle:
• 1 Álbum softcover com 112 páginas e 6 figurinhas
• 1 Caixa com 50 envelopes de 7 figurinhas cada (= 350 figurinhas)

Suas vantagens no Box-Bundle:
• Começo perfeito: O clássico entre os bundles – ideal para iniciar sua coleção
• Pronto para colar: 356 figurinhas incluindo o álbum – abra e cole imediatamente
• Simples e prático: Tudo em um set – pedido rápido e pronto para usar
• Original Panini: Embalado com segurança e entregue diretamente pelo fabricante
• Menos repetidas: Uma caixa oferece melhores chances de menos figurinhas duplicadas do que envelopes avulsos

O que espera você na grande coleção de figurinhas da Copa do Mundo FIFA 2026™:
• Coleção oficialmente licenciada com todas as 48 seleções classificadas
• Jogadores e equipes: 18 jogadores por seleção, uma foto da equipe e o logotipo oficial da federação
• 980 figurinhas diferentes para colecionar, trocar e colar
• Verdadeiro clima de Copa: Perfeito para momentos de coleção em família e com amigos
• Tradição Panini: Coleção de alta qualidade para fãs de todas as idades`,
      },
      'en': {
        name: 'Box-Bundle – Official FIFA World Cup 2026™ Sticker Collection',
        shortDescription: 'Softcover album + box with 50 packs (356 stickers total)',
        description: `The Panini Box-Bundle for the FIFA World Cup 2026™ includes a sticker album (with 6 stickers) and a box with 50 packs of 7 stickers each = 356 stickers total for the perfect start to your collection.

As the classic among bundles, this set is ideal for diving straight into the world of Panini sticker collecting. Whether you're a beginner or an experienced collector: with this bundle, you can't go wrong!

What's in the Box-Bundle:
• 1 Softcover album with 112 pages including 6 stickers
• 1 Box with 50 packs of 7 stickers each (= 350 stickers)

Your advantages with the Box-Bundle:
• Perfect start: The classic bundle – ideal to kick off your collection
• Ready to go: 356 stickers including the album – unpack and start sticking right away
• Simple & convenient: Everything in one set – quick to order and ready to use
• Original Panini: Safely packaged and delivered directly from the manufacturer
• Fewer duplicates: A box offers better chances of fewer duplicate stickers than individual packs

What awaits you in the big sticker collection for the FIFA World Cup 2026™:
• Officially licensed collection featuring all 48 qualified national teams
• Players & Teams overview: 18 players per team, a team photo and the official federation logo
• 980 different stickers to collect, trade and stick
• True World Cup feeling: Perfect for shared collecting moments with friends and family
• Panini tradition: High-quality collection for fans of all ages`,
      },
      'es': {
        name: 'Box-Bundle – Colección Oficial de Cromos FIFA World Cup 2026™',
        shortDescription: 'Álbum de tapa blanda + caja con 50 sobres (356 cromos en total)',
        description: `El Box-Bundle de Panini para la Copa del Mundo FIFA 2026™ incluye un álbum de cromos (con 6 cromos) y una caja con 50 sobres de 7 cromos cada uno = 356 cromos en total para el comienzo perfecto de tu colección.

Como el clásico entre los bundles, este set es ideal para sumergirte directamente en el mundo del coleccionismo de cromos Panini. ¡Principiante o coleccionista experimentado: con este bundle nunca te equivocas!

Contenido del Box-Bundle:
• 1 Álbum de tapa blanda con 112 páginas y 6 cromos
• 1 Caja con 50 sobres de 7 cromos cada uno (= 350 cromos)

Tus ventajas con el Box-Bundle:
• Comienzo perfecto: El clásico entre los bundles – ideal para empezar tu colección
• Listo para pegar: 356 cromos incluyendo el álbum – desempaca y empieza a pegar de inmediato
• Sencillo y cómodo: Todo en un set – pedido rápido y listo para usar
• Original Panini: Embalado con seguridad y entregado directamente por el fabricante
• Menos repetidos: Una caja ofrece mejores probabilidades de menos cromos duplicados que los sobres sueltos

Lo que te espera en la gran colección de cromos de la Copa del Mundo FIFA 2026™:
• Colección con licencia oficial con los 48 equipos nacionales clasificados
• Jugadores y equipos: 18 jugadores por equipo, una foto del equipo y el logotipo oficial de la federación
• 980 cromos diferentes para coleccionar, intercambiar y pegar
• Auténtico ambiente de Copa del Mundo: Perfecto para momentos de colección con amigos y familia
• Tradición Panini: Colección de alta calidad para aficionados de todas las edades`,
      },
      'de': {
        name: 'Offizielle FIFA World Cup 2026™ Stickerkollektion – Box-Bundle',
        shortDescription: 'Softcoveralbum + Box mit 50 Tüten (insgesamt 356 Sticker)',
        description: `Das Panini Box-Bundle zur FIFA Fußball-Weltmeisterschaft 2026™ enthält ein Sammelalbum (inklusive 6 Sticker) und eine Box mit 50 Tüten à 7 Stickern = insgesamt 356 Sticker für den perfekten Start in deine Sammlung.

Als Klassiker unter den Bundles ist dieses Set ideal geeignet, um direkt in die Welt des Panini-Stickersammelns einzusteigen. Ob Einsteiger oder erfahrener Sammler: Mit diesem Bundle machst du nie etwas falsch!

Im Box-Bundle enthalten:
• 1 Softcoveralbum mit 112 Seiten inklusive 6 Stickern
• 1 Box mit 50 Tüten à 7 Sticker (= 350 Sticker)

Deine Vorteile im Box-Bundle:
• Perfekter Einstieg: Der Klassiker unter den Bundles – ideal, um deine Sammlung zu starten
• Sofort loslegen: 356 Sticker inklusive Album – direkt auspacken und einkleben
• Einfach & bequem: Alles in einem Set – schnell bestellt und startklar
• Original von Panini: Sicher verpackt und direkt vom Hersteller geliefert
• Weniger Doppelungen: Eine Box bietet bessere Chancen auf weniger doppelte Sticker als einzelne Tüten

Das erwartet dich in der großen Stickerkollektion zur FIFA WM 2026™:
• Offiziell lizenzierte Kollektion mit allen 48 qualifizierten Nationalteams
• Spieler & Teams im Überblick: Pro Mannschaft 18 Spieler, ein Teamfoto und das offizielle Verbandslogo
• 980 verschiedene Sticker zum Sammeln, Tauschen und Einkleben
• Echtes WM-Feeling: Perfekt für gemeinsame Sammelmomente mit Freunden und Familie
• Panini-Tradition: Hochwertige Kollektion für Fans jeden Alters`,
      },
    },
  },
  {
    id: 'bundle-album-box',
    slug: 'bundle-album-box',
    images: [
      '/assets/de-boxbundle-001_1780428541012.webp',
      '/assets/de-boxbundle-002_1780428541012.webp',
      '/assets/de-boxbundle-003_1780428541011.webp',
      '/assets/de-boxbundle-004_1780428541011.webp',
      '/assets/de-boxbundle-005_1780428541011.webp',
      '/assets/de-boxbundle-006_1780428541011.webp',
      '/assets/de-boxbundle-007_1780428541010.webp',
      '/assets/de-boxbundle-008_1780428541010.webp',
    ],
    price: 7200,
    originalPrice: null,
    currency: 'eur',
    priceId: '',
    badge: 'bestSeller',
    featured: true,
    inStock: true,
    stripeProductName: 'Big Box-Bundle FIFA World Cup 2026',
    sortOrder: 3,
    translations: {
      'pt-BR': {
        name: 'Big Box-Bundle – Coleção Oficial de Figurinhas FIFA World Cup 2026™',
        shortDescription: 'Álbum softcover + caixa com 100 envelopes (706 figurinhas no total)',
        description: `O Big Box-Bundle para a Copa do Mundo FIFA 2026™ oferece, além do álbum de figurinhas, um total de 706 figurinhas. A entrada perfeita para sua coleção Panini, seja você colecionador experiente ou iniciante. Você recebe o álbum (com 6 figurinhas inclusas) para colar e uma grande caixa com 100 envelopes.

Conteúdo do Big Box-Bundle:
• 1 Álbum softcover com 112 páginas e 6 figurinhas
• 1 Caixa com 100 envelopes com 7 figurinhas cada (= 700 figurinhas no total)

Suas vantagens no Big Box-Bundle:
• Muita diversão de colecionar: 706 figurinhas incluindo o álbum para colar imediatamente
• Sem complicação: Adicione o bundle ao carrinho com um único clique
• Seguro e direto: Os produtos são entregues embalados originalmente pelo fabricante Panini
• Menos figurinhas repetidas: Estatisticamente, ao comprar uma caixa as chances de duplicatas são menores do que ao comprar envelopes avulsos

O que espera você na maior coleção de figurinhas de futebol de 2026 para a Copa do Mundo FIFA 2026™:
• A coleção é um produto oficialmente licenciado para a Copa do Mundo de 2026, abrange todas as 48 seleções classificadas com seus melhores jogadores e oferece uma visão geral da Copa nos EUA, México e Canadá.
• No total, há 980 figurinhas diferentes para descobrir e colar.
• Para cada seleção, você encontra 18 jogadores, uma foto da equipe e o logotipo oficial da federação.
• Leve a paixão e o clima de Copa do Mundo para casa em uma coleção única da tradicional marca Panini – ideal para colecionar, trocar e torcer com amigos e família.`,
      },
      'en': {
        name: 'Big Box-Bundle – Official FIFA World Cup 2026™ Sticker Collection',
        shortDescription: 'Softcover album + box with 100 packs (706 stickers total)',
        description: `The Big Box-Bundle for the FIFA World Cup 2026™ gives you a total of 706 stickers in addition to the sticker album. The perfect entry into your Panini sticker collection, whether you're a seasoned collector or just starting out. You'll receive the album (including 6 stickers) for pasting, along with a huge batch of stickers in the box with 100 packs.

What's included in the Big Box-Bundle:
• 1 Softcover album with 112 pages and 6 stickers
• 1 Box with 100 packs of 7 stickers each (= 700 stickers total)

Your advantages with the Big Box-Bundle:
• Tons of collecting fun: 706 stickers including the album to start sticking right away
• No searching required: Add the bundle to your cart with a single click
• Safe and direct: Products are shipped factory-sealed directly from the manufacturer Panini
• Fewer duplicate stickers: Statistically, buying a box gives you a lower chance of duplicates than buying individual packs

What awaits you in the biggest football sticker collection of 2026 for the FIFA World Cup 2026™:
• The collection is an officially licensed product for the 2026 World Cup, covering all 48 qualified national teams with their best players, giving you an overview of the World Cup in the USA, Mexico and Canada.
• There are a total of 980 different stickers to discover and collect.
• For each team, you'll find 18 players, a team photo and the official federation logo.
• Bring passion and World Cup atmosphere home with a unique collection from the legendary Panini brand – perfect for collecting, trading and cheering with friends and family.`,
      },
      'es': {
        name: 'Big Box-Bundle – Colección Oficial de Cromos FIFA World Cup 2026™',
        shortDescription: 'Álbum de tapa blanda + caja con 100 sobres (706 cromos en total)',
        description: `El Big Box-Bundle para la Copa del Mundo FIFA 2026™ te ofrece, además del álbum de cromos, un total de 706 cromos. La entrada perfecta en tu colección de cromos Panini, seas coleccionista experimentado o principiante. Recibirás el álbum (con 6 cromos incluidos) para pegar y una gran caja con 100 sobres.

Contenido del Big Box-Bundle:
• 1 Álbum de tapa blanda con 112 páginas y 6 cromos
• 1 Caja con 100 sobres de 7 cromos cada uno (= 700 cromos en total)

Tus ventajas con el Big Box-Bundle:
• Muchísima diversión coleccionando: 706 cromos incluyendo el álbum para empezar a pegar de inmediato
• Sin búsquedas largas: Añade el bundle al carrito con un solo clic
• Seguro y directo: Los productos se envían embalados originalmente directamente desde el fabricante Panini
• Menos cromos repetidos: Estadísticamente, la probabilidad de cromos duplicados al comprar una caja es menor que al comprar sobres sueltos

¿Qué te espera en la mayor colección de cromos de fútbol de 2026 para la Copa del Mundo FIFA 2026™?
• La colección es un producto con licencia oficial para el Mundial de Fútbol 2026, abarca las 48 selecciones clasificadas con sus mejores jugadores y te ofrece una visión general del Mundial 2026 en EE.UU., México y Canadá.
• En total hay 980 cromos diferentes para descubrir y pegar.
• Para cada selección te esperan 18 jugadores, una foto del equipo y el logotipo oficial de la federación.
• Lleva la pasión y el ambiente del Mundial a casa con una colección única de la marca tradicional Panini – ideal para coleccionar, intercambiar y animar con amigos y familia.`,
      },
      'de': {
        name: 'Offizielle FIFA World Cup 2026™ Stickerkollektion – Big Box-Bundle',
        shortDescription: 'Softcoveralbum + Box mit 100 Tüten (insgesamt 706 Sticker)',
        description: `Das Big Box-Bundle zur FIFA Fußball-Weltmeisterschaft 2026™ bietet dir neben dem Sammelalbum insgesamt 706 Sticker. Genau der richtige Einstieg in deine Panini-Sticker-Sammlung, wenn du Großes vorhast, egal ob du Sammler oder Einsteiger bist. Du erhältst das Sammelalbum (inklusive 6 Stickern) zum Einkleben sowie einen großen Schwung Sticker in der Box mit 100 Tüten.

Im Big Box-Bundle enthalten:
• 1 Softcoveralbum mit 112 Seiten und 6 Stickern
• 1 Box mit 100 Tüten mit je 7 Stickern (= 700 Sticker insgesamt)

Deine Vorteile beim Big Box-Bundle:
• Jede Menge Sammelspaß: 706 Sticker inklusive Stickeralbum zum direkt Losstickern
• Kein langes Suchen: Leg dir das Bundle mit einem einzigen Klick in den Warenkorb
• Sicher und direkt: Die Produkte werden originalverpackt direkt vom Hersteller Panini zu dir geliefert
• Weniger doppelte Sticker: Statistisch gesehen ist die Chance auf doppelte Sticker beim Kauf einer Box geringer als beim Kauf von Einzeltüten

Was dich in der größten Fußball-Stickerkollektion des Jahres 2026 zur FIFA Fußball-Weltmeisterschaft 2026™ erwartet:
• Die Kollektion ist ein offizielles Lizenzprodukt zur Fußball WM 2026 und umfasst alle 48 qualifizierten Nationalmannschaften mit ihren besten Spielern und bietet dir einen Überblick über die WM 2026 in den USA, Mexiko und Kanada.
• Insgesamt gibt es 980 verschiedene Sticker zu entdecken und einzukleben.
• Für jedes Team erwarten dich 18 Spieler, ein Mannschaftsfoto und das offizielle Verbandslogo.
• Hol dir Leidenschaft und WM-Feeling für Zuhause in einer einzigartigen Kollektion der Traditionsmarke Panini – ideal zum Sammeln, Tauschen und Mitfiebern mit Freunden und Familie.`,
      },
    },
  },
  {
    id: 'pack-5',
    slug: 'pacotes-avulsos-5',
    images: [
      '/assets/de-boxbundle-005_1780421261995.webp',
    ],
    price: 1490,
    originalPrice: null,
    currency: 'brl',
    priceId: '',
    badge: null,
    featured: false,
    inStock: true,
    stripeProductName: 'Pacote Avulso - 5 Unidades',
    sortOrder: 4,
    translations: {
      'pt-BR': {
        name: 'Pacote Avulso - 5 Unidades',
        shortDescription: '5 pacotes com 7 figurinhas cada',
        description: 'Cinco pacotes avulsos de figurinhas da Copa do Mundo FIFA 2026. Cada pacote contém 7 figurinhas, totalizando 35 figurinhas. Ideal para completar espaços específicos no álbum.',
      },
      'en': {
        name: 'Individual Packs - 5 Units',
        shortDescription: '5 packs with 7 stickers each',
        description: 'Five individual sticker packs for FIFA World Cup 2026. Each pack contains 7 stickers, totaling 35 stickers. Ideal for filling specific spots in the album.',
      },
      'es': {
        name: 'Sobres Sueltos - 5 Unidades',
        shortDescription: '5 sobres con 7 cromos cada uno',
        description: 'Cinco sobres sueltos de cromos de la Copa del Mundo FIFA 2026. Cada sobre contiene 7 cromos, un total de 35 cromos. Ideal para completar espacios específicos del álbum.',
      },
      'de': {
        name: 'Einzeltüten - 5 Stück',
        shortDescription: '5 Tüten mit je 7 Stickern',
        description: 'Fünf einzelne Stickerpackungen für die FIFA Fußball-Weltmeisterschaft 2026. Jede Tüte enthält 7 Sticker, insgesamt 35 Sticker. Ideal zum Füllen bestimmter Albumseiten.',
      },
    },
  },
  {
    id: 'pack-10',
    slug: 'pacotes-avulsos-10',
    images: [
      '/assets/de-boxbundle-005_1780421261995.webp',
    ],
    price: 2790,
    originalPrice: null,
    currency: 'brl',
    priceId: '',
    badge: null,
    featured: false,
    inStock: true,
    stripeProductName: 'Pacote Avulso - 10 Unidades',
    sortOrder: 5,
    translations: {
      'pt-BR': {
        name: 'Pacote Avulso - 10 Unidades',
        shortDescription: '10 pacotes com 7 figurinhas cada',
        description: 'Dez pacotes avulsos de figurinhas da Copa do Mundo FIFA 2026. Cada pacote contém 7 figurinhas, totalizando 70 figurinhas. Economia maior e mais chances de completar seu álbum.',
      },
      'en': {
        name: 'Individual Packs - 10 Units',
        shortDescription: '10 packs with 7 stickers each',
        description: 'Ten individual sticker packs for FIFA World Cup 2026. Each pack contains 7 stickers, totaling 70 stickers. Better savings and more chances to complete your album.',
      },
      'es': {
        name: 'Sobres Sueltos - 10 Unidades',
        shortDescription: '10 sobres con 7 cromos cada uno',
        description: 'Diez sobres sueltos de cromos de la Copa del Mundo FIFA 2026. Cada sobre contiene 7 cromos, un total de 70 cromos. Mayor ahorro y más oportunidades de completar tu álbum.',
      },
      'de': {
        name: 'Einzeltüten - 10 Stück',
        shortDescription: '10 Tüten mit je 7 Stickern',
        description: 'Zehn einzelne Stickerpackungen für die FIFA Fußball-Weltmeisterschaft 2026. Jede Tüte enthält 7 Sticker, insgesamt 70 Sticker. Bessere Ersparnis und mehr Chancen, dein Album zu vervollständigen.',
      },
    },
  },
  {
    id: 'bundle-stars',
    slug: 'bundle-especial-estrelas',
    images: [
      '/assets/de-boxbundle-006_1780421261995.webp',
      '/assets/de-boxbundle-007_1780421261995.webp',
      '/assets/de-boxbundle-008_1780421261994.webp',
      '/assets/de-boxbundle-009_1780421261993.webp',
    ],
    price: 8990,
    originalPrice: 11990,
    currency: 'brl',
    priceId: '',
    badge: 'exclusive',
    featured: true,
    inStock: true,
    stripeProductName: 'Bundle Especial Estrelas',
    sortOrder: 6,
    translations: {
      'pt-BR': {
        name: 'Bundle Especial Estrelas',
        shortDescription: 'Pack temático com figurinhas dos maiores craques',
        description: 'Edição especial com figurinhas exclusivas dos maiores craques da Copa do Mundo FIFA 2026. Figurinhas com acabamento premium e design exclusivo para os fãs mais exigentes.',
      },
      'en': {
        name: 'Stars Special Bundle',
        shortDescription: 'Themed pack with stickers of the greatest stars',
        description: 'Special edition with exclusive stickers of the greatest FIFA World Cup 2026 stars. Premium finish stickers and exclusive design for the most demanding fans.',
      },
      'es': {
        name: 'Bundle Especial Estrellas',
        shortDescription: 'Pack temático con cromos de los mejores cracks',
        description: 'Edición especial con cromos exclusivos de los mejores cracks de la Copa del Mundo FIFA 2026. Cromos con acabado premium y diseño exclusivo para los aficionados más exigentes.',
      },
      'de': {
        name: 'Stars Special Bundle',
        shortDescription: 'Themen-Pack mit Stickern der größten Stars',
        description: 'Sonderausgabe mit exklusiven Stickern der größten Stars der FIFA Fußball-Weltmeisterschaft 2026. Premium-Veredelung und exklusives Design für die anspruchsvollsten Fans.',
      },
    },
  },
  {
    id: 'complete-collection',
    slug: 'colecao-completa',
    images: [
      '/assets/de-boxbundle-001_1780421261995.webp',
      '/assets/de-boxbundle-002_1780421261995.webp',
      '/assets/de-boxbundle-003_1780421261995.webp',
      '/assets/de-boxbundle-004_1780421261995.webp',
      '/assets/de-boxbundle-005_1780421261995.webp',
      '/assets/de-boxbundle-006_1780421261995.webp',
      '/assets/de-boxbundle-007_1780421261995.webp',
      '/assets/de-boxbundle-008_1780421261994.webp',
      '/assets/de-boxbundle-009_1780421261993.webp',
    ],
    price: 32990,
    originalPrice: 42970,
    currency: 'brl',
    priceId: '',
    badge: 'limitedEdition',
    featured: true,
    inStock: true,
    stripeProductName: 'Coleção Completa FIFA World Cup 2026',
    sortOrder: 7,
    translations: {
      'pt-BR': {
        name: 'Coleção Completa',
        shortDescription: 'Álbum + Box 100 Pacotes + Bundle Estrelas',
        description: 'O pacote definitivo para o colecionador completo: álbum oficial, caixa com 100 pacotes e o bundle especial estrelas. Tudo o que você precisa para uma coleção excepcional da Copa do Mundo FIFA 2026.',
      },
      'en': {
        name: 'Complete Collection',
        shortDescription: 'Album + Box 100 Packs + Stars Bundle',
        description: 'The ultimate package for the complete collector: official album, box with 100 packs and the special stars bundle. Everything you need for an exceptional FIFA World Cup 2026 collection.',
      },
      'es': {
        name: 'Colección Completa',
        shortDescription: 'Álbum + Caja 100 Sobres + Bundle Estrellas',
        description: 'El paquete definitivo para el coleccionista completo: álbum oficial, caja con 100 sobres y el bundle especial estrellas. Todo lo que necesitas para una colección excepcional de la Copa del Mundo FIFA 2026.',
      },
      'de': {
        name: 'Komplette Sammlung',
        shortDescription: 'Album + Box 100 Tüten + Stars Bundle',
        description: 'Das ultimative Paket für den vollständigen Sammler: offizielles Album, Box mit 100 Tüten und das Stars Special Bundle. Alles, was du für eine außergewöhnliche FIFA Fußball-Weltmeisterschaft 2026 Sammlung brauchst.',
      },
    },
  },
];
