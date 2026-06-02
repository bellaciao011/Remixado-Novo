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
    slug: 'box-50-pacotes',
    images: [
      '/assets/de3-boxbundle-001_1780437582882.webp',
      '/assets/de3-boxbundle-002_1780437582882.webp',
      '/assets/de3-boxbundle-003_1780437582881.webp',
      '/assets/de3-boxbundle-004_1780437582881.webp',
      '/assets/de3-boxbundle-005_1780437582881.webp',
      '/assets/de3-boxbundle-006_1780437582876.webp',
    ],
    price: 3200,
    originalPrice: null,
    currency: 'eur',
    priceId: '',
    badge: null,
    featured: true,
    inStock: true,
    stripeProductName: 'Box mit 50 Tüten FIFA World Cup 2026',
    sortOrder: 4,
    translations: {
      'pt-BR': {
        name: 'Coleção Oficial FIFA World Cup 2026™ – Caixa com 50 Envelopes',
        shortDescription: '50 envelopes com 7 figurinhas cada (350 figurinhas no total)',
        description: `Com cada caixa você recebe 350 figurinhas, distribuídas em 50 envelopes com 7 figurinhas cada.

A caixa com 50 envelopes forma uma base sólida para construir seu álbum passo a passo ou para completar pontos específicos da coleção.

Conteúdo da caixa:
• 50 envelopes com 7 figurinhas cada (= 350 figurinhas no total)

As vantagens da caixa com 50 envelopes:
• Base sólida: 350 figurinhas para um crescimento real da sua coleção
• Uso flexível: Ideal para começar ou para complementar a qualquer momento
• Quantidade certa: Fácil de organizar e colar – perfeito para quem quer colecionar passo a passo

O que espera você na coleção de figurinhas da Copa do Mundo FIFA 2026™:
• A Copa do Mundo para colecionar: Todas as 48 seleções classificadas para a Copa 2026
• Futebol para vivenciar: Cada uma das 980 figurinhas te aproxima das emoções do torneio
• Stars de perto: Descubra os melhores jogadores de cada nação
• Colecionar, colar e trocar com amigos e família`,
      },
      'en': {
        name: 'Official FIFA World Cup 2026™ Sticker Collection – Box with 50 Packs',
        shortDescription: '50 packs with 7 stickers each (350 stickers total)',
        description: `With every box you get 350 stickers, spread across 50 packs with 7 stickers each.

The box with 50 packs forms a solid foundation for building your album piece by piece or filling in specific gaps.

What's in the box:
• 50 packs with 7 stickers each (= 350 stickers total)

The advantages of the box with 50 packs:
• Solid base: 350 stickers for a noticeable boost to your collection
• Flexible use: Perfect as a starting point or to top up your collection along the way
• Just the right amount: Easy to sort and stick – perfect for those who like to collect step by step

What awaits you in the FIFA World Cup 2026™ sticker collection:
• The World Cup to collect: All 48 teams qualified for the 2026 World Cup
• Football to experience: Each of the 980 stickers brings you closer to the tournament action
• Stars up close: Discover the best players from every nation
• Collect, stick and trade with friends and family`,
      },
      'es': {
        name: 'Colección Oficial FIFA World Cup 2026™ – Caja con 50 Sobres',
        shortDescription: '50 sobres con 7 cromos cada uno (350 cromos en total)',
        description: `Con cada caja recibes 350 cromos, distribuidos en 50 sobres de 7 cromos cada uno.

La caja con 50 sobres forma una base sólida para construir tu álbum poco a poco o para completar partes específicas de tu colección.

Contenido de la caja:
• 50 sobres con 7 cromos cada uno (= 350 cromos en total)

Las ventajas de la caja con 50 sobres:
• Base sólida: 350 cromos para un crecimiento real de tu colección
• Uso flexible: Ideal para empezar o para complementar tu colección en cualquier momento
• Cantidad adecuada: Fácil de ordenar y pegar – perfecto para quienes quieren coleccionar paso a paso

Lo que te espera en la colección de cromos de la Copa del Mundo FIFA 2026™:
• El Mundial para coleccionar: Los 48 equipos clasificados para la Copa 2026
• Fútbol para vivir: Cada uno de los 980 cromos te acerca a la emoción del torneo
• Estrellas de cerca: Descubre a los mejores jugadores de cada nación
• Coleccionar, pegar e intercambiar con amigos y familia`,
      },
      'de': {
        name: 'Offizielle FIFA World Cup 2026™ Stickerkollektion – Box mit 50 Tüten',
        shortDescription: '50 Tüten mit je 7 Stickern (350 Sticker insgesamt)',
        description: `Mit jeder Box erhältst du 350 Sticker, verteilt auf 50 Tüten mit je 7 Stickern.

Die Box mit 50 Tüten bildet eine solide Grundlage, um dein Album Stück für Stück aufzubauen oder gezielt zu ergänzen.

In der Box enthalten:
• 50 Tüten mit je 7 Stickern (= 350 Sticker insgesamt)

Die Vorteile der Box mit 50 Tüten:
• Solide Basis: 350 Sticker für einen spürbaren Ausbau deiner Sammlung
• Flexibel einsetzbar: Ideal zum Start oder als Ergänzung zwischendurch
• Angenehme Menge: Gut handhabbar beim Sortieren & Einkleben und somit perfekt für alle, die Schritt für Schritt sammeln möchten

Das erwartet dich in der FIFA World Cup 2026™ Stickerkollektion:
• Die Weltmeisterschaft zum Sammeln: Alle 48 für die WM 2026 qualifizierten Teams
• Fußball zum Erleben: Jeder der insgesamt 980 Sticker bringt dich näher ans Turniergeschehen
• Stars hautnah: Entdecke die besten Spieler jeder Nation
• Sammeln, Kleben und Tauschen mit Freunden und Familie`,
      },
    },
  },
  {
    id: 'pack-10',
    slug: 'box-100-pacotes',
    images: [
      '/assets/de4-boxbundle-001_1780437762796.webp',
      '/assets/de4-boxbundle-002_1780437762795.webp',
      '/assets/de4-boxbundle-003_1780437762795.webp',
      '/assets/de4-boxbundle-004_1780437762795.webp',
      '/assets/de4-boxbundle-005_1780437762794.webp',
      '/assets/de4-boxbundle-006_1780437762789.webp',
    ],
    price: 7500,
    originalPrice: null,
    currency: 'eur',
    priceId: '',
    badge: 'bestSeller',
    featured: true,
    inStock: true,
    stripeProductName: 'Box mit 100 Tüten FIFA World Cup 2026',
    sortOrder: 5,
    translations: {
      'pt-BR': {
        name: 'Coleção Oficial FIFA World Cup 2026™ – Caixa com 100 Envelopes',
        shortDescription: '100 envelopes com 7 figurinhas cada (700 figurinhas no total)',
        description: `Com esta caixa você recebe 700 figurinhas, distribuídas em 100 envelopes com 7 figurinhas cada.

A caixa com 100 envelopes ajuda você a avançar muito mais no álbum e a trabalhar especificamente nas figurinhas que ainda faltam.

Conteúdo da caixa:
• 100 envelopes com 7 figurinhas cada (= 700 figurinhas no total)

As vantagens da caixa com 100 envelopes:
• Grande impulso na coleção: 700 figurinhas para um progresso real no álbum
• Variedade garantida: Mais motivos novos a cada envelope aberto
• Diversão total: Ideal para sessões longas de figurinhas
• Seguro e direto: Entregue embalado originalmente pelo fabricante

O que espera você na coleção de figurinhas da Copa do Mundo FIFA 2026™:
• Coleção oficial do torneio: Com todas as 48 seleções da Copa 2026
• Desafio empolgante: 980 figurinhas diferentes no total para colecionar
• No meio da ação: Viva o torneio figurinha por figurinha
• Colecionar, trocar e torcer: O companheiro perfeito para o maior evento do verão de 2026`,
      },
      'en': {
        name: 'Official FIFA World Cup 2026™ Sticker Collection – Box with 100 Packs',
        shortDescription: '100 packs with 7 stickers each (700 stickers total)',
        description: `With this box you get 700 stickers, spread across 100 packs with 7 stickers each.

The box with 100 packs helps you make significant progress in your album and work specifically on the stickers you're still missing.

What's in the box:
• 100 packs with 7 stickers each (= 700 stickers total)

The advantages of the box with 100 packs:
• Major collecting boost: 700 stickers for noticeable progress in the album
• Full of variety: More new designs with every pack you open
• Pure collecting fun: Ideal for longer sticker sessions
• Safe and direct: Delivered factory-sealed from the manufacturer

What awaits you in the FIFA World Cup 2026™ sticker collection:
• Official tournament collection: Featuring all 48 national teams of the 2026 World Cup
• Thrilling challenge: A total of 980 different stickers to collect
• Right in the action: Experience the tournament sticker by sticker
• Collect, trade and cheer: The perfect companion for the biggest event of summer 2026`,
      },
      'es': {
        name: 'Colección Oficial FIFA World Cup 2026™ – Caja con 100 Sobres',
        shortDescription: '100 sobres con 7 cromos cada uno (700 cromos en total)',
        description: `Con esta caja recibes 700 cromos, distribuidos en 100 sobres de 7 cromos cada uno.

La caja con 100 sobres te ayuda a avanzar significativamente en tu álbum y a trabajar específicamente en los cromos que aún te faltan.

Contenido de la caja:
• 100 sobres con 7 cromos cada uno (= 700 cromos en total)

Las ventajas de la caja con 100 sobres:
• Gran impulso coleccionista: 700 cromos para un progreso notable en el álbum
• Lleno de variedad: Más diseños nuevos con cada sobre que abres
• Diversión total: Ideal para sesiones largas de cromos
• Seguro y directo: Entregado embalado originalmente por el fabricante

Lo que te espera en la colección de cromos de la Copa del Mundo FIFA 2026™:
• Colección oficial del torneo: Con los 48 equipos nacionales de la Copa 2026
• Emocionante desafío: Un total de 980 cromos diferentes para coleccionar
• En plena acción: Vive el torneo cromo a cromo
• Coleccionar, intercambiar y animar: El compañero perfecto para el mayor evento del verano de 2026`,
      },
      'de': {
        name: 'Offizielle FIFA World Cup 2026™ Stickerkollektion – Box mit 100 Tüten',
        shortDescription: '100 Tüten mit je 7 Stickern (700 Sticker insgesamt)',
        description: `Mit der Box bekommst du 700 Sticker, verteilt auf 100 Tüten mit je 7 Stickern.

Die Box mit 100 Tüten hilft dir dein Album deutlich weiter auszubauen und gezielt an fehlenden Stickern zu arbeiten.

In der Box enthalten:
• 100 Tüten mit je 7 Stickern (= 700 Sticker insgesamt)

Die Vorteile der Box mit 100 Tüten:
• Großer Sammelschub: 700 Sticker für spürbaren Fortschritt im Album
• Abwechslungsreich: Mehr neue Motive beim Öffnen der Tüten
• Sammelspaß pur: Ideal für längere Sticker-Sessions
• Sicher und direkt: Originalverpackt vom Hersteller zu dir geliefert

Das erwartet dich in der Stickerkollektion zur FIFA Fußball-Weltmeisterschaft 2026™:
• Offizielle Turnierkollektion: Mit allen 48 Nationalmannschaften der WM 2026
• Spannende Herausforderung: Insgesamt 980 verschiedene Sticker zum Sammeln
• Mittendrin statt nur dabei: Erlebe das Turnier Sticker für Sticker
• Sammeln, tauschen, mitfiebern: Der perfekte Begleiter für das größte Event des Sommers 2026`,
      },
    },
  },
  {
    id: 'bundle-stars',
    slug: 'hardcover-big-box-bundle',
    images: [
      '/assets/de5-boxbundle-001_1780437996281.webp',
      '/assets/de5-boxbundle-002_1780437996280.webp',
      '/assets/de5-boxbundle-003_1780437996280.webp',
      '/assets/de5-boxbundle-004_1780437996280.webp',
      '/assets/de5-boxbundle-005_1780437996280.webp',
      '/assets/de5-boxbundle-006_1780437996279.webp',
      '/assets/de5-boxbundle-007_1780437996279.webp',
      '/assets/de5-boxbundle-008_1780437996269.webp',
    ],
    price: 7900,
    originalPrice: null,
    currency: 'eur',
    priceId: '',
    badge: 'exclusive',
    featured: true,
    inStock: true,
    stripeProductName: 'Hardcover Big Box-Bundle FIFA World Cup 2026',
    sortOrder: 6,
    translations: {
      'pt-BR': {
        name: 'Coleção Oficial FIFA World Cup 2026™ – Hardcover Big Box-Bundle',
        shortDescription: '1 Álbum Hardcover + 1 Caixa com 100 Envelopes (700 figurinhas)',
        description: `Cada Hardcover Big Box-Bundle da Copa do Mundo FIFA 2026™ contém 1 Álbum Hardcover e 700 figurinhas.

O Hardcover Big Box-Bundle é ideal para quem quer começar a colecionar com tudo e apresentar sua coleção em um álbum premium de capa dura.

Conteúdo do Hardcover Big Box-Bundle:
• 1 Álbum Hardcover com 112 páginas
• 1 Caixa com 100 envelopes de 7 figurinhas cada (= 700 figurinhas)

Suas vantagens com o Treasure-Bundle:
• Comece agora: Set atraente com álbum Hardcover premium e caixa de 100 envelopes – tudo disponível em um só clique
• Apresentação de qualidade: O álbum Hardcover garante um visual sofisticado e torna sua coleção um verdadeiro destaque
• Diversão de colecionar: Com mais de 700 figurinhas, você já completa boa parte do álbum de uma só vez
• Original do fabricante: Embalado com segurança e enviado diretamente pela Panini

O que a coleção de figurinhas da Copa do Mundo 2026 oferece:
• Oficialmente licenciado: Inclui todas as 48 seleções classificadas para a Copa do Mundo FIFA 2026™
• 980 figurinhas para colecionar: Caça todas as figurinhas da coleção e complete seu álbum
• Tudo sobre a Copa em um lugar: Descubra todos os participantes do torneio nos EUA, México e Canadá
• Times & Estrelas: Para cada seleção há 18 figurinhas de jogadores, uma foto do time e o escudo oficial
• Atmosfera de Copa em casa: Use seu álbum como guia antes e durante o torneio`,
      },
      'en': {
        name: 'Official FIFA World Cup 2026™ Sticker Collection – Hardcover Big Box-Bundle',
        shortDescription: '1 Hardcover Album + 1 Box with 100 Packs (700 stickers)',
        description: `Each Hardcover Big Box-Bundle for the FIFA World Cup 2026™ contains 1 Hardcover Album and 700 stickers.

The Hardcover Big Box-Bundle is perfect for you if you want to dive into collecting in a big way and present your collection in a premium hardcover album.

What's in the Hardcover Big Box-Bundle:
• 1 Hardcover Album with 112 pages
• 1 Box with 100 packs of 7 stickers each (= 700 stickers)

Your advantages with the Treasure-Bundle:
• Jump right in: Attractive set with a premium Hardcover Album and 100-pack box – all conveniently available with one click
• Premium presentation: The Hardcover Album gives your collection a high-quality look and makes it a real eye-catcher
• Extensive collecting fun: With over 700 stickers, there's a good chance you'll complete a large part of your album in one go
• Direct from the manufacturer: Safely packaged and shipped directly by Panini

What the FIFA World Cup 2026 sticker collection offers:
• Officially licensed: Features all 48 qualified national teams of the FIFA World Cup 2026™
• 980 stickers to collect: Hunt down every sticker in the collection and complete your album
• Full World Cup overview: Discover all tournament participants from the USA, Mexico and Canada
• Teams & Stars: Each team features 18 player stickers, a team photo and the official association badge
• World Cup atmosphere at home: Use your album as a reference guide before and during the tournament`,
      },
      'es': {
        name: 'Colección Oficial FIFA World Cup 2026™ – Hardcover Big Box-Bundle',
        shortDescription: '1 Álbum Tapa Dura + 1 Caja con 100 Sobres (700 cromos)',
        description: `Cada Hardcover Big Box-Bundle de la Copa del Mundo FIFA 2026™ contiene 1 Álbum de Tapa Dura y 700 cromos.

El Hardcover Big Box-Bundle es perfecto si quieres empezar a coleccionar a lo grande y presentar tu colección en un álbum premium de tapa dura.

Contenido del Hardcover Big Box-Bundle:
• 1 Álbum Tapa Dura con 112 páginas
• 1 Caja con 100 sobres de 7 cromos cada uno (= 700 cromos)

Tus ventajas con el Treasure-Bundle:
• Empieza ya: Atractivo set con álbum Hardcover premium y caja de 100 sobres – todo disponible con un solo clic
• Presentación premium: El álbum Hardcover da a tu colección un aspecto de calidad y la convierte en un auténtico centro de atención
• Diversión coleccionista: Con más de 700 cromos, es muy probable que completes gran parte del álbum de una sola vez
• Directo del fabricante: Empaquetado de forma segura y enviado directamente por Panini

Lo que ofrece la colección de cromos de la Copa del Mundo 2026:
• Con licencia oficial: Incluye los 48 equipos nacionales clasificados para la Copa del Mundo FIFA 2026™
• 980 cromos para coleccionar: Ve a por todos los cromos de la colección y completa tu álbum
• Todo sobre el Mundial en un vistazo: Descubre todos los participantes del torneo en EE.UU., México y Canadá
• Equipos y Estrellas: Cada selección tiene 18 cromos de jugadores, una foto del equipo y el escudo oficial
• Ambiente mundialista en casa: Usa tu álbum como guía antes y durante el torneo`,
      },
      'de': {
        name: 'Offizielle FIFA World Cup 2026™ Stickerkollektion – Hardcover Big Box-Bundle',
        shortDescription: '1 Hardcover-Album + 1 Box mit 100 Tüten (700 Sticker)',
        description: `Jedes Hardcover Big Box-Bundle zur FIFA Fußball-Weltmeisterschaft 2026™ enthält 1 Hardcover-Album und 700 Sticker.

Das Hardcover Big Box-Bundle ist genau das Richtige für dich, wenn du mit einem großen Schwung Sticker in deine Sammlung starten und diese im hochwertigen Hardcover präsentieren willst.

Im Hardcover Big Box-Bundle enthalten:
• 1 Hardcover-Album mit 112 Seiten
• 1 Box mit 100 Tüten à 7 Sticker (= 700 Sticker)

Deine Vorteile beim Treasure-Bundle:
• Direkt loslegen: Attraktives Set aus wertigem Hardcover Album und 100er Box – alles bequem mit nur einem Klick bestellbar
• Hochwertige Präsentation: Das Hardcover Album sorgt für einen hochwertigen Look und macht deine Sammlung zu einem echten Hingucker
• Umfangreicher Sammelspaß: Mit über 700 Stickern erwartet dich ein große Sammelabenteuer und mit etwas Glück hast du damit schon einen Großteil der Sticker für die Vervollständigung des Albums
• Original vom Hersteller: Sicher verpackt und direkt von Panini versendet

Das bietet dir die Stickerkollektion zur WM 2026:
• Offiziell lizenziert: Enthält alle 48 qualifizierten Nationalteams der FIFA Fußball-Weltmeisterschaft 2026™
• 980 Sticker zum Sammeln: Gehe auf die Jagd nach allen Stickern der Kollektion und vervollständige dein Album
• Alles zur WM im Überblick: Entdecke alle Teilnehmer des Turniers in den USA, Mexiko und Kanada
• Teams & Stars: Für jede Mannschaft gibt es 18 Spieler-Sticker, ein Teamfoto sowie das offizielle Verbandswappen
• WM-Atmosphäre für zuhause: Nutze dein Album als Nachschlagewerk vor und während des Turniers`,
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
