import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nsbdaltuzbdkluacjjez.supabase.co'
const supabaseAnonKey = 'sb_publishable_OKD8ZkgNEXuK2CwILJRvwA_OfJpKjzR'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function run() {
  const { data: factories, error } = await supabase.from('factories').select('*')
  console.log('Factories:', factories)
  
  const { data: alerts, error2 } = await supabase.from('alerts').select(`*, check_results(module_code), factories(name), alert_comments(*)`)
  console.log('Alerts:', alerts)
}

run()
