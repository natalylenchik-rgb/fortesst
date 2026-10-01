const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const wizard = $('#wizardModal');
const companyModal = $('#companyModal');
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
  const category = link.dataset.category;
  $$('.template-card').forEach(card => card.style.display = card.dataset.categoryName === category ? '' : 'none');
  $('.popular-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  closeMobileMenu();
  showToast(`Показаны шаблоны: ${category}`);
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
