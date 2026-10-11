// ============================================
// KONFIGURASI SUPABASE
// Ganti dengan URL & publishable key project kamu
// ============================================

const SUPABASE_URL = 'https://dmnzlktjlnzbpkpobnhj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_AVJuhua99Wf1QKAb-utmGQ_Cph-MHeP';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);