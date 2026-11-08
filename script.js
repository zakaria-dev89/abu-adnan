// ==========================================================================
// 1. إعدادات الاتصال بـ Supabase
// ==========================================================================
const SUPABASE_URL = 'https://sdybcaiymndxbjorzqas.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_oM6Mp4M28K-X0JrF0Q77AQ_ptR3Oo34';

// إنشاء عميل الاتصال
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================================================
// 2. دالة جلب بيانات المحل والتواصل
// ==========================================================================
async function fetchSiteInfo() {
    try {
        const { data, error } = await supabaseClient
            .from('site_info')
            .select('*')
            .single();

        if (error) throw error;

        if (data) {
            // تحديث نص الترحيب
            document.getElementById('bio-text').innerText = data.bio_text;

            // تحديث رابط الواتساب (إضافة بادئة wa.me إذا كان الرقم مجرداً)
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
// 3. دالة جلب الفروع
// ==========================================================================
async function fetchBranches() {
    try {
        const { data, error } = await supabaseClient
            .from('branches')
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;

        const branchesList = document.getElementById('branches-list');
        branchesList.innerHTML = ''; // تفريغ نص "جاري التحميل"

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
// 4. تشغيل الدوال عند فتح الصفحة
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    fetchSiteInfo();
    fetchBranches();
});