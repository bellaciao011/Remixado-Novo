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
    badge: 'bestSeller',
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
    id: 'big-collectors-bundle',
    slug: 'big-collectors-bundle',
    images: [
      '/assets/de11-boxbundle-001_1780458779150.webp',
      '/assets/de11-boxbundle-002_1780458779149.webp',
      '/assets/de11-boxbundle-003_1780458779149.webp',
      '/assets/de11-boxbundle-004_1780458779149.webp',
      '/assets/de11-boxbundle-005_1780458779146.webp',
    ],
    price: 11700,
    originalPrice: null,
    currency: 'eur',
    priceId: '',
    badge: 'exclusive',
    featured: true,
    inStock: true,
    stripeProductName: 'Big Collectors Bundle FIFA World Cup 2026',
    sortOrder: 12,
    translations: {
      'pt-BR': {
        name: 'Coleção Oficial FIFA World Cup 2026™ – Big Collector\'s Bundle',
        shortDescription: '1 Álbum + Big Collector\'s Box com 143 envelopes (1.007 figurinhas) + 3 Panini EXTRA-Stickers',
        description: `Com o Big Collector's Bundle exclusivo online, você garante álbum, 1.007 figurinhas + 3 dos raros Panini EXTRA-Stickers da Copa do Mundo FIFA 2026™.

Nosso maior bundle é ideal para quem quer começar a coleção com tudo desde o início!

Conteúdo do Big Collector's Bundle:
• 1 Álbum com 112 páginas e 6 figurinhas
• 1 Big Collector's Box exclusiva online com 143 envelopes de 7 figurinhas cada (= 1.001 figurinhas no total) + 3 Panini EXTRA-Stickers aleatórios

Vantagens do Big Collector's Bundle:
• Enorme diversão com figurinhas: 1.007 figurinhas + álbum – comece a colar na hora e complete com sorte
• Compra fácil: adicione o bundle ao carrinho com um clique
• Direto do fabricante: produtos originais entregues pela Panini
• Menos repetições: a exclusiva Big Collector's Box oferece as melhores chances de completar o álbum sem muitas figurinhas duplicadas
• Bônus: apenas na Big Collector's Box você recebe 3 dos 20 raríssimos Panini EXTRA-Stickers* como exclusividade

O que espera você na coleção da Copa do Mundo 2026™:
• Coleção totalmente licenciada com todas as 48 seleções classificadas
• Cada seleção com seus principais jogadores, foto do time e logo oficial da federação
• Visão detalhada da Copa 2026 nos EUA, México e Canadá
• 980 figurinhas diferentes para colecionar e colar
• Traz o verdadeiro clima de Copa para casa – perfeito para trocar, colecionar e torcer

*Os Panini EXTRA-Stickers não fazem parte da coleção principal e são adicionados aleatoriamente em média a cada 100º envelope`,
      },
      'en': {
        name: 'Official FIFA World Cup 2026™ Sticker Collection – Big Collector\'s Bundle',
        shortDescription: '1 Album + Big Collector\'s Box with 143 packs (1,007 stickers) + 3 Panini EXTRA-Stickers',
        description: `With the online-exclusive Big Collector's Bundle, you get an album, 1,007 stickers + 3 of the rare Panini EXTRA-Stickers for the FIFA World Cup 2026™.

Our biggest bundle is the right choice for you if you want to dive straight into your collection at full speed!

What's in the Big Collector's Bundle:
• 1 Album with 112 pages and 6 stickers
• 1 Online-exclusive Big Collector's Box with 143 packs of 7 stickers each (= 1,001 stickers total) + 3 random Panini EXTRA-Stickers

Your advantages with the Big Collector's Bundle:
• Massive sticker fun: 1,007 stickers plus album – start sticking right away and complete it with a bit of luck
• Easy shopping: add the bundle to your cart with just one click
• Direct from the manufacturer: original Panini products delivered
• Fewer duplicates: the exclusive Big Collector's Box gives you the best chances of completing your album without too many duplicates
• Bonus: only in the Big Collector's Box do you receive 3 of 20 especially rare Panini EXTRA-Stickers* as an exclusive addition

What awaits you in the ultimate FIFA World Cup 2026™ sticker collection:
• Fully licensed collection featuring all 48 qualified national teams
• Each team with their top players, team photo and official federation logo
• Detailed overview of the 2026 World Cup in the USA, Mexico and Canada
• 980 different stickers to collect and stick
• Brings the real World Cup feeling home – perfect for swapping, collecting and cheering

*Panini EXTRA-Stickers are not part of the main collection and are randomly included on average every 100th pack`,
      },
      'es': {
        name: 'Colección Oficial FIFA World Cup 2026™ – Big Collector\'s Bundle',
        shortDescription: '1 Álbum + Big Collector\'s Box con 143 sobres (1.007 cromos) + 3 Panini EXTRA-Stickers',
        description: `Con el Big Collector's Bundle exclusivo online, te aseguras álbum, 1.007 cromos + 3 de los raros Panini EXTRA-Stickers de la Copa del Mundo FIFA 2026™.

¡Nuestro bundle más grande es perfecto para quien quiere comenzar su colección a toda máquina!

Contenido del Big Collector's Bundle:
• 1 Álbum con 112 páginas y 6 cromos
• 1 Big Collector's Box exclusiva online con 143 sobres de 7 cromos cada uno (= 1.001 cromos en total) + 3 Panini EXTRA-Stickers aleatorios

Tus ventajas con el Big Collector's Bundle:
• Enorme diversión: 1.007 cromos + álbum – empieza a pegar enseguida y complétalo con suerte
• Compra fácil: añade el bundle al carrito con un solo clic
• Directo del fabricante: productos originales Panini entregados
• Menos duplicados: la exclusiva Big Collector's Box te da las mejores posibilidades de completar el álbum sin demasiados repetidos
• Bonus: solo en la Big Collector's Box recibes 3 de los 20 rarísimos Panini EXTRA-Stickers* como exclusividad

Lo que te espera en la colección definitiva de la Copa del Mundo 2026™:
• Colección totalmente licenciada con los 48 equipos clasificados
• Cada selección con sus mejores jugadores, foto del equipo y logo oficial de la federación
• Visión detallada de la Copa 2026 en EE.UU., México y Canadá
• 980 cromos diferentes para coleccionar y pegar
• Trae el verdadero ambiente mundialista a casa – perfecto para intercambiar, coleccionar y animar

*Los Panini EXTRA-Stickers no forman parte de la colección principal y se incluyen aleatoriamente de media en cada 100º sobre`,
      },
      'de': {
        name: 'Offizielle FIFA World Cup 2026™ Stickerkollektion – Big Collector\'s-Bundle',
        shortDescription: '1 Album + Big Collector\'s Box mit 143 Tüten (1.007 Sticker) + 3 Panini EXTRA-Sticker',
        description: `Mit dem online-exklusiven Big Collector's Bundle sicherst du dir Album, 1.007 Sticker + 3 der seltenen Panini EXTRA-Sticker zur FIFA Fußball-Weltmeisterschaft 2026™.

Unser größtes Bundle ist das Richtige für dich, wenn du mit deiner Sammlung direkt voll durchstarten willst!

Im Big Collector's-Bundle enthalten:
• 1 Album mit 112 Seiten und 6 Stickern
• 1 online-exklusive Big Collector's Box mit 143 Tüten mit je 7 Stickern (= 1.001 Sticker insgesamt) + 3 zufällige Panini EXTRA-Sticker

Deine Vorteile beim Big Collector's Bundle:
• Riesiger Sticker-Spaß: 1.007 Sticker plus Album – sofort loskleben und mit etwas Glück vervollständigen
• Einfach einkaufen: Bundle mit nur einem Klick in den Warenkorb legen
• Direkt vom Hersteller: Originalverpackte Produkte von Panini geliefert
• Weniger Dopplungen: Die exklusive Big Collector's Box bietet dir die besten Chancen dein Album ohne viele doppelte Sticker zu komplettieren
• Bonus: Nur in der Big Collector's Box erhältst du 3 von 20 besonders seltenen Panini EXTRA-Sticker* als exklusiven Zusatz

Das erwartet dich in der ultimativen Stickerkollektion zur WM 2026™:
• Vollständig lizenzierte Kollektion mit allen 48 qualifizierten Nationalteams
• Jede Mannschaft mit ihren Top-Spielern, Teamfoto und offiziellem Verbandslogo
• Detaillierter Überblick über die WM 2026 in den USA, Mexiko und Kanada
• Insgesamt 980 verschiedene Sticker zum Sammeln und Einkleben
• Bringt echtes WM-Feeling nach Hause – perfekt zum Tauschen, Sammeln und Mitfiebern

*Panini EXTRA-Sticker sind nicht Teil der Hauptkollektion und werden durchschnittlich jeder 100. Tüte zufällig beigelegt`,
      },
    },
  },
  {
    id: 'adrenalyn-omni-set',
    slug: 'adrenalyn-xl-omni-set',
    images: [
      '/assets/de10-boxbundle-001_1780458366583.webp',
      '/assets/de10-boxbundle-002_1780458366583.webp',
      '/assets/de10-boxbundle-003_1780458366583.webp',
      '/assets/de10-boxbundle-004_1780458366582.webp',
      '/assets/de10-boxbundle-005_1780458366582.webp',
      '/assets/de10-boxbundle-006_1780458366582.webp',
      '/assets/de10-boxbundle-007_1780458366581.webp',
      '/assets/de10-boxbundle-008_1780458366581.webp',
      '/assets/de10-boxbundle-009_1780458366571.webp',
    ],
    price: 20700,
    originalPrice: null,
    currency: 'eur',
    priceId: '',
    badge: 'limitedEdition',
    featured: true,
    inStock: true,
    stripeProductName: 'FIFA World Cup 2026 Adrenalyn XL Omni-Set Panini',
    sortOrder: 11,
    translations: {
      'pt-BR': {
        name: 'FIFA Copa do Mundo 2026™ Adrenalyn XL™ Omni-Set Panini',
        shortDescription: 'Coleção completa numerada (1/2026 a 2026/2026) – 630 cards + 9 Golden Ballers + 3 Momentum Cards',
        description: `Mergulhe na experiência definitiva da FIFA Copa do Mundo™ com o conjunto oficial Panini FIFA Copa do Mundo 2026™ Adrenalyn XL™ Omni Set.

Pela primeira vez, a Panini apresenta uma Complete Collection exclusiva em uma Deluxe Box – para verdadeiros colecionadores e fãs do futebol.
Cada caixa é numerada individualmente – de 1/2026 a 2026/2026.

Conteúdo:
• Todos os 630 cards oficiais, incluindo os 9 exclusivos Golden Ballers
• O único set com as 3 exclusivas Momentum Cards: Bellingham, Dembélé e Pulisic
• Pasta Deluxe de colecionador em qualidade premium – para proteger e apresentar sua coleção com exclusividade
• Código para o jogo online, para desbloquear os cards no jogo digital oficial
• Checklist completa para acompanhar cada card da coleção

O fascínio completo da FIFA Copa do Mundo™ Adrenalyn XL™ – exclusivamente online`,
      },
      'en': {
        name: 'FIFA World Cup 2026™ Adrenalyn XL™ Omni-Set Panini',
        shortDescription: 'Individually numbered complete collection (1/2026 to 2026/2026) – 630 cards + 9 Golden Ballers + 3 Momentum Cards',
        description: `Dive into the ultimate FIFA World Cup™ experience with the official Panini FIFA World Cup 2026™ Adrenalyn XL™ Omni Set.

For the very first time, Panini presents an exclusive Complete Collection in a Deluxe Box – for true collectors and football fans.
Each box is individually numbered – from 1/2026 to 2026/2026.

What's inside:
• All 630 official cards, including the nine unique Golden Ballers
• The only set featuring all three exclusive Momentum Cards: Bellingham, Dembélé and Pulisic
• Deluxe Collector's Binder in premium quality – to protect and exclusively showcase your collection
• Online game code to unlock the cards in the official digital game
• Complete checklist to track every card in the collection

The full fascination of the FIFA World Cup™ Adrenalyn XL™ – exclusively online`,
      },
      'es': {
        name: 'FIFA Copa del Mundo 2026™ Adrenalyn XL™ Omni-Set Panini',
        shortDescription: 'Colección completa numerada individualmente (1/2026 a 2026/2026) – 630 cartas + 9 Golden Ballers + 3 Momentum Cards',
        description: `Sumérgete en la experiencia definitiva de la Copa del Mundo FIFA™ con el set oficial Panini FIFA Copa del Mundo 2026™ Adrenalyn XL™ Omni Set.

Por primera vez, Panini presenta una Complete Collection exclusiva en una Deluxe Box – para verdaderos coleccionistas y aficionados al fútbol.
Cada caja está numerada individualmente – del 1/2026 al 2026/2026.

Contenido:
• Las 630 cartas oficiales, incluidos los 9 exclusivos Golden Ballers
• El único set con las 3 exclusivas Momentum Cards: Bellingham, Dembélé y Pulisic
• Carpeta Deluxe de coleccionista en calidad premium – para proteger y mostrar tu colección de forma exclusiva
• Código para el juego online, para desbloquear las cartas en el juego digital oficial
• Checklist completa para seguir cada carta de la colección

La fascinación completa de la Copa del Mundo FIFA™ Adrenalyn XL™ – exclusivamente online`,
      },
      'de': {
        name: 'FIFA Fußball-Weltmeisterschaft 2026™ Adrenalyn XL™ Omni-Set Panini',
        shortDescription: 'Individuell nummerierte Complete Collection (1/2026 bis 2026/2026) – 630 Karten + 9 Golden Ballers + 3 Momentum Cards',
        description: `Tauche ein in das ultimative FIFA Fußball-Weltmeisterschaft™ Erlebnis mit dem offiziellen Panini FIFA Fußball-Weltmeisterschaft 2026™ Adrenalyn XL™ Omni Set.

Zum ersten Mal überhaupt präsentiert Panini eine exklusive Complete Collection in einer Deluxe-Box – für echte Sammler und Fußballfans.
Jede Box ist einzeln nummeriert – von 1/2026 bis 2026/2026.

Enthalten sind:
• Alle 630 offiziellen Karten, inklusive der neun einzigartigen Golden Ballers
• Das einzige Set mit den drei exklusiven Momentum-Cards: Bellingham, Dembélé und Pulisic
• Deluxe Sammelordner in Premium-Qualität – zum Schutz und zur exklusiven Präsentation der Kollektion
• Online-Game-Code, um die Cards im offiziellen digitalen Game freizuschalten
• Vollständige Checklist, um jede Card der Kollektion nachzuverfolgen

Die volle Faszination der FIFA Fußball-Weltmeisterschaft™ Adrenalyn XL™ – exklusiv online`,
      },
    },
  },
  {
    id: 'treasure-box-united',
    slug: 'treasure-box-united-edition',
    images: [
      '/assets/de9-boxbundle-001_1780458133952.webp',
    ],
    price: 13000,
    originalPrice: null,
    currency: 'eur',
    priceId: '',
    badge: 'limitedEdition',
    featured: true,
    inStock: true,
    stripeProductName: 'FIFA World Cup 2026 Treasure Box United Edition Panini',
    sortOrder: 10,
    translations: {
      'pt-BR': {
        name: 'FIFA World Cup 2026™ – Treasure Box United Edition Panini',
        shortDescription: 'Edição limitada numerada (1/5000 a 5000/5000) – Álbum Hardcover exclusivo + 100 envelopes + 16 pôsteres',
        description: `Treasure Box United Edition: criada para colecionadores que procuram algo verdadeiramente especial.
Cada caixa é numerada individualmente, de 1/5000 a 5000/5000.

Nesta caixa limitada:
• 1 Álbum Hardcover exclusivo, elegante e resistente, disponível apenas nesta caixa — um lugar de honra para a sua coleção, não vendido separadamente
• 100 envelopes de figurinhas, com um total de 700 figurinhas — 100 vezes o som único do rasgar, 100 vezes a chance de encontrar as suas estrelas e 100 vezes a expectativa da próxima troca
• 16 pôsteres exclusivos das cidades-sede — leve a atmosfera de todos os palcos do mundial diretamente para as suas paredes. Esses pôsteres artísticos das cidades-sede da Copa do Mundo 2026 são peças únicas, disponíveis exclusivamente nesta Treasure Box`,
      },
      'en': {
        name: 'FIFA World Cup 2026™ Sticker Collection – Treasure Box United Edition Panini',
        shortDescription: 'Individually numbered limited edition (1/5000 to 5000/5000) – Exclusive Hardcover Album + 100 packets + 16 posters',
        description: `Treasure Box United Edition: created for collectors who are looking for something truly special.
Each box is individually numbered, from 1/5000 to 5000/5000.

Inside this limited box:
• 1 Exclusive Hardcover Album — elegant, sturdy and available only in this box. A place of honour for your collection, not available for individual purchase
• 100 sticker packets, totalling 700 stickers — 100 times the unique sound of tearing, 100 times the chance of finding your stars, and 100 times the anticipation of the next swap
• 16 Exclusive host city posters — bring the atmosphere of every World Cup venue straight to your walls. These artistic posters of the 2026 World Cup host cities are one-of-a-kind pieces, available exclusively in this Treasure Box`,
      },
      'es': {
        name: 'FIFA World Cup 2026™ Sticker Collection – Treasure Box United Edition Panini',
        shortDescription: 'Edición limitada numerada individualmente (1/5000 a 5000/5000) – Álbum Hardcover exclusivo + 100 sobres + 16 pósteres',
        description: `Treasure Box United Edition: creada para los coleccionistas que buscan algo verdaderamente especial.
Cada caja está numerada individualmente, del 1/5000 al 5000/5000.

Dentro de esta caja limitada:
• 1 Álbum Hardcover exclusivo — elegante, resistente y disponible únicamente en esta caja. Un lugar de honor para tu colección, no disponible para compra individual
• 100 sobres de cromos, con un total de 700 cromos — 100 veces el sonido único del rasgado, 100 veces la posibilidad de encontrar tus estrellas y 100 veces la emoción del próximo intercambio
• 16 pósteres exclusivos de las ciudades anfitrionas — lleva la atmósfera de todos los escenarios del Mundial directamente a tus paredes. Estos pósteres artísticos de las ciudades sede de la Copa del Mundo 2026 son piezas únicas, disponibles exclusivamente en esta Treasure Box`,
      },
      'de': {
        name: 'FIFA World Cup 2026™ Stickerkollektion – Treasure Box United Edition Panini',
        shortDescription: 'Individuell nummerierte Limitierung (1/5000 bis 5000/5000) – Exklusives Hardcover-Album + 100 Tüten + 16 Poster',
        description: `Treasure Box United Edition: erschaffen für Sammler, die etwas wirklich Besonderes suchen.
Jede Box ist individuell nummeriert, von 1/5000 bis 5000/5000.

In dieser limitierten Box:
• 1 Exklusives Hardcover-Album — elegant, robust und nur in dieser Box erhältlich. Ein Ehrenplatz für deine Sammlung, nicht einzeln käuflich
• 100 Stickertüten mit insgesamt 700 Stickern — 100-mal das einzigartige Geräusch des Aufreißens, 100-mal die Chance, deine Stars zu finden, und 100-mal die Vorfreude auf den nächsten Tausch
• 16 Exklusive Poster der Austragungsstädte — bringe die Atmosphäre aller WM-Stadien direkt an deine Wände. Diese künstlerischen Poster der Austragungsstädte der WM 2026 sind einzigartige Stücke, ausschließlich in dieser Treasure Box erhältlich`,
      },
    },
  },
  {
    id: 'treasure-box',
    slug: 'treasure-box-panini',
    images: [
      '/assets/de8-boxbundle-001_1780457763795.webp',
      '/assets/de8-boxbundle-002_1780457763794.webp',
      '/assets/de8-boxbundle-003_1780457763792.webp',
    ],
    price: 2400,
    originalPrice: null,
    currency: 'eur',
    priceId: '',
    badge: 'offer',
    featured: true,
    inStock: true,
    stripeProductName: 'FIFA World Cup 2026 Treasure Box Panini',
    sortOrder: 9,
    translations: {
      'pt-BR': {
        name: 'Coleção Oficial FIFA World Cup 2026™ – Treasure Box Panini',
        shortDescription: '24 envelopes de 7 figurinhas + Álbum Hardcover oficial',
        description: `Descubra a Coleção Oficial de Figurinhas Panini FIFA World Cup 2026™, dedicada à Copa do Mundo FIFA 2026™: o primeiro torneio com 48 seleções, realizado na América do Norte. Uma viagem pelas estrelas do futebol e pelos novos talentos em uma das coleções mais completas de sempre.

O álbum tem 112 páginas com 980 figurinhas no total, incluindo 68 figurinhas especiais em material premium.

Esta Treasure Box contém:
• 24 envelopes com 7 figurinhas cada
• 1 Álbum com capa dura`,
      },
      'en': {
        name: 'FIFA World Cup 2026™ Official Sticker Collection – Treasure Box Panini',
        shortDescription: '24 packets of 7 stickers + Official Hardcover Album',
        description: `Discover the FIFA World Cup 2026™ Official Sticker Collection by Panini, dedicated to the FIFA World Cup 2026™: the first tournament with 48 teams, hosted in North America. A journey through football's biggest stars and rising talents in one of the most complete collections ever.

The album features 112 pages with 980 stickers in total, including 68 special stickers on premium material.

This Treasure Box contains:
• 24 packets of 7 stickers each
• 1 Hardcover album`,
      },
      'es': {
        name: 'Colección Oficial FIFA World Cup 2026™ – Treasure Box Panini',
        shortDescription: '24 sobres de 7 cromos + Álbum oficial de Tapa Dura',
        description: `Descubre la Colección Oficial de Cromos Panini FIFA World Cup 2026™, dedicada a la Copa del Mundo FIFA 2026™: el primer torneo con 48 equipos, celebrado en América del Norte. Un viaje entre las estrellas del fútbol y los nuevos talentos en una de las colecciones más completas de la historia.

El álbum tiene 112 páginas con 980 cromos en total, incluidos 68 cromos especiales en material premium.

Esta Treasure Box contiene:
• 24 sobres de 7 cromos cada uno
• 1 Álbum de tapa dura`,
      },
      'de': {
        name: 'FIFA World Cup 2026™ Offizielle Stickerkollektion – Treasure Box Panini',
        shortDescription: '24 Tüten mit je 7 Stickern + Offizielles Hardcover-Album',
        description: `Entdecke die offizielle Panini FIFA World Cup 2026™ Stickerkollektion, gewidmet der FIFA Fußball-Weltmeisterschaft 2026™: das erste Turnier mit 48 Mannschaften, ausgetragen in Nordamerika. Eine Reise durch die Stars des Fußballs und die aufstrebenden Talente – in einer der vollständigsten Kollektionen aller Zeiten.

Das Album umfasst 112 Seiten mit insgesamt 980 Stickern, darunter 68 Sonder-Sticker auf Premium-Material.

Diese Treasure Box enthält:
• 24 Tüten mit je 7 Stickern
• 1 Hardcover-Album`,
      },
    },
  },
  {
    id: 'bundle-3boxes-hardcover',
    slug: '3-caixas-50-album-hardcover',
    images: [
      '/assets/de7-boxbundle-001_1780457266087.webp',
      '/assets/de7-boxbundle-002_1780457266087.webp',
      '/assets/de7-boxbundle-003_1780457266079.webp',
      '/assets/de7-boxbundle-004_1780457266077.webp',
    ],
    price: 13700,
    originalPrice: null,
    currency: 'eur',
    priceId: '',
    badge: 'bestSeller',
    featured: true,
    inStock: true,
    stripeProductName: '3 Boxes of 50 Packets + Hardcover Album FIFA World Cup 2026',
    sortOrder: 8,
    translations: {
      'pt-BR': {
        name: 'Coleção Oficial FIFA World Cup 2026™ – 3 Caixas de 50 Envelopes + Álbum Hardcover',
        shortDescription: '3 Caixas de 50 envelopes + 1 Álbum Hardcover. Cada envelope contém 7 figurinhas.',
        description: `A coleção oficial de figurinhas Panini FIFA World Cup 2026™ chegou!

Este bundle inclui:
• 3 Caixas de 50 envelopes (= 1.050 figurinhas no total)
• 1 Álbum Hardcover oficial

Cada envelope contém 7 figurinhas.

O pacote ideal para quem quer dar um grande salto na coleção e guardar tudo no álbum premium de capa dura.`,
      },
      'en': {
        name: 'Official FIFA World Cup 2026™ Sticker Collection – 3 Boxes of 50 Packets + Hardcover Album',
        shortDescription: '3 Boxes of 50 packets + 1 Hardcover Album. Each packet contains 7 stickers.',
        description: `The Panini FIFA World Cup 2026™ official sticker collection is here!

This bundle includes:
• 3 Boxes of 50 packets (= 1,050 stickers total)
• 1 Official Hardcover Album

Each packet contains 7 stickers.

The ideal bundle for those who want to make a huge leap in their collection and store everything in a premium hardcover album.`,
      },
      'es': {
        name: 'Colección Oficial FIFA World Cup 2026™ – 3 Cajas de 50 Sobres + Álbum Tapa Dura',
        shortDescription: '3 Cajas de 50 sobres + 1 Álbum Tapa Dura. Cada sobre contiene 7 cromos.',
        description: `¡La colección oficial de cromos Panini FIFA World Cup 2026™ ya está aquí!

Este bundle incluye:
• 3 Cajas de 50 sobres (= 1.050 cromos en total)
• 1 Álbum oficial de Tapa Dura

Cada sobre contiene 7 cromos.

El bundle ideal para quienes quieren dar un gran salto en su colección y guardar todo en un álbum premium de tapa dura.`,
      },
      'de': {
        name: 'Offizielle FIFA World Cup 2026™ Stickerkollektion – 3 Boxen à 50 Tüten + Hardcover-Album',
        shortDescription: '3 Boxen mit je 50 Tüten + 1 Hardcover-Album. Jede Tüte enthält 7 Sticker.',
        description: `Die offizielle Panini FIFA World Cup 2026™ Stickerkollektion ist da!

Dieses Bundle enthält:
• 3 Boxen mit je 50 Tüten (= 1.050 Sticker insgesamt)
• 1 Offizielles Hardcover-Album

Jede Tüte enthält 7 Sticker.

Das ideale Bundle für alle, die einen großen Sprung in ihrer Sammlung machen und alles im hochwertigen Hardcover-Album aufbewahren möchten.`,
      },
    },
  },
  {
    id: 'complete-collection',
    slug: 'box-50-pocket-classic-tin',
    images: [
      '/assets/de6-boxbundle-001_1780438501225.webp',
      '/assets/de6-boxbundle-002_1780438501217.webp',
      '/assets/de6-boxbundle-003_1780438501217.webp',
      '/assets/de6-boxbundle-004_1780438501216.webp',
      '/assets/de6-boxbundle-005_1780438501216.webp',
    ],
    price: 6800,
    originalPrice: null,
    currency: 'eur',
    priceId: '',
    badge: 'limitedEdition',
    featured: true,
    inStock: true,
    stripeProductName: 'Box 50 Packets + Pocket Tin + Classic Tin FIFA World Cup 2026',
    sortOrder: 7,
    translations: {
      'pt-BR': {
        name: 'Coleção Oficial FIFA World Cup 2026™ – Caixa 50 Envelopes + Pocket Tin + Classic Tin',
        shortDescription: 'Caixa com 50 envelopes + 1 Pocket Tin (8 envelopes) + 1 Classic Tin (16 envelopes)',
        description: `A coleção oficial de figurinhas Panini FIFA World Cup 2026™ chegou!

Este bundle exclusivo inclui:
• 1 Caixa com 50 envelopes
• 1 Pocket Tin aleatória com 8 envelopes
• 1 Classic Tin aleatória com 16 envelopes

Cada envelope contém 7 figurinhas.

As Pocket Tins e Classic Tins são enviadas em designs aleatórios – uma surpresa a mais para os fãs da coleção!`,
      },
      'en': {
        name: 'Official FIFA World Cup 2026™ Sticker Collection – Box of 50 Packets + Pocket Tin + Classic Tin',
        shortDescription: 'Box of 50 packets + 1 Pocket Tin (8 packets) + 1 Classic Tin (16 packets)',
        description: `The Panini FIFA World Cup 2026™ official sticker collection is here!

This exclusive bundle includes:
• 1 Box of 50 packets
• 1 Random Pocket Tin with 8 packets
• 1 Random Classic Tin with 16 packets

Each packet contains 7 stickers.

The Pocket Tins and Classic Tins are sent in random designs – an extra surprise for fans of the collection!`,
      },
      'es': {
        name: 'Colección Oficial FIFA World Cup 2026™ – Caja de 50 Sobres + Pocket Tin + Classic Tin',
        shortDescription: 'Caja con 50 sobres + 1 Pocket Tin (8 sobres) + 1 Classic Tin (16 sobres)',
        description: `¡La colección oficial de cromos Panini FIFA World Cup 2026™ ya está aquí!

Este bundle exclusivo incluye:
• 1 Caja con 50 sobres
• 1 Pocket Tin aleatoria con 8 sobres
• 1 Classic Tin aleatoria con 16 sobres

Cada sobre contiene 7 cromos.

¡Las Pocket Tins y Classic Tins se envían en diseños aleatorios – una sorpresa extra para los fans de la colección!`,
      },
      'de': {
        name: 'Offizielle FIFA World Cup 2026™ Stickerkollektion – Box mit 50 Tüten + Pocket Tin + Classic Tin',
        shortDescription: 'Box mit 50 Tüten + 1 Pocket Tin (8 Tüten) + 1 Classic Tin (16 Tüten)',
        description: `Die offizielle Panini FIFA World Cup 2026™ Stickerkollektion ist da!

Dieses exklusive Bundle enthält:
• 1 Box mit 50 Tüten
• 1 zufällige Pocket Tin mit 8 Tüten
• 1 zufällige Classic Tin mit 16 Tüten

Jede Tüte enthält 7 Sticker.

Die Pocket Tins und Classic Tins werden in zufälligen Designs versendet – eine zusätzliche Überraschung für alle Fans der Kollektion!`,
      },
    },
  },
  {
    id: 'super-premium-box-60',
    slug: 'super-premium-box-60',
    images: [
      '/assets/de13-boxbundle-001_1780460546576.webp',
      '/assets/de13-boxbundle-002_1780460546575.webp',
      '/assets/de13-boxbundle-003_1780460546575.webp',
      '/assets/de13-boxbundle-004_1780460546571.webp',
    ],
    price: 7400,
    originalPrice: null,
    currency: 'eur',
    priceId: '',
    badge: 'exclusive',
    featured: true,
    inStock: true,
    stripeProductName: 'Coleção Oficial FIFA World Cup 2026™ – Box Super Premium com 60 Envelopes',
    sortOrder: 14,
    translations: {
      'pt-BR': {
        name: 'Coleção Oficial FIFA World Cup 2026™ – Box Super Premium com 60 Envelopes',
        shortDescription: 'Álbum Capa Dura Ouro + 60 envelopes com 420 figurinhas oficiais',
        description: `Este Exclusivo Box Super Premium inclui 1 Álbum Capa Dura Ouro, 60 envelopes com 420 figurinhas oficiais que podem ajudar você a completar seu álbum com jogadores, escudos das seleções e momentos inesquecíveis do torneio. Abrir cada envelope é como reviver a emoção da Copa do Mundo e compartilhar sua paixão pelo futebol com a família e os amigos.

FIFA World Cup 2026™ – Livro Ilustrado Oficial
As emoções do maior espetáculo esportivo do mundo eternizadas no maior álbum de figurinhas de todos os tempos! Uma coleção completa, com todas as seleções classificadas, cromos especiais e todos os detalhes para você acompanhar de pertinho a disputa pela taça da FIFA World Cup 2026™!

O álbum tem 980 cromos, sendo 68 deles especiais, e contempla as 48 seleções que participam do Mundial de 2026, que acontece entre junho e julho no México, nos Estados Unidos e no Canadá.

Conteúdo do Box Super Premium:
• 1 Álbum Capa Dura Ouro – FIFA World Cup 2026™ Livro Ilustrado Oficial
• 60 envelopes com 7 figurinhas cada (420 figurinhas no total)
• 980 cromos no álbum, sendo 68 especiais
• 48 seleções participantes do Mundial 2026
• Perfeito para começar sua coleção ou adicionar peças exclusivas`,
      },
      'en': {
        name: 'Official FIFA World Cup 2026™ Collection – Super Premium Box with 60 Packets',
        shortDescription: 'Gold Hardcover Album + 60 packets with 420 official stickers',
        description: `This Exclusive Super Premium Box includes 1 Gold Hardcover Album, 60 packets containing 420 official stickers to help you complete your album with players, national team badges and unforgettable moments from the tournament. Opening each packet is like reliving the excitement of the World Cup and sharing your passion for football with family and friends.

FIFA World Cup 2026™ – Official Illustrated Book
The emotions of the world's greatest sporting spectacle immortalized in the greatest sticker album of all time! A complete collection featuring all qualified national teams, special stickers and every detail to follow the battle for the FIFA World Cup 2026™ trophy!

The album features 980 stickers, 68 of them special, covering all 48 national teams participating in the 2026 World Cup, held between June and July in Mexico, the United States and Canada.

Super Premium Box contents:
• 1 Gold Hardcover Album – FIFA World Cup 2026™ Official Illustrated Book
• 60 packets with 7 stickers each (420 stickers total)
• 980 stickers in the album, 68 of them special
• 48 participating national teams at the 2026 World Cup
• Perfect to start your collection or add exclusive pieces`,
      },
      'es': {
        name: 'Colección Oficial FIFA World Cup 2026™ – Caja Super Premium con 60 Sobres',
        shortDescription: 'Álbum Tapa Dura Oro + 60 sobres con 420 stickers oficiales',
        description: `Esta exclusiva Caja Super Premium incluye 1 Álbum Tapa Dura Oro, 60 sobres con 420 stickers oficiales que te ayudarán a completar tu álbum con jugadores, escudos de selecciones y momentos inolvidables del torneo. Abrir cada sobre es como revivir la emoción del Mundial y compartir tu pasión por el fútbol con la familia y los amigos.

FIFA World Cup 2026™ – Libro Ilustrado Oficial
¡Las emociones del mayor espectáculo deportivo del mundo inmortalizadas en el mayor álbum de stickers de todos los tiempos! Una colección completa con todas las selecciones clasificadas, cromos especiales y todos los detalles para seguir de cerca la lucha por el trofeo de la FIFA World Cup 2026™.

El álbum cuenta con 980 cromos, 68 de ellos especiales, e incluye las 48 selecciones participantes del Mundial 2026, que se celebra entre junio y julio en México, Estados Unidos y Canadá.

Contenido de la Caja Super Premium:
• 1 Álbum Tapa Dura Oro – FIFA World Cup 2026™ Libro Ilustrado Oficial
• 60 sobres con 7 stickers cada uno (420 stickers en total)
• 980 cromos en el álbum, 68 de ellos especiales
• 48 selecciones participantes del Mundial 2026
• Perfecto para comenzar tu colección o añadir piezas exclusivas`,
      },
      'de': {
        name: 'Offizielle FIFA Fußball-WM 2026™ Kollektion – Super Premium Box mit 60 Tüten',
        shortDescription: 'Gold-Hardcover-Album + 60 Tüten mit 420 offiziellen Stickern',
        description: `Diese exklusive Super Premium Box enthält 1 Gold-Hardcover-Album, 60 Tüten mit 420 offiziellen Stickern, die dir helfen, dein Album mit Spielern, Nationalmannschaftswappen und unvergesslichen Turniermomenten zu vervollständigen. Jede Tüte zu öffnen ist wie die WM-Begeisterung neu zu erleben und deine Leidenschaft für Fußball mit Familie und Freunden zu teilen.

FIFA Fußball-WM 2026™ – Offizielles Illustriertes Buch
Die Emotionen des größten sportlichen Spektakels der Welt, verewigt im größten Stickeralbum aller Zeiten! Eine vollständige Kollektion mit allen qualifizierten Nationalmannschaften, Spezialstickern und allen Details, um den Kampf um den FIFA Fußball-WM 2026™-Pokal hautnah mitzuverfolgen!

Das Album enthält 980 Sticker, davon 68 Spezialsticker, und deckt alle 48 Nationalmannschaften ab, die an der WM 2026 teilnehmen – zwischen Juni und Juli in Mexiko, den USA und Kanada.

Inhalt der Super Premium Box:
• 1 Gold-Hardcover-Album – FIFA Fußball-WM 2026™ Offizielles Illustriertes Buch
• 60 Tüten mit je 7 Stickern (420 Sticker insgesamt)
• 980 Sticker im Album, davon 68 Spezialsticker
• 48 teilnehmende Nationalmannschaften bei der WM 2026
• Perfekt, um deine Sammlung zu starten oder exklusive Stücke hinzuzufügen`,
      },
    },
  },
  {
    id: 'kit-estadio-numerado',
    slug: 'kit-estadio-numerado',
    images: [
      '/assets/stadium001_1780461377293.jpg',
      '/assets/de14-boxbundle-001_1780461214828.webp',
      '/assets/de14-boxbundle-002_1780461095017.webp',
      '/assets/de14-boxbundle-003_1780461095017.webp',
      '/assets/de14-boxbundle-004_1780461095017.webp',
      '/assets/de14-boxbundle-005_1780461095014.webp',
    ],
    price: 17900,
    originalPrice: null,
    currency: 'eur',
    priceId: '',
    badge: 'limitedEdition',
    featured: true,
    inStock: true,
    stripeProductName: 'Coleção Oficial FIFA World Cup 2026™ – Kit Exclusivo Estádio Numerado 150 Envelopes',
    sortOrder: 15,
    translations: {
      'pt-BR': {
        name: 'Coleção Oficial FIFA World Cup 2026™ – Kit Exclusivo Estádio Numerado Com 150 Envelopes',
        shortDescription: 'Álbum Capa Dura Ouro Numerado + 150 envelopes + Voucher 50 Figurinhas',
        description: `Kit Exclusivo na Livraria Leitura — Para os apaixonados por coleção, o Super Kit Especial Estádio PANINI FIFA World Cup 2026 é uma edição especial pensada para transformar a experiência de colecionar em algo ainda mais memorável.

Este kit exclusivo e em quantidade limitada contém 1 Álbum Capa Dura Ouro Numerado e 150 envelopes, com um total de 1.050 figurinhas oficiais, reunindo jogadores, escudos das seleções e momentos marcantes do torneio.

Como diferencial, o kit ainda acompanha um voucher exclusivo de Missing Stickers, com direito a 50 figurinhas à sua escolha no site da Panini, ideal para ajudar na reta final da coleção.

Perfeito para quem deseja começar sua coleção com um item de destaque ou garantir uma edição especial para o seu acervo.

Conteúdo do Kit Exclusivo Estádio:
• 1 Álbum Capa Dura Ouro Numerado – FIFA World Cup 2026™
• 150 envelopes com 7 figurinhas cada (1.050 figurinhas no total)
• 1 Voucher exclusivo de Missing Stickers (50 figurinhas à escolha)
• Edição limitada e numerada
• Produto oficial licenciado pela FIFA`,
      },
      'en': {
        name: 'Official FIFA World Cup 2026™ Collection – Numbered Stadium Exclusive Kit with 150 Packets',
        shortDescription: 'Numbered Gold Hardcover Album + 150 packets + 50-sticker Missing Stickers Voucher',
        description: `Exclusive Kit — For passionate collectors, the PANINI FIFA World Cup 2026 Super Special Stadium Kit is a special edition designed to make the collecting experience even more memorable.

This exclusive, limited-quantity kit contains 1 Numbered Gold Hardcover Album and 150 packets, with a total of 1,050 official stickers featuring players, national team badges and memorable tournament moments.

As a special bonus, the kit also includes an exclusive Missing Stickers voucher, entitling you to 50 stickers of your choice on the Panini website — perfect for the final stretch of completing your collection.

Perfect for those who want to start their collection with a standout item or secure a special edition for their collection.

Exclusive Stadium Kit contents:
• 1 Numbered Gold Hardcover Album – FIFA World Cup 2026™
• 150 packets with 7 stickers each (1,050 stickers total)
• 1 Exclusive Missing Stickers Voucher (50 stickers of your choice)
• Limited and numbered edition
• Official FIFA-licensed product`,
      },
      'es': {
        name: 'Colección Oficial FIFA World Cup 2026™ – Kit Exclusivo Estadio Numerado con 150 Sobres',
        shortDescription: 'Álbum Tapa Dura Oro Numerado + 150 sobres + Voucher 50 stickers',
        description: `Kit Exclusivo — Para los apasionados por las colecciones, el Super Kit Especial Estadio PANINI FIFA World Cup 2026 es una edición especial diseñada para hacer la experiencia de coleccionar aún más memorable.

Este kit exclusivo y en cantidad limitada contiene 1 Álbum Tapa Dura Oro Numerado y 150 sobres, con un total de 1.050 stickers oficiales, reuniendo jugadores, escudos de selecciones y momentos destacados del torneo.

Como valor añadido, el kit incluye también un voucher exclusivo de Missing Stickers, con derecho a 50 stickers a elegir en el sitio de Panini, ideal para ayudar en la recta final de la colección.

Perfecto para quienes desean comenzar su colección con un artículo destacado o asegurarse una edición especial para su acervo.

Contenido del Kit Exclusivo Estadio:
• 1 Álbum Tapa Dura Oro Numerado – FIFA World Cup 2026™
• 150 sobres con 7 stickers cada uno (1.050 stickers en total)
• 1 Voucher exclusivo de Missing Stickers (50 stickers a elegir)
• Edición limitada y numerada
• Producto oficial con licencia FIFA`,
      },
      'de': {
        name: 'Offizielle FIFA Fußball-WM 2026™ Kollektion – Nummeriertes Exklusives Stadion-Kit mit 150 Tüten',
        shortDescription: 'Nummeriertes Gold-Hardcover-Album + 150 Tüten + Missing-Sticker-Voucher für 50 Sticker',
        description: `Exklusives Kit — Für leidenschaftliche Sammler ist das PANINI FIFA Fußball-WM 2026 Super Special Stadion-Kit eine Sonderedition, die das Sammelerlebnis noch unvergesslicher machen soll.

Dieses exklusive, in limitierter Stückzahl erhältliche Kit enthält 1 nummeriertes Gold-Hardcover-Album und 150 Tüten mit insgesamt 1.050 offiziellen Stickern – mit Spielern, Nationalmannschaftswappen und unvergesslichen Turniermomenten.

Als besonderes Highlight enthält das Kit außerdem einen exklusiven Missing-Sticker-Voucher für 50 Sticker nach Wahl auf der Panini-Website – ideal für die Schlussphase der Sammlung.

Perfekt für alle, die ihre Sammlung mit einem besonderen Artikel starten oder eine Sonderedition für ihre Sammlung sichern möchten.

Inhalt des Exklusiven Stadion-Kits:
• 1 Nummeriertes Gold-Hardcover-Album – FIFA Fußball-WM 2026™
• 150 Tüten mit je 7 Stickern (1.050 Sticker insgesamt)
• 1 Exklusiver Missing-Sticker-Voucher (50 Sticker nach Wahl)
• Limitierte und nummerierte Auflage
• Offiziell von der FIFA lizenziertes Produkt`,
      },
    },
  },
  {
    id: 'stadium-collection-box',
    slug: 'stadium-collection-box',
    images: [
      '/assets/de12-boxbundle-001_1780459830771.webp',
      '/assets/de12-boxbundle-002_1780459830771.webp',
      '/assets/de12-boxbundle-003_1780459830770.webp',
      '/assets/de12-boxbundle-004_1780459830764.webp',
    ],
    price: 10200,
    originalPrice: null,
    currency: 'eur',
    priceId: '',
    badge: 'limitedEdition',
    featured: true,
    inStock: true,
    stripeProductName: '2026 Panini FIFA World Cup Sticker Stadium Collection Box',
    sortOrder: 13,
    translations: {
      'pt-BR': {
        name: 'Coleção Oficial FIFA World Cup 2026™ – Stadium Collection Box',
        shortDescription: 'Caixa selada com 280 figurinhas de todas as nações participantes',
        description: `A Stadium Collection Box 2026 da Panini FIFA World Cup é uma caixa selada com 280 figurinhas apresentando todas as nações participantes da Copa do Mundo FIFA. Oficialmente licenciada pela FIFA, esta coleção original inclui figurinhas de diversas seleções e atletas.

Cada figurinha é fabricada pela Panini, tornando este produto indispensável para fãs de futebol e colecionadores que desejam eternizar o torneio da Copa do Mundo 2026.

Esta coleção oferece uma visão abrangente do esporte mais popular do mundo por meio de uma série de figurinhas empolgantes e detalhadas.

Conteúdo da caixa:
• 280 figurinhas oficiais
• Figurinhas de todas as nações participantes da Copa do Mundo FIFA 2026
• 7 figurinhas por envelope
• Produto licenciado oficialmente pela FIFA
• Fabricado pela Panini`,
      },
      'en': {
        name: '2026 Panini FIFA World Cup Sticker Stadium Collection Box',
        shortDescription: 'Sealed box with 280 stickers featuring all participating nations',
        description: `The 2026 Panini FIFA World Cup Sticker Stadium Collection Box is a sealed box containing 280 stickers featuring all nations participating in the FIFA World Cup. Officially licensed by FIFA, this original collection includes stickers of various soccer teams and athletes.

Each sticker is manufactured by Panini, making it a must-have for soccer fans and collectors looking to commemorate the 2026 World Cup tournament.

This collection offers a comprehensive look at the world's most popular sport through a series of exciting and detailed stickers.

Box contents:
• 280 official stickers
• Stickers of all nations participating in the 2026 FIFA World Cup
• 7 stickers per packet
• Officially licensed by FIFA
• Manufactured by Panini`,
      },
      'es': {
        name: 'Caja Stadium Collection de Stickers FIFA World Cup 2026 de Panini',
        shortDescription: 'Caja sellada con 280 stickers de todas las naciones participantes',
        description: `La Caja Stadium Collection de Stickers de la Copa Mundial FIFA 2026 de Panini es una caja sellada que contiene 280 stickers con todas las naciones participantes en la Copa del Mundo FIFA. Con licencia oficial de FIFA, esta colección original incluye stickers de varios equipos de fútbol y atletas.

Cada sticker está fabricado por Panini, convirtiéndola en un artículo imprescindible para los fanáticos del fútbol y los coleccionistas que buscan conmemorar el torneo de la Copa del Mundo 2026.

Esta colección ofrece una visión completa del deporte más popular del mundo a través de una serie de stickers emocionantes y detallados.

Contenido de la caja:
• 280 stickers oficiales
• Stickers de todas las naciones participantes de la Copa Mundial FIFA 2026
• 7 stickers por sobre
• Producto con licencia oficial de FIFA
• Fabricado por Panini`,
      },
      'de': {
        name: '2026 Panini FIFA Fußball-WM Sticker Stadium Collection Box',
        shortDescription: 'Versiegelte Box mit 280 Stickern aller teilnehmenden Nationen',
        description: `Die 2026 Panini FIFA Fußball-Weltmeisterschaft Sticker Stadium Collection Box ist eine versiegelte Box mit 280 Stickern aller teilnehmenden Nationen der FIFA Fußball-Weltmeisterschaft. Offiziell von der FIFA lizenziert, umfasst diese originale Sammlung Sticker verschiedener Fußballmannschaften und Athleten.

Jeder Sticker wird von Panini hergestellt – ein Muss für Fußballfans und Sammler, die das WM-Turnier 2026 in Erinnerung behalten möchten.

Diese Kollektion bietet einen umfassenden Blick auf den beliebtesten Sport der Welt durch eine Reihe aufregender und detaillierter Sticker.

Inhalt der Box:
• 280 offizielle Sticker
• Sticker aller teilnehmenden Nationen der FIFA Fußball-WM 2026
• 7 Sticker pro Tüte
• Offiziell von der FIFA lizenziert
• Hergestellt von Panini`,
      },
    },
  },
];
