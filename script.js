const seedBooks = [
  { id: crypto.randomUUID(), title: 'JavaScript 程式設計精要', author: 'Marijn Haverbeke', category: '程式設計', desc: 'ES6 觀念清楚，適合期中前複習', imageUrl: './assets/ACL061300.jpg', email: 'js@class.tku.edu.tw', favorite: false },
  { id: crypto.randomUUID(), title: '統計學：以資料科學為導向', author: 'Freedman', category: '統計/資料科學', desc: '含大量例題，考前救星', imageUrl: '', email: 'stats@class.tku.edu.tw', favorite: false },
  { id: crypto.randomUUID(), title: '設計的設計', author: '原研哉', category: '設計/藝術', desc: '通識作業參考佳作', imageUrl: '', email: 'design@class.tku.edu.tw', favorite: false },
];

const cardGrid = document.querySelector('#cardGrid');
const searchInput = document.querySelector('#searchInput');
const resultCount = document.querySelector('#resultCount');
const themeToggle = document.querySelector('#themeToggle');
const year = document.querySelector('#year');
const form = document.querySelector('#bookForm');
const editForm = document.querySelector('#editForm');

// ★ 收藏清單相關
const favGrid = document.querySelector('#favGrid');
const favEmpty = document.querySelector('#favEmpty');
const favCountBadge = document.querySelector('#favCountBadge');
const favModalEl = document.getElementById('favModal');

const STORAGE_KEY = 'bookswap-items-v1';
const THEME_KEY = 'bookswap-theme';

const storage = {
  load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  },
  save(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
};

let items = storage.load() ?? seedBooks;

function renderList(list) {
  cardGrid.innerHTML = '';
  if (!list.length) cardGrid.innerHTML = `<div class="col-12 text-center text-secondary">沒有符合的書籍</div>`;
  list.forEach(createCard);
  resultCount.textContent = `共 ${list.length} 本`;
  updateFavCount();
}

function createCard(item) {
  const col = document.createElement('div');
  col.className = 'col-12 col-sm-6 col-lg-4';
  const imgSrc = item.imageUrl?.trim() || `https://dummyimage.com/600x400/dfe7fd/6b7280&text=${encodeURIComponent(item.title)}`;
  const fallback = `https://dummyimage.com/600x400/dfe7fd/6b7280&text=${encodeURIComponent(item.title)}`;
  col.innerHTML = `
    <div class="card h-100 swap-card">
      <img src="${imgSrc}" class="card-img-top" alt="${item.title}" loading="lazy"
           onerror="this.onerror=null;this.src='${fallback}';">
      <div class="card-body d-flex flex-column">
        <div class="d-flex align-items-start justify-content-between gap-2 mb-2">
          <h3 class="h6 card-title mb-0">${item.title}</h3>
          <span class="badge badge-soft">${item.category}</span>
        </div>
        <p class="text-secondary small mb-1">作者：${item.author}</p>
        <p class="text-secondary small flex-grow-1">${item.desc || ''}</p>
        <div class="d-flex gap-2 mt-2">
          <a class="btn btn-outline-primary btn-sm" target="_blank"
             href="https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(item.email)}&su=${encodeURIComponent('書籍交換洽詢：' + item.title)}">聯絡</a>
          <button class="btn btn-sm btn-fav ${item.favorite ? 'active' : ''}" data-action="fav" data-id="${item.id}">
            ${item.favorite ? '★ 已收藏' : '☆ 收藏'}
          </button>
          <button class="btn btn-outline-danger btn-sm" data-action="del" data-id="${item.id}">刪除</button>
          <button class="btn btn-outline-secondary btn-sm btn-edit" data-action="edit" data-id="${item.id}">編輯</button>
        </div>
      </div>
    </div>`;
  cardGrid.appendChild(col);
}

searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  const filtered = items.filter(it => [it.title, it.author, it.category, it.desc].join(' ').toLowerCase().includes(q));
  renderList(filtered);
});

cardGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const id = btn.getAttribute('data-id');
  const action = btn.getAttribute('data-action');
  const idx = items.findIndex(it => it.id === id);
  if (idx === -1) return;

  if (action === 'fav') {
    items[idx].favorite = !items[idx].favorite;
    storage.save(items);
    renderList(filterCurrent());
    if (favModalEl?.classList.contains('show')) renderFavorites();
    return;
  }

  if (action === 'del') {
    if (!confirm('確認刪除這本書嗎？')) return;
    const removed = items.splice(idx, 1);
    storage.save(items);
    renderList(filterCurrent());
    showToast(`已刪除「${removed[0].title}」`, 'danger');
    if (favModalEl?.classList.contains('show')) renderFavorites();
    return;
  }

  if (action === 'edit') {
    const it = items[idx];
    document.getElementById('editId').value = it.id;
    document.getElementById('editTitle').value = it.title;
    document.getElementById('editAuthor').value = it.author;
    document.getElementById('editCategory').value = it.category;
    document.getElementById('editEmail').value = it.email;
    document.getElementById('editDesc').value = it.desc || '';
    editForm.classList.remove('was-validated');
    new bootstrap.Modal(document.getElementById('editModal')).show();
  }
});

function filterCurrent() {
  const q = searchInput.value.trim().toLowerCase();
  return q ? items.filter(it => [it.title, it.author, it.category, it.desc].join(' ').toLowerCase().includes(q)) : items;
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

// 新增書籍（含上傳圖片）
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = form.title;
  const author = form.author;
  const category = form.category;
  const email = form.email;
  const agree = form.agree;
  const imageFile = form.imageFile?.files?.[0] || null;

  [title, author, category, email, agree].forEach(f => f.setCustomValidity(''));
  const emailVal = email.value.trim();
  if (title.value.trim().length < 2) title.setCustomValidity('書名至少 2 個字');
  if (author.value.trim().length < 2) author.setCustomValidity('作者至少 2 個字');
  if (!category.value) category.setCustomValidity('請選擇分類');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) email.setCustomValidity('請輸入有效 Email');
  if (!agree.checked) agree.setCustomValidity('提交前需同意條款');

  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    form.reportValidity();
    return;
  }

  let imageUrl = '';
  if (imageFile) {
    if (imageFile.size > 2 * 1024 * 1024) {
      showToast('圖片過大，請選擇 2MB 以內的檔案', 'warning');
      return;
    }
    imageUrl = await readFileAsDataURL(imageFile);
  }

  const data = {
    id: crypto.randomUUID(),
    title: title.value.trim(),
    author: author.value.trim(),
    category: category.value,
    desc: form.desc.value.trim(),
    imageUrl,
    email: emailVal,
    favorite: false,
  };
  items.unshift(data);
  storage.save(items);
  form.reset();
  form.classList.remove('was-validated');
  renderList(filterCurrent());
  const modal = bootstrap.Modal.getInstance(document.getElementById('submitModal'));
  modal.hide();
  showToast('書籍已成功加入書架', 'success');
});

// 編輯書籍（可更新封面）
if (editForm) {
  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editId').value;
    const title = document.getElementById('editTitle');
    const author = document.getElementById('editAuthor');
    const category = document.getElementById('editCategory');
    const email = document.getElementById('editEmail');
    const desc = document.getElementById('editDesc');
    const imageFile = document.getElementById('editImageFile')?.files?.[0] || null;

    [title, author, category, email].forEach(f => f.setCustomValidity(''));
    const emailVal = email.value.trim();
    if (title.value.trim().length < 2) title.setCustomValidity('書名至少 2 個字');
    if (author.value.trim().length < 2) author.setCustomValidity('作者至少 2 個字');
    if (!category.value) category.setCustomValidity('請選擇分類');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) email.setCustomValidity('請輸入有效 Email');

    if (!editForm.checkValidity()) {
      editForm.classList.add('was-validated');
      editForm.reportValidity();
      return;
    }

    const idx = items.findIndex(it => it.id === id);
    if (idx !== -1) {
      items[idx].title = title.value.trim();
      items[idx].author = author.value.trim();
      items[idx].category = category.value;
      items[idx].email = emailVal;
      items[idx].desc = desc.value.trim();
      if (imageFile) {
        if (imageFile.size > 2 * 1024 * 1024) {
          showToast('圖片過大，請選擇 2MB 以內的檔案', 'warning');
          return;
        }
        items[idx].imageUrl = await readFileAsDataURL(imageFile);
      }
      storage.save(items);
      renderList(filterCurrent());
      const modal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
      modal.hide();
      showToast('已更新書籍資料', 'success');
    }
  });
}

// 即時清錯（新增/編輯）
form.querySelectorAll('input, select, textarea').forEach(input => {
  const clearErr = () => {
    input.setCustomValidity('');
    input.classList.remove('is-invalid');
    if (form.checkValidity()) form.classList.remove('was-validated');
  };
  input.addEventListener('input', clearErr);
  input.addEventListener('change', clearErr);
});
editForm?.querySelectorAll('input, select, textarea').forEach(input => {
  const clearErr = () => {
    input.setCustomValidity('');
    input.classList.remove('is-invalid');
    if (editForm.checkValidity()) editForm.classList.remove('was-validated');
  };
  input.addEventListener('input', clearErr);
  input.addEventListener('change', clearErr);
});

// ====== 已收藏：徽章與清單 ======
function updateFavCount() {
  if (!favCountBadge) return;
  const n = items.filter(it => it.favorite).length;
  favCountBadge.textContent = n;
}

function renderFavorites() {
  if (!favGrid) return;
  const favs = items.filter(it => it.favorite);
  favGrid.innerHTML = '';
  if (!favs.length) {
    favEmpty?.classList.remove('d-none');
    updateFavCount();
    return;
  }
  favEmpty?.classList.add('d-none');

  favs.forEach(item => {
    const col = document.createElement('div');
    col.className = 'col-12';
    const imgSrc = item.imageUrl?.trim() || `https://dummyimage.com/600x400/dfe7fd/6b7280&text=${encodeURIComponent(item.title)}`;
    col.innerHTML = `
      <div class="card shadow-sm">
        <div class="row g-0">
          <div class="col-4 col-sm-3">
            <img src="${imgSrc}" class="img-fluid rounded-start" alt="${item.title}">
          </div>
          <div class="col-8 col-sm-9">
            <div class="card-body py-2">
              <div class="d-flex justify-content-between align-items-start">
                <h6 class="card-title mb-1">${item.title}</h6>
                <span class="badge badge-soft">${item.category}</span>
              </div>
              <div class="text-secondary small mb-2">作者：${item.author}</div>
              <div class="d-flex gap-2">
                <a class="btn btn-outline-primary btn-sm" target="_blank"
                  href="https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(item.email)}&su=${encodeURIComponent('書籍交換洽詢：' + item.title)}">聯絡</a>
                <button class="btn btn-sm btn-fav active" data-action="fav" data-id="${item.id}">★ 已收藏</button>
                <button class="btn btn-outline-danger btn-sm" data-action="del" data-id="${item.id}">刪除</button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    favGrid.appendChild(col);
  });
  updateFavCount();
}

favModalEl?.addEventListener('shown.bs.modal', renderFavorites);

favGrid?.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const id = btn.getAttribute('data-id');
  const action = btn.getAttribute('data-action');
  const idx = items.findIndex(it => it.id === id);
  if (idx === -1) return;

  if (action === 'fav') {
    items[idx].favorite = !items[idx].favorite;
    storage.save(items);
    renderFavorites();
    renderList(filterCurrent());
    return;
  }
  if (action === 'del') {
    if (!confirm('確認刪除這本書嗎？')) return;
    items.splice(idx, 1);
    storage.save(items);
    renderFavorites();
    renderList(filterCurrent());
  }
});

// ====== 其他：Toast / 主題 / 年份 ======
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const wrapper = document.createElement('div');
  const bgClass = { success: 'bg-success', info: 'bg-info', warning: 'bg-warning text-dark', danger: 'bg-danger' }[type] || 'bg-success';
  wrapper.className = `toast align-items-center text-white ${bgClass} border-0`;
  wrapper.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>`;
  container.appendChild(wrapper);
  const toast = new bootstrap.Toast(wrapper, { delay: 3000, autohide: true });
  toast.show();
  wrapper.addEventListener('hidden.bs.toast', () => wrapper.remove());
}

function applyTheme(theme) {
  const root = document.documentElement;
  root.setAttribute('data-bs-theme', theme === 'dark' ? 'dark' : 'light');
  themeToggle.checked = theme === 'dark';
}
themeToggle.addEventListener('change', () => {
  const next = themeToggle.checked ? 'dark' : 'light';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
});
const initial = localStorage.getItem(THEME_KEY) ||
  (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
applyTheme(initial);

// Modal 關閉時自動清理表單與驗證樣式
document.getElementById('submitModal')?.addEventListener('hidden.bs.modal', () => {
  form?.reset();
  form?.classList.remove('was-validated');
});
document.getElementById('editModal')?.addEventListener('hidden.bs.modal', () => {
  if (!editForm) return;
  editForm.classList.remove('was-validated');
  editForm.reset();
});

year.textContent = new Date().getFullYear();
renderList(items);
