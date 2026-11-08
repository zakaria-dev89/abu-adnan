// إعدادات Supabase
const SUPABASE_URL = 'https://sdybcaiymndxbjorzqas.supabase.co'; // رابط مشروعك
const SUPABASE_ANON_KEY = 'https://sdybcaiymndxbjorzqas.supabase.co'; // مفتاح anon الخاص بك
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// التأكد إذا كان المستخدم مسجلاً دخوله مسبقاً توجيهه للوحة التحكم فوراً
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        window.location.href = 'admin.html';
    }
});

// معالجة نموذج تسجيل الدخول
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email-input').value;
    const password = document.getElementById('password-input').value;
    const errorMsg = document.getElementById('error-msg');

    errorMsg.style.display = 'none';

    // محاولة تسجيل الدخول عبر Supabase Auth
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        errorMsg.innerText = 'بيانات الدخول غير صحيحة، يرجى التأكد وإعادة المحاولة.';
        errorMsg.style.display = 'block';
    } else {
        // تم تسجيل الدخول بنجاح، التوجيه لصفحة الأدمن
        window.location.href = 'admin.html';
    }
});