const SUPABASE_URL = 'https://dmnzlktjlnzbpkpobnhj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_AVJuhua99Wf1QKAb-utmGQ_Cph-MHeP'; // 

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
