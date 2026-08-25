/* ============================================
   Buyte — js/recipes-data.js
   Catàleg de 80 receptes mediterrànies senzilles.
   Ingredients comuns (sal, oli, aigua, sucre) van
   marcats com required:false: assumim que sempre
   en tens i no fan baixar gaire el % de coincidència.
   ============================================ */

const RECIPES = [
  // ============= ESMORZARS (15) =============
  {
    id: 'pa-tomaquet',
    name: 'Pa amb tomàquet',
    emoji: '🥖',
    time: 5, servings: 1, difficulty: 'fàcil', category: 'esmorzar',
    ingredients: [
      { emoji: '🥖', name: 'pa', qty: '2 llesques', amount: null, unit: null, required: true },
      { emoji: '🍅', name: 'tomàquet', qty: '1 madur', amount: 1, unit: 'u', required: true },
      { emoji: '🫒', name: 'oli', qty: 'un raig', amount: null, unit: null, required: false },
      { emoji: '🧂', name: 'sal', qty: 'al gust', amount: null, unit: null, required: false }
    ],
    steps: [
      'Talla el pa a llesques i, si vols, torra-les lleugerament.',
      'Refrega mig tomàquet madur sobre cada llesca.',
      'Acaba amb un raig d\'oli i una pessigada de sal.'
    ],
    tip: 'El tomàquet de penjar és el més tradicional.'
  },
  {
    id: 'truita-francesa',
    name: 'Truita francesa',
    emoji: '🍳',
    time: 5, servings: 1, difficulty: 'fàcil', category: 'esmorzar',
    ingredients: [
      { emoji: '🥚', name: 'ous', qty: '2 unitats', amount: 2, unit: 'u', required: true },
      { emoji: '🥛', name: 'llet', qty: '1 cullerada', amount: null, unit: null, required: false },
      { emoji: '🧈', name: 'mantega', qty: 'una nou', amount: null, unit: null, required: false },
      { emoji: '🧂', name: 'sal', qty: 'al gust', amount: null, unit: null, required: false }
    ],
    steps: [
      'Bat els ous amb una mica de sal (i un raig de llet si vols).',
      'Fon la mantega en una paella antiadherent.',
      'Aboca-hi els ous i, quan qualli per sota, plega la truita.'
    ]
  },
  {
    id: 'iogurt-fruita',
    name: 'Iogurt amb fruita',
    emoji: '🥛',
    time: 5, servings: 1, difficulty: 'fàcil', category: 'esmorzar',
    ingredients: [
      { emoji: '🥛', name: 'iogurt', qty: '1 unitat', amount: 1, unit: 'u', required: true },
      { emoji: '🍓', name: 'maduixes', qty: '6-8', amount: 6, unit: 'u', required: true },
      { emoji: '🍯', name: 'mel', qty: '1 culleradeta', amount: null, unit: null, required: false }
    ],
    steps: [
      'Aboca el iogurt al bol.',
      'Renta i talla la fruita en trossos petits.',
      'Reparteix la fruita per sobre i acaba amb un fil de mel.'
    ]
  },
  {
    id: 'biquini',
    name: 'Biquini',
    emoji: '🥪',
    time: 8, servings: 1, difficulty: 'fàcil', category: 'esmorzar',
    ingredients: [
      { emoji: '🥖', name: 'pa de motlle', qty: '2 llesques', amount: null, unit: null, required: true },
      { emoji: '🧀', name: 'formatge', qty: '1 llesca', amount: null, unit: null, required: true },
      { emoji: '🥓', name: 'pernil dolç', qty: '1 llesca', amount: null, unit: null, required: true },
      { emoji: '🧈', name: 'mantega', qty: 'al gust', amount: null, unit: null, required: false }
    ],
    steps: [
      'Posa pernil dolç i formatge entre les dues llesques de pa.',
      'Unta lleugerament la part exterior amb mantega.',
      'Cuina-ho a la planxa fins que el formatge es fongui.'
    ]
  },
  {
    id: 'pa-mantega-melmelada',
    name: 'Pa amb mantega i melmelada',
    emoji: '🥖',
    time: 3, servings: 1, difficulty: 'fàcil', category: 'esmorzar',
    ingredients: [
      { emoji: '🥖', name: 'pa', qty: '2 llesques', amount: null, unit: null, required: true },
      { emoji: '🧈', name: 'mantega', qty: 'al gust', amount: null, unit: null, required: true },
      { emoji: '🍯', name: 'melmelada', qty: '2 culleradetes', amount: null, unit: null, required: true }
    ],
    steps: [
      'Torra el pa fins que sigui daurat.',
      'Unta la mantega quan encara és calent.',
      'Estén la melmelada per sobre.'
    ]
  },
  {
    id: 'cereals-llet',
    name: 'Cereals amb llet',
    emoji: '🥣',
    time: 2, servings: 1, difficulty: 'fàcil', category: 'esmorzar',
    ingredients: [
      { emoji: '🥛', name: 'llet', qty: '200 ml', amount: 200, unit: 'ml', required: true },
      { emoji: '🥣', name: 'cereals', qty: '1 grapat', amount: null, unit: null, required: true },
      { emoji: '🍯', name: 'mel', qty: '1 culleradeta', amount: null, unit: null, required: false }
    ],
    steps: [
      'Posa els cereals al bol.',
      'Aboca la llet ben freda per sobre.',
      'Si vols, acaba amb un fil de mel.'
    ]
  },
  {
    id: 'avena-fruita',
    name: 'Avena amb fruita',
    emoji: '🥣',
    time: 8, servings: 1, difficulty: 'fàcil', category: 'esmorzar',
    ingredients: [
      { emoji: '🌾', name: 'avena', qty: '4 cullerades', amount: null, unit: null, required: true },
      { emoji: '🍌', name: 'plàtan', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🥛', name: 'llet', qty: '200 ml', amount: 200, unit: 'ml', required: false },
      { emoji: '🍯', name: 'mel', qty: '1 culleradeta', amount: null, unit: null, required: false }
    ],
    steps: [
      'Cuina l\'avena amb la llet a foc baix 4-5 min remenant.',
      'Talla el plàtan a rodanxes.',
      'Aboca-ho al bol i acaba amb un fil de mel.'
    ]
  },
  {
    id: 'torrada-alvocat',
    name: 'Torrada amb alvocat',
    emoji: '🥑',
    time: 5, servings: 1, difficulty: 'fàcil', category: 'esmorzar',
    ingredients: [
      { emoji: '🥖', name: 'pa', qty: '1 llesca gruixuda', amount: null, unit: null, required: true },
      { emoji: '🥑', name: 'alvocat', qty: '½', amount: 0.5, unit: 'u', required: true },
      { emoji: '🧂', name: 'sal', qty: 'al gust', amount: null, unit: null, required: false },
      { emoji: '🌶️', name: 'pebre', qty: 'al gust', amount: null, unit: null, required: false }
    ],
    steps: [
      'Torra la llesca de pa.',
      'Aixafa l\'alvocat amb una forquilla.',
      'Estén-lo sobre el pa i adoba amb sal i pebre.'
    ]
  },
  {
    id: 'smoothie-platan',
    name: 'Smoothie de plàtan',
    emoji: '🍌',
    time: 3, servings: 1, difficulty: 'fàcil', category: 'esmorzar',
    ingredients: [
      { emoji: '🍌', name: 'plàtan', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🥛', name: 'llet', qty: '250 ml', amount: 250, unit: 'ml', required: true },
      { emoji: '🍯', name: 'mel', qty: '1 culleradeta', amount: null, unit: null, required: false }
    ],
    steps: [
      'Pela el plàtan i posa\'l al got de batre.',
      'Aboca la llet i la mel.',
      'Tritura fins que quedi cremós.'
    ]
  },
  {
    id: 'pancakes',
    name: 'Pancakes',
    emoji: '🥞',
    time: 15, servings: 2, difficulty: 'fàcil', category: 'esmorzar',
    ingredients: [
      { emoji: '🥚', name: 'ous', qty: '2', amount: 2, unit: 'u', required: true },
      { emoji: '🥛', name: 'llet', qty: '200 ml', amount: 200, unit: 'ml', required: true },
      { emoji: '🌾', name: 'farina', qty: '150 g', amount: 150, unit: 'g', required: true },
      { emoji: '🧈', name: 'mantega', qty: 'per la paella', amount: null, unit: null, required: false },
      { emoji: '🍯', name: 'mel', qty: 'per servir', amount: null, unit: null, required: false }
    ],
    steps: [
      'Mescla els ous, la llet i la farina fins a formar una pasta.',
      'Cuina petites porcions a la paella amb una mica de mantega.',
      'Gira-les quan facin bombolles i apila-les amb mel.'
    ]
  },
  {
    id: 'pa-formatge',
    name: 'Pa amb formatge',
    emoji: '🧀',
    time: 3, servings: 1, difficulty: 'fàcil', category: 'esmorzar',
    ingredients: [
      { emoji: '🥖', name: 'pa', qty: '2 llesques', amount: null, unit: null, required: true },
      { emoji: '🧀', name: 'formatge', qty: '2 llesques', amount: null, unit: null, required: true },
      { emoji: '🫒', name: 'oli', qty: 'un raig', amount: null, unit: null, required: false }
    ],
    steps: [
      'Talla el pa a llesques.',
      'Posa una llesca de formatge a sobre de cadascuna.',
      'Acaba amb un fil d\'oli si vols.'
    ]
  },
  {
    id: 'iogurt-mel-fruits-secs',
    name: 'Iogurt amb mel i fruits secs',
    emoji: '🥛',
    time: 3, servings: 1, difficulty: 'fàcil', category: 'esmorzar',
    ingredients: [
      { emoji: '🥛', name: 'iogurt', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🍯', name: 'mel', qty: '1 cullerada', amount: null, unit: null, required: true },
      { emoji: '🥜', name: 'fruits secs', qty: '1 grapat', amount: null, unit: null, required: true }
    ],
    steps: [
      'Aboca el iogurt al bol.',
      'Afegeix-hi la mel.',
      'Decora amb fruits secs trinxats.'
    ]
  },
  {
    id: 'torrada-francesa',
    name: 'Torrada francesa',
    emoji: '🍞',
    time: 10, servings: 1, difficulty: 'fàcil', category: 'esmorzar',
    ingredients: [
      { emoji: '🥖', name: 'pa', qty: '2 llesques', amount: null, unit: null, required: true },
      { emoji: '🥚', name: 'ous', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🥛', name: 'llet', qty: '100 ml', amount: 100, unit: 'ml', required: true },
      { emoji: '🧈', name: 'mantega', qty: 'per la paella', amount: null, unit: null, required: false },
      { emoji: '🍯', name: 'sucre', qty: 'al gust', amount: null, unit: null, required: false }
    ],
    steps: [
      'Bat l\'ou amb la llet en un bol.',
      'Mulla bé les llesques de pa.',
      'Cuina-les a la paella amb mantega fins que es daurin per les dues bandes.'
    ]
  },
  {
    id: 'cuixot-formatge',
    name: 'Pernil dolç amb formatge',
    emoji: '🥩',
    time: 5, servings: 1, difficulty: 'fàcil', category: 'esmorzar',
    ingredients: [
      { emoji: '🥩', name: 'pernil dolç', qty: '4 llesques', amount: null, unit: null, required: true },
      { emoji: '🧀', name: 'formatge', qty: '4 llesques', amount: null, unit: null, required: true },
      { emoji: '🥖', name: 'pa', qty: 'al gust', amount: null, unit: null, required: false }
    ],
    steps: [
      'Disposa el pernil dolç al plat.',
      'Acompanya\'l amb el formatge tallat.',
      'Serveix amb pa si vols fer-ne un entrepà.'
    ]
  },
  {
    id: 'macedonia-matinera',
    name: 'Macedònia matinera',
    emoji: '🍓',
    time: 8, servings: 2, difficulty: 'fàcil', category: 'esmorzar',
    ingredients: [
      { emoji: '🍎', name: 'poma', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🍌', name: 'plàtan', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🍊', name: 'taronja', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🍓', name: 'maduixes', qty: '6', amount: 6, unit: 'u', required: true }
    ],
    steps: [
      'Pela les fruites i talla-les a daus petits.',
      'Mescla-les en un bol gran.',
      'Aboca-hi el suc d\'una taronja per amarir-les.'
    ]
  },

  // ============= PRIMERS / AMANIDES (15) =============
  {
    id: 'amanida-verda',
    name: 'Amanida verda',
    emoji: '🥗',
    time: 5, servings: 1, difficulty: 'fàcil', category: 'primer',
    ingredients: [
      { emoji: '🥬', name: 'enciam', qty: '½ unitat', amount: 0.5, unit: 'u', required: true },
      { emoji: '🍅', name: 'tomàquet', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🥒', name: 'cogombre', qty: '½', amount: 0.5, unit: 'u', required: true },
      { emoji: '🫒', name: 'olives', qty: '1 grapat', amount: null, unit: null, required: false },
      { emoji: '🫒', name: 'oli', qty: 'un raig', amount: null, unit: null, required: false },
      { emoji: '🧂', name: 'sal', qty: 'al gust', amount: null, unit: null, required: false }
    ],
    steps: [
      'Renta i talla l\'enciam, el tomàquet i el cogombre.',
      'Mescla-ho tot en una amanidera.',
      'Adoba amb oli, sal i unes olives.'
    ]
  },
  {
    id: 'amanida-russa',
    name: 'Amanida russa',
    emoji: '🥗',
    time: 30, servings: 2, difficulty: 'mitjana', category: 'primer',
    ingredients: [
      { emoji: '🥔', name: 'patates', qty: '2', amount: 2, unit: 'u', required: true },
      { emoji: '🥕', name: 'pastanagues', qty: '2', amount: 2, unit: 'u', required: true },
      { emoji: '🥚', name: 'ous', qty: '2', amount: 2, unit: 'u', required: true },
      { emoji: '🥚', name: 'maionesa', qty: '4 cullerades', amount: null, unit: null, required: true },
      { emoji: '🫒', name: 'olives', qty: 'al gust', amount: null, unit: null, required: false }
    ],
    steps: [
      'Bull patates, pastanagues i ous fins que estiguin tendres.',
      'Pela-ho tot i talla a daus petits.',
      'Mescla-ho amb la maionesa i decora amb olives.'
    ]
  },
  {
    id: 'amanida-cesar',
    name: 'Amanida cèsar',
    emoji: '🥗',
    time: 20, servings: 2, difficulty: 'mitjana', category: 'primer',
    ingredients: [
      { emoji: '🥬', name: 'enciam', qty: '1 unitat', amount: 1, unit: 'u', required: true },
      { emoji: '🐔', name: 'pollastre', qty: '1 pit', amount: 1, unit: 'u', required: true },
      { emoji: '🧀', name: 'formatge', qty: '50 g ratllat', amount: 50, unit: 'g', required: true },
      { emoji: '🍞', name: 'pa torrat', qty: '1 grapat', amount: null, unit: null, required: true }
    ],
    steps: [
      'Cuina el pollastre a la planxa i talla\'l a tires.',
      'Renta i trosseja l\'enciam.',
      'Mescla-ho amb el formatge i els crostonets de pa.'
    ]
  },
  {
    id: 'amanida-grega',
    name: 'Amanida grega',
    emoji: '🥗',
    time: 10, servings: 2, difficulty: 'fàcil', category: 'primer',
    ingredients: [
      { emoji: '🍅', name: 'tomàquets', qty: '2', amount: 2, unit: 'u', required: true },
      { emoji: '🥒', name: 'cogombre', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🧀', name: 'formatge feta', qty: '100 g', amount: 100, unit: 'g', required: true },
      { emoji: '🫒', name: 'olives', qty: '1 grapat', amount: null, unit: null, required: true },
      { emoji: '🫒', name: 'oli', qty: 'un raig', amount: null, unit: null, required: false },
      { emoji: '🧂', name: 'sal', qty: 'al gust', amount: null, unit: null, required: false }
    ],
    steps: [
      'Talla els tomàquets i el cogombre a daus.',
      'Afegeix-hi el feta a daus i les olives.',
      'Adoba amb oli, sal i orenga si en tens.'
    ]
  },
  {
    id: 'sopa-verdures',
    name: 'Sopa de verdures',
    emoji: '🍲',
    time: 35, servings: 4, difficulty: 'fàcil', category: 'primer',
    ingredients: [
      { emoji: '🥕', name: 'pastanagues', qty: '2', amount: 2, unit: 'u', required: true },
      { emoji: '🥬', name: 'col', qty: '¼', amount: 0.25, unit: 'u', required: true },
      { emoji: '🧅', name: 'ceba', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '💧', name: 'aigua', qty: '1,5 L', amount: 1.5, unit: 'l', required: false },
      { emoji: '🧂', name: 'sal', qty: 'al gust', amount: null, unit: null, required: false }
    ],
    steps: [
      'Sofregeix la ceba picada en una olla amb una mica d\'oli.',
      'Afegeix les altres verdures tallades i cobreix amb aigua.',
      'Bull a foc mig 25 minuts i salpebra al gust.'
    ]
  },
  {
    id: 'sopa-juliana',
    name: 'Sopa juliana',
    emoji: '🍲',
    time: 40, servings: 4, difficulty: 'fàcil', category: 'primer',
    ingredients: [
      { emoji: '🥕', name: 'pastanagues', qty: '2', amount: 2, unit: 'u', required: true },
      { emoji: '🥬', name: 'col', qty: '¼', amount: 0.25, unit: 'u', required: true },
      { emoji: '🥔', name: 'patates', qty: '2', amount: 2, unit: 'u', required: true },
      { emoji: '🧅', name: 'ceba', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '💧', name: 'aigua', qty: '1,5 L', amount: 1.5, unit: 'l', required: false },
      { emoji: '🧂', name: 'sal', qty: 'al gust', amount: null, unit: null, required: false }
    ],
    steps: [
      'Talla totes les verdures a tires fines (juliana).',
      'Posa-ho a l\'olla amb aigua i sal.',
      'Bull 30 minuts a foc mig.'
    ]
  },
  {
    id: 'crema-carbasso',
    name: 'Crema de carbassó',
    emoji: '🍲',
    time: 30, servings: 3, difficulty: 'fàcil', category: 'primer',
    ingredients: [
      { emoji: '🍆', name: 'carbassó', qty: '2', amount: 2, unit: 'u', required: true },
      { emoji: '🧅', name: 'ceba', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🥛', name: 'llet', qty: '200 ml', amount: 200, unit: 'ml', required: true },
      { emoji: '🫒', name: 'oli', qty: 'un raig', amount: null, unit: null, required: false },
      { emoji: '🧂', name: 'sal', qty: 'al gust', amount: null, unit: null, required: false }
    ],
    steps: [
      'Sofregeix la ceba i el carbassó tallats.',
      'Cobreix amb aigua i bull 20 min fins que estigui tendre.',
      'Tritura-ho amb la llet fins a obtenir una crema fina.'
    ]
  },
  {
    id: 'crema-patata-porro',
    name: 'Crema de patata i porro',
    emoji: '🍲',
    time: 35, servings: 3, difficulty: 'fàcil', category: 'primer',
    ingredients: [
      { emoji: '🥔', name: 'patates', qty: '3', amount: 3, unit: 'u', required: true },
      { emoji: '🧅', name: 'porro', qty: '2', amount: 2, unit: 'u', required: true },
      { emoji: '🥛', name: 'llet', qty: '200 ml', amount: 200, unit: 'ml', required: true },
      { emoji: '🫒', name: 'oli', qty: 'un raig', amount: null, unit: null, required: false },
      { emoji: '🧂', name: 'sal', qty: 'al gust', amount: null, unit: null, required: false }
    ],
    steps: [
      'Sofregeix els porros tallats finament.',
      'Afegeix-hi les patates a daus i cobreix amb aigua.',
      'Bull 25 min i tritura amb la llet fins a fer una crema.'
    ]
  },
  {
    id: 'gaspatxo',
    name: 'Gaspatxo',
    emoji: '🍅',
    time: 15, servings: 4, difficulty: 'fàcil', category: 'primer',
    ingredients: [
      { emoji: '🍅', name: 'tomàquets', qty: '6 madurs', amount: 6, unit: 'u', required: true },
      { emoji: '🥒', name: 'cogombre', qty: '½', amount: 0.5, unit: 'u', required: true },
      { emoji: '🌶️', name: 'pebrot', qty: '½', amount: 0.5, unit: 'u', required: true },
      { emoji: '🧅', name: 'ceba', qty: '¼', amount: 0.25, unit: 'u', required: true },
      { emoji: '🫒', name: 'oli', qty: 'un raig', amount: null, unit: null, required: false },
      { emoji: '🧂', name: 'sal', qty: 'al gust', amount: null, unit: null, required: false }
    ],
    steps: [
      'Pela els tomàquets i el cogombre.',
      'Tritura-ho tot amb el pebrot, la ceba, oli i sal.',
      'Refrigera com a mínim 1 h i serveix ben fred.'
    ]
  },
  {
    id: 'vichyssoise',
    name: 'Vichyssoise',
    emoji: '🍲',
    time: 30, servings: 3, difficulty: 'mitjana', category: 'primer',
    ingredients: [
      { emoji: '🥔', name: 'patates', qty: '3', amount: 3, unit: 'u', required: true },
      { emoji: '🧅', name: 'porro', qty: '2', amount: 2, unit: 'u', required: true },
      { emoji: '🥛', name: 'nata', qty: '200 ml', amount: 200, unit: 'ml', required: true },
      { emoji: '🧂', name: 'sal', qty: 'al gust', amount: null, unit: null, required: false }
    ],
    steps: [
      'Sofregeix els porros tallats finament.',
      'Cobreix amb aigua, afegeix les patates i bull 20 min.',
      'Tritura amb la nata i refreda abans de servir.'
    ]
  },
  {
    id: 'amanida-pasta',
    name: 'Amanida de pasta',
    emoji: '🍝',
    time: 15, servings: 2, difficulty: 'fàcil', category: 'primer',
    ingredients: [
      { emoji: '🍝', name: 'pasta', qty: '200 g', amount: 200, unit: 'g', required: true },
      { emoji: '🍅', name: 'tomàquet', qty: '2', amount: 2, unit: 'u', required: true },
      { emoji: '🧀', name: 'formatge', qty: '80 g', amount: 80, unit: 'g', required: true },
      { emoji: '🫒', name: 'olives', qty: '1 grapat', amount: null, unit: null, required: true },
      { emoji: '🫒', name: 'oli', qty: 'un raig', amount: null, unit: null, required: false }
    ],
    steps: [
      'Bull la pasta i refresca-la amb aigua freda.',
      'Talla el tomàquet i el formatge a daus.',
      'Mescla-ho tot amb les olives i un fil d\'oli.'
    ]
  },
  {
    id: 'amanida-tonyina',
    name: 'Amanida de tonyina',
    emoji: '🥗',
    time: 5, servings: 1, difficulty: 'fàcil', category: 'primer',
    ingredients: [
      { emoji: '🥬', name: 'enciam', qty: '½', amount: 0.5, unit: 'u', required: true },
      { emoji: '🍅', name: 'tomàquet', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🐟', name: 'tonyina', qty: '1 llauna', amount: 1, unit: 'u', required: true },
      { emoji: '🫒', name: 'oli', qty: 'un raig', amount: null, unit: null, required: false }
    ],
    steps: [
      'Renta i trosseja l\'enciam.',
      'Talla el tomàquet a quarts.',
      'Afegeix-hi la tonyina escorreguda i adoba amb oli.'
    ]
  },
  {
    id: 'tomaquets-formatge',
    name: 'Tomàquets amb formatge',
    emoji: '🍅',
    time: 5, servings: 1, difficulty: 'fàcil', category: 'primer',
    ingredients: [
      { emoji: '🍅', name: 'tomàquets', qty: '2', amount: 2, unit: 'u', required: true },
      { emoji: '🧀', name: 'formatge', qty: '100 g mozzarella', amount: 100, unit: 'g', required: true },
      { emoji: '🌿', name: 'alfàbrega', qty: 'unes fulles', amount: null, unit: null, required: true },
      { emoji: '🫒', name: 'oli', qty: 'un raig', amount: null, unit: null, required: false },
      { emoji: '🧂', name: 'sal', qty: 'al gust', amount: null, unit: null, required: false }
    ],
    steps: [
      'Talla els tomàquets a rodanxes gruixudes.',
      'Alterna-les amb llesques de formatge al plat.',
      'Decora amb alfàbrega, oli i sal.'
    ]
  },
  {
    id: 'amanida-llenties',
    name: 'Amanida de llenties',
    emoji: '🥗',
    time: 15, servings: 2, difficulty: 'fàcil', category: 'primer',
    ingredients: [
      { emoji: '🥗', name: 'llenties', qty: '300 g cuites', amount: 300, unit: 'g', required: true },
      { emoji: '🧅', name: 'ceba', qty: '½', amount: 0.5, unit: 'u', required: true },
      { emoji: '🥕', name: 'pastanaga', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🫒', name: 'oli', qty: 'un raig', amount: null, unit: null, required: false },
      { emoji: '🧂', name: 'sal', qty: 'al gust', amount: null, unit: null, required: false }
    ],
    steps: [
      'Escorre les llenties (millor si ja són cuites).',
      'Talla la ceba i la pastanaga ben petites.',
      'Mescla-ho tot i adoba amb oli i sal.'
    ]
  },
  {
    id: 'escalivada',
    name: 'Escalivada',
    emoji: '🍆',
    time: 60, servings: 3, difficulty: 'mitjana', category: 'primer',
    ingredients: [
      { emoji: '🍆', name: 'albergínies', qty: '2', amount: 2, unit: 'u', required: true },
      { emoji: '🌶️', name: 'pebrots', qty: '2', amount: 2, unit: 'u', required: true },
      { emoji: '🧅', name: 'ceba', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🍅', name: 'tomàquets', qty: '2', amount: 2, unit: 'u', required: true },
      { emoji: '🫒', name: 'oli', qty: 'un raig', amount: null, unit: null, required: false },
      { emoji: '🧂', name: 'sal', qty: 'al gust', amount: null, unit: null, required: false }
    ],
    steps: [
      'Posa les verdures senceres al forn a 200°.',
      'Cou-les 45 minuts girant-les a meitat.',
      'Pela-les, talla-les a tires i adoba amb oli i sal.'
    ]
  },

  // ============= PASTA I ARROSSOS (15) =============
  {
    id: 'macarrons-tomaquet',
    name: 'Macarrons amb tomàquet',
    emoji: '🍝',
    time: 20, servings: 2, difficulty: 'fàcil', category: 'pasta',
    ingredients: [
      { emoji: '🍝', name: 'macarrons', qty: '200 g', amount: 200, unit: 'g', required: true },
      { emoji: '🍅', name: 'tomàquet', qty: '400 g triturat', amount: 400, unit: 'g', required: true },
      { emoji: '🧀', name: 'formatge', qty: '50 g ratllat', amount: 50, unit: 'g', required: true },
      { emoji: '🫒', name: 'oli', qty: 'un raig', amount: null, unit: null, required: false },
      { emoji: '🧂', name: 'sal', qty: 'al gust', amount: null, unit: null, required: false }
    ],
    steps: [
      'Bull els macarrons en aigua salada al punt al dente.',
      'Sofregeix el tomàquet 10 min en una paella amb oli.',
      'Mescla la pasta amb la salsa i acaba amb formatge ratllat.'
    ]
  },
  {
    id: 'espaguetis-carbonara',
    name: 'Espaguetis carbonara',
    emoji: '🍝',
    time: 20, servings: 2, difficulty: 'mitjana', category: 'pasta',
    ingredients: [
      { emoji: '🍝', name: 'espaguetis', qty: '200 g', amount: 200, unit: 'g', required: true },
      { emoji: '🥚', name: 'ous', qty: '2 rovells', amount: 2, unit: 'u', required: true },
      { emoji: '🥓', name: 'bacó', qty: '100 g', amount: 100, unit: 'g', required: true },
      { emoji: '🧀', name: 'formatge', qty: '50 g', amount: 50, unit: 'g', required: true }
    ],
    steps: [
      'Bull els espaguetis i reserva una mica del seu aigua.',
      'Sofregeix el bacó tallat fins que sigui cruixent.',
      'Apaga el foc, mescla amb la pasta, els rovells batuts i el formatge.'
    ],
    tip: 'Mai posis els ous amb el foc encès — es quallarien.'
  },
  {
    id: 'espaguetis-bolonyesa',
    name: 'Espaguetis a la bolonyesa',
    emoji: '🍝',
    time: 35, servings: 2, difficulty: 'mitjana', category: 'pasta',
    ingredients: [
      { emoji: '🍝', name: 'espaguetis', qty: '200 g', amount: 200, unit: 'g', required: true },
      { emoji: '🍅', name: 'tomàquet', qty: '400 g triturat', amount: 400, unit: 'g', required: true },
      { emoji: '🥩', name: 'carn picada', qty: '250 g', amount: 250, unit: 'g', required: true },
      { emoji: '🧅', name: 'ceba', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🫒', name: 'oli', qty: 'un raig', amount: null, unit: null, required: false }
    ],
    steps: [
      'Sofregeix la ceba picada i afegeix la carn fins que es daurí.',
      'Aboca el tomàquet i cou a foc baix 20 min.',
      'Bull els espaguetis i serveix amb la salsa per sobre.'
    ]
  },
  {
    id: 'macarrons-napolitana',
    name: 'Macarrons a la napolitana',
    emoji: '🍝',
    time: 18, servings: 2, difficulty: 'fàcil', category: 'pasta',
    ingredients: [
      { emoji: '🍝', name: 'macarrons', qty: '200 g', amount: 200, unit: 'g', required: true },
      { emoji: '🍅', name: 'tomàquet', qty: '400 g triturat', amount: 400, unit: 'g', required: true },
      { emoji: '🧀', name: 'formatge', qty: '50 g', amount: 50, unit: 'g', required: true }
    ],
    steps: [
      'Bull els macarrons al dente.',
      'Escalfa el tomàquet en una paella.',
      'Mescla la pasta amb la salsa i ratlla formatge per sobre.'
    ]
  },
  {
    id: 'pasta-pesto',
    name: 'Pasta al pesto',
    emoji: '🍝',
    time: 15, servings: 2, difficulty: 'fàcil', category: 'pasta',
    ingredients: [
      { emoji: '🍝', name: 'pasta', qty: '200 g', amount: 200, unit: 'g', required: true },
      { emoji: '🌿', name: 'alfàbrega', qty: '1 manat', amount: null, unit: null, required: true },
      { emoji: '🧀', name: 'formatge', qty: '50 g parmesà', amount: 50, unit: 'g', required: true },
      { emoji: '🫒', name: 'oli', qty: '6 cullerades', amount: null, unit: null, required: true },
      { emoji: '🥜', name: 'pinyons', qty: '2 cullerades', amount: null, unit: null, required: false }
    ],
    steps: [
      'Tritura l\'alfàbrega amb el formatge, els pinyons i l\'oli.',
      'Bull la pasta i escorre-la.',
      'Mescla-la amb el pesto fora del foc.'
    ]
  },
  {
    id: 'lasanya',
    name: 'Lasanya',
    emoji: '🍝',
    time: 60, servings: 4, difficulty: 'difícil', category: 'pasta',
    ingredients: [
      { emoji: '🍝', name: 'plaques de lasanya', qty: '12', amount: 12, unit: 'u', required: true },
      { emoji: '🍅', name: 'tomàquet', qty: '500 g triturat', amount: 500, unit: 'g', required: true },
      { emoji: '🥩', name: 'carn picada', qty: '300 g', amount: 300, unit: 'g', required: true },
      { emoji: '🧀', name: 'formatge', qty: '150 g ratllat', amount: 150, unit: 'g', required: true },
      { emoji: '🥛', name: 'llet', qty: '500 ml (beixamel)', amount: 500, unit: 'ml', required: false }
    ],
    steps: [
      'Sofregeix la carn amb el tomàquet 15 min.',
      'Munta capes de plaques, carn i beixamel en una safata.',
      'Cobreix amb formatge i forn a 200° durant 30 minuts.'
    ]
  },
  {
    id: 'risotto-bolets',
    name: 'Risotto de bolets',
    emoji: '🍚',
    time: 30, servings: 2, difficulty: 'mitjana', category: 'pasta',
    ingredients: [
      { emoji: '🍚', name: 'arròs', qty: '200 g', amount: 200, unit: 'g', required: true },
      { emoji: '🍄', name: 'bolets', qty: '250 g', amount: 250, unit: 'g', required: true },
      { emoji: '🧀', name: 'formatge', qty: '50 g parmesà', amount: 50, unit: 'g', required: true },
      { emoji: '🧅', name: 'ceba', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🫒', name: 'oli', qty: 'un raig', amount: null, unit: null, required: false }
    ],
    steps: [
      'Sofregeix la ceba i els bolets tallats.',
      'Afegeix l\'arròs i ves abocant brou calent poc a poc 18 min.',
      'Acaba amb el formatge ratllat fora del foc.'
    ]
  },
  {
    id: 'arros-verdures',
    name: 'Arròs amb verdures',
    emoji: '🍚',
    time: 30, servings: 2, difficulty: 'fàcil', category: 'pasta',
    ingredients: [
      { emoji: '🍚', name: 'arròs', qty: '200 g', amount: 200, unit: 'g', required: true },
      { emoji: '🥕', name: 'pastanaga', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🥬', name: 'verdures', qty: '1 grapat', amount: null, unit: null, required: true },
      { emoji: '🧅', name: 'ceba', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🫒', name: 'oli', qty: 'un raig', amount: null, unit: null, required: false },
      { emoji: '🧂', name: 'sal', qty: 'al gust', amount: null, unit: null, required: false }
    ],
    steps: [
      'Sofregeix la ceba i les verdures tallades.',
      'Afegeix l\'arròs i el doble d\'aigua salada.',
      'Cou tapat 18 minuts a foc baix.'
    ]
  },
  {
    id: 'paella-mixta',
    name: 'Paella mixta',
    emoji: '🥘',
    time: 45, servings: 4, difficulty: 'mitjana', category: 'pasta',
    ingredients: [
      { emoji: '🍚', name: 'arròs', qty: '400 g', amount: 400, unit: 'g', required: true },
      { emoji: '🐔', name: 'pollastre', qty: '300 g a trossos', amount: 300, unit: 'g', required: true },
      { emoji: '🦐', name: 'gambes', qty: '200 g', amount: 200, unit: 'g', required: true },
      { emoji: '🌶️', name: 'pebrot', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🍅', name: 'tomàquet', qty: '1 ratllat', amount: 1, unit: 'u', required: false },
      { emoji: '🫒', name: 'oli', qty: 'un raig', amount: null, unit: null, required: false }
    ],
    steps: [
      'Daura el pollastre a la paella amb una mica d\'oli.',
      'Sofregeix el pebrot i el tomàquet, després afegeix l\'arròs.',
      'Cobreix amb brou, posa-hi les gambes i cou 18 min sense remenar.'
    ]
  },
  {
    id: 'fideua',
    name: 'Fideuà',
    emoji: '🍝',
    time: 30, servings: 4, difficulty: 'mitjana', category: 'pasta',
    ingredients: [
      { emoji: '🍝', name: 'fideus', qty: '400 g', amount: 400, unit: 'g', required: true },
      { emoji: '🐟', name: 'peix', qty: '300 g', amount: 300, unit: 'g', required: true },
      { emoji: '🦐', name: 'gambes', qty: '200 g', amount: 200, unit: 'g', required: true },
      { emoji: '🍅', name: 'tomàquet', qty: '1 ratllat', amount: 1, unit: 'u', required: false },
      { emoji: '🫒', name: 'oli', qty: 'un raig', amount: null, unit: null, required: false }
    ],
    steps: [
      'Sofregeix el peix i les gambes a la paella.',
      'Afegeix els fideus i remena per torrar-los.',
      'Aboca brou de peix calent i cou 12 minuts.'
    ]
  },
  {
    id: 'arros-pollastre',
    name: 'Arròs amb pollastre',
    emoji: '🍚',
    time: 30, servings: 2, difficulty: 'fàcil', category: 'pasta',
    ingredients: [
      { emoji: '🍚', name: 'arròs', qty: '200 g', amount: 200, unit: 'g', required: true },
      { emoji: '🐔', name: 'pollastre', qty: '300 g', amount: 300, unit: 'g', required: true },
      { emoji: '🧅', name: 'ceba', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🫒', name: 'oli', qty: 'un raig', amount: null, unit: null, required: false },
      { emoji: '🧂', name: 'sal', qty: 'al gust', amount: null, unit: null, required: false }
    ],
    steps: [
      'Daura el pollastre a la paella.',
      'Sofregeix-hi la ceba.',
      'Afegeix l\'arròs i el doble d\'aigua, cou 18 min.'
    ]
  },
  {
    id: 'pasta-formatge',
    name: 'Pasta amb formatge',
    emoji: '🍝',
    time: 15, servings: 2, difficulty: 'fàcil', category: 'pasta',
    ingredients: [
      { emoji: '🍝', name: 'pasta', qty: '200 g', amount: 200, unit: 'g', required: true },
      { emoji: '🧀', name: 'formatge', qty: '120 g', amount: 120, unit: 'g', required: true },
      { emoji: '🥛', name: 'llet', qty: '150 ml', amount: 150, unit: 'ml', required: true },
      { emoji: '🧈', name: 'mantega', qty: '20 g', amount: 20, unit: 'g', required: false }
    ],
    steps: [
      'Bull la pasta al dente.',
      'En una paella, fon el formatge amb la llet i la mantega.',
      'Mescla amb la pasta fins a obtenir una salsa cremosa.'
    ]
  },
  {
    id: 'espaguetis-tonyina',
    name: 'Espaguetis amb tonyina',
    emoji: '🍝',
    time: 18, servings: 2, difficulty: 'fàcil', category: 'pasta',
    ingredients: [
      { emoji: '🍝', name: 'espaguetis', qty: '200 g', amount: 200, unit: 'g', required: true },
      { emoji: '🐟', name: 'tonyina', qty: '2 llaunes', amount: 2, unit: 'u', required: true },
      { emoji: '🍅', name: 'tomàquet', qty: '300 g triturat', amount: 300, unit: 'g', required: true },
      { emoji: '🫒', name: 'oli', qty: 'un raig', amount: null, unit: null, required: false }
    ],
    steps: [
      'Bull els espaguetis al dente.',
      'Escalfa el tomàquet a la paella.',
      'Afegeix la tonyina i mescla-ho amb la pasta.'
    ]
  },
  {
    id: 'arros-tres-delicies',
    name: 'Arròs tres delícies',
    emoji: '🍚',
    time: 20, servings: 2, difficulty: 'fàcil', category: 'pasta',
    ingredients: [
      { emoji: '🍚', name: 'arròs', qty: '200 g', amount: 200, unit: 'g', required: true },
      { emoji: '🥕', name: 'pastanaga', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🥚', name: 'ous', qty: '2', amount: 2, unit: 'u', required: true },
      { emoji: '🥓', name: 'bacó', qty: '80 g', amount: 80, unit: 'g', required: true }
    ],
    steps: [
      'Bull l\'arròs i refresca\'l amb aigua freda.',
      'Sofregeix la pastanaga a daus i el bacó.',
      'Afegeix l\'arròs, els ous batuts i remena fins que qualli.'
    ]
  },
  {
    id: 'risotto-marisc',
    name: 'Risotto de marisc',
    emoji: '🍚',
    time: 35, servings: 2, difficulty: 'mitjana', category: 'pasta',
    ingredients: [
      { emoji: '🍚', name: 'arròs', qty: '200 g', amount: 200, unit: 'g', required: true },
      { emoji: '🦐', name: 'gambes', qty: '250 g', amount: 250, unit: 'g', required: true },
      { emoji: '🧅', name: 'ceba', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🌶️', name: 'safrà', qty: 'un pessic', amount: null, unit: null, required: false },
      { emoji: '🫒', name: 'oli', qty: 'un raig', amount: null, unit: null, required: false }
    ],
    steps: [
      'Sofregeix la ceba i les gambes.',
      'Afegeix l\'arròs i ves abocant brou de peix poc a poc.',
      'Cou 18 minuts amb el safrà fins que sigui cremós.'
    ]
  },

  // ============= CARN I PEIX (15) =============
  {
    id: 'pollastre-rostit',
    name: 'Pollastre rostit',
    emoji: '🍗',
    time: 75, servings: 4, difficulty: 'mitjana', category: 'carn-peix',
    ingredients: [
      { emoji: '🍗', name: 'pollastre', qty: '1 sencer', amount: 1, unit: 'u', required: true },
      { emoji: '🥔', name: 'patates', qty: '4', amount: 4, unit: 'u', required: true },
      { emoji: '🧅', name: 'ceba', qty: '2', amount: 2, unit: 'u', required: true },
      { emoji: '🫒', name: 'oli', qty: 'un raig', amount: null, unit: null, required: false },
      { emoji: '🧂', name: 'sal', qty: 'al gust', amount: null, unit: null, required: false }
    ],
    steps: [
      'Salpebra el pollastre per dins i per fora.',
      'Posa\'l a la safata amb les patates i la ceba a quarts.',
      'Forn a 200° durant 60 min, regant-lo amb el seu suc.'
    ]
  },
  {
    id: 'filet-planxa',
    name: 'Filet a la planxa',
    emoji: '🥩',
    time: 8, servings: 1, difficulty: 'fàcil', category: 'carn-peix',
    ingredients: [
      { emoji: '🥩', name: 'filet', qty: '200 g', amount: 200, unit: 'g', required: true },
      { emoji: '🧂', name: 'sal', qty: 'al gust', amount: null, unit: null, required: false },
      { emoji: '🌶️', name: 'pebre', qty: 'al gust', amount: null, unit: null, required: false },
      { emoji: '🫒', name: 'oli', qty: 'un raig', amount: null, unit: null, required: false }
    ],
    steps: [
      'Salpebra el filet.',
      'Escalfa molt bé la planxa amb una mica d\'oli.',
      'Cuina 2-3 minuts per cada cara segons el punt desitjat.'
    ]
  },
  {
    id: 'pollastre-verdures',
    name: 'Pollastre amb verdures',
    emoji: '🍗',
    time: 35, servings: 2, difficulty: 'fàcil', category: 'carn-peix',
    ingredients: [
      { emoji: '🍗', name: 'pollastre', qty: '2 cuixes', amount: 2, unit: 'u', required: true },
      { emoji: '🥕', name: 'pastanaga', qty: '2', amount: 2, unit: 'u', required: true },
      { emoji: '🥬', name: 'verdures', qty: '1 grapat', amount: null, unit: null, required: true },
      { emoji: '🫒', name: 'oli', qty: 'un raig', amount: null, unit: null, required: false },
      { emoji: '🧂', name: 'sal', qty: 'al gust', amount: null, unit: null, required: false }
    ],
    steps: [
      'Daura el pollastre a la cassola.',
      'Afegeix les verdures tallades.',
      'Tapa i cou a foc baix 25 minuts.'
    ]
  },
  {
    id: 'truita-patates',
    name: 'Truita de patates',
    emoji: '🍳',
    time: 30, servings: 3, difficulty: 'mitjana', category: 'carn-peix',
    ingredients: [
      { emoji: '🥚', name: 'ous', qty: '4', amount: 4, unit: 'u', required: true },
      { emoji: '🥔', name: 'patates', qty: '3', amount: 3, unit: 'u', required: true },
      { emoji: '🧅', name: 'ceba', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🫒', name: 'oli', qty: 'per fregir', amount: null, unit: null, required: true },
      { emoji: '🧂', name: 'sal', qty: 'al gust', amount: null, unit: null, required: false }
    ],
    steps: [
      'Talla les patates a làmines fines i fregeix-les amb la ceba.',
      'Bat els ous amb sal i barreja-hi les patates ben escorregudes.',
      'Quallar a la paella per les dues cares amb l\'ajuda d\'un plat.'
    ]
  },
  {
    id: 'hamburgueses',
    name: 'Hamburgueses casolanes',
    emoji: '🍔',
    time: 15, servings: 2, difficulty: 'fàcil', category: 'carn-peix',
    ingredients: [
      { emoji: '🥩', name: 'carn picada', qty: '300 g', amount: 300, unit: 'g', required: true },
      { emoji: '🍞', name: 'pa d\'hamburguesa', qty: '2', amount: 2, unit: 'u', required: true },
      { emoji: '🧅', name: 'ceba', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🧂', name: 'sal', qty: 'al gust', amount: null, unit: null, required: false }
    ],
    steps: [
      'Salpebra la carn i fes-ne dues boles aplanades.',
      'Cuina-les a la planxa 3-4 min per banda.',
      'Munta dins el pa amb ceba tallada fina.'
    ]
  },
  {
    id: 'costelles-forn',
    name: 'Costelles al forn',
    emoji: '🥩',
    time: 60, servings: 3, difficulty: 'mitjana', category: 'carn-peix',
    ingredients: [
      { emoji: '🥩', name: 'costelles', qty: '800 g', amount: 800, unit: 'g', required: true },
      { emoji: '🥔', name: 'patates', qty: '3', amount: 3, unit: 'u', required: true },
      { emoji: '🫒', name: 'oli', qty: 'un raig', amount: null, unit: null, required: false },
      { emoji: '🧂', name: 'sal', qty: 'al gust', amount: null, unit: null, required: false }
    ],
    steps: [
      'Salpebra les costelles i posa-les a la safata.',
      'Acompanya-les amb les patates a quarts i un raig d\'oli.',
      'Forn a 190° durant 50 minuts.'
    ]
  },
  {
    id: 'peix-forn',
    name: 'Peix al forn',
    emoji: '🐟',
    time: 30, servings: 2, difficulty: 'fàcil', category: 'carn-peix',
    ingredients: [
      { emoji: '🐟', name: 'peix', qty: '2 lloms', amount: 2, unit: 'u', required: true },
      { emoji: '🥬', name: 'verdures', qty: '1 grapat', amount: null, unit: null, required: true },
      { emoji: '🍋', name: 'llimona', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🫒', name: 'oli', qty: 'un raig', amount: null, unit: null, required: false },
      { emoji: '🧂', name: 'sal', qty: 'al gust', amount: null, unit: null, required: false }
    ],
    steps: [
      'Posa les verdures tallades a la safata.',
      'Col·loca el peix a sobre, salpebra i banya amb llimona i oli.',
      'Forn a 200° durant 20 minuts.'
    ]
  },
  {
    id: 'salmo-planxa',
    name: 'Salmó a la planxa',
    emoji: '🐟',
    time: 10, servings: 1, difficulty: 'fàcil', category: 'carn-peix',
    ingredients: [
      { emoji: '🐟', name: 'salmó', qty: '1 lloms', amount: 1, unit: 'u', required: true },
      { emoji: '🍋', name: 'llimona', qty: '½', amount: 0.5, unit: 'u', required: true },
      { emoji: '🌿', name: 'herbes', qty: 'al gust', amount: null, unit: null, required: false },
      { emoji: '🧂', name: 'sal', qty: 'al gust', amount: null, unit: null, required: false }
    ],
    steps: [
      'Salpebra el salmó.',
      'Cuina\'l a la planxa amb la pell avall 4 min.',
      'Gira\'l 2 min més i banya amb llimona i herbes.'
    ]
  },
  {
    id: 'calamars-andalusa',
    name: 'Calamars a l\'andalusa',
    emoji: '🦑',
    time: 15, servings: 2, difficulty: 'fàcil', category: 'carn-peix',
    ingredients: [
      { emoji: '🦑', name: 'calamars', qty: '400 g', amount: 400, unit: 'g', required: true },
      { emoji: '🌾', name: 'farina', qty: '100 g', amount: 100, unit: 'g', required: true },
      { emoji: '🍋', name: 'llimona', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🫒', name: 'oli', qty: 'per fregir', amount: null, unit: null, required: false },
      { emoji: '🧂', name: 'sal', qty: 'al gust', amount: null, unit: null, required: false }
    ],
    steps: [
      'Talla els calamars a anelles i sala\'ls.',
      'Arrebossa\'ls amb farina.',
      'Fregeix-los en oli ben calent i serveix amb llimona.'
    ]
  },
  {
    id: 'tonyina-tomaquet',
    name: 'Tonyina amb tomàquet',
    emoji: '🐟',
    time: 25, servings: 2, difficulty: 'fàcil', category: 'carn-peix',
    ingredients: [
      { emoji: '🐟', name: 'tonyina', qty: '300 g', amount: 300, unit: 'g', required: true },
      { emoji: '🍅', name: 'tomàquet', qty: '400 g triturat', amount: 400, unit: 'g', required: true },
      { emoji: '🧅', name: 'ceba', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🫒', name: 'oli', qty: 'un raig', amount: null, unit: null, required: false }
    ],
    steps: [
      'Sofregeix la ceba picada.',
      'Afegeix el tomàquet i cou 10 minuts.',
      'Posa-hi la tonyina a daus i deixa fer 5 minuts més.'
    ]
  },
  {
    id: 'pollastre-curry',
    name: 'Pollastre al curry',
    emoji: '🍛',
    time: 30, servings: 2, difficulty: 'mitjana', category: 'carn-peix',
    ingredients: [
      { emoji: '🍗', name: 'pollastre', qty: '400 g', amount: 400, unit: 'g', required: true },
      { emoji: '🌶️', name: 'curry', qty: '1 cullerada', amount: null, unit: null, required: true },
      { emoji: '🥥', name: 'llet de coco', qty: '400 ml', amount: 400, unit: 'ml', required: true },
      { emoji: '🧅', name: 'ceba', qty: '1', amount: 1, unit: 'u', required: true }
    ],
    steps: [
      'Sofregeix la ceba i el pollastre tallat a daus.',
      'Aboca el curry i remena 1 minut.',
      'Afegeix la llet de coco i cou 20 min a foc baix.'
    ]
  },
  {
    id: 'truita-espinacs',
    name: 'Truita d\'espinacs',
    emoji: '🍳',
    time: 12, servings: 2, difficulty: 'fàcil', category: 'carn-peix',
    ingredients: [
      { emoji: '🥚', name: 'ous', qty: '4', amount: 4, unit: 'u', required: true },
      { emoji: '🥬', name: 'espinacs', qty: '200 g', amount: 200, unit: 'g', required: true },
      { emoji: '🫒', name: 'oli', qty: 'un raig', amount: null, unit: null, required: false },
      { emoji: '🧂', name: 'sal', qty: 'al gust', amount: null, unit: null, required: false }
    ],
    steps: [
      'Saltejat els espinacs a la paella fins que minvin.',
      'Bat els ous amb sal i mescla-hi els espinacs.',
      'Quallar a la paella per les dues cares.'
    ]
  },
  {
    id: 'alberginies-farcides',
    name: 'Albergínies farcides',
    emoji: '🍆',
    time: 50, servings: 2, difficulty: 'mitjana', category: 'carn-peix',
    ingredients: [
      { emoji: '🍆', name: 'albergínies', qty: '2', amount: 2, unit: 'u', required: true },
      { emoji: '🥩', name: 'carn picada', qty: '250 g', amount: 250, unit: 'g', required: true },
      { emoji: '🧀', name: 'formatge', qty: '80 g ratllat', amount: 80, unit: 'g', required: true },
      { emoji: '🍅', name: 'tomàquet', qty: '1 triturat', amount: 1, unit: 'u', required: false }
    ],
    steps: [
      'Buida les albergínies tallades per la meitat.',
      'Sofregeix la polpa amb la carn i el tomàquet.',
      'Farceix-les, cobreix amb formatge i forn 25 min a 200°.'
    ]
  },
  {
    id: 'pebrots-farcits',
    name: 'Pebrots farcits',
    emoji: '🌶️',
    time: 50, servings: 3, difficulty: 'mitjana', category: 'carn-peix',
    ingredients: [
      { emoji: '🌶️', name: 'pebrots', qty: '4', amount: 4, unit: 'u', required: true },
      { emoji: '🍚', name: 'arròs', qty: '150 g cuit', amount: 150, unit: 'g', required: true },
      { emoji: '🥩', name: 'carn picada', qty: '200 g', amount: 200, unit: 'g', required: true },
      { emoji: '🧅', name: 'ceba', qty: '1', amount: 1, unit: 'u', required: false }
    ],
    steps: [
      'Buida els pebrots i reserva les tapes.',
      'Mescla l\'arròs cuit amb la carn sofregida i la ceba.',
      'Farceix els pebrots i forn 25 min a 190°.'
    ]
  },
  {
    id: 'peix-verdures',
    name: 'Peix amb verdures',
    emoji: '🐟',
    time: 35, servings: 2, difficulty: 'fàcil', category: 'carn-peix',
    ingredients: [
      { emoji: '🐟', name: 'peix', qty: '2 lloms', amount: 2, unit: 'u', required: true },
      { emoji: '🥕', name: 'pastanaga', qty: '2', amount: 2, unit: 'u', required: true },
      { emoji: '🥬', name: 'verdures', qty: '1 grapat', amount: null, unit: null, required: true },
      { emoji: '🫒', name: 'oli', qty: 'un raig', amount: null, unit: null, required: false },
      { emoji: '🧂', name: 'sal', qty: 'al gust', amount: null, unit: null, required: false }
    ],
    steps: [
      'Talla les verdures a tires.',
      'Posa-les a la safata amb el peix a sobre.',
      'Forn a 190° durant 25 minuts.'
    ]
  },

  // ============= PLATS ÚNICS (10) =============
  {
    id: 'pizza-margherita',
    name: 'Pizza margherita',
    emoji: '🍕',
    time: 25, servings: 2, difficulty: 'mitjana', category: 'plat-unic',
    ingredients: [
      { emoji: '🥖', name: 'massa de pizza', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🍅', name: 'tomàquet', qty: '200 g triturat', amount: 200, unit: 'g', required: true },
      { emoji: '🧀', name: 'mozzarella', qty: '150 g', amount: 150, unit: 'g', required: true },
      { emoji: '🌿', name: 'alfàbrega', qty: 'unes fulles', amount: null, unit: null, required: true },
      { emoji: '🫒', name: 'oli', qty: 'un raig', amount: null, unit: null, required: false }
    ],
    steps: [
      'Estén la massa sobre paper de forn.',
      'Pinta-la amb tomàquet i reparteix-hi la mozzarella.',
      'Forn a 220° 12 minuts i decora amb alfàbrega fresca.'
    ]
  },
  {
    id: 'wrap-pollastre',
    name: 'Wrap de pollastre',
    emoji: '🌯',
    time: 15, servings: 1, difficulty: 'fàcil', category: 'plat-unic',
    ingredients: [
      { emoji: '🌯', name: 'wrap', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🍗', name: 'pollastre', qty: '150 g', amount: 150, unit: 'g', required: true },
      { emoji: '🥬', name: 'enciam', qty: 'unes fulles', amount: null, unit: null, required: true },
      { emoji: '🥚', name: 'maionesa', qty: '1 cullerada', amount: null, unit: null, required: false }
    ],
    steps: [
      'Cuina el pollastre tallat a tires.',
      'Estén el wrap i posa-hi enciam i pollastre.',
      'Afegeix una mica de maionesa i enrotlla.'
    ]
  },
  {
    id: 'entrepa-vegetal',
    name: 'Entrepà vegetal',
    emoji: '🥪',
    time: 5, servings: 1, difficulty: 'fàcil', category: 'plat-unic',
    ingredients: [
      { emoji: '🥖', name: 'pa', qty: '2 llesques', amount: null, unit: null, required: true },
      { emoji: '🍅', name: 'tomàquet', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🥬', name: 'enciam', qty: 'unes fulles', amount: null, unit: null, required: true },
      { emoji: '🧀', name: 'formatge', qty: '1 llesca', amount: null, unit: null, required: true },
      { emoji: '🥚', name: 'maionesa', qty: 'al gust', amount: null, unit: null, required: false }
    ],
    steps: [
      'Talla el pa i unta una mica de maionesa.',
      'Posa enciam, tomàquet i formatge.',
      'Tanca l\'entrepà i talla\'l per la meitat.'
    ]
  },
  {
    id: 'hamburguesa-completa',
    name: 'Hamburguesa completa',
    emoji: '🍔',
    time: 15, servings: 1, difficulty: 'fàcil', category: 'plat-unic',
    ingredients: [
      { emoji: '🍔', name: 'hamburguesa', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🥬', name: 'enciam', qty: 'una fulla', amount: null, unit: null, required: true },
      { emoji: '🍅', name: 'tomàquet', qty: '1 rodanxa', amount: null, unit: null, required: true },
      { emoji: '🧀', name: 'formatge', qty: '1 llesca', amount: null, unit: null, required: true },
      { emoji: '🧅', name: 'ceba', qty: 'unes anelles', amount: null, unit: null, required: false }
    ],
    steps: [
      'Cuina la hamburguesa a la planxa.',
      'Munta-la dins el pa amb enciam, tomàquet i formatge.',
      'Acaba amb anelles de ceba si vols.'
    ]
  },
  {
    id: 'empanada',
    name: 'Empanada',
    emoji: '🥟',
    time: 50, servings: 4, difficulty: 'mitjana', category: 'plat-unic',
    ingredients: [
      { emoji: '🥟', name: 'massa d\'empanada', qty: '2 plaques', amount: 2, unit: 'u', required: true },
      { emoji: '🥩', name: 'carn picada', qty: '300 g', amount: 300, unit: 'g', required: true },
      { emoji: '🧅', name: 'ceba', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🥚', name: 'ou', qty: '1 (per pintar)', amount: 1, unit: 'u', required: false }
    ],
    steps: [
      'Sofregeix la ceba amb la carn 10 min.',
      'Estén la massa, posa-hi el farciment i tanca.',
      'Pinta amb ou batut i forn 30 min a 190°.'
    ]
  },
  {
    id: 'coca-recapte',
    name: 'Coca de recapte',
    emoji: '🥖',
    time: 50, servings: 3, difficulty: 'mitjana', category: 'plat-unic',
    ingredients: [
      { emoji: '🥖', name: 'massa', qty: '1 base', amount: 1, unit: 'u', required: true },
      { emoji: '🌶️', name: 'pebrot', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🍆', name: 'albergínia', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🍅', name: 'tomàquet', qty: '2', amount: 2, unit: 'u', required: true },
      { emoji: '🫒', name: 'oli', qty: 'un raig', amount: null, unit: null, required: false }
    ],
    steps: [
      'Estén la massa fina sobre la safata del forn.',
      'Reparteix les verdures escalivades a tires.',
      'Forn a 200° durant 25 minuts.'
    ]
  },
  {
    id: 'quiche-verdures',
    name: 'Quiche de verdures',
    emoji: '🥧',
    time: 50, servings: 4, difficulty: 'mitjana', category: 'plat-unic',
    ingredients: [
      { emoji: '🥚', name: 'ous', qty: '3', amount: 3, unit: 'u', required: true },
      { emoji: '🧀', name: 'formatge', qty: '100 g ratllat', amount: 100, unit: 'g', required: true },
      { emoji: '🥬', name: 'verdures', qty: '300 g', amount: 300, unit: 'g', required: true },
      { emoji: '🥛', name: 'nata', qty: '200 ml', amount: 200, unit: 'ml', required: true }
    ],
    steps: [
      'Saltejat les verdures tallades fins que estiguin tendres.',
      'Bat els ous amb la nata i el formatge.',
      'Aboca-ho tot al motlle i forn 30 min a 180°.'
    ]
  },
  {
    id: 'tortilla-mexicana',
    name: 'Tortilla mexicana',
    emoji: '🌯',
    time: 15, servings: 1, difficulty: 'fàcil', category: 'plat-unic',
    ingredients: [
      { emoji: '🌯', name: 'tortilla', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🥩', name: 'carn', qty: '120 g', amount: 120, unit: 'g', required: true },
      { emoji: '🧀', name: 'formatge', qty: '50 g ratllat', amount: 50, unit: 'g', required: true },
      { emoji: '🥑', name: 'alvocat', qty: '½', amount: 0.5, unit: 'u', required: true }
    ],
    steps: [
      'Cuina la carn i adoba-la al gust.',
      'Estén la tortilla amb formatge i la carn.',
      'Afegeix l\'alvocat tallat i enrotlla.'
    ]
  },
  {
    id: 'entrepa-calamars',
    name: 'Entrepà de calamars',
    emoji: '🥖',
    time: 15, servings: 1, difficulty: 'fàcil', category: 'plat-unic',
    ingredients: [
      { emoji: '🥖', name: 'pa', qty: '1 barra petita', amount: 1, unit: 'u', required: true },
      { emoji: '🦑', name: 'calamars', qty: '200 g', amount: 200, unit: 'g', required: true },
      { emoji: '🍋', name: 'llimona', qty: '½', amount: 0.5, unit: 'u', required: true },
      { emoji: '🥚', name: 'maionesa', qty: 'al gust', amount: null, unit: null, required: false }
    ],
    steps: [
      'Fregeix els calamars arrebossats.',
      'Obre el pa pel mig.',
      'Omple amb els calamars, banya amb llimona i acaba amb maionesa.'
    ]
  },
  {
    id: 'entrepa-tonyina',
    name: 'Entrepà de tonyina',
    emoji: '🥖',
    time: 5, servings: 1, difficulty: 'fàcil', category: 'plat-unic',
    ingredients: [
      { emoji: '🥖', name: 'pa', qty: '1 barra petita', amount: 1, unit: 'u', required: true },
      { emoji: '🐟', name: 'tonyina', qty: '1 llauna', amount: 1, unit: 'u', required: true },
      { emoji: '🍅', name: 'tomàquet', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🥚', name: 'maionesa', qty: 'al gust', amount: null, unit: null, required: false }
    ],
    steps: [
      'Obre el pa per la meitat.',
      'Posa-hi la tonyina escorreguda i tomàquet a rodanxes.',
      'Acaba amb una mica de maionesa i tanca.'
    ]
  },

  // ============= POSTRES (10) =============
  {
    id: 'macedonia',
    name: 'Macedònia',
    emoji: '🍓',
    time: 10, servings: 4, difficulty: 'fàcil', category: 'postre',
    ingredients: [
      { emoji: '🍎', name: 'poma', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🍌', name: 'plàtan', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🍊', name: 'taronja', qty: '2', amount: 2, unit: 'u', required: true },
      { emoji: '🍓', name: 'maduixes', qty: '8', amount: 8, unit: 'u', required: true }
    ],
    steps: [
      'Pela i talla totes les fruites a daus.',
      'Mescla-les en un bol gran.',
      'Aboca-hi el suc d\'una taronja i refrigera abans de servir.'
    ]
  },
  {
    id: 'iogurt-mel',
    name: 'Iogurt amb mel',
    emoji: '🍯',
    time: 3, servings: 1, difficulty: 'fàcil', category: 'postre',
    ingredients: [
      { emoji: '🥛', name: 'iogurt', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🍯', name: 'mel', qty: '1 cullerada', amount: null, unit: null, required: true },
      { emoji: '🥜', name: 'fruits secs', qty: 'opcional', amount: null, unit: null, required: false }
    ],
    steps: [
      'Aboca el iogurt al bol.',
      'Posa la mel per sobre.',
      'Decora amb fruits secs si en tens.'
    ]
  },
  {
    id: 'platan-xocolata',
    name: 'Plàtan amb xocolata',
    emoji: '🍫',
    time: 15, servings: 1, difficulty: 'fàcil', category: 'postre',
    ingredients: [
      { emoji: '🍌', name: 'plàtan', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🍫', name: 'xocolata', qty: '50 g', amount: 50, unit: 'g', required: true },
      { emoji: '🥜', name: 'fruits secs', qty: 'opcional', amount: null, unit: null, required: false }
    ],
    steps: [
      'Fon la xocolata al bany Maria o microones.',
      'Banya el plàtan amb la xocolata.',
      'Refrigera 10 minuts perquè es solidifiqui.'
    ]
  },
  {
    id: 'crema-catalana',
    name: 'Crema catalana',
    emoji: '🍮',
    time: 30, servings: 4, difficulty: 'mitjana', category: 'postre',
    ingredients: [
      { emoji: '🥛', name: 'llet', qty: '500 ml', amount: 500, unit: 'ml', required: true },
      { emoji: '🥚', name: 'ous', qty: '4 rovells', amount: 4, unit: 'u', required: true },
      { emoji: '🍯', name: 'sucre', qty: '100 g', amount: 100, unit: 'g', required: true },
      { emoji: '🍮', name: 'canyella', qty: '1 branca', amount: null, unit: null, required: false }
    ],
    steps: [
      'Bull la llet amb la canyella.',
      'Mescla els rovells amb el sucre i incorpora la llet calenta.',
      'Cou a foc baix fins que espesseixi i refrigera.'
    ]
  },
  {
    id: 'pa-xocolata',
    name: 'Pa amb xocolata',
    emoji: '🍫',
    time: 5, servings: 1, difficulty: 'fàcil', category: 'postre',
    ingredients: [
      { emoji: '🥖', name: 'pa', qty: '2 llesques', amount: null, unit: null, required: true },
      { emoji: '🍫', name: 'xocolata', qty: '4 rajoles', amount: null, unit: null, required: true },
      { emoji: '🫒', name: 'oli', qty: 'un raig', amount: null, unit: null, required: false }
    ],
    steps: [
      'Talla el pa a llesques.',
      'Posa rajoles de xocolata a sobre.',
      'Si vols, acaba amb un fil d\'oli i una pessigada de sal.'
    ]
  },
  {
    id: 'maduixes-nata',
    name: 'Maduixes amb nata',
    emoji: '🍓',
    time: 10, servings: 2, difficulty: 'fàcil', category: 'postre',
    ingredients: [
      { emoji: '🍓', name: 'maduixes', qty: '300 g', amount: 300, unit: 'g', required: true },
      { emoji: '🥛', name: 'nata', qty: '200 ml per muntar', amount: 200, unit: 'ml', required: true },
      { emoji: '🍯', name: 'sucre', qty: '2 cullerades', amount: null, unit: null, required: false }
    ],
    steps: [
      'Renta i talla les maduixes a quarts.',
      'Munta la nata amb el sucre.',
      'Reparteix la nata sobre les maduixes.'
    ]
  },
  {
    id: 'poma-forn',
    name: 'Poma al forn',
    emoji: '🍎',
    time: 35, servings: 2, difficulty: 'fàcil', category: 'postre',
    ingredients: [
      { emoji: '🍎', name: 'pomes', qty: '2', amount: 2, unit: 'u', required: true },
      { emoji: '🍯', name: 'mel', qty: '2 cullerades', amount: null, unit: null, required: true },
      { emoji: '🍮', name: 'canyella', qty: 'al gust', amount: null, unit: null, required: false }
    ],
    steps: [
      'Buida el cor de les pomes sense travessar-les.',
      'Omple-les de mel i empolvora amb canyella.',
      'Forn a 180° durant 30 minuts.'
    ]
  },
  {
    id: 'iogurt-fruits-secs',
    name: 'Iogurt amb fruits secs',
    emoji: '🥛',
    time: 3, servings: 1, difficulty: 'fàcil', category: 'postre',
    ingredients: [
      { emoji: '🥛', name: 'iogurt', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🥜', name: 'fruits secs', qty: '1 grapat', amount: null, unit: null, required: true },
      { emoji: '🍯', name: 'mel', qty: '1 culleradeta', amount: null, unit: null, required: false }
    ],
    steps: [
      'Aboca el iogurt al bol.',
      'Trinxa lleugerament els fruits secs.',
      'Posa\'ls per sobre i acaba amb un fil de mel.'
    ]
  },
  {
    id: 'macedonia-tropical',
    name: 'Macedònia tropical',
    emoji: '🥭',
    time: 10, servings: 2, difficulty: 'fàcil', category: 'postre',
    ingredients: [
      { emoji: '🥭', name: 'mango', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🍍', name: 'pinya', qty: '½', amount: 0.5, unit: 'u', required: true },
      { emoji: '🥥', name: 'coco', qty: '50 g ratllat', amount: 50, unit: 'g', required: true }
    ],
    steps: [
      'Pela i talla el mango i la pinya a daus.',
      'Mescla-ho en un bol.',
      'Decora amb coco ratllat per sobre.'
    ]
  },
  {
    id: 'platan-iogurt',
    name: 'Plàtan amb iogurt',
    emoji: '🍌',
    time: 3, servings: 1, difficulty: 'fàcil', category: 'postre',
    ingredients: [
      { emoji: '🍌', name: 'plàtan', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🥛', name: 'iogurt', qty: '1', amount: 1, unit: 'u', required: true },
      { emoji: '🍯', name: 'mel', qty: '1 culleradeta', amount: null, unit: null, required: false }
    ],
    steps: [
      'Talla el plàtan a rodanxes en un bol.',
      'Cobreix-lo amb el iogurt.',
      'Aboca un fil de mel per sobre.'
    ]
  }
];
