/* ============================================
   Buyte — js/shops.js
   Mòdul de gestió de botigues: country picker, llista
   de supermercats per país, alta/edició/baixa de botigues,
   selecció des del benvingut.
   ============================================ */


function loadShoppingData() {
  // Carrega el país
  const savedCountry = localStorage.getItem('eatmefirst_country');
  if (savedCountry) currentCountry = savedCountry;

  // Supermercats
  const sm = localStorage.getItem('eatmefirst_supermarkets');
  if (sm) {
    try {
      supermarkets = JSON.parse(sm);
      // Migració: si els supermercats antics no tenen 'enabled', els marquem tots com a true
      let needsSave = false;
      const SHOP_NAME_KEYS = {
        'sm-shop-butcher': 'shopButcher',
        'sm-shop-fishmonger': 'shopFishmonger',
        'sm-shop-greengrocer': 'shopGreengrocer',
        'sm-shop-pharmacy': 'shopPharmacy',
        'sm-shop-bakery': 'shopBakery'
      };
      supermarkets.forEach(s => {
        if (typeof s.enabled === 'undefined') {
          s.enabled = true;
          needsSave = true;
        }
        // Migració: actualitzar nom de botigues bàsiques amb la traducció actual
        if (SHOP_NAME_KEYS[s.id]) {
          const correctName = t(SHOP_NAME_KEYS[s.id]);
          if (s.name !== correctName) {
            s.name = correctName;
            needsSave = true;
          }
        }
      });
      if (needsSave) saveShoppingData();
    } catch(e) { supermarkets = []; }
  } else {
    // Primer cop: si ja tenim país guardat (de la pantalla de benvinguda), inicialitzem
    // Si no tenim país, deixem la llista buida (la pantalla de benvinguda l'inicialitzarà)
    supermarkets = [];
  }

  // Items de la compra
  const items = localStorage.getItem('eatmefirst_shopping_items');
  if (items) {
    try { shoppingItems = JSON.parse(items); }
    catch(e) { shoppingItems = []; }
  } else {
    shoppingItems = [];
  }
}


function getBasicShops() {
  return BASIC_SHOPS.map(s => ({
    id: s.id,
    name: t(s.nameKey),
    emoji: s.emoji,
    enabled: false
  }));
}


function initSupermarketsForCountry(countryCode) {
  const list = SUPERMARKETS_BY_COUNTRY[countryCode] || SUPERMARKETS_BY_COUNTRY.ES;
  supermarkets = [
    ...list.map((sm, idx) => ({ ...sm, enabled: idx < 4 })),
    ...getBasicShops()
  ];
  currentCountry = countryCode;
  localStorage.setItem('eatmefirst_country', countryCode);
  saveShoppingData();
}


function changeCountry(countryCode) {
  const newList = SUPERMARKETS_BY_COUNTRY[countryCode] || SUPERMARKETS_BY_COUNTRY.ES;

  // Mantenim els supers personalitzats i les botigues bàsiques
  const customSupers = supermarkets.filter(s =>
    s.id.startsWith('sm-custom-') || s.id.startsWith('sm-shop-')
  );

  // També mantenim els supers que tenen productes pendents per comprar
  const supersWithItems = new Set(shoppingItems.map(it => it.supermarketId));
  const pendingSupers = supermarkets.filter(s =>
    supersWithItems.has(s.id) &&
    !s.id.startsWith('sm-custom-') &&
    !s.id.startsWith('sm-shop-') &&
    !newList.some(n => n.id === s.id)
  ).map(s => ({ ...s, enabled: true })); // sempre actius si tenen items

  // Botigues bàsiques que no existeixin encara
  const existingShopIds = new Set(customSupers.map(s => s.id));
  const missingBasicShops = getBasicShops().filter(s => !existingShopIds.has(s.id));

  supermarkets = [
    ...newList.map((sm, idx) => ({ ...sm, enabled: idx < 4 })),
    ...customSupers,
    ...missingBasicShops,
    ...pendingSupers
  ];

  currentCountry = countryCode;
  localStorage.setItem('eatmefirst_country', countryCode);
  saveShoppingData();
}

// Retorna només els supermercats actius (visibles a la llista de la compra)
function getEnabledSupermarkets() {
  return supermarkets.filter(s => s.enabled !== false);
}

// Retorna els supermercats que cal mostrar a la pantalla del BuyMe:
// els actius/preferits + qualsevol altre que tingui productes pendents.
function getBuyMeVisibleSupermarkets() {
  const enabled = getEnabledSupermarkets();
  const enabledIds = new Set(enabled.map(s => s.id));
  const withItems = supermarkets.filter(s => !enabledIds.has(s.id) && getShoppingItemsBySupermarket(s.id).length > 0);
  return enabled.concat(withItems);
}

function saveShoppingData() {
  localStorage.setItem('eatmefirst_supermarkets', JSON.stringify(supermarkets));
  localStorage.setItem('eatmefirst_shopping_items', JSON.stringify(shoppingItems));
  if (typeof pushToServer === 'function') pushToServer();
}

function getSupermarketById(id) {
  return supermarkets.find(s => s.id === id);
}

// ===== ONBOARDING EN 2 PASSOS: 1) idioma, 2) país =====
// Un sol toc avança a cada pas (cap botó de continuar). L'estat el porta
// welcomeStep sobre una sola .screen, així _rerenderActiveScreen (cas
// screen-welcome) repinta el pas ACTIU en canviar d'idioma sense fer saltar
// l'usuari al pas 1.
let welcomeStep = 1;   // 1 = idioma · 2 = país

function showWelcomeIfNeeded() {
  const onboarded = localStorage.getItem('eatmefirst_onboarded');
  if (onboarded === 'true') return false;

  // Precarrega (no bloquejant) els blocs d'idioma no actius: el pas 1 és triar
  // idioma i l'usuari triga segons, així quan en toqui un ja el tindrà i el
  // canvi serà instantani, sense el flaix de la llista de països re-traduint-se.
  if (typeof _preloadOtherLangBlocks === 'function') _preloadOtherLangBlocks();

  welcomeStep = 1;
  _wireWelcomeButtons();
  renderWelcomeStep();
  showScreen('welcome');
  return true;
}

// Cablatge (idempotent via onclick=) del botó Enrere (pas 2 → pas 1). Passa per
// history.back() → popstate (app.js) → welcomeBackToLang, com el gest del sistema,
// perquè historial i passos no divergeixin.
function _wireWelcomeButtons() {
  const back = document.getElementById('welcome-back-btn');
  if (back) back.onclick = () => history.back();
}

// Mostra el pas actiu i repinta la seva llista. _rerenderActiveScreen (cas
// screen-welcome) l'invoca en canviar d'idioma: com que welcomeStep es manté,
// l'usuari NO salta al pas 1.
function renderWelcomeStep() {
  const stepLang = document.getElementById('welcome-step-lang');
  const stepCountry = document.getElementById('welcome-step-country');
  if (stepLang) stepLang.style.display = (welcomeStep === 1) ? '' : 'none';
  if (stepCountry) stepCountry.style.display = (welcomeStep === 2) ? '' : 'none';

  if (welcomeStep === 1) {
    renderWelcomeLangList();
  } else {
    renderWelcomeCountryList();
  }
}

// Pas 1 — selector d'idioma complet (4 targetes .lang-item). Reutilitza el
// selector de Configuració (renderLangListInto): en tocar un idioma, el seu
// handler crida setLanguage() (persisteix + re-tradueix). Un listener delegat
// en fase de CAPTURA avança al pas 2: com que fixa welcomeStep=2 ABANS que el
// handler de renderLangListInto dispari _rerenderActiveScreen, el re-render per
// canvi d'idioma ja pinta el pas 2 (país) i no torna a pintar el pas 1.
function renderWelcomeLangList() {
  const container = document.getElementById('welcome-lang-list');
  if (!container) return;
  if (typeof renderLangListInto === 'function') renderLangListInto(container);
  if (!container.dataset.welcomeHook) {
    container.dataset.welcomeHook = '1';
    container.addEventListener('click', (e) => {
      if (e.target && e.target.closest && e.target.closest('.lang-item')) {
        welcomeStep = 2;
        // Empeny una entrada d'historial per al pas 2 (aquest avanç no passa per
        // showScreen): així el gest enrere torna al pas 1 en lloc de sortir.
        // d = profunditat real (entrada actual + 1); no toquem la URL.
        const cur = (history.state && typeof history.state.d === 'number') ? history.state.d : 0;
        try { history.pushState({ d: cur + 1, w: 2 }, ''); } catch (err) {}
        renderWelcomeStep();
      }
    }, true);   // captura: abans del handler de renderLangListInto
  }
}

// Pas 2 — llista de països (ja traduïda a l'idioma triat). Un toc finalitza.
function renderWelcomeCountryList() {
  const container = document.getElementById('welcome-country-list');
  if (!container) return;
  container.innerHTML = '';

  COUNTRIES.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'country-card';
    btn.innerHTML = `
      <span class="country-flag">${c.flag}</span>
      <span class="country-name">${t(c.nameKey)}</span>
    `;
    btn.addEventListener('click', () => finishWelcome(c.code));
    container.appendChild(btn);
  });
}

// Enrere (pas 2 → pas 1).
function welcomeBackToLang() {
  welcomeStep = 1;
  renderWelcomeStep();
}

// Final: en tocar un país, supermercats del país + onboarded + launcher + toast.
function finishWelcome(countryCode) {
  const country = countryCode || currentCountry;
  if (typeof initSupermarketsForCountry === 'function') initSupermarketsForCountry(country);
  localStorage.setItem('eatmefirst_onboarded', 'true');
  if (typeof welcomeStep !== 'undefined') welcomeStep = 1;
  // Reset d'historial en acabar l'onboarding SENSE deixar residu: durant
  // l'onboarding vam empènyer 1 entrada (pas 2), així que aquí d===1.
  // navCollapseToRoot fa history.go(-1) → aterra a la meva arrel i, un cop allà,
  // mostra el launcher (callback, sota _navFromPop). Resultat: el primer gest
  // enrere al launcher tanca l'app, sense el "dead press" que deixaria l'antic
  // replaceState (que no pot esborrar l'entrada de benvinguda del darrere).
  navCollapseToRoot(() => showScreen('launcher'));
  setTimeout(() => showToast('🎉 ' + t('welcomeReady')), 300);
}

// ============ PANTALLA PAÍS (des de configuració) ============

function openCountryScreen() {
  renderCountryList();
  showScreen('country');
}


function renderCountryList() {
  renderCountryListInto(document.getElementById('country-list'));
}

// Pinta la llista de països a un contenidor arbitrari (pantalla autònoma
// o sub-pantalla "Regional" amb pestanyes).
function renderCountryListInto(container) {
  if (!container) return;
  container.innerHTML = '';

  COUNTRIES.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'country-card' + (c.code === currentCountry ? ' selected' : '');
    const flagSvg = COUNTRY_FLAG_SVG[c.code] || c.flag;
    btn.innerHTML = `
      <span class="country-flag">${flagSvg}</span>
      <span class="country-name">${t(c.nameKey)}</span>
      ${c.code === currentCountry ? '<span class="country-check">✓</span>' : ''}
    `;
    btn.addEventListener('click', () => selectCountryFromSettings(c.code));
    container.appendChild(btn);
  });
}

function selectCountryFromSettings(countryCode) {
  if (countryCode === currentCountry) {
    showScreen('settings');
    return;
  }
  // Confirma el canvi de país
  showCountryChangeModal(countryCode);
}

function showCountryChangeModal(countryCode) {
  const country = COUNTRIES.find(c => c.code === countryCode);
  if (!country) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  const flagMarkup = COUNTRY_FLAG_SVG[country.code]
    ? `<div class="modal-flag-big">${COUNTRY_FLAG_SVG[country.code]}</div>`
    : `<div class="modal-emoji-big">${country.flag}</div>`;
  overlay.innerHTML = `
    <div class="modal-content">
      ${flagMarkup}
      <p class="modal-title">${t('changeCountryTitle')}</p>
      <p class="modal-product-name">${t(country.nameKey)}</p>
      <p class="modal-sub">${t('changeCountrySub')}</p>
      <div class="modal-buttons">
        <button class="modal-cancel" id="modal-no-btn">${t('cancel')}</button>
        <button class="modal-confirm" id="modal-yes-btn">${t('changeCountryConfirm')}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('#modal-no-btn').addEventListener('click', () => {
    document.body.removeChild(overlay);
  });
  overlay.querySelector('#modal-yes-btn').addEventListener('click', () => {
    document.body.removeChild(overlay);
    changeCountry(countryCode);
    updateCountryStatus();
    renderCountryList();
    // Si la sub-pantalla "Regional" està visible, també cal refrescar-la
    // per actualitzar el check del país actiu dins el seu propi container.
    if (typeof renderSettingsRegional === 'function') renderSettingsRegional();
    showToast('✓ ' + t(country.nameKey));
  });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) document.body.removeChild(overlay);
  });
}

function updateCountryStatus() {
  const el = document.getElementById('country-status');
  if (!el) return;
  const c = COUNTRIES.find(c => c.code === currentCountry);
  if (c) el.textContent = t(c.nameKey);
}

// ============ PANTALLA GESTIÓ DE SUPERMERCATS ============

function openManageSupermarkets(origin) {
  manageSupermarketsMode = 'view';
  const backBtn = document.getElementById('manage-supermarkets-back-btn');
  // Tornem a 'settings' o a la sub-pantalla 'settings-*' segons l'origen,
  // si no a 'shopping' (cas BuyMe).
  const isSettings = origin === 'settings' || (typeof origin === 'string' && origin.indexOf('settings-') === 0);
  if (backBtn) backBtn.dataset.back = isSettings ? origin : 'shopping';
  renderManageSupermarkets();
  showScreen('manage-supermarkets');
}

// Mode actual: 'view' (només checkbox + nom) o 'edit' (amb fletxes, editar, esborrar)
let manageSupermarketsMode = 'view';

function renderManageSupermarkets() {
  const container = document.getElementById('manage-supermarkets-list');
  if (!container) return;
  container.innerHTML = '';

  if (supermarkets.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = t('noSupermarketsManage');
    container.appendChild(empty);
    updateManageSupermarketsButtons();
    return;
  }

  supermarkets.forEach((sm, idx) => {
    const row = document.createElement('div');
    row.className = 'manage-sm-row';
    const isFirst = idx === 0;
    const isLast = idx === supermarkets.length - 1;

    if (manageSupermarketsMode === 'edit') {
      // Mode edició: checkbox + emoji + nom + fletxes + editar + esborrar
      row.innerHTML = `
        <label class="manage-sm-checkbox">
          <input type="checkbox" data-id="${sm.id}" ${sm.enabled !== false ? 'checked' : ''}>
          <span class="checkmark"></span>
        </label>
        <div class="manage-sm-emoji">${sm.emoji}</div>
        <div class="manage-sm-name">${escapeHtml(sm.name)}</div>
        <div class="manage-sm-arrows">
          <button class="arrow-btn ${isFirst ? 'arrow-disabled' : ''}" data-action="up" ${isFirst ? 'disabled' : ''} aria-label="Up">▲</button>
          <button class="arrow-btn ${isLast ? 'arrow-disabled' : ''}" data-action="down" ${isLast ? 'disabled' : ''} aria-label="Down">▼</button>
        </div>
        <button class="manage-sm-edit" aria-label="Edit">✏️</button>
        <button class="manage-sm-delete" aria-label="Delete">✕</button>
      `;
      row.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
        sm.enabled = e.target.checked;
        saveShoppingData();
      });
      row.querySelector('.manage-sm-edit').addEventListener('click', () => openSupermarketEdit(sm));
      row.querySelector('.manage-sm-delete').addEventListener('click', () => askDeleteSupermarket(sm));
      const upBtn = row.querySelector('[data-action="up"]');
      const downBtn = row.querySelector('[data-action="down"]');
      if (upBtn && !isFirst) upBtn.addEventListener('click', () => moveSupermarket(idx, -1));
      if (downBtn && !isLast) downBtn.addEventListener('click', () => moveSupermarket(idx, 1));
    } else {
      // Mode visualització: només checkbox + emoji + nom
      row.innerHTML = `
        <label class="manage-sm-checkbox">
          <input type="checkbox" data-id="${sm.id}" ${sm.enabled !== false ? 'checked' : ''}>
          <span class="checkmark"></span>
        </label>
        <div class="manage-sm-emoji">${sm.emoji}</div>
        <div class="manage-sm-name">${escapeHtml(sm.name)}</div>
      `;
      row.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
        sm.enabled = e.target.checked;
        saveShoppingData();
      });
    }

    container.appendChild(row);
  });

  updateManageSupermarketsButtons();
}

function updateManageSupermarketsButtons() {
  const editBtn = document.getElementById('btn-toggle-edit-shops');
  const addBtn = document.getElementById('btn-add-custom-supermarket');
  const saveBtn = document.getElementById('btn-save-shops');
  if (!editBtn) return;

  if (manageSupermarketsMode === 'edit') {
    editBtn.style.display = 'none';
    if (addBtn) addBtn.style.display = 'flex';
    if (saveBtn) saveBtn.style.display = 'block';
  } else {
    editBtn.style.display = 'flex';
    if (addBtn) addBtn.style.display = 'none';
    if (saveBtn) saveBtn.style.display = 'none';
  }
}

function toggleEditShopsMode() {
  manageSupermarketsMode = manageSupermarketsMode === 'view' ? 'edit' : 'view';
  renderManageSupermarkets();
}

function moveSupermarket(idx, direction) {
  const newIdx = idx + direction;
  if (newIdx < 0 || newIdx >= supermarkets.length) return;
  [supermarkets[idx], supermarkets[newIdx]] = [supermarkets[newIdx], supermarkets[idx]];
  saveShoppingData();
  renderManageSupermarkets();
}

function moveShoppingItem(idx, direction) {
  const items = getShoppingItemsBySupermarket(currentSupermarketId);
  const newIdx = idx + direction;
  if (newIdx < 0 || newIdx >= items.length) return;

  const itemA = items[idx];
  const itemB = items[newIdx];
  // Trobem els seus índexs reals al global
  const realA = shoppingItems.findIndex(it => it.id === itemA.id);
  const realB = shoppingItems.findIndex(it => it.id === itemB.id);
  if (realA < 0 || realB < 0) return;
  [shoppingItems[realA], shoppingItems[realB]] = [shoppingItems[realB], shoppingItems[realA]];
  saveShoppingData();
  renderShoppingItems();
}

function askDeleteSupermarket(sm) {
  const itemsCount = getShoppingItemsBySupermarket(sm.id).length;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-content">
      <div class="modal-emoji-big">🗑️</div>
      <p class="modal-title">${t('confirmDeleteSupermarket')}</p>
      <p class="modal-product-name">${escapeHtml(sm.emoji + ' ' + sm.name)}</p>
      <p class="modal-sub">${itemsCount > 0 ? t('confirmDeleteSupermarketWithItems', itemsCount) : t('confirmDeleteSupermarketSub')}</p>
      <div class="modal-buttons">
        <button class="modal-cancel" id="modal-no-btn">${t('cancel')}</button>
        <button class="modal-confirm modal-confirm-danger" id="modal-yes-btn">${t('delete')}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('#modal-no-btn').addEventListener('click', () => {
    document.body.removeChild(overlay);
  });
  overlay.querySelector('#modal-yes-btn').addEventListener('click', () => {
    document.body.removeChild(overlay);
    shoppingItems = shoppingItems.filter(it => it.supermarketId !== sm.id);
    supermarkets = supermarkets.filter(s => s.id !== sm.id);
    saveShoppingData();
    renderManageSupermarkets();
    showToast(t('deleted'));
  });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) document.body.removeChild(overlay);
  });
}

let supermarkets = []; // Array de {id, name, emoji}

let currentSupermarketId = null;
let editingSupermarket = null; // null = nou, objecte = editant

let selectedSupermarketEmoji = '🛒';

let currentCountry = 'ES'; // país actual de l'usuari

function renderSupermarketEmojiPickerBtn() {
  const btn = document.getElementById('supermarket-emoji-current');
  if (btn) btn.textContent = selectedSupermarketEmoji;
}

