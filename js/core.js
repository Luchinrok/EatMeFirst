/* ============================================
   Buyte — js/core.js
   Constants globals i helpers compartits.
   Carregat abans de la resta de mòduls.
   ============================================ */


// Base de dades de productes populars del supermercat
// Format: nom en cada idioma, emoji, dies de caducitat per defecte, location (zona d'emmagatzematge canònica)
//
// Camp `slug` (Fase 2, sub-pas 1): identificador ESTABLE i independent de
// l'idioma de cada entrada. És un LITERAL, generat un sol cop (kebab del `ca`
// normalitzat) i mai calculat en runtime: si es derivés del `ca` en viu,
// renombrar una entrada mouria el slug i deixaria orfes tots els productes
// desats — exactament el problema del `pop-N`, que és una posició d'array i es
// desplaça en inserir entrades noves. NO editis un slug existent ni el recalculis
// des del `ca`; en afegir una entrada nova, assigna-li un slug nou i únic a mà.
const POPULAR_PRODUCTS = [
  // Làctics → nevera
  { ca: 'Llet', slug: 'llet', es: 'Leche', en: 'Milk', fr: 'Lait', it: 'Latte', de: 'Milch', pt: 'Leite', nl: 'Melk', ja: '牛乳', zh: '牛奶', ko: '우유', emoji: '🥛', days: 7, location: 'fridge', price: 1.20, weight: '1L' },
  { ca: 'Iogurt natural', slug: 'iogurt-natural', es: 'Yogur natural', en: 'Plain yogurt', fr: 'Yaourt nature', it: 'Yogurt naturale', de: 'Naturjoghurt', pt: 'Iogurte natural', nl: 'Yoghurt', ja: 'ヨーグルト', zh: '酸奶', ko: '요구르트', emoji: '🥛', days: 14, location: 'fridge', price: 0.40, weight: '125g' },
  { ca: 'Formatge', slug: 'formatge', es: 'Queso', en: 'Cheese', fr: 'Fromage', it: 'Formaggio', de: 'Käse', pt: 'Queijo', nl: 'Kaas', ja: 'チーズ', zh: '奶酪', ko: '치즈', emoji: '🧀', days: 21, location: 'fridge', price: 3.00, weight: '250g' },
  { ca: 'Mantega', slug: 'mantega', es: 'Mantequilla', en: 'Butter', fr: 'Beurre', it: 'Burro', de: 'Butter', pt: 'Manteiga', nl: 'Boter', ja: 'バター', zh: '黄油', ko: '버터', emoji: '🧈', days: 30, location: 'fridge', price: 2.00, weight: '250g' },
  // Fresc → nevera
  { ca: 'Ous', slug: 'ous', es: 'Huevos', en: 'Eggs', fr: 'Œufs', it: 'Uova', de: 'Eier', pt: 'Ovos', nl: 'Eieren', ja: '卵', zh: '鸡蛋', ko: '계란', emoji: '🥚', days: 21, location: 'fridge', price: 2.00, weight: '12u' },
  { ca: 'Pollastre', slug: 'pollastre', es: 'Pollo', en: 'Chicken', fr: 'Poulet', it: 'Pollo', de: 'Hähnchen', pt: 'Frango', nl: 'Kip', ja: '鶏肉', zh: '鸡肉', ko: '닭고기', emoji: '🍗', days: 3, location: 'fridge', price: 6.00, weight: '1kg' },
  { ca: 'Carn picada', slug: 'carn-picada', es: 'Carne picada', en: 'Ground beef', fr: 'Viande hachée', it: 'Carne macinata', de: 'Hackfleisch', pt: 'Carne moída', nl: 'Gehakt', ja: 'ひき肉', zh: '绞肉', ko: '다진 고기', emoji: '🥩', days: 3, location: 'fridge', price: 6.00, weight: '500g' },
  { ca: 'Peix fresc', slug: 'peix-fresc', es: 'Pescado fresco', en: 'Fresh fish', fr: 'Poisson frais', it: 'Pesce fresco', de: 'Frischer Fisch', pt: 'Peixe fresco', nl: 'Verse vis', ja: '魚', zh: '鱼', ko: '생선', emoji: '🐟', days: 2, location: 'fridge', price: 7.00, weight: '500g' },
  // Fruites → fruiter (taula); maduixa millor a la nevera
  { ca: 'Plàtans', slug: 'platans', es: 'Plátanos', en: 'Bananas', fr: 'Bananes', it: 'Banane', de: 'Bananen', pt: 'Bananas', nl: 'Bananen', ja: 'バナナ', zh: '香蕉', ko: '바나나', emoji: '🍌', days: 5, location: 'fruit_bowl', price: 0.20 },
  { ca: 'Pomes', slug: 'pomes', es: 'Manzanas', en: 'Apples', fr: 'Pommes', it: 'Mele', de: 'Äpfel', pt: 'Maçãs', nl: 'Appels', ja: 'りんご', zh: '苹果', ko: '사과', emoji: '🍎', days: 14, location: 'fruit_bowl', price: 0.30 },
  { ca: 'Maduixes', slug: 'maduixes', es: 'Fresas', en: 'Strawberries', fr: 'Fraises', it: 'Fragole', de: 'Erdbeeren', pt: 'Morangos', nl: 'Aardbeien', ja: 'いちご', zh: '草莓', ko: '딸기', emoji: '🍓', days: 3, location: 'fridge', price: 3.00, weight: '500g' },
  { ca: 'Taronges', slug: 'taronges', es: 'Naranjas', en: 'Oranges', fr: 'Oranges', it: 'Arance', de: 'Orangen', pt: 'Laranjas', nl: 'Sinaasappels', ja: 'オレンジ', zh: '橙子', ko: '오렌지', emoji: '🍊', days: 14, location: 'fruit_bowl', price: 0.30 },
  // Verdures → tomàquet a fruiter; la resta a la nevera; patates/cebes al rebost
  { ca: 'Tomàquets', slug: 'tomaquets', es: 'Tomates', en: 'Tomatoes', fr: 'Tomates', it: 'Pomodori', de: 'Tomaten', pt: 'Tomates', nl: 'Tomaten', ja: 'トマト', zh: '番茄', ko: '토마토', emoji: '🍅', days: 5, location: 'fruit_bowl', price: 0.30 },
  { ca: 'Enciam', slug: 'enciam', es: 'Lechuga', en: 'Lettuce', fr: 'Laitue', it: 'Lattuga', de: 'Salat', pt: 'Alface', nl: 'Sla', ja: 'レタス', zh: '生菜', ko: '상추', emoji: '🥬', days: 5, location: 'fruit_bowl', price: 1.50 },
  { ca: 'Pastanagues', slug: 'pastanagues', es: 'Zanahorias', en: 'Carrots', fr: 'Carottes', it: 'Carote', de: 'Karotten', pt: 'Cenouras', nl: 'Wortels', ja: 'にんじん', zh: '胡萝卜', ko: '당근', emoji: '🥕', days: 14, location: 'fruit_bowl', price: 0.20 },
  { ca: 'Patates', slug: 'patates', es: 'Patatas', en: 'Potatoes', fr: 'Pommes de terre', it: 'Patate', de: 'Kartoffeln', pt: 'Batatas', nl: 'Aardappels', ja: 'じゃがいも', zh: '土豆', ko: '감자', emoji: '🥔', days: 30, location: 'pantry', price: 0.20 },
  { ca: 'Cebes', slug: 'cebes', es: 'Cebollas', en: 'Onions', fr: 'Oignons', it: 'Cipolle', de: 'Zwiebeln', pt: 'Cebolas', nl: 'Uien', ja: '玉ねぎ', zh: '洋葱', ko: '양파', emoji: '🧅', days: 30, location: 'pantry', price: 0.20 },
  // Forn → rebost
  { ca: 'Pa', slug: 'pa', es: 'Pan', en: 'Bread', fr: 'Pain', it: 'Pane', de: 'Brot', pt: 'Pão', nl: 'Brood', ja: 'パン', zh: '面包', ko: '빵', emoji: '🥖', days: 4, location: 'pantry', price: 1.20, weight: '250g' },
  { ca: 'Pa de motlle', slug: 'pa-de-motlle', es: 'Pan de molde', en: 'Sliced bread', fr: 'Pain de mie', it: 'Pancarré', de: 'Toastbrot', pt: 'Pão de fôrma', nl: 'Casinobrood', ja: '食パン', zh: '吐司面包', ko: '식빵', emoji: '🍞', days: 7, location: 'pantry', price: 2.00, weight: '500g' },
  // Rebost
  { ca: 'Pasta', slug: 'pasta', es: 'Pasta', en: 'Pasta', fr: 'Pâtes', it: 'Pasta', de: 'Nudeln', pt: 'Massa', nl: 'Pasta', ja: 'パスタ', zh: '意面', ko: '파스타', emoji: '🍝', days: 365, location: 'pantry', price: 1.00, weight: '500g' },
  { ca: 'Arròs', slug: 'arros', es: 'Arroz', en: 'Rice', fr: 'Riz', it: 'Riso', de: 'Reis', pt: 'Arroz', nl: 'Rijst', ja: '米', zh: '大米', ko: '쌀', emoji: '🍚', days: 365, location: 'pantry', price: 2.00, weight: '1kg' },
  { ca: 'Oli d\'oliva', slug: 'oli-d-oliva', es: 'Aceite de oliva', en: 'Olive oil', fr: 'Huile d\'olive', it: 'Olio d\'oliva', de: 'Olivenöl', pt: 'Azeite', nl: 'Olijfolie', ja: 'オリーブオイル', zh: '橄榄油', ko: '올리브유', emoji: '🫒', days: 365, location: 'pantry', price: 8.00, weight: '1L' },
  { ca: 'Conserva (tonyina)', slug: 'conserva-tonyina', es: 'Conserva (atún)', en: 'Canned tuna', fr: 'Thon en conserve', it: 'Tonno in scatola', de: 'Thunfisch in Dose', pt: 'Atum em lata', nl: 'Tonijn in blik', ja: 'ツナ缶', zh: '金枪鱼罐头', ko: '참치캔', emoji: '🥫', days: 365, location: 'pantry', price: 1.50 },
  // Dolços → rebost
  { ca: 'Xocolata', slug: 'xocolata', es: 'Chocolate', en: 'Chocolate', fr: 'Chocolat', it: 'Cioccolato', de: 'Schokolade', pt: 'Chocolate', nl: 'Chocolade', ja: 'チョコレート', zh: '巧克力', ko: '초콜릿', emoji: '🍫', days: 60, location: 'pantry', price: 1.50, weight: '100g' },
  { ca: 'Galetes', slug: 'galetes', es: 'Galletas', en: 'Cookies', fr: 'Biscuits', it: 'Biscotti', de: 'Kekse', pt: 'Bolachas', nl: 'Koekjes', ja: 'クッキー', zh: '饼干', ko: '쿠키', emoji: '🍪', days: 90, location: 'pantry', price: 1.50, weight: '300g' },
  // Begudes → aigua al rebost; suc a la nevera
  { ca: 'Aigua', slug: 'aigua', es: 'Agua', en: 'Water', fr: 'Eau', it: 'Acqua', de: 'Wasser', pt: 'Água', nl: 'Water', ja: '水', zh: '水', ko: '물', emoji: '💧', days: 365, location: 'pantry', price: 0.50, weight: '1.5L' },
  { ca: 'Suc de taronja', slug: 'suc-de-taronja', es: 'Zumo de naranja', en: 'Orange juice', fr: 'Jus d\'orange', it: 'Succo d\'arancia', de: 'Orangensaft', pt: 'Suco de laranja', nl: 'Sinaasappelsap', ja: 'オレンジジュース', zh: '橙汁', ko: '오렌지 주스', emoji: '🧃', days: 7, location: 'fridge', price: 2.00, weight: '1L' },
  // === Ampliació catàleg 2026 ===
  // Productes nous afegits per cobrir els items de DEFAULT_SPECIAL_LISTS
  // i ampliar la categorització. Només omplim `ca` + `en` per ara;
  // el fallback robust de populars.js:getPopularProducts mostra `en`
  // (i pertinent fallback) quan l'usuari té un idioma sense traducció.
  // Productes no-aliment (Espelmes, Globus, Plats i gots, Regal,
  // Carbó, Tovalloletes) ometen `days` i sovint `location` perquè no
  // tenen caducitat ni zona d'emmagatzematge clara. Tenen `noExpiry:true`
  // com a senyal explícit (millor que confiar només en l'absència de
  // `days`, perquè el formulari d'edició assigna `days:7` per defecte
  // quan no en troba — la migració v3 a categories.js neteja el cache
  // d'usuaris que poden tenir aquesta combinació inconsistent).
  { ca: 'Embotit', slug: 'embotit', en: 'Cold cuts', es: 'Embutido', fr: 'Charcuterie', emoji: '🥓', days: 7, location: 'fridge', price: 2.50, weight: '200g' },
  { ca: 'Fruita', slug: 'fruita', en: 'Fruit', es: 'Fruta', fr: 'Fruits', emoji: '🍎', days: 7, location: 'fruit_bowl', price: 1.50, weight: '1kg' },
  { ca: 'Suc', slug: 'suc', en: 'Juice', es: 'Zumo', fr: 'Jus', emoji: '🧃', days: 10, location: 'pantry', price: 1.80, weight: '1L' },
  { ca: 'Tovalloletes', slug: 'tovalloletes', en: 'Wet wipes', es: 'Toallitas', fr: 'Lingettes', emoji: '🧻', price: 1.20, noExpiry: true },
  { ca: 'Pastís', slug: 'pastis', en: 'Cake', es: 'Pastel', fr: 'Gâteau', emoji: '🎂', days: 3, location: 'fridge', price: 12.00 },
  { ca: 'Espelmes', slug: 'espelmes', en: 'Candles', es: 'Velas', fr: 'Bougies', emoji: '🕯️', price: 2.00, noExpiry: true },
  { ca: 'Globus', slug: 'globus', en: 'Balloons', es: 'Globos', fr: 'Ballons', emoji: '🎈', price: 3.50, noExpiry: true },
  { ca: 'Aperitius', slug: 'aperitius', en: 'Snacks', es: 'Aperitivos', fr: 'Apéritifs', emoji: '🥨', days: 60, location: 'pantry', price: 2.50, weight: '200g' },
  { ca: 'Refrescos', slug: 'refrescos', en: 'Soft drinks', es: 'Refrescos', fr: 'Sodas', emoji: '🥤', days: 180, location: 'pantry', price: 1.50, weight: '2L' },
  { ca: 'Olives', slug: 'olives', en: 'Olives', es: 'Aceitunas', fr: 'Olives', emoji: '🫒', days: 90, location: 'pantry', price: 1.80, weight: '350g' },
  { ca: 'Plats i gots', slug: 'plats-i-gots', en: 'Plates and cups', es: 'Platos y vasos', fr: 'Assiettes et gobelets', emoji: '🍽️', price: 3.00, noExpiry: true },
  { ca: 'Regal', slug: 'regal', en: 'Gift', es: 'Regalo', fr: 'Cadeau', emoji: '🎁', price: 15.00, noExpiry: true },
  { ca: 'Patates xips', slug: 'patates-xips', en: 'Potato chips', es: 'Patatas fritas', fr: 'Chips', emoji: '🥔', days: 90, location: 'pantry', price: 1.80, weight: '160g' },
  { ca: 'Calçots', slug: 'calcots', en: 'Calçots', es: 'Calçots', fr: 'Calçots', emoji: '🌱', days: 4, location: 'fridge', price: 0.50 },
  { ca: 'Salsa romesco', slug: 'salsa-romesco', en: 'Romesco sauce', es: 'Salsa romesco', fr: 'Sauce romesco', emoji: '🥫', days: 30, location: 'fridge', price: 3.50, weight: '200g' },
  { ca: 'Carn brasa', slug: 'carn-brasa', en: 'Grilling meat', es: 'Carne para brasa', fr: 'Viande à griller', emoji: '🥩', days: 3, location: 'fridge', price: 12.00, weight: '1kg' },
  { ca: 'Botifarra', slug: 'botifarra', en: 'Catalan sausage', es: 'Butifarra', fr: 'Botifarra', emoji: '🌭', days: 5, location: 'fridge', price: 4.50, weight: '500g' },
  { ca: 'Vi', slug: 'vi', en: 'Wine', es: 'Vino', fr: 'Vin', emoji: '🍷', days: 730, location: 'pantry', price: 5.00, weight: '750ml' },
  { ca: 'Mongetes', slug: 'mongetes', en: 'Beans', es: 'Judías', fr: 'Haricots', emoji: '🫘', days: 365, location: 'pantry', price: 2.00, weight: '400g' },
  { ca: 'Crema catalana', slug: 'crema-catalana', en: 'Catalan cream', es: 'Crema catalana', fr: 'Crème catalane', emoji: '🍮', days: 5, location: 'fridge', price: 3.00, weight: '4u' },
  { ca: 'Cafè', slug: 'cafe', en: 'Coffee', es: 'Café', fr: 'Café', emoji: '☕', days: 365, location: 'pantry', price: 4.50, weight: '250g' },
  { ca: 'Melmelada', slug: 'melmelada', en: 'Jam', es: 'Mermelada', fr: 'Confiture', emoji: '🍓', days: 180, location: 'pantry', price: 2.50, weight: '340g' },
  { ca: 'Cereals', slug: 'cereals', en: 'Cereals', es: 'Cereales', fr: 'Céréales', emoji: '🥣', days: 180, location: 'pantry', price: 3.00, weight: '500g' },
  { ca: 'Carn vermella', slug: 'carn-vermella', en: 'Red meat', es: 'Carne roja', fr: 'Viande rouge', emoji: '🥩', days: 3, location: 'fridge', price: 14.00, weight: '1kg' },
  { ca: 'Salsitxes', slug: 'salsitxes', en: 'Sausages', es: 'Salchichas', fr: 'Saucisses', emoji: '🌭', days: 7, location: 'fridge', price: 3.50, weight: '400g' },
  { ca: 'Hamburgueses', slug: 'hamburgueses', en: 'Burgers', es: 'Hamburguesas', fr: 'Hamburgers', emoji: '🍔', days: 5, location: 'fridge', price: 5.00, weight: '4u' },
  { ca: 'Carbó', slug: 'carbo', en: 'Charcoal', es: 'Carbón', fr: 'Charbon', emoji: '🪵', location: 'pantry', price: 6.00, weight: '3kg', noExpiry: true },
  { ca: 'Cervesa', slug: 'cervesa', en: 'Beer', es: 'Cerveza', fr: 'Bière', emoji: '🍺', days: 365, location: 'pantry', price: 6.00, weight: '6x33cl' },
  { ca: 'Amanida', slug: 'amanida', en: 'Salad', es: 'Ensalada', fr: 'Salade', emoji: '🥗', days: 5, location: 'fridge', price: 1.80, weight: '250g' },
  { ca: 'Espaguetis', slug: 'espaguetis', en: 'Spaghetti', es: 'Espaguetis', fr: 'Spaghettis', emoji: '🍝', days: 730, location: 'pantry', price: 1.20, weight: '500g' },
  { ca: 'Tomàquet fregit', slug: 'tomaquet-fregit', en: 'Fried tomato', es: 'Tomate frito', fr: 'Tomate frite', emoji: '🥫', days: 30, location: 'pantry', price: 1.50, weight: '350g' },
  { ca: 'All', slug: 'all', en: 'Garlic', es: 'Ajo', fr: 'Ail', emoji: '🧄', days: 90, location: 'pantry', price: 0.80, weight: '3u' },
  { ca: 'Vi negre', slug: 'vi-negre', en: 'Red wine', es: 'Vino tinto', fr: 'Vin rouge', emoji: '🍷', days: 730, location: 'pantry', price: 5.00, weight: '750ml' },
  { ca: 'Formatge ratllat', slug: 'formatge-ratllat', en: 'Grated cheese', es: 'Queso rallado', fr: 'Fromage râpé', emoji: '🧀', days: 30, location: 'fridge', price: 2.50, weight: '150g' },
  // --- Ampliació catàleg receptes (06/06/2026) ---
  // Verdures per peça (sense weight = comptables, com Enciam)
  { ca: 'Albergínia', slug: 'alberginia', en: 'Eggplant', es: 'Berenjena', fr: 'Aubergine', emoji: '🍆', days: 7, location: 'fridge', price: 0.80 },
  { ca: 'Carbassó', slug: 'carbasso', en: 'Zucchini', es: 'Calabacín', fr: 'Courgette', emoji: '🥒', days: 7, location: 'fridge', price: 0.80 },
  { ca: 'Cogombre', slug: 'cogombre', en: 'Cucumber', es: 'Pepino', fr: 'Concombre', emoji: '🥒', days: 7, location: 'fridge', price: 0.70 },
  { ca: 'Col', slug: 'col', en: 'Cabbage', es: 'Col', fr: 'Chou', emoji: '🥬', days: 12, location: 'fridge', price: 1.20 },
  { ca: 'Pebrot', slug: 'pebrot', en: 'Bell pepper', es: 'Pimiento', fr: 'Poivron', emoji: '🫑', days: 8, location: 'fridge', price: 0.90 },
  { ca: 'Porro', slug: 'porro', en: 'Leek', es: 'Puerro', fr: 'Poireau', emoji: '🧅', days: 8, location: 'fridge', price: 0.90 },
  { ca: 'Verdures', slug: 'verdures', en: 'Vegetables', es: 'Verduras', fr: 'Légumes', emoji: '🥬', days: 6, location: 'fridge', price: 2.00 },
  // Verdures per pes/bossa (amb weight)
  { ca: 'Espinacs', slug: 'espinacs', en: 'Spinach', es: 'Espinacas', fr: 'Épinards', emoji: '🥬', days: 5, location: 'fridge', price: 1.50, weight: '200g' },
  { ca: 'Bolets', slug: 'bolets', en: 'Mushrooms', es: 'Setas', fr: 'Champignons', emoji: '🍄', days: 5, location: 'fridge', price: 1.80, weight: '250g' },
  // Fruita (fruitera, per peça)
  { ca: 'Alvocat', slug: 'alvocat', en: 'Avocado', es: 'Aguacate', fr: 'Avocat', emoji: '🥑', days: 5, location: 'fruit_bowl', price: 1.00 },
  { ca: 'Llimona', slug: 'llimona', en: 'Lemon', es: 'Limón', fr: 'Citron', emoji: '🍋', days: 14, location: 'fruit_bowl', price: 0.40 },
  { ca: 'Mango', slug: 'mango', en: 'Mango', es: 'Mango', fr: 'Mangue', emoji: '🥭', days: 5, location: 'fruit_bowl', price: 1.20 },
  { ca: 'Pinya', slug: 'pinya', en: 'Pineapple', es: 'Piña', fr: 'Ananas', emoji: '🍍', days: 5, location: 'fruit_bowl', price: 1.80 },
  { ca: 'Coco', slug: 'coco', en: 'Coconut', es: 'Coco', fr: 'Noix de coco', emoji: '🥥', days: 14, location: 'fruit_bowl', price: 1.50 },
  // Carn i embotits (nevera, amb weight)
  { ca: 'Bacó', slug: 'baco', en: 'Bacon', es: 'Bacón', fr: 'Lard', emoji: '🥓', days: 14, location: 'fridge', price: 2.00, weight: '150g' },
  { ca: 'Pernil dolç', slug: 'pernil-dolc', en: 'Cooked ham', es: 'Jamón cocido', fr: 'Jambon blanc', emoji: '🥓', days: 7, location: 'fridge', price: 2.50, weight: '200g' },
  { ca: 'Costelles', slug: 'costelles', en: 'Ribs', es: 'Costillas', fr: 'Côtes', emoji: '🥩', days: 3, location: 'fridge', price: 7.00, weight: '1kg' },
  { ca: 'Filet', slug: 'filet', en: 'Fillet', es: 'Filete', fr: 'Filet', emoji: '🥩', days: 3, location: 'fridge', price: 8.00, weight: '500g' },
  // Peix i marisc (nevera, amb weight)
  { ca: 'Salmó', slug: 'salmo', en: 'Salmon', es: 'Salmón', fr: 'Saumon', emoji: '🐟', days: 2, location: 'fridge', price: 9.00, weight: '500g' },
  { ca: 'Gambes', slug: 'gambes', en: 'Prawns', es: 'Gambas', fr: 'Gambas', emoji: '🦐', days: 2, location: 'fridge', price: 8.00, weight: '500g' },
  { ca: 'Calamars', slug: 'calamars', en: 'Squid', es: 'Calamares', fr: 'Calamars', emoji: '🦑', days: 2, location: 'fridge', price: 5.00, weight: '500g' },
  // Lactis (nevera, amb weight)
  { ca: 'Mozzarella', slug: 'mozzarella', en: 'Mozzarella', es: 'Mozzarella', fr: 'Mozzarella', emoji: '🧀', days: 14, location: 'fridge', price: 1.20, weight: '125g' },
  { ca: 'Nata', slug: 'nata', en: 'Cream', es: 'Nata', fr: 'Crème', emoji: '🥛', days: 10, location: 'fridge', price: 1.50, weight: '200ml' },
  // Rebost: secs i envasats (amb weight)
  { ca: 'Farina', slug: 'farina', en: 'Flour', es: 'Harina', fr: 'Farine', emoji: '🌾', days: 365, location: 'pantry', price: 0.80, weight: '1kg' },
  { ca: 'Avena', slug: 'avena', en: 'Oats', es: 'Avena', fr: 'Flocons d\'avoine', emoji: '🌾', days: 365, location: 'pantry', price: 1.50, weight: '500g' },
  { ca: 'Llenties', slug: 'llenties', en: 'Lentils', es: 'Lentejas', fr: 'Lentilles', emoji: '🫘', days: 730, location: 'pantry', price: 1.20, weight: '500g' },
  { ca: 'Pinyons', slug: 'pinyons', en: 'Pine nuts', es: 'Piñones', fr: 'Pignons', emoji: '🌰', days: 180, location: 'pantry', price: 3.00, weight: '100g' },
  { ca: 'Llet de coco', slug: 'llet-de-coco', en: 'Coconut milk', es: 'Leche de coco', fr: 'Lait de coco', emoji: '🥥', days: 365, location: 'pantry', price: 1.50, weight: '400ml' },
  { ca: 'Maionesa', slug: 'maionesa', en: 'Mayonnaise', es: 'Mayonesa', fr: 'Mayonnaise', emoji: '🥫', days: 90, location: 'pantry', price: 1.80, weight: '400ml' },
  // Pa i masses
  { ca: "Pa d'hamburguesa", en: 'Burger buns', emoji: '🍔', days: 7, location: 'pantry', price: 1.20, weight: '4u' },
  { ca: 'Tortilla', slug: 'tortilla', en: 'Tortillas', es: 'Tortillas', fr: 'Tortillas', emoji: '🫓', days: 30, location: 'pantry', price: 1.50, weight: '6u' },
  { ca: 'Wrap', slug: 'wrap', en: 'Wraps', es: 'Wraps', fr: 'Wraps', emoji: '🌯', days: 30, location: 'pantry', price: 2.00, weight: '6u' },
  { ca: 'Massa de pizza', slug: 'massa-de-pizza', en: 'Pizza dough', es: 'Masa de pizza', fr: 'Pâte à pizza', emoji: '🍕', days: 14, location: 'fridge', price: 1.50, weight: '1u' },
  { ca: "Massa d'empanada", en: 'Empanada dough', emoji: '🥟', days: 14, location: 'fridge', price: 2.00, weight: '1u' },
  { ca: 'Massa', slug: 'massa', en: 'Dough', es: 'Masa', fr: 'Pâte', emoji: '🥖', days: 7, location: 'fridge', price: 1.50, weight: '1u' },
  // Al gust (noExpiry)
  { ca: 'Sal', slug: 'sal', en: 'Salt', es: 'Sal', fr: 'Sel', emoji: '🧂', location: 'pantry', price: 0.50, weight: '1kg', noExpiry: true },
  { ca: 'Sucre', slug: 'sucre', en: 'Sugar', es: 'Azúcar', fr: 'Sucre', emoji: '🍬', location: 'pantry', price: 0.90, weight: '1kg', noExpiry: true },
  { ca: 'Mel', slug: 'mel', en: 'Honey', es: 'Miel', fr: 'Miel', emoji: '🍯', location: 'pantry', price: 4.00, weight: '500g', noExpiry: true },
  { ca: 'Pebre', slug: 'pebre', en: 'Pepper', es: 'Pimienta', fr: 'Poivre', emoji: '🧂', location: 'pantry', price: 1.50, weight: '50g', noExpiry: true },
  { ca: 'Canyella', slug: 'canyella', en: 'Cinnamon', es: 'Canela', fr: 'Cannelle', emoji: '🟤', location: 'pantry', price: 1.50, weight: '50g', noExpiry: true },
  { ca: 'Curry', slug: 'curry', en: 'Curry', es: 'Curry', fr: 'Curry', emoji: '🍛', location: 'pantry', price: 1.80, weight: '50g', noExpiry: true },
  { ca: 'Safrà', slug: 'safra', en: 'Saffron', es: 'Azafrán', fr: 'Safran', emoji: '🌼', location: 'pantry', price: 3.00, weight: '2g', noExpiry: true },
  { ca: 'Herbes', slug: 'herbes', en: 'Herbs', es: 'Hierbas', fr: 'Herbes', emoji: '🌿', location: 'pantry', price: 1.20, weight: '20g', noExpiry: true },
  { ca: 'Alfàbrega', slug: 'alfabrega', en: 'Basil', es: 'Albahaca', fr: 'Basilic', emoji: '🌿', days: 7, location: 'fridge', price: 1.20 },
  // Ingredients de receptes que faltaven (10/06/2026)
  { ca: 'Iogurt', slug: 'iogurt',        en: 'Yogurt', es: 'Yogur', fr: 'Yaourt',      emoji: '🥛', days: 21,  location: 'fridge', price: 1.50, weight: '4x125g' },
  { ca: 'Peix', slug: 'peix',          en: 'Fish', es: 'Pescado', fr: 'Poisson',        emoji: '🐟', days: 2,   location: 'fridge', price: 9.00, weight: '500g' },
  { ca: 'Tonyina', slug: 'tonyina',       en: 'Tuna', es: 'Atún', fr: 'Thon',        emoji: '🐟', days: 730, location: 'pantry', price: 2.50, weight: '3x80g' },
  { ca: 'Carn', slug: 'carn',          en: 'Meat', es: 'Carne', fr: 'Viande',        emoji: '🥩', days: 3,   location: 'fridge', price: 8.00, weight: '500g' },
  { ca: "Flocs d'avena", en: 'Oat flakes',  emoji: '🌾', days: 365, location: 'pantry', price: 1.80, weight: '500g' },
  { ca: 'Formatge feta', slug: 'formatge-feta', en: 'Feta cheese', es: 'Queso feta', fr: 'Feta', emoji: '🧀', days: 30,  location: 'fridge', price: 2.50, weight: '200g' },
  { ca: 'Fruits secs', slug: 'fruits-secs',   en: 'Nuts', es: 'Frutos secos', fr: 'Fruits secs',        emoji: '🥜', days: 180, location: 'pantry', price: 3.00, weight: '200g' },
  { ca: 'Pa torrat', slug: 'pa-torrat',     en: 'Toast', es: 'Pan tostado', fr: 'Pain grillé',       emoji: '🍞', days: 60,  location: 'pantry', price: 1.50, weight: '200g' },
  // Tipus de pasta com a productes propis (sense sinònim → 'pasta'; 10/06/2026)
  { ca: 'Macarrons', slug: 'macarrons',          en: 'Macaroni', es: 'Macarrones', fr: 'Macaronis',       emoji: '🍝', days: 730, location: 'pantry', price: 1.20, weight: '500g' },
  { ca: 'Fideus', slug: 'fideus',             en: 'Noodles', es: 'Fideos', fr: 'Vermicelles',        emoji: '🍝', days: 730, location: 'pantry', price: 1.20, weight: '500g' },
  { ca: 'Plaques de lasanya', slug: 'plaques-de-lasanya', en: 'Lasagna sheets', es: 'Placas de lasaña', fr: 'Feuilles de lasagne', emoji: '🍝', days: 730, location: 'pantry', price: 1.50, weight: '500g' },
  // ⚠️ Entrades noves SEMPRE al FINAL, mai inserides al mig ni agrupades per
  //    categoria. El popularId desat als rebosts dels usuaris és 'pop-N' = la
  //    POSICIÓ d'array; inserir una entrada al mig desplaçaria tots els pop-N ja
  //    desats i passarien a apuntar al producte del costat. Per això aquestes
  //    van aquí encara que trenqui l'agrupació per categories del fitxer.
  //    (Ingredients de recepta que abans no resolien al catàleg — Pas 4.)
  { ca: 'Massa d\'empanada', slug: 'massa-d-empanada', en: 'Empanada pastry', es: 'Masa de empanada', fr: 'Pâte à empanada', emoji: '🥟', days: 14, location: 'fridge', price: 2.00, weight: '2u' },
  { ca: 'Pa d\'hamburguesa', slug: 'pa-d-hamburguesa', en: 'Burger bun', es: 'Pan de hamburguesa', fr: 'Pain à burger', emoji: '🍞', days: 7, location: 'pantry', price: 1.50, weight: '4u' }
];

// ============================================
//   Normalització / stem / tokens canònics — COMPARTITS
//   Extrets de cookme.js perquè populars.js (buildPopularNameIndex, carregat
//   ABANS de cookme.js) i cookme.js comparteixin la MATEIXA tokenització.
//   NO duplicar: definits aquí, usats a tot arreu.
// ============================================
// Normalitza un text: minúscules + sense accents + sense espais finals.
function cookmeNormalize(s) {
  return (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}
// Mapa de sinònims (token normalitzat → token canònic). Buit a propòsit:
// cada tipus de pasta és un producte propi. Es manté per al lookup `[tk] || tk`.
const COOKME_INGREDIENT_SYNONYMS = {};
// Stopwords que no aporten identitat a un nom d'ingredient/producte. Cobreixen
// els 4 idiomes de l'app (ca/es/en/fr) perquè l'índex tokenitza noms en tots 4:
// sense les no-catalanes, articles/connectors com 'and','of','du','los' s'hi
// colaven com a token feble (Plats i gots → 'and'/'et'). Les de longitud 1
// ('a','e','y','à'→'a') ja cauen pel filtre length>=2; s'inclouen per claredat.
const COOKME_STOPWORDS = new Set([
  // Català
  'de','d','del','dels','la','el','els','l','amb','al','als','a','i','per','en','o','un','una','gust',
  // Castellà
  'y','con','e','lo','los','las',
  // Anglès
  'and','or','the','of','with',
  // Francès
  'et','ou','du','des','aux','une',
  // Italià (pot arribar via ingredients/sinònims)
  'il'
]);
// Marca de compost qualificat ("llet de coco", "oli d'oliva"): conté connectiu.
const COOKME_CONNECTIVE = /\b(?:de|d|amb)\b/;
// Plega singular↔plural català al seu "stem" (ceba/cebes→ceb, poma/pomes→pom,
// ous/ou→ou). NO col·lisiona pa≠pasta, oli≠olives, mel≠melmelada.
function cookmeStem(tok) {
  let t = tok;
  if (t.length >= 4 && t.endsWith('es')) t = t.slice(0, -2);
  else if (t.length >= 3 && t.endsWith('s')) t = t.slice(0, -1);
  if (t.length >= 3 && t.endsWith('a')) t = t.slice(0, -1);
  return t.replace(/gu$/, 'g').replace(/qu$/, 'c').replace(/j$/, 'g');
}
// Tokens canònics d'un nom: normalitza, parteix per no-alfanumèric, descarta
// tokens curts (<2) i stopwords, aplica sinònims i el stem de plural.
function cookmeCanonTokens(name) {
  return cookmeNormalize(name)
    .split(/[^a-z0-9]+/)
    .filter(tk => tk.length >= 2 && !COOKME_STOPWORDS.has(tk))
    .map(tk => COOKME_INGREDIENT_SYNONYMS[tk] || tk)
    .map(cookmeStem);
}
// Nucli d'un compost QUALIFICAT amb connectiu (nucli + de/d'/amb + qualificador):
// els tokens ABANS del primer connectiu. "Oli d'oliva"→['oli'], "Plaques de
// lasanya"→['plac'], "Suc de taronja"→['suc']. Si el nom NO té connectiu (és
// nom + adjectiu: "Crema catalana", "Peix fresc", "Salsa romesco") torna []
// —no volem que l'adjectiu ni el nom sol es registrin com a clau feble i
// capturin un producte que no toca. Mateix filtre/stem que cookmeCanonTokens.
function cookmeNucleusTokens(name) {
  const n = cookmeNormalize(name);
  if (!COOKME_CONNECTIVE.test(n)) return [];
  const out = [];
  const parts = n.split(/[^a-z0-9]+/);
  for (let i = 0; i < parts.length; i++) {
    const w = parts[i];
    if (!w) continue;
    if (w === 'de' || w === 'd' || w === 'amb') break;   // primer connectiu → tall
    out.push(w);
  }
  return out
    .filter(tk => tk.length >= 2 && !COOKME_STOPWORDS.has(tk))
    .map(tk => COOKME_INGREDIENT_SYNONYMS[tk] || tk)
    .map(cookmeStem);
}

// Catàleg d'emojis organitzat per categoria. Es fa servir tant per l'EMOJI
// picker (tabs de categoria) com per al cercador.
const EMOJI_CATEGORIES = [
  { id: 'fruits', label: 'Fruita', emojis: [
    '🍎','🍏','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🥑'
  ]},
  { id: 'veggies', label: 'Verdura', emojis: [
    '🥬','🥦','🥒','🌽','🥕','🌶️','🫑','🍆','🧄','🧅','🥔','🍠','🥜','🌰','🫛','🫘'
  ]},
  { id: 'bread', label: 'Pa i cereals', emojis: [
    '🍞','🥖','🥐','🫓','🥨','🥯','🧇','🥞','🍝','🍜','🍲','🍛','🍱','🥣','🥡','🍚'
  ]},
  { id: 'meat', label: 'Carn', emojis: [
    '🥩','🍗','🍖','🌭','🥓','🍔','🌮','🌯','🥙','🧆'
  ]},
  { id: 'fish', label: 'Peix', emojis: [
    '🐟','🐠','🍣','🍤','🦐','🦑','🦞','🦀','🥫'
  ]},
  { id: 'dairy', label: 'Lactis', emojis: [
    '🥛','🧀','🥚','🧈','🍦'
  ]},
  { id: 'desserts', label: 'Dolços', emojis: [
    '🧁','🍰','🎂','🍫','🍬','🍭','🍮','🍯','🍪','🥧','🍩','🍨','🍧','🍡'
  ]},
  { id: 'drinks', label: 'Begudes', emojis: [
    '💧','🧃','🥤','🍵','☕','🍺','🍻','🥂','🍷','🍸','🍹','🍾','🧋'
  ]},
  { id: 'meals', label: 'Plats', emojis: [
    '🍕','🥗','🥪','🌭','🍳','🥘','🍿','🧂'
  ]},
  { id: 'medicine', label: 'Farmàcia', emojis: [
    '💊','💉','🩹','🩺','🧴','🧼','🧻','🪥'
  ]},
  { id: 'other', label: 'Altres', emojis: [
    '🎂','🎈','🎁','🌱','🌿','🪴','🥢','🍴'
  ]}
];

// Llista plana usada per APIs antigues que esperaven una array d'emojis.
// Deduplica preservant ordre per categoria.
const EMOJIS = (() => {
  const seen = new Set();
  const out = [];
  EMOJI_CATEGORIES.forEach(cat => cat.emojis.forEach(e => {
    if (!seen.has(e)) { seen.add(e); out.push(e); }
  }));
  return out;
})();

// Noms en català per cercar emojis al picker. La cerca és case-insensitive
// i match per substring, així "po" troba "poma" i "porc" alhora.
const EMOJI_NAMES_CA = {
  '🍎': ['poma', 'fruita'], '🍏': ['poma verda', 'fruita'],
  '🍐': ['pera', 'fruita'], '🍊': ['taronja', 'mandarina', 'fruita'],
  '🍋': ['llimona', 'fruita'], '🍌': ['plàtan', 'platano', 'banana', 'fruita'],
  '🍉': ['síndria', 'sandia', 'fruita'], '🍇': ['raïm', 'uva', 'fruita'],
  '🍓': ['maduixa', 'fresa', 'fruita'], '🫐': ['nabius', 'arandanos', 'fruita'],
  '🍈': ['meló', 'melon', 'fruita'], '🍒': ['cirera', 'cereza', 'fruita'],
  '🍑': ['préssec', 'melocoton', 'fruita'], '🥭': ['mango', 'fruita'],
  '🍍': ['pinya', 'piña', 'fruita'], '🥥': ['coco', 'fruita'],
  '🥝': ['kiwi', 'fruita'], '🍅': ['tomàquet', 'tomate', 'verdura'],
  '🥑': ['alvocat', 'aguacate', 'verdura'],
  '🥬': ['enciam', 'lechuga', 'col', 'verdura'], '🥦': ['bròquil', 'brocoli', 'verdura'],
  '🥒': ['cogombre', 'pepino', 'verdura'], '🌽': ['blat de moro', 'maíz', 'panotxa', 'verdura'],
  '🥕': ['pastanaga', 'zanahoria', 'verdura'], '🌶️': ['bitxo', 'pebrot picant', 'chile'],
  '🫑': ['pebrot', 'pimiento', 'verdura'], '🍆': ['albergínia', 'berenjena', 'verdura'],
  '🧄': ['all', 'ajo'], '🧅': ['ceba', 'cebolla', 'verdura'],
  '🥔': ['patata', 'verdura'], '🍠': ['moniato', 'boniato', 'batata'],
  '🥜': ['cacauet', 'cacahuete', 'fruita seca'], '🌰': ['castanya', 'castaña', 'fruita seca'],
  '🫛': ['pèsols', 'guisantes', 'verdura'], '🫘': ['mongetes', 'judías', 'llegum'],
  '🍞': ['pa de motlle', 'pa', 'bread'], '🥖': ['pa', 'barra', 'bread', 'baguette'],
  '🥐': ['croissant', 'pa'], '🫓': ['pa pla', 'pita'],
  '🥨': ['pretzel', 'pa'], '🥯': ['bagel', 'pa'],
  '🧇': ['gofre', 'waffle'], '🥞': ['crepe', 'pancake'],
  '🍝': ['pasta', 'espagueti'], '🍜': ['fideus', 'noodles', 'sopa'],
  '🍲': ['estofat', 'guisat', 'sopa'], '🍛': ['curry', 'arròs amb'],
  '🍱': ['bento', 'menú'], '🥣': ['cereal', 'bol'],
  '🥡': ['take away', 'menjar per emportar'], '🍚': ['arròs', 'arroz'],
  '🥩': ['carn', 'filet', 'bistec'], '🍗': ['pollastre', 'pollo', 'cuixa'],
  '🍖': ['carn', 'os', 'costella'], '🌭': ['salsitxa', 'frankfurt'],
  '🥓': ['bacó', 'bacon', 'cansalada'], '🍔': ['hamburguesa'],
  '🌮': ['taco'], '🌯': ['burrito'],
  '🥙': ['kebab', 'pita'], '🧆': ['mandonguilla', 'falafel'],
  '🐟': ['peix', 'pescado'], '🐠': ['peix tropical'],
  '🍣': ['sushi'], '🍤': ['gamba', 'tempura'],
  '🦐': ['gamba', 'llagostí', 'shrimp'], '🦑': ['calamar'],
  '🦞': ['llagosta'], '🦀': ['cranc'],
  '🥫': ['conserva', 'lata', 'tonyina', 'sardina'],
  '🥛': ['llet', 'leche', 'lacti'], '🧀': ['formatge', 'queso'],
  '🥚': ['ou', 'huevo'], '🧈': ['mantega', 'mantequilla'],
  '🍦': ['gelat', 'helado', 'postres'],
  '🧁': ['magdalena', 'cupcake'], '🍰': ['pastís', 'tarta'],
  '🎂': ['pastís aniversari', 'tarta'], '🍫': ['xocolata', 'chocolate'],
  '🍬': ['caramel', 'caramelo'], '🍭': ['piruleta'],
  '🍮': ['flam', 'flan'], '🍯': ['mel', 'miel'],
  '🍪': ['galeta', 'galleta', 'cookie'], '🥧': ['pastís', 'pie'],
  '🍩': ['donut'], '🍨': ['gelat', 'banana split'],
  '🍧': ['granissat'], '🍡': ['dango', 'dolç japonès'],
  '💧': ['aigua', 'agua', 'water'], '🧃': ['suc', 'zumo', 'juice'],
  '🥤': ['refresc', 'beguda'], '🍵': ['te', 'té', 'tea'],
  '☕': ['cafè', 'café', 'coffee'], '🍺': ['cervesa', 'cerveza'],
  '🍻': ['cerveses', 'brindis'], '🥂': ['cava', 'champagne', 'brindis'],
  '🍷': ['vi', 'vino', 'wine'], '🍸': ['còctel'],
  '🍹': ['còctel tropical'], '🍾': ['cava', 'champagne'],
  '🧋': ['bubble tea'],
  '🍕': ['pizza'], '🥗': ['amanida', 'ensalada', 'salad'],
  '🥪': ['entrepà', 'sandwich', 'bocadillo'],
  '🍳': ['ous', 'fregit'], '🥘': ['paella'],
  '🍿': ['crispetes', 'palomitas'], '🧂': ['sal', 'salt'],
  '💊': ['pastilla', 'medicina', 'medicament'],
  '💉': ['injecció', 'vacuna'], '🩹': ['tirita', 'apósit'],
  '🩺': ['estetoscopi', 'salut'], '🧴': ['xampú', 'crema'],
  '🧼': ['sabó', 'jabón'], '🧻': ['paper higiènic'],
  '🪥': ['raspall dents', 'cepillo'],
  '🎈': ['globus'], '🎁': ['regal', 'paquet'],
  '🌱': ['planta', 'brot'], '🌿': ['herba', 'planta'],
  '🪴': ['planta'], '🥢': ['palets', 'palillos'],
  '🍴': ['coberts', 'cubiertos', 'forquilla']
};

// Cerca emojis pel nom (substring case-insensitive). Retorna array d'emojis.
function searchEmojiByName(query) {
  // Cerca insensible a accents/majúscules via helper compartit
  // (window.normalizeForSearch a biteme.js). Fallback defensiu per
  // si core.js es carregués abans de biteme.js en algun escenari.
  const norm = (typeof window.normalizeForSearch === 'function')
    ? window.normalizeForSearch
    : (s => String(s || '').toLowerCase().trim());
  const q = norm(query);
  if (!q) return EMOJIS.slice();
  const out = [];
  EMOJIS.forEach(e => {
    const names = EMOJI_NAMES_CA[e];
    if (!names) return;
    if (names.some(n => norm(n).includes(q))) out.push(e);
  });
  return out;
}

// Suggereix emoji segons categoria del producte
// Buscar primer les paraules més específiques (chocolate-spread abans que spread)
const CATEGORY_TO_EMOJI = {
  // Cremes per untar (Nutella, etc.) — abans que res!
  'hazelnut-spread': '🍫', 'chocolate-spread': '🍫',
  'sweet-spread': '🍫', 'spread': '🍫',
  'cocoa': '🍫',
  // Làctics
  'milk': '🥛', 'dairy': '🥛', 'yogurt': '🥛', 'yoghurt': '🥛',
  'cheese': '🧀',
  'egg': '🥚',
  // Carn
  'meat': '🥩', 'beef': '🥩', 'pork': '🥩',
  'chicken': '🍗', 'poultry': '🍗',
  'bacon': '🥓',
  'sausage': '🌭',
  // Peix
  'fish': '🐟', 'seafood': '🐟', 'tuna': '🥫', 'sardine': '🥫',
  'shrimp': '🦐',
  // Conserves i envasats
  'canned': '🥫', 'conserve': '🥫', 'preserved': '🥫',
  // Pasta i arròs
  'pasta': '🍝', 'noodle': '🍜',
  'rice': '🍚', 'cereal': '🥣', 'flour': '🌾', 'sugar': '🍬',
  // Forn
  'bread': '🍞', 'baguette': '🥖',
  'croissant': '🥐',
  'butter': '🧈',
  'biscuit': '🍪', 'cookie': '🍪',
  'cake': '🍰',
  // Verdures
  'salad': '🥗', 'lettuce': '🥬',
  'cucumber': '🥒',
  'tomato': '🍅',
  'carrot': '🥕',
  'corn': '🌽',
  'potato': '🥔',
  'onion': '🧅',
  // Fruites
  'apple': '🍎',
  'banana': '🍌',
  'strawberr': '🍓',
  'grape': '🍇',
  'orange': '🍊',
  'lemon': '🍋',
  'pineapple': '🍍',
  'watermelon': '🍉',
  // Plats preparats
  'pizza': '🍕',
  'burger': '🍔',
  'sushi': '🍣',
  // Dolços
  'chocolate': '🍫',
  'candy': '🍬', 'sweet': '🍬',
  'ice-cream': '🍦', 'ice cream': '🍦',
  'honey': '🍯',
  'jam': '🍯', 'marmalade': '🍯',
  // Begudes
  'coffee': '☕', 'tea': '☕',
  'juice': '🧃', 'soda': '🥤',
  'beer': '🍺', 'wine': '🍷', 'water': '💧',
  // Olis i salses
  'olive-oil': '🫒', 'oil': '🫒', 'vinegar': '🫗',
  'sauce': '🥫', 'ketchup': '🍅', 'mayonnaise': '🥚', 'mustard': '🟡'
};

// Dies de caducitat per defecte (suposem producte TANCAT)
// Es busquen TOTS els matches i s'agafa el màxim
const CATEGORY_DEFAULT_DAYS = {
  // Cremes per untar tancades duren mesos
  'hazelnut-spread': 90, 'chocolate-spread': 90,
  'sweet-spread': 90, 'spread': 90,
  'cocoa': 180,
  // Làctics
  'milk': 7, 'dairy': 7,
  'yogurt': 21, 'yoghurt': 21,
  'cheese': 30,
  'butter': 60,
  'egg': 28,
  // Carn fresca
  'fresh-meat': 3, 'meat': 3, 'beef': 3, 'pork': 3,
  'chicken': 2, 'poultry': 2,
  'bacon': 14, 'sausage': 7,
  // Peix
  'fresh-fish': 2, 'fish': 2, 'seafood': 2,
  // Conserves: mesos a anys
  'canned': 730, 'canned-foods': 730,
  'conserve': 730, 'preserved': 365,
  'tuna': 730, 'sardine': 730,
  // Sec - duren molt
  'pasta': 365, 'noodle': 365,
  'rice': 365, 'cereal': 180, 'flour': 180, 'sugar': 730,
  // Forn (fresc dura poc)
  'bread': 4, 'baguette': 2, 'croissant': 4,
  'biscuit': 180, 'cookie': 180,
  'cake': 5,
  // Verdures fresques
  'salad': 5, 'lettuce': 7,
  'cucumber': 10, 'tomato': 7,
  'carrot': 21, 'corn': 5,
  'potato': 30, 'onion': 30,
  // Fruites
  'fruit': 7,
  'apple': 21, 'banana': 5, 'strawberr': 3,
  'grape': 7, 'orange': 14, 'lemon': 21,
  'pineapple': 5, 'watermelon': 7,
  // Plats preparats (fresc)
  'pizza': 3, 'burger': 2, 'sushi': 1,
  // Dolços (tancats duren molt)
  'chocolate': 365, 'candy': 365, 'sweet': 365,
  'ice-cream': 180, 'ice cream': 180,
  'honey': 730, 'jam': 365, 'marmalade': 365,
  // Begudes tancades
  'coffee': 365, 'tea': 730,
  'juice': 60, 'soda': 270,
  'beer': 180, 'wine': 1825, 'water': 730,
  // Olis i salses
  'olive-oil': 730, 'oil': 730, 'vinegar': 1825,
  'sauce': 180, 'ketchup': 180, 'mayonnaise': 90, 'mustard': 365
};

// SUPERMERCATS PER PAÍS
// Cada supermercat té id únic, nom i emoji
// Els 4 primers de cada país són els que es marquen automàticament el primer cop
const SUPERMARKETS_BY_COUNTRY = {
  ES: [
    { id: 'sm-mercadona', name: 'Mercadona', emoji: '🛒' },
    { id: 'sm-carrefour', name: 'Carrefour', emoji: '🛒' },
    { id: 'sm-lidl', name: 'Lidl', emoji: '🛍️' },
    { id: 'sm-dia', name: 'Dia', emoji: '🛒' },
    { id: 'sm-caprabo', name: 'Caprabo', emoji: '🛍️' },
    { id: 'sm-esclat', name: 'Esclat', emoji: '🛍️' },
    { id: 'sm-bonpreu', name: 'Bonpreu', emoji: '🛒' },
    { id: 'sm-aldi', name: 'Aldi', emoji: '🛒' },
    { id: 'sm-eroski', name: 'Eroski', emoji: '🏪' },
    { id: 'sm-consum', name: 'Consum', emoji: '🛍️' },
    { id: 'sm-alcampo', name: 'Alcampo', emoji: '🏬' }
  ],
  FR: [
    { id: 'sm-fr-carrefour', name: 'Carrefour', emoji: '🛒' },
    { id: 'sm-fr-leclerc', name: 'E.Leclerc', emoji: '🛒' },
    { id: 'sm-fr-auchan', name: 'Auchan', emoji: '🏬' },
    { id: 'sm-fr-intermarche', name: 'Intermarché', emoji: '🛍️' },
    { id: 'sm-fr-casino', name: 'Casino', emoji: '🛍️' },
    { id: 'sm-fr-monoprix', name: 'Monoprix', emoji: '🛒' },
    { id: 'sm-fr-lidl', name: 'Lidl', emoji: '🛍️' },
    { id: 'sm-fr-aldi', name: 'Aldi', emoji: '🛒' },
    { id: 'sm-fr-super-u', name: 'Super U', emoji: '🛒' },
    { id: 'sm-fr-franprix', name: 'Franprix', emoji: '🏪' }
  ],
  IT: [
    { id: 'sm-it-esselunga', name: 'Esselunga', emoji: '🛒' },
    { id: 'sm-it-coop', name: 'Coop', emoji: '🛒' },
    { id: 'sm-it-conad', name: 'Conad', emoji: '🛍️' },
    { id: 'sm-it-carrefour', name: 'Carrefour', emoji: '🛒' },
    { id: 'sm-it-lidl', name: 'Lidl', emoji: '🛍️' },
    { id: 'sm-it-eurospin', name: 'Eurospin', emoji: '🛒' },
    { id: 'sm-it-pam', name: 'Pam', emoji: '🏪' },
    { id: 'sm-it-md', name: 'MD', emoji: '🛍️' },
    { id: 'sm-it-iper', name: 'Iper', emoji: '🏬' }
  ],
  DE: [
    { id: 'sm-de-edeka', name: 'Edeka', emoji: '🛒' },
    { id: 'sm-de-rewe', name: 'Rewe', emoji: '🛒' },
    { id: 'sm-de-aldi', name: 'Aldi', emoji: '🛒' },
    { id: 'sm-de-lidl', name: 'Lidl', emoji: '🛍️' },
    { id: 'sm-de-kaufland', name: 'Kaufland', emoji: '🏬' },
    { id: 'sm-de-penny', name: 'Penny', emoji: '🛍️' },
    { id: 'sm-de-netto', name: 'Netto', emoji: '🛒' },
    { id: 'sm-de-real', name: 'Real', emoji: '🏬' },
    { id: 'sm-de-norma', name: 'Norma', emoji: '🛍️' }
  ],
  PT: [
    { id: 'sm-pt-continente', name: 'Continente', emoji: '🛒' },
    { id: 'sm-pt-pingo-doce', name: 'Pingo Doce', emoji: '🛒' },
    { id: 'sm-pt-lidl', name: 'Lidl', emoji: '🛍️' },
    { id: 'sm-pt-auchan', name: 'Auchan', emoji: '🏬' },
    { id: 'sm-pt-intermarche', name: 'Intermarché', emoji: '🛍️' },
    { id: 'sm-pt-mini-preco', name: 'Minipreço', emoji: '🛒' },
    { id: 'sm-pt-aldi', name: 'Aldi', emoji: '🛒' },
    { id: 'sm-pt-froiz', name: 'Froiz', emoji: '🏪' }
  ],
  NL: [
    { id: 'sm-nl-albert-heijn', name: 'Albert Heijn', emoji: '🛒' },
    { id: 'sm-nl-jumbo', name: 'Jumbo', emoji: '🛒' },
    { id: 'sm-nl-lidl', name: 'Lidl', emoji: '🛍️' },
    { id: 'sm-nl-aldi', name: 'Aldi', emoji: '🛒' },
    { id: 'sm-nl-plus', name: 'Plus', emoji: '🛍️' },
    { id: 'sm-nl-dirk', name: 'Dirk', emoji: '🛒' },
    { id: 'sm-nl-coop', name: 'Coop', emoji: '🏪' }
  ],
  GB: [
    { id: 'sm-gb-tesco', name: 'Tesco', emoji: '🛒' },
    { id: 'sm-gb-sainsburys', name: "Sainsbury's", emoji: '🛒' },
    { id: 'sm-gb-asda', name: 'ASDA', emoji: '🛒' },
    { id: 'sm-gb-morrisons', name: 'Morrisons', emoji: '🛍️' },
    { id: 'sm-gb-aldi', name: 'Aldi', emoji: '🛒' },
    { id: 'sm-gb-lidl', name: 'Lidl', emoji: '🛍️' },
    { id: 'sm-gb-waitrose', name: 'Waitrose', emoji: '🏬' },
    { id: 'sm-gb-coop', name: 'Co-op', emoji: '🏪' },
    { id: 'sm-gb-iceland', name: 'Iceland', emoji: '❄️' },
    { id: 'sm-gb-mns', name: 'M&S', emoji: '🛍️' }
  ],
  US: [
    { id: 'sm-us-walmart', name: 'Walmart', emoji: '🛒' },
    { id: 'sm-us-target', name: 'Target', emoji: '🎯' },
    { id: 'sm-us-kroger', name: 'Kroger', emoji: '🛒' },
    { id: 'sm-us-costco', name: 'Costco', emoji: '🏬' },
    { id: 'sm-us-aldi', name: 'Aldi', emoji: '🛒' },
    { id: 'sm-us-trader-joes', name: "Trader Joe's", emoji: '🛍️' },
    { id: 'sm-us-whole-foods', name: 'Whole Foods', emoji: '🥬' },
    { id: 'sm-us-publix', name: 'Publix', emoji: '🛒' },
    { id: 'sm-us-safeway', name: 'Safeway', emoji: '🛒' },
    { id: 'sm-us-wegmans', name: 'Wegmans', emoji: '🏪' }
  ],
  JP: [
    { id: 'sm-jp-aeon', name: 'イオン (Aeon)', emoji: '🛒' },
    { id: 'sm-jp-seiyu', name: '西友 (Seiyu)', emoji: '🛒' },
    { id: 'sm-jp-life', name: 'ライフ (Life)', emoji: '🛍️' },
    { id: 'sm-jp-ito-yokado', name: 'イトーヨーカドー', emoji: '🏬' },
    { id: 'sm-jp-summit', name: 'サミット', emoji: '🛒' },
    { id: 'sm-jp-maruetsu', name: 'マルエツ', emoji: '🏪' },
    { id: 'sm-jp-don-quijote', name: 'ドン・キホーテ', emoji: '🛍️' }
  ],
  CN: [
    { id: 'sm-cn-yonghui', name: '永辉 (Yonghui)', emoji: '🛒' },
    { id: 'sm-cn-rt-mart', name: '大润发 (RT-Mart)', emoji: '🏬' },
    { id: 'sm-cn-walmart', name: '沃尔玛 (Walmart)', emoji: '🛒' },
    { id: 'sm-cn-carrefour', name: '家乐福 (Carrefour)', emoji: '🛒' },
    { id: 'sm-cn-hema', name: '盒马 (Hema)', emoji: '🛍️' },
    { id: 'sm-cn-vanguard', name: '华润万家', emoji: '🏬' },
    { id: 'sm-cn-aldi', name: '奥乐齐 (Aldi)', emoji: '🛒' }
  ],
  KR: [
    { id: 'sm-kr-emart', name: '이마트 (E-Mart)', emoji: '🛒' },
    { id: 'sm-kr-homeplus', name: '홈플러스 (Homeplus)', emoji: '🛒' },
    { id: 'sm-kr-lotte', name: '롯데마트 (Lotte Mart)', emoji: '🏬' },
    { id: 'sm-kr-costco', name: '코스트코 (Costco)', emoji: '🏬' },
    { id: 'sm-kr-gs', name: 'GS25', emoji: '🏪' },
    { id: 'sm-kr-cu', name: 'CU', emoji: '🏪' }
  ]
};

// Llista de països disponibles
const COUNTRIES = [
  { code: 'ES', flag: '🇪🇸', nameKey: 'countryES' },
  { code: 'FR', flag: '🇫🇷', nameKey: 'countryFR' },
  { code: 'IT', flag: '🇮🇹', nameKey: 'countryIT' },
  { code: 'DE', flag: '🇩🇪', nameKey: 'countryDE' },
  { code: 'PT', flag: '🇵🇹', nameKey: 'countryPT' },
  { code: 'NL', flag: '🇳🇱', nameKey: 'countryNL' },
  { code: 'GB', flag: '🇬🇧', nameKey: 'countryGB' },
  { code: 'US', flag: '🇺🇸', nameKey: 'countryUS' },
  { code: 'JP', flag: '🇯🇵', nameKey: 'countryJP' },
  { code: 'CN', flag: '🇨🇳', nameKey: 'countryCN' },
  { code: 'KR', flag: '🇰🇷', nameKey: 'countryKR' }
];

const SUPERMARKET_EMOJIS = ['🛒','🛍️','🏪','🥖','🥬','🍎','🧺','💰','🏬','🎯','❄️','🥩','🐟','💊','🍞','🧀','🥛','🍷','🍕','🥗','🥦','🍰','☕','🛒','🎁','📦','🎈','🌽','🍌','🍓','🥕','🌶️','🥑','🌭','🍔','🍟','🍪','🍫','🥤','🍶','🥫','🥟','🍱','🍣','🥨','🌮','🍝','🍳','🍯','🧈','🍿','🥜','🥥','🍇','🥝','🍒','🥒','🍆','🍑','🍊','🍋','🥭','🥖','🍩','🥯','🌰','🍵','🥃','🍻','🥂','🧃','🛸','📱','🧴','🧼','🧹','🧻','🪣','🛁','🧪','💉','🩹','🌿'];

// Subset curat d'emojis per a ubicacions (zones d'emmagatzematge).
// Usat per openEmojiPicker amb target='location' (vegeu biteme.js).
// Inclou contenidors (🥫🗄️📦), àrees domèstiques (🏠🚪🪟), tipus
// d'aliments per zona (🍞🥖🍫🍯), botigues (🏪🛒), i opcions diverses
// (🌿💼🚗🎒). El mateix subset que tenia la funció obsoleta
// renderLocationEmojiPicker a settings.js.
const LOCATION_EMOJIS = ['🧊','❄️','🥫','🍎','🏠','🍽️','🥤','🍷','🍞','🌶️','🚪','🏪','🛒','📦','🗄️','🪟','🌿','🥖','🍯','🍫','📍','🎒','💼','🚗'];

// UBICACIONS PER DEFECTE
// Cada ubicació pertany a una de 3 categories fixes:
//  - 'fridge': nevera (productes refrigerats frescos)
//  - 'freezer': congelador (productes congelats)
//  - 'pantry': rebost (temperatura ambient)
const DEFAULT_LOCATIONS = [
  { id: 'fridge', emoji: '🧊', nameKey: 'locFridge', category: 'fridge' },
  { id: 'freezer', emoji: '❄️', nameKey: 'locFreezer', category: 'freezer' },
  { id: 'pantry', emoji: '🥫', nameKey: 'locPantry', category: 'pantry' },
  { id: 'fruit_bowl', emoji: '🍎', nameKey: 'locFruitBowl', category: 'pantry' },
  { id: 'counter', emoji: '🏠', nameKey: 'locCounter', category: 'pantry' },
  { id: 'medicine', emoji: '💊', nameKey: 'locMedicine', category: 'pantry' }
];

// ESCALES D'ALERTES per categoria (en dies)
// Quan es passa per sota d'aquests valors, salta el nivell d'alerta
const ALERT_SCALES = {
  fridge: {
    green: 5,    // > 5 dies: tranquil
    yellow: 3,   // 3-5 dies: atenció
    orange: 1    // 1-2 dies: urgent
    // < 1 dia: vermell (alerta!)
  },
  freezer: {
    green: 60,   // > 60 dies (2+ mesos): tranquil
    yellow: 30,  // 30-60 dies (1-2 mesos): atenció
    orange: 8    // 8-29 dies (~2-4 setmanes): urgent
    // < 8 dies (última setmana): vermell
  },
  pantry: {
    green: 30,   // > 30 dies: tranquil
    yellow: 14,  // 14-30 dies: atenció
    orange: 3    // 3-13 dies: urgent
    // < 3 dies: vermell
  }
};

// Temps recomanat de CONGELACIÓ per categoria (en dies)
// Basat en recomanacions FDA/USDA/AESAN
const FREEZER_DAYS = {
  // Carn
  'fresh-meat': 240, 'meat': 240, 'beef': 240, 'pork': 180,
  'ground-meat': 120, 'minced': 120,
  'chicken': 270, 'poultry': 270,
  'bacon': 30, 'sausage': 60,
  'ham': 60,
  // Peix
  'fresh-fish': 90, 'fish': 90, 'lean-fish': 180,
  'fatty-fish': 90, 'salmon': 90,
  'seafood': 90, 'shrimp': 180,
  // Làctics (no tot es congela bé!)
  'milk': 90, 'butter': 270, 'cheese': 180,
  // Pa i bolleria
  'bread': 90, 'baguette': 60, 'croissant': 60, 'cake': 90,
  // Fruites i verdures (millor blanquejades)
  'fruit': 240, 'berries': 270, 'strawberr': 270,
  'banana': 90, 'apple': 240,
  'vegetable': 240, 'green-bean': 240, 'pea': 240,
  'broccoli': 240, 'spinach': 240,
  'corn': 240,
  // Plats preparats
  'soup': 90, 'stew': 90, 'sauce': 180,
  'pizza': 60, 'pasta-meal': 60, 'lasagna': 90,
  // Gelats i postres congelats
  'ice-cream': 60, 'ice cream': 60,
  // Conserves: NO es congelen normalment, però per si de cas
  'canned': 365
};

// Botigues bàsiques (les mateixes per a tots els països)
const BASIC_SHOPS = [
  { id: 'sm-shop-butcher', nameKey: 'shopButcher', emoji: '🥩' },
  { id: 'sm-shop-fishmonger', nameKey: 'shopFishmonger', emoji: '🐟' },
  { id: 'sm-shop-greengrocer', nameKey: 'shopGreengrocer', emoji: '🥬' },
  { id: 'sm-shop-pharmacy', nameKey: 'shopPharmacy', emoji: '💊' },
  { id: 'sm-shop-bakery', nameKey: 'shopBakery', emoji: '🥖' }
];

// Banderes SVG per al picker de país (es veuen a tots els dispositius, inclòs Windows)
const COUNTRY_FLAG_SVG = {
  ES: '<svg viewBox="0 0 5 3" xmlns="http://www.w3.org/2000/svg"><rect width="5" height="3" fill="#AA151B"/><rect width="5" height="1.5" y="0.75" fill="#F1BF00"/></svg>',
  FR: '<svg viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg"><rect width="1" height="2" x="0" fill="#0055A4"/><rect width="1" height="2" x="1" fill="#fff"/><rect width="1" height="2" x="2" fill="#EF4135"/></svg>',
  IT: '<svg viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg"><rect width="1" height="2" x="0" fill="#009246"/><rect width="1" height="2" x="1" fill="#fff"/><rect width="1" height="2" x="2" fill="#CE2B37"/></svg>',
  DE: '<svg viewBox="0 0 5 3" xmlns="http://www.w3.org/2000/svg"><rect width="5" height="1" y="0" fill="#000"/><rect width="5" height="1" y="1" fill="#DD0000"/><rect width="5" height="1" y="2" fill="#FFCE00"/></svg>',
  PT: '<svg viewBox="0 0 6 4" xmlns="http://www.w3.org/2000/svg"><rect width="6" height="4" fill="#FF0000"/><rect width="2.4" height="4" fill="#006600"/><circle cx="2.4" cy="2" r="0.7" fill="#FFE500" stroke="#000" stroke-width="0.05"/><circle cx="2.4" cy="2" r="0.4" fill="#FF0000"/></svg>',
  NL: '<svg viewBox="0 0 9 6" xmlns="http://www.w3.org/2000/svg"><rect width="9" height="2" y="0" fill="#AE1C28"/><rect width="9" height="2" y="2" fill="#fff"/><rect width="9" height="2" y="4" fill="#21468B"/></svg>',
  GB: '<svg viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg"><clipPath id="t-gb"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath><path d="M0,0 v30 h60 v-30 z" fill="#012169"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 L60,30 M60,0 L0,30" clip-path="url(#t-gb)" stroke="#C8102E" stroke-width="4"/><path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/><path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6"/></svg>',
  US: '<svg viewBox="0 0 19 10" xmlns="http://www.w3.org/2000/svg"><rect width="19" height="10" fill="#FFFFFF"/><rect width="19" height="0.77" y="0" fill="#B22234"/><rect width="19" height="0.77" y="1.54" fill="#B22234"/><rect width="19" height="0.77" y="3.08" fill="#B22234"/><rect width="19" height="0.77" y="4.62" fill="#B22234"/><rect width="19" height="0.77" y="6.15" fill="#B22234"/><rect width="19" height="0.77" y="7.69" fill="#B22234"/><rect width="19" height="0.77" y="9.23" fill="#B22234"/><rect width="7.6" height="5.38" fill="#3C3B6E"/></svg>',
  JP: '<svg viewBox="0 0 9 6" xmlns="http://www.w3.org/2000/svg"><rect width="9" height="6" fill="#fff"/><circle cx="4.5" cy="3" r="1.8" fill="#BC002D"/></svg>',
  CN: '<svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg"><rect width="30" height="20" fill="#DE2910"/><polygon points="5,2 5.6,3.8 7.5,3.8 6,4.9 6.6,6.7 5,5.6 3.4,6.7 4,4.9 2.5,3.8 4.4,3.8" fill="#FFDE00"/><polygon points="10,1 10.2,1.6 10.8,1.6 10.3,2 10.5,2.6 10,2.2 9.5,2.6 9.7,2 9.2,1.6 9.8,1.6" fill="#FFDE00"/><polygon points="12,3 12.2,3.6 12.8,3.6 12.3,4 12.5,4.6 12,4.2 11.5,4.6 11.7,4 11.2,3.6 11.8,3.6" fill="#FFDE00"/><polygon points="12,6 12.2,6.6 12.8,6.6 12.3,7 12.5,7.6 12,7.2 11.5,7.6 11.7,7 11.2,6.6 11.8,6.6" fill="#FFDE00"/><polygon points="10,8 10.2,8.6 10.8,8.6 10.3,9 10.5,9.6 10,9.2 9.5,9.6 9.7,9 9.2,8.6 9.8,8.6" fill="#FFDE00"/></svg>',
  KR: '<svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg"><rect width="30" height="20" fill="#fff"/><g transform="translate(15,10) rotate(-56.31)"><circle r="4" fill="#fff" stroke="#000" stroke-width="0.05"/><path d="M-4,0 a4,4 0 0,1 8,0 a2,2 0 0,1 -4,0 a2,2 0 0,0 -4,0z" fill="#CD2E3A"/><path d="M-4,0 a4,4 0 0,0 8,0 a2,2 0 0,0 -4,0 a2,2 0 0,1 -4,0z" fill="#0047A0"/></g><g fill="#000" stroke="none"><g transform="translate(15,10) rotate(33.69) translate(7.5,0)"><rect x="-1.4" y="-0.4" width="2.8" height="0.5"/><rect x="-1.4" y="0.3" width="2.8" height="0.5"/><rect x="-1.4" y="-1.1" width="2.8" height="0.5"/></g><g transform="translate(15,10) rotate(33.69) translate(-7.5,0)"><rect x="-1.4" y="-1.1" width="2.8" height="0.5"/><rect x="-1.4" y="-0.4" width="1.2" height="0.5"/><rect x="0.2" y="-0.4" width="1.2" height="0.5"/><rect x="-1.4" y="0.3" width="1.2" height="0.5"/><rect x="0.2" y="0.3" width="1.2" height="0.5"/></g><g transform="translate(15,10) rotate(-33.69) translate(7.5,0)"><rect x="-1.4" y="-1.1" width="2.8" height="0.5"/><rect x="-1.4" y="-0.4" width="1.2" height="0.5"/><rect x="0.2" y="-0.4" width="1.2" height="0.5"/><rect x="-1.4" y="0.3" width="2.8" height="0.5"/></g><g transform="translate(15,10) rotate(-33.69) translate(-7.5,0)"><rect x="-1.4" y="-1.1" width="1.2" height="0.5"/><rect x="0.2" y="-1.1" width="1.2" height="0.5"/><rect x="-1.4" y="-0.4" width="1.2" height="0.5"/><rect x="0.2" y="-0.4" width="1.2" height="0.5"/><rect x="-1.4" y="0.3" width="1.2" height="0.5"/><rect x="0.2" y="0.3" width="1.2" height="0.5"/></g></g></svg>'
};

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

// Renderitza "nom + quantitat" amb separació visual neta (sense punt mig
// ni símbol ×). Si la qty és buida retorna només el nom escapat.
function formatProductLine(name, qty) {
  const safeName = escapeHtml(name);
  if (qty === null || qty === undefined || String(qty).trim() === '') return safeName;
  return safeName + '<span class="prod-qty">' + escapeHtml(String(qty).trim()) + '</span>';
}

// Converteix una string "YYYY-MM-DD" en un Date a midnight LOCAL (no UTC).
// `new Date("2026-06-03")` en canvi parseja com a UTC, cosa que en zones
// horàries com CET/CEST acaba causant errors d'1 dia en zones horàries
// diferents.
function parseDateLocal(str) {
  if (!str) return null;
  const m = String(str).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return new Date(str); // fallback per ISO completes
  return new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
}

// Formata un Date a "YYYY-MM-DD" usant la zona horària LOCAL.
// És el complement de parseDateLocal.
function formatDateLocal(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + dd;
}

// DIES
function daysUntil(dateStr) {
  if (!dateStr) return Infinity; // Sense data → mai caduca
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = parseDateLocal(dateStr);
  if (!target) return Infinity;
  target.setHours(0, 0, 0, 0);
  return Math.round((target - now) / 86400000);
}

function getLevel(days, category) {
  const cat = category || 'fridge';
  const scale = ALERT_SCALES[cat] || ALERT_SCALES.fridge;
  if (days <= 0) return 'red';
  if (days < scale.orange) return 'red';      // Sota el llindar taronja → vermell
  if (days < scale.yellow) return 'orange';   // Entre orange i yellow → taronja
  if (days < scale.green) return 'yellow';    // Entre yellow i green → groc
  return 'green';                              // Per sobre de green → verd
}

function daysText(days) {
  if (days === Infinity) return t('noExpiryShort');
  if (days < 0) return t('expiredDays', Math.abs(days));
  if (days === 0) return t('expiresToday');
  if (days === 1) return t('expiresTomorrow');
  return t('daysLeft', days);
}

// PANTALLES
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
  window.scrollTo(0, 0);

  // Aturar escàner si no som a la pantalla d'escaneig
  if (name !== 'scan') stopScanner();

  // Gamificació: registra la pantalla visitada i l'hora de l'acció
  if (typeof recordScreenVisit === 'function') recordScreenVisit(name);
  if (typeof recordHourTouch === 'function') recordHourTouch();

  // Engranatge del launcher: gira un cop quan s'entra a la pantalla inicial
  if (name === 'launcher') {
    // Guarda anti-flaix d'onboarding (index.html <head>): en mostrar el launcher,
    // treu SEMPRE la marca `pre-onboarding` de l'arrel, sigui quin sigui el camí
    // que hi arriba (finishWelcome, moure producte a un altre espai, acció de
    // notificació…). Si no, la regla inline `.pre-onboarding #screen-launcher
    // { display:none !important }` deixaria el launcher amagat tota la sessió.
    document.documentElement.classList.remove('pre-onboarding');
    const gear = document.querySelector('#launcher-menu-btn .gear-spin');
    if (gear) {
      gear.classList.remove('gear-spin-once');
      void gear.offsetWidth;
      gear.classList.add('gear-spin-once');
    }
    // Refresca els banners de notificacions intel·ligents
    if (typeof renderSmartNotifBanners === 'function') renderSmartNotifBanners();
  }
}

// Manté el nom legacy: és exactament el mateix que formatDateLocal.
function formatDateForInput(d) {
  return formatDateLocal(d);
}

// TOAST
let toastTimer = null;
function showToast(msg) {
  const tt = document.getElementById('toast');
  tt.textContent = msg;
  tt.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => tt.classList.remove('show'), 2000);
}
