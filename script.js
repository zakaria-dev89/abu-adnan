// ==========================================================================
// 1. إعدادات الاتصال بـ Supabase
// ==========================================================================
const SUPABASE_URL = 'https://sdybcaiymndxbjorzqas.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_oM6Mp4M28K-X0JrF0Q77AQ_ptR3Oo34';

let supabaseClient = null;
try {
    if (typeof supabase !== 'undefined' && supabase.createClient) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
} catch (e) {
    console.warn('تعذر تهيئة Supabase:', e);
}

// بيانات افتراضية دقيقة في حال انقطاع الاتصال أو بطء الشبكة
const DEFAULT_INFO = {
    bio_text: 'لا اله الا الله',
    whatsapp: '967778325832',
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com'
};

const DEFAULT_BRANCHES = [
    { branch_name: 'الفرع الرئيسي', location_details: 'شارع الستين الغربي' },
    { branch_name: 'الفرع الثاني', location_details: 'مركز سما مول - الدور الثاني' },
    { branch_name: 'الفرع الثالث', location_details: 'حدة - سوق الحمراء - جوار الكميم - الياسمين' }
];

// ==========================================================================
// 2. جلب وتحديث البيانات العامة
// ==========================================================================
async function fetchSiteInfo() {
    const bioElement = document.getElementById('bio-text');
    const waLink = document.getElementById('whatsapp-link');
    const instaLink = document.getElementById('instagram-link');
    const fbLink = document.getElementById('facebook-link');

    try {
        if (!supabaseClient) throw new Error('عميل Supabase غير متاح');

        const { data, error } = await supabaseClient
            .from('site_info')
            .select('*')
            .single();

        if (error) throw error;

        if (data) {
            if (bioElement) bioElement.innerText = data.bio_text || DEFAULT_INFO.bio_text;

            const rawWa = data.whatsapp || DEFAULT_INFO.whatsapp;
            const waNumber = rawWa.startsWith('http') 
                ? rawWa 
                : `https://wa.me/${rawWa.replace(/[^0-9]/g, '')}`;
            
            if (waLink) waLink.href = waNumber;
            if (instaLink) instaLink.href = data.instagram || DEFAULT_INFO.instagram;
            if (fbLink) fbLink.href = data.facebook || DEFAULT_INFO.facebook;
            return;
        }
    } catch (err) {
        console.warn('استخدام البيانات الافتراضية:', err.message);
    }

    // تطبيق البيانات الاحتياطية
    if (bioElement) bioElement.innerText = DEFAULT_INFO.bio_text;
    if (waLink) waLink.href = `https://wa.me/${DEFAULT_INFO.whatsapp}`;
    if (instaLink) instaLink.href = DEFAULT_INFO.instagram;
    if (fbLink) fbLink.href = DEFAULT_INFO.facebook;
}

// ==========================================================================
// 3. جلب وتحديث الفروع
// ==========================================================================
async function fetchBranches() {
    const branchesList = document.getElementById('branches-list');
    if (!branchesList) return;

    try {
        if (!supabaseClient) throw new Error('عميل Supabase غير متاح');

        const { data, error } = await supabaseClient
            .from('branches')
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
            renderBranches(data);
            return;
        }
    } catch (err) {
        console.warn('استخدام فروع احتياطية:', err.message);
    }

    // عرض الفروع الاحتياطية
    renderBranches(DEFAULT_BRANCHES);
}

function renderBranches(branches) {
    const branchesList = document.getElementById('branches-list');
    if (!branchesList) return;
    branchesList.innerHTML = '';

    const countEl = document.getElementById('branches-count');
    if (countEl && branches && branches.length > 0) {
        countEl.innerText = `${branches.length} فروع`;
    }

    branches.forEach(branch => {
        const li = document.createElement('li');
        li.className = 'branch-card';
        li.innerHTML = `
            <div class="branch-icon-box">
                <i class="fa-solid fa-location-dot pin-icon" aria-hidden="true"></i>
            </div>
            <div class="branch-info">
                <span class="branch-name">${escapeHtml(branch.branch_name)}</span>
                <span class="branch-location">${escapeHtml(branch.location_details)}</span>
            </div>
        `;
        branchesList.appendChild(li);
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
}

// ==========================================================================
// 4. ميزة مشاركة رابط الموقع
// ==========================================================================
function handleShare() {
    const shareData = {
        title: 'محل أبو عدنان للملابس النسائية',
        text: 'تفضل بزيارة صفحة وطرق التواصل الخاصة بمحل أبو عدنان للملابس النسائية:',
        url: window.location.href
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        navigator.share(shareData).catch((err) => {
            if (err.name !== 'AbortError') copyCurrentUrl();
        });
    } else {
        copyCurrentUrl();
    }
}

const shareBtn = document.getElementById('share-btn');
if (shareBtn) shareBtn.addEventListener('click', handleShare);

const navShareBtn = document.getElementById('nav-share-btn');
if (navShareBtn) navShareBtn.addEventListener('click', handleShare);

function copyCurrentUrl() {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(window.location.href)
            .then(showToast)
            .catch(() => fallbackCopy());
    } else {
        fallbackCopy();
    }
}

function fallbackCopy() {
    try {
        const tempInput = document.createElement('input');
        tempInput.value = window.location.href;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        showToast();
    } catch (e) {
        alert('يمكنك نسخ هذا الرابط: ' + window.location.href);
    }
}

let toastTimer = null;
function showToast() {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 2800);
}

// ==========================================================================
// 5. التشغيل عند التحميل
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    fetchSiteInfo();
    fetchBranches();

    const sBtn = document.getElementById('share-btn');
    if (sBtn) sBtn.addEventListener('click', handleShare);

    const nBtn = document.getElementById('nav-share-btn');
    if (nBtn) nBtn.addEventListener('click', handleShare);
});
