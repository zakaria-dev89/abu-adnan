// ==========================================================================
// 1. الاتصال بـ Supabase
// ==========================================================================
const SUPABASE_URL = 'ضع_هنا_Project_URL';
const SUPABASE_ANON_KEY = 'ضع_هنا_anon_public_key';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ID السجل الرئيسي
let siteInfoId = null;

// ==========================================================================
// 2. جلب البيانات وتعبئتها في الحقول
// ==========================================================================
async function loadAdminData() {
    try {
        // جلب البيانات العامة
        const { data: info, error: infoErr } = await supabaseClient
            .from('site_info')
            .select('*')
            .single();

        if (infoErr) throw infoErr;

        if (info) {
            siteInfoId = info.id;
            document.getElementById('whatsapp-input').value = info.whatsapp;
            document.getElementById('instagram-input').value = info.instagram;
            document.getElementById('facebook-input').value = info.facebook;
            document.getElementById('bio-input').value = info.bio_text;
        }

        // جلب الفروع
        loadBranches();
    } catch (err) {
        alert('خطأ في تحميل البيانات: ' + err.message);
    }
}

// جلب وتحديث قائمة الفروع في اللوحة
async function loadBranches() {
    const { data: branches, error } = await supabaseClient
        .from('branches')
        .select('*')
        .order('id', { ascending: true });

    if (error) return;

    const list = document.getElementById('admin-branches-list');
    list.innerHTML = '';

    branches.forEach(b => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span><strong>${b.branch_name}:</strong> ${b.location_details}</span>
            <button class="delete-btn" onclick="deleteBranch(${b.id})">حذف</button>
        `;
        list.appendChild(li);
    });
}

// ==========================================================================
// 3. حفظ البيانات العامة
// ==========================================================================
document.getElementById('info-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const whatsapp = document.getElementById('whatsapp-input').value;
    const instagram = document.getElementById('instagram-input').value;
    const facebook = document.getElementById('facebook-input').value;
    const bio_text = document.getElementById('bio-input').value;

    const { error } = await supabaseClient
        .from('site_info')
        .update({ whatsapp, instagram, facebook, bio_text })
        .eq('id', siteInfoId);

    if (error) {
        alert('حدث خطأ أثناء الحفظ: ' + error.message);
    } else {
        alert('تم حفظ البيانات بنجاح! ✨');
    }
});

// ==========================================================================
// 4. إضافة فرع جديد
// ==========================================================================
document.getElementById('branch-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const branch_name = document.getElementById('branch-name-input').value;
    const location_details = document.getElementById('branch-location-input').value;

    const { error } = await supabaseClient
        .from('branches')
        .insert([{ branch_name, location_details }]);

    if (error) {
        alert('حدث خطأ أثناء إضافة الفرع: ' + error.message);
    } else {
        document.getElementById('branch-form').reset();
        loadBranches();
    }
});

// ==========================================================================
// 5. حذف فرع
// ==========================================================================
async function deleteBranch(id) {
    if (confirm('هل أنت تأكد من حذف هذا الفرع؟')) {
        const { error } = await supabaseClient
            .from('branches')
            .delete()
            .eq('id', id);

        if (!error) loadBranches();
    }
}

// تشغيل عند التحميل
document.addEventListener('DOMContentLoaded', loadAdminData);