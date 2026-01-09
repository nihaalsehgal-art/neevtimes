/* =========================================
   MASTER CONFIGURATION
   ========================================= */
const API_URL = 'http://localhost:3000/articles';
const HERO_URL = 'http://localhost:3000/hero';
const SECRET_CODE = 'NTnewspaper26';

console.log("✅ Script Loaded.");

/* =========================================
   GLOBAL HELPER FUNCTIONS
   ========================================= */

function getSelectedTags() {
    const checkboxes = document.querySelectorAll('input[name="tags"]:checked');
    let tags = Array.from(checkboxes).map(cb => cb.value);
    const custom = document.getElementById('customTag').value.trim();
    if (custom) tags.push(custom);
    return tags.join(', ');
}

function setTags(tagString) {
    document.querySelectorAll('input[name="tags"]').forEach(cb => cb.checked = false);
    document.getElementById('customTag').value = '';
    if (!tagString) return;
    const tags = tagString.split(',').map(t => t.trim());
    tags.forEach(tag => {
        const checkbox = document.querySelector(`input[name="tags"][value="${tag}"]`);
        if (checkbox) checkbox.checked = true;
        else document.getElementById('customTag').value = tag;
    });
}

window.fetchArticlesForAdmin = function() {
    const adminList = document.getElementById('admin-article-list');
    if (!adminList) return;

    fetch(API_URL, { cache: "no-store" })
        .then(res => res.json())
        .then(articles => {
            adminList.innerHTML = '';
            articles.forEach(article => {
                const item = document.createElement('div');
                item.className = 'admin-item';
                item.innerHTML = `
                    <div class="admin-item-info">
                        <h4>${article.title}</h4>
                        <span style="background:#eee; padding:2px 6px; border-radius:4px; font-size:0.7rem; color:#333;">${article.category}</span>
                    </div>
                    <div class="admin-actions">
                        <button class="btn-edit" onclick="startEdit(${article.id})">Edit</button>
                        <button class="btn-delete" onclick="deleteArticle(${article.id})">Delete</button>
                    </div>
                `;
                adminList.appendChild(item);
            });
        });
};

window.deleteArticle = function(id) {
    if(confirm("Delete this article?")) {
        fetch(`${API_URL}/${id}`, { method: 'DELETE' }).then(() => window.fetchArticlesForAdmin());
    }
};

window.startEdit = function(id) {
    fetch(`${API_URL}/${id}`)
        .then(res => res.json())
        .then(article => {
            document.getElementById('inpTitle').value = article.title;
            document.getElementById('inpAuthor').value = article.author;
            document.getElementById('inpImage').value = article.image;
            document.getElementById('inpExcerpt').value = article.excerpt;
            document.getElementById('inpContent').value = article.content;
            document.getElementById('editId').value = article.id;
            setTags(article.category);
            document.querySelector('#publishForm button').innerText = "Update Article";
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
};


/* =========================================
   MAIN DOM LOGIC
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {

    /* --- FEATURE A: NAVBAR SCROLL --- */
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
        });
    }

    /* --- FEATURE B: THEME TOGGLE --- */
    const themeBtn = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) document.documentElement.setAttribute('data-theme', currentTheme);

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            let theme = document.documentElement.getAttribute('data-theme');
            let newTheme = theme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    /* --- FEATURE C: HERO SECTION (FETCH) --- */
    const heroTitle = document.querySelector('.hero-content h1');
    const heroSub = document.querySelector('.hero-content p');
    const heroTag = document.querySelector('.hero-tagline');
    const heroSection = document.querySelector('.hero'); 

    if (heroSection) {
        fetch(HERO_URL, { cache: "no-store" })
            .then(res => res.json())
            .then(data => {
                if(data && data.hero_headline) {
                    if(heroTitle) heroTitle.innerText = data.hero_headline;
                    if(heroSub) heroSub.innerText = data.hero_subtext;
                    if(heroTag) heroTag.innerText = data.hero_tagline;
                    
                    heroSection.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${data.hero_image}')`;
                    heroSection.style.backgroundSize = "cover";
                    heroSection.style.backgroundPosition = "center";
                }
            })
            .catch(err => console.error("Hero Load Error:", err));
    }

    /* --- FEATURE D: HERO EDITOR (ADMIN) --- */
    const heroForm = document.getElementById('heroForm');
    if (heroForm) {
        // Load current data
        fetch(HERO_URL, { cache: "no-store" }).then(res => res.json()).then(data => {
            if(data) {
                document.getElementById('heroTitle').value = data.hero_headline;
                document.getElementById('heroSub').value = data.hero_subtext;
                document.getElementById('heroImg').value = data.hero_image;
                document.getElementById('heroTagline').value = data.hero_tagline || "";
            }
        });

        // Submit new data
        heroForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Gather data from form inputs
            const data = {
                hero_headline: document.getElementById('heroTitle').value,
                hero_subtext: document.getElementById('heroSub').value,
                hero_image: document.getElementById('heroImg').value,
                hero_tagline: document.getElementById('heroTagline').value
            };
            
            console.log("Sending Update:", data); // DEBUG: Check console if image is wrong

            fetch(HERO_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            }).then(() => {
                alert("Hero Section Updated! Go to Home Page to see changes.");
            });
        });
    }

    /* --- FEATURE E: ARTICLE PUBLISHING --- */
    const publishForm = document.getElementById('publishForm');
    if (publishForm) {
        window.fetchArticlesForAdmin();

        publishForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const editId = document.getElementById('editId').value;
            const isEditing = editId !== "";

            const articleData = {
                title: document.getElementById('inpTitle').value,
                author: document.getElementById('inpAuthor').value,
                category: getSelectedTags(),
                image: document.getElementById('inpImage').value,
                excerpt: document.getElementById('inpExcerpt').value,
                content: document.getElementById('inpContent').value,
                ...(isEditing ? {} : { date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) })
            };

            const url = isEditing ? `${API_URL}/${editId}` : API_URL;
            const method = isEditing ? 'PUT' : 'POST';

            fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(articleData)
            }).then(() => {
                alert("Success!");
                window.location.reload();
            });
        });
    }

    /* --- FEATURE F: HOME GRID & SEARCH --- */
    const articlesContainer = document.getElementById('articles-container');
    const searchBar = document.getElementById('searchBar');

    if (articlesContainer) {
        fetch(API_URL, { cache: "no-store" })
            .then(res => res.json())
            .then(articles => {
                renderGrid(articles);

                if (searchBar) {
                    searchBar.addEventListener('keyup', (e) => {
                        const term = e.target.value.toLowerCase();
                        const filtered = articles.filter(a => 
                            a.title.toLowerCase().includes(term) || 
                            a.category.toLowerCase().includes(term)
                        );
                        renderGrid(filtered);
                    });
                }
            });
    }

    function renderGrid(items) {
        articlesContainer.innerHTML = '';
        if (items.length === 0) {
            articlesContainer.innerHTML = '<p style="text-align:center; padding:40px;">No articles found.</p>';
            return;
        }
        items.forEach(article => {
            const tagsHTML = article.category.split(',')
                .map(tag => `<span style="font-size:0.7rem; text-transform:uppercase; font-weight:bold; margin-right:5px; opacity:0.7;">${tag.trim()}</span>`)
                .join(' ');

            const card = document.createElement('article');
            card.className = 'news-card';
            card.innerHTML = `
                <div style="overflow:hidden; border-radius:2px; margin-bottom:15px;">
                    <a href="article.html?id=${article.id}">
                        <img src="${article.image}" class="card-img" onerror="this.src='https://via.placeholder.com/800x600'">
                    </a>
                </div>
                <div class="meta" style="margin-bottom:5px;">${tagsHTML}</div>
                <div style="font-size:0.8rem; opacity:0.6; margin-bottom:10px;">${article.date}</div>
                <h3><a href="article.html?id=${article.id}">${article.title}</a></h3>
                <p style="font-size: 0.95rem; color: var(--secondary-text); margin-top:8px;">${article.excerpt}</p>
            `;
            articlesContainer.appendChild(card);
        });
    }

    /* --- FEATURE G: SINGLE ARTICLE --- */
    const singleArticleContainer = document.getElementById('single-article-container');
    if (singleArticleContainer) {
        const id = new URLSearchParams(window.location.search).get('id');
        fetch(`${API_URL}/${id}`)
            .then(res => res.json())
            .then(article => {
                const tagsHTML = article.category.split(',')
                        .map(tag => `<span class="tag-badge">${tag.trim()}</span>`)
                        .join(' ');

                singleArticleContainer.innerHTML = `
                    <article class="single-article">
                        <div class="article-header">
                            <div style="margin-bottom:15px;">${tagsHTML}</div>
                            <h1>${article.title}</h1>
                            <div class="meta">By <strong>${article.author}</strong> • ${article.date}</div>
                        </div>
                        <img src="${article.image}" class="single-article-img">
                        <div class="article-body">${article.content}</div>
                        <a href="index.html" style="display:block; margin-top:40px; font-weight:bold;">&larr; Back to Edition</a>
                    </article>
                `;
            });
    }

    // Ghost Login
    if (!window.location.href.includes('admin.html')) {
        let keyBuffer = '';
        document.addEventListener('keydown', (e) => {
            if (e.key.length === 1) {
                keyBuffer += e.key;
                if (keyBuffer.length > SECRET_CODE.length) keyBuffer = keyBuffer.slice(-SECRET_CODE.length);
                if (keyBuffer === SECRET_CODE) {
                    sessionStorage.setItem('adminAuth', 'true');
                    window.location.href = 'admin.html';
                }
            }
        });
    }
    
    // Auth Check
    const loginOverlay = document.getElementById('login-overlay');
    if (loginOverlay && sessionStorage.getItem('adminAuth') === 'true') {
        loginOverlay.style.display = 'none';
    } else if (loginOverlay) {
        document.getElementById('loginBtn').addEventListener('click', () => {
            if (document.getElementById('adminPassword').value === SECRET_CODE) {
                sessionStorage.setItem('adminAuth', 'true');
                loginOverlay.style.display = 'none';
            } else {
                document.getElementById('loginError').style.display = 'block';
            }
        });
    }
});