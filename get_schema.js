const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('/Users/jumoke/Desktop/coding/tela-blog/.env.local', 'utf-8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1];
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1];

const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase.from('site_settings').select('*').limit(1);
  if (error) {
    console.error(error);
  } else {
    console.log(Object.keys(data[0] || {}));
  }
}
run();
