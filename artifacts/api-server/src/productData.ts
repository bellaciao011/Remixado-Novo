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
    slug: 'box-100-pacotes',
    images: [
      '/assets/de-boxbundle-004_1780421261995.webp',
      '/assets/de-boxbundle-005_1780421261995.webp',
    ],
    price: 24990,
    originalPrice: 29990,
    currency: 'brl',
    priceId: '',
    badge: 'bestSeller',
    featured: true,
    inStock: true,
    stripeProductName: 'Box 100 Pacotes',
    sortOrder: 2,
    translations: {
      'pt-BR': {
        name: 'Box com 100 Pacotes',
        shortDescription: 'Caixa com 100 pacotes de 7 figurinhas cada',
        description: 'A caixa com 100 pacotes é a escolha perfeita para quem quer avançar rapidamente na coleção. Cada pacote contém 7 figurinhas exclusivas da Copa do Mundo FIFA 2026. Total de 700 figurinhas.',
      },
      'en': {
        name: 'Box with 100 Packs',
        shortDescription: 'Box with 100 packs of 7 stickers each',
        description: 'The box with 100 packs is the perfect choice for those who want to advance quickly in their collection. Each pack contains 7 exclusive FIFA World Cup 2026 stickers. Total of 700 stickers.',
      },
      'es': {
        name: 'Caja con 100 Sobres',
        shortDescription: 'Caja con 100 sobres de 7 cromos cada uno',
        description: 'La caja con 100 sobres es la elección perfecta para quienes quieren avanzar rápidamente en su colección. Cada sobre contiene 7 cromos exclusivos de la Copa del Mundo FIFA 2026. Total de 700 cromos.',
      },
      'de': {
        name: 'Box mit 100 Tüten',
        shortDescription: 'Box mit 100 Tüten à 7 Sticker',
        description: 'Die Box mit 100 Tüten ist die perfekte Wahl für alle, die schnell vorankommen möchten. Jede Tüte enthält 7 exklusive FIFA Fußball-Weltmeisterschaft 2026 Sticker. Insgesamt 700 Sticker.',
      },
    },
  },
  {
    id: 'bundle-album-box',
    slug: 'bundle-album-box',
    images: [
      '/assets/de-boxbundle-001_1780421261995.webp',
      '/assets/de-boxbundle-003_1780421261995.webp',
      '/assets/de-boxbundle-004_1780421261995.webp',
    ],
    price: 25990,
    originalPrice: 31980,
    currency: 'brl',
    priceId: '',
    badge: 'offer',
    featured: true,
    inStock: true,
    stripeProductName: 'Bundle Álbum + Box 100 Pacotes',
    sortOrder: 3,
    translations: {
      'pt-BR': {
        name: 'Bundle Álbum + Box 100 Pacotes',
        shortDescription: 'Álbum oficial + caixa com 100 pacotes',
        description: 'O bundle completo para iniciar sua coleção com tudo: álbum oficial licenciado pela FIFA e caixa com 100 pacotes de 7 figurinhas cada. A combinação mais popular entre os colecionadores.',
      },
      'en': {
        name: 'Bundle Album + Box 100 Packs',
        shortDescription: 'Official album + box with 100 packs',
        description: 'The complete bundle to start your collection with everything: FIFA-licensed official album and box with 100 packs of 7 stickers each. The most popular combination among collectors.',
      },
      'es': {
        name: 'Bundle Álbum + Caja 100 Sobres',
        shortDescription: 'Álbum oficial + caja con 100 sobres',
        description: 'El bundle completo para iniciar tu colección con todo: álbum oficial con licencia FIFA y caja con 100 sobres de 7 cromos cada uno. La combinación más popular entre coleccionistas.',
      },
      'de': {
        name: 'Bundle Album + Box 100 Tüten',
        shortDescription: 'Offizielles Album + Box mit 100 Tüten',
        description: 'Das komplette Bundle für den Start deiner Sammlung: offizielles FIFA-lizenziertes Album und Box mit 100 Tüten à 7 Sticker. Die beliebteste Kombination unter Sammlern.',
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
