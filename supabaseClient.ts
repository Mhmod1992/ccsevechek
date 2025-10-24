import { createClient } from '@supabase/supabase-js';
import { Client } from './types';

// هام: استبدل هذا بعنوان مشروعك ومفتاح anon الخاص بك في Supabase
// يمكنك الحصول عليها من إعدادات المشروع > API
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

// رسالة تحذيرية للمطور لتذكيره بتحديث البيانات
if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseKey === 'YOUR_SUPABASE_ANON_KEY') {
  // إظهار رسالة واضحة في الـ console
  console.warn(`
    ********************************************************************************
    *  تنبيه: بيانات Supabase غير مهيأة!                                           *
    *  الرجاء فتح ملف 'supabaseClient.ts' وتحديث 'supabaseUrl' و 'supabaseKey'.     *
    *  سيستمر التطبيق باستخدام البيانات المحلية المؤقتة حتى يتم التحديث.         *
    ********************************************************************************
  `);
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// التحقق مما إذا كانت بيانات الاتصال موجودة بالفعل
export const isSupabaseConnected = supabaseUrl !== 'YOUR_SUPABASE_URL' && supabaseKey !== 'YOUR_SUPABASE_ANON_KEY';
