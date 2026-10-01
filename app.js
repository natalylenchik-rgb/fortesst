const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const wizard = $('#wizardModal');
const companyModal = $('#companyModal');
const partnerModal = $('#partnerModal');
const toast = $('#toast');
let toastTimer;

function openModal(modal) {
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => $('input, select', modal)?.focus(), 50);
}

function closeModal(modal) {
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

function showToast(message) {
  $('span', toast).textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function openWizard(template) {
  const option = $$('#documentType option').find(item => item.textContent.includes(template || ''));
  if (option) $('#documentType').value = option.value;
  openModal(wizard);
}

$$('[data-open-wizard]').forEach(button => button.addEventListener('click', () => openWizard()));
$$('[data-template]').forEach(button => button.addEventListener('click', () => openWizard(button.dataset.template)));
$('[data-company]').addEventListener('click', () => openModal(companyModal));
$$('[data-close]').forEach(button => button.addEventListener('click', () => closeModal(button.closest('.modal'))));
$$('.modal').forEach(modal => modal.addEventListener('click', event => {
  if (event.target === modal) closeModal(modal);
}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') $$('.modal.open').forEach(closeModal);
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    $('#searchInput').focus();
  }
});

$('#wizardForm').addEventListener('submit', event => {
  event.preventDefault();
  closeModal(wizard);
  showToast('Черновик создан — можно проверить и скачать');
  event.currentTarget.reset();
});

$('#companyForm').addEventListener('submit', event => {
  event.preventDefault();
  const details = Object.fromEntries(new FormData(event.currentTarget));
  localStorage.setItem('companyDetails', JSON.stringify(details));
  closeModal(companyModal);
  showToast('Реквизиты сохранены');
});

const savedCompany = JSON.parse(localStorage.getItem('companyDetails') || 'null');
if (savedCompany) Object.entries(savedCompany).forEach(([name, value]) => {
  const field = $(`[name="${name}"]`, $('#companyForm'));
  if (field) field.value = value;
});

$('#searchInput').addEventListener('input', event => {
  const query = event.target.value.trim().toLowerCase();
  let visible = 0;
  $$('.document-row').forEach(row => {
    const matches = row.dataset.name.toLowerCase().includes(query);
    row.style.display = matches ? '' : 'none';
    if (matches) visible += 1;
  });
  $('#emptySearch').style.display = visible ? 'none' : 'block';
});

$$('[data-category]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  navigate('templates', link.dataset.category);
  closeMobileMenu();
}));

$$('.download').forEach(button => button.addEventListener('click', () => showToast('Документ готовится к скачиванию')));
$('[data-all-docs]').addEventListener('click', () => showToast('Все документы уже перед вами'));
$('[data-all-templates]').addEventListener('click', () => {
  $$('.template-card').forEach(card => card.style.display = '');
  showToast('Показаны все шаблоны');
});

const sidebar = $('#sidebar');
const overlay = $('#mobileOverlay');
function closeMobileMenu() { sidebar.classList.remove('open'); overlay.classList.remove('show'); }
$('#mobileMenu').addEventListener('click', () => { sidebar.classList.add('open'); overlay.classList.add('show'); });
$('#sidebarClose').addEventListener('click', closeMobileMenu);
overlay.addEventListener('click', closeMobileMenu);

const templates = [
  { name: 'Договор поставки', category: 'Контрагенты', description: 'Поставка товаров с условиями оплаты и приёмки', color: 'coral-bg' },
  { name: 'Договор оказания услуг', category: 'Контрагенты', description: 'Для разовых и регулярных услуг', color: 'coral-bg' },
  { name: 'Договор подряда', category: 'Контрагенты', description: 'Выполнение работ с передачей результата', color: 'coral-bg' },
  { name: 'Акт выполненных работ', category: 'Контрагенты', description: 'Подтверждение объёма и приёмки работ', color: 'coral-bg' },
  { name: 'Претензия контрагенту', category: 'Контрагенты', description: 'Требование исполнить обязательства', color: 'coral-bg' },
  { name: 'Трудовой договор', category: 'Кадры', description: 'Оформление сотрудника на работу', color: 'blue-bg' },
  { name: 'Приём на работу', category: 'Кадры', description: 'Заявление и кадровый комплект', color: 'blue-bg' },
  { name: 'Перевод сотрудника', category: 'Кадры', description: 'Изменение должности или подразделения', color: 'blue-bg' },
  { name: 'Увольнение сотрудника', category: 'Кадры', description: 'Комплект документов при увольнении', color: 'blue-bg' },
  { name: 'Договор подряда с физлицом', category: 'Кадры', description: 'Работы без оформления в штат', color: 'blue-bg' },
  { name: 'Обращение в госорган', category: 'Госорганы', description: 'Универсальная форма обращения', color: 'violet-bg' },
  { name: 'Ответ на запрос', category: 'Госорганы', description: 'Официальный ответ организации', color: 'violet-bg' },
  { name: 'Доверенность', category: 'Госорганы', description: 'Представление интересов организации', color: 'violet-bg' },
  { name: 'Приказ о приёме', category: 'Приказы', description: 'Оформление приёма сотрудника', color: 'gold-bg' },
  { name: 'Приказ об отпуске', category: 'Приказы', description: 'Ежегодный или иной отпуск', color: 'gold-bg' },
  { name: 'Приказ о командировке', category: 'Приказы', description: 'Сроки, место и цель поездки', color: 'gold-bg' },
  { name: 'Приказ по основной деятельности', category: 'Приказы', description: 'Свободная форма распоряжения', color: 'gold-bg' },
];

const pageRoot = $('.page');
const homeBlocks = [...pageRoot.children];
const workspace = document.createElement('div');
workspace.className = 'workspace-page';
workspace.hidden = true;
pageRoot.append(workspace);

const documentRows = [
  ['Договор оказания услуг', 'ООО «Вектор»', '28.09.2026', 'Готов'],
  ['Трудовой договор', 'Котова Мария', '26.09.2026', 'Черновик'],
  ['Акт выполненных работ', 'ООО «Вектор»', '25.09.2026', 'Готов'],
  ['Приказ о приёме на работу', 'Котова Мария', '24.09.2026', 'Готов'],
  ['Договор поставки', 'ООО «Промснаб»', '18.09.2026', 'Готов'],
  ['Доверенность', 'Иванов Алексей', '12.09.2026', 'Черновик'],
];

function pageHeader(title, subtitle, action = '') {
  return `<div class="workspace-head"><div><p class="eyebrow">РАБОЧЕЕ ПРОСТРАНСТВО</p><h1>${title}</h1><p>${subtitle}</p></div>${action}</div>`;
}

function renderDocuments() {
  workspace.innerHTML = `${pageHeader('Мои документы', 'Все созданные документы в одном месте', '<button class="create-top" data-action-template><svg><use href="#i-plus"/></svg>Создать документ</button>')}
    <div class="stats-grid"><div><strong>6</strong><span>Всего документов</span></div><div><strong>4</strong><span>Готовы</span></div><div><strong>2</strong><span>Черновики</span></div></div>
    <div class="panel workspace-panel"><div class="toolbar"><div class="search-wrap"><svg><use href="#i-search"/></svg><input class="table-search" placeholder="Поиск по документам"/></div><select class="filter-select"><option>Все статусы</option><option>Готов</option><option>Черновик</option></select></div><div class="data-table">${documentRows.map((doc, index) => `<div class="data-row" data-doc-row="${doc.join(' ').toLowerCase()}"><span class="doc-icon ${index % 2 ? 'blue-bg' : 'coral-bg'}"><svg><use href="#i-file"/></svg></span><div><strong>${doc[0]}</strong><small>${doc[1]} · ${doc[2]}</small></div><span class="status ${doc[3] === 'Готов' ? 'ready' : 'draft'}">${doc[3]}</span><button class="outline-button compact" data-doc-action>${doc[3] === 'Готов' ? 'Скачать' : 'Продолжить'}</button></div>`).join('')}</div></div>`;
  const search = $('.table-search', workspace);
  const status = $('.filter-select', workspace);
  const apply = () => $$('.data-row', workspace).forEach(row => {
    const textMatch = row.dataset.docRow.includes(search.value.toLowerCase());
    const statusMatch = status.value === 'Все статусы' || row.textContent.includes(status.value);
    row.hidden = !(textMatch && statusMatch);
  });
  search.addEventListener('input', apply); status.addEventListener('change', apply);
}

function renderTemplates(activeCategory = 'Все') {
  workspace.innerHTML = `${pageHeader('Шаблоны документов', 'Выберите документ — мы зададим вопросы и соберём готовый файл')}
    <div class="category-tabs">${['Все', 'Контрагенты', 'Кадры', 'Госорганы', 'Приказы'].map(category => `<button class="${category === activeCategory ? 'active' : ''}" data-template-filter="${category}">${category}</button>`).join('')}</div>
    <div class="library-grid">${templates.filter(item => activeCategory === 'Все' || item.category === activeCategory).map(item => `<article class="library-card"><span class="doc-icon ${item.color}"><svg><use href="#i-file"/></svg></span><span class="library-category">${item.category}</span><h3>${item.name}</h3><p>${item.description}</p><button class="outline-button" data-action-template="${item.name}">Создать документ <svg><use href="#i-chevron"/></svg></button></article>`).join('')}</div>`;
}

const defaultPartners = [
  { name: 'ООО «Вектор»', unp: '193456780', type: 'Покупатель', docs: 3 },
  { name: 'ООО «Промснаб»', unp: '190234561', type: 'Поставщик', docs: 1 },
  { name: 'ИП Смирнов Д.В.', unp: '691234567', type: 'Подрядчик', docs: 2 },
];
const safe = value => String(value).replace(/[&<>'"]/g, symbol => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[symbol]);
function getPartners() { return JSON.parse(localStorage.getItem('partners') || JSON.stringify(defaultPartners)); }
function renderPartners() {
  const partners = getPartners();
  workspace.innerHTML = `${pageHeader('Контрагенты', 'Карточки партнёров и связанные документы', '<button class="create-top" data-add-partner><svg><use href="#i-plus"/></svg>Добавить контрагента</button>')}
    <div class="partner-grid">${partners.map((partner, index) => `<article class="partner-card"><div class="partner-top"><span class="company-logo">${safe(partner.name).replace(/[^А-ЯA-Z]/g, '').slice(0, 2) || 'КТ'}</span><button class="row-more">•••</button></div><h3>${safe(partner.name)}</h3><p>УНП ${safe(partner.unp)}</p><span class="partner-type">${safe(partner.type)}</span><div class="partner-footer"><span>${partner.docs || 0} документа</span><button data-partner-doc="${index}">Создать договор <svg><use href="#i-chevron"/></svg></button></div></article>`).join('')}</div>`;
}

function renderCompany() {
  workspace.innerHTML = `${pageHeader('Моя организация', 'Реквизиты автоматически используются в новых документах', '<button class="create-top" data-edit-company>Изменить данные</button>')}
    <div class="company-layout"><div class="panel detail-card"><div class="company-head"><span class="company-logo">ИП</span><div><h2>ИП Иванов Алексей Александрович</h2><p>Индивидуальный предприниматель</p></div></div><dl><div><dt>УНП</dt><dd>192345678</dd></div><div><dt>Юридический адрес</dt><dd>220030, г. Минск, ул. Интернациональная, 10</dd></div><div><dt>Расчётный счёт</dt><dd>BY12 ALFA 3013 0000 0000 1027 0000</dd></div><div><dt>Банк</dt><dd>ЗАО «Альфа-Банк», BIC ALFABY2X</dd></div><div><dt>Телефон</dt><dd>+375 29 123-45-67</dd></div><div><dt>Email</dt><dd>info@ivanov.by</dd></div></dl></div><aside class="panel completeness"><span class="completion-ring">80<small>%</small></span><h3>Профиль почти готов</h3><p>Добавьте данные подписанта, чтобы не вводить их вручную.</p><button class="outline-button" data-edit-company>Дополнить профиль</button></aside></div>`;
}

function navigate(section = 'home', detail) {
  homeBlocks.forEach(block => { block.hidden = section !== 'home'; });
  workspace.hidden = section === 'home';
  $$('.nav-link').forEach(link => link.classList.toggle('active', link.dataset.section === section));
  if (section === 'documents') renderDocuments();
  if (section === 'templates') renderTemplates(detail || 'Все');
  if (section === 'partners') renderPartners();
  if (section === 'company') renderCompany();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

$$('[data-section]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault(); navigate(link.dataset.section); closeMobileMenu();
}));

workspace.addEventListener('click', event => {
  const templateButton = event.target.closest('[data-action-template]');
  if (templateButton) openWizard(templateButton.dataset.actionTemplate);
  const filterButton = event.target.closest('[data-template-filter]');
  if (filterButton) renderTemplates(filterButton.dataset.templateFilter);
  if (event.target.closest('[data-add-partner]')) openModal(partnerModal);
  if (event.target.closest('[data-edit-company]')) openModal(companyModal);
  if (event.target.closest('[data-partner-doc]')) openWizard('Договор оказания услуг');
  if (event.target.closest('[data-doc-action]')) showToast('Действие с документом выполнено');
});

$('#partnerForm').addEventListener('submit', event => {
  event.preventDefault();
  const partner = Object.fromEntries(new FormData(event.currentTarget));
  const partners = getPartners();
  partners.push({ ...partner, docs: 0 });
  localStorage.setItem('partners', JSON.stringify(partners));
  event.currentTarget.reset(); closeModal(partnerModal); renderPartners();
  showToast('Контрагент добавлен');
});

$('[data-all-docs]').onclick = () => navigate('documents');
$('[data-all-templates]').onclick = () => navigate('templates');
