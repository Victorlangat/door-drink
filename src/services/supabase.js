import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dzzgygavtllpvigghixc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6emd5Z2F2dGxscHZpZ2doaXhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NzMwMjAsImV4cCI6MjA5NDI0OTAyMH0.GsaEVIBeUDA3nDV67YSHo_xggjU09ngIrb1w-tKR6jc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentStoreId = null;

export const setCurrentStore = (storeId) => {
  currentStoreId = storeId;
};

export const getCurrentStore = () => currentStoreId;