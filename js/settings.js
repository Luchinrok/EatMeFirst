/* ============================================
   Buyte — js/settings.js
   Mòdul de configuració: tema, idioma, sincronització
   Firebase, notificacions, ubicacions, estadístiques i
   reset de dades.
   ============================================ */


// ============ SINCRONITZACIÓ FIREBASE ============

let syncEnabled = false;
let applyingRemote = false;

async function initSync() {
  const code = localStorage.getItem('eatmefirst_sync_code');
  if (!code) return;

  const ok = await window.FBSync.init();
  if (!ok) {
    console.warn('Firebase no disponible (sense internet?)');
    updateSyncStatus();
    return;
  }

  try {
    await window.FBSync.connectToList(code, onRemoteData);
    syncEnabled = true;
    updateSyncStatus();
  } catch (e) {
    console.error('Error reconnectant:', e);
  }
}

function onRemoteData(remoteData) {
  if (!remoteData) return;
  applyingRemote = true;

  if (Array.isArray(remoteData.products)) {
    // Backup + transformació v2 abans d'aplicar — cobreix el cas en
    // què un altre dispositiu encara emet format legacy. Idempotent
    // gràcies al flag a localStorage i a la guarda de _createMigrationBackup.
    if (typeof window._createMigrationBackup === 'function') {
      try { window._createMigrationBackup(); } catch (e) {}
    }
    if (typeof window._transformProductsToV2 === 'function') {
      products = window._transformProductsToV2(remoteData.products).products;
    } else {
      products = remoteData.products;
    }
  }
  if (Array.isArray(remoteData.locations) && remoteData.locations.length > 0) locations = remoteData.locations;
  if (remoteData.stats && typeof remoteData.stats === 'object') stats = remoteData.stats;
  if (Array.isArray(remoteData.supermarkets)) supermarkets = remoteData.supermarkets;
  if (Array.isArray(remoteData.shoppingItems)) shoppingItems = remoteData.shoppingItems;

  // Purchase history: regla conservadora — NO esborrar local quan el
  // remot és buit ({} o sense camp). Només sobreescrivim si el remot
  // té contingut real. Mai sobreescriure local amb undefined (la
  // guarda Object.keys > 0 cobreix els dos casos).
  //
  // LIMITACIÓ CONEGUDA: si en el futur s'implementa "esborrar tot el
  // history" com a acció d'usuari, aquesta guarda impedirà la
  // propagació entre dispositius (B mantindrà dades antigues encara
  // que A hagi esborrat). Caldrà un mecanisme explícit (tombstone,
  // last_update timestamp, etc.) si arriba aquell cas.
  if (remoteData.purchaseHistory
      && typeof remoteData.purchaseHistory === 'object'
      && !Array.isArray(remoteData.purchaseHistory)
      && Object.keys(remoteData.purchaseHistory).length > 0
      && typeof _setPurchaseHistoryFromSync === 'function') {
    _setPurchaseHistoryFromSync(remoteData.purchaseHistory);
  }

  // Cache de populars (eatmefirst_popular_custom): mateixa regla
  // conservadora que purchaseHistory — no esborrar local si remot
  // arriba buit. Escrivim directament al localStorage per evitar
  // un loop savePopularProducts → pushToServer → onRemoteData.
  //
  // LIMITACIÓ CONEGUDA: igual que purchaseHistory, si en el futur
  // s'implementa "esborrar tot el catàleg popular custom", la
  // guarda length > 0 ho bloquejarà entre dispositius.
  if (remoteData.popularCustom
      && Array.isArray(remoteData.popularCustom)
      && remoteData.popularCustom.length > 0) {
    localStorage.setItem('eatmefirst_popular_custom', JSON.stringify(remoteData.popularCustom));
  }

  // Ordre de categories per super (BuyMe): mateixa regla conservadora
  // — només sobreescriure local si remot té contingut real. Cap loop
  // perquè escrivim directament al localStorage; no hi ha funció save.
  if (remoteData.categoryOrderBySuper
      && typeof remoteData.categoryOrderBySuper === 'object'
      && !Array.isArray(remoteData.categoryOrderBySuper)
      && Object.keys(remoteData.categoryOrderBySuper).length > 0) {
    localStorage.setItem('eatmefirst_category_order_by_super',
      JSON.stringify(remoteData.categoryOrderBySuper));
  }

  // Pressupost mensual: guarda > 0 perquè un dispositiu sense pressupost
  // no esborri el local (mateixa regla conservadora que la resta).
  if (typeof remoteData.monthlyBudget === 'number' && remoteData.monthlyBudget > 0) {
    localStorage.setItem('eatmefirst_monthly_budget', String(remoteData.monthlyBudget));
  }

  // Pla setmanal de menús: guarda d'objecte no buit (mateixa regla
  // conservadora; no esborrar el local des d'un dispositiu sense pla).
  // FUSIÓ per setmana→dia→slot (no sobreescriure) perquè un snapshot ranci
  // no esborri slots germans assignats localment entre dues edicions.
  if (remoteData.mealPlan && typeof remoteData.mealPlan === 'object'
      && !Array.isArray(remoteData.mealPlan)
      && Object.keys(remoteData.mealPlan).length > 0) {
    const localPlan = JSON.parse(localStorage.getItem('eatmefirst_meal_plan') || '{}');
    const merged = (typeof _mpMergePlans === 'function')
      ? _mpMergePlans(localPlan, remoteData.mealPlan)
      : remoteData.mealPlan;
    localStorage.setItem('eatmefirst_meal_plan', JSON.stringify(merged));
    // Si el planificador és visible, repinta perquè reflecteixi la fusió.
    const mpScr = document.getElementById('screen-meal-planner');
    if (mpScr && mpScr.classList.contains('active') && typeof renderMealPlanner === 'function') {
      renderMealPlanner();
    }
  }

  // Rastre "compra ja generada" per setmana del planificador: guarda
  // d'objecte no buit (mateixa regla conservadora que mealPlan).
  if (remoteData.mealplanShoppingDone && typeof remoteData.mealplanShoppingDone === 'object'
      && !Array.isArray(remoteData.mealplanShoppingDone)
      && Object.keys(remoteData.mealplanShoppingDone).length > 0) {
    localStorage.setItem('eatmefirst_mealplan_shopping_done', JSON.stringify(remoteData.mealplanShoppingDone));
  }

  localStorage.setItem('eatmefirst_products', JSON.stringify(products));
  localStorage.setItem('eatmefirst_locations', JSON.stringify(locations));
  localStorage.setItem('eatmefirst_stats', JSON.stringify(stats));
  localStorage.setItem('eatmefirst_supermarkets', JSON.stringify(supermarkets));
  localStorage.setItem('eatmefirst_shopping_items', JSON.stringify(shoppingItems));
  // purchaseHistory ja s'ha escrit dins de _setPurchaseHistoryFromSync.

  if (typeof renderHome === 'function') renderHome();
  const sectionScreen = document.getElementById('screen-section');
  if (typeof renderSection === 'function' && sectionScreen && sectionScreen.classList.contains('active')) {
    renderSection();
  }
  // Refresca les pantalles de la llista de la compra si estan visibles
  const shoppingScr = document.getElementById('screen-shopping');
  if (shoppingScr && shoppingScr.classList.contains('active') && typeof renderSupermarkets === 'function') {
    renderSupermarkets();
  }
  const supermarketScr = document.getElementById('screen-supermarket');
  if (supermarketScr && supermarketScr.classList.contains('active') && typeof renderShoppingItems === 'function') {
    renderShoppingItems();
  }

  applyingRemote = false;
  updateSyncStatus();
}

function pushToServer() {
  if (syncEnabled && !applyingRemote && window.FBSync) {
    window.FBSync.upload({
      products: products,
      locations: locations,
      stats: stats,
      supermarkets: supermarkets,
      shoppingItems: shoppingItems,
      purchaseHistory: (typeof _getPurchaseHistoryForSync === 'function') ? _getPurchaseHistoryForSync() : {},
      popularCustom: (typeof getPopularProducts === 'function') ? getPopularProducts() : [],
      categoryOrderBySuper: JSON.parse(localStorage.getItem('eatmefirst_category_order_by_super') || '{}'),
      monthlyBudget: Number(localStorage.getItem('eatmefirst_monthly_budget')) || 0,
      mealPlan: JSON.parse(localStorage.getItem('eatmefirst_meal_plan') || '{}'),
      mealplanShoppingDone: JSON.parse(localStorage.getItem('eatmefirst_mealplan_shopping_done') || '{}')
    });
  }
}

function updateSyncStatus() {
  const subEl = document.getElementById('sync-status');
  if (!subEl) return;
  subEl.textContent = syncEnabled ? t('syncOn') : t('syncOff');
}

function updateSyncScreen() {
  const notConn = document.getElementById('sync-not-connected');
  const conn = document.getElementById('sync-connected');
  if (!notConn || !conn) return;

  if (syncEnabled) {
    notConn.style.display = 'none';
    conn.style.display = 'block';
    const code = window.FBSync.getCurrentListId();
    document.getElementById('sync-code-display').textContent = code;
    document.getElementById('sync-last-update').textContent = t('syncLastUpdate', new Date().toLocaleTimeString(getLocale()));
  } else {
    notConn.style.display = 'block';
    conn.style.display = 'none';
  }
}

function openSyncScreen(origin) {
  updateSyncScreen();
  const backBtn = document.querySelector('#screen-sync .back-btn');
  if (backBtn) {
    const isSettings = origin === 'settings' || (typeof origin === 'string' && origin.indexOf('settings-') === 0);
    backBtn.dataset.back = isSettings ? origin : 'settings';
  }
  showScreen('sync');
}

// Pont global → space.syncCode: propaga el codi de sync resultant a
// l'Espai ACTIU (complement del sentit invers, que ja existeix a
// switchToSpace/migració). Així la llista d'Espais reflecteix que l'Espai
// actiu està sincronitzat (codi + botons 📋/🔗), no només la pantalla de
// Sincronització clàssica. Re-renderitza la llista si està oberta.
// Guarda si SpacesSystem no hi és. Persisteix al data layer (igual que
// des de la Spaces UI: updateSpaceSyncCode → _spacesWrite → localStorage).
function _syncCodeToActiveSpace(code) {
  if (!window.SpacesSystem || typeof window.SpacesSystem.updateSpaceSyncCode !== 'function') return;
  const activeId = window.SpacesSystem.getActiveSpaceId();
  if (!activeId) return;
  window.SpacesSystem.updateSpaceSyncCode(activeId, code);
  const scr = document.getElementById('screen-spaces');
  if (scr && scr.classList.contains('active') && typeof renderSpacesList === 'function') {
    renderSpacesList();
  }
}

async function createNewList() {
  showToast(t('syncConnecting'));

  const ok = await window.FBSync.init();
  if (!ok) {
    showToast(t('syncErrorOffline'));
    return;
  }

  let code, attempts = 0;
  do {
    code = window.FBSync.generateCode();
    attempts++;
    if (attempts > 5) break;
  } while (await window.FBSync.codeExists(code));

  try {
    await window.FBSync.createList(code, {
      products: products,
      locations: locations,
      stats: stats,
      supermarkets: supermarkets,
      shoppingItems: shoppingItems,
      purchaseHistory: (typeof _getPurchaseHistoryForSync === 'function') ? _getPurchaseHistoryForSync() : {},
      popularCustom: (typeof getPopularProducts === 'function') ? getPopularProducts() : [],
      categoryOrderBySuper: JSON.parse(localStorage.getItem('eatmefirst_category_order_by_super') || '{}'),
      monthlyBudget: Number(localStorage.getItem('eatmefirst_monthly_budget')) || 0,
      mealPlan: JSON.parse(localStorage.getItem('eatmefirst_meal_plan') || '{}'),
      mealplanShoppingDone: JSON.parse(localStorage.getItem('eatmefirst_mealplan_shopping_done') || '{}')
    });
    await window.FBSync.connectToList(code, onRemoteData);

    localStorage.setItem('eatmefirst_sync_code', code);
    syncEnabled = true;
    _syncCodeToActiveSpace(code);   // reflecteix el codi a l'Espai actiu (pont global → space)
    updateSyncStatus();
    updateSyncScreen();
    showToast('✅ ' + t('syncCreated'));
  } catch (e) {
    console.error(e);
    showToast(t('syncErrorCreate'));
  }
}

async function joinExistingList() {
  let code = document.getElementById('input-sync-code').value.trim().toUpperCase();
  if (!code) { showToast(t('syncCodeRequired')); return; }

  if (!code.startsWith('EMF-')) code = 'EMF-' + code;
  if (code.length === 12 && code.charAt(7) !== '-') {
    code = code.slice(0, 8) + '-' + code.slice(8);
  }
  if (code.length !== 13) { showToast(t('syncCodeInvalid')); return; }

  showToast(t('syncConnecting'));

  const ok = await window.FBSync.init();
  if (!ok) {
    showToast(t('syncErrorOffline'));
    return;
  }

  const exists = await window.FBSync.codeExists(code);
  if (!exists) {
    showToast(t('syncCodeNotFound'));
    return;
  }

  // Si l'usuari ja té dades locals, mostrem un modal integrat amb tres
  // accions: cancel·lar, fer una còpia primer (exporta JSON), o
  // confirmar la connexió que SUBSTITUIRÀ les dades locals. Vegeu
  // _showSyncJoinConfirm.
  if (products.length > 0) {
    _showSyncJoinConfirm(code);
    return;
  }

  await _completeSyncJoin(code);
}

// Reactiva la connexió amb la llista i refresca la UI. Cridat des de
// joinExistingList (sense dades locals) o des del modal de confirmació
// (amb dades locals, després que l'usuari accepti substituir-les).
async function _completeSyncJoin(code) {
  try {
    await window.FBSync.connectToList(code, onRemoteData);
    localStorage.setItem('eatmefirst_sync_code', code);
    syncEnabled = true;
    _syncCodeToActiveSpace(code);   // reflecteix el codi a l'Espai actiu (pont global → space)
    updateSyncStatus();
    showScreen('sync');
    updateSyncScreen();
    showToast('✅ ' + t('syncJoined'));
  } catch (e) {
    console.error(e);
    showToast(t('syncErrorJoin'));
  }
}

// Modal de confirmació per a la connexió a una família existent quan
// l'usuari té dades locals que es perdran. Tres accions verticals:
// 1) "Sí, connectar" (primary verd) — connectar és una acció POSITIVA
//    (et connectes amb la família, sincronitzes dades). Tot i que
//    sobreescriu les dades locals, no és un "esborrat" — el risc el
//    comuniquem al missatge i amb el botó "Fer còpia primer". Reservem
//    el vermell (modal-confirm-danger) per a esborrats nets (eliminar
//    backup, eliminar producte, etc.).
// 2) "Fer còpia primer" (neutral blau) — exporta el JSON i torna a
//    mostrar aquest mateix modal perquè l'usuari decideixi amb la còpia
//    ja feta.
// 3) "Cancel·lar" — tanca el modal sense fer res.
function _showSyncJoinConfirm(code) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML =
    '<div class="modal-content">' +
      '<div class="modal-emoji-big">👨‍👩‍👧‍👦</div>' +
      '<p class="modal-title">' + escapeHtml(t('syncJoinConfirmTitle')) + '</p>' +
      '<p class="modal-sub">' + escapeHtml(t('syncJoinConfirmMessage1')) + '</p>' +
      '<p class="modal-sub">' + escapeHtml(t('syncJoinConfirmMessage2')) + '</p>' +
      '<div class="modal-buttons-stacked">' +
        '<button class="modal-confirm" id="sync-join-yes">' + escapeHtml(t('syncJoinConfirmYes')) + '</button>' +
        '<button class="modal-confirm modal-confirm-neutral" id="sync-join-backup">📦 ' + escapeHtml(t('syncJoinBackupFirst')) + '</button>' +
        '<button class="modal-cancel" id="sync-join-cancel">' + escapeHtml(t('cancel')) + '</button>' +
      '</div>' +
    '</div>';
  openModal(overlay, () => { if (overlay.parentNode) document.body.removeChild(overlay); });
  const close = () => dismissModal(overlay);
  overlay.querySelector('#sync-join-cancel').addEventListener('click', close);
  overlay.querySelector('#sync-join-backup').addEventListener('click', () => {
    close();
    if (typeof exportData === 'function') exportData();
    // Torna a mostrar el modal després d'un petit retard perquè el toast
    // d'exportació tingui un instant per aparèixer abans.
    setTimeout(() => _showSyncJoinConfirm(code), 350);
  });
  overlay.querySelector('#sync-join-yes').addEventListener('click', () => {
    close();
    _completeSyncJoin(code);
  });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
}

function disconnectSync() {
  // Acció no destructiva: les dades locals es mantenen al dispositiu;
  // només s'atura el listener i s'oblida el codi guardat. Per això el
  // botó primary és l'estil estàndard (verd) i no la variant danger
  // (vermella) que reservem per a esborrats irreversibles.
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML =
    '<div class="modal-content">' +
      '<div class="modal-emoji-big">🔌</div>' +
      '<p class="modal-title">' + escapeHtml(t('syncDisconnectTitle')) + '</p>' +
      '<p class="modal-sub">' + escapeHtml(t('syncDisconnectMessage1')) + '</p>' +
      '<p class="modal-sub">' + escapeHtml(t('syncDisconnectMessage2')) + '</p>' +
      '<div class="modal-buttons">' +
        '<button class="modal-cancel" id="sync-disc-no">' + escapeHtml(t('cancel')) + '</button>' +
        '<button class="modal-confirm" id="sync-disc-yes">' + escapeHtml(t('syncDisconnect')) + '</button>' +
      '</div>' +
    '</div>';
  openModal(overlay, () => { if (overlay.parentNode) document.body.removeChild(overlay); });
  const close = () => dismissModal(overlay);
  overlay.querySelector('#sync-disc-no').addEventListener('click', close);
  overlay.querySelector('#sync-disc-yes').addEventListener('click', () => {
    close();
    if (window.FBSync) window.FBSync.disconnect();
    localStorage.removeItem('eatmefirst_sync_code');
    syncEnabled = false;
    // Netejar el codi de l'Espai actiu NOMÉS si és el per defecte/home (el
    // de la migració). Per a Espais creats/units des de la Spaces UI, el
    // codi és la seva identitat compartida (altres dispositius l'usen): no
    // el toquem — en tornar-hi via switchToSpace es reconnecta sol.
    if (window.SpacesSystem && typeof window.SpacesSystem.getActiveSpaceId === 'function'
        && window.SpacesSystem.getActiveSpaceId() === window.SpacesSystem.DEFAULT_HOME_ID) {
      _syncCodeToActiveSpace(null);
    }
    updateSyncStatus();
    updateSyncScreen();
    showToast(t('syncDisconnected'));
  });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
}

async function copyCodeToClipboard() {
  const code = window.FBSync.getCurrentListId();
  if (!code) return;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(code);
    } else {
      const tmp = document.createElement('input');
      tmp.value = code;
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand('copy');
      document.body.removeChild(tmp);
    }
    showToast('✓ ' + t('codeCopied'));
  } catch (e) {
    showToast(code);
  }
}

// ============ NOTIFICACIONS ============

function exposeForNotifications() {
  window.products = products;
  window.daysUntil = daysUntil;
  window.getLevel = getLevel;
  window.getLocationById = getLocationById;
  window.t = t;
}

function initNotifications() {
  if (!window.Notif) return;
  exposeForNotifications();
  // El sistema antic queda com a capa low-level (showNotification / permisos)
  // però sense el seu propi scheduler — el nou sistema porta el control.
  if (typeof initSmartNotifications === 'function') initSmartNotifications();
  updateNotifStatus();
}

function updateNotifStatus() {
  const subEl = document.getElementById('notif-status');
  if (!subEl) return;

  // Llegim TOT en directe — Notification.permission del navegador i el
  // master switch directament del localStorage, així no depenem de cap
  // còpia in-memory que pogués estar obsoleta.
  const perm = (typeof Notification !== 'undefined') ? Notification.permission : 'unsupported';
  let masterOn = false;
  let activeCount = 0;
  try {
    const raw = localStorage.getItem('eatmefirst_smart_notif_v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      masterOn = parsed && parsed.enabled === true;
      if (parsed && parsed.types) {
        activeCount = Object.values(parsed.types).filter(c => c && c.enabled).length;
      }
    } else if (typeof getSmartNotifSettings === 'function') {
      // Mai s'ha desat encara → fem servir els defaults en memòria.
      const s = getSmartNotifSettings();
      masterOn = !!s.enabled;
      activeCount = Object.values(s.types || {}).filter(c => c && c.enabled).length;
    }
  } catch (e) {}

  if (perm === 'unsupported') {
    subEl.textContent = t('notifNotSupportedShort');
    return;
  }
  if (!masterOn) {
    subEl.textContent = t('notifStatusOff');
    return;
  }
  // master ON: el detall depèn de l'estat dels permisos
  if (perm === 'granted') {
    subEl.textContent = t('notifStatusOn', activeCount);
  } else if (perm === 'denied') {
    subEl.textContent = t('notifStatusOnDenied');
  } else {
    // 'default' o qualsevol altre valor → cal demanar permís
    subEl.textContent = t('notifStatusOnNoPerm');
  }
}

function openNotificationsScreen(origin) {
  exposeForNotifications();
  if (!window.Notif) return;
  renderSmartNotifSettingsScreen();
  const backBtn = document.querySelector('#screen-notifications .back-btn');
  if (backBtn) {
    const isSettings = origin === 'settings' || (typeof origin === 'string' && origin.indexOf('settings-') === 0);
    backBtn.dataset.back = isSettings ? origin : 'settings';
  }
  showScreen('notifications');
}

// Pinta tota la pantalla de configuració de notificacions amb els 4 estats:
//  1) master OFF: només master + sub explicatiu, resta amagada
//  2) master ON + permís 'granted': perm banner verd + tipus + test
//  3) master ON + permís 'default': perm banner groc + botó "Permetre" +
//     tipus atenuats
//  4) master ON + permís 'denied': perm banner vermell + instruccions de
//     navegador + botó "Tornar a comprovar" + tipus atenuats
function renderSmartNotifSettingsScreen() {
  if (typeof getSmartNotifSettings !== 'function' || typeof SMART_NOTIF_TYPES === 'undefined') return;
  const settings = getSmartNotifSettings();

  // Estat live
  const permStatus = (typeof Notification !== 'undefined') ? Notification.permission : 'unsupported';
  const masterOn = !!settings.enabled;

  // Master switch + sub
  const masterCb = document.getElementById('smart-notif-master');
  if (masterCb) masterCb.checked = masterOn;
  const masterSub = document.getElementById('smart-notif-master-sub');
  if (masterSub) masterSub.textContent = masterOn ? '' : t('notifMasterOffHint');

  // Bloc condicional
  const whenOn = document.getElementById('smart-notif-when-on');
  if (whenOn) whenOn.style.display = masterOn ? 'block' : 'none';

  if (!masterOn) return;

  // Banner de permisos (només quan master ON)
  const permCard = document.getElementById('smart-notif-perm');
  const permIcon = document.getElementById('smart-notif-perm-icon');
  const permEl = document.getElementById('smart-notif-perm-status');
  const permHelp = document.getElementById('smart-notif-perm-help');
  const reqBtn = document.getElementById('smart-notif-request-perm');
  const recheckBtn = document.getElementById('smart-notif-recheck');
  const promptHint = document.getElementById('smart-notif-prompt-hint');
  const deniedHelp = document.getElementById('smart-notif-denied-help');
  const typesBlock = document.getElementById('smart-notif-types-block');

  if (permCard) permCard.classList.remove('perm-banner-info','perm-banner-error','perm-banner-success','perm-banner-warning');

  if (permStatus === 'granted') {
    if (permIcon) permIcon.textContent = '✅';
    if (permEl) permEl.textContent = t('notifPermStatusGranted');
    if (permHelp) permHelp.textContent = '';
    if (permCard) permCard.classList.add('perm-banner-success');
    if (reqBtn) reqBtn.style.display = 'none';
    if (recheckBtn) recheckBtn.style.display = 'none';
    if (promptHint) promptHint.style.display = 'none';
    if (deniedHelp) deniedHelp.style.display = 'none';
    if (typesBlock) typesBlock.classList.remove('is-disabled');
  } else if (permStatus === 'denied') {
    if (permIcon) permIcon.textContent = '🚫';
    if (permEl) permEl.textContent = t('notifPermStatusDenied');
    if (permHelp) permHelp.textContent = '';
    if (permCard) permCard.classList.add('perm-banner-error');
    if (reqBtn) reqBtn.style.display = 'none';
    if (recheckBtn) recheckBtn.style.display = 'flex';
    if (promptHint) promptHint.style.display = 'none';
    if (deniedHelp) deniedHelp.style.display = 'block';
    if (typesBlock) typesBlock.classList.add('is-disabled');
  } else if (permStatus === 'unsupported') {
    if (permIcon) permIcon.textContent = 'ℹ️';
    if (permEl) permEl.textContent = t('notifPermStatusUnsupported');
    if (permHelp) permHelp.textContent = '';
    if (permCard) permCard.classList.add('perm-banner-warning');
    if (reqBtn) reqBtn.style.display = 'none';
    if (recheckBtn) recheckBtn.style.display = 'none';
    if (promptHint) promptHint.style.display = 'none';
    if (deniedHelp) deniedHelp.style.display = 'none';
    if (typesBlock) typesBlock.classList.add('is-disabled');
  } else {
    // 'default' — encara no demanat o usuari ha tancat el prompt
    if (permIcon) permIcon.textContent = '⚠️';
    if (permEl) permEl.textContent = t('notifPermStatusDefault');
    if (permHelp) permHelp.textContent = '';
    if (permCard) permCard.classList.add('perm-banner-info');
    if (reqBtn) reqBtn.style.display = 'flex';
    if (recheckBtn) recheckBtn.style.display = 'none';
    if (promptHint) promptHint.style.display = 'block';
    if (deniedHelp) deniedHelp.style.display = 'none';
    if (typesBlock) typesBlock.classList.add('is-disabled');
  }

  // Llista de tipus
  const list = document.getElementById('smart-notif-types-list');
  if (!list) return;
  list.innerHTML = '';

  SMART_NOTIF_TYPES.forEach(meta => {
    const cfg = settings.types[meta.id] || { enabled: false };
    const row = document.createElement('div');
    row.className = 'smart-notif-type-row';
    row.dataset.type = meta.id;

    let chipsHtml = '';
    if (meta.hasDay) {
      const days = t('notifDayShort');
      const dayLabel = (Array.isArray(days) ? days[(cfg.day || 0) % 7] : 'Dia');
      chipsHtml += '<button type="button" class="smart-notif-chip" data-action="day">📅 ' + escapeHtml(dayLabel) + '</button>';
    } else if (typeof meta.fixedDay === 'number') {
      // Dia imposat (no editable) — mostrem el nom com a chip read-only.
      const days = t('notifDayShort');
      const dayLabel = (Array.isArray(days) ? days[meta.fixedDay % 7] : 'Dia');
      chipsHtml += '<span class="smart-notif-chip smart-notif-chip-readonly">📅 ' + escapeHtml(dayLabel) + '</span>';
    }
    if (meta.hasHour) {
      const hh = String(cfg.hour || 0).padStart(2, '0');
      const mm = String(cfg.minute || 0).padStart(2, '0');
      chipsHtml += '<button type="button" class="smart-notif-chip" data-action="hour">⏰ ' + hh + ':' + mm + '</button>';
    }

    row.innerHTML =
      '<div class="smart-notif-type-info">' +
        '<p class="smart-notif-type-name">' + meta.emoji + ' <span>' + escapeHtml(t(meta.i18n)) + '</span></p>' +
        '<div class="smart-notif-type-chips">' + chipsHtml + '</div>' +
      '</div>' +
      '<label class="toggle">' +
        '<input type="checkbox" data-action="toggle"' + (cfg.enabled ? ' checked' : '') + '>' +
        '<span class="toggle-slider"></span>' +
      '</label>';
    list.appendChild(row);

    const cb = row.querySelector('[data-action="toggle"]');
    if (cb) cb.addEventListener('change', (e) => {
      setSmartNotifType(meta.id, { enabled: e.target.checked });
      updateNotifStatus();
    });
    const hourBtn = row.querySelector('[data-action="hour"]');
    if (hourBtn) hourBtn.addEventListener('click', () => promptHourFor(meta.id));
    const dayBtn = row.querySelector('[data-action="day"]');
    if (dayBtn) dayBtn.addEventListener('click', () => promptDayFor(meta.id));
  });
}

function promptHourFor(typeId) {
  const settings = getSmartNotifSettings();
  const cfg = settings.types[typeId] || {};
  const curHour = isFinite(cfg.hour) ? cfg.hour : 0;
  const curMin = isFinite(cfg.minute) ? cfg.minute : 0;
  const hh = String(curHour).padStart(2, '0');
  const mm = String(curMin).padStart(2, '0');
  openTimePickerModal(hh + ':' + mm, (newTime) => {
    const [h, m] = newTime.split(':').map(n => parseInt(n, 10));
    setSmartNotifType(typeId, { hour: h, minute: m });
    renderSmartNotifSettingsScreen();
  });
}

// Modal personalitzat per triar HH:MM. Hora i minuts amb input editable
// (es poden escriure directament) + steppers [−][+] al costat per als que
// prefereixin clicar. Es valida i es fa clamp al perdre focus i al guardar.
function openTimePickerModal(currentTime, onSave) {
  const parts = (currentTime || '00:00').split(':');
  let hour = parseInt(parts[0], 10);
  if (!isFinite(hour) || hour < 0 || hour > 23) hour = 0;
  let minute = parseInt(parts[1], 10);
  if (!isFinite(minute) || minute < 0 || minute > 59) minute = 0;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay time-picker-modal';
  overlay.innerHTML =
    '<div class="modal-content time-picker-content">' +
      '<p class="modal-title">⏰ ' + escapeHtml(t('timePickerTitle')) + '</p>' +
      '<div class="time-picker-row">' +
        '<div class="time-picker-section">' +
          '<p class="time-picker-label">' + escapeHtml(t('timePickerHour')) + '</p>' +
          '<div class="time-picker-stepper">' +
            '<button type="button" class="time-picker-step-btn" data-action="hour-down" aria-label="−">−</button>' +
            '<input type="number" class="time-picker-input" data-field="hour" min="0" max="23" inputmode="numeric" value="' + String(hour).padStart(2, '0') + '">' +
            '<button type="button" class="time-picker-step-btn" data-action="hour-up" aria-label="+">+</button>' +
          '</div>' +
        '</div>' +
        '<div class="time-picker-section">' +
          '<p class="time-picker-label">' + escapeHtml(t('timePickerMinutes')) + '</p>' +
          '<div class="time-picker-stepper">' +
            '<button type="button" class="time-picker-step-btn" data-action="min-down" aria-label="−">−</button>' +
            '<input type="number" class="time-picker-input" data-field="minute" min="0" max="59" inputmode="numeric" value="' + String(minute).padStart(2, '0') + '">' +
            '<button type="button" class="time-picker-step-btn" data-action="min-up" aria-label="+">+</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="modal-buttons time-picker-buttons">' +
        '<button type="button" class="modal-cancel" data-action="cancel">' + escapeHtml(t('cancel')) + '</button>' +
        '<button type="button" class="modal-confirm" data-action="save">' + escapeHtml(t('save')) + '</button>' +
      '</div>' +
    '</div>';
  openModal(overlay, () => { if (overlay.parentNode) document.body.removeChild(overlay); });

  const hourInput = overlay.querySelector('[data-field="hour"]');
  const minInput = overlay.querySelector('[data-field="minute"]');

  // Wrap-around per a steppers, clamp dur per a inputs (mai un valor il·legal
  // quan l'usuari escriu un número fora del rang).
  const clampHour = (h) => Math.max(0, Math.min(23, h));
  const clampMin  = (m) => Math.max(0, Math.min(59, m));
  const wrapHour  = (h) => ((h % 24) + 24) % 24;
  const wrapMin   = (m) => ((m % 60) + 60) % 60;

  const setHour = (h, fmt) => {
    hour = h;
    if (fmt !== false) hourInput.value = String(hour).padStart(2, '0');
  };
  const setMin = (m, fmt) => {
    minute = m;
    if (fmt !== false) minInput.value = String(minute).padStart(2, '0');
  };

  overlay.querySelector('[data-action="hour-down"]').addEventListener('click', () => setHour(wrapHour(hour - 1)));
  overlay.querySelector('[data-action="hour-up"]').addEventListener('click',   () => setHour(wrapHour(hour + 1)));
  overlay.querySelector('[data-action="min-down"]').addEventListener('click',  () => setMin(wrapMin(minute - 1)));
  overlay.querySelector('[data-action="min-up"]').addEventListener('click',    () => setMin(wrapMin(minute + 1)));

  // Mentre l'usuari escriu, només actualitzem la variable interna sense
  // re-formatar (per no esborrar-li els dígits a mig camí). El padding a
  // dos dígits es fa al perdre el focus.
  const onInput = (input, setter, clamp) => {
    const raw = parseInt(input.value, 10);
    if (!isFinite(raw)) return;
    setter(clamp(raw), false);
  };
  hourInput.addEventListener('input', () => onInput(hourInput, setHour, clampHour));
  minInput .addEventListener('input', () => onInput(minInput,  setMin,  clampMin));

  const onBlur = (input, setter, clamp) => {
    const raw = parseInt(input.value, 10);
    setter(isFinite(raw) ? clamp(raw) : 0, true);
  };
  hourInput.addEventListener('blur', () => onBlur(hourInput, setHour, clampHour));
  minInput .addEventListener('blur', () => onBlur(minInput,  setMin,  clampMin));

  // Selecciona tot el text al focus per facilitar reescriure.
  [hourInput, minInput].forEach(inp => inp.addEventListener('focus', () => inp.select()));

  const close = () => dismissModal(overlay);
  overlay.querySelector('[data-action="cancel"]').addEventListener('click', close);
  overlay.querySelector('[data-action="save"]').addEventListener('click', () => {
    // Validació final per si un input encara no ha disparat blur (p.e. enter directe).
    onBlur(hourInput, setHour, clampHour);
    onBlur(minInput,  setMin,  clampMin);
    close();
    const out = String(hour).padStart(2, '0') + ':' + String(minute).padStart(2, '0');
    try { onSave(out); } catch (e) { console.error(e); }
  });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
}

function promptDayFor(typeId) {
  const settings = getSmartNotifSettings();
  const cur = (settings.types[typeId] && settings.types[typeId].day) || 0;
  const days = t('notifDayShort');
  const names = Array.isArray(days)
    ? days
    : ['Diumenge', 'Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte'];
  // Display Dilluns-first, però mantenint el value getDay() (0=Diumenge).
  const order = [1, 2, 3, 4, 5, 6, 0];
  const options = order.map(i => ({ value: i, label: names[i] }));
  showSelectModal('📅', 'Dia de la setmana', null, options, cur, (day) => {
    setSmartNotifType(typeId, { day: day });
    renderSmartNotifSettingsScreen();
  });
}

async function handleRequestPermission() {
  console.log('[NOTIF] === requestPermission flow START ===');

  if (!('Notification' in window)) {
    console.log('[NOTIF] Notification API not supported in this browser');
    showToast(t('notifNotSupportedShort'));
    return;
  }

  console.log('[NOTIF] Click captured. Notification.permission BEFORE =', Notification.permission);

  try {
    // Cridem Notification.requestPermission() directament — sense passar per
    // window.Notif perquè el wrapper té un short-circuit que retorna el valor
    // actual sense re-prompted i podia confondre. El navegador només mostrarà
    // un prompt nou si Notification.permission és 'default'.
    let result;
    const ret = Notification.requestPermission();

    if (ret && typeof ret.then === 'function') {
      // API moderna: retorna Promise
      console.log('[NOTIF] Using Promise-based requestPermission');
      result = await ret;
    } else {
      // API antiga (Safari < 16): callback-based
      console.log('[NOTIF] Using callback-based requestPermission');
      result = ret || await new Promise(resolve => {
        try { Notification.requestPermission(resolve); }
        catch (e) { console.error('[NOTIF] callback shim failed:', e); resolve('default'); }
      });
    }

    console.log('[NOTIF] Browser response:', result, '· Notification.permission AFTER =', Notification.permission);

    // SEMPRE refresquem la UI després de la resposta, abans de qualsevol
    // missatge: així l'estat visual queda alineat amb la decisió del navegador.
    if (typeof renderSmartNotifSettingsScreen === 'function') renderSmartNotifSettingsScreen();
    updateNotifStatus();

    if (result === 'granted') {
      if (typeof setSmartNotifMaster === 'function') setSmartNotifMaster(true);
      showToast('✅ ' + t('notifPermissionGranted'));
      // Refresquem un cop més perquè el master pot haver canviat el bloc visible.
      if (typeof renderSmartNotifSettingsScreen === 'function') renderSmartNotifSettingsScreen();
      updateNotifStatus();
    } else if (result === 'denied') {
      showToast('🚫 ' + t('notifPermissionDenied'));
    } else {
      // 'default' — l'usuari ha tancat el prompt sense respondre.
      showToast(t('notifPermPromptClosed'));
    }
  } catch (err) {
    console.error('[NOTIF] Error requesting permission:', err);
    showToast('Error: ' + (err && err.message ? err.message : 'unknown'));
  }

  console.log('[NOTIF] === requestPermission flow END ===');
}

async function testNotificationNow() {
  console.log('[NOTIF] === Test button clicked ===');

  if (!('Notification' in window)) {
    console.log('[NOTIF] Notification API not supported');
    showToast(t('notifNotSupportedShort'));
    return;
  }

  console.log('[NOTIF] Permission BEFORE:', Notification.permission);

  // Si encara estem a 'default', demanem permís primer.
  if (Notification.permission === 'default') {
    console.log('[NOTIF] Requesting permission first...');
    try {
      const result = await Notification.requestPermission();
      console.log('[NOTIF] Permission after request:', result);
      if (typeof renderSmartNotifSettingsScreen === 'function') renderSmartNotifSettingsScreen();
      if (result !== 'granted') {
        showToast(result === 'denied' ? ('🚫 ' + t('notifPermissionDenied')) : t('notifPermRequired'));
        return;
      }
    } catch (e) {
      console.error('[NOTIF] requestPermission error:', e);
      showToast('Error: ' + (e && e.message ? e.message : 'unknown'));
      return;
    }
  }

  if (Notification.permission === 'denied') {
    console.log('[NOTIF] Permission denied — cannot send');
    showToast('🚫 ' + t('notifPermissionDenied'));
    return;
  }

  if (Notification.permission !== 'granted') {
    console.log('[NOTIF] Permission not granted (' + Notification.permission + ')');
    showToast(t('notifPermRequired'));
    return;
  }

  // Notificació directa amb new Notification(). Provem sense icon — algunes
  // implementacions del navegador fallen silenciosament si la URL no carrega.
  try {
    console.log('[NOTIF] Creating notification...');
    const notif = new Notification('🍳 BuyTe', {
      body: t('notifTestMessage'),
      tag: 'buyte-test'
    });
    console.log('[NOTIF] Notification object created:', notif);

    notif.onshow = () => {
      console.log('[NOTIF] onshow fired');
    };
    notif.onclick = () => {
      console.log('[NOTIF] onclick fired');
      window.focus();
      notif.close();
    };
    notif.onerror = (e) => {
      console.error('[NOTIF] onerror fired:', e);
      showToast(t('notifTestError'));
    };
    notif.onclose = () => {
      console.log('[NOTIF] onclose fired');
    };

    showToast('🔔 ' + t('notifTestSent'));
  } catch (err) {
    console.error('[NOTIF] new Notification() threw:', err);
    // Mòbil/PWA pot exigir Service Worker. Si en tenim un de registrat, provem-ho.
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        console.log('[NOTIF] Trying via Service Worker:', reg);
        await reg.showNotification('🍳 BuyTe', {
          body: t('notifTestMessage'),
          tag: 'buyte-test'
        });
        showToast('🔔 ' + t('notifTestSent'));
        return;
      } catch (swErr) {
        console.error('[NOTIF] Service Worker fallback failed:', swErr);
      }
    }
    showToast('Error: ' + (err && err.message ? err.message : t('notifTestError')));
  }
}



// Pregunta a l'usuari si vol afegir el producte consumit a la llista de la compra




function renderLocationsList() {
  const container = document.getElementById('locations-list');
  if (!container) return;
  container.innerHTML = '';

  locations.forEach((loc, index) => {
    const item = document.createElement('div');
    item.className = 'location-item';
    const isFirst = index === 0;
    const isLast = index === locations.length - 1;
    item.innerHTML = `
      <div class="loc-arrows">
        <button class="loc-move-btn" data-action="up" ${isFirst ? 'disabled' : ''} aria-label="Up">▲</button>
        <button class="loc-move-btn" data-action="down" ${isLast ? 'disabled' : ''} aria-label="Down">▼</button>
      </div>
      <span class="loc-item-emoji"></span>
      <div class="loc-item-info">
        <div class="loc-item-name"></div>
        <div class="loc-item-mult"></div>
      </div>
      <button class="loc-edit-btn" data-action="edit" aria-label="Edit">✏️</button>
    `;
    item.querySelector('.loc-item-emoji').textContent = loc.emoji;
    item.querySelector('.loc-item-name').textContent = getLocationName(loc);
    item.querySelector('.loc-item-mult').textContent =
      loc.category === 'freezer' ? '❄️ ' + t('catFreezer') :
      loc.category === 'pantry' ? '🥫 ' + t('catPantry') :
      '🧊 ' + t('catFridge');

    item.querySelector('[data-action="up"]').addEventListener('click', (e) => {
      e.stopPropagation(); moveLocation(index, -1);
    });
    item.querySelector('[data-action="down"]').addEventListener('click', (e) => {
      e.stopPropagation(); moveLocation(index, +1);
    });
    item.querySelector('[data-action="edit"]').addEventListener('click', (e) => {
      e.stopPropagation(); openLocationEditor(index);
    });
    container.appendChild(item);
  });
}

function moveLocation(index, direction) {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= locations.length) return;
  // Intercanvi
  const tmp = locations[index];
  locations[index] = locations[newIndex];
  locations[newIndex] = tmp;
  saveLocations();
  renderLocationsList();
}

let editingLocationIndex = -1;
let tempLocCategory = 'fridge';

function openLocationEditor(index) {
  editingLocationIndex = index;
  const isNew = index < 0;
  const loc = isNew ? { emoji: '📍', customName: '', category: 'fridge' } : locations[index];

  document.getElementById('loc-edit-title').textContent =
    isNew ? t('newLocation') : t('editLocation');
  document.getElementById('loc-edit-name').value = isNew ? '' : getLocationName(loc);
  tempLocCategory = loc.category || 'fridge';

  // Cursor d'estat per al picker compartit (openEmojiPicker target='location').
  // Actualitzem el <span> dins del .emoji-button perquè mostri l'emoji actual.
  tempLocEmoji = loc.emoji;
  const emojiBtnSpan = document.getElementById('loc-edit-emoji-current');
  if (emojiBtnSpan) emojiBtnSpan.textContent = loc.emoji;

  const delBtn = document.getElementById('loc-edit-delete');
  if (delBtn) delBtn.style.display = isNew ? 'none' : 'block';

  renderCategoryPicker();
  showScreen('location-edit');
}

function renderCategoryPicker() {
  const container = document.getElementById('storage-type-picker');
  if (!container) return;
  container.innerHTML = '';

  const cats = [
    { id: 'fridge', emoji: '🧊', labelKey: 'catFridge', descKey: 'catFridgeDesc' },
    { id: 'freezer', emoji: '❄️', labelKey: 'catFreezer', descKey: 'catFreezerDesc' },
    { id: 'pantry', emoji: '🥫', labelKey: 'catPantry', descKey: 'catPantryDesc' }
  ];

  cats.forEach(c => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'storage-type-option' + (c.id === tempLocCategory ? ' selected' : '');
    btn.innerHTML = `
      <span class="storage-type-emoji"></span>
      <div class="storage-type-info">
        <div class="storage-type-label"></div>
        <div class="storage-type-desc"></div>
      </div>
    `;
    btn.querySelector('.storage-type-emoji').textContent = c.emoji;
    btn.querySelector('.storage-type-label').textContent = t(c.labelKey);
    btn.querySelector('.storage-type-desc').textContent = t(c.descKey);
    btn.addEventListener('click', () => {
      tempLocCategory = c.id;
      renderCategoryPicker();
    });
    container.appendChild(btn);
  });
}

let tempLocEmoji = '📍';

function saveLocationEdit() {
  const name = document.getElementById('loc-edit-name').value.trim();
  if (!name) { showToast(t('needName')); return; }

  if (editingLocationIndex < 0) {
    locations.push({
      id: 'custom_' + Date.now(),
      emoji: tempLocEmoji,
      customName: name,
      category: tempLocCategory
    });
  } else {
    locations[editingLocationIndex].emoji = tempLocEmoji;
    locations[editingLocationIndex].customName = name;
    locations[editingLocationIndex].category = tempLocCategory;
  }

  saveLocations();
  renderLocationsList();
  showScreen('locations');
  showToast(t('saved'));
}

function deleteLocation(index) {
  if (locations.length <= 1) {
    showToast(t('needOneLocation'));
    return;
  }
  // Capturem la referència al moment del click (modal asíncron). Si la
  // llista canvia entre el click i el confirm, el splice per index podria
  // afectar la ubicació equivocada — re-busquem per id dins del callback.
  const target = locations[index];
  if (!target) return;
  showConfirmDangerModal(
    target.emoji || '📍',
    target.name || 'Ubicació',
    t('confirmDeleteLocation'),
    () => {
      const realIdx = locations.findIndex(l => l.id === target.id);
      if (realIdx < 0) return;
      locations.splice(realIdx, 1);
      // Si algun producte usava aquesta ubicació, l'assignem a la primera disponible
      products.forEach(p => {
        if (p.location === target.id) p.location = locations[0].id;
      });
      saveLocations();
      saveData();
      renderLocationsList();
      // Navegació al list dins del callback per evitar que el showScreen
      // dispari abans que l'usuari confirmi (era el bug del handler de
      // #loc-edit-delete a app.js abans del fix).
      showScreen('locations');
      showToast(t('deleted'));
    }
  );
}

function recalcDateByLocation() {
  const dateInput = document.getElementById('input-date');
  const baseDays = parseInt(dateInput.dataset.baseDays || '7');
  const finalDays = computeDaysForLocation(selectedLocation, baseDays, currentCategories);
  const d = new Date();
  d.setDate(d.getDate() + finalDays);
  dateInput.value = formatDateForInput(d);
  if (typeof window._syncDateEmptyState === 'function') window._syncDateEmptyState(dateInput);
}

// Obre la pantalla d'ubicacions recordant d'on s'ha cridat
// origin: 'add' (des del formulari), 'settings' (des de Configuració), o
// 'settings-content' (des de la sub-pantalla Contingut). Si l'origen és
// settings o una sub-pantalla settings-*, hi tornem; en cas contrari
// 'add' és el defecte.
function openLocations(origin) {
  const backBtn = document.getElementById('locations-back-btn');
  const isSettings = origin === 'settings' || (typeof origin === 'string' && origin.indexOf('settings-') === 0);
  if (backBtn) backBtn.dataset.back = isSettings ? origin : 'add';
  renderLocationsList();
  showScreen('locations');
}

// ============ CONFIGURACIÓ — 2 NIVELLS ============
// Nivell 1: pantalla principal amb 5 cards de categoria (regional /
// content / activity / app / data). Cadascuna obre una sub-pantalla amb
// pestanyes (nivell 2) que viuen a screen-settings-{cat}. Aquí només
// despatxem el clic — les sub-pantalles s'engeguen amb funcions
// openSettings<Cat>() definides als seus propis commits.

// ----- "Embedding" del cos d'una pantalla autònoma dins una sub-pantalla -----
// Per evitar duplicar l'HTML i els listeners, MOVEM els fills d'una pantalla
// existent dins l'àrea de contingut d'una sub-pantalla. Quan l'usuari surt
// de la sub-pantalla (showScreen() amb destí diferent), els fills tornen al
// seu lloc original. Aquesta tècnica preserva tots els event listeners i
// l'estat intern dels widgets.
//
// Mentre l'embed és actiu, també redirigim el back-btn de pantalles "filles"
// (les que s'obren des del cos embeddejat) cap al host de l'embed, perquè
// la navegació interna torni al sub-pàgina i no a la destinació original.
//
// Subtilesa: si l'usuari navega DES de la sub-pàgina a una de les filles
// registrades, restaurem només el cos (els fills tornen al seu lloc
// original) però MANTENIM les redireccions dels back-btns. Així, quan
// l'usuari torni de la fill, el back l'envia de nou a la sub-pàgina.
let _embeddedSourceId      = null;
let _embeddedTargetEl      = null;
let _embeddedHostId        = null;
let _embeddedChildBacks    = []; // [{el, originalBack}]
let _embeddedChildScreens  = []; // ['screen-supermarket-edit', ...]

function _revertEmbeddedChildBacks() {
  _embeddedChildBacks.forEach(rec => {
    if (!rec || !rec.el) return;
    if (rec.originalBack === undefined || rec.originalBack === null) rec.el.removeAttribute('data-back');
    else rec.el.dataset.back = rec.originalBack;
  });
  _embeddedChildBacks = [];
  _embeddedChildScreens = [];
}

function _moveEmbeddedBodyHome() {
  if (!_embeddedSourceId || !_embeddedTargetEl) return;
  const src = document.getElementById(_embeddedSourceId);
  if (src) {
    Array.from(_embeddedTargetEl.children).forEach(child => src.appendChild(child));
  }
  _embeddedSourceId = null;
  _embeddedTargetEl = null;
  _embeddedHostId   = null;
}

// Restauració completa: torna el cos al seu lloc i reverteix els back-btns
// dels fills. S'usa quan realment es deixa la sub-pàgina.
function restoreEmbeddedSettings() {
  _revertEmbeddedChildBacks();
  _moveEmbeddedBodyHome();
}

function _embedStandaloneBody(targetEl, sourceScreenId, hostScreenId, childScreenIds) {
  restoreEmbeddedSettings();
  if (!targetEl) return;
  targetEl.innerHTML = '';
  const src = document.getElementById(sourceScreenId);
  if (!src) return;
  Array.from(src.children).forEach(child => {
    if (!child.classList.contains('top-bar')) targetEl.appendChild(child);
  });
  _embeddedSourceId = sourceScreenId;
  _embeddedTargetEl = targetEl;
  _embeddedHostId   = hostScreenId;
  _embeddedChildBacks = [];
  _embeddedChildScreens = (childScreenIds || []).slice();
  const newBack = hostScreenId.replace(/^screen-/, '');
  (childScreenIds || []).forEach(cid => {
    const cs = document.getElementById(cid);
    if (!cs) return;
    const cbtn = cs.querySelector('.back-btn');
    if (!cbtn) return;
    _embeddedChildBacks.push({ el: cbtn, originalBack: cbtn.dataset.back });
    cbtn.dataset.back = newBack;
  });
}

// Embolcalla showScreen UNA SOLA VEGADA per restaurar contingut prestat
// quan es navega a una pantalla diferent del host de l'embed. Si el destí
// és una pantalla "filla" registrada, només movem el cos a casa — els
// back-btns dels fills romanen redirigits, així el back de la fill torna
// a la sub-pàgina.
(function wrapShowScreenForEmbedding() {
  if (typeof window === 'undefined' || typeof window.showScreen !== 'function') return;
  if (window.__settingsEmbedWrapped) return;
  window.__settingsEmbedWrapped = true;
  const original = window.showScreen;
  window.showScreen = function (name) {
    if (_embeddedHostId && ('screen-' + name) !== _embeddedHostId) {
      const targetId = 'screen-' + name;
      const isChild = _embeddedChildScreens.indexOf(targetId) !== -1;
      if (isChild) _moveEmbeddedBodyHome();
      else restoreEmbeddedSettings();
    }
    return original.apply(this, arguments);
  };
})();

// ----- Sub-pantalla "Regional" (Idioma + País amb pestanyes) -----
let activeRegionalTab = 'idioma';

function openSettingsRegional() {
  renderSettingsRegional();
  showScreen('settings-regional');
}

function renderSettingsRegional() {
  document.querySelectorAll('#screen-settings-regional .sub-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.subtab === activeRegionalTab);
  });
  const area = document.getElementById('settings-regional-area');
  if (!area) return;
  area.innerHTML = '';
  if (activeRegionalTab === 'idioma') {
    const wrap = document.createElement('div');
    wrap.className = 'lang-list';
    area.appendChild(wrap);
    if (typeof renderLangListInto === 'function') renderLangListInto(wrap);
  } else if (activeRegionalTab === 'pais') {
    const hint = document.createElement('p');
    hint.className = 'section-hint';
    hint.textContent = t('countryHint');
    area.appendChild(hint);
    const wrap = document.createElement('div');
    wrap.className = 'welcome-country-list';
    area.appendChild(wrap);
    if (typeof renderCountryListInto === 'function') renderCountryListInto(wrap);
  }
}

function attachSettingsRegionalListeners() {
  document.querySelectorAll('#screen-settings-regional .sub-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeRegionalTab = tab.dataset.subtab || 'idioma';
      renderSettingsRegional();
    });
  });
}

// ----- Sub-pantalla "Contingut" (Botigues / Zones / Populars / Receptes) -----
let activeContentTab = 'botigues';

function openSettingsContent() {
  renderSettingsContent();
  showScreen('settings-content');
}

// Helper compartit per pintar el bloc "resum + botó d'acció" centrat.
function _subContentBlock(summaryHtml, btnLabel, onClick) {
  const wrap = document.createElement('div');
  wrap.className = 'settings-sub-content';
  wrap.innerHTML = summaryHtml +
    '<button type="button" class="primary-btn settings-sub-btn">' + escapeHtml(btnLabel) + '</button>';
  wrap.querySelector('button').addEventListener('click', onClick);
  return wrap;
}

// Configura el botó d'acció (✏️/✓) de la capçalera de Configuració >
// Contingut segons la pestanya activa. Per a tabs amb mode edició
// (Botigues, Productes, Receptes) mostrem un toggle; per a Zones l'amaguem.
function _updateSettingsContentActionBtn() {
  const btn = document.getElementById('settings-content-action-btn');
  if (!btn) return;
  // Reset estats anteriors
  btn.onclick = null;
  btn.classList.remove('is-active');
  btn.style.display = 'none';
  btn.dataset.role = '';

  if (activeContentTab === 'populars') {
    btn.style.display = 'flex';
    btn.dataset.role = 'popular';
    const inEdit = (typeof popularMode !== 'undefined' && popularMode === 'edit');
    btn.textContent = inEdit ? '✓' : '✏️';
    btn.setAttribute('aria-label', inEdit ? 'Done' : 'Edit');
    btn.classList.toggle('is-active', inEdit);
    btn.onclick = () => {
      if (typeof togglePopularEditMode === 'function') togglePopularEditMode();
      _updateSettingsContentActionBtn();
    };
  } else if (activeContentTab === 'botigues') {
    btn.style.display = 'flex';
    btn.dataset.role = 'shops';
    const inEdit = (typeof manageSupermarketsMode !== 'undefined' && manageSupermarketsMode === 'edit');
    btn.textContent = inEdit ? '✓' : '✏️';
    btn.setAttribute('aria-label', inEdit ? 'Done' : 'Edit');
    btn.classList.toggle('is-active', inEdit);
    btn.onclick = () => {
      if (typeof toggleEditShopsMode === 'function') toggleEditShopsMode();
      _updateSettingsContentActionBtn();
    };
  } else if (activeContentTab === 'receptes') {
    btn.style.display = 'flex';
    btn.dataset.role = 'recipes';
    const inEdit = (typeof recipeEditMode !== 'undefined' && recipeEditMode === true);
    btn.textContent = inEdit ? '✓' : '✏️';
    btn.setAttribute('aria-label', inEdit ? 'Done' : 'Edit');
    btn.classList.toggle('is-active', inEdit);
    btn.onclick = () => {
      if (typeof toggleRecipeEditMode === 'function') toggleRecipeEditMode();
      _updateSettingsContentActionBtn();
    };
  }
}

function renderSettingsContent() {
  document.querySelectorAll('#screen-settings-content .sub-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.subtab === activeContentTab);
  });
  const area = document.getElementById('settings-content-area');
  if (!area) return;

  if (activeContentTab === 'botigues') {
    // Incrustem el cos de screen-manage-supermarkets directament dins la
    // pestanya. Tots els listeners (checkbox, fletxes, edit, delete, toggle
    // edit mode, afegir custom) continuen funcionant perquè els elements
    // són els mateixos — només viuen temporalment dins la sub-pantalla.
    // Registrem screen-supermarket-edit com a fill perquè el seu back torni
    // al sub-page mentre estem en aquest flux.
    _embedStandaloneBody(area, 'screen-manage-supermarkets', 'screen-settings-content', ['screen-supermarket-edit']);
    if (typeof manageSupermarketsMode !== 'undefined') manageSupermarketsMode = 'view';
    if (typeof renderManageSupermarkets === 'function') renderManageSupermarkets();
    _updateSettingsContentActionBtn();
    return;
  }

  if (activeContentTab === 'zones') {
    // Embolcalla el cos de screen-locations dins la pestanya. La llista,
    // les fletxes de reordenació i el botó "Nova ubicació" continuen
    // funcionant tal com ho fan a la pantalla autònoma. Editar una zona
    // navega a screen-location-edit; mentre l'embed és actiu, el seu back
    // torna a la sub-pàgina.
    _embedStandaloneBody(area, 'screen-locations', 'screen-settings-content', ['screen-location-edit']);
    if (typeof renderLocationsList === 'function') renderLocationsList();
    _updateSettingsContentActionBtn();
    return;
  }

  if (activeContentTab === 'populars') {
    // Embolcalla el cos de screen-popular dins la pestanya. Cercador,
    // llista, toolbar (sort/add custom) i botó "Guardar canvis" continuen
    // funcionant. Editar un popular obre screen-popular-edit — registrem-lo
    // com a fill perquè el back torni al sub-pàgina.
    // popularOrigin='settings' és CRÍTIC: sense això, clicar una fila
    // dispara openAddForm (EatMe) en comptes d'editar el popular.
    _embedStandaloneBody(area, 'screen-popular', 'screen-settings-content', ['screen-popular-edit']);
    if (typeof popularOrigin !== 'undefined') popularOrigin = 'settings';
    if (typeof popularMode !== 'undefined') popularMode = 'view';
    if (typeof popularSearchQuery !== 'undefined') popularSearchQuery = '';
    const searchInput = document.getElementById('popular-search');
    if (searchInput) searchInput.value = '';
    if (typeof renderPopularList === 'function') renderPopularList();
    _updateSettingsContentActionBtn();
    return;
  }

  if (activeContentTab === 'categories') {
    // Embolcalla el cos de screen-manage-categories dins la pestanya.
    // Llista, botó "Crear nova" i obertura del formulari d'edició
    // continuen funcionant; screen-category-edit es registra com a fill
    // perquè el seu back torni al sub-pàgina mentre l'embed és actiu.
    _embedStandaloneBody(area, 'screen-manage-categories', 'screen-settings-content', ['screen-category-edit']);
    if (typeof manageCategoriesOrigin !== 'undefined') manageCategoriesOrigin = 'settings';
    if (typeof renderCategoriesList === 'function') renderCategoriesList();
    _updateSettingsContentActionBtn();
    return;
  }

  if (activeContentTab === 'receptes') {
    // Embolcalla el cos de screen-cookme dins la pestanya. Filtres,
    // cercador, llista i botó "Afegir recepta nova" funcionen igual.
    // screen-recipe-detail i screen-recipe-edit es registren com a fills
    // perquè el back torni al sub-pàgina mentre l'embed és actiu.
    _embedStandaloneBody(area, 'screen-cookme', 'screen-settings-content', ['screen-recipe-detail', 'screen-recipe-edit']);
    if (typeof recipeEditMode !== 'undefined') recipeEditMode = false;
    if (typeof updateRecipeEditModeBtn === 'function') updateRecipeEditModeBtn();
    if (typeof renderCookMe === 'function') renderCookMe();
    // El cos del screen-cookme s'ha mogut a una zona nova del DOM, així
    // que cal recrear el Swiper cube per recalcular la geometria sobre
    // les dimensions actuals (vegeu _ensureCookMeSwiper).
    if (typeof _initCookMeSwiperWhenReady === 'function') _initCookMeSwiperWhenReady();
    _updateSettingsContentActionBtn();
    return;
  }
}

function attachSettingsContentListeners() {
  document.querySelectorAll('#screen-settings-content .sub-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeContentTab = tab.dataset.subtab || 'botigues';
      renderSettingsContent();
    });
  });
}

// ----- Sub-pantalla "Activitat" (Impacte / Estadístiques) -----
let activeActivityTab = 'impacte';

function openSettingsActivity() {
  renderSettingsActivity();
  showScreen('settings-activity');
}

function renderSettingsActivity() {
  document.querySelectorAll('#screen-settings-activity .sub-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.subtab === activeActivityTab);
  });
  const area = document.getElementById('settings-activity-area');
  if (!area) return;

  if (activeActivityTab === 'impacte') {
    // Embolcalla tot el cos de screen-impact. El banner de nivell, els
    // pills de període, els gràfics i les targetes funcionen igual.
    // screen-achievements és el destí del banner de nivell — el registrem
    // perquè el back torni a la sub-pàgina.
    _embedStandaloneBody(area, 'screen-impact', 'screen-settings-activity', ['screen-achievements']);
    if (typeof openImpact === 'function') {
      // Re-execució del setup de la pantalla d'impacte (period, render,
      // banner) sense canviar de pantalla — fem servir les funcions
      // internes mitjançant un atajamiento: cridem renderImpact directe.
      if (typeof impactPeriod !== 'undefined') impactPeriod = 'month';
      document.querySelectorAll('#impact-period-pills .impact-period-pill').forEach(p => {
        p.classList.toggle('active', p.dataset.period === 'month');
      });
      if (typeof renderImpact === 'function') renderImpact();
      if (typeof renderImpactLevelBanner === 'function') renderImpactLevelBanner();
    }
    return;
  }

  if (activeActivityTab === 'estadistiques') {
    // Embolcalla el cos de screen-stats. Si hi ha empty state es mostra
    // ell mateix; si hi ha dades, renderitzem el body amb renderStatsBody.
    _embedStandaloneBody(area, 'screen-stats', 'screen-settings-activity');
    const empty = document.getElementById('stats-empty');
    const body = document.getElementById('stats-body');
    const history = (typeof loadConsumptionHistory === 'function') ? loadConsumptionHistory() : [];
    if (!history || history.length === 0) {
      if (empty) empty.style.display = 'block';
      if (body) body.innerHTML = '';
    } else {
      if (empty) empty.style.display = 'none';
      if (body && typeof renderStatsBody === 'function') body.innerHTML = renderStatsBody(history);
    }
    return;
  }

  if (activeActivityTab === 'despeses') {
    // Embolcalla el cos de screen-expenses. renderExpenses() calcula
    // les agregacions des de purchase_history a cada crida — no cal
    // refresh automàtic més enllà del render. 3 estats:
    // (1) sense history → empty global; (2) history sí però no al
    // període → cards amb 0/placeholder; (3) ple → cards normals.
    _embedStandaloneBody(area, 'screen-expenses', 'screen-settings-activity');
    if (typeof renderExpenses === 'function') renderExpenses();
    return;
  }

  if (activeActivityTab === 'suggeriments') {
    // No depèn de cap pantalla externa: renderitzem directament. Restaurem
    // qualsevol embed previ perquè el contingut prestat torni a casa.
    restoreEmbeddedSettings();
    if (typeof renderPatternsSubTab === 'function') renderPatternsSubTab(area);
    else area.innerHTML = '';
    return;
  }
}

function attachSettingsActivityListeners() {
  document.querySelectorAll('#screen-settings-activity .sub-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeActivityTab = tab.dataset.subtab || 'impacte';
      renderSettingsActivity();
    });
  });
}

// ----- Sub-pantalla "Aplicació" (Aparença / Notificacions / Sincronització) -----
let activeAppTab = 'aparenca';

function openSettingsApp() {
  renderSettingsApp();
  showScreen('settings-app');
}

// Llegeix el tema actiu del DOM (data-theme), preferint 'light' com a defecte.
function _currentThemeMode() {
  const m = document.documentElement.getAttribute('data-theme');
  return (m === 'dark') ? 'dark' : 'light';
}

function _notifSummaryText() {
  const perm = (typeof Notification !== 'undefined') ? Notification.permission : 'unsupported';
  let masterOn = false;
  let count = 0;
  try {
    const raw = localStorage.getItem('eatmefirst_smart_notif_v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      masterOn = parsed && parsed.enabled === true;
      if (parsed && parsed.types) count = Object.values(parsed.types).filter(c => c && c.enabled).length;
    } else if (typeof getSmartNotifSettings === 'function') {
      const s = getSmartNotifSettings();
      masterOn = !!s.enabled;
      count = Object.values(s.types || {}).filter(c => c && c.enabled).length;
    }
  } catch (e) {}
  if (perm === 'unsupported') return t('notifNotSupportedShort');
  if (!masterOn) return t('notifStatusOff');
  if (perm === 'granted') return t('notifStatusOn', count);
  if (perm === 'denied') return t('notifStatusOnDenied');
  return t('notifStatusOnNoPerm');
}

function renderSettingsApp() {
  document.querySelectorAll('#screen-settings-app .sub-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.subtab === activeAppTab);
  });
  const area = document.getElementById('settings-app-area');
  if (!area) return;
  // Si hi ha contingut prestat d'una visita anterior (Notif/Sync), tornem-lo
  // a casa ABANS de tocar l'innerHTML. Sense aquest pas, la pestanya
  // Aparença (no-embed) destruiria el cos de screen-notifications /
  // screen-sync i la propera visita d'aquelles pestanyes quedaria buida.
  if (typeof restoreEmbeddedSettings === 'function') restoreEmbeddedSettings();
  area.innerHTML = '';

  if (activeAppTab === 'aparenca') {
    // Chips Clar / Fosc — modifiquen el tema directament, sense canvi de pantalla.
    // El títol "Aparença" ja viu a la capçalera de la sub-pantalla, així
    // que aquí no el repetim.
    const wrap = document.createElement('div');
    wrap.className = 'settings-sub-content';
    const cur = _currentThemeMode();
    wrap.innerHTML =
      '<div class="theme-chips">' +
        '<button type="button" class="theme-chip' + (cur === 'light' ? ' active' : '') + '" data-mode="light">🌞 ' + escapeHtml(t('lightMode')) + '</button>' +
        '<button type="button" class="theme-chip' + (cur === 'dark'  ? ' active' : '') + '" data-mode="dark">🌙 ' + escapeHtml(t('darkMode')) + '</button>' +
      '</div>';
    area.appendChild(wrap);
    wrap.querySelectorAll('.theme-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        if (typeof applyTheme === 'function') applyTheme(chip.dataset.mode);
        renderSettingsApp();
      });
    });
  } else if (activeAppTab === 'notif') {
    // Embolcalla el cos de screen-notifications dins la pestanya. Master
    // toggle, banner de permisos, llista de tipus i botó de prova
    // continuen funcionant.
    _embedStandaloneBody(area, 'screen-notifications', 'screen-settings-app');
    if (typeof exposeForNotifications === 'function') exposeForNotifications();
    if (typeof renderSmartNotifSettingsScreen === 'function') renderSmartNotifSettingsScreen();
    return;
  } else if (activeAppTab === 'sync') {
    // Embolcalla el cos de screen-sync dins la pestanya. Crear/connectar
    // llista, copiar codi i desconnectar funcionen igual. screen-sync-join
    // (introduir codi) es registra com a fill perquè el back torni al
    // sub-pàgina.
    _embedStandaloneBody(area, 'screen-sync', 'screen-settings-app', ['screen-sync-join']);
    if (typeof updateSyncScreen === 'function') updateSyncScreen();
    return;
  }
}

function attachSettingsAppListeners() {
  document.querySelectorAll('#screen-settings-app .sub-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeAppTab = tab.dataset.subtab || 'aparenca';
      renderSettingsApp();
    });
  });
}

// ----- Sub-pantalla "Dades" (Esborrar / Exportar / Importar) -----
let activeDataTab = 'esborrar';

function openSettingsData() {
  renderSettingsData();
  showScreen('settings-data');
}

// Helper per pintar una card destructiva al tab Esborrar. Cada una porta
// data-reset-action que el delegate mapeja a la funció corresponent.
function _resetCardHtml(action, emoji, titleKey, subText, danger) {
  const cls = danger ? 'settings-card danger-card' : 'settings-card danger-card-soft';
  return '<button type="button" class="' + cls + '" data-reset-action="' + action + '">' +
           '<div class="settings-card-icon"><span>' + emoji + '</span></div>' +
           '<div class="settings-card-info">' +
             '<p class="settings-card-title">' + escapeHtml(t(titleKey)) + '</p>' +
             '<p class="settings-card-sub">' + escapeHtml(subText) + '</p>' +
           '</div>' +
           '<span class="settings-card-arrow">›</span>' +
         '</button>';
}

function renderSettingsData() {
  document.querySelectorAll('#screen-settings-data .sub-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.subtab === activeDataTab);
  });
  const area = document.getElementById('settings-data-area');
  if (!area) return;

  if (activeDataTab === 'esborrar') {
    // Banner curt explicatiu (vermell suau) + cards d'esborrats individuals.
    area.innerHTML =
      _renderInfoBanner('warning', '⚠️', t('eraseBannerTitle'), t('eraseBannerText'), 'erase') +
      '<div class="settings-cards reset-data-cards">' +
        _resetCardHtml('eatme',         '🥗', 'resetBitemeTitle',        t('resetBitemeSub'),        false) +
        _resetCardHtml('shopping',      '🛒', 'resetShoppingTitle',      t('resetShoppingSub'),      false) +
        _resetCardHtml('impact',        '📊', 'resetImpactTitle',        t('resetImpactSub'),        false) +
        _resetCardHtml('recipe-usage',  '🍳', 'resetRecipeUsageTitle',   t('resetRecipeUsageSub'),   false) +
        _resetCardHtml('gamification',  '🏆', 'resetGamificationTitle',  t('resetGamificationSub'),  false) +
        _resetCardHtml('patterns',      '🧠', 'resetPatternsTitle',      t('resetPatternsSub'),      false) +
      '</div>' +
      '<div class="reset-data-divider"></div>' +
      _resetCardHtml('all', '🗑️', 'resetAllTitle', t('cantUndo'), true);
  } else if (activeDataTab === 'data') {
    // Banner curt (blau suau) + Exportar + Importar.
    area.innerHTML =
      _renderInfoBanner('info', '💾', t('exportBannerTitle'), t('exportBannerText'), 'export') +
      '<div class="data-action-block">' +
        '<div class="data-action-emoji">📤</div>' +
        '<p class="data-action-title">' + escapeHtml(t('downloadDataTitle')) + '</p>' +
        '<p class="data-action-desc">' + escapeHtml(t('downloadDataSub')) + '</p>' +
        '<button type="button" class="primary-btn settings-sub-btn" data-data-action="export">' + escapeHtml(t('downloadDataBtn')) + '</button>' +
      '</div>' +
      '<div class="data-action-divider"></div>' +
      '<div class="data-action-block">' +
        '<div class="data-action-emoji">📥</div>' +
        '<p class="data-action-title">' + escapeHtml(t('importDataTitle')) + '</p>' +
        '<p class="data-action-desc">' + escapeHtml(t('importDataSub')) + '</p>' +
        '<button type="button" class="primary-btn settings-sub-btn" data-data-action="import">' + escapeHtml(t('importDataBtn')) + '</button>' +
      '</div>';
  } else if (activeDataTab === 'copies') {
    // Pestanya de gestió de còpies de seguretat locals. Vegeu js/backup.js.
    // El banner verd informatiu el renderitza renderBackupsTab a dalt
    // (substitueix el banner cian "scope notice" antic).
    renderBackupsTab(area);
  }
}

// Helper compartit per a banners curts informatius a les pestanyes de
// Configuració > Dades. Tres variants: 'warning' (vermell suau),
// 'info' (blau suau), 'success' (verd suau). El botó "Saber-ne més"
// té data-info=infoKey i el handle el captura el delegate de l'area.
function _renderInfoBanner(variant, icon, title, text, infoKey) {
  return '<div class="info-banner banner-' + variant + '">' +
    '<div class="info-banner-icon">' + icon + '</div>' +
    '<div class="info-banner-content">' +
      '<strong>' + escapeHtml(title) + '</strong>' +
      '<p>' + escapeHtml(text) + '</p>' +
      '<button type="button" class="info-banner-more" data-info="' + escapeHtml(infoKey) + '">' + escapeHtml(t('infoBannerMore')) + '</button>' +
    '</div>' +
  '</div>';
}

// Renderitza el contingut de la pestanya "Còpies": resum + botons
// d'acció (exportar/importar) + llista de còpies amb restaurar i
// esborrar a cada fila. Es regenera a cada renderSettingsData('copies'),
// així cada visita reflecteix l'estat actual del localStorage.
function renderBackupsTab(area) {
  if (!area) return;
  const BS = window.BackupSystem;
  if (!BS) {
    area.innerHTML = '<p class="section-hint">' + escapeHtml(t('backupsUnavailable')) + '</p>';
    return;
  }

  const backups = BS.listBackups().slice().sort((a, b) => b.timestamp - a.timestamp);
  const daysSince = BS.daysSinceLastExport();
  const lastExportLabel = (daysSince === null)
    ? t('backupsLastExportNever')
    : t('backupsLastExportDays', daysSince);
  const showReminder = BS.shouldRemindExport();

  const rows = backups.map(b => {
    const date = new Date(b.timestamp);
    const dateLabel = _formatBackupDate(date);
    const sizeLabel = _formatBackupSize(b);
    return '<div class="backup-item" data-backup-ts="' + b.timestamp + '">' +
      '<div class="backup-item-info">' +
        '<p class="backup-item-date">📅 ' + escapeHtml(dateLabel) + '</p>' +
        '<p class="backup-item-meta">' + escapeHtml(sizeLabel) + '</p>' +
      '</div>' +
      '<div class="backup-item-actions">' +
        '<button type="button" class="backup-restore-btn" data-backup-action="restore" aria-label="' + escapeHtml(t('backupsRestoreBtn')) + '">' + escapeHtml(t('backupsRestoreBtn')) + '</button>' +
        '<button type="button" class="backup-delete-btn" data-backup-action="delete" aria-label="' + escapeHtml(t('backupsDeleteBtn')) + '">×</button>' +
      '</div>' +
    '</div>';
  }).join('');

  const reminderBlock = showReminder
    ? '<div class="backup-export-reminder">' +
        '<span class="backup-export-reminder-icon">💾</span>' +
        '<span class="backup-export-reminder-text">' + escapeHtml(t('backupsExportReminder', daysSince)) + '</span>' +
        '<button type="button" class="backup-export-reminder-dismiss" data-backup-action="dismiss-reminder" aria-label="×">×</button>' +
      '</div>'
    : '';

  const listBlock = backups.length === 0
    ? '<p class="backup-empty">' + escapeHtml(t('backupsEmpty')) + '</p>'
    : '<div class="backup-list">' + rows + '</div>';

  // Banner verd suau (info-banner banner-success) amb el resum curt i
  // el botó "Saber-ne més" que obre el modal explicatiu detallat.
  // Substitueix l'antic banner cian (.backup-scope-notice) amb un estil
  // unificat amb les altres dues pestanyes de Dades.
  const scopeNoticeBlock = _renderInfoBanner(
    'success',
    '🛡️',
    t('backupsBannerTitle'),
    t('backupsBannerText'),
    'backups'
  );

  area.innerHTML =
    reminderBlock +
    scopeNoticeBlock +
    '<div class="backup-info-box">' +
      '<p class="backup-info-line">📅 ' + escapeHtml(t('backupsAutoHint')) + '</p>' +
      '<p class="backup-info-line">' + escapeHtml(t('backupsCount', backups.length)) + ' (' + t('backupsMax', BS.MAX_COUNT) + ')</p>' +
      '<p class="backup-info-line">' + escapeHtml(t('backupsLastExportLabel')) + ' <strong>' + escapeHtml(lastExportLabel) + '</strong></p>' +
    '</div>' +
    '<div class="backup-actions-row">' +
      '<button type="button" class="primary-btn settings-sub-btn" data-backup-action="export-now">📤 ' + escapeHtml(t('backupsExportNow')) + '</button>' +
      '<button type="button" class="primary-btn settings-sub-btn" data-backup-action="import-file">📥 ' + escapeHtml(t('backupsImportFile')) + '</button>' +
    '</div>' +
    '<p class="settings-hint">' + escapeHtml(t('backupsManualHint')) + '</p>' +
    listBlock;
}

function _formatBackupDate(date) {
  // Català: dilluns 7 de maig, 14:23
  const day = date.getDate();
  const month = date.toLocaleDateString(getLocale(), { month: 'long' });
  const time = date.toLocaleTimeString(getLocale(), { hour: '2-digit', minute: '2-digit' });
  return day + ' ' + t('ofMonth') + ' ' + month + ', ' + time;
}

function _formatBackupSize(backup) {
  try {
    const bytes = JSON.stringify(backup).length;
    if (bytes < 1024) return bytes + ' B';
    const kb = bytes / 1024;
    if (kb < 1024) return kb.toFixed(1) + ' KB';
    return (kb / 1024).toFixed(2) + ' MB';
  } catch (e) {
    return '';
  }
}

function _confirmRestoreBackup(timestamp) {
  const BS = window.BackupSystem;
  if (!BS) return;
  const backup = BS.listBackups().find(b => b.timestamp === timestamp);
  if (!backup) return;
  const dateLabel = _formatBackupDate(new Date(timestamp));
  showConfirmDangerModal(
    '🔄',
    t('backupsRestoreTitle'),
    t('backupsRestoreConfirm', dateLabel),
    () => {
      const ok = BS.restoreBackup(timestamp);
      if (!ok) {
        showToast(t('backupsRestoreError'));
        return;
      }
      // El backup ja s'ha aplicat al localStorage; reconstruïm la mateixa
      // estructura {data:{...}} a partir de les claus actuals per generar
      // un toast amb les xifres reals.
      const dataSnapshot = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('eatmefirst_')) {
          try { dataSnapshot[k] = JSON.parse(localStorage.getItem(k)); } catch (e) {}
        }
      }
      showToast('✅ ' + _buildImportToast(dataSnapshot));
      // Si Firebase sync està actiu, pujar l'estat restaurat al cloud
      // ABANS del reload — vegeu el comentari paral·lel a importData.
      // Sense això, la sync silenciosament desfaria la restauració.
      const reloadDelay = _syncImportedStateToCloud() ? 1800 : 600;
      // Recarrega la pàgina perquè totes les vistes (productes, llistes,
      // receptes, etc.) llegeixin l'estat acabat de restaurar des del
      // localStorage. Més senzill i segur que intentar refrescar a mà
      // cada mòdul.
      setTimeout(() => window.location.reload(), reloadDelay);
    }
  );
}

// Modal informatiu d'una sola acció ("Entesos") per als botons
// "Saber-ne més" dels banners de Configuració > Dades. Accepta un
// array de paràgrafs (cadascun pot contenir \n per a salts dins el
// mateix paràgraf — es renderitza amb white-space:pre-line via la
// classe .info-modal-paragraph).
function _showInfoModal(emoji, title, paragraphs) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  // Suport markdown-lite per a negretes: **text** → <strong>text</strong>.
  // S'aplica DESPRÉS de escapeHtml perquè els asteriscs no són HTML.
  // Retrocompatible (cap i18n string ni caller existent conté **).
  const paraHtml = (paragraphs || []).map(p =>
    '<p class="info-modal-paragraph">' +
      escapeHtml(p).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') +
    '</p>'
  ).join('');
  overlay.innerHTML =
    '<div class="modal-content info-modal-content">' +
      '<div class="modal-emoji-big">' + emoji + '</div>' +
      '<p class="modal-title">' + escapeHtml(title) + '</p>' +
      '<div class="info-modal-body">' + paraHtml + '</div>' +
      '<div class="modal-buttons">' +
        '<button class="modal-confirm" id="info-modal-close">' + escapeHtml(t('infoModalClose')) + '</button>' +
      '</div>' +
    '</div>';
  openModal(overlay, () => { if (overlay.parentNode) document.body.removeChild(overlay); });
  const close = () => dismissModal(overlay);
  overlay.querySelector('#info-modal-close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
}

// Mapa dels modals "Saber-ne més". Cada entrada té emoji, títol i
// paràgrafs. Es referencia per la clau (data-info attribute al
// botó del banner) — vegeu _renderInfoBanner i el delegate de
// l'area a attachSettingsDataListeners.
function _getInfoModalConfig(key) {
  if (key === 'erase') {
    return {
      emoji: '🗑️',
      title: t('eraseInfoTitle'),
      paragraphs: [t('eraseInfoP1'), t('eraseInfoP2'), t('eraseInfoP3')]
    };
  }
  if (key === 'export') {
    return {
      emoji: '📁',
      title: t('exportInfoTitle'),
      paragraphs: [t('exportInfoP1'), t('exportInfoP2'), t('exportInfoP3')]
    };
  }
  if (key === 'backups') {
    return {
      emoji: '💾',
      title: t('backupsInfoTitle'),
      paragraphs: [t('backupsInfoP1'), t('backupsInfoP2'), t('backupsInfoP3'), t('backupsInfoP4')]
    };
  }
  return null;
}

// Construeix un toast informatiu amb les xifres del que s'acaba
// d'importar/restaurar. Mostra només categories amb contingut perquè
// no quedi un toast llarg amb molts "0". Recorre les claus rellevants
// del payload (objecte amb estructura {key: parsedValue}).
function _buildImportToast(data) {
  if (!data || typeof data !== 'object') return t('importDone');
  const parts = [];
  const len = (key) => {
    const v = data[key];
    return Array.isArray(v) ? v.length : 0;
  };
  const nProducts = len('eatmefirst_products');
  const nShopping = len('eatmefirst_shopping_items');
  const nRecipes = len('eatmefirst_custom_recipes');
  const nSupers = len('eatmefirst_supermarkets');
  const nLocations = len('eatmefirst_locations');
  if (nProducts > 0) parts.push(t('countProducts', nProducts));
  if (nShopping > 0) parts.push(t('countShopping', nShopping));
  if (nRecipes > 0) parts.push(t('countRecipes', nRecipes));
  if (nSupers > 0) parts.push(t('countSupers', nSupers));
  if (nLocations > 0) parts.push(t('countLocations', nLocations));
  if (parts.length === 0) return t('importDone');
  return t('importedDetailToast', { parts });
}

// Helper compartit per importData i _confirmRestoreBackup. Si Firebase
// sync està actiu, llegeix l'estat actual del localStorage (just acabat
// d'escriure per l'import/restore) i el puja al cloud. Retorna true si
// s'ha disparat la pujada (i per tant cal allargar el delay del reload
// perquè el debounce de FBSync.upload — 1000ms — tingui temps de
// completar-se), false si no calia.
function _syncImportedStateToCloud() {
  if (!window.FBSync || typeof window.FBSync.isConnected !== 'function') return false;
  if (!window.FBSync.isConnected()) return false;
  try {
    const payload = {
      products: JSON.parse(localStorage.getItem('eatmefirst_products') || '[]'),
      locations: JSON.parse(localStorage.getItem('eatmefirst_locations') || '[]'),
      stats: JSON.parse(localStorage.getItem('eatmefirst_stats') || '{}'),
      supermarkets: JSON.parse(localStorage.getItem('eatmefirst_supermarkets') || '[]'),
      shoppingItems: JSON.parse(localStorage.getItem('eatmefirst_shopping_items') || '[]'),
      purchaseHistory: JSON.parse(localStorage.getItem('eatmefirst_purchase_history') || '{}'),
      popularCustom: JSON.parse(localStorage.getItem('eatmefirst_popular_custom') || '[]'),
      categoryOrderBySuper: JSON.parse(localStorage.getItem('eatmefirst_category_order_by_super') || '{}')
    };
    window.FBSync.upload(payload);
    return true;
  } catch (e) {
    console.warn('[Import/Restore] could not push imported state to Firebase:', e);
    return false;
  }
}

function _confirmDeleteBackup(timestamp) {
  const BS = window.BackupSystem;
  if (!BS) return;
  const dateLabel = _formatBackupDate(new Date(timestamp));
  showConfirmDangerModal(
    '🗑️',
    t('backupsDeleteTitle'),
    t('backupsDeleteConfirm', dateLabel),
    () => {
      BS.deleteBackup(timestamp);
      showToast(t('deleted'));
      renderSettingsData();
    }
  );
}

function attachSettingsDataListeners() {
  document.querySelectorAll('#screen-settings-data .sub-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeDataTab = tab.dataset.subtab || 'esborrar';
      renderSettingsData();
    });
  });
  // Delegate per als botons d'esborrar i de export/import que es regeneren
  // a cada render.
  const area = document.getElementById('settings-data-area');
  if (area && !area.__resetBound) {
    area.__resetBound = true;
    area.addEventListener('click', (e) => {
      // Botó "Saber-ne més" dels banners informatius — té prioritat per
      // si està dins una card que també té un altre data-action.
      const moreBtn = e.target.closest && e.target.closest('.info-banner-more');
      if (moreBtn) {
        const cfg = _getInfoModalConfig(moreBtn.dataset.info);
        if (cfg) _showInfoModal(cfg.emoji, cfg.title, cfg.paragraphs);
        return;
      }
      const resetBtn = e.target.closest && e.target.closest('[data-reset-action]');
      if (resetBtn) {
        switch (resetBtn.dataset.resetAction) {
          case 'eatme':        if (typeof resetBitemeProducts === 'function') resetBitemeProducts(); break;
          case 'shopping':     if (typeof resetShoppingList === 'function') resetShoppingList(); break;
          case 'impact':       if (typeof resetImpactHistory === 'function') resetImpactHistory(); break;
          case 'recipe-usage': if (typeof confirmResetRecipeUsage === 'function') confirmResetRecipeUsage(); break;
          case 'gamification': if (typeof confirmResetGamificationProgress === 'function') confirmResetGamificationProgress(); break;
          case 'patterns':     if (typeof confirmResetPatternData === 'function') confirmResetPatternData(); break;
          case 'all':          if (typeof resetAll === 'function') resetAll(); break;
        }
        return;
      }
      const dataBtn = e.target.closest && e.target.closest('[data-data-action]');
      if (dataBtn) {
        switch (dataBtn.dataset.dataAction) {
          case 'export': if (typeof exportData === 'function') exportData(); break;
          case 'import': if (typeof importData === 'function') importData(); break;
        }
        return;
      }
      // Accions de la pestanya Còpies (vegeu renderBackupsTab i js/backup.js).
      const backupBtn = e.target.closest && e.target.closest('[data-backup-action]');
      if (!backupBtn) return;
      const action = backupBtn.dataset.backupAction;
      if (action === 'export-now') {
        if (window.BackupSystem) window.BackupSystem.exportToFile();
        renderSettingsData();
        return;
      }
      if (action === 'import-file') {
        if (window.BackupSystem) window.BackupSystem.importFromFile();
        return;
      }
      if (action === 'dismiss-reminder') {
        if (window.BackupSystem) window.BackupSystem.dismissExportReminderForToday();
        renderSettingsData();
        return;
      }
      if (action === 'restore' || action === 'delete') {
        const item = backupBtn.closest('.backup-item');
        const ts = item ? parseInt(item.dataset.backupTs, 10) : NaN;
        if (!ts) return;
        if (action === 'restore') _confirmRestoreBackup(ts);
        else _confirmDeleteBackup(ts);
      }
    });
  }
}


function openSettingsCategory(cat) {
  const map = {
    regional: typeof openSettingsRegional === 'function' ? openSettingsRegional : null,
    content:  typeof openSettingsContent  === 'function' ? openSettingsContent  : null,
    activity: typeof openSettingsActivity === 'function' ? openSettingsActivity : null,
    app:      typeof openSettingsApp      === 'function' ? openSettingsApp      : null,
    data:     typeof openSettingsData     === 'function' ? openSettingsData     : null
  };
  const fn = map[cat];
  if (fn) fn();
  else if (typeof showToast === 'function') showToast('Pendent');
}

// Wire-up dels clicks de les 5 cards de categoria. Es crida una sola
// vegada des de app.js a la inicialització.
function attachSettingsCategoryListeners() {
  ['regional','content','activity','app','data'].forEach(cat => {
    const btn = document.getElementById('settings-' + cat);
    if (btn) btn.addEventListener('click', () => openSettingsCategory(cat));
  });
}

// Obre la pantalla de configuració recordant d'on s'ha cridat
// origin: 'home' (des del tracker) o 'launcher' (des de la pantalla inicial)
function openSettings(origin) {
  const backBtn = document.getElementById('settings-back-btn');
  if (backBtn) backBtn.dataset.back = (origin === 'launcher') ? 'launcher' : 'home';
  showScreen('settings');
}

function updateSupermarketsStatus() {
  const el = document.getElementById('supermarkets-status');
  if (!el) return;
  const enabled = getEnabledSupermarkets().length;
  el.textContent = enabled + ' ' + t('storesActive');
}

// CONFIGURACIÓ
function applyTheme(mode) {
  const root = document.documentElement;
  // Si rebem 'auto' (de versions anteriors), forcem 'light'
  if (mode === 'auto') mode = 'light';
  root.setAttribute('data-theme', mode);
  localStorage.setItem('eatmefirst_theme', mode);
  updateThemeStatus();
}

function updateThemeStatus() {
  let mode = localStorage.getItem('eatmefirst_theme') || 'light';
  if (mode === 'auto') mode = 'light';
  const key = mode === 'light' ? 'themeLight' : 'themeDark';
  const el = document.getElementById('theme-status');
  if (el) el.textContent = t(key);
}

function cycleTheme() {
  let current = localStorage.getItem('eatmefirst_theme') || 'light';
  if (current === 'auto') current = 'light';
  const next = current === 'light' ? 'dark' : 'light';
  applyTheme(next);
}

function updateLangStatus() {
  const lang = getCurrentLang();
  const el = document.getElementById('language-status');
  if (el) el.textContent = LANGUAGE_NAMES[lang];
}

function updateStatsSub() {
  const el = document.getElementById('stats-sub');
  if (!el) return;
  // Font de veritat: l'historial de consums/llençaments. El comptador antic
  // (stats.consumed/trashed) podia quedar inflat amb dades d'altres dispositius
  // o de versions anteriors, mentre l'usuari ja havia esborrat l'historial.
  let consumed = 0, trashed = 0;
  try {
    const raw = localStorage.getItem('eatmefirst_consumption_history');
    if (raw) {
      const hist = JSON.parse(raw);
      if (Array.isArray(hist)) {
        hist.forEach(h => {
          if (h && h.action === 'consumed') consumed++;
          else if (h && h.action === 'trashed') trashed++;
        });
      }
    }
  } catch (e) {}
  const total = consumed + trashed;
  if (total === 0) {
    el.textContent = t('statsSubEmpty');
    return;
  }
  const pct = Math.round((consumed / total) * 100);
  el.textContent = pct + '% ' + t('statsSubGlobal');
}

function updateLocationsCount() {
  const el = document.getElementById('locations-count');
  if (!el) return;
  el.textContent = locations.length + ' ' + t('zonesCount');
}

function updatePopularCount() {
  const el = document.getElementById('popular-count');
  if (!el) return;
  const n = (typeof getPopularProducts === 'function') ? getPopularProducts().length : 0;
  el.textContent = n + ' ' + t('popularsCount');
}

function renderLangList() {
  renderLangListInto(document.getElementById('lang-list'));
}

// Banderes SVG inline (mateix estil que la CA original). Clau = idioma.
const LANG_FLAGS = {
  ca: '<svg viewBox="0 0 9 6" xmlns="http://www.w3.org/2000/svg"><rect width="9" height="6" fill="#FCDD09"/><rect y="0.67" width="9" height="0.67" fill="#DA121A"/><rect y="2" width="9" height="0.67" fill="#DA121A"/><rect y="3.33" width="9" height="0.67" fill="#DA121A"/><rect y="4.67" width="9" height="0.67" fill="#DA121A"/></svg>',
  es: '<svg viewBox="0 0 9 6" xmlns="http://www.w3.org/2000/svg"><rect width="9" height="6" fill="#C60B1E"/><rect y="1.5" width="9" height="3" fill="#FFC400"/></svg>',
  en: '<svg viewBox="0 0 9 6" xmlns="http://www.w3.org/2000/svg"><rect width="9" height="6" fill="#012169"/><path d="M0 0 L9 6 M9 0 L0 6" stroke="#FFF" stroke-width="1.2"/><path d="M0 0 L9 6 M9 0 L0 6" stroke="#C8102E" stroke-width="0.7"/><path d="M4.5 0 V6 M0 3 H9" stroke="#FFF" stroke-width="2"/><path d="M4.5 0 V6 M0 3 H9" stroke="#C8102E" stroke-width="1.2"/></svg>',
  fr: '<svg viewBox="0 0 9 6" xmlns="http://www.w3.org/2000/svg"><rect width="3" height="6" fill="#0055A4"/><rect x="3" width="3" height="6" fill="#FFF"/><rect x="6" width="3" height="6" fill="#EF4135"/></svg>',
};

// Pinta la llista d'idiomes a un contenidor arbitrari. Permet reusar la
// mateixa UI tant a la pantalla autònoma com dins de la sub-pantalla
// "Regional" amb pestanyes. Itera els idiomes suportats; l'actiu porta ✓;
// en clicar, canvia l'idioma (setLanguage re-renderitza) i repinta la llista.
function renderLangListInto(container) {
  if (!container) return;
  container.innerHTML = '';

  const langs = (typeof SUPPORTED_LANGS !== 'undefined') ? SUPPORTED_LANGS : ['ca'];
  const current = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ca';

  langs.forEach(lang => {
    const btn = document.createElement('button');
    btn.className = 'lang-item' + (lang === current ? ' active' : '');

    const flag = document.createElement('span');
    flag.className = 'lang-flag';
    flag.innerHTML = LANG_FLAGS[lang] || '';

    const info = document.createElement('div');
    info.className = 'lang-info';
    const name = document.createElement('div');
    name.className = 'lang-name';
    name.textContent = (typeof LANGUAGE_NAMES !== 'undefined' && LANGUAGE_NAMES[lang]) || lang;
    info.appendChild(name);

    btn.appendChild(flag);
    btn.appendChild(info);

    if (lang === current) {
      const check = document.createElement('span');
      check.className = 'lang-check';
      check.textContent = '✓';
      btn.appendChild(check);
    }

    btn.addEventListener('click', () => {
      if (lang === getCurrentLang()) return;
      if (typeof setLanguage !== 'function') return;
      const nameOf = (typeof LANGUAGE_NAMES !== 'undefined' && LANGUAGE_NAMES[lang]) || lang;
      // Si el bloc encara no hi és (canvi asíncron), feedback de càrrega: marca
      // aquesta targeta com a "carregant" i deshabilita totes (no re-picar mentre
      // està en vol). Amb el bloc ja carregat (immediat / precàrrega) no es mostra.
      const instant = (typeof isLangBlockLoaded === 'function') ? isLangBlockLoaded(lang) : true;
      if (!instant) {
        btn.classList.add('lang-item-loading');
        container.querySelectorAll('.lang-item').forEach(b => { b.disabled = true; });
      }
      setLanguage(lang, (status) => {
        if (status === 'superseded') return;                 // un altre canvi el gestiona
        if (status === 'applied') {
          renderLangListInto(container);                     // repinta (reactiva + treu loading)
          showToast('✓ ' + nameOf);
        } else {                                             // 'error'
          renderLangListInto(container);                     // repinta amb l'idioma ACTUAL
          showToast('⚠️ ' + (typeof t === 'function' ? t('langLoadError') : 'Error'));
        }
      });
    });

    container.appendChild(btn);
  });
}

// === ESTADÍSTIQUES (visió "dades dures") ===
// Càrrega l'historial de consum i el calcula tot per pintar cards de resum,
// gràfics, distribució per zona, tops i mitjanes. Si no hi ha entrades,
// ensenya un empty state.
function showStats(origin) {
  const empty = document.getElementById('stats-empty');
  const body = document.getElementById('stats-body');
  const history = (typeof loadConsumptionHistory === 'function') ? loadConsumptionHistory() : [];
  // Back-button: tornem al sub-screen 'settings-*' si en ve, si no 'settings'.
  const backBtn = document.querySelector('#screen-stats .back-btn');
  if (backBtn) {
    const isSettings = origin === 'settings' || (typeof origin === 'string' && origin.indexOf('settings-') === 0);
    backBtn.dataset.back = isSettings ? origin : 'settings';
  }

  if (!history || history.length === 0) {
    if (empty) empty.style.display = 'block';
    if (body) body.innerHTML = '';
    showScreen('stats');
    return;
  }

  if (empty) empty.style.display = 'none';
  if (body) body.innerHTML = renderStatsBody(history);

  showScreen('stats');
}

// Construeix tot l'HTML de la pantalla d'estadístiques.
function renderStatsBody(history) {
  const summary = computeStatsSummary(history);
  const monthly = computeStatsMonthly(history);
  const zoneDist = computeZoneDistribution();
  const tops = computeStatsTops(history);
  const averages = computeStatsAverages(history);

  return [
    renderStatsSummaryCard(summary),
    renderStatsLineChartCard(monthly),
    renderStatsBarChartCard(monthly),
    renderStatsZoneCard(zoneDist),
    renderStatsTopsCard(tops),
    renderStatsAveragesCard(averages)
  ].join('');
}

// CARD 1 — Resum global
function computeStatsSummary(history) {
  let consumed = 0, trashed = 0;
  history.forEach(e => {
    if (e.action === 'consumed') consumed++;
    else if (e.action === 'trashed') trashed++;
  });
  const total = consumed + trashed;
  const pct = total > 0 ? Math.round((consumed / total) * 100) : 0;
  return { consumed, trashed, total, pct };
}

function renderStatsSummaryCard(s) {
  return `
    <div class="stats-card-v2">
      <h3 class="stats-card-v2-title">📊 <span>${escapeHtml(t('statsTitle'))}</span></h3>
      <div class="stats-summary-grid">
        <div class="stats-summary-item">
          <div class="stats-summary-emoji">🥗</div>
          <p class="stats-summary-num">${s.consumed}</p>
          <p class="stats-summary-label">${escapeHtml(t('productsConsumed'))}</p>
        </div>
        <div class="stats-summary-item">
          <div class="stats-summary-emoji">🗑️</div>
          <p class="stats-summary-num">${s.trashed}</p>
          <p class="stats-summary-label">${escapeHtml(t('productsTrashed'))}</p>
        </div>
        <div class="stats-summary-item">
          <div class="stats-summary-emoji">📦</div>
          <p class="stats-summary-num">${s.total}</p>
          <p class="stats-summary-label">${escapeHtml(t('totalProducts'))}</p>
        </div>
        <div class="stats-summary-item stats-summary-utilization">
          <div class="stats-summary-emoji">${s.pct >= 75 ? '🎉' : s.pct >= 50 ? '👍' : '💪'}</div>
          <p class="stats-summary-num">${s.pct}%</p>
          <p class="stats-summary-label">${escapeHtml(t('utilizationGlobal'))}</p>
        </div>
      </div>
    </div>
  `;
}

// CARD 2 + 3 — Dades mensuals (utilització i € llençats)
function computeStatsMonthly(history) {
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: monthShortLetter(d.getMonth()),
      fullLabel: monthFullName(d.getMonth()),
      consumed: 0,
      trashed: 0,
      wastedEur: 0
    });
  }
  history.forEach(e => {
    if (!e.date) return;
    const d = new Date(e.date);
    const idx = months.findIndex(m => m.year === d.getFullYear() && m.month === d.getMonth());
    if (idx < 0) return;
    if (e.action === 'consumed') months[idx].consumed++;
    else if (e.action === 'trashed') {
      months[idx].trashed++;
      const product = (typeof entryAsProduct === 'function') ? entryAsProduct(e) : null;
      const total = (product && typeof getProductPrice === 'function') ? getProductPrice(product) : 0;
      const factor = Math.max(0, Math.min(100, e.percent || 0)) / 100;
      months[idx].wastedEur += total * factor;
    }
  });
  return months.map(m => {
    const t = m.consumed + m.trashed;
    return { ...m, utilizationPct: t > 0 ? Math.round((m.consumed / t) * 100) : null };
  });
}

function monthShortLetter(idx) {
  const labels = t('monthsInitial');
  return (Array.isArray(labels) ? labels[idx] : '') || '?';
}
function monthFullName(idx) {
  const names = t('monthsFull');
  return (Array.isArray(names) ? names[idx] : '') || '';
}

// CARD 2 — Gràfic línia % aprofitament
function renderStatsLineChartCard(monthly) {
  const points = monthly.map((m, i) => ({ ...m, x: i }));
  const hasData = points.some(p => p.utilizationPct !== null);
  if (!hasData) {
    return `
      <div class="stats-card-v2">
        <h3 class="stats-card-v2-title">📈 <span>${escapeHtml(t('utilizationEvolution'))}</span></h3>
        <div class="stats-chart-empty">${escapeHtml(t('chartEmpty'))}</div>
      </div>
    `;
  }
  // SVG: 320 wide x 140 tall amb padding lateral 16, base 110
  const W = 320, H = 140, PAD_X = 20, PAD_TOP = 12, BASE = 116;
  const stepX = (W - PAD_X * 2) / Math.max(1, points.length - 1);
  const yFor = (pct) => BASE - (pct / 100) * (BASE - PAD_TOP);
  const segments = [];
  let prev = null;
  points.forEach((p) => {
    if (p.utilizationPct === null) { prev = null; return; }
    const cx = PAD_X + p.x * stepX;
    const cy = yFor(p.utilizationPct);
    if (prev !== null) segments.push({ x1: prev.cx, y1: prev.cy, x2: cx, y2: cy });
    prev = { cx, cy };
  });
  const linesSvg = segments.map(s =>
    `<line x1="${s.x1}" y1="${s.y1}" x2="${s.x2}" y2="${s.y2}" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round"/>`
  ).join('');
  const dotsSvg = points.map(p => {
    if (p.utilizationPct === null) return '';
    const cx = PAD_X + p.x * stepX;
    const cy = yFor(p.utilizationPct);
    return `<circle cx="${cx}" cy="${cy}" r="4" fill="var(--primary)"/>`;
  }).join('');
  const labelsSvg = points.map(p => {
    const cx = PAD_X + p.x * stepX;
    return `<text x="${cx}" y="${H - 4}" text-anchor="middle" font-size="10" fill="var(--text-soft)" font-family="inherit">${p.label}</text>`;
  }).join('');
  const yLabels = `
    <text x="2" y="${PAD_TOP + 4}" font-size="9" fill="var(--text-soft)" font-family="inherit">100%</text>
    <text x="2" y="${BASE}" font-size="9" fill="var(--text-soft)" font-family="inherit">0%</text>
    <line x1="${PAD_X - 2}" y1="${PAD_TOP}" x2="${PAD_X - 2}" y2="${BASE}" stroke="var(--border)" stroke-width="1"/>
  `;
  return `
    <div class="stats-card-v2">
      <h3 class="stats-card-v2-title">📈 <span>${escapeHtml(t('utilizationEvolution'))}</span></h3>
      <p class="stats-card-v2-sub">${escapeHtml(t('haveImproved'))}</p>
      <svg class="stats-line-chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
        ${yLabels}
        ${linesSvg}
        ${dotsSvg}
        ${labelsSvg}
      </svg>
    </div>
  `;
}

// CARD 3 — Gràfic barres € llençats per mes
function renderStatsBarChartCard(monthly) {
  const maxEur = Math.max(0, ...monthly.map(m => m.wastedEur));
  if (maxEur <= 0) {
    return `
      <div class="stats-card-v2">
        <h3 class="stats-card-v2-title">📊 <span>${escapeHtml(t('wastedEvolution'))}</span></h3>
        <div class="stats-chart-empty">${escapeHtml(t('chartEmpty'))}</div>
      </div>
    `;
  }
  const bars = monthly.map(m => {
    const h = m.wastedEur > 0 ? Math.max(4, Math.round((m.wastedEur / maxEur) * 100)) : 0;
    const tip = m.fullLabel + ': ' + fmtEur(m.wastedEur);
    return `
      <div class="stats-bar-col" title="${escapeHtml(tip)}">
        <div class="stats-bar-track">
          <div class="stats-bar-fill" style="height:${h}%"></div>
        </div>
        <p class="stats-bar-label">${m.label}</p>
      </div>
    `;
  }).join('');
  return `
    <div class="stats-card-v2">
      <h3 class="stats-card-v2-title">📊 <span>${escapeHtml(t('wastedEvolution'))}</span></h3>
      <div class="stats-bar-chart">${bars}</div>
    </div>
  `;
}

// CARD 4 — Distribució per zona (calculat de products[])
function computeZoneDistribution() {
  const list = (typeof products !== 'undefined') ? products : [];
  if (!list.length) return [];
  const map = {};
  list.forEach(p => {
    const id = p.location || 'unknown';
    if (!map[id]) map[id] = 0;
    map[id]++;
  });
  const total = list.length;
  return Object.keys(map).map(id => {
    const loc = (typeof getLocationById === 'function') ? getLocationById(id) : null;
    return {
      id,
      emoji: loc ? loc.emoji : '📍',
      name: loc ? getLocationName(loc) : id,
      count: map[id],
      pct: Math.round((map[id] / total) * 100)
    };
  }).sort((a, b) => b.count - a.count);
}

function renderStatsZoneCard(zones) {
  if (!zones.length) {
    return `
      <div class="stats-card-v2">
        <h3 class="stats-card-v2-title">📍 <span>${escapeHtml(t('distributionByZone'))}</span></h3>
        <div class="stats-chart-empty">${escapeHtml(t('zoneEmpty'))}</div>
      </div>
    `;
  }
  const rows = zones.map(z => `
    <div class="stats-zone-row">
      <span class="stats-zone-emoji">${z.emoji}</span>
      <span class="stats-zone-name">${escapeHtml(z.name)}</span>
      <div class="stats-zone-bar">
        <div class="stats-zone-bar-fill" style="width:${z.pct}%"></div>
      </div>
      <span class="stats-zone-count">${z.count} (${z.pct}%)</span>
    </div>
  `).join('');
  return `
    <div class="stats-card-v2">
      <h3 class="stats-card-v2-title">📍 <span>${escapeHtml(t('distributionByZone'))}</span></h3>
      <div class="stats-zone-list">${rows}</div>
    </div>
  `;
}

// CARD 5 — Tops (més comprats / més llençats)
function computeStatsTops(history) {
  const purchasedMap = {};
  const trashedMap = {};
  history.forEach(e => {
    const key = (e.productName || '').toLowerCase().trim();
    if (!key) return;
    if (!purchasedMap[key]) purchasedMap[key] = { name: e.productName, emoji: e.productEmoji || '🥫', count: 0 };
    purchasedMap[key].count++;
    if (e.action === 'trashed') {
      if (!trashedMap[key]) trashedMap[key] = { name: e.productName, emoji: e.productEmoji || '🥫', count: 0 };
      trashedMap[key].count++;
    }
  });
  const top = (m) => Object.values(m).sort((a, b) => b.count - a.count).slice(0, 5);
  return { purchased: top(purchasedMap), trashed: top(trashedMap) };
}

function renderStatsTopsCard(tops) {
  const renderList = (arr) => arr.length
    ? arr.map(p => `
        <div class="stats-top-row">
          <span class="stats-top-emoji">${p.emoji}</span>
          <span class="stats-top-name">${escapeHtml(p.name)}</span>
          <span class="stats-top-count">${p.count}</span>
        </div>
      `).join('')
    : `<p class="stats-empty-text">—</p>`;
  return `
    <div class="stats-card-v2">
      <h3 class="stats-card-v2-title">🏆 <span>${escapeHtml(t('topPurchased'))}</span></h3>
      <div class="stats-top-list">${renderList(tops.purchased)}</div>
      <h3 class="stats-card-v2-title" style="margin-top:18px">⚠️ <span>${escapeHtml(t('topWasted'))}</span></h3>
      <div class="stats-top-list">${renderList(tops.trashed)}</div>
    </div>
  `;
}

// CARD 6 — Mitjanes (setmana / mes / global)
function computeStatsAverages(history) {
  const now = Date.now();
  const weekMs = 7 * 86400000;
  const monthMs = 30 * 86400000;
  const sums = (since) => {
    let consumed = 0, trashed = 0;
    history.forEach(e => {
      if (since !== null) {
        const d = new Date(e.date).getTime();
        if (now - d > since) return;
      }
      if (e.action === 'consumed') consumed++;
      else if (e.action === 'trashed') trashed++;
    });
    const total = consumed + trashed;
    return { total, pct: total > 0 ? Math.round((consumed / total) * 100) : 0 };
  };
  const week = sums(weekMs);
  const month = sums(monthMs);
  const all = sums(null);

  // Productes/setmana = total / setmanes des del primer registre
  let firstDate = null;
  history.forEach(e => {
    if (!e.date) return;
    const d = new Date(e.date).getTime();
    if (!firstDate || d < firstDate) firstDate = d;
  });
  const weeks = firstDate ? Math.max(1, (now - firstDate) / weekMs) : 1;
  const perWeek = all.total / weeks;

  return { week, month, all, perWeek };
}

function renderStatsAveragesCard(a) {
  return `
    <div class="stats-card-v2">
      <h3 class="stats-card-v2-title">📅 <span>${escapeHtml(t('thisWeek'))}</span></h3>
      <p class="stats-avg-line">${a.week.total} ${escapeHtml(t('items'))} · ${a.week.pct}% ${escapeHtml(t('utilizationGlobal'))}</p>

      <h3 class="stats-card-v2-title" style="margin-top:14px">🗓️ <span>${escapeHtml(t('thisMonth'))}</span></h3>
      <p class="stats-avg-line">${a.month.total} ${escapeHtml(t('items'))} · ${a.month.pct}% ${escapeHtml(t('utilizationGlobal'))}</p>

      <h3 class="stats-card-v2-title" style="margin-top:14px">📈 <span>${escapeHtml(t('globalAverage'))}</span></h3>
      <p class="stats-avg-line">${a.perWeek.toFixed(1)} ${escapeHtml(t('productsPerWeek'))} · ${a.all.pct}% ${escapeHtml(t('utilizationGlobal'))}</p>
    </div>
  `;
}

// Modal de confirmació primary (no destructiva). El botó de confirmar usa
// l'estil per defecte; opts.confirmLabel permet personalitzar el text.
function showConfirmModal(emoji, title, message, opts, onConfirm) {
  const cfg = opts || {};
  const confirmLabel = cfg.confirmLabel || t('save');
  const cancelLabel = cfg.cancelLabel || t('cancel');
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-content">
      <div class="modal-emoji-big">${emoji}</div>
      <p class="modal-title">${escapeHtml(title)}</p>
      <p class="modal-sub">${escapeHtml(message)}</p>
      <div class="modal-buttons">
        <button class="modal-cancel" id="modal-no-btn">${escapeHtml(cancelLabel)}</button>
        <button class="modal-confirm" id="modal-yes-btn">${escapeHtml(confirmLabel)}</button>
      </div>
    </div>
  `;
  openModal(overlay, () => { if (overlay.parentNode) document.body.removeChild(overlay); });
  const close = () => dismissModal(overlay);
  overlay.querySelector('#modal-no-btn').addEventListener('click', close);
  overlay.querySelector('#modal-yes-btn').addEventListener('click', () => {
    close();
    try { onConfirm(); } catch (e) { console.error(e); }
  });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
}

// Modal d'input de text (substitueix els prompt() nadius lletjos).
// Patró coherent amb showConfirmModal/showConfirmDangerModal.
//   emoji: string visible al capdamunt del modal
//   title: string títol del modal
//   message: string opcional (subtítol explicatiu); null/'' per ometre
//   placeholder: placeholder del camp input
//   onConfirm: function(value) — callback amb el text introduït (trimmed)
//   options: { initialValue, maxLength, validator, confirmLabel, cancelLabel }
//     - initialValue: text pre-omplir (per editar valors existents)
//     - maxLength: caràcters màxims (defaults 200)
//     - validator: function(value) → string|null. null=vàlid, string=missatge d'error
//     - confirmLabel / cancelLabel: text botons (defaults "D'acord" / t('cancel'))
//
// Comportament: tancament per ESC, click fora, o Cancel·lar. Submit per
// Enter dins el camp o clic al confirm. Si validator retorna error,
// es mostra sota l'input i el modal no es tanca.
function showInputModal(emoji, title, message, placeholder, onConfirm, options) {
  const cfg = options || {};
  const initialValue = cfg.initialValue || '';
  const maxLength = cfg.maxLength || 200;
  const validator = typeof cfg.validator === 'function' ? cfg.validator : null;
  const confirmLabel = cfg.confirmLabel || "D'acord";
  const cancelLabel = cfg.cancelLabel || t('cancel');

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-content">
      <div class="modal-emoji-big">${emoji}</div>
      <p class="modal-title">${escapeHtml(title)}</p>
      ${message ? `<p class="modal-sub">${escapeHtml(message)}</p>` : ''}
      <input type="text" class="modal-input" id="modal-input-field"
             placeholder="${escapeHtml(placeholder || '')}"
             maxlength="${maxLength}"
             value="${escapeHtml(initialValue)}"
             autocomplete="off">
      <p class="modal-input-error" id="modal-input-error" style="display:none"></p>
      <div class="modal-buttons">
        <button class="modal-cancel" id="modal-no-btn">${escapeHtml(cancelLabel)}</button>
        <button class="modal-confirm" id="modal-yes-btn">${escapeHtml(confirmLabel)}</button>
      </div>
    </div>
  `;
  openModal(overlay, () => {
    document.removeEventListener('keydown', onEscape);
    if (overlay.parentNode) document.body.removeChild(overlay);
  });

  const input = overlay.querySelector('#modal-input-field');
  const errorEl = overlay.querySelector('#modal-input-error');
  const close = () => dismissModal(overlay);
  const onEscape = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onEscape);

  const tryConfirm = () => {
    const value = input.value.trim();
    if (validator) {
      const err = validator(value);
      if (err) {
        errorEl.textContent = err;
        errorEl.style.display = '';
        return;
      }
    }
    close();
    try { onConfirm(value); } catch (e) { console.error(e); }
  };

  overlay.querySelector('#modal-no-btn').addEventListener('click', close);
  overlay.querySelector('#modal-yes-btn').addEventListener('click', tryConfirm);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); tryConfirm(); }
  });
  input.addEventListener('input', () => {
    if (errorEl.style.display !== 'none') errorEl.style.display = 'none';
  });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  // Focus diferit perquè iOS Safari porti el keyboard al obrir.
  setTimeout(() => { input.focus(); }, 50);
}

// Modal de confirmació reusable per a accions destructives.
// title: text del títol; message: text d'avís; onConfirm: callback si l'usuari confirma.
function showConfirmDangerModal(emoji, title, message, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-content">
      <div class="modal-emoji-big">${emoji}</div>
      <p class="modal-title">${escapeHtml(title)}</p>
      <p class="modal-sub">${escapeHtml(message)}</p>
      <div class="modal-buttons">
        <button class="modal-cancel" id="modal-no-btn">${escapeHtml(t('cancel'))}</button>
        <button class="modal-confirm modal-confirm-danger" id="modal-yes-btn">${escapeHtml(t('delete'))}</button>
      </div>
    </div>
  `;
  openModal(overlay, () => { if (overlay.parentNode) document.body.removeChild(overlay); });
  const close = () => dismissModal(overlay);
  overlay.querySelector('#modal-no-btn').addEventListener('click', close);
  overlay.querySelector('#modal-yes-btn').addEventListener('click', () => {
    close();
    try { onConfirm(); } catch (e) { console.error(e); }
  });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
}

// Modal de selecció d'una opció d'una llista (substitueix prompt() per a
// tries discretes com el dia de la setmana). Coherent amb showInputModal.
//   emoji, title: capçalera
//   message: subtítol opcional (null/'' per ometre)
//   options: array de { value, label }
//   currentValue: value actualment seleccionat (es marca .selected)
//   onConfirm: function(value) — value triat (tipus preservat des d'options)
// Patró A: clic a una opció = selecciona + tanca + onConfirm.
// Tancament sense canvi: Cancel·la, ESC o clic fora.
function showSelectModal(emoji, title, message, options, currentValue, onConfirm) {
  const opts = Array.isArray(options) ? options : [];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  const optionsHtml = opts.map(o =>
    '<button type="button" class="modal-zone-option' +
      (o.value === currentValue ? ' selected' : '') + '">' +
      escapeHtml(o.label) + '</button>'
  ).join('');
  overlay.innerHTML = `
    <div class="modal-content">
      <div class="modal-emoji-big">${emoji}</div>
      <p class="modal-title">${escapeHtml(title)}</p>
      ${message ? `<p class="modal-sub">${escapeHtml(message)}</p>` : ''}
      <div class="modal-select-list">${optionsHtml}</div>
      <div class="modal-buttons">
        <button class="modal-cancel" id="modal-no-btn">${escapeHtml(t('cancel'))}</button>
      </div>
    </div>
  `;
  openModal(overlay, () => {
    document.removeEventListener('keydown', onEscape);
    if (overlay.parentNode) document.body.removeChild(overlay);
  });
  const close = () => dismissModal(overlay);
  const onEscape = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onEscape);
  overlay.querySelector('#modal-no-btn').addEventListener('click', close);
  overlay.querySelectorAll('.modal-zone-option').forEach((btn, i) => {
    btn.addEventListener('click', () => {
      const value = opts[i].value;   // del closure → preserva el tipus (number)
      close();
      try { onConfirm(value); } catch (e) { console.error(e); }
    });
  });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
}

// Subtítols dinàmics de la pantalla "Esborrar dades": mostren quantes
// dades hi ha de cada categoria abans d'esborrar-la.
function updateResetDataSubs() {
  const bitemeSub = document.getElementById('reset-eatme-sub');
  if (bitemeSub) {
    const n = Array.isArray(products) ? products.length : 0;
    bitemeSub.textContent = n + ' ' + t('productsCount');
  }

  const shoppingSub = document.getElementById('reset-shopping-sub');
  if (shoppingSub) {
    const items = Array.isArray(shoppingItems) ? shoppingItems : [];
    const supersWithItems = new Set(items.map(it => it.supermarketId).filter(Boolean));
    shoppingSub.textContent = items.length + ' ' + t('productsAtShops', supersWithItems.size);
  }

  const impactSub = document.getElementById('reset-impact-sub');
  if (impactSub) {
    let count = 0;
    try {
      const raw = localStorage.getItem('eatmefirst_consumption_history');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) count = parsed.length;
      }
    } catch (e) {}
    if (count > 0) {
      impactSub.textContent = t('resetImpactSub') + ' · ' + count + ' ' + t('historyEntries');
    } else {
      impactSub.textContent = t('resetImpactSub');
    }
  }
  // Si la sub-pantalla "Dades" està viva, la reasignem perquè els
  // comptadors interns també es refresquin després d'un reset.
  if (typeof renderSettingsData === 'function') renderSettingsData();
}

function openResetDataScreen() {
  updateResetDataSubs();
  showScreen('reset-data');
}

// Recull totes les claus de l'app a localStorage i les baixa com a JSON.
function exportData() {
  const payload = {
    exportedAt: new Date().toISOString(),
    version: 'v2.0',
    data: {}
  };
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith('eatmefirst_')) continue;
    const raw = localStorage.getItem(key);
    try {
      payload.data[key] = JSON.parse(raw);
    } catch (e) {
      payload.data[key] = raw;
    }
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const today = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = 'buyte-backup-' + today + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  // Marca el moment d'aquesta exportació perquè el recordatori
  // (Configuració > Dades > Còpies) sàpiga que l'usuari ha fet una
  // còpia recent. La clau també la consulta BackupSystem.shouldRemindExport().
  try { localStorage.setItem('eatmefirst_last_export', String(Date.now())); } catch (e) {}

  showToast(t('exportDone'));
}

// Importa un fitxer JSON exportat per exportData().
// Substitueix les claus eatmefirst_* del localStorage i recarrega.
function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.onchange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      let json;
      try {
        json = JSON.parse(ev.target.result);
      } catch (err) {
        showToast('⚠️ ' + t('importInvalid'));
        return;
      }
      if (!json || !json.data || typeof json.data !== 'object') {
        showToast('⚠️ ' + t('importInvalid'));
        return;
      }
      const keys = Object.keys(json.data).filter(k => k.startsWith('eatmefirst_'));
      if (keys.length === 0) {
        showToast('⚠️ ' + t('importInvalid'));
        return;
      }
      showConfirmModal('📤', t('importTitle'), t('importConfirm'),
        { confirmLabel: t('importTitle') },
        () => {
          keys.forEach(k => {
            const val = json.data[k];
            localStorage.setItem(k, typeof val === 'string' ? val : JSON.stringify(val));
          });
          // CRÍTIC quan Firebase sync està actiu: cal pujar l'estat
          // acabat d'importar al cloud ABANS del reload. Sense això,
          // initSync() es reconnecta després del reload, onSnapshot
          // rep l'estat del cloud (que és el d'ABANS de l'import,
          // perquè el cloud no s'ha actualitzat) i onRemoteData
          // sobreescriu silenciosament les dades acabades d'importar.
          // L'usuari ho viu com "l'import no fa res".
          const reloadDelay = _syncImportedStateToCloud() ? 1800 : 800;
          showToast(_buildImportToast(json.data));
          setTimeout(() => location.reload(), reloadDelay);
        }
      );
    };
    reader.onerror = () => showToast('⚠️ ' + t('importInvalid'));
    reader.readAsText(file);
  };
  input.click();
}

// Esborra TOT el localStorage propi de l'app i recarrega.
function resetAll() {
  showConfirmDangerModal('🗑️', t('resetAllTitle'), t('resetAllConfirm'), () => {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('eatmefirst_')) keysToRemove.push(k);
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    showToast(t('doneReset'));
    setTimeout(() => location.reload(), 400);
  });
}

// Esborra només els productes del tracker EatMe + estadístiques.
function resetBitemeProducts() {
  showConfirmDangerModal('🥗', t('resetBitemeTitle'), t('resetBitemeConfirm'), () => {
    products = [];
    stats = { consumed: 0, trashed: 0 };
    localStorage.setItem('eatmefirst_products', JSON.stringify(products));
    localStorage.setItem('eatmefirst_stats', JSON.stringify(stats));
    if (typeof pushToServer === 'function') pushToServer();
    if (typeof renderHome === 'function') renderHome();
    if (typeof renderSection === 'function') renderSection();
    if (typeof updateStatsSub === 'function') updateStatsSub();
    updateResetDataSubs();
    showToast(t('doneReset'));
  });
}

// Esborra només els items de la llista de la compra (manté supers configurats).
function resetShoppingList() {
  showConfirmDangerModal('🛒', t('resetShoppingTitle'), t('resetShoppingConfirm'), () => {
    if (typeof shoppingItems !== 'undefined') shoppingItems = [];
    localStorage.setItem('eatmefirst_shopping_items', JSON.stringify([]));
    if (typeof pushToServer === 'function') pushToServer();
    if (typeof renderSupermarkets === 'function') renderSupermarkets();
    if (typeof renderShoppingItems === 'function') renderShoppingItems();
    updateResetDataSubs();
    showToast(t('doneReset'));
  });
}

// Esborra TOT l'historial: el que alimenta "El meu impacte" (consumption_history,
// streak_record) i també els comptadors legacy de la pantalla "Estadístiques"
// (eatmefirst_stats), perquè els dos quedin a zero alhora.
function resetImpactHistory() {
  showConfirmDangerModal('📊', t('resetImpactTitle'), t('resetImpactConfirm'), () => {
    localStorage.removeItem('eatmefirst_consumption_history');
    localStorage.removeItem('eatmefirst_streak_record');
    localStorage.removeItem('eatmefirst_stats');
    if (typeof stats !== 'undefined') {
      stats.consumed = 0;
      stats.trashed = 0;
    }
    if (typeof updateImpactSub === 'function') updateImpactSub();
    if (typeof updateStatsSub === 'function') updateStatsSub();
    updateResetDataSubs();
    if (typeof pushToServer === 'function') pushToServer();
    showToast(t('doneReset'));
  });
}



// TRADUCCIONS - actualitzar tots els textos
function translatePage() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  // Atributs traduïbles (a més del textContent): placeholder, title i
  // aria-label. Abans només es reaplicava el textContent, així que en
  // canviar d'idioma els placeholders/aria es quedaven en l'idioma vell.
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.setAttribute('title', t(el.getAttribute('data-i18n-title')));
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
  });

  document.documentElement.lang = getCurrentLang();
  renderHome();
  updateThemeStatus();
  updateLangStatus();
  updateStatsSub();
  updateLocationsCount();
  updatePopularCount();
  if (typeof updateRecipesCount === 'function') updateRecipesCount();
}

// Re-renderitza la pantalla ACTIVA en canviar d'idioma (decisió A del Pas 2):
// translatePage ja refà els data-i18n estàtics + la home, però les pantalles
// pintades per JS amb t() (Menja'm, Compra'm, Cuina'm, Despeses…) quedarien
// en l'idioma vell fins a re-obrir-les. Aquí detectem la pantalla .active i
// cridem el seu renderer (amb guardes + try/catch perquè cap fallada trenqui
// el canvi d'idioma). Les pantalles sense renderer clar es queden amb el que
// translatePage ja n'ha refet (data-i18n).
function _rerenderActiveScreen() {
  const active = document.querySelector('.screen.active');
  if (!active) return;
  const id = active.id;
  const call = (fn, ...a) => { try { if (typeof window[fn] === 'function') window[fn](...a); } catch (e) { console.warn('[i18n] re-render', fn, e); } };
  try {
    switch (id) {
      case 'screen-home':          call('renderHome'); break;
      case 'screen-section':       call('renderSection'); break;
      case 'screen-list':          if (typeof currentLevel !== 'undefined' && currentLevel) call('openShelf', currentLevel); break;
      case 'screen-alerts':        call('renderAlerts'); break;
      case 'screen-view-all':      call('renderViewAll'); break;
      case 'screen-shopping':      call('renderSupermarkets'); break;
      case 'screen-supermarket':   call('renderShoppingItems'); break;
      case 'screen-cookme':        call('renderCookMe'); break;
      case 'screen-meal-planner':  call('renderMealPlanner'); break;
      case 'screen-expenses':      call('renderExpenses'); break;
      case 'screen-impact':        call('renderImpact'); break;
      case 'screen-popular':       call('renderPopularList'); break;
      case 'screen-special-lists': call('renderSpecialLists'); break;
      case 'screen-achievements':  call('renderAchievements'); break;
      // Benvinguda: translatePage ja refà els data-i18n (subtítol, pregunta),
      // però la llista de països i el selector d'idioma es pinten per JS amb
      // t()/getCurrentLang() i cal repintar-los perquè segueixin l'idioma nou.
      // renderWelcomeCountryList llegeix currentCountry tal qual: no es perd
      // el país destacat.
      // Onboarding en 2 passos: renderWelcomeStep repinta el pas ACTIU
      // (welcomeStep es manté) → l'usuari no salta al pas 1 en canviar d'idioma.
      case 'screen-welcome':
        call('renderWelcomeStep');
        break;
      // screen-language, screen-settings*, etc.: coberts per data-i18n.
      default: break;
    }
  } catch (e) { console.warn('[i18n] _rerenderActiveScreen', e); }
}
