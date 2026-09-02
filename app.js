/* ============================================
   Buyte — app.js
   Punt d'entrada: registra els listeners del DOM
   i inicialitza l'app un cop carregat el document.
   La lògica viu als mòduls js/*.js (carregats abans).
   ============================================ */

// Executa el "back" d'una pantalla segons el data-back del seu botó enrere.
// El comparteixen la fletxa de la UI (via history.back() → popstate) i el gest
// enrere del sistema. Conté la MATEIXA lògica que tenia el handler de .back-btn:
// neteja de pendents de l'add form + refresc de la pantalla destí. Quan
// s'invoca des del popstate, _navFromPop és true → els showScreen interns NO
// tornen a empènyer historial.
function performBack(backBtn) {
  if (!backBtn) return;
  const target = backBtn.dataset.back;
  // Si l'usuari surt de l'add form (screen-add) sense desar, descartem
  // qualsevol flux pendent de "Comprat" del BuyMe — sinó, el següent
  // saveNewProduct() continuaria creient que estem dins d'aquell flux
  // i traient l'item d'una compra que ja no és l'actual.
  if (backBtn.id === 'screen-add-back') {
    if (typeof pendingShoppingItemId !== 'undefined') pendingShoppingItemId = null;
    if (typeof pendingShoppingSupermarketId !== 'undefined') pendingShoppingSupermarketId = null;
  }
  // Refresc de la pantalla a la qual tornem (sobretot per quan venim
  // del detall del producte i hem editat qty, data, zona, etc.)
  if (target === 'shopping') renderSupermarkets();
  else if (target === 'supermarket') renderShoppingItems();
  else if (target === 'view-all' && typeof renderViewAll === 'function') {
    if (typeof _resetViewAllSearch === 'function') _resetViewAllSearch();
    renderViewAll();
  }
  else if (target === 'what-i-have' && typeof renderWhatIHave === 'function') renderWhatIHave();
  else if (target === 'home' && typeof renderHome === 'function') renderHome();
  else if (target === 'alerts' && typeof renderAlerts === 'function') renderAlerts();
  else if (target === 'section' && typeof renderSection === 'function') renderSection();
  else if (target === 'popular' && typeof renderPopularList === 'function') renderPopularList();
  else if (target === 'cookme' && typeof renderCookMe === 'function') renderCookMe();
  // Re-renderitzem la sub-pantalla de Configuració al tornar — així les
  // que tenen contingut prestat (embedding) recuperen els seus fills.
  else if (target === 'settings-regional' && typeof renderSettingsRegional === 'function') renderSettingsRegional();
  else if (target === 'settings-content'  && typeof renderSettingsContent  === 'function') renderSettingsContent();
  else if (target === 'settings-activity' && typeof renderSettingsActivity === 'function') renderSettingsActivity();
  else if (target === 'settings-app'      && typeof renderSettingsApp      === 'function') renderSettingsApp();
  else if (target === 'settings-data'     && typeof renderSettingsData     === 'function') renderSettingsData();
  // (No cal cap refresc en tornar a 'settings' — la pantalla principal
  // només té 5 cards de categoria estàtiques. Els subtítols dinàmics
  // viuen dins les sub-pantalles, que ja es re-renderitzen quan s'obren.)
  else if (target === 'list' && typeof openShelf === 'function' && currentLevel) {
    openShelf(currentLevel);
    return; // openShelf ja fa showScreen
  }
  else if (target === 'product' && typeof openProduct === 'function' && currentProduct) {
    // Tornem al detall del producte des de CookMe (entrada via
    // btn-recipes-from-product). openProduct refresca el contingut
    // amb l'estat actual i ja crida showScreen('product').
    openProduct(currentProduct.id);
    return;
  }
  showScreen(target);
}

document.addEventListener('DOMContentLoaded', () => {
  // Migració al sistema d'Espais (FASE 1). Si l'usuari ja existeix
  // (té eatmefirst_sync_code o dades) i encara no té cap Espai, en
  // crea un per defecte ("🏠 Casa") heretant el codi de sync actual.
  // Idempotent — es pot cridar a cada boot sense efectes secundaris.
  // Cal cridar-ho ABANS de loadData/initSync perquè futures fases
  // (3-4) llegiran l'Espai actiu per decidir quin codi Firebase fer
  // servir.
  if (window.SpacesSystem && typeof window.SpacesSystem.migrateToSpaces === 'function') {
    try { window.SpacesSystem.migrateToSpaces(); } catch (e) { console.warn('[Spaces] migration error', e); }
  }

  // Categories de productes populars (FASE 1: només capa de dades).
  // Garantim que les categories per defecte existeixen al localStorage.
  // La migració dels populars existents es farà a la FASE 4 (banner).
  if (window.CategoriesSystem && typeof window.CategoriesSystem.getCategories === 'function') {
    try { window.CategoriesSystem.getCategories(); } catch (e) { console.warn('[Categories] init error', e); }
  }

  loadData();
  loadLocations();
  loadShoppingData();
  if (typeof loadSpecialLists === 'function') loadSpecialLists();
  loadProductHistory();
  if (typeof loadPurchaseHistory === 'function') loadPurchaseHistory();
  if (typeof loadRecipeUsage === 'function') loadRecipeUsage();
  if (typeof loadCustomRecipes === 'function') loadCustomRecipes();
  if (typeof loadRecipeOverrides === 'function') loadRecipeOverrides();
  if (typeof recordAppActivity === 'function') recordAppActivity();

  // Categories — FASE 4: migració silenciosa dels populars existents.
  // S'executa una sola vegada (flag eatmefirst_categories_migration_done)
  // i ha d'anar DESPRÉS dels loaders perquè els populars ja siguin a
  // localStorage. detectCategoryForItem assigna 'cat_other' quan no
  // troba match, així que mai no rebenta encara que el catàleg sigui buit.
  if (window.CategoriesSystem && typeof window.CategoriesSystem.runMigrationIfNeeded === 'function') {
    try { window.CategoriesSystem.runMigrationIfNeeded(); } catch (e) { console.warn('[Categories] migration error', e); }
  }
  // Migració v2 (catàleg 2026): assigna categoria als productes nous
  // afegits a POPULAR_PRODUCTS i mou Pasta/Arròs de cat_other →
  // cat_grains. Flag separat (eatmefirst_catalog_v2_migration_done)
  // perquè és independent de la migració v1 que pot haver-se executat
  // amb el catàleg antic. Cal anar després de v1 perquè es construeixi
  // primer el mapa item_categories per a tots els productes.
  if (window.CategoriesSystem && typeof window.CategoriesSystem.runCatalogV2Migration === 'function') {
    try { window.CategoriesSystem.runCatalogV2Migration(); } catch (e) { console.warn('[Categories v2] migration error', e); }
  }
  // Migració v3 (neteja cache d'usuari): treu `days` als productes
  // no-aliment (noExpiry) i afegeix `weight` defaults. Flag separat
  // eatmefirst_catalog_v3_migration_done. Independent de v1/v2.
  // Vegeu runCatalogV3Migration a js/categories.js per al detall.
  if (window.CategoriesSystem && typeof window.CategoriesSystem.runCatalogV3Migration === 'function') {
    try { window.CategoriesSystem.runCatalogV3Migration(); } catch (e) { console.warn('[Catalog v3] migration error', e); }
  }
  if (typeof loadGamificationState === 'function') {
    loadGamificationState();
    // Primer boot després d'instal·lar la gamificació: desbloca retroactivament
    // les insignies que l'usuari ja s'hauria guanyat amb les dades existents.
    if (typeof checkInitialBadges === 'function') checkInitialBadges();
    // Després, comprovació regular per si s'ha desbloquejat alguna mentre
    // l'app estava tancada (streak, etc.).
    if (typeof checkBadges === 'function') checkBadges();
  }

  const savedTheme = localStorage.getItem('eatmefirst_theme') || 'light';
  applyTheme(savedTheme);

  translatePage();

  // Anima l'engranatge del launcher un cop a l'arrencada
  const initialGear = document.querySelector('#launcher-menu-btn .gear-spin');
  if (initialGear) initialGear.classList.add('gear-spin-once');

  // Mostra la pantalla de benvinguda si no l'hem fet servir mai
  showWelcomeIfNeeded();

  // Historial de navegació: fixa la pantalla inicial com a ARREL. Dos casos:
  //  · Recàrrega profunda (l'usuari ha refrescat enmig de l'app): l'entrada
  //    recarregada conserva el meu {d} de la sessió anterior (history.state
  //    sobreviu el reload) i darrere hi ha d entrades meves residuals. Les
  //    consumim d'un sol cop amb navCollapseToRoot → history.go(-d) → arrel neta,
  //    així el primer gest enrere al launcher tanca l'app (adéu "dead press").
  //  · Arrencada normal (d 0/absent): replaceState fixa l'entrada actual com a
  //    arrel. La pantalla inicial és launcher (onboarded, .active estàtic) o
  //    benvinguda pas 1. replaceState NO afegeix entrada ni toca la URL.
  const _restoredD = (history.state && typeof history.state.d === 'number') ? history.state.d : 0;
  if (_restoredD > 0) {
    navCollapseToRoot();   // go(-_restoredD) → aterra a la meva d:0; DOM ja és launcher
  } else {
    try { history.replaceState({ d: 0 }, ''); } catch (e) {}
  }
  _navBooting = false;

  // Configura l'autocomplete del formulari d'afegir producte
  setupNameAutocomplete();

  // Botó "Afegeix al BuyMe" des del detall del producte
  const btnAddToBuyMe = document.getElementById('btn-add-to-buyme');
  if (btnAddToBuyMe) btnAddToBuyMe.addEventListener('click', () => {
    if (!currentProduct) return;
    manualAddToBuyMe(currentProduct);
  });

  // Botó "🍳 Receptes" des del detall del producte: obre CookMe filtrat
  // pel producte actual (vegeu openCookMeForProduct a js/cookme.js).
  const btnRecipesFromProduct = document.getElementById('btn-recipes-from-product');
  if (btnRecipesFromProduct) btnRecipesFromProduct.addEventListener('click', () => {
    if (!currentProduct) return;
    if (typeof openCookMeForProduct === 'function') openCookMeForProduct(currentProduct);
  });

  // Botó "📦 Moure a un altre espai" del detall del producte (Fase A de
  // Spaces). El handler obre el modal de selecció i, en confirmar,
  // executa la lògica de moure (escriu al destí Firebase, esborra de
  // l'origen). La visibilitat del botó la controla _refreshMoveProductBtn
  // — vegeu openProduct a js/biteme.js.
  const btnMoveProduct = document.getElementById('btn-move-product');
  if (btnMoveProduct) btnMoveProduct.addEventListener('click', () => {
    if (!currentProduct) return;
    if (window.SpacesUI && typeof window.SpacesUI.showMoveProductModal === 'function') {
      window.SpacesUI.showMoveProductModal(currentProduct);
    }
  });

  // Toolbar GENÈRICA de selecció múltiple. Compartida per Fase C
  // (productes EatMe a #levels-slider, vegeu js/biteme.js) i Fase C-2
  // (items BuyMe a #shops-slider, vegeu js/buyme.js). Només una mode
  // pot estar activa alhora (l'enter d'una surt l'altra defensivament).
  // El botó X surt la que estigui activa; el botó 📦 Moure despatxa
  // segons quin mode de selecció és actiu.
  const btnSelCancel = document.getElementById('btn-selection-cancel');
  if (btnSelCancel) btnSelCancel.addEventListener('click', () => {
    if (window.LevelsSelection && window.LevelsSelection.isActive()) window.LevelsSelection.exit();
    if (window.ShoppingSelection && window.ShoppingSelection.isActive()) window.ShoppingSelection.exit();
  });
  const btnSelMove = document.getElementById('btn-selection-move');
  if (btnSelMove) btnSelMove.addEventListener('click', () => {
    // Productes EatMe seleccionats? → modal multi-move de productes.
    if (window.LevelsSelection && window.LevelsSelection.isActive() && window.LevelsSelection.count() > 0) {
      const ids = window.LevelsSelection.getSelectedIds();
      const list = (typeof products !== 'undefined' && Array.isArray(products))
        ? products.filter(p => ids.indexOf(p.id) !== -1)
        : [];
      if (list.length === 0) return;
      if (window.SpacesUI && typeof window.SpacesUI.showMoveMultipleProductsModal === 'function') {
        window.SpacesUI.showMoveMultipleProductsModal(list);
      }
      return;
    }
    // Items BuyMe seleccionats? → modal multi-move d'items de compra.
    if (window.ShoppingSelection && window.ShoppingSelection.isActive() && window.ShoppingSelection.count() > 0) {
      const ids = window.ShoppingSelection.getSelectedIds();
      const list = (typeof shoppingItems !== 'undefined' && Array.isArray(shoppingItems))
        ? shoppingItems.filter(it => ids.indexOf(it.id) !== -1)
        : [];
      if (list.length === 0) return;
      if (window.SpacesUI && typeof window.SpacesUI.showMoveMultipleShoppingItemsModal === 'function') {
        window.SpacesUI.showMoveMultipleShoppingItemsModal(list);
      }
    }
  });

  // Compra ràpida en bloc dels items BuyMe seleccionats. La visibilitat del
  // botó la controla _enter/_exitShoppingSelectionMode a js/buyme.js — només
  // surt mentre ShoppingSelection està activa.
  const btnSelBuyAll = document.getElementById('btn-selection-buy-all');
  if (btnSelBuyAll) btnSelBuyAll.addEventListener('click', () => {
    if (!window.ShoppingSelection || !window.ShoppingSelection.isActive()) return;
    if (window.ShoppingSelection.count() === 0) return;
    if (typeof quickBuyMultipleSelected === 'function') quickBuyMultipleSelected();
  });

  // Cistella exacta v2 (Fase 2b): "He acabat la compra" → tanca l'anada
  // oberta del súper visible i treu un sol tiquet.
  const btnFinishTrip = document.getElementById('btn-finish-trip');
  if (btnFinishTrip) btnFinishTrip.addEventListener('click', () => {
    if (typeof _finishShoppingTrip === 'function') _finishShoppingTrip(currentSupermarketId);
  });

  // Botó únic "Editar producte". Fase D v2: per a productes __v:2
  // obre un modal mínim (nom + emoji + categoria); per a legacy
  // reusa el formulari complet de screen-add. La distinció es fa
  // via dataset.v2 que assigna openProduct (js/biteme.js).
  const btnEditProduct = document.getElementById('btn-edit-product');
  if (btnEditProduct) btnEditProduct.addEventListener('click', () => {
    if (!currentProduct) return;
    const isV2 = btnEditProduct.dataset.v2 === '1';
    if (isV2 && typeof openProductEditModal === 'function') {
      openProductEditModal(currentProduct);
    } else {
      openEditProductForm(currentProduct);
    }
  });


  // Botons de selector d'emoji
  const btnPickEmoji = document.getElementById('btn-pick-emoji');
  if (btnPickEmoji) btnPickEmoji.addEventListener('click', () => openEmojiPicker('product', 'add'));

  const btnPickSmEmoji = document.getElementById('btn-pick-supermarket-emoji');
  if (btnPickSmEmoji) btnPickSmEmoji.addEventListener('click', () => openEmojiPicker('supermarket', 'supermarket-edit'));

  const btnPickShopEmoji = document.getElementById('btn-pick-shopping-emoji');
  if (btnPickShopEmoji) btnPickShopEmoji.addEventListener('click', () => openEmojiPicker('shopping', 'shopping-item-edit'));

  // Productes populars: editar
  const btnPickPopularEmoji = document.getElementById('btn-pick-popular-emoji');
  if (btnPickPopularEmoji) btnPickPopularEmoji.addEventListener('click', () => openEmojiPicker('popular', 'popular-edit'));

  // Ubicacions: editar (substitueix el grid inline obsolet, vegeu commit del
  // refactor de l'UI #screen-location-edit). Mateix patró que els altres
  // emoji pickers — openEmojiPicker amb target propi 'location'.
  const btnPickLocEmoji = document.getElementById('btn-pick-loc-emoji');
  if (btnPickLocEmoji) btnPickLocEmoji.addEventListener('click', () => openEmojiPicker('location', 'location-edit'));

  const btnSavePopular = document.getElementById('btn-save-popular');
  if (btnSavePopular) btnSavePopular.addEventListener('click', savePopularEdit);

  const btnDeletePopular = document.getElementById('btn-delete-popular');
  if (btnDeletePopular) btnDeletePopular.addEventListener('click', deletePopularEdit);

  // Cercador del picker d'emojis (per nom en català)
  const emojiSearch = document.getElementById('emoji-search');
  if (emojiSearch) emojiSearch.addEventListener('input', () => {
    if (typeof emojiPickerQuery !== 'undefined') {
      emojiPickerQuery = emojiSearch.value;
      if (emojiPickerQuery) emojiPickerCategory = 'all';
      if (typeof renderEmojiCategoriesTabs === 'function') renderEmojiCategoriesTabs();
      if (typeof renderEmojiPickerGrid === 'function') renderEmojiPickerGrid();
    }
  });

  // Botons de seccions a la pantalla principal
  document.querySelectorAll('.section-btn').forEach(b => {
    b.addEventListener('click', () => openSection(b.dataset.cat));
  });

  // Clic als prestatges DINS de la secció. Delegate AL DOCUMENT
  // (vegeu el commit eb73f02 per al raonament). Guard via
  // window.__shelfClickDelegated per no duplicar.
  //
  // Important: el handler té un FALLBACK quan el click cau a un gap.
  // El contenidor .fridge té padding: 14px i gap: 10px entre shelves;
  // un tap que cau sobre aquesta àrea no impacta cap .shelf i el
  // closest('.shelf') retorna null. El símptoma és el bug "primer clic
  // no respon, segon sí": el primer tap cau a un gap, el segon impacta
  // un shelf. Per resoldre-ho sense reformatejar visualment, si el
  // click cau dins de .fridge sense impactar cap shelf, escollim el
  // shelf més proper verticalment al punt del click i el tractem com
  // si l'haguessin clicat directament.
  if (!window.__shelfClickDelegated) {
    window.__shelfClickDelegated = true;
    document.addEventListener('click', (e) => {
      if (!e.target || typeof e.target.closest !== 'function') return;
      let shelf = e.target.closest('.shelf');
      if (!shelf) {
        // Fallback per a gaps/padding dins de .fridge: troba el shelf
        // més proper verticalment al punt clicat.
        const fridge = e.target.closest('.fridge');
        if (fridge) {
          let minDist = Infinity;
          fridge.querySelectorAll('.shelf').forEach(s => {
            const r = s.getBoundingClientRect();
            const cy = r.top + r.height / 2;
            const d = Math.abs(e.clientY - cy);
            if (d < minDist) { minDist = d; shelf = s; }
          });
        }
      }
      if (!shelf) return;
      // .shelf només existeix dins de #screen-section. Defensa contra
      // un possible ús futur de la mateixa classe en una altra pantalla.
      const sectionScreen = document.getElementById('screen-section');
      if (!sectionScreen || !sectionScreen.contains(shelf)) return;
      const level = shelf.dataset.level;
      const zone = shelf.dataset.zone;
      if (zone && zone !== currentSection) {
        currentSection = zone;
        if (typeof _updateSectionTitle === 'function') _updateSectionTitle();
      }
      if (level && typeof openShelf === 'function') openShelf(level);
    });
  }

  // El swipe entre zones és scroll-snap natiu (vegeu .zones-slider a
  // styles.css). Mantenim setupSwipeNavigation() com a hook buit.
  setupSwipeNavigation();

  // "Afegir producte" (EatMe) obre el formulari manual directament; l'escàner
  // és un accés secundari (icona 📷 al header del formulari).
  document.getElementById('add-btn').addEventListener('click', () => openAddForm({}));
  // Icona d'escàner al header del formulari EatMe: en cancel·lar, torna al manual.
  const addScanBtn = document.getElementById('add-scan-btn');
  if (addScanBtn) {
    addScanBtn.setAttribute('aria-label', t('scanBarcode'));
    addScanBtn.title = t('scanBarcode');
    addScanBtn.addEventListener('click', () => {
      const sb = document.querySelector('#screen-scan .back-btn');
      if (sb) sb.dataset.back = 'add';
      showScreen('scan');
      setTimeout(startScanner, 200);
    });
  }

  const menuBtn = document.getElementById('menu-btn');
  if (menuBtn) menuBtn.addEventListener('click', () => openSettings('home'));

  // El botó enrere de la UI i el gest enrere del sistema conflueixen a
  // history.back(): la fletxa NO navega directament, sinó que fa history.back()
  // → popstate → performBack (a sota). Així l'historial i la pila visual no
  // divergeixen (si la fletxa navegués amb showScreen empenyeria una entrada i
  // aniria enrere visualment alhora → deriva).
  document.querySelectorAll('.back-btn').forEach(b => {
    b.addEventListener('click', () => { history.back(); });
  });

  // Gest enrere del sistema / botó enrere del navegador. Desfà UNA capa visual.
  // Prioritat: (−1) no-op d'un dismiss d'usuari; (0) aterratge de collapse;
  // (0.5) tancar el modal MIGRAT superior; (1) onboarding pas 2 → 1; (2) pantalla
  // no-launcher → data-back; (3) launcher = arrel → l'app es tanca.
  // Sub-pas 2 EN CURS (pilot cookme): només els modals migrats (registrats a
  // _modalStack via openModal) intercepten el gest. Els NO migrats no toquen ni
  // la pila ni l'historial → amb un modal no migrat obert, el gest navega la
  // pantalla de sota, exactament com al sub-pas 1 (cap regressió).
  window.addEventListener('popstate', () => {
    // (−1) Pop no-op: un dismissModal (tancament d'usuari) ha fet history.back()
    // només per treure la seva entrada; aquest popstate no és un "enrere" real.
    if (_modalNoopPops > 0) { _modalNoopPops--; return; }
    // (0) Aterratge de navCollapseToRoot: acabem de consumir el residu amb un
    // history.go(-d) i som a l'arrel. Executa el callback pendent (si n'hi ha) i
    // atura aquí — no interpretem aquest pop com un "enrere" d'usuari.
    if (_navPendingRoot) {
      const cb = _navPendingRoot;
      _navPendingRoot = null;
      _navFromPop = true;
      try { cb(); } finally { _navFromPop = false; }
      return;
    }
    // (0.5) Gest enrere amb un modal MIGRAT obert → tanca'l amb la SEVA neteja
    // real (removeEventListener d'Escape, destroy de pickers…), no un remove()
    // pelat. L'entrada ja l'ha consumida aquest mateix pop, per això NO fem
    // history.back(). Els modals no migrats no són a _modalStack → s'ignoren aquí.
    if (_modalStack.length) { _modalStack.pop().close(); return; }
    // (1) Onboarding de 2 passos (una sola .screen amb welcomeStep): pas 2 → 1.
    if (typeof welcomeStep !== 'undefined' && welcomeStep === 2) {
      const w = document.getElementById('screen-welcome');
      if (w && w.classList.contains('active') && typeof welcomeBackToLang === 'function') {
        _navFromPop = true;
        welcomeBackToLang();
        _navFromPop = false;
        return;
      }
    }
    // (2) Pantalla activa no-launcher → mateix back que la fletxa (data-back).
    const active = document.querySelector('.screen.active');
    if (active && active.id !== 'screen-launcher') {
      const backBtn = active.querySelector('.back-btn');
      if (backBtn) {
        _navFromPop = true;
        performBack(backBtn);
        _navFromPop = false;
      }
    }
    // (3) launcher (arrel): res → l'app es tanca (comportament normal).
  });

  document.querySelectorAll('.action-btn').forEach(b => {
    b.addEventListener('click', () => handleAction(b.dataset.action));
  });

  document.getElementById('save-btn').addEventListener('click', saveNewProduct);

  // Helper global per al fix del placeholder gris dels inputs date.
  // Aplica/treu classe .is-empty segons value, que el CSS usa per
  // pintar el format "dd/mm/aaaa" en gris quan està buit. Cal cridar-lo
  // manualment després de cada assignació JS a .value perquè els
  // canvis programàtics no disparen events 'input' ni 'change'.
  // (Substitueix l'intent inicial amb :placeholder-shown que iOS Safari
  // no suportava amb type=date — vegeu commit a0171f3 → escalat.)
  window._syncDateEmptyState = function (input) {
    if (input) input.classList.toggle('is-empty', !input.value);
  };

  // Init i listeners per a tots els input[type="date"] de la pàgina.
  // L'event 'input' cobreix l'entrada manual (teclat + native picker);
  // 'change' cobreix el commit del native picker a Safari iOS.
  document.querySelectorAll('input[type="date"]').forEach(input => {
    window._syncDateEmptyState(input);
    input.addEventListener('input', () => window._syncDateEmptyState(input));
    input.addEventListener('change', () => window._syncDateEmptyState(input));
  });

  document.querySelectorAll('.quick-date').forEach(b => {
    b.addEventListener('click', () => {
      const days = parseInt(b.dataset.days);
      const d = new Date();
      d.setDate(d.getDate() + days);
      const targetId = b.classList.contains('shopping-quick-date') ? 'input-shopping-date' : 'input-date';
      const target = document.getElementById(targetId);
      if (target) {
        target.value = formatDateForInput(d);
        window._syncDateEmptyState(target);
      }
      // Si està marcat "no caduca" del context shopping, el desmarquem
      if (b.classList.contains('shopping-quick-date')) {
        const noExp = document.getElementById('input-shopping-no-expiry');
        if (noExp && noExp.checked) noExp.checked = false;
      }
    });
  });

  // Botó ℹ️ del toggle multi-lots (#screen-add) → obre modal informatiu
  // amb els 2 casos d'ús. Substitueix el .form-hint llarg que pesava al
  // formulari (#9 del backlog memory/BACKLOG.md). Reutilitza el helper
  // _showInfoModal definit a settings.js.
  const multiLotsInfoBtn = document.getElementById('multi-lots-info');
  if (multiLotsInfoBtn) {
    multiLotsInfoBtn.addEventListener('click', () => {
      if (typeof _showInfoModal !== 'function') return;
      _showInfoModal('📦', t('infoSeparatePackagesTitle'), t('infoSeparatePackagesBody'));
    });
  }

  // Botó ℹ️ del llindar minStock (a #screen-add i a #screen-popular-edit).
  // Tots dos obren el mateix modal informatiu. Reutilitza _showInfoModal.
  const minStockInfoText = t('infoMinStockBody');
  ['minstock-info', 'popular-minstock-info'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', () => {
        if (typeof _showInfoModal !== 'function') return;
        _showInfoModal('🔔', t('infoMinStockTitle'), minStockInfoText);
      });
    }
  });

  // Configuració — pantalla principal amb 5 cards de categoria. Cadascuna
  // obre una sub-pantalla amb pestanyes (instalada en commits posteriors).
  // Spaces UI (FASE 2): listeners del selector de la home + pantalla
  // "Els meus espais". El render del selector viu a renderSpaceSelectorBar
  // i el cridem un cop al boot + cada cop que tornem al launcher (vegeu
  // showScreen wrapper a js/spaces-ui o més avall si cal).
  if (typeof attachSpacesScreenListeners === 'function') attachSpacesScreenListeners();
  if (window.SpacesUI && typeof window.SpacesUI.renderSpaceSelectorBar === 'function') {
    window.SpacesUI.renderSpaceSelectorBar();
  }

  if (typeof attachSettingsCategoryListeners === 'function') attachSettingsCategoryListeners();
  if (typeof attachSettingsRegionalListeners === 'function') attachSettingsRegionalListeners();
  if (typeof attachSettingsContentListeners === 'function') attachSettingsContentListeners();
  if (typeof attachSettingsActivityListeners === 'function') attachSettingsActivityListeners();
  if (typeof attachSettingsAppListeners === 'function') attachSettingsAppListeners();
  if (typeof attachSettingsDataListeners === 'function') attachSettingsDataListeners();

  // Banner de nivell (pantalla d'Impacte) → Els meus èxits
  const impactLevelBanner = document.getElementById('impact-level-banner');
  if (impactLevelBanner) impactLevelBanner.addEventListener('click', () => {
    if (typeof openAchievements === 'function') openAchievements();
  });
  document.querySelectorAll('#impact-period-pills .impact-period-pill').forEach(pill => {
    pill.addEventListener('click', () => setImpactPeriod(pill.dataset.period));
  });
  document.querySelectorAll('#screen-impact .impact-card-info-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (typeof showImpactInfoModal === 'function') showImpactInfoModal(btn.dataset.info);
    });
  });
  // (L'entrada "Esborrar dades" del menú es despatxa via data-action des
  // del delegate de #settings-content.)

  // Botons del submenú "Esborrar dades"
  const btnResetBiteme = document.getElementById('reset-eatme');
  if (btnResetBiteme) btnResetBiteme.addEventListener('click', resetBitemeProducts);

  const btnResetShopping = document.getElementById('reset-shopping');
  if (btnResetShopping) btnResetShopping.addEventListener('click', resetShoppingList);

  const btnResetImpact = document.getElementById('reset-impact');
  if (btnResetImpact) btnResetImpact.addEventListener('click', resetImpactHistory);

  const btnResetRecipeUsage = document.getElementById('reset-recipe-usage');
  if (btnResetRecipeUsage) btnResetRecipeUsage.addEventListener('click', () => {
    if (typeof confirmResetRecipeUsage === 'function') confirmResetRecipeUsage();
  });

  const btnResetGamification = document.getElementById('reset-gamification');
  if (btnResetGamification) btnResetGamification.addEventListener('click', () => {
    if (typeof confirmResetGamificationProgress === 'function') confirmResetGamificationProgress();
  });

  // Custom recipes: botó nou + accions d'edició al detall
  const btnAddRecipe = document.getElementById('btn-add-recipe');
  if (btnAddRecipe) btnAddRecipe.addEventListener('click', () => {
    if (typeof openNewRecipeForm === 'function') openNewRecipeForm();
  });

  const btnEditRecipe = document.getElementById('btn-edit-recipe');
  if (btnEditRecipe) btnEditRecipe.addEventListener('click', () => {
    if (typeof openEditRecipeForm === 'function' && currentRecipeId) openEditRecipeForm(currentRecipeId);
  });

  const btnRecipeDetailDelete = document.getElementById('recipe-detail-delete');
  if (btnRecipeDetailDelete) btnRecipeDetailDelete.addEventListener('click', () => {
    if (typeof deleteCustomRecipe === 'function' && currentRecipeId) deleteCustomRecipe(currentRecipeId);
  });

  const btnRestoreRecipe = document.getElementById('btn-restore-recipe');
  if (btnRestoreRecipe) btnRestoreRecipe.addEventListener('click', () => {
    if (typeof restoreOriginalRecipe === 'function') restoreOriginalRecipe();
  });

  // Formulari de recepta custom
  const btnPickRecipeEmoji = document.getElementById('btn-pick-recipe-emoji');
  if (btnPickRecipeEmoji) btnPickRecipeEmoji.addEventListener('click', () => {
    if (typeof openEmojiPicker === 'function') openEmojiPicker('recipe', 'recipe-edit');
  });

  document.querySelectorAll('#recipe-edit-difficulty button').forEach(btn => {
    btn.addEventListener('click', () => {
      if (typeof setRecipeEditDifficulty === 'function') setRecipeEditDifficulty(btn.dataset.value);
    });
  });

  const btnAddIngredient = document.getElementById('btn-add-ingredient');
  if (btnAddIngredient) btnAddIngredient.addEventListener('click', () => {
    if (typeof addEmptyIngredient === 'function') addEmptyIngredient();
  });

  const btnAddStep = document.getElementById('btn-add-step');
  if (btnAddStep) btnAddStep.addEventListener('click', () => {
    if (typeof addEmptyStep === 'function') addEmptyStep();
  });

  const btnSaveRecipe = document.getElementById('btn-save-recipe');
  if (btnSaveRecipe) btnSaveRecipe.addEventListener('click', () => {
    if (typeof saveRecipeFromForm === 'function') saveRecipeFromForm();
  });

  const btnCancelRecipe = document.getElementById('btn-cancel-recipe');
  if (btnCancelRecipe) btnCancelRecipe.addEventListener('click', () => {
    if (typeof cancelRecipeEdit === 'function') cancelRecipeEdit();
  });

  const btnDeleteRecipeFromForm = document.getElementById('btn-delete-recipe');
  if (btnDeleteRecipeFromForm) btnDeleteRecipeFromForm.addEventListener('click', () => {
    if (typeof deleteCustomRecipe === 'function' && editingRecipeId) deleteCustomRecipe(editingRecipeId);
  });

  const btnServingsMinus = document.getElementById('recipe-edit-servings-minus');
  if (btnServingsMinus) btnServingsMinus.addEventListener('click', () => {
    if (typeof adjustRecipeEditServings === 'function') adjustRecipeEditServings(-1);
  });
  const btnServingsPlus = document.getElementById('recipe-edit-servings-plus');
  if (btnServingsPlus) btnServingsPlus.addEventListener('click', () => {
    if (typeof adjustRecipeEditServings === 'function') adjustRecipeEditServings(1);
  });

  const btnResetAll = document.getElementById('reset-all');
  if (btnResetAll) btnResetAll.addEventListener('click', resetAll);

  const btnExportData = document.getElementById('export-data');
  if (btnExportData) btnExportData.addEventListener('click', exportData);

  const btnImportData = document.getElementById('import-data');
  if (btnImportData) btnImportData.addEventListener('click', importData);

  // (Ubicacions / Sincronització / Supermercats des de Configuració es
  // despatxen via data-action des del delegate de #settings-content.)

  // Botó Editar les meves botigues
  const btnToggleEditShops = document.getElementById('btn-toggle-edit-shops');
  if (btnToggleEditShops) btnToggleEditShops.addEventListener('click', toggleEditShopsMode);

  // Botó Guardar canvis (surt del mode edició)
  const btnSaveShops = document.getElementById('btn-save-shops');
  if (btnSaveShops) btnSaveShops.addEventListener('click', () => {
    manageSupermarketsMode = 'view';
    renderManageSupermarkets();
    showToast(t('saved'));
  });

  // Productes populars: edit/sort/add/save
  const btnTogglePopular = document.getElementById('btn-toggle-edit-popular');
  if (btnTogglePopular) btnTogglePopular.addEventListener('click', togglePopularEditMode);

  // Cercador de productes populars
  const popularSearch = document.getElementById('popular-search');
  if (popularSearch) popularSearch.addEventListener('input', () => {
    popularSearchQuery = popularSearch.value;
    renderPopularList();
  });

  const btnSortAlpha = document.getElementById('popular-sort-alpha');
  if (btnSortAlpha) btnSortAlpha.addEventListener('click', () => {
    sortPopularAlpha();
    renderPopularList();
    showToast('🔤 ' + t('sorted'));
  });

  const btnAddCustomPopular = document.getElementById('popular-add-custom');
  if (btnAddCustomPopular) btnAddCustomPopular.addEventListener('click', addCustomPopular);

  const btnSavePopularChanges = document.getElementById('btn-save-popular-changes');
  if (btnSavePopularChanges) btnSavePopularChanges.addEventListener('click', () => {
    popularMode = 'view';
    renderPopularList();
    showToast(t('saved'));
  });

  // (Populars / Receptes des de Configuració es despatxen via data-action
  // des del delegate de #settings-content.)

  // "Què tinc a casa"
  const btnWhatIHave = document.getElementById('btn-what-i-have');
  if (btnWhatIHave) btnWhatIHave.addEventListener('click', openWhatIHaveScreen);

  document.querySelectorAll('#what-i-have-filters .filter-pill').forEach(pill => {
    pill.addEventListener('click', () => setWhatIHaveFilter(pill.dataset.filter));
  });

  // Llistes especials
  const btnSpecial = document.getElementById('btn-special-lists');
  if (btnSpecial) btnSpecial.addEventListener('click', openSpecialLists);

  const btnAddAllSpecial = document.getElementById('btn-add-all-to-shopping');
  if (btnAddAllSpecial) btnAddAllSpecial.addEventListener('click', addAllSpecialToShopping);

  // Llistes especials: edit mode
  const btnToggleEditSpecial = document.getElementById('btn-toggle-edit-special-lists');
  if (btnToggleEditSpecial) btnToggleEditSpecial.addEventListener('click', toggleEditSpecialListsMode);

  const btnAddCustomSpecial = document.getElementById('btn-add-custom-special-list');
  if (btnAddCustomSpecial) btnAddCustomSpecial.addEventListener('click', addCustomSpecialList);

  const btnSaveSpecial = document.getElementById('btn-save-special-lists');
  if (btnSaveSpecial) btnSaveSpecial.addEventListener('click', () => {
    specialListsMode = 'view';
    renderSpecialLists();
    showToast(t('saved'));
  });

  // Edició d'una llista (items)
  const btnToggleEditListItems = document.getElementById('btn-toggle-edit-list-items');
  if (btnToggleEditListItems) btnToggleEditListItems.addEventListener('click', toggleEditListItems);

  const btnAddListItem = document.getElementById('btn-add-list-item');
  if (btnAddListItem) btnAddListItem.addEventListener('click', addItemToCurrentList);

  // Edició d'item (especial): emoji i guardar
  const btnPickSpecialItemEmoji = document.getElementById('btn-pick-special-item-emoji');
  if (btnPickSpecialItemEmoji) btnPickSpecialItemEmoji.addEventListener('click', () => openEmojiPicker('special-item', 'special-item-edit'));

  const btnSaveSpecialItem = document.getElementById('btn-save-special-item');
  if (btnSaveSpecialItem) btnSaveSpecialItem.addEventListener('click', saveSpecialItem);

  // Botó Veure-ho tot
  const btnViewAll = document.getElementById('btn-view-all');
  if (btnViewAll) btnViewAll.addEventListener('click', openViewAll);

  const btnSortExpiry = document.getElementById('btn-sort-by-expiry');
  if (btnSortExpiry) btnSortExpiry.addEventListener('click', () => {
    viewAllSortMode = 'expiry';
    renderViewAll();
  });

  const btnSortZone = document.getElementById('btn-sort-by-zone');
  if (btnSortZone) btnSortZone.addEventListener('click', () => {
    viewAllSortMode = 'zone';
    renderViewAll();
  });

  const btnSortCalendar = document.getElementById('btn-sort-by-calendar');
  if (btnSortCalendar) btnSortCalendar.addEventListener('click', () => {
    viewAllSortMode = 'calendar';
    if (typeof resetCalendarState === 'function') resetCalendarState();
    renderViewAll();
  });

  // Cercador a la pantalla "Tot". El valor es manté entre canvis
  // de mode del toolbar (caducitat / zona / calendari).
  const viewAllSearch = document.getElementById('view-all-search');
  const viewAllSearchClear = document.getElementById('view-all-search-clear');
  if (viewAllSearch && viewAllSearchClear) {
    viewAllSearch.addEventListener('input', () => {
      viewAllSearchClear.hidden = !viewAllSearch.value;
      if (typeof renderViewAll === 'function') renderViewAll();
    });
    viewAllSearchClear.addEventListener('click', () => {
      viewAllSearch.value = '';
      viewAllSearchClear.hidden = true;
      if (typeof renderViewAll === 'function') renderViewAll();
      viewAllSearch.focus();
    });
  }

  // (Notificacions des de Configuració es despatxa via data-action des del
  // delegate de #settings-content.)

  // Botó "Permetre notificacions": event delegation al document perquè
  // funcioni encara que la pantalla s'estigui re-renderitzant. Així
  // quedem resilient a qualsevol mutació del DOM dins #smart-notif-perm.
  document.addEventListener('click', (e) => {
    const btn = e.target && e.target.closest && e.target.closest('#smart-notif-request-perm');
    if (btn) {
      console.log('[NOTIF] Delegation: click on #smart-notif-request-perm');
      handleRequestPermission();
    }
  });

  // Master switch — re-renderitza tota la pantalla per mostrar/amagar el bloc
  // condicional segons l'estat.
  const togMaster = document.getElementById('smart-notif-master');
  if (togMaster) togMaster.addEventListener('change', (e) => {
    if (typeof setSmartNotifMaster === 'function') setSmartNotifMaster(e.target.checked);
    if (typeof renderSmartNotifSettingsScreen === 'function') renderSmartNotifSettingsScreen();
    updateNotifStatus();
    showToast(e.target.checked ? '✅ ' + t('notifActivated') : t('notifDeactivated'));
  });

  // Botó "Tornar a comprovar" en estat denied: només refresca l'estat
  const btnRecheck = document.getElementById('smart-notif-recheck');
  if (btnRecheck) btnRecheck.addEventListener('click', () => {
    if (typeof renderSmartNotifSettingsScreen === 'function') renderSmartNotifSettingsScreen();
    updateNotifStatus();
  });

  // Botó "Provar notificació"
  const btnTest = document.getElementById('smart-notif-test-btn');
  if (btnTest) btnTest.addEventListener('click', testNotificationNow);

  const btnCreate = document.getElementById('btn-create-list');
  if (btnCreate) btnCreate.addEventListener('click', createNewList);

  const btnJoin = document.getElementById('btn-join-list');
  if (btnJoin) btnJoin.addEventListener('click', () => {
    document.getElementById('input-sync-code').value = '';
    showScreen('sync-join');
    setTimeout(() => document.getElementById('input-sync-code').focus(), 250);
  });

  const btnConfirmJoin = document.getElementById('btn-confirm-join');
  if (btnConfirmJoin) btnConfirmJoin.addEventListener('click', joinExistingList);

  const btnDisconnect = document.getElementById('btn-disconnect');
  if (btnDisconnect) btnDisconnect.addEventListener('click', disconnectSync);

  const btnCopy = document.getElementById('btn-copy-code');
  if (btnCopy) btnCopy.addEventListener('click', copyCodeToClipboard);

  // ===== LLISTA DE LA COMPRA =====
  // Botons del launcher
  const launcherShopping = document.getElementById('launcher-shopping');
  if (launcherShopping) launcherShopping.addEventListener('click', openShoppingList);

  const launcherTracker = document.getElementById('launcher-tracker');
  if (launcherTracker) launcherTracker.addEventListener('click', () => {
    renderHome();
    showScreen('home');
  });

  const launcherMenuBtn = document.getElementById('launcher-menu-btn');
  if (launcherMenuBtn) launcherMenuBtn.addEventListener('click', () => openSettings('launcher'));

  // CookMe: botó del launcher + pestanyes
  const btnCookme = document.getElementById('btn-cookme');
  if (btnCookme) btnCookme.addEventListener('click', () => {
    if (typeof openCookMe === 'function') openCookMe();
  });

  // (Els chips antics #cookme-filters .cookme-filter ja no existeixen —
  // s'han substituït per les bullets-tab del Swiper cube. La pagination
  // de Swiper ja és clickable per saltar a una cara, i slideChange
  // sincronitza currentRecipeFilter — vegeu _ensureCookMeSwiper.)

  // Toggle mode d'edició de la llista de receptes
  const btnToggleRecipeEdit = document.getElementById('btn-toggle-recipe-edit');
  if (btnToggleRecipeEdit) btnToggleRecipeEdit.addEventListener('click', () => {
    if (typeof toggleRecipeEditMode === 'function') toggleRecipeEditMode();
  });

  // Cercador de receptes
  const cookmeSearchInput = document.getElementById('cookme-search');
  if (cookmeSearchInput) cookmeSearchInput.addEventListener('input', (e) => {
    if (typeof setCookMeSearch === 'function') setCookMeSearch(e.target.value);
  });

  // Toggle d'ordenació (per % / alfabètic)
  const cookmeSortBtn = document.getElementById('cookme-sort');
  if (cookmeSortBtn) cookmeSortBtn.addEventListener('click', () => {
    if (typeof toggleCookMeSort === 'function') toggleCookMeSort();
  });

  // Botó "Afegir al BuyMe" del detall de recepta
  const recipeAddMissing = document.getElementById('recipe-add-missing');
  if (recipeAddMissing) recipeAddMissing.addEventListener('click', () => {
    if (typeof addMissingToBuyMe === 'function') addMissingToBuyMe();
  });

  // Botó "He cuinat" del detall de recepta
  const recipeCooked = document.getElementById('recipe-cooked');
  if (recipeCooked) recipeCooked.addEventListener('click', () => {
    if (typeof openCookConsumeModal === 'function') openCookConsumeModal();
  });

  // Editor de persones al detall de recepta
  const recipeServingMinus = document.getElementById('recipe-serving-minus');
  if (recipeServingMinus) recipeServingMinus.addEventListener('click', () => {
    if (typeof adjustRecipeServings === 'function') adjustRecipeServings(-1);
  });
  const recipeServingPlus = document.getElementById('recipe-serving-plus');
  if (recipeServingPlus) recipeServingPlus.addEventListener('click', () => {
    if (typeof adjustRecipeServings === 'function') adjustRecipeServings(1);
  });

  // (El botó CookMe del launcher ja no mostra cap badge: era confús perquè
  //  semblava un avís pendent. La pantalla CookMe en si ja indica les receptes
  //  disponibles via el filtre 'Disponibles'.)

  // Pantalla de supermercats
  const btnManageSm = document.getElementById('btn-manage-supermarkets');
  if (btnManageSm) btnManageSm.addEventListener('click', () => openManageSupermarkets('shopping'));

  // Pantalla de gestió de supermercats
  const btnAddCustomSm = document.getElementById('btn-add-custom-supermarket');
  if (btnAddCustomSm) btnAddCustomSm.addEventListener('click', () => openSupermarketEdit(null));

  // Toggle mode editar items (botó al header del super)
  const btnEditSupermarket = document.getElementById('supermarket-edit-btn');
  if (btnEditSupermarket) btnEditSupermarket.addEventListener('click', toggleSupermarketItemsMode);

  // Pantalla d'edició de supermercat
  const btnSaveSm = document.getElementById('btn-save-supermarket');
  if (btnSaveSm) btnSaveSm.addEventListener('click', saveSupermarket);

  const btnDelSm = document.getElementById('btn-delete-supermarket');
  if (btnDelSm) btnDelSm.addEventListener('click', deleteSupermarket);

  // Pantalla d'items: "Afegir" obre el manual directament (escàner = icona al header).
  const btnAddItem = document.getElementById('btn-add-shopping-item');
  if (btnAddItem) btnAddItem.addEventListener('click', () => {
    openShoppingItemEdit(null);
  });
  // Icona d'escàner al header del formulari BuyMe: en cancel·lar, torna al manual.
  const shoppingScanBtn = document.getElementById('shopping-scan-btn');
  if (shoppingScanBtn) {
    shoppingScanBtn.setAttribute('aria-label', t('scanBarcode'));
    shoppingScanBtn.title = t('scanBarcode');
    shoppingScanBtn.addEventListener('click', () => {
      const sb = document.querySelector('#screen-scan .back-btn');
      if (sb) sb.dataset.back = 'shopping-item-edit';
      if (typeof startShoppingScanner === 'function') startShoppingScanner();
    });
  }

  // Botó "⭐ Productes populars" dins del formulari del BuyMe — reutilitza la
  // mateixa pantalla de populars que l'EatMe, però amb origin='shopping'
  // perquè el back i la selecció apuntin de tornada al BuyMe.
  const shoppingPopularBtn = document.getElementById('shopping-popular-btn');
  if (shoppingPopularBtn) shoppingPopularBtn.addEventListener('click', () => {
    if (typeof openPopular === 'function') openPopular('shopping');
  });

  // Pantalla d'edició d'item
  const btnSaveItem = document.getElementById('btn-save-shopping-item');
  if (btnSaveItem) btnSaveItem.addEventListener('click', saveShoppingItem);

  const btnDelItem = document.getElementById('btn-delete-shopping-item');
  if (btnDelItem) btnDelItem.addEventListener('click', deleteShoppingItem);

  // Botó "📦 Moure a un altre espai" del detall d'edició de l'item de
  // compra (Fase B de Spaces). Només visible quan editingShoppingItem
  // existeix i hi ha algun Espai destí — vegeu _refreshMoveShoppingItemBtn.
  const btnMoveItem = document.getElementById('btn-move-shopping-item');
  if (btnMoveItem) btnMoveItem.addEventListener('click', () => {
    if (typeof editingShoppingItem === 'undefined' || !editingShoppingItem) return;
    if (window.SpacesUI && typeof window.SpacesUI.showMoveShoppingItemModal === 'function') {
      window.SpacesUI.showMoveShoppingItemModal(editingShoppingItem);
    }
  });

  // Inicia sincronització si ja teníem codi guardat
  initSync();

  // Auto-restore en reconnectar: si el boot va ser offline (o es va
  // perdre la connexió), FBSync.init() falla i syncEnabled queda false.
  // En tornar la xarxa, reintentem initSync() perquè onRemoteData regui
  // les dades del núvol. initSync és re-cridable amb seguretat
  // (connectToList desconnecta el listener anterior).
  try {
    window.addEventListener('online', () => {
      if (typeof syncEnabled !== 'undefined' && !syncEnabled && typeof initSync === 'function') {
        initSync();
      }
    });
  } catch (e) {}

  // Si acabem de fer un Switch d'Espai (vegeu SpacesSystem.switchToSpace),
  // donem 1.5 s perquè la snapshot inicial del nou Espai arribi del cloud
  // i, si segueix sense botigues, hi inicialitzem les del país. Així:
  //   - Espai NOU acabat de crear (cloud té supermarkets:[]) → defaults
  //     locals + pushToServer els puja al cloud per a futurs dispositius.
  //   - Espai EXISTENT (cloud té dades reals) → onRemoteData els ha
  //     escrit dins els 1.5 s; el check no fa res.
  //   - Sense connexió → defaults locals; pushToServer s'encarregarà
  //     més tard.
  try {
    if (sessionStorage.getItem('eatmefirst_just_switched_space') === '1' && window.SpacesSystem) {
      setTimeout(() => {
        try { window.SpacesSystem.initSpaceDefaultsAfterSwitch(); }
        catch (e) { console.warn('[Spaces] post-switch defaults check error', e); }
      }, 1500);
    }
  } catch (e) {}

  // Inicia notificacions
  initNotifications();

  // Còpia de seguretat automàtica diària: si encara no n'hi ha cap o
  // l'última és d'ahir o més antiga, en fa una de l'estat actual del
  // localStorage. Vegeu js/backup.js — la rotació es queda a 7 còpies.
  if (window.BackupSystem && typeof window.BackupSystem.checkAutoBackup === 'function') {
    try { window.BackupSystem.checkAutoBackup(); } catch (e) { console.warn('[Backup] init error', e); }
  }

  // Primer render dels banners del launcher. Cal fer-ho amb un petit delay
  // perquè (1) initNotifications() pugui carregar smartNotifSettings i
  // (2) el DOM del launcher quedi muntat. A les navegacions posteriors,
  // showScreen('launcher') ja invoca renderSmartNotifBanners() pel seu compte.
  setTimeout(() => {
    if (typeof renderSmartNotifBanners === 'function') renderSmartNotifBanners();
  }, 200);

  // Productes populars (des del formulari Add)
  document.getElementById('popular-btn').addEventListener('click', () => {
    if (typeof openPopular === 'function') openPopular('add');
    else { renderPopularList(); showScreen('popular'); }
  });

  // Codi a mà
  document.getElementById('manual-code-btn').addEventListener('click', () => {
    document.getElementById('input-barcode').value = '';
    showScreen('manual-code');
    setTimeout(() => document.getElementById('input-barcode').focus(), 250);
  });
  document.getElementById('search-barcode-btn').addEventListener('click', searchManualBarcode);

  // Ubicacions: gestió
  const newLocBtn = document.getElementById('new-location-btn');
  if (newLocBtn) newLocBtn.addEventListener('click', () => openLocationEditor(-1));

  const saveLocBtn = document.getElementById('save-location-btn');
  if (saveLocBtn) saveLocBtn.addEventListener('click', saveLocationEdit);

  const delLocBtn = document.getElementById('loc-edit-delete');
  if (delLocBtn) delLocBtn.addEventListener('click', () => {
    if (editingLocationIndex >= 0) {
      // La navegació al list la fa deleteLocation DINS del callback de
      // confirm. Si l'usuari cancel·la el modal, es queda a l'editor.
      // (Abans del fix de confirm() → modal asíncron, aquest handler
      // cridava showScreen('locations') síncronament — bug: amb el modal
      // asíncron, el showScreen disparava abans que l'usuari confirmés.)
      deleteLocation(editingLocationIndex);
    }
  });
});


document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    if (typeof recordAppActivity === 'function') recordAppActivity();
    renderHome();
    // Si tornem amb el launcher visible, refresquem els banners — l'estat
    // pot haver canviat (caducitats noves, suggeriments nous, etc.).
    const launcher = document.getElementById('screen-launcher');
    if (launcher && launcher.classList.contains('active') && typeof renderSmartNotifBanners === 'function') {
      renderSmartNotifBanners();
    }
  } else {
    stopScanner();
  }
});


// ============================================================
// Detector de TAP compartit per als cubs de Swiper shops/levels.
// Mateix patró que el del CookMe (fece010): l'efecte 'cube' pot
// empassar-se el 'click' i, amb la rotació 3D, el click sintetitzat es
// reapunta a un node pare → el delegate 'click' no trobava el botó/item.
// Detectem el tap manualment (pointerdown→pointerup en CAPTURA, amb guarda
// de moviment/durada) i resolem amb el TARGET del pointerdown, que sí
// apunta al botó/item correcte. NO afecta #zones-slider ni el CookMe.
let _cubeTapStart = null;
function _onCubePointerDown(e) {
  const cube = e.target.closest && e.target.closest('#shops-slider, #levels-slider');
  if (!cube) { _cubeTapStart = null; return; }
  _cubeTapStart = { x: e.clientX, y: e.clientY, t: Date.now(), target: e.target, cube: cube.id };
}
function _onCubePointerCancel() { _cubeTapStart = null; }
function _onCubePointerUp(e) {
  const start = _cubeTapStart;
  _cubeTapStart = null;
  if (!start) return;
  const dx = e.clientX - start.x, dy = e.clientY - start.y;
  if (Math.sqrt(dx * dx + dy * dy) > 10) return;  // swipe/scroll, no tap
  if (Date.now() - start.t > 800) return;          // press massa llarg (long-press)
  if (start.cube === 'shops-slider') {
    if (typeof _handleShopsTap === 'function') _handleShopsTap(start.target);
  } else if (start.cube === 'levels-slider') {
    if (typeof _handleLevelsTap === 'function') _handleLevelsTap(start.target);
  }
}
if (typeof document !== 'undefined') {
  document.addEventListener('pointerdown', _onCubePointerDown, true);
  document.addEventListener('pointerup', _onCubePointerUp, true);
  document.addEventListener('pointercancel', _onCubePointerCancel, true);
}
