#!/usr/bin/env node
// =============================================================================
// MAGNUM PAYROLL — COMBINED SEEDER v2  (gap-coverage additions integrated)
// Primary audit month: March 2026 — 31 days, 5 Sundays, WD = 26
// =============================================================================
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const F1  = 'f1111111-1111-1111-1111-111111111111';
const F2  = 'f2222222-2222-2222-2222-222222222222';
const SH1 = 'aaaa0001-0000-0000-0000-000000000000';
const SH2 = 'aaaa0002-0000-0000-0000-000000000000';
const E = {};
for (let i = 1; i <= 30; i++) E[i] = `bbbb${String(i).padStart(4,'0')}-0000-0000-0000-000000000000`;
const PS = { TKM_MAR:'cccc0001-0000-0000-0000-000000000000', KAN_MAR:'cccc0002-0000-0000-0000-000000000000', TKM_DEC:'cccc0003-0000-0000-0000-000000000000', KAN_DEC:'cccc0004-0000-0000-0000-000000000000' };
const LOAN_E7='dddd0001-0000-0000-0000-000000000000', LOAN_E24='dddd0002-0000-0000-0000-000000000000';
const ADV_E8='eeee0001-0000-0000-0000-000000000000', CO_E12='eeee0002-0000-0000-0000-000000000000', CO_E9='eeee0003-0000-0000-0000-000000000000';

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const MONTH     = '2026-03';   // PRIMARY AUDIT MONTH: March 2026
const DEC_MONTH = '2025-12';
const WD        = 26;          // 31 days − 5 Sundays = 26 working days
const SUNDAYS   = 5;
const LINE_A_EFF=88, LINE_A_IPCT=17, LINE_A_ACHIEVED=20, LINE_A_TAILORS=12, LINE_A_PRESENT=11;
const LINE_B_EFF=78, LINE_B_IPCT_CORRECT=8.5, LINE_B_IPCT_WRONG=11, LINE_B_ACHIEVED=20, LINE_B_TAILORS=10, LINE_B_PRESENT=9;

// ── MATHS ─────────────────────────────────────────────────────────────────────
const r2 = v => Math.round(v * 100) / 100;
function g(c) { return c.basic + c.hra + c.da + c.oa; }
function eg(c, p, wd=WD) { return r2((g(c)/wd)*p); }
function calcEPF(eb, eda, eoa) { const base=eb+eda+eoa; return base>15000?1800:r2(base*0.12); }
function calcESI(base) { return r2(base*0.0075); }
function calcPT(eg) { if(eg<=21000)return 0; if(eg<=30000)return 135; return 208; }
function wOT(fg, hrs, wd=WD) { return r2((fg/wd/8)*2*hrs); }
function wInc(eg_, pct, ach, wd=WD) { return r2((eg_/wd)*(pct/100)*ach); }
function sInc(fg, tot, pres, pct, ach, mult, wd=WD) { return r2((fg/tot)*(pres/wd)*(pct/100)*ach*mult); }

// ── CTC ───────────────────────────────────────────────────────────────────────
const CTC = {
  [E[1]]: {basic:6000,hra:1500,da:3200,oa:500},   // Rajan     M13 FAIL
  [E[2]]: {basic:6000,hra:1500,da:3200,oa:500},   // Murugan   M15 FAIL phantom advance
  [E[3]]: {basic:6000,hra:1200,da:2800,oa:400},   // Karthik   1 absent late>2h
  [E[4]]: {basic:5000,hra:1200,da:3000,oa:300},   // Selvam    M06 FAIL basic+da<8800
  [E[5]]: {basic:6000,hra:1400,da:2900,oa:400},   // Anbu      1 absent M07+M23 FAIL
  [E[6]]: {basic:6000,hra:1500,da:3200,oa:500},   // Lakshmi   2 absent M05/M07/M17 FAIL
  [E[7]]: {basic:10000,hra:2000,da:6000,oa:1000}, // Sujatha   M10 EPF cap + M14 loan FAIL
  [E[8]]: {basic:6000,hra:1200,da:2800,oa:400},   // Karpakam  M15 advance FAIL
  [E[9]]: {basic:6000,hra:1300,da:2900,oa:400},   // Palani    M21 layoff count FAIL
  [E[10]]:{basic:13000,hra:3000,da:5000,oa:2000}, // Meena     M11 ESI FAIL
  [E[11]]:{basic:6000,hra:1500,da:3200,oa:500},   // Balu      OT minutes FAIL
  [E[12]]:{basic:6000,hra:1500,da:3200,oa:500},   // Kamatchi  M22 compoff FAIL
  [E[13]]:{basic:9000,hra:2000,da:4000,oa:1000},  // Priya     M08 FAIL wrong slab
  [E[14]]:{basic:45000,hra:9000,da:15000,oa:6000},// Suresh    M08 FAIL
  [E[15]]:{basic:20000,hra:4000,da:6000,oa:1500}, // Ramesh    M08+M12 FAIL
  [E[16]]:{basic:15000,hra:3000,da:5000,oa:1000}, // Vijaya    M09 PASS staff OT
  [E[17]]:{basic:15000,hra:3000,da:5000,oa:1000}, // Nalini    M16 FAIL late ded
  [E[18]]:{basic:15000,hra:3000,da:5000,oa:1000}, // Mani      A26 encashment FAIL
  [E[19]]:{basic:16000,hra:3000,da:5500,oa:1000}, // Deepa     M09 FAIL staff OT
  [E[20]]:{basic:13000,hra:2500,da:4500,oa:800},  // Kavitha   EL before LOP D03
  [E[21]]:{basic:6000,hra:1500,da:3200,oa:500},   // Gopal     new joiner Feb16 full Mar
  [E[22]]:{basic:6000,hra:1500,da:3200,oa:500},   // Saroja    present on holiday M20 PASS
  [E[23]]:{basic:5500,hra:1200,da:2800,oa:300},   // Kumar     absent on holiday M20 FAIL
  [E[24]]:{basic:7000,hra:1500,da:3500,oa:500},   // Ravi      M18 50% cap FAIL
  [E[25]]:{basic:7000,hra:1400,da:3000,oa:400},   // Jothi     M08 scope FAIL
  [E[26]]:{basic:6000,hra:1500,da:3200,oa:500},   // Pandian   M07+M08 FAIL
  [E[27]]:{basic:6000,hra:1500,da:3200,oa:500},   // Ramu K    M10 FAIL opted-out
  [E[28]]:{basic:13000,hra:2500,da:4500,oa:800},  // Preethi A D04 pool FAIL
  [E[29]]:{basic:6000,hra:1500,da:3200,oa:500},   // Selvi K   M21 rate FAIL
  [E[30]]:{basic:65000,hra:12000,da:22000,oa:8000}// Anand R   M13 WARN TDS=0
};

async function ins(table, rows, label) {
  if (!rows.length) return;
  const { error } = await sb.from(table).insert(rows);
  if (error) { console.error(`  ✗ ${label||table}:`, error.message); throw error; }
  console.log(`  ✓ ${label||table}: ${rows.length} row(s)`);
}

async function seedSystemConfig() {
  await ins('system_config', [
    {key:'DATA_SOURCE',value:'MOCK'},{key:'ALERT_EMAIL_CENTRAL_HR',value:'central.hr@magnum.com'},
    {key:'ALERT_EMAIL_ADMIN',value:'admin@302labs.in'},{key:'DEFAULT_WORKING_DAYS',value:'26'},
  ], 'system_config');
}

async function seedFactories() {
  await ins('factories', [
    {id:F1,name:'TKM V',zone:'C',state:'Tamil Nadu',is_active:true},
    {id:F2,name:'Kandigai',zone:'C',state:'Tamil Nadu',is_active:true},
  ], 'factories');
}

async function seedShifts() {
  await ins('shifts', [
    {id:SH1,factory_id:F1,shift_name:'General',start_time:'09:00:00',end_time:'17:30:00',grace_minutes:10,effective_from:'2025-01-01'},
    {id:SH2,factory_id:F2,shift_name:'General',start_time:'09:00:00',end_time:'17:30:00',grace_minutes:10,effective_from:'2025-01-01'},
  ], 'shifts');
}

async function seedEmployees() {
  await ins('employees', [
    {id:E[1],emp_no:'TKM001',factory_id:F1,name:'Rajan Kumar',category:'worker',designation:'Tailor',grade:'Grade I',incentive_multiplier:1,zone:'C',date_of_joining:'2022-06-01',is_active:true,epf_opted_in:true,uan_number:'UAN100001',esi_number:'ESI100001'},
    {id:E[2],emp_no:'TKM002',factory_id:F1,name:'Murugan S',category:'worker',designation:'Tailor',grade:'Grade I',incentive_multiplier:1,zone:'C',date_of_joining:'2021-03-15',is_active:true,epf_opted_in:true,uan_number:'UAN100002',esi_number:'ESI100002'},
    {id:E[3],emp_no:'TKM003',factory_id:F1,name:'Karthik R',category:'worker',designation:'Helper',grade:'Grade I',incentive_multiplier:1,zone:'C',date_of_joining:'2023-01-10',is_active:true,epf_opted_in:true,uan_number:'UAN100003',esi_number:'ESI100003'},
    {id:E[4],emp_no:'TKM004',factory_id:F1,name:'Selvam P',category:'worker',designation:'Tailor',grade:'Grade II',incentive_multiplier:1,zone:'C',date_of_joining:'2020-08-20',is_active:true,epf_opted_in:true,uan_number:'UAN100004',esi_number:'ESI100004'},
    {id:E[5],emp_no:'TKM005',factory_id:F1,name:'Anbu M',category:'worker',designation:'Checker',grade:'Grade I',incentive_multiplier:1,zone:'C',date_of_joining:'2022-11-01',is_active:true,epf_opted_in:true,uan_number:'UAN100005',esi_number:'ESI100005'},
    {id:E[6],emp_no:'TKM006',factory_id:F1,name:'Lakshmi D',category:'worker',designation:'Tailor',grade:'Grade I',incentive_multiplier:1,zone:'C',date_of_joining:'2019-05-12',is_active:true,epf_opted_in:true,uan_number:'UAN100006',esi_number:'ESI100006'},
    {id:E[7],emp_no:'TKM007',factory_id:F1,name:'Sujatha R',category:'worker',designation:'Tailor',grade:'Grade I',incentive_multiplier:1,zone:'C',date_of_joining:'2018-02-01',is_active:true,epf_opted_in:true,uan_number:'UAN100007',esi_number:'ESI100007'},
    {id:E[8],emp_no:'TKM008',factory_id:F1,name:'Karpakam V',category:'worker',designation:'Helper',grade:'Grade I',incentive_multiplier:1,zone:'C',date_of_joining:'2023-06-15',is_active:true,epf_opted_in:true,uan_number:'UAN100008',esi_number:'ESI100008'},
    {id:E[9],emp_no:'TKM009',factory_id:F1,name:'Palani S',category:'worker',designation:'Tailor',grade:'Grade II',incentive_multiplier:1,zone:'C',date_of_joining:'2021-09-01',is_active:true,epf_opted_in:true,uan_number:'UAN100009',esi_number:'ESI100009'},
    {id:E[10],emp_no:'TKM010',factory_id:F1,name:'Meena K',category:'worker',designation:'Tailor',grade:'Grade I',incentive_multiplier:1,zone:'C',date_of_joining:'2020-04-01',is_active:true,epf_opted_in:true,uan_number:'UAN100010',esi_number:'ESI100010'},
    {id:E[11],emp_no:'TKM011',factory_id:F1,name:'Balu T',category:'worker',designation:'Tailor',grade:'Grade I',incentive_multiplier:1,zone:'C',date_of_joining:'2022-03-07',is_active:true,epf_opted_in:true,uan_number:'UAN100011',esi_number:'ESI100011'},
    {id:E[12],emp_no:'TKM012',factory_id:F1,name:'Kamatchi S',category:'worker',designation:'Tailor',grade:'Grade I',incentive_multiplier:1,zone:'C',date_of_joining:'2021-07-19',is_active:true,epf_opted_in:true,uan_number:'UAN100012',esi_number:'ESI100012'},
    {id:E[13],emp_no:'KAN001',factory_id:F2,name:'Priya M',category:'worker',designation:'Tailor',grade:'Grade I',incentive_multiplier:1,zone:'C',date_of_joining:'2022-08-01',is_active:true,epf_opted_in:true,uan_number:'UAN200001',esi_number:'ESI200001'},
    {id:E[14],emp_no:'KAN002',factory_id:F2,name:'Suresh K',category:'staff',designation:'Factory Manager',grade:'Grade I',incentive_multiplier:3,zone:'C',date_of_joining:'2015-01-01',is_active:true,epf_opted_in:true,uan_number:'UAN200002',esi_number:null},
    {id:E[15],emp_no:'KAN003',factory_id:F2,name:'Ramesh G',category:'staff',designation:'Production Manager',grade:'Grade I',incentive_multiplier:2,zone:'C',date_of_joining:'2016-03-15',is_active:true,epf_opted_in:true,uan_number:'UAN200003',esi_number:null},
    {id:E[16],emp_no:'KAN004',factory_id:F2,name:'Vijaya L',category:'staff',designation:'IE Incharge',grade:'Grade I',incentive_multiplier:2,zone:'C',date_of_joining:'2018-06-01',is_active:true,epf_opted_in:true,uan_number:'UAN200004',esi_number:null},
    {id:E[17],emp_no:'KAN005',factory_id:F2,name:'Nalini S',category:'staff',designation:'Cutting Incharge',grade:'Grade I',incentive_multiplier:2,zone:'C',date_of_joining:'2019-02-01',is_active:true,epf_opted_in:true,uan_number:'UAN200005',esi_number:null},
    {id:E[18],emp_no:'KAN006',factory_id:F2,name:'Mani R',category:'staff',designation:'Finishing Incharge',grade:'Grade I',incentive_multiplier:2,zone:'C',date_of_joining:'2017-11-01',is_active:true,epf_opted_in:true,uan_number:'UAN200006',esi_number:null},
    {id:E[19],emp_no:'KAN007',factory_id:F2,name:'Deepa T',category:'staff',designation:'Chief Mechanic',grade:'Grade I',incentive_multiplier:2,zone:'C',date_of_joining:'2016-08-15',is_active:true,epf_opted_in:true,uan_number:'UAN200007',esi_number:null},
    {id:E[20],emp_no:'KAN008',factory_id:F2,name:'Kavitha P',category:'staff',designation:'IE',grade:'Grade I',incentive_multiplier:2,zone:'C',date_of_joining:'2020-01-06',is_active:true,epf_opted_in:true,uan_number:'UAN200008',esi_number:'ESI200008'},
    {id:E[21],emp_no:'KAN009',factory_id:F2,name:'Gopal N',category:'worker',designation:'Tailor',grade:'Grade I',incentive_multiplier:1,zone:'C',date_of_joining:'2026-02-16',is_active:true,epf_opted_in:true,uan_number:null,esi_number:null},
    {id:E[22],emp_no:'KAN010',factory_id:F2,name:'Saroja M',category:'worker',designation:'Tailor',grade:'Grade I',incentive_multiplier:1,zone:'C',date_of_joining:'2021-05-01',is_active:true,epf_opted_in:true,uan_number:'UAN200010',esi_number:'ESI200010'},
    {id:E[23],emp_no:'KAN011',factory_id:F2,name:'Kumar V',category:'worker',designation:'Helper',grade:'Grade I',incentive_multiplier:1,zone:'C',date_of_joining:'2022-09-01',is_active:true,epf_opted_in:true,uan_number:'UAN200011',esi_number:'ESI200011'},
    {id:E[24],emp_no:'KAN012',factory_id:F2,name:'Ravi A',category:'worker',designation:'Tailor',grade:'Grade II',incentive_multiplier:1,zone:'C',date_of_joining:'2020-11-01',is_active:true,epf_opted_in:true,uan_number:'UAN200012',esi_number:'ESI200012'},
    {id:E[25],emp_no:'KAN013',factory_id:F2,name:'Jothi B',category:'worker',designation:'Ironer',grade:'Grade I',incentive_multiplier:1,zone:'C',date_of_joining:'2023-03-01',is_active:true,epf_opted_in:true,uan_number:'UAN200013',esi_number:'ESI200013'},
    {id:E[26],emp_no:'TKM013',factory_id:F1,name:'Pandian K',category:'worker',designation:'Tailor',grade:'Grade I',incentive_multiplier:1,zone:'C',date_of_joining:'2021-04-01',is_active:true,epf_opted_in:true,uan_number:'UAN100013',esi_number:'ESI100013'},
    {id:E[27],emp_no:'TKM014',factory_id:F1,name:'Ramu K',category:'worker',designation:'Tailor',grade:'Grade I',incentive_multiplier:1,zone:'C',date_of_joining:'2021-11-01',is_active:true,epf_opted_in:false,uan_number:'UAN100014',esi_number:'ESI100014'},
    {id:E[28],emp_no:'KAN014',factory_id:F2,name:'Preethi A',category:'staff',designation:'IE',grade:'Grade I',incentive_multiplier:2,zone:'C',date_of_joining:'2020-07-01',is_active:true,epf_opted_in:true,uan_number:'UAN200014',esi_number:'ESI200014'},
    {id:E[29],emp_no:'KAN015',factory_id:F2,name:'Selvi K',category:'worker',designation:'Tailor',grade:'Grade I',incentive_multiplier:1,zone:'C',date_of_joining:'2022-04-01',is_active:true,epf_opted_in:true,uan_number:'UAN200015',esi_number:'ESI200015'},
    {id:E[30],emp_no:'KAN016',factory_id:F2,name:'Anand R',category:'staff',designation:'HR Manager',grade:'Grade I',incentive_multiplier:2,zone:'C',date_of_joining:'2014-06-01',is_active:true,epf_opted_in:true,uan_number:'UAN200016',esi_number:null},
  ], 'employees (30)');
}

async function seedEmployeeShifts() {
  const rows = [
    ...Array.from({length:12},(_,k)=>({employee_id:E[k+1],shift_id:SH1,assigned_from:'2025-01-01'})),
    {employee_id:E[26],shift_id:SH1,assigned_from:'2025-01-01'},
    {employee_id:E[27],shift_id:SH1,assigned_from:'2025-01-01'},
    ...Array.from({length:13},(_,k)=>({employee_id:E[k+13],shift_id:SH2,assigned_from:'2025-01-01'})),
    {employee_id:E[28],shift_id:SH2,assigned_from:'2025-01-01'},
    {employee_id:E[29],shift_id:SH2,assigned_from:'2025-01-01'},
    {employee_id:E[30],shift_id:SH2,assigned_from:'2025-01-01'},
  ];
  await ins('employee_shifts', rows, 'employee_shifts (30)');
}

async function seedCtcRecords() {
  const rows = Object.entries(CTC).map(([empId,c])=>({employee_id:empId,fixed_basic:c.basic,fixed_hra:c.hra,fixed_da:c.da,fixed_oa:c.oa,effective_from:'2025-04-01'}));
  await ins('ctc_records', rows, 'ctc_records (30)');
}

async function seedMinimumWages() {
  const mw=(zone,category,grade,basicDa,from,to)=>({zone,category,grade,basic:r2(basicDa*0.65),da:r2(basicDa*0.35),basic_da:basicDa,effective_from:from,effective_to:to});
  const F26='2025-04-01',T26='2026-03-31',F27='2026-04-01',T27='2027-03-31';
  await ins('minimum_wages',[
    mw('C','Tailor','Grade I',9000,F26,T26),mw('C','Tailor','Grade II',8800,F26,T26),
    mw('C','Helper','Grade I',8500,F26,T26),mw('C','Helper','Grade II',8200,F26,T26),
    mw('C','Checker','Grade I',8700,F26,T26),mw('C','Checker','Grade II',8400,F26,T26),
    mw('C','Floater','Grade I',8700,F26,T26),mw('C','Floater','Grade II',8400,F26,T26),
    mw('C','Weaver','Grade I',9200,F26,T26),mw('C','Mechanic','Grade I',9200,F26,T26),
    mw('C','Ironer','Grade I',8700,F26,T26),
    mw('C','Factory Manager','Grade I',35000,F26,T26),mw('C','Production Manager','Grade I',18000,F26,T26),
    mw('C','IE','Grade I',13000,F26,T26),mw('C','IE Incharge','Grade I',14500,F26,T26),
    mw('C','Cutting Incharge','Grade I',14500,F26,T26),mw('C','Finishing Incharge','Grade I',14500,F26,T26),
    mw('C','Chief Mechanic','Grade I',15000,F26,T26),mw('C','Factory Incharge','Grade I',14000,F26,T26),
    mw('C','HR Manager','Grade I',55000,F26,T26),
    mw('C','Tailor','Grade I',9500,F27,T27),mw('C','Tailor','Grade II',9200,F27,T27),
    mw('C','Helper','Grade I',8900,F27,T27),mw('C','Helper','Grade II',8600,F27,T27),
    mw('C','Checker','Grade I',9100,F27,T27),mw('C','Ironer','Grade I',9100,F27,T27),
    mw('C','Factory Manager','Grade I',37000,F27,T27),mw('C','Production Manager','Grade I',19000,F27,T27),
    mw('C','IE','Grade I',13700,F27,T27),mw('C','IE Incharge','Grade I',15200,F27,T27),
    mw('C','Cutting Incharge','Grade I',15200,F27,T27),mw('C','Finishing Incharge','Grade I',15200,F27,T27),
    mw('C','Chief Mechanic','Grade I',15750,F27,T27),mw('C','HR Manager','Grade I',57750,F27,T27),
    mw('B','Tailor','Grade I',9900,F26,T26),mw('B','Factory Manager','Grade I',38500,F26,T26),
    mw('B','Production Manager','Grade I',19800,F26,T26),mw('B','IE','Grade I',14300,F26,T26),
    mw('B','Tailor','Grade I',10400,F27,T27),mw('B','Factory Manager','Grade I',40400,F27,T27),
  ],'minimum_wages');
}

async function seedHolidayCalendar() {
  await ins('holiday_calendar',[
    {factory_id:null,holiday_date:'2026-01-14',holiday_name:'Pongal',is_national:false},
    {factory_id:null,holiday_date:'2026-01-26',holiday_name:'Republic Day',is_national:true},
    {factory_id:F2,  holiday_date:'2026-02-05',holiday_name:'Kandigai Factory Day',is_national:false},
    {factory_id:null,holiday_date:'2026-03-10',holiday_name:'Maha Shivaratri',is_national:false},
    {factory_id:null,holiday_date:'2026-04-14',holiday_name:'Tamil New Year',is_national:false},
    {factory_id:null,holiday_date:'2026-05-01',holiday_name:'May Day',is_national:true},
    {factory_id:null,holiday_date:'2026-08-15',holiday_name:'Independence Day',is_national:true},
    {factory_id:null,holiday_date:'2026-10-02',holiday_name:'Gandhi Jayanti',is_national:true},
    {factory_id:null,holiday_date:'2026-11-04',holiday_name:'Diwali',is_national:false},
    {factory_id:null,holiday_date:'2026-12-25',holiday_name:'Christmas',is_national:false},
  ],'holiday_calendar');
}

async function seedIncentiveSlabs() {
  await ins('incentive_slabs',[
    {efficiency_from:67.00,efficiency_to:70.00,incentive_pct:4.0},
    {efficiency_from:70.01,efficiency_to:73.00,incentive_pct:5.0},
    {efficiency_from:73.01,efficiency_to:77.00,incentive_pct:6.5},
    {efficiency_from:77.01,efficiency_to:80.00,incentive_pct:8.5},
    {efficiency_from:80.01,efficiency_to:83.00,incentive_pct:11.0},
    {efficiency_from:83.01,efficiency_to:86.00,incentive_pct:14.0},
    {efficiency_from:86.01,efficiency_to:91.00,incentive_pct:17.0},
    {efficiency_from:91.01,efficiency_to:94.00,incentive_pct:20.0},
    {efficiency_from:94.01,efficiency_to:96.00,incentive_pct:23.0},
    {efficiency_from:96.01,efficiency_to:100.00,incentive_pct:25.0},
    {efficiency_from:100.01,efficiency_to:104.00,incentive_pct:30.0},
  ],'incentive_slabs');
}

async function seedAttendanceBonusConfig() {
  const FROM='2025-04-01'; const rows=[];
  for(const fid of[F1,F2]){
    for(const d of['Tailor','Floater'])rows.push({factory_id:fid,designation:d,bonus_amount:500,effective_from:FROM});
    for(const d of['Helper','Checker','Weaver','Mechanic','Ironer'])rows.push({factory_id:fid,designation:d,bonus_amount:300,effective_from:FROM});
  }
  await ins('attendance_bonus_config',rows,'attendance_bonus_config');
}

async function seedPerformanceBonusConfig() {
  await ins('performance_bonus_config',[
    {period:'OCT_MAR',cycle_start_year:2025,rate:0.0833,effective_from:'2025-10-01',effective_to:'2026-03-31',notes:'Statutory 8.33% – Oct 2025 to Mar 2026'},
    {period:'APR_SEP',cycle_start_year:2026,rate:0.0833,effective_from:'2026-04-01',effective_to:'2026-09-30',notes:'Statutory 8.33% – Apr 2026 to Sep 2026'},
  ],'performance_bonus_config');
}

async function seedLoanLedger() {
  await ins('loan_ledger',[
    {id:LOAN_E7,employee_id:E[7],sanctioned_amount:50000,emi_amount:5000,installments_total:10,installments_paid:3,outstanding_balance:35000,loan_date:'2025-11-01',status:'ACTIVE',remarks:'M14 FAIL: ERP deducts 3000 not 5000'},
    {id:LOAN_E24,employee_id:E[24],sanctioned_amount:40000,emi_amount:5000,installments_total:8,installments_paid:2,outstanding_balance:30000,loan_date:'2025-12-01',status:'ACTIVE',remarks:'M18 50% cap breach'},
  ],'loan_ledger');
}

async function seedAdvanceLedger() {
  await ins('advance_ledger',[
    {id:ADV_E8,employee_id:E[8],advance_date:'2026-02-10',amount:2000,deducted_month:null,status:'PENDING',remarks:'M15 FAIL: not deducted in payroll'},
  ],'advance_ledger');
}

async function seedElBalance() {
  await ins('el_balance',[
    {employee_id:E[14],year:2025,opening_balance:8,accrued_days:12,used_days:2,encashed_days:0,balance_days:18,encashment_amount:0},
    {employee_id:E[15],year:2025,opening_balance:5,accrued_days:12,used_days:0,encashed_days:0,balance_days:17,encashment_amount:0},
    {employee_id:E[16],year:2025,opening_balance:3,accrued_days:12.5,used_days:1,encashed_days:0,balance_days:14.5,encashment_amount:0},
    {employee_id:E[17],year:2025,opening_balance:2,accrued_days:11.0,used_days:0,encashed_days:0,balance_days:13.0,encashment_amount:0}, // FAIL A26
    {employee_id:E[18],year:2025,opening_balance:6,accrued_days:12,used_days:0,encashed_days:18,balance_days:0,encashment_amount:6000},   // FAIL A26
    {employee_id:E[19],year:2025,opening_balance:4,accrued_days:13,used_days:2,encashed_days:0,balance_days:15,encashment_amount:0},
    {employee_id:E[20],year:2025,opening_balance:2,accrued_days:12,used_days:0,encashed_days:0,balance_days:14,encashment_amount:0},
    {employee_id:E[20],year:2026,opening_balance:14,accrued_days:1.1,used_days:1,encashed_days:0,balance_days:14.1,encashment_amount:0},
    {employee_id:E[22],year:2025,opening_balance:0,accrued_days:5,used_days:0,encashed_days:0,balance_days:5,encashment_amount:0},  // WARN A26
    {employee_id:E[28],year:2025,opening_balance:1,accrued_days:12,used_days:0,encashed_days:0,balance_days:13,encashment_amount:0},
    {employee_id:E[30],year:2025,opening_balance:10,accrued_days:12,used_days:0,encashed_days:0,balance_days:22,encashment_amount:0},
  ],'el_balance');
}

async function seedCompoffLedger() {
  await ins('compoff_ledger',[
    {id:CO_E12,employee_id:E[12],compoff_date:'2026-02-08',hours_earned:3,approved_by:'Factory Manager TKM V',compensated_date:null,status:'EARNED',note:'M22 FAIL – hours leaked into OT'},
    {id:CO_E9,employee_id:E[9],compoff_date:'2026-01-25',hours_earned:2,approved_by:'Factory Manager TKM V',compensated_date:'2026-02-02',status:'COMPENSATED',note:'M22 PASS case'},
  ],'compoff_ledger');
}

async function seedEsiCycleEnrollment() {
  await ins('esi_cycle_enrollment',[
    {employee_id:E[10],cycle:'OCT_MAR',cycle_year:2025,is_eligible:true,qualifying_gross:20000,determination_month:'2025-10'},
    {employee_id:E[7], cycle:'OCT_MAR',cycle_year:2025,is_eligible:true,qualifying_gross:19000,determination_month:'2025-10'},
    {employee_id:E[13],cycle:'OCT_MAR',cycle_year:2025,is_eligible:true,qualifying_gross:16000,determination_month:'2025-10'},
    {employee_id:E[20],cycle:'OCT_MAR',cycle_year:2025,is_eligible:true,qualifying_gross:20800,determination_month:'2025-10'},
    {employee_id:E[28],cycle:'OCT_MAR',cycle_year:2025,is_eligible:true,qualifying_gross:20800,determination_month:'2025-10'},
    {employee_id:E[29],cycle:'OCT_MAR',cycle_year:2025,is_eligible:true,qualifying_gross:11200,determination_month:'2025-10'},
  ],'esi_cycle_enrollment');
}

async function seedPayrollSnapshots() {
  await ins('payroll_snapshots',[
    {id:PS.TKM_MAR,factory_id:F1,month_year:MONTH,record_count:14,storage_path:'payroll/2026-03/tkm_v_mar2026.json',status:'RAW'},
    {id:PS.KAN_MAR,factory_id:F2,month_year:MONTH,record_count:16,storage_path:'payroll/2026-03/kandigai_mar2026.json',status:'RAW'},
    {id:PS.TKM_DEC,factory_id:F1,month_year:DEC_MONTH,record_count:5,storage_path:'payroll/2025-12/tkm_v_dec2025.json',status:'AUDITED'},
    {id:PS.KAN_DEC,factory_id:F2,month_year:DEC_MONTH,record_count:5,storage_path:'payroll/2025-12/kandigai_dec2025.json',status:'AUDITED'},
  ],'payroll_snapshots');
}


async function seedSaviorRawPunches() {
  const rows=[];
  const punch=(factoryId,empNo,date,ov={})=>({factory_id:factoryId,emp_no:empNo,punch_date:date,time_in:`${date}T09:01:00+05:30`,time_out:`${date}T17:35:00+05:30`,normal_hrs:8.57,extra_hrs:0,late_hrs:0,late_reason:null,early_hrs:0,ot_hrs_ded:0,compoff_hrs:0,ot_appr:false,appr:true,layoff:null,att:'P',permission:null,remarks:null,raw_payload:null,employee_id:null,...ov});
  const TKM={1:'TKM001',2:'TKM002',3:'TKM003',4:'TKM004',5:'TKM005',6:'TKM006',7:'TKM007',8:'TKM008',9:'TKM009',10:'TKM010',11:'TKM011',12:'TKM012'};
  const KAN={13:'KAN001',14:'KAN002',15:'KAN003',16:'KAN004',17:'KAN005',18:'KAN006',19:'KAN007',20:'KAN008',21:'KAN009',22:'KAN010',23:'KAN011',24:'KAN012'};

  // M09 Mar qualifying OT – E16 (2 days, PASS) and E19 (3 days, FAIL)
  rows.push(punch(F2,'KAN004','2026-03-04',{extra_hrs:5.5,time_out:'2026-03-04T22:04:00+05:30',ot_appr:true,remarks:'M09 PASS: E16 OT day 1/2'}));
  rows.push(punch(F2,'KAN004','2026-03-11',{extra_hrs:5.0,time_out:'2026-03-11T21:31:00+05:30',ot_appr:true,remarks:'M09 PASS: E16 OT day 2/2 → 2 days×₹350=₹700'}));
  rows.push(punch(F2,'KAN007','2026-03-04',{extra_hrs:5.5,time_out:'2026-03-04T22:04:00+05:30',ot_appr:true,remarks:'M09 FAIL: E19 OT day 1/3'}));
  rows.push(punch(F2,'KAN007','2026-03-11',{extra_hrs:5.5,time_out:'2026-03-11T22:04:00+05:30',ot_appr:true,remarks:'M09 FAIL: E19 OT day 2/3'}));
  rows.push(punch(F2,'KAN007','2026-03-25',{extra_hrs:5.5,time_out:'2026-03-25T22:04:00+05:30',ot_appr:true,remarks:'M09 FAIL: E19 OT day 3/3 → 3×₹350=₹1050 but ERP paid ₹600'}));

  const d1='2026-03-17';
  for(let i=1;i<=12;i++){const ov={};if(i===5){ov.time_in='2026-03-17T06:30:00+05:30';ov.early_hrs=2.5;ov.remarks='D02 TEST early punch 06:30';}if(i===11){ov.extra_hrs=2.75;}rows.push(punch(F1,TKM[i],d1,ov));}
  rows.push(punch(F1,'TKM013',d1,{time_in:'2026-03-17T09:11:00+05:30',late_hrs:2.0,late_reason:'personal',remarks:'E26 1st late 2h'}));
  rows.push(punch(F1,'TKM014',d1,{time_in:'2026-03-17T09:01:00+05:30',time_out:'2026-03-17T17:35:00+05:30',normal_hrs:5.5,remarks:'D01 FAIL: normal_hrs=5.5 vs actual 8.57h → discrepancy >2h'}));
  for(let i=13;i<=24;i++){const ov={};if(i===16){ov.time_in='2026-03-17T09:09:00+05:30';ov.late_hrs=0;}rows.push(punch(F2,KAN[i],d1,ov));}
  rows.push(punch(F2,'KAN013',d1));
  rows.push(punch(F2,'KAN014',d1,{time_in:'2026-03-17T09:15:00+05:30',late_hrs:0.25,permission:'approved',remarks:'D04: E28 late day 1/2 (pool 0.25h used)'}));
  rows.push(punch(F2,'KAN015',d1,{layoff:'Y',att:'LAYOFF',normal_hrs:4,time_out:'2026-03-17T13:00:00+05:30',remarks:'E29 layoff day 1'}));
  rows.push(punch(F2,'KAN016',d1));

  const d2='2026-03-18';
  for(let i=1;i<=12;i++){const ov={};if(i===3){ov.time_out=null;ov.normal_hrs=0;ov.remarks='D02: OUT missing';}if(i===4){ov.time_in='2026-03-18T09:20:00+05:30';ov.late_hrs=0.333;ov.late_reason='transport';ov.normal_hrs=8.24;ov.remarks='D04: worker 20min late no grace';}if(i===9){ov.layoff='Y';ov.att='LAYOFF';ov.normal_hrs=4;ov.time_out='2026-03-18T13:00:00+05:30';}if(i===6){ov.att='A';ov.time_in=null;ov.time_out=null;ov.normal_hrs=0;}rows.push(punch(F1,TKM[i],d2,ov));}
  rows.push(punch(F1,'TKM013',d2,{time_in:'2026-03-18T09:11:00+05:30',late_hrs:2.0,late_reason:'personal',remarks:'E26 2nd late → ineligible M07+M08'}));
  rows.push(punch(F1,'TKM014',d2));
  rows.push(punch(F1,'TKM_GHOST01',d2,{remarks:'D01 FAIL: emp_no TKM_GHOST01 not in employee master',employee_id:null}));
  for(let i=13;i<=24;i++){const ov={};if(i===17){ov.time_in='2026-03-18T09:15:00+05:30';ov.late_hrs=0.25;ov.remarks='Staff late 9:15 half-day';}rows.push(punch(F2,KAN[i],d2,ov));}
  rows.push(punch(F2,'KAN013',d2));
  rows.push(punch(F2,'KAN014',d2,{time_in:'2026-03-18T09:20:00+05:30',late_hrs:0.333,permission:'approved',remarks:'D04: E28 late day 2/2 (pool NOW EXHAUSTED)'}));
  rows.push(punch(F2,'KAN015',d2,{layoff:'Y',att:'LAYOFF',normal_hrs:4,time_out:'2026-03-18T13:00:00+05:30',remarks:'E29 layoff day 2'}));
  rows.push(punch(F2,'KAN016',d2));

  const d3='2026-03-19';
  for(let i=1;i<=12;i++){const ov={};if(i===4){ov.time_in=null;ov.normal_hrs=0;ov.appr=false;ov.remarks='D02: IN missing HIGH';}if(i===12){ov.compoff_hrs=3.0;ov.extra_hrs=3.0;ov.remarks='Comp-off 3h must NOT flow to OT';}rows.push(punch(F1,TKM[i],d3,ov));}
  rows.push(punch(F1,'TKM013',d3));rows.push(punch(F1,'TKM014',d3));
  for(let i=13;i<=24;i++){const ov={};if(i===18){ov.time_in='2026-03-19T09:35:00+05:30';ov.late_hrs=0.583;ov.remarks='Staff late >9:30 full-day ded';}rows.push(punch(F2,KAN[i],d3,ov));}
  rows.push(punch(F2,'KAN013',d3));
  rows.push(punch(F2,'KAN014',d3,{time_in:'2026-03-19T09:15:00+05:30',late_hrs:0.25,permission:'approved',remarks:'D04 FAIL: E28 3rd late pool exhausted; ERP still approved → no deduction'}));
  rows.push(punch(F2,'KAN015',d3,{layoff:'Y',att:'LAYOFF',normal_hrs:4,time_out:'2026-03-19T13:00:00+05:30',remarks:'E29 layoff day 3'}));
  rows.push(punch(F2,'KAN016',d3));

  await ins('savior_raw_punches',rows,`savior_raw_punches (${rows.length} rows)`);
}

async function seedAttendanceProcessed() {
  const rows=[];
  const longAbsDates=['2026-01-12','2026-01-13','2026-01-14','2026-01-15','2026-01-16','2026-01-17','2026-01-18','2026-01-19','2026-01-20','2026-01-21','2026-01-22'];
  for(const d of longAbsDates)rows.push({employee_id:E[6],attendance_date:d,month_year:'2026-01',status:'LOP',is_late:false,late_minutes:0,is_early:false,ot_hours:0,compoff_hrs:0,effective_hours:0,deduction_type:'NONE',source:'SAVIOR'});

  // Mar 10 Maha Shivaratri – M20 test
  rows.push({employee_id:E[22],attendance_date:'2026-03-10',month_year:'2026-03',status:'P',is_late:false,late_minutes:0,is_early:false,ot_hours:0,compoff_hrs:0,effective_hours:8.5,deduction_type:'NONE',source:'SAVIOR'});
  rows.push({employee_id:E[23],attendance_date:'2026-03-10',month_year:'2026-03',status:'LOP',is_late:false,late_minutes:0,is_early:false,ot_hours:0,compoff_hrs:0,effective_hours:0,deduction_type:'NONE',source:'SAVIOR'});
  // Mar 15 EL – E20 D03
  rows.push({employee_id:E[20],attendance_date:'2026-03-15',month_year:'2026-03',status:'EL',is_late:false,late_minutes:0,is_early:false,ot_hours:0,compoff_hrs:0,effective_hours:8.5,deduction_type:'NONE',source:'SAVIOR'});

  // M09 E16 OT qualifying days
  rows.push({employee_id:E[16],attendance_date:'2026-03-04',month_year:'2026-03',status:'P',is_late:false,late_minutes:0,is_early:false,ot_hours:5.5,compoff_hrs:0,effective_hours:8.57,deduction_type:'NONE',source:'SAVIOR'});
  rows.push({employee_id:E[16],attendance_date:'2026-03-11',month_year:'2026-03',status:'P',is_late:false,late_minutes:0,is_early:false,ot_hours:5.0,compoff_hrs:0,effective_hours:8.57,deduction_type:'NONE',source:'SAVIOR'});
  // M09 E19 OT qualifying days
  rows.push({employee_id:E[19],attendance_date:'2026-03-04',month_year:'2026-03',status:'P',is_late:false,late_minutes:0,is_early:false,ot_hours:5.5,compoff_hrs:0,effective_hours:8.57,deduction_type:'NONE',source:'SAVIOR'});
  rows.push({employee_id:E[19],attendance_date:'2026-03-11',month_year:'2026-03',status:'P',is_late:false,late_minutes:0,is_early:false,ot_hours:5.5,compoff_hrs:0,effective_hours:8.57,deduction_type:'NONE',source:'SAVIOR'});
  rows.push({employee_id:E[19],attendance_date:'2026-03-25',month_year:'2026-03',status:'P',is_late:false,late_minutes:0,is_early:false,ot_hours:5.5,compoff_hrs:0,effective_hours:8.57,deduction_type:'NONE',source:'SAVIOR'});

  const DAYS=[{date:'2026-03-17',month_year:'2026-03'},{date:'2026-03-18',month_year:'2026-03'},{date:'2026-03-19',month_year:'2026-03'}];
  const TKM_IDS=[...Array.from({length:12},(_,k)=>E[k+1]),E[26],E[27]];
  const KAN_IDS=[...Array.from({length:13},(_,k)=>E[k+13]),E[28],E[29],E[30]];

  for(const{date,month_year}of DAYS){
    for(const empId of[...TKM_IDS,...KAN_IDS]){
      let status='P',is_late=false,late_minutes=0,ot_hours=0,compoff_hrs=0,effective_hours=8.57,deduction_type='NONE';
      if(date==='2026-03-18'){
        if(empId===E[3]){status='HALFDAY';effective_hours=0;}
        if(empId===E[6]){status='LOP';effective_hours=0;}
        if(empId===E[9]){status='LAYOFF';effective_hours=4;}
        if(empId===E[17]){is_late=true;late_minutes=15;deduction_type='HALF';}
        if(empId===E[4]){is_late=true;late_minutes=20;deduction_type='HALF';}
        if(empId===E[26]){is_late=true;late_minutes=120;}
      }
      if(date==='2026-03-19'){
        if(empId===E[18]){is_late=true;late_minutes=35;deduction_type='FULL';}
        if(empId===E[12]){compoff_hrs=3.0;}
        if(empId===E[4]){status='HALFDAY';effective_hours=0;}
      }
      if(date==='2026-03-17'){
        if(empId===E[11]){ot_hours=2.75;}
        if(empId===E[26]){is_late=true;late_minutes=120;}
      }
      if(empId===E[28]){
        if(date==='2026-03-17'){is_late=true;late_minutes=15;deduction_type='NONE';}
        if(date==='2026-03-18'){is_late=true;late_minutes=20;deduction_type='NONE';}
        if(date==='2026-03-19'){is_late=true;late_minutes=15;deduction_type='NONE';} // FAIL D04
      }
      if(empId===E[29]){status='LAYOFF';effective_hours=4;}
      rows.push({employee_id:empId,attendance_date:date,month_year,status,is_late,late_minutes,is_early:false,ot_hours,compoff_hrs,effective_hours,deduction_type,source:'SAVIOR'});
    }
  }
  await ins('attendance_processed',rows,`attendance_processed (${rows.length} rows)`);
}

async function seedMonthlyAttendanceSummary() {
  const mas=(empId,ov)=>({employee_id:empId,month_year:MONTH,present_days:WD,absent_days:0,lop_days:0,layoff_days:0,ot_hours:0,el_days_used:0,late_count:0,late_hours_total:0,compoff_hrs_total:0,permission_hours_used:0,permission_days_used:0,sundays_in_month:SUNDAYS,working_days:WD,...ov});
  await ins('monthly_attendance_summary',[
    mas(E[1],{}),
    mas(E[2],{late_count:1,late_hours_total:2.0}),
    mas(E[3],{present_days:25,absent_days:1,lop_days:1,late_count:1,late_hours_total:2.02}),
    mas(E[4],{}),
    mas(E[5],{present_days:25,absent_days:1,lop_days:1}),
    mas(E[6],{present_days:24,absent_days:2,lop_days:2}),
    mas(E[7],{}),mas(E[8],{}),
    mas(E[9],{layoff_days:2}),
    mas(E[10],{}),
    mas(E[11],{ot_hours:2.75}),
    mas(E[12],{compoff_hrs_total:3.0}),
    mas(E[13],{}),mas(E[14],{}),mas(E[15],{}),
    mas(E[16],{ot_hours:10.5}),
    mas(E[17],{late_count:1,late_hours_total:0.25}),
    mas(E[18],{late_count:1,late_hours_total:0.583}),
    mas(E[19],{ot_hours:16.5,permission_hours_used:2.5,permission_days_used:2}),
    mas(E[20],{el_days_used:1}),
    mas(E[21],{}),
    mas(E[22],{}),
    mas(E[23],{present_days:25,absent_days:1,lop_days:1}),
    mas(E[24],{}),mas(E[25],{}),
    mas(E[26],{late_count:2,late_hours_total:4.0}),
    mas(E[27],{}),
    mas(E[28],{late_count:3,late_hours_total:0.583,permission_hours_used:0.583,permission_days_used:2}),
    mas(E[29],{present_days:23,layoff_days:3}),
    mas(E[30],{}),
  ],'monthly_attendance_summary (30 rows)');
}

async function seedPayrollRecords() {
  const earned=(empId,pd,wd=WD)=>{const c=CTC[empId];return{earned_basic:r2((c.basic/wd)*pd),earned_hra:r2((c.hra/wd)*pd),earned_da:r2((c.da/wd)*pd),earned_oa:r2((c.oa/wd)*pd)};};
  const tkmInc=(empId,pd)=>{const e_=r2((g(CTC[empId])/WD)*pd);return wInc(e_,LINE_A_IPCT,LINE_A_ACHIEVED);};
  const kanIncW=(empId,pd)=>{const e_=r2((g(CTC[empId])/WD)*pd);return wInc(e_,LINE_B_IPCT_WRONG,LINE_B_ACHIEVED);};
  const kanSInc=(empId,mult)=>sInc(g(CTC[empId]),LINE_B_TAILORS,LINE_B_PRESENT,LINE_B_IPCT_WRONG,LINE_B_ACHIEVED,mult);
  const rows=[];

  // E1 – M13 FAIL TDS wrongly deducted
  {const e=earned(E[1],26);const inc=tkmInc(E[1],26);const epf=calcEPF(e.earned_basic,e.earned_da,e.earned_oa);const esi=calcESI(e.earned_basic+e.earned_da+e.earned_oa+e.earned_hra);const tds=500;const totE=r2(11200+500+inc);const totD=r2(epf+esi+tds);rows.push({snapshot_id:PS.TKM_MAR,employee_id:E[1],month_year:MONTH,fixed_basic:6000,fixed_hra:1500,fixed_da:3200,fixed_oa:500,...e,attendance_bonus:500,incentive_amount:inc,staff_ot_amount:0,worker_ot_amount:0,epf_deducted:epf,esi_deducted:esi,pt_deducted:0,tds_deducted:tds,loan_deducted:0,advance_deducted:0,lwf_deducted:0,late_deducted:0,misc_deducted:0,total_earnings:totE,total_deductions:totD,net_pay:r2(totE-totD),cpf_amount:12,lop_days:0,layoff_days:0,ot_hours:0,efficiency_pct:LINE_A_EFF,achieved_days:LINE_A_ACHIEVED});}

  // E2 – M15 FAIL phantom advance ₹1500
  {const e=earned(E[2],26);const inc=tkmInc(E[2],26);const epf=calcEPF(e.earned_basic,e.earned_da,e.earned_oa);const esi=calcESI(r2(e.earned_basic+e.earned_da+e.earned_oa+e.earned_hra));const totE=r2(11200+500+inc);const totD=r2(epf+esi+1500);rows.push({snapshot_id:PS.TKM_MAR,employee_id:E[2],month_year:MONTH,fixed_basic:6000,fixed_hra:1500,fixed_da:3200,fixed_oa:500,...e,attendance_bonus:500,incentive_amount:inc,staff_ot_amount:0,worker_ot_amount:0,epf_deducted:epf,esi_deducted:esi,pt_deducted:0,tds_deducted:0,loan_deducted:0,advance_deducted:1500,lwf_deducted:0,late_deducted:0,misc_deducted:0,total_earnings:totE,total_deductions:totD,net_pay:r2(totE-totD),cpf_amount:0,lop_days:0,layoff_days:0,ot_hours:0,efficiency_pct:LINE_A_EFF,achieved_days:LINE_A_ACHIEVED});}

  // E3 – 25/26 days, no bonus/incentive. totE=10000
  {const e=earned(E[3],25);const epf=calcEPF(e.earned_basic,e.earned_da,e.earned_oa);const esi=calcESI(r2(e.earned_basic+e.earned_da+e.earned_oa+e.earned_hra));const totE=r2(10000);const totD=r2(epf+esi);rows.push({snapshot_id:PS.TKM_MAR,employee_id:E[3],month_year:MONTH,fixed_basic:6000,fixed_hra:1200,fixed_da:2800,fixed_oa:400,...e,attendance_bonus:0,incentive_amount:0,staff_ot_amount:0,worker_ot_amount:0,epf_deducted:epf,esi_deducted:esi,pt_deducted:0,tds_deducted:0,loan_deducted:0,advance_deducted:0,lwf_deducted:0,late_deducted:0,misc_deducted:0,total_earnings:totE,total_deductions:totD,net_pay:r2(totE-totD),cpf_amount:0,lop_days:1,layoff_days:0,ot_hours:0,efficiency_pct:LINE_A_EFF,achieved_days:LINE_A_ACHIEVED});}

  // E4 – M06 FAIL basic+da<8800
  {const e=earned(E[4],26);const inc=tkmInc(E[4],26);const epf=calcEPF(e.earned_basic,e.earned_da,e.earned_oa);const esi=calcESI(r2(e.earned_basic+e.earned_da+e.earned_oa+e.earned_hra));const totE=r2(9500+500+inc);const totD=r2(epf+esi);rows.push({snapshot_id:PS.TKM_MAR,employee_id:E[4],month_year:MONTH,fixed_basic:5000,fixed_hra:1200,fixed_da:3000,fixed_oa:300,...e,attendance_bonus:500,incentive_amount:inc,staff_ot_amount:0,worker_ot_amount:0,epf_deducted:epf,esi_deducted:esi,pt_deducted:0,tds_deducted:0,loan_deducted:0,advance_deducted:0,lwf_deducted:0,late_deducted:0,misc_deducted:0,total_earnings:totE,total_deductions:totD,net_pay:r2(totE-totD),cpf_amount:0,lop_days:0,layoff_days:0,ot_hours:0,efficiency_pct:LINE_A_EFF,achieved_days:LINE_A_ACHIEVED});}

  // E5 – 25/26 days. M07 FAIL bonus=0. M23 FAIL +₹50. eg=(10700/26)×25=10288.46
  {const e=earned(E[5],25);const inc=tkmInc(E[5],25);const epf=calcEPF(e.earned_basic,e.earned_da,e.earned_oa);const esi=calcESI(r2(e.earned_basic+e.earned_da+e.earned_oa+e.earned_hra));const totE=r2(eg(CTC[E[5]],25)+inc);const totD=r2(epf+esi);rows.push({snapshot_id:PS.TKM_MAR,employee_id:E[5],month_year:MONTH,fixed_basic:6000,fixed_hra:1400,fixed_da:2900,fixed_oa:400,...e,attendance_bonus:0,incentive_amount:inc,staff_ot_amount:0,worker_ot_amount:0,epf_deducted:epf,esi_deducted:esi,pt_deducted:0,tds_deducted:0,loan_deducted:0,advance_deducted:0,lwf_deducted:0,late_deducted:0,misc_deducted:0,total_earnings:totE,total_deductions:totD,net_pay:r2(r2(totE-totD)+50),cpf_amount:0,lop_days:1,layoff_days:0,ot_hours:0,efficiency_pct:LINE_A_EFF,achieved_days:LINE_A_ACHIEVED});}

  // E6 – M05 FAIL: ERP uses 25 days (correct=24). wrongGross=(11200/26)×25=10769.23
  {const eW=earned(E[6],25);const wG=r2((11200/WD)*25);const epf=calcEPF(eW.earned_basic,eW.earned_da,eW.earned_oa);const esi=calcESI(r2(eW.earned_basic+eW.earned_da+eW.earned_oa+eW.earned_hra));const totE=r2(wG+500);const totD=r2(epf+esi);rows.push({snapshot_id:PS.TKM_MAR,employee_id:E[6],month_year:MONTH,fixed_basic:6000,fixed_hra:1500,fixed_da:3200,fixed_oa:500,...eW,attendance_bonus:500,incentive_amount:0,staff_ot_amount:0,worker_ot_amount:0,epf_deducted:epf,esi_deducted:esi,pt_deducted:0,tds_deducted:0,loan_deducted:0,advance_deducted:0,lwf_deducted:0,late_deducted:0,misc_deducted:0,total_earnings:totE,total_deductions:totD,net_pay:r2(totE-totD),cpf_amount:0,lop_days:1,layoff_days:0,ot_hours:0,efficiency_pct:LINE_A_EFF,achieved_days:LINE_A_ACHIEVED});}

  // E7 – M10 FAIL EPF uncapped (2040) + M14 FAIL wrong loan EMI (3000 not 5000)
  {const e=earned(E[7],26);const epfW=r2((10000+6000+1000)*0.12);const esi=calcESI(r2(e.earned_basic+e.earned_da+e.earned_oa+e.earned_hra));const inc=tkmInc(E[7],26);const totE=r2(19000+500+inc);const totD=r2(epfW+esi+3000);rows.push({snapshot_id:PS.TKM_MAR,employee_id:E[7],month_year:MONTH,fixed_basic:10000,fixed_hra:2000,fixed_da:6000,fixed_oa:1000,...e,attendance_bonus:500,incentive_amount:inc,staff_ot_amount:0,worker_ot_amount:0,epf_deducted:epfW,esi_deducted:esi,pt_deducted:0,tds_deducted:0,loan_deducted:3000,advance_deducted:0,lwf_deducted:0,late_deducted:0,misc_deducted:0,total_earnings:totE,total_deductions:totD,net_pay:r2(totE-totD),cpf_amount:0,lop_days:0,layoff_days:0,ot_hours:0,efficiency_pct:LINE_A_EFF,achieved_days:LINE_A_ACHIEVED});}

  // E8 – M15 FAIL advance pending but not deducted
  {const e=earned(E[8],26);const inc=tkmInc(E[8],26);const epf=calcEPF(e.earned_basic,e.earned_da,e.earned_oa);const esi=calcESI(r2(e.earned_basic+e.earned_da+e.earned_oa+e.earned_hra));const totE=r2(10400+300+inc);const totD=r2(epf+esi);rows.push({snapshot_id:PS.TKM_MAR,employee_id:E[8],month_year:MONTH,fixed_basic:6000,fixed_hra:1200,fixed_da:2800,fixed_oa:400,...e,attendance_bonus:300,incentive_amount:inc,staff_ot_amount:0,worker_ot_amount:0,epf_deducted:epf,esi_deducted:esi,pt_deducted:0,tds_deducted:0,loan_deducted:0,advance_deducted:0,lwf_deducted:0,late_deducted:0,misc_deducted:0,total_earnings:totE,total_deductions:totD,net_pay:r2(totE-totD),cpf_amount:0,lop_days:0,layoff_days:0,ot_hours:0,efficiency_pct:LINE_A_EFF,achieved_days:LINE_A_ACHIEVED});}

  // E9 – M21 FAIL layoff_days=1 in payroll (summary shows 2)
  {const e=earned(E[9],26);const inc=tkmInc(E[9],26);const epf=calcEPF(e.earned_basic,e.earned_da,e.earned_oa);const esi=calcESI(r2(e.earned_basic+e.earned_da+e.earned_oa+e.earned_hra));const totE=r2(10600+500+inc);const totD=r2(epf+esi);rows.push({snapshot_id:PS.TKM_MAR,employee_id:E[9],month_year:MONTH,fixed_basic:6000,fixed_hra:1300,fixed_da:2900,fixed_oa:400,...e,attendance_bonus:500,incentive_amount:inc,staff_ot_amount:0,worker_ot_amount:0,epf_deducted:epf,esi_deducted:esi,pt_deducted:0,tds_deducted:0,loan_deducted:0,advance_deducted:0,lwf_deducted:0,late_deducted:0,misc_deducted:0,total_earnings:totE,total_deductions:totD,net_pay:r2(totE-totD),cpf_amount:0,lop_days:0,layoff_days:1,ot_hours:0,efficiency_pct:LINE_A_EFF,achieved_days:LINE_A_ACHIEVED});}

  // E10 – M11 FAIL ESI=0 despite cycle enrollment
  {const e=earned(E[10],26);const inc=tkmInc(E[10],26);const epf=calcEPF(e.earned_basic,e.earned_da,e.earned_oa);const totE=r2(23000+500+inc);const totD=r2(epf+135);rows.push({snapshot_id:PS.TKM_MAR,employee_id:E[10],month_year:MONTH,fixed_basic:13000,fixed_hra:3000,fixed_da:5000,fixed_oa:2000,...e,attendance_bonus:500,incentive_amount:inc,staff_ot_amount:0,worker_ot_amount:0,epf_deducted:epf,esi_deducted:0,pt_deducted:135,tds_deducted:0,loan_deducted:0,advance_deducted:0,lwf_deducted:0,late_deducted:0,misc_deducted:0,total_earnings:totE,total_deductions:totD,net_pay:r2(totE-totD),cpf_amount:0,lop_days:0,layoff_days:0,ot_hours:0,efficiency_pct:LINE_A_EFF,achieved_days:LINE_A_ACHIEVED});}

  // E11 – OT stored as 2.45h not 2.75h. wOT(11200,2.45,26)=263.85
  {const e=earned(E[11],26);const inc=tkmInc(E[11],26);const epf=calcEPF(e.earned_basic,e.earned_da,e.earned_oa);const wot=wOT(11200,2.45);const esi=calcESI(r2(11200+wot));const totE=r2(11200+500+inc+wot);const totD=r2(epf+esi);rows.push({snapshot_id:PS.TKM_MAR,employee_id:E[11],month_year:MONTH,fixed_basic:6000,fixed_hra:1500,fixed_da:3200,fixed_oa:500,...e,attendance_bonus:500,incentive_amount:inc,staff_ot_amount:0,worker_ot_amount:wot,epf_deducted:epf,esi_deducted:esi,pt_deducted:0,tds_deducted:0,loan_deducted:0,advance_deducted:0,lwf_deducted:0,late_deducted:0,misc_deducted:0,total_earnings:totE,total_deductions:totD,net_pay:r2(totE-totD),cpf_amount:0,lop_days:0,layoff_days:0,ot_hours:2.75,efficiency_pct:LINE_A_EFF,achieved_days:LINE_A_ACHIEVED});}

  // E12 – M22 FAIL compoff 3h leaked → wOT(11200,3.0,26)=323.08
  {const e=earned(E[12],26);const inc=tkmInc(E[12],26);const epf=calcEPF(e.earned_basic,e.earned_da,e.earned_oa);const wot=wOT(11200,3.0);const esi=calcESI(r2(11200+wot));const totE=r2(11200+500+inc+wot);const totD=r2(epf+esi);rows.push({snapshot_id:PS.TKM_MAR,employee_id:E[12],month_year:MONTH,fixed_basic:6000,fixed_hra:1500,fixed_da:3200,fixed_oa:500,...e,attendance_bonus:500,incentive_amount:inc,staff_ot_amount:0,worker_ot_amount:wot,epf_deducted:epf,esi_deducted:esi,pt_deducted:0,tds_deducted:0,loan_deducted:0,advance_deducted:0,lwf_deducted:0,late_deducted:0,misc_deducted:0,total_earnings:totE,total_deductions:totD,net_pay:r2(totE-totD),cpf_amount:0,lop_days:0,layoff_days:0,ot_hours:0,efficiency_pct:LINE_A_EFF,achieved_days:LINE_A_ACHIEVED});}

  // E13 – M08 FAIL wrong 11% slab
  {const e=earned(E[13],26);const incW=kanIncW(E[13],26);const epf=calcEPF(e.earned_basic,e.earned_da,e.earned_oa);const esi=calcESI(16000);const totE=r2(16000+500+incW);const totD=r2(epf+esi);rows.push({snapshot_id:PS.KAN_MAR,employee_id:E[13],month_year:MONTH,fixed_basic:9000,fixed_hra:2000,fixed_da:4000,fixed_oa:1000,...e,attendance_bonus:500,incentive_amount:incW,staff_ot_amount:0,worker_ot_amount:0,epf_deducted:epf,esi_deducted:esi,pt_deducted:0,tds_deducted:0,loan_deducted:0,advance_deducted:0,lwf_deducted:0,late_deducted:0,misc_deducted:0,total_earnings:totE,total_deductions:totD,net_pay:r2(totE-totD),cpf_amount:0,lop_days:0,layoff_days:0,ot_hours:0,efficiency_pct:LINE_B_EFF,achieved_days:LINE_B_ACHIEVED});}

  // E14 – M08 FAIL staff incentive wrong slab
  {const e=earned(E[14],26);const incW=kanSInc(E[14],3);const totE=r2(75000+incW);const totD=r2(1800+208);rows.push({snapshot_id:PS.KAN_MAR,employee_id:E[14],month_year:MONTH,fixed_basic:45000,fixed_hra:9000,fixed_da:15000,fixed_oa:6000,...e,attendance_bonus:0,incentive_amount:incW,staff_ot_amount:0,worker_ot_amount:0,epf_deducted:1800,esi_deducted:0,pt_deducted:208,tds_deducted:0,loan_deducted:0,advance_deducted:0,lwf_deducted:0,late_deducted:0,misc_deducted:0,total_earnings:totE,total_deductions:totD,net_pay:r2(totE-totD),cpf_amount:0,lop_days:0,layoff_days:0,ot_hours:0,efficiency_pct:LINE_B_EFF,achieved_days:LINE_B_ACHIEVED});}

  // E15 – M08 FAIL + M12 FAIL PT=135 not 208
  {const e=earned(E[15],26);const incW=kanSInc(E[15],2);const totE=r2(31500+incW);const totD=r2(1800+135);rows.push({snapshot_id:PS.KAN_MAR,employee_id:E[15],month_year:MONTH,fixed_basic:20000,fixed_hra:4000,fixed_da:6000,fixed_oa:1500,...e,attendance_bonus:0,incentive_amount:incW,staff_ot_amount:0,worker_ot_amount:0,epf_deducted:1800,esi_deducted:0,pt_deducted:135,tds_deducted:0,loan_deducted:0,advance_deducted:0,lwf_deducted:0,late_deducted:0,misc_deducted:0,total_earnings:totE,total_deductions:totD,net_pay:r2(totE-totD),cpf_amount:0,lop_days:0,layoff_days:0,ot_hours:0,efficiency_pct:LINE_B_EFF,achieved_days:LINE_B_ACHIEVED});}

  // E16 – M09 PASS staff OT ₹700
  {const e=earned(E[16],26);const incW=kanSInc(E[16],2);const totE=r2(24000+incW+700);const totD=r2(1800+135);rows.push({snapshot_id:PS.KAN_MAR,employee_id:E[16],month_year:MONTH,fixed_basic:15000,fixed_hra:3000,fixed_da:5000,fixed_oa:1000,...e,attendance_bonus:0,incentive_amount:incW,staff_ot_amount:700,worker_ot_amount:0,epf_deducted:1800,esi_deducted:0,pt_deducted:135,tds_deducted:0,loan_deducted:0,advance_deducted:0,lwf_deducted:0,late_deducted:0,misc_deducted:0,total_earnings:totE,total_deductions:totD,net_pay:r2(totE-totD),cpf_amount:0,lop_days:0,layoff_days:0,ot_hours:10.5,efficiency_pct:LINE_B_EFF,achieved_days:LINE_B_ACHIEVED});}

  // E17 – M16 FAIL late ded=300 (correct=24000/26/2=461.54)
  {const e=earned(E[17],26);const incW=kanSInc(E[17],2);const totE=r2(24000+incW);const totD=r2(1800+135+300);rows.push({snapshot_id:PS.KAN_MAR,employee_id:E[17],month_year:MONTH,fixed_basic:15000,fixed_hra:3000,fixed_da:5000,fixed_oa:1000,...e,attendance_bonus:0,incentive_amount:incW,staff_ot_amount:0,worker_ot_amount:0,epf_deducted:1800,esi_deducted:0,pt_deducted:135,tds_deducted:0,loan_deducted:0,advance_deducted:0,lwf_deducted:0,late_deducted:300,misc_deducted:0,total_earnings:totE,total_deductions:totD,net_pay:r2(totE-totD),cpf_amount:0,lop_days:0,layoff_days:0,ot_hours:0,efficiency_pct:LINE_B_EFF,achieved_days:LINE_B_ACHIEVED});}

  // E18 – M16 PASS full-day ded=24000/26=923.08
  {const e=earned(E[18],26);const incW=kanSInc(E[18],2);const fdd=r2(24000/WD);const totE=r2(24000+incW);const totD=r2(1800+135+fdd);rows.push({snapshot_id:PS.KAN_MAR,employee_id:E[18],month_year:MONTH,fixed_basic:15000,fixed_hra:3000,fixed_da:5000,fixed_oa:1000,...e,attendance_bonus:0,incentive_amount:incW,staff_ot_amount:0,worker_ot_amount:0,epf_deducted:1800,esi_deducted:0,pt_deducted:135,tds_deducted:0,loan_deducted:0,advance_deducted:0,lwf_deducted:0,late_deducted:fdd,misc_deducted:0,total_earnings:totE,total_deductions:totD,net_pay:r2(totE-totD),cpf_amount:0,lop_days:0,layoff_days:0,ot_hours:0,efficiency_pct:LINE_B_EFF,achieved_days:LINE_B_ACHIEVED});}

  // E19 – M09 FAIL staff OT ₹600 (should be ₹1050). permDed=25500/26/8×0.5=61.06
  {const e=earned(E[19],26);const incW=kanSInc(E[19],2);const pd=r2(25500/WD/8*0.5);const totE=r2(25500+incW+600);const totD=r2(1800+135+pd);rows.push({snapshot_id:PS.KAN_MAR,employee_id:E[19],month_year:MONTH,fixed_basic:16000,fixed_hra:3000,fixed_da:5500,fixed_oa:1000,...e,attendance_bonus:0,incentive_amount:incW,staff_ot_amount:600,worker_ot_amount:0,epf_deducted:1800,esi_deducted:0,pt_deducted:135,tds_deducted:0,loan_deducted:0,advance_deducted:0,lwf_deducted:0,late_deducted:pd,misc_deducted:0,total_earnings:totE,total_deductions:totD,net_pay:r2(totE-totD),cpf_amount:0,lop_days:0,layoff_days:0,ot_hours:16.5,efficiency_pct:LINE_B_EFF,achieved_days:LINE_B_ACHIEVED});}

  // E20 – EL consumed D03
  {const e=earned(E[20],26);const incW=kanSInc(E[20],2);const esi=calcESI(20800);const totE=r2(20800+incW);const totD=r2(1800+esi);rows.push({snapshot_id:PS.KAN_MAR,employee_id:E[20],month_year:MONTH,fixed_basic:13000,fixed_hra:2500,fixed_da:4500,fixed_oa:800,...e,attendance_bonus:0,incentive_amount:incW,staff_ot_amount:0,worker_ot_amount:0,epf_deducted:1800,esi_deducted:esi,pt_deducted:0,tds_deducted:0,loan_deducted:0,advance_deducted:0,lwf_deducted:0,late_deducted:0,misc_deducted:0,total_earnings:totE,total_deductions:totD,net_pay:r2(totE-totD),cpf_amount:0,lop_days:0,layoff_days:0,ot_hours:0,efficiency_pct:LINE_B_EFF,achieved_days:LINE_B_ACHIEVED});}

  // E21 – full month (joined Feb 16). WARN M10 no UAN. earnedGross=11200
  {const pd=WD;const e=earned(E[21],pd);const epf=r2((e.earned_basic+e.earned_da+e.earned_oa)*0.12);const esi=calcESI(r2(e.earned_basic+e.earned_da+e.earned_oa+e.earned_hra));const eG=r2((11200/WD)*pd);rows.push({snapshot_id:PS.KAN_MAR,employee_id:E[21],month_year:MONTH,fixed_basic:6000,fixed_hra:1500,fixed_da:3200,fixed_oa:500,...e,attendance_bonus:0,incentive_amount:0,staff_ot_amount:0,worker_ot_amount:0,epf_deducted:epf,esi_deducted:esi,pt_deducted:0,tds_deducted:0,loan_deducted:0,advance_deducted:0,lwf_deducted:0,late_deducted:0,misc_deducted:0,total_earnings:eG,total_deductions:r2(epf+esi),net_pay:r2(eG-epf-esi),cpf_amount:0,lop_days:0,layoff_days:0,ot_hours:0,efficiency_pct:0,achieved_days:0});}

  // E22 – M20 PASS present on holiday Mar 10. M08 FAIL 11% slab
  {const e=earned(E[22],26);const incW=kanIncW(E[22],26);const epf=calcEPF(e.earned_basic,e.earned_da,e.earned_oa);const esi=calcESI(11200);const totE=r2(11200+500+incW);const totD=r2(epf+esi);rows.push({snapshot_id:PS.KAN_MAR,employee_id:E[22],month_year:MONTH,fixed_basic:6000,fixed_hra:1500,fixed_da:3200,fixed_oa:500,...e,attendance_bonus:500,incentive_amount:incW,staff_ot_amount:0,worker_ot_amount:0,epf_deducted:epf,esi_deducted:esi,pt_deducted:0,tds_deducted:0,loan_deducted:0,advance_deducted:0,lwf_deducted:0,late_deducted:0,misc_deducted:0,total_earnings:totE,total_deductions:totD,net_pay:r2(totE-totD),cpf_amount:0,lop_days:0,layoff_days:0,ot_hours:0,efficiency_pct:LINE_B_EFF,achieved_days:LINE_B_ACHIEVED});}

  // E23 – M20 FAIL absent on holiday Mar 10. 25/26 days. eG=(9800/26)×25=9423.08
  {const e=earned(E[23],25);const incW=kanIncW(E[23],25);const epf=calcEPF(e.earned_basic,e.earned_da,e.earned_oa);const eG=r2((9800/WD)*25);const esi=calcESI(eG);const totE=r2(eG+incW);const totD=r2(epf+esi);rows.push({snapshot_id:PS.KAN_MAR,employee_id:E[23],month_year:MONTH,fixed_basic:5500,fixed_hra:1200,fixed_da:2800,fixed_oa:300,...e,attendance_bonus:0,incentive_amount:incW,staff_ot_amount:0,worker_ot_amount:0,epf_deducted:epf,esi_deducted:esi,pt_deducted:0,tds_deducted:0,loan_deducted:0,advance_deducted:0,lwf_deducted:0,late_deducted:0,misc_deducted:0,total_earnings:totE,total_deductions:totD,net_pay:r2(totE-totD),cpf_amount:0,lop_days:1,layoff_days:0,ot_hours:0,efficiency_pct:LINE_B_EFF,achieved_days:LINE_B_ACHIEVED});}

  // E24 – M18 FAIL deductions>50% earned
  {const e=earned(E[24],26);const incW=kanIncW(E[24],26);const epf=calcEPF(e.earned_basic,e.earned_da,e.earned_oa);const esi=calcESI(12500);const totE=r2(12500+500+incW);const totD=r2(epf+esi+5000);rows.push({snapshot_id:PS.KAN_MAR,employee_id:E[24],month_year:MONTH,fixed_basic:7000,fixed_hra:1500,fixed_da:3500,fixed_oa:500,...e,attendance_bonus:500,incentive_amount:incW,staff_ot_amount:0,worker_ot_amount:0,epf_deducted:epf,esi_deducted:esi,pt_deducted:0,tds_deducted:0,loan_deducted:5000,advance_deducted:0,lwf_deducted:0,late_deducted:0,misc_deducted:0,total_earnings:totE,total_deductions:totD,net_pay:r2(totE-totD),cpf_amount:0,lop_days:0,layoff_days:0,ot_hours:0,efficiency_pct:LINE_B_EFF,achieved_days:LINE_B_ACHIEVED});}

  // E25 Jothi – M08 scope FAIL Ironer paid production incentive
  {const e=earned(E[25],26);const incW=kanIncW(E[25],26);const epf=calcEPF(e.earned_basic,e.earned_da,e.earned_oa);const eG=eg(CTC[E[25]],26);const esi=calcESI(eG);const totE=r2(eG+500+incW);const totD=r2(epf+esi);rows.push({snapshot_id:PS.KAN_MAR,employee_id:E[25],month_year:MONTH,fixed_basic:7000,fixed_hra:1400,fixed_da:3000,fixed_oa:400,...e,attendance_bonus:500,incentive_amount:incW,staff_ot_amount:0,worker_ot_amount:0,epf_deducted:epf,esi_deducted:esi,pt_deducted:0,tds_deducted:0,loan_deducted:0,advance_deducted:0,lwf_deducted:0,late_deducted:0,misc_deducted:0,total_earnings:totE,total_deductions:totD,net_pay:r2(totE-totD),cpf_amount:0,lop_days:0,layoff_days:0,ot_hours:0,efficiency_pct:LINE_B_EFF,achieved_days:LINE_B_ACHIEVED});}

  // E26 Pandian – M07 FAIL bonus paid despite 2 lates. M08 FAIL incentive paid
  {const e=earned(E[26],26);const incW=tkmInc(E[26],26);const epf=calcEPF(e.earned_basic,e.earned_da,e.earned_oa);const eG=eg(CTC[E[26]],26);const esi=calcESI(eG);const totE=r2(eG+500+incW);const totD=r2(epf+esi);rows.push({snapshot_id:PS.TKM_MAR,employee_id:E[26],month_year:MONTH,fixed_basic:6000,fixed_hra:1500,fixed_da:3200,fixed_oa:500,...e,attendance_bonus:500,incentive_amount:incW,staff_ot_amount:0,worker_ot_amount:0,epf_deducted:epf,esi_deducted:esi,pt_deducted:0,tds_deducted:0,loan_deducted:0,advance_deducted:0,lwf_deducted:0,late_deducted:0,misc_deducted:0,total_earnings:totE,total_deductions:totD,net_pay:r2(totE-totD),cpf_amount:0,lop_days:0,layoff_days:0,ot_hours:0,efficiency_pct:LINE_A_EFF,achieved_days:LINE_A_ACHIEVED});}

  // E27 Ramu – M10 FAIL epf_opted_in=false but EPF=1164 deducted (should be 0)
  {const e=earned(E[27],26);const inc=tkmInc(E[27],26);const epfW=r2((e.earned_basic+e.earned_da+e.earned_oa)*0.12);const esi=calcESI(r2(e.earned_basic+e.earned_da+e.earned_oa+e.earned_hra));const eG=eg(CTC[E[27]],26);const totE=r2(eG+500+inc);const totD=r2(epfW+esi);rows.push({snapshot_id:PS.TKM_MAR,employee_id:E[27],month_year:MONTH,fixed_basic:6000,fixed_hra:1500,fixed_da:3200,fixed_oa:500,...e,attendance_bonus:500,incentive_amount:inc,staff_ot_amount:0,worker_ot_amount:0,epf_deducted:epfW,esi_deducted:esi,pt_deducted:0,tds_deducted:0,loan_deducted:0,advance_deducted:0,lwf_deducted:0,late_deducted:0,misc_deducted:0,total_earnings:totE,total_deductions:totD,net_pay:r2(totE-totD),cpf_amount:0,lop_days:0,layoff_days:0,ot_hours:0,efficiency_pct:LINE_A_EFF,achieved_days:LINE_A_ACHIEVED});}

  // E28 Preethi – D04/M16 FAIL: 3rd late undeducted. Correct=20800/26/2=400. ERP=0
  {const e=earned(E[28],26);const incW=kanSInc(E[28],2);const epf=1800;const esi=calcESI(20800);const totE=r2(20800+incW);const totD=r2(epf+esi);rows.push({snapshot_id:PS.KAN_MAR,employee_id:E[28],month_year:MONTH,fixed_basic:13000,fixed_hra:2500,fixed_da:4500,fixed_oa:800,...e,attendance_bonus:0,incentive_amount:incW,staff_ot_amount:0,worker_ot_amount:0,epf_deducted:epf,esi_deducted:esi,pt_deducted:0,tds_deducted:0,loan_deducted:0,advance_deducted:0,lwf_deducted:0,late_deducted:0,misc_deducted:0,total_earnings:totE,total_deductions:totD,net_pay:r2(totE-totD),cpf_amount:0,lop_days:0,layoff_days:0,ot_hours:0,efficiency_pct:LINE_B_EFF,achieved_days:LINE_B_ACHIEVED});}

  // E29 Selvi – M21 FAIL layoff pay at full-day rate. 23/26 days (26-3 layoff).
  // wrongLayoffPay=11200/26×3=1292.31. correctLayoffPay=11200/26/2×3=646.15
  {const pd=23;const e=earned(E[29],pd);const incW=kanIncW(E[29],pd);const epf=calcEPF(e.earned_basic,e.earned_da,e.earned_oa);const esi=calcESI(r2(e.earned_basic+e.earned_da+e.earned_oa+e.earned_hra));const wLP=r2(11200/WD*3);const totE=r2(eg(CTC[E[29]],pd)+wLP+incW);const totD=r2(epf+esi);rows.push({snapshot_id:PS.KAN_MAR,employee_id:E[29],month_year:MONTH,fixed_basic:6000,fixed_hra:1500,fixed_da:3200,fixed_oa:500,...e,attendance_bonus:0,incentive_amount:incW,staff_ot_amount:0,worker_ot_amount:0,epf_deducted:epf,esi_deducted:esi,pt_deducted:0,tds_deducted:0,loan_deducted:0,advance_deducted:0,lwf_deducted:0,late_deducted:0,misc_deducted:0,total_earnings:totE,total_deductions:totD,net_pay:r2(totE-totD),cpf_amount:0,lop_days:0,layoff_days:3,ot_hours:0,efficiency_pct:LINE_B_EFF,achieved_days:LINE_B_ACHIEVED});}

  // E30 Anand – M13 WARN annual ~₹12.84L, tds=0
  {const e=earned(E[30],26);const incW=kanSInc(E[30],2);const totE=r2(107000+incW);const totD=r2(1800+208);rows.push({snapshot_id:PS.KAN_MAR,employee_id:E[30],month_year:MONTH,fixed_basic:65000,fixed_hra:12000,fixed_da:22000,fixed_oa:8000,...e,attendance_bonus:0,incentive_amount:incW,staff_ot_amount:0,worker_ot_amount:0,epf_deducted:1800,esi_deducted:0,pt_deducted:208,tds_deducted:0,loan_deducted:0,advance_deducted:0,lwf_deducted:0,late_deducted:0,misc_deducted:0,total_earnings:totE,total_deductions:totD,net_pay:r2(totE-totD),cpf_amount:0,lop_days:0,layoff_days:0,ot_hours:0,efficiency_pct:LINE_B_EFF,achieved_days:LINE_B_ACHIEVED});}

  await ins('payroll_records',rows,`payroll_records Mar 2026 (${rows.length} rows)`);
}

async function seedPayrollRecordsDec() {
  const WD_DEC=22;
  const decRow=(snapId,empId,pd,lwf)=>{const c=CTC[empId];const fg=g(c);const eg_=r2((fg/WD_DEC)*pd);const eb=r2((c.basic/WD_DEC)*pd);const ehra=r2((c.hra/WD_DEC)*pd);const eda=r2((c.da/WD_DEC)*pd);const eoa=r2((c.oa/WD_DEC)*pd);const epf=calcEPF(eb,eda,eoa);const esi=eg_<=21000?calcESI(eg_):0;const pt=calcPT(eg_);const totD=r2(epf+esi+pt+lwf);return{snapshot_id:snapId,employee_id:empId,month_year:DEC_MONTH,fixed_basic:c.basic,fixed_hra:c.hra,fixed_da:c.da,fixed_oa:c.oa,earned_basic:eb,earned_hra:ehra,earned_da:eda,earned_oa:eoa,attendance_bonus:0,incentive_amount:0,staff_ot_amount:0,worker_ot_amount:0,epf_deducted:epf,esi_deducted:esi,pt_deducted:pt,tds_deducted:0,loan_deducted:0,advance_deducted:0,lwf_deducted:lwf,late_deducted:0,misc_deducted:0,total_earnings:eg_,total_deductions:totD,net_pay:r2(eg_-totD),cpf_amount:0,lop_days:0,layoff_days:0,ot_hours:0,efficiency_pct:0,achieved_days:0};};
  const rows=[decRow(PS.TKM_DEC,E[1],22,20),decRow(PS.TKM_DEC,E[7],22,0),decRow(PS.TKM_DEC,E[11],22,25),decRow(PS.KAN_DEC,E[13],22,20),decRow(PS.KAN_DEC,E[14],22,0)];
  await ins('payroll_records',rows,`payroll_records Dec 2025 A24 LWF (${rows.length} rows)`);
}

async function seedLineProductionData() {
  await ins('line_production_data',[
    {factory_id:F1,month_year:MONTH,line_name:'Line A',style_number:'ST-2026-001',sam:25,total_tailors:LINE_A_TAILORS,present_tailors:LINE_A_PRESENT,planned_days:WD,achieved_days:LINE_A_ACHIEVED,production_qty:3200,efficiency_pct:LINE_A_EFF,incentive_type:'production',notes:'TKM Line A 88% → slab 17% M08 PASS'},
    {factory_id:F2,month_year:MONTH,line_name:'Line B',style_number:'ST-2026-002',sam:25,total_tailors:LINE_B_TAILORS,present_tailors:LINE_B_PRESENT,planned_days:WD,achieved_days:LINE_B_ACHIEVED,production_qty:2500,efficiency_pct:LINE_B_EFF,incentive_type:'production',notes:'Kandigai Line B 78% correct 8.5%; ERP used 11% → M08 FAIL'},
    {factory_id:F2,month_year:MONTH,line_name:'Finishing',style_number:null,sam:0,total_tailors:0,present_tailors:0,planned_days:WD,achieved_days:18,production_qty:0,efficiency_pct:null,incentive_type:'finishing',notes:'E25 Jothi (Ironer) must NOT get production incentive'},
  ],'line_production_data');
}

async function seedPerformanceBonusAccrual() {
  const RATE=0.0833;const acc=(w,wd,d)=>r2((w/wd)*d*RATE);const rows=[];
  const w1=g(CTC[E[1]]);
  rows.push({employee_id:E[1],month_year:'2025-10',bonus_period:'OCT_MAR',employee_wage:w1,working_days:22,days_present:22,bonus_rate:RATE,accrued_amount:acc(w1,22,22)});
  rows.push({employee_id:E[1],month_year:'2025-11',bonus_period:'OCT_MAR',employee_wage:w1,working_days:21,days_present:21,bonus_rate:RATE,accrued_amount:acc(w1,21,21)});
  rows.push({employee_id:E[1],month_year:'2025-12',bonus_period:'OCT_MAR',employee_wage:w1,working_days:22,days_present:22,bonus_rate:RATE,accrued_amount:acc(w1,22,22)});
  const w9=g(CTC[E[9]]);
  rows.push({employee_id:E[9],month_year:'2025-10',bonus_period:'OCT_MAR',employee_wage:w9,working_days:22,days_present:20,bonus_rate:RATE,accrued_amount:acc(w9,22,20)}); // FAIL A25
  rows.push({employee_id:E[9],month_year:'2025-11',bonus_period:'OCT_MAR',employee_wage:w9,working_days:21,days_present:21,bonus_rate:RATE,accrued_amount:acc(w9,21,21)});
  rows.push({employee_id:E[9],month_year:'2025-12',bonus_period:'OCT_MAR',employee_wage:w9,working_days:22,days_present:22,bonus_rate:RATE,accrued_amount:acc(w9,22,22)});
  const w5=g(CTC[E[5]]);
  rows.push({employee_id:E[5],month_year:'2025-12',bonus_period:'OCT_MAR',employee_wage:w5,working_days:22,days_present:22,bonus_rate:0.10,accrued_amount:r2((w5/22)*22*0.10)}); // FAIL A25
  await ins('performance_bonus_accrual',rows,`performance_bonus_accrual (${rows.length} rows)`);
}

async function seedReconciliationUploads() {
  // TKM EPF: E1:1164 E2:1164 E3:1061.54 E4:996 E5:1073.08 E6:1119.23(ERP 25d)
  //          E7:2040(uncapped) E8:1104 E9:1116 E10:1800 E11:1164 E12:1164 E26:1164 E27:1164
  const TKM_SYS_EPF=r2(1164+1164+1061.54+996+1073.08+1119.23+2040+1104+1116+1800+1164+1164+1164+1164);
  // KAN EPF: E13:1680 E14-E19:1800ea E20:1800 E21:1164(full) E22:1164 E23:992.31 E24:1320
  //          E25:1248 E28:1800 E29:976.62(23d) E30:1800
  const KAN_SYS_EPF=r2(1680+1800+1800+1800+1800+1800+1800+1800+1164+1164+992.31+1320+1248+1800+976.62+1800);
  // TKM ESI: E1:84 E2:84 E3:75 E4:71.25 E5:77.16 E6:80.77(wG10769.23) E7:142.5
  //          E8:78 E9:79.5 E10:0(FAIL) E11:85.98(11463.85) E12:86.42(11523.08) E26:84 E27:84
  const TKM_SYS_ESI=r2(84+84+75+71.25+77.16+80.77+142.5+78+79.5+0+85.98+86.42+84+84);
  // KAN ESI: E13:120 E14-E19:0 E20:156 E21:84(full) E22:84 E23:70.67 E24:93.75
  //          E25:88.5 E28:156 E29:74.31(23d) E30:0
  const KAN_SYS_ESI=r2(120+0+0+0+0+0+0+156+84+84+70.67+93.75+88.5+156+74.31+0);

  await ins('reconciliation_uploads',[
    {factory_id:F1,month_year:MONTH,file_type:'EPFO_ECR',storage_path:'reconciliation/2026-03/tkm_ecr_mar2026.txt',total_amount:TKM_SYS_EPF,status:'PENDING',notes:'TKM V EPFO ECR Mar 2026 – matches system → A27 PASS'},
    {factory_id:F2,month_year:MONTH,file_type:'EPFO_ECR',storage_path:'reconciliation/2026-03/kan_ecr_mar2026.txt',total_amount:r2(KAN_SYS_EPF-500),status:'PENDING',notes:'Kandigai EPFO ECR Mar 2026 – ₹500 short → A27 FAIL CRITICAL'},
    {factory_id:F1,month_year:MONTH,file_type:'ESIC_CHALLAN',storage_path:'reconciliation/2026-03/tkm_esic_mar2026.pdf',total_amount:TKM_SYS_ESI,status:'PENDING',notes:'TKM V ESIC Challan Mar 2026 – matches → A27 PASS'},
    {factory_id:F2,month_year:MONTH,file_type:'ESIC_CHALLAN',storage_path:'reconciliation/2026-03/kan_esic_mar2026.pdf',total_amount:KAN_SYS_ESI,status:'PENDING',notes:'Kandigai ESIC Challan Mar 2026 – matches → A27 PASS'},
  ],'reconciliation_uploads');
}

async function seedUserProfiles() {
  console.log('  ⚠  user_profiles skipped — create via Supabase Auth dashboard first.');
}

async function main() {
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('  MAGNUM PAYROLL — COMBINED SEEDER v2  (Mar 2026 primary month)');
  console.log('══════════════════════════════════════════════════════════════');
  console.log(`  Supabase URL : ${process.env.SUPABASE_URL}`);
  console.log(`  Audit month  : Mar 2026 (WD=${WD}, 31 days, ${SUNDAYS} Sundays)`);
  console.log(`  Dec month    : Dec 2025 (A24 LWF test)`);
  console.log('══════════════════════════════════════════════════════════════\n');
  const steps=[
    ['System Config',seedSystemConfig],['Factories',seedFactories],['Shifts',seedShifts],
    ['Employees (30)',seedEmployees],['Employee Shifts',seedEmployeeShifts],['CTC Records',seedCtcRecords],
    ['Minimum Wages',seedMinimumWages],['Holiday Calendar',seedHolidayCalendar],['Incentive Slabs',seedIncentiveSlabs],
    ['Attendance Bonus Config',seedAttendanceBonusConfig],['Perf Bonus Config',seedPerformanceBonusConfig],
    ['Loan Ledger',seedLoanLedger],['Advance Ledger',seedAdvanceLedger],['EL Balance',seedElBalance],
    ['Compoff Ledger',seedCompoffLedger],['ESI Cycle Enrollment',seedEsiCycleEnrollment],
    ['Payroll Snapshots',seedPayrollSnapshots],
    ['Savior Raw Punches',seedSaviorRawPunches],['Attendance Processed',seedAttendanceProcessed],
    ['Monthly Att Summary',seedMonthlyAttendanceSummary],['Payroll Records Mar 2026',seedPayrollRecords],
    ['Payroll Records Dec 2025',seedPayrollRecordsDec],['Line Production Data',seedLineProductionData],
    ['Perf Bonus Accrual',seedPerformanceBonusAccrual],['Reconciliation Uploads',seedReconciliationUploads],
    ['User Profiles',seedUserProfiles],
  ];
  let passed=0,failed=0;
  for(const[label,fn]of steps){
    process.stdout.write(`\n[${String(passed+failed+1).padStart(2,'0')}] ${label} ... `);
    try{await fn();passed++;}catch(err){console.error(`\n     ERROR: ${err.message}`);failed++;if(['Factories','Employees (30)'].includes(label)){console.error('  ⚠  Foundational table failed – aborting.');break;}}
  }
  console.log('\n\n══════════════════════════════════════════════════════════════');
  console.log(`  DONE  ✓ ${passed} sections passed  ✗ ${failed} sections failed`);
  console.log('══════════════════════════════════════════════════════════════');
  if(failed===0)console.log('\n  ✅  All mock data seeded. Run n8n workflows to generate check_results.\n');
  else{console.log('\n  ⚠  Some sections failed. Review errors above.\n');process.exit(1);}
}
main().catch(err=>{console.error('\nFatal:',err);process.exit(1);});