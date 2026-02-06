// DOM Elements
const DOM = {
    adPopup: document.getElementById('adPopup'), 
    closeAdBtn: document.getElementById('closeAdBtn'),
    whatsappFloat: document.getElementById('whatsappFloat'),
    whatsappPopup: document.getElementById('whatsappPopup'), 
    closeWhatsapp: document.getElementById('closeWhatsapp'),
    loadingScreen: document.getElementById('loadingScreen'),
    carouselPrev: document.getElementById('carouselPrev'),
    carouselNext: document.getElementById('carouselNext'), 
    trendingCarousel: document.getElementById('trendingCarousel'),
    categoryCards: document.querySelectorAll('.category-card'),
    footerLinks: document.querySelectorAll('.footer-links a[data-category]')
};

// Popup Elements
const PopupManager = {
    popups: {
        artikel: document.getElementById('articlePopup'),
        buku: document.getElementById('bukuPopup'),
        cerita: document.getElementById('ceritaPopup'),
        jurnal: document.getElementById('jurnalPopup'),
        berita: document.getElementById('beritaPopup'),
        kamus: document.getElementById('kamusPopup')
    },
    
    closeButtons: {
        artikel: document.getElementById('closeArticlePopup'),
        buku: document.getElementById('closeBukuPopup'),
        cerita: document.getElementById('closeCeritaPopup'),
        jurnal: document.getElementById('closeJurnalPopup'),
        berita: document.getElementById('closeBeritaPopup'),
        kamus: document.getElementById('closeKamusPopup')
    },
    
    // Fungsi untuk membuka popup berdasarkan kategori
    openPopup: (category) => {
        const popup = PopupManager.popups[category];
        if (popup) {
            popup.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Mencegah scroll
        }
    },
    
    // Fungsi untuk menutup popup berdasarkan kategori
    closePopup: (category) => {
        const popup = PopupManager.popups[category];
        if (popup) {
            popup.style.display = 'none';
            document.body.style.overflow = 'auto'; // Mengembalikan scroll
        }
    },
    
    // Fungsi untuk menutup semua popup
    closeAllPopups: () => {
        Object.values(PopupManager.popups).forEach(popup => {
            if (popup) {
                popup.style.display = 'none';
            }
        });
        document.body.style.overflow = 'auto';
    }
};

// --- MANAJEMEN DATA REAL-TIME (LOCAL STORAGE) ---
const StatsManager = {
    getKey: () => 'maktabah_stats',
    
    // Inisialisasi atau Ambil Data
    getData: () => {
        const data = localStorage.getItem(StatsManager.getKey());
        if (data) return JSON.parse(data);
        
        // Struktur awal jika belum ada data sama sekali
        return {
            collections: {}, // Menyimpan jumlah file per kategori/halaman (objek)
            visitors: 0,     // Total pengunjung
            downloads: 0     // Total download
        };
    },

    saveData: (data) => {
        localStorage.setItem(StatsManager.getKey(), JSON.stringify(data));
    },

    // Rekam Kunjungan Baru
    incrementVisitor: () => {
        // Mengecek sesi browser (sessionStorage) agar refresh halaman tidak menambah count
        if (!sessionStorage.getItem('visited_session')) {
            const data = StatsManager.getData();
            data.visitors += 1;
            StatsManager.saveData(data);
            sessionStorage.setItem('visited_session', 'true');
        }
    }
};

// Main Application Class
class MaktabahApp {
    constructor() { 
        this.init(); 
    }
    
    init() {
        this.loadNavbar();
        this.initEventListeners();
        this.initLoadingScreen();
        this.initCarousel();
        this.initCustomCursor();
        this.initCategoryClick();
        this.initFooterNavigation();
        
        // UPDATE: Menggunakan Data Real dari StatsManager
        StatsManager.incrementVisitor(); // Hitung pengunjung saat ini
    }
    
    loadNavbar() {
        fetch('./navbar/navbar.html')
            .then(response => response.text())
            .then(html => {
                document.getElementById('navbar-container').innerHTML = html;
                
                // Jalankan script dari navbar
                const scripts = document.getElementById('navbar-container').getElementsByTagName('script');
                for (let script of scripts) {
                    eval(script.textContent);
                }
            })
            .catch(error => {
                console.error('Error loading navbar:', error);
                // Fallback jika navbar gagal dimuat
                document.getElementById('navbar-container').innerHTML = `
                    <nav style="position:fixed; top:0; width:100%; background:#fff; padding:1rem; z-index:1000; border-bottom:1px solid #ddd;">
                        <a href="index.html" style="font-weight:bold; color:#1a4d2e; text-decoration:none;">Maktabah Rasyida</a>
                    </nav>`;
            });
    }
    
    initEventListeners() {
        // Popup iklan
        DOM.closeAdBtn.addEventListener('click', () => DOM.adPopup.style.display = 'none');
        
        // WhatsApp
        DOM.whatsappFloat.addEventListener('click', () => DOM.whatsappPopup.classList.toggle('active'));
        DOM.closeWhatsapp.addEventListener('click', () => DOM.whatsappPopup.classList.remove('active'));
        
        // Setup close buttons untuk semua popup
        Object.entries(PopupManager.closeButtons).forEach(([category, closeBtn]) => {
            if (closeBtn) {
                closeBtn.addEventListener('click', () => PopupManager.closePopup(category));
            }
        });
        
        // Tutup popup saat klik di luar area popup
        Object.values(PopupManager.popups).forEach(popup => {
            if (popup) {
                popup.addEventListener('click', (e) => {
                    if (e.target === popup) {
                        PopupManager.closeAllPopups();
                    }
                });
            }
        });
        
        // Tutup popup dengan tombol ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                PopupManager.closeAllPopups();
            }
        });
    }
    
    initCategoryClick() {
        // Event listener untuk kategori populer
        if (DOM.categoryCards) {
            DOM.categoryCards.forEach(card => {
                card.addEventListener('click', (e) => {
                    const category = card.getAttribute('data-category');
                    
                    // Buka popup sesuai kategori
                    if (PopupManager.popups[category]) {
                        e.preventDefault();
                        PopupManager.openPopup(category);
                    } else {
                        // Untuk kategori yang tidak memiliki popup khusus
                        switch(category) {
                            case 'skripsi':
                                window.location.href = '/jurnal/skripsi.html';
                                break;
                            case 'tesis':
                                window.location.href = '/jurnal/tesis.html';
                                break;
                            case 'disertasi':
                                window.location.href = '/jurnal/disertasi.html';
                                break;
                            case 'novel':
                                window.location.href = '/navbar/buku/buku-fiksi/buku-fiksi.html';
                                break;
                            default:
                                console.log('Kategori tidak dikenali:', category);
                        }
                    }
                });
            });
        }
    }
    
    initFooterNavigation() {
        // Event listener untuk navigasi di footer
        if (DOM.footerLinks) {
            DOM.footerLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const category = link.getAttribute('data-category');
                    
                    // Buka popup sesuai kategori
                    if (PopupManager.popups[category]) {
                        PopupManager.openPopup(category);
                    }
                });
            });
        }
    }

    initCustomCursor() {
        const c = document.querySelector('.cursor'), f = document.querySelector('.cursor-follower');
        if(window.innerWidth > 992) {
            document.addEventListener('mousemove', e => { 
                c.style.left = e.clientX+'px'; 
                c.style.top = e.clientY+'px'; 
                setTimeout(() => { 
                    f.style.left = e.clientX+'px'; 
                    f.style.top = e.clientY+'px'; 
                }, 80); 
            });
        }
    }

    initLoadingScreen() {
        setTimeout(() => { 
            DOM.loadingScreen.style.opacity = '0'; 
            DOM.loadingScreen.style.visibility = 'hidden'; 
            if(!localStorage.getItem('adShown')) { 
                setTimeout(() => { 
                    DOM.adPopup.style.display = 'flex'; 
                    localStorage.setItem('adShown', 'true'); 
                }, 500); 
            } 
        }, 2000);
    }

    initCarousel() {
        if (DOM.carouselPrev && DOM.carouselNext && DOM.trendingCarousel) {
            DOM.carouselPrev.addEventListener('click', () => DOM.trendingCarousel.scrollLeft -= 300);
            DOM.carouselNext.addEventListener('click', () => DOM.trendingCarousel.scrollLeft += 300);
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Start main application
    window.maktabahApp = new MaktabahApp();
});