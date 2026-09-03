// index.js
let currentFilter = 'all';
			let itemsPerBatch = 9;
			let visibleLimit = 9;

			// Theme Manager
			function setTheme(mode) {
			    const root = document.documentElement;
			    const icon = document.getElementById('themeIcon');
			    if (mode === 'dark') {
			        root.classList.add('dark');
			        icon.className = "fa-solid fa-sun";
			        localStorage.setItem('theme', 'dark');
			    } else {
			        root.classList.remove('dark');
			        icon.className = "fa-solid fa-moon";
			        localStorage.setItem('theme', 'light');
			    }
			}
			function toggleTheme() {
			    setTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark');
			}
			(function() {
			    const saved = localStorage.getItem('theme');
			    if (saved) setTheme(saved);
			    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');
			})();

			function toggleMobileMenu() {
			    document.getElementById('mobileMenu').classList.toggle('hidden');
			}

			function showToast(message, type = 'success') {
			    const toast = document.getElementById('toast');
			    document.getElementById('toastMsg').textContent = message;
			    document.getElementById('toastIcon').className = type === 'success' ? "fa-solid fa-circle-check text-emerald-400" : "fa-solid fa-circle-exclamation text-amber-400";
			    toast.classList.remove('translate-y-24', 'opacity-0');
			    setTimeout(() => toast.classList.add('translate-y-24', 'opacity-0'), 3000);
			}

			function copyLink(url) {
			    navigator.clipboard.writeText(url).then(() => showToast("iCloud link copied!"));
			}

			// View, Download & History Tracking
			document.addEventListener("DOMContentLoaded", () => {
			    document.querySelectorAll('.download-count').forEach(el => {
			        const id = el.getAttribute('data-id');
			        const val = localStorage.getItem(`dl_${id}`);
			        if (val) el.textContent = val;
			    });
			    renderRecentHistory();
			    applyPaginationAndFilter();
			});

			function trackViewAndAction(name, icloudUrl, counterId) {
			    const el = document.querySelector(`.download-count[data-id="${counterId}"]`);
			    if (el) {
			        let current = parseInt(el.textContent.replace(/,/g, '')) + 1;
			        el.textContent = current.toLocaleString();
			        localStorage.setItem(`dl_${counterId}`, current);
			    }
			    addToRecentHistory(name, icloudUrl);
			    showToast(`Redirecting to Apple iCloud for "${name}"...`);
			    setTimeout(() => window.open(icloudUrl, '_blank'), 600);
			}

			function addToRecentHistory(name, url) {
			    let history = JSON.parse(localStorage.getItem('recent_shortcuts') || '[]');
			    history = history.filter(item => item.name !== name);
			    history.unshift({ name, url, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
			    if (history.length > 4) history.pop();
			    localStorage.setItem('recent_shortcuts', JSON.stringify(history));
			    renderRecentHistory();
			}

			function renderRecentHistory() {
			    const container = document.getElementById('recentContainer');
			    const history = JSON.parse(localStorage.getItem('recent_shortcuts') || '[]');
			    if (history.length === 0) {
			        container.innerHTML = `<p class="text-sm text-slate-400 italic col-span-full">No shortcuts viewed yet.</p>`;
			        return;
			    }
			    container.innerHTML = history.map(item => `
			        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-sm">
			            <div><h4 class="font-bold text-sm truncate max-w-[150px]">${item.name}</h4><span class="text-xs text-slate-400">${item.time}</span></div>
			            <a href="${item.url}" target="_blank" class="bg-blue-50 dark:bg-blue-950 text-blue-600 p-2 rounded-xl text-xs hover:bg-blue-600 hover:text-white transition"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
			        </div>
			    `).join('');
			}

			function clearHistory() {
			    localStorage.removeItem('recent_shortcuts');
			    renderRecentHistory();
			    showToast("History cleared.");
			}

			// Modal Controls
			function openSubmitModal() { document.getElementById('submitModal').classList.remove('hidden'); }
			function closeSubmitModal() { document.getElementById('submitModal').classList.add('hidden'); }

			function handleShortcutSubmit(e) {
			    e.preventDefault();
			    const name = document.getElementById('subName').value;
			    const url = document.getElementById('subUrl').value;
			    const cat = document.getElementById('subCat').value;
			    const desc = document.getElementById('subDesc').value;
			    const counterId = 'sub_' + Math.random().toString(36).substring(7);

			    const grid = document.getElementById('shortcutGrid');
			    const card = document.createElement('div');
			    card.className = "shortcut-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition flex flex-col justify-between";
			    card.setAttribute('data-category', cat);
			    card.setAttribute('data-name', name);
			    card.innerHTML = `
			        <div>
			            <div class="flex items-center justify-between mb-4">
			                <div class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center text-xl"><i class="fa-solid fa-bolt"></i></div>
			                <button onclick="toggleFavorite(this, '${name}')" class="text-slate-300 dark:text-slate-600 hover:text-amber-400 text-xl transition"><i class="fa-solid fa-star"></i></button>
			            </div>
			            <div class="flex items-center space-x-2 mb-1">
			                <h3 class="text-lg font-bold">${name}</h3>
			                <i class="fa-solid fa-circle-check text-blue-500 text-xs" title="Verified Safe"></i>
			            </div>
			            <p class="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">${desc}</p>
			        </div>
			        <div>
			            <div class="flex items-center justify-between text-xs text-slate-400 mb-4 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
			                <span><i class="fa-solid fa-download mr-1"></i> <b class="download-count" data-id="${counterId}">0</b> downloads</span>
			                <span class="text-emerald-500 font-medium">iOS 18+</span>
			            </div>
			            <div class="grid grid-cols-2 gap-2">
			                <button onclick='trackViewAndAction("${name}", "${url}", "${counterId}")' class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition text-center shadow-lg shadow-blue-500/20">Install</button>
			                <button onclick="copyLink('${url}')" class="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium py-2.5 px-4 rounded-xl text-sm transition text-center">Copy Link</button>
			            </div>
			        </div>
			    `;
			    grid.prepend(card);
			    closeSubmitModal();
			    showToast(`Shortcut "${name}" published successfully!`);
			    e.target.reset();
			    applyPaginationAndFilter();
			}

			// Favorites, Search & Load More Pagination System
			function toggleFavorite(btn, name) {
			    btn.classList.toggle('text-amber-400');
			    btn.classList.toggle('text-slate-300');
			    const card = btn.closest('.shortcut-card');
			    if (btn.classList.contains('text-amber-400')) {
			        card.setAttribute('data-favorite', 'true');
			        showToast(`Added "${name}" to favorites!`);
			    } else {
			        card.removeAttribute('data-favorite');
			        showToast(`Removed "${name}" from favorites.`);
			    }
			    if (currentFilter === 'favorite') applyPaginationAndFilter();
			}

			function setCategory(cat) {
			    currentFilter = cat;
			    visibleLimit = 9; // Reset batch limit when switching categories
			    document.querySelectorAll('.category-btn').forEach(btn => {
			        btn.className = "category-btn px-4 py-2 rounded-xl text-sm font-medium bg-slate-200 dark:bg-slate-800 hover:bg-blue-500 hover:text-white transition";
			    });
			    document.getElementById(`cat-${cat}`).className = "category-btn px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white shadow";
			    applyPaginationAndFilter();
			}

			function filterShortcuts() {
			    visibleLimit = 9;
			    applyPaginationAndFilter();
			}

			function loadMoreShortcuts() {
			    visibleLimit += itemsPerBatch;
			    applyPaginationAndFilter();
			}

			function applyPaginationAndFilter() {
			    const query = document.getElementById('searchInput').value.toLowerCase();
			    const cards = document.querySelectorAll('.shortcut-card');
			    const loadMoreBtn = document.getElementById('loadMoreContainer');

			    let matchedCount = 0;
			    let displayedCount = 0;

			    cards.forEach(card => {
			        const name = card.getAttribute('data-name').toLowerCase();
			        const cat = card.getAttribute('data-category');
			        const isFav = card.getAttribute('data-favorite') === 'true';

			        let matchesCategory = true;
			        if (currentFilter === 'favorite') matchesCategory = isFav;
			        else if (currentFilter !== 'all') matchesCategory = (cat === currentFilter);

			        let matchesSearch = name.includes(query);

			        if (matchesCategory && matchesSearch) {
			            matchedCount++;
			            if (matchedCount <= visibleLimit) {
			                card.style.display = 'flex';
			                displayedCount++;
			            } else {
			                card.style.display = 'none';
			            }
			        } else {
			            card.style.display = 'none';
			        }
			    });

			    // Toggle "Load More" visibility based on whether there are extra items left to show
			    if (matchedCount > displayedCount) {
			        loadMoreBtn.style.display = 'block';
			    } else {
			        loadMoreBtn.style.display = 'none';
			    }
			}
			
			
	// New Shortcuts Here------	
	
		

				
			
			
const shortcuts = [
	
	{
  name: "Url Shortner By TinyUrl",
  category: "social",
  icon: "fa-url",
  description: "Turn your long URLs into short URL using this tinyurl shortcut , Which is quick and easy.",
  downloads: "300",
  ios: "iOS 17+",
  id: "Url-shortner",
  link: "https://www.icloud.com/shortcuts/7a766f4d37a84f16ba2db68c306f9ee1"
},
  {
    name: "Image Compressor",
    category: "utility",
    icon: "fa-image",
    description: "You can compress your image easily using this shortcut and It will properly compress your image.",
	downloads: "1,003",
    ios: "iOS 18+",
    id: "Image-Compressor",
    link: "https://www.icloud.com/shortcuts/5e5743c53f63406fb584ee89a79e0003"
  },

  {
    name: "Until Full Charge",
    category: "utility",
    icon: "fa-battery",
    description: "You can view your battery status using this shortcut and You also automate the shortcut using when charger is connected automation.",downloads: "1,850",
    ios: "iOS 18+",
    id: "Until-Full-Charge",
    link: "https://www.icloud.com/shortcuts/effda41188b448f5a999577077df1866"
  }
];

document.getElementById("shortcut-list").innerHTML = shortcuts.map(s => `
  <div
    class="shortcut-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition flex flex-col justify-between"
    data-category="${s.category}"
    data-name="${s.name}"
  >
    <div>
      <div class="flex items-center justify-between mb-4">
        <div class="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950 text-violet-600 flex items-center justify-center text-xl">
          <i class="fa-solid ${s.icon}"></i>
        </div>

        <button onclick="toggleFavorite(this, '${s.name}')"
          class="text-slate-300 dark:text-slate-600 hover:text-amber-400 text-xl transition">
          <i class="fa-solid fa-star"></i>
        </button>
      </div>

      <div class="flex items-center space-x-2 mb-1">
        <h3 class="text-lg font-bold">${s.name}</h3>
        <i class="fa-solid fa-circle-check text-blue-500 text-xs" title="Verified Safe"></i>
      </div>

      <p class="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
        ${s.description}
      </p>
    </div>

    <div>
      <div class="flex items-center justify-between text-xs text-slate-400 mb-4 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
        <span>
          <i class="fa-solid fa-download mr-1"></i>
          <b class="download-count" data-id="${s.id}">${s.downloads}</b>
          downloads
        </span>
        <span class="text-emerald-500 font-medium">${s.ios}</span>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <button
          onclick='trackViewAndAction("${s.name}", "${s.link}", "${s.id}")'
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition text-center shadow-lg shadow-blue-500/20">
          Install
        </button>

        <button
          onclick="copyLink('${s.link}')"
          class="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium py-2.5 px-4 rounded-xl text-sm transition text-center">
          Copy Link
        </button>
      </div>
    </div>
  </div>
`).join("");
			
			
			