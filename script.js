// ==========================================================================
// 1. إعدادات الاتصال بـ Supabase
// ==========================================================================
const SUPABASE_URL = 'https://xxxx.supabase.co'; // ضع رابطك هنا
const SUPABASE_ANON_KEY = 'eyJhbGciOi...'; // ضع مفتاحك هنا

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================================================
// 2. جلب وتحديث البيانات العامة
// ==========================================================================
async function fetchSiteInfo() {
    try {
        const { data, error } = await supabaseClient
            .from('site_info')
            .select('*')
            .single();

        if (error) throw error;

        if (data) {
            document.getElementById('bio-text').innerText = data.bio_text;

            const waNumber = data.whatsapp.startsWith('http') 
                ? data.whatsapp 
                : `https://wa.me/${data.whatsapp.replace('+', '')}`;
            
            document.getElementById('whatsapp-link').href = waNumber;
            document.getElementById('instagram-link').href = data.instagram;
            document.getElementById('facebook-link').href = data.facebook;
        }
    } catch (err) {
        console.error('خطأ في جلب بيانات الموقع:', err.message);
    }
}

// ==========================================================================
// 3. جلب وتحديث الفروع
// ==========================================================================
async function fetchBranches() {
    try {
        const { data, error } = await supabaseClient
            .from('branches')
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;

        const branchesList = document.getElementById('branches-list');
        branchesList.innerHTML = '';

        data.forEach(branch => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${branch.branch_name}:</strong> ${branch.location_details}`;
            branchesList.appendChild(li);
        });
    } catch (err) {
        console.error('خطأ في جلب الفروع:', err.message);
    }
}

// ==========================================================================
// 4. ميزة مشاركة رابط الموقع نسخ مباشر
// ==========================================================================
document.getElementById('share-btn').addEventListener('click', () => {
    if (navigator.share) {
        navigator.share({
            title: 'محل أبو عدنان للملابس النسائية',
            text: 'تفضل بزيارة صفحتنا وطرق التواصل الخاصة بمحل أبو عدنان:',
            url: window.location.href
        }).catch(() => {});
    } else {
        // نسخ للتقويم إذا كانت المشاركة غير مدعومة
        navigator.clipboard.writeText(window.location.href);
        showToast();
    }
});

function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// تشغيل عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    fetchSiteInfo();
    fetchBranches();
});