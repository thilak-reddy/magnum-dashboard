#!/usr/bin/env node
// =============================================================================
// MAGNUM PAYROLL — COMBINED SEEDER v2  (gap-coverage additions integrated)
// =============================================================================
// Usage: SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> node seeder_combined_v2.js
//
// Covers:  All 27 modules  D01–D04 | M05–M23 | A24–A27
// Dataset: 30 employees × 2 factories  (original 26 + E27–E30)
//          Feb 2026 = primary audit month
//          Dec 2025 = A24 (Labour Welfare Fund) test month
//          Jan 2026 = E6 long absenteeism (D03 alert)
//          Mar 17–19 2026 = daily savior punch data (D01–D04)
//          Oct–Dec 2025 = performance bonus accrual (A25)
//
// ── v2 ADDITIONS ─────────────────────────────────────────────────────────────
//   E27 Ramu K   (Tailor, TKM V, epf_opted_in=false)
//     → M10 FAIL: EPF wrongly deducted despite opt-out
//     → D01 FAIL: Mar 17 punch has normal_hrs=5.5 (actual 8.5h → round-off breach)
//   E28 Preethi A (IE, Kandigai, staff)
//     → D04 FAIL: 3 lates in Mar 17-19; pool (2h/2 days) exhausted after 2 days;
//                 3rd late still marked PERMISSION in attendance_processed (wrong)
//   E29 Selvi K  (Tailor, Kandigai, worker)
//     → M21 FAIL: layoff_days=3 (count matches), but ERP used full-day rate
//                 instead of half-day → overpayment
//   E30 Anand R  (HR Manager, Kandigai, staff)
//     → M13 WARN: annual income ~₹12.84L (>₹12L threshold), tds_deducted=0
//   Feb OT punch rows added for E16 (2 days ×5.5h) and E19 (3 days ×5.5h)
//     → M09 qualifying-day validation can now run from raw punch data
//
// Every section that writes a deliberate error is labelled:
//   ── FAIL: Mxx – <reason>
//   ── WARN: Mxx – <reason>
//   ── PASS: Mxx – clean case
// =============================================================================

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const sb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// ─────────────────────────────────────────────────────────────────────────────
// FIXED IDs  (all FKs resolved statically – never use gen_random_uuid here)
// ─────────────────────────────────────────────────────────────────────────────

const F1  = 'f1111111-1111-1111-1111-111111111111'; // TKM V       (C zone)
const F2  = 'f2222222-2222-2222-2222-222222222222'; // Kandigai    (C zone)

const SH1 = 'aaaa0001-0000-0000-0000-000000000000'; // TKM V shift
const SH2 = 'aaaa0002-0000-0000-0000-000000000000'; // Kandigai shift

// E[1]–E[12] = TKM V | E[13]–E[25] = Kandigai | E[26] = TKM | E[27]–E[30] = v2
const E = {};
for (let i = 1; i <= 30; i++) {
  E[i] = `bbbb${String(i).padStart(4, '0')}-0000-0000-0000-000000000000`;
}

// Payroll snapshots
const PS = {
  TKM_FEB: 'cccc0001-0000-0000-0000-000000000000',
  KAN_FEB: 'cccc0002-0000-0000-0000-000000000000',
  TKM_DEC: 'cccc0003-0000-0000-0000-000000000000',
  KAN_DEC: 'cccc0004-0000-0000-0000-000000000000',
};

// Ledger entries
const LOAN_E7  = 'dddd0001-0000-0000-0000-000000000000';
const LOAN_E24 = 'dddd0002-0000-0000-0000-000000000000';
const ADV_E8   = 'eeee0001-0000-0000-0000-000000000000';
const CO_E12   = 'eeee0002-0000-0000-0000-000000000000';
const CO_E9    = 'eeee0003-0000-0000-0000-000000000000';

// Lines
const LINE_TKM_A   = 'l1aa0001-0000-0000-0000-000000000000';
const LINE_KAN_B   = 'l1bb0001-0000-0000-0000-000000000000';
const LINE_KAN_FIN = 'l1bb0002-0000-0000-0000-000000000000';

// ─────────────────────────────────────────────────────────────────────────────
// BUSINESS CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const MONTH     = '2026-02';
const DEC_MONTH = '2025-12';
const WD        = 22;
const SUNDAYS   = 4;

const LINE_A_EFF      = 88;
const LINE_A_IPCT     = 17;
const LINE_A_ACHIEVED = 20;
const LINE_A_TAILORS  = 12;
const LINE_A_PRESENT  = 11;

const LINE_B_EFF          = 78;
const LINE_B_IPCT_CORRECT = 8.5;
const LINE_B_IPCT_WRONG   = 11;
const LINE_B_ACHIEVED     = 20;
const LINE_B_TAILORS      = 10;
const LINE_B_PRESENT      = 9;

// ─────────────────────────────────────────────────────────────────────────────
// MATHS HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const r2 = (v) => Math.round(v * 100) / 100;

function g(c)             { return c.basic + c.hra + c.da + c.oa; }
function eg(c, p, wd=WD)  { return r2((g(c) / wd) * p); }
function ec(x, p, wd=WD)  { return r2((x / wd) * p); }

function calcEPF(eb, eda, eoa) {
  const base = eb + eda + eoa;
  return base > 15000 ? 1800 : r2(base * 0.12);
}

function calcESI(base) { return r2(base * 0.0075); }

function calcPT(earnedGross) {
  if (earnedGross <= 21000) return 0;
  if (earnedGross <= 30000) return 135;
  return 208;
}

function wOT(fixedGross, otHrs, wd=WD) {
  return r2((fixedGross / wd / 8) * 2 * otHrs);
}

function wInc(earnedGross, pct, achieved, wd=WD) {
  return r2((earnedGross / wd) * (pct / 100) * achieved);
}

function sInc(fixedGross, tot, pres, pct, achieved, mult, wd=WD) {
  return r2((fixedGross / tot) * (pres / wd) * (pct / 100) * achieved * mult);
}

// ─────────────────────────────────────────────────────────────────────────────
// CTC DEFINITIONS   (effective_from = 2025-04-01)
// ─────────────────────────────────────────────────────────────────────────────

const CTC = {
  // ── TKM V Workers  (E1–E12) ────────────────────────────────────────────────
  [E[1]]:  { basic:  6000, hra: 1500, da: 3200, oa:  500 }, // Rajan     – M13 FAIL: TDS wrongly deducted
  [E[2]]:  { basic:  6000, hra: 1500, da: 3200, oa:  500 }, // Murugan   – M15 FAIL: phantom advance
  [E[3]]:  { basic:  6000, hra: 1200, da: 2800, oa:  400 }, // Karthik   – 1 late @2h1m (over)
  [E[4]]:  { basic:  5000, hra: 1200, da: 3000, oa:  300 }, // Selvam    – M06 FAIL: basic+da=8000 < 8800 min
  [E[5]]:  { basic:  6000, hra: 1400, da: 2900, oa:  400 }, // Anbu      – 1 absent 0 late
  [E[6]]:  { basic:  6000, hra: 1500, da: 3200, oa:  500 }, // Lakshmi   – 2 absent, long absenteeism Jan
  [E[7]]:  { basic: 10000, hra: 2000, da: 6000, oa: 1000 }, // Sujatha   – loan + EPF cap
  [E[8]]:  { basic:  6000, hra: 1200, da: 2800, oa:  400 }, // Karpakam  – salary advance
  [E[9]]:  { basic:  6000, hra: 1300, da: 2900, oa:  400 }, // Palani    – layoff days
  [E[10]]: { basic: 13000, hra: 3000, da: 5000, oa: 2000 }, // Meena     – ESI cycle boundary
  [E[11]]: { basic:  6000, hra: 1500, da: 3200, oa:  500 }, // Balu      – OT minutes conversion
  [E[12]]: { basic:  6000, hra: 1500, da: 3200, oa:  500 }, // Kamatchi  – compoff leakage into OT
  // ── Kandigai  (E13–E24) ─────────────────────────────────────────────────────
  [E[13]]: { basic:  9000, hra: 2000, da: 4000, oa: 1000 }, // Priya     – M08 FAIL (wrong slab)
  [E[14]]: { basic: 45000, hra: 9000, da:15000, oa: 6000 }, // Suresh    – M08 FAIL
  [E[15]]: { basic: 20000, hra: 4000, da: 6000, oa: 1500 }, // Ramesh    – M08 FAIL + M12 FAIL
  [E[16]]: { basic: 15000, hra: 3000, da: 5000, oa: 1000 }, // Vijaya    – M09 PASS: staff OT ₹700
  [E[17]]: { basic: 15000, hra: 3000, da: 5000, oa: 1000 }, // Nalini    – 9:15 half-day, M16 FAIL
  [E[18]]: { basic: 15000, hra: 3000, da: 5000, oa: 1000 }, // Mani      – 9:35 full-day; A26 encashment FAIL
  [E[19]]: { basic: 16000, hra: 3000, da: 5500, oa: 1000 }, // Deepa     – M09 FAIL: staff OT ₹600 vs ₹1050
  [E[20]]: { basic: 13000, hra: 2500, da: 4500, oa:  800 }, // Kavitha   – EL before LOP (D03)
  [E[21]]: { basic:  6000, hra: 1500, da: 3200, oa:  500 }, // Gopal     – new joiner Feb 16
  [E[22]]: { basic:  6000, hra: 1500, da: 3200, oa:  500 }, // Saroja    – present on holiday
  [E[23]]: { basic:  5500, hra: 1200, da: 2800, oa:  300 }, // Kumar     – absent on holiday, M20 FAIL
  [E[24]]: { basic:  7000, hra: 1500, da: 3500, oa:  500 }, // Ravi      – 50% deduction cap breach M18
  // ── Patch v1 employees ───────────────────────────────────────────────────────
  [E[25]]: { basic:  7000, hra: 1400, da: 3000, oa:  400 }, // Jothi     – M08 scope FAIL
  [E[26]]: { basic:  6000, hra: 1500, da: 3200, oa:  500 }, // Pandian   – M07 FAIL + M08 FAIL
  // ── v2 NEW EMPLOYEES ──────────────────────────────────────────────────────────
  [E[27]]: { basic:  6000, hra: 1500, da: 3200, oa:  500 }, // Ramu K    – M10 FAIL: opted-out but EPF deducted
  [E[28]]: { basic: 13000, hra: 2500, da: 4500, oa:  800 }, // Preethi A – D04 FAIL: permission pool exhausted
  [E[29]]: { basic:  6000, hra: 1500, da: 3200, oa:  500 }, // Selvi K   – M21 FAIL: wrong layoff pay rate
  [E[30]]: { basic: 65000, hra:12000, da:22000, oa: 8000 }, // Anand R   – M13 WARN: income >₹12L, TDS=0
};

// ─────────────────────────────────────────────────────────────────────────────
// INSERT HELPER
// ─────────────────────────────────────────────────────────────────────────────

async function ins(table, rows, label) {
  if (!rows.length) return;
  const { error } = await sb.from(table).insert(rows);
  if (error) {
    console.error(`  ✗ ${label || table}:`, error.message);
    throw error;
  }
  console.log(`  ✓ ${label || table}: ${rows.length} row(s)`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — SYSTEM CONFIG
// ─────────────────────────────────────────────────────────────────────────────

async function seedSystemConfig() {
  await ins('system_config', [
    { key: 'DATA_SOURCE',           value: 'MOCK' },
    { key: 'ALERT_EMAIL_CENTRAL_HR',value: 'central.hr@magnum.com' },
    { key: 'ALERT_EMAIL_ADMIN',     value: 'admin@302labs.in' },
    { key: 'DEFAULT_WORKING_DAYS',  value: '26' },
  ], 'system_config');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — FACTORIES
// ─────────────────────────────────────────────────────────────────────────────

async function seedFactories() {
  await ins('factories', [
    { id: F1, name: 'TKM V',    zone: 'C', state: 'Tamil Nadu', is_active: true },
    { id: F2, name: 'Kandigai', zone: 'C', state: 'Tamil Nadu', is_active: true },
  ], 'factories');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — SHIFTS
// ─────────────────────────────────────────────────────────────────────────────

async function seedShifts() {
  const now = '2025-01-01';
  await ins('shifts', [
    { id: SH1, factory_id: F1, shift_name: 'General', start_time: '09:00:00',
      end_time: '17:30:00', grace_minutes: 10, effective_from: now },
    { id: SH2, factory_id: F2, shift_name: 'General', start_time: '09:00:00',
      end_time: '17:30:00', grace_minutes: 10, effective_from: now },
  ], 'shifts');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4 — EMPLOYEES  (30 employees: 15 TKM + 15 KAN)
// ─────────────────────────────────────────────────────────────────────────────

async function seedEmployees() {
  await ins('employees', [
    // ── TKM V workers  (E1–E12) ──────────────────────────────────────────────
    { id: E[1],  emp_no: 'TKM001', factory_id: F1, name: 'Rajan Kumar',    category: 'worker', designation: 'Tailor',    grade: 'Grade I',  incentive_multiplier: 1, zone: 'C', date_of_joining: '2022-06-01', is_active: true, epf_opted_in: true,  uan_number: 'UAN100001', esi_number: 'ESI100001' },
    { id: E[2],  emp_no: 'TKM002', factory_id: F1, name: 'Murugan S',      category: 'worker', designation: 'Tailor',    grade: 'Grade I',  incentive_multiplier: 1, zone: 'C', date_of_joining: '2021-03-15', is_active: true, epf_opted_in: true,  uan_number: 'UAN100002', esi_number: 'ESI100002' },
    { id: E[3],  emp_no: 'TKM003', factory_id: F1, name: 'Karthik R',      category: 'worker', designation: 'Helper',    grade: 'Grade I',  incentive_multiplier: 1, zone: 'C', date_of_joining: '2023-01-10', is_active: true, epf_opted_in: true,  uan_number: 'UAN100003', esi_number: 'ESI100003' },
    { id: E[4],  emp_no: 'TKM004', factory_id: F1, name: 'Selvam P',       category: 'worker', designation: 'Tailor',    grade: 'Grade II', incentive_multiplier: 1, zone: 'C', date_of_joining: '2020-08-20', is_active: true, epf_opted_in: true,  uan_number: 'UAN100004', esi_number: 'ESI100004' },
    { id: E[5],  emp_no: 'TKM005', factory_id: F1, name: 'Anbu M',         category: 'worker', designation: 'Checker',   grade: 'Grade I',  incentive_multiplier: 1, zone: 'C', date_of_joining: '2022-11-01', is_active: true, epf_opted_in: true,  uan_number: 'UAN100005', esi_number: 'ESI100005' },
    { id: E[6],  emp_no: 'TKM006', factory_id: F1, name: 'Lakshmi D',      category: 'worker', designation: 'Tailor',    grade: 'Grade I',  incentive_multiplier: 1, zone: 'C', date_of_joining: '2019-05-12', is_active: true, epf_opted_in: true,  uan_number: 'UAN100006', esi_number: 'ESI100006' },
    { id: E[7],  emp_no: 'TKM007', factory_id: F1, name: 'Sujatha R',      category: 'worker', designation: 'Tailor',    grade: 'Grade I',  incentive_multiplier: 1, zone: 'C', date_of_joining: '2018-02-01', is_active: true, epf_opted_in: true,  uan_number: 'UAN100007', esi_number: 'ESI100007' },
    { id: E[8],  emp_no: 'TKM008', factory_id: F1, name: 'Karpakam V',     category: 'worker', designation: 'Helper',    grade: 'Grade I',  incentive_multiplier: 1, zone: 'C', date_of_joining: '2023-06-15', is_active: true, epf_opted_in: true,  uan_number: 'UAN100008', esi_number: 'ESI100008' },
    { id: E[9],  emp_no: 'TKM009', factory_id: F1, name: 'Palani S',       category: 'worker', designation: 'Tailor',    grade: 'Grade II', incentive_multiplier: 1, zone: 'C', date_of_joining: '2021-09-01', is_active: true, epf_opted_in: true,  uan_number: 'UAN100009', esi_number: 'ESI100009' },
    { id: E[10], emp_no: 'TKM010', factory_id: F1, name: 'Meena K',        category: 'worker', designation: 'Tailor',    grade: 'Grade I',  incentive_multiplier: 1, zone: 'C', date_of_joining: '2020-04-01', is_active: true, epf_opted_in: true,  uan_number: 'UAN100010', esi_number: 'ESI100010' },
    { id: E[11], emp_no: 'TKM011', factory_id: F1, name: 'Balu T',         category: 'worker', designation: 'Tailor',    grade: 'Grade I',  incentive_multiplier: 1, zone: 'C', date_of_joining: '2022-03-07', is_active: true, epf_opted_in: true,  uan_number: 'UAN100011', esi_number: 'ESI100011' },
    { id: E[12], emp_no: 'TKM012', factory_id: F1, name: 'Kamatchi S',     category: 'worker', designation: 'Tailor',    grade: 'Grade I',  incentive_multiplier: 1, zone: 'C', date_of_joining: '2021-07-19', is_active: true, epf_opted_in: true,  uan_number: 'UAN100012', esi_number: 'ESI100012' },
    // ── Kandigai  (E13–E25) ───────────────────────────────────────────────────
    { id: E[13], emp_no: 'KAN001', factory_id: F2, name: 'Priya M',        category: 'worker', designation: 'Tailor',            grade: 'Grade I',  incentive_multiplier: 1, zone: 'C', date_of_joining: '2022-08-01', is_active: true, epf_opted_in: true,  uan_number: 'UAN200001', esi_number: 'ESI200001' },
    { id: E[14], emp_no: 'KAN002', factory_id: F2, name: 'Suresh K',       category: 'staff',  designation: 'Factory Manager',   grade: 'Grade I',  incentive_multiplier: 3, zone: 'C', date_of_joining: '2015-01-01', is_active: true, epf_opted_in: true,  uan_number: 'UAN200002', esi_number: null         },
    { id: E[15], emp_no: 'KAN003', factory_id: F2, name: 'Ramesh G',       category: 'staff',  designation: 'Production Manager', grade: 'Grade I',  incentive_multiplier: 2, zone: 'C', date_of_joining: '2016-03-15', is_active: true, epf_opted_in: true,  uan_number: 'UAN200003', esi_number: null         },
    { id: E[16], emp_no: 'KAN004', factory_id: F2, name: 'Vijaya L',       category: 'staff',  designation: 'IE Incharge',        grade: 'Grade I',  incentive_multiplier: 2, zone: 'C', date_of_joining: '2018-06-01', is_active: true, epf_opted_in: true,  uan_number: 'UAN200004', esi_number: null         },
    { id: E[17], emp_no: 'KAN005', factory_id: F2, name: 'Nalini S',       category: 'staff',  designation: 'Cutting Incharge',   grade: 'Grade I',  incentive_multiplier: 2, zone: 'C', date_of_joining: '2019-02-01', is_active: true, epf_opted_in: true,  uan_number: 'UAN200005', esi_number: null         },
    { id: E[18], emp_no: 'KAN006', factory_id: F2, name: 'Mani R',         category: 'staff',  designation: 'Finishing Incharge', grade: 'Grade I',  incentive_multiplier: 2, zone: 'C', date_of_joining: '2017-11-01', is_active: true, epf_opted_in: true,  uan_number: 'UAN200006', esi_number: null         },
    { id: E[19], emp_no: 'KAN007', factory_id: F2, name: 'Deepa T',        category: 'staff',  designation: 'Chief Mechanic',     grade: 'Grade I',  incentive_multiplier: 2, zone: 'C', date_of_joining: '2016-08-15', is_active: true, epf_opted_in: true,  uan_number: 'UAN200007', esi_number: null         },
    { id: E[20], emp_no: 'KAN008', factory_id: F2, name: 'Kavitha P',      category: 'staff',  designation: 'IE',                 grade: 'Grade I',  incentive_multiplier: 2, zone: 'C', date_of_joining: '2020-01-06', is_active: true, epf_opted_in: true,  uan_number: 'UAN200008', esi_number: 'ESI200008' },
    { id: E[21], emp_no: 'KAN009', factory_id: F2, name: 'Gopal N',        category: 'worker', designation: 'Tailor',    grade: 'Grade I',  incentive_multiplier: 1, zone: 'C', date_of_joining: '2026-02-16', is_active: true, epf_opted_in: true,  uan_number: null,         esi_number: null         },
    { id: E[22], emp_no: 'KAN010', factory_id: F2, name: 'Saroja M',       category: 'worker', designation: 'Tailor',    grade: 'Grade I',  incentive_multiplier: 1, zone: 'C', date_of_joining: '2021-05-01', is_active: true, epf_opted_in: true,  uan_number: 'UAN200010', esi_number: 'ESI200010' },
    { id: E[23], emp_no: 'KAN011', factory_id: F2, name: 'Kumar V',        category: 'worker', designation: 'Helper',    grade: 'Grade I',  incentive_multiplier: 1, zone: 'C', date_of_joining: '2022-09-01', is_active: true, epf_opted_in: true,  uan_number: 'UAN200011', esi_number: 'ESI200011' },
    { id: E[24], emp_no: 'KAN012', factory_id: F2, name: 'Ravi A',         category: 'worker', designation: 'Tailor',    grade: 'Grade II', incentive_multiplier: 1, zone: 'C', date_of_joining: '2020-11-01', is_active: true, epf_opted_in: true,  uan_number: 'UAN200012', esi_number: 'ESI200012' },
    { id: E[25], emp_no: 'KAN013', factory_id: F2, name: 'Jothi B',        category: 'worker', designation: 'Ironer',    grade: 'Grade I',  incentive_multiplier: 1, zone: 'C', date_of_joining: '2023-03-01', is_active: true, epf_opted_in: true,  uan_number: 'UAN200013', esi_number: 'ESI200013' },
    { id: E[26], emp_no: 'TKM013', factory_id: F1, name: 'Pandian K',      category: 'worker', designation: 'Tailor',    grade: 'Grade I',  incentive_multiplier: 1, zone: 'C', date_of_joining: '2021-04-01', is_active: true, epf_opted_in: true,  uan_number: 'UAN100013', esi_number: 'ESI100013' },
    // ── v2 NEW EMPLOYEES ──────────────────────────────────────────────────────────
    // E27 Ramu K – TKM V Tailor. epf_opted_in=FALSE → M10 FAIL (EPF deducted anyway).
    // Also carries D01 round-off FAIL: Mar 17 punch has normal_hrs mismatching time diff.
    { id: E[27], emp_no: 'TKM014', factory_id: F1, name: 'Ramu K',         category: 'worker', designation: 'Tailor',    grade: 'Grade I',  incentive_multiplier: 1, zone: 'C', date_of_joining: '2021-11-01', is_active: true, epf_opted_in: false, uan_number: 'UAN100014', esi_number: 'ESI100014' },
    // E28 Preethi A – Kandigai IE (staff). D04 FAIL: 3 lates in Mar 17-19; pool exhausted after 2 days;
    //   3rd late still marked PERMISSION in attendance_processed (should be HALF deduction).
    { id: E[28], emp_no: 'KAN014', factory_id: F2, name: 'Preethi A',      category: 'staff',  designation: 'IE',        grade: 'Grade I',  incentive_multiplier: 2, zone: 'C', date_of_joining: '2020-07-01', is_active: true, epf_opted_in: true,  uan_number: 'UAN200014', esi_number: 'ESI200014' },
    // E29 Selvi K – Kandigai Tailor worker. M21 FAIL: layoff_days=3 correct count,
    //   but ERP uses full-day rate instead of half-day → overpayment.
    { id: E[29], emp_no: 'KAN015', factory_id: F2, name: 'Selvi K',        category: 'worker', designation: 'Tailor',    grade: 'Grade I',  incentive_multiplier: 1, zone: 'C', date_of_joining: '2022-04-01', is_active: true, epf_opted_in: true,  uan_number: 'UAN200015', esi_number: 'ESI200015' },
    // E30 Anand R – Kandigai HR Manager (staff). M13 WARN: fixed gross ₹107K/month →
    //   annual ≈₹12.84L (>₹12L threshold), but tds_deducted=0 in payroll.
    { id: E[30], emp_no: 'KAN016', factory_id: F2, name: 'Anand R',        category: 'staff',  designation: 'HR Manager', grade: 'Grade I', incentive_multiplier: 2, zone: 'C', date_of_joining: '2014-06-01', is_active: true, epf_opted_in: true,  uan_number: 'UAN200016', esi_number: null         },
  ], 'employees (30)');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5 — EMPLOYEE SHIFTS
// ─────────────────────────────────────────────────────────────────────────────

async function seedEmployeeShifts() {
  const rows = [
    // TKM V: E1–E12, E26, E27
    ...Array.from({ length: 12 }, (_, k) => ({
      employee_id: E[k + 1], shift_id: SH1, assigned_from: '2025-01-01',
    })),
    { employee_id: E[26], shift_id: SH1, assigned_from: '2025-01-01' },
    { employee_id: E[27], shift_id: SH1, assigned_from: '2025-01-01' }, // v2
    // Kandigai: E13–E25, E28–E30
    ...Array.from({ length: 13 }, (_, k) => ({
      employee_id: E[k + 13], shift_id: SH2, assigned_from: '2025-01-01',
    })),
    { employee_id: E[28], shift_id: SH2, assigned_from: '2025-01-01' }, // v2
    { employee_id: E[29], shift_id: SH2, assigned_from: '2025-01-01' }, // v2
    { employee_id: E[30], shift_id: SH2, assigned_from: '2025-01-01' }, // v2
  ];
  await ins('employee_shifts', rows, 'employee_shifts (30)');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6 — CTC RECORDS
// ─────────────────────────────────────────────────────────────────────────────

async function seedCtcRecords() {
  const rows = Object.entries(CTC).map(([empId, c]) => ({
    employee_id:    empId,
    fixed_basic:    c.basic,
    fixed_hra:      c.hra,
    fixed_da:       c.da,
    fixed_oa:       c.oa,
    effective_from: '2025-04-01',
  }));
  await ins('ctc_records', rows, 'ctc_records (30)');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7 — MINIMUM WAGES
// ─────────────────────────────────────────────────────────────────────────────

async function seedMinimumWages() {
  const mw = (zone, category, grade, basicDa, from, to) => ({
    zone, category, grade,
    basic:    r2(basicDa * 0.65),
    da:       r2(basicDa * 0.35),
    basic_da: basicDa,
    effective_from: from,
    effective_to:   to,
  });

  const FY2526_FROM = '2025-04-01'; const FY2526_TO = '2026-03-31';
  const FY2627_FROM = '2026-04-01'; const FY2627_TO = '2027-03-31';

  await ins('minimum_wages', [
    // ── Zone C (factories) – FY 2025-26 ─────────────────────────────────────
    mw('C', 'Tailor',              'Grade I',  9000,  FY2526_FROM, FY2526_TO),
    mw('C', 'Tailor',              'Grade II', 8800,  FY2526_FROM, FY2526_TO),
    mw('C', 'Helper',              'Grade I',  8500,  FY2526_FROM, FY2526_TO),
    mw('C', 'Helper',              'Grade II', 8200,  FY2526_FROM, FY2526_TO),
    mw('C', 'Checker',             'Grade I',  8700,  FY2526_FROM, FY2526_TO),
    mw('C', 'Checker',             'Grade II', 8400,  FY2526_FROM, FY2526_TO),
    mw('C', 'Floater',             'Grade I',  8700,  FY2526_FROM, FY2526_TO),
    mw('C', 'Floater',             'Grade II', 8400,  FY2526_FROM, FY2526_TO),
    mw('C', 'Weaver',              'Grade I',  9200,  FY2526_FROM, FY2526_TO),
    mw('C', 'Mechanic',            'Grade I',  9200,  FY2526_FROM, FY2526_TO),
    mw('C', 'Ironer',              'Grade I',  8700,  FY2526_FROM, FY2526_TO),
    mw('C', 'Factory Manager',     'Grade I', 35000,  FY2526_FROM, FY2526_TO),
    mw('C', 'Production Manager',  'Grade I', 18000,  FY2526_FROM, FY2526_TO),
    mw('C', 'IE',                  'Grade I', 13000,  FY2526_FROM, FY2526_TO),
    mw('C', 'IE Incharge',         'Grade I', 14500,  FY2526_FROM, FY2526_TO),
    mw('C', 'Cutting Incharge',    'Grade I', 14500,  FY2526_FROM, FY2526_TO),
    mw('C', 'Finishing Incharge',  'Grade I', 14500,  FY2526_FROM, FY2526_TO),
    mw('C', 'Chief Mechanic',      'Grade I', 15000,  FY2526_FROM, FY2526_TO),
    mw('C', 'Factory Incharge',    'Grade I', 14000,  FY2526_FROM, FY2526_TO),
    mw('C', 'HR Manager',          'Grade I', 55000,  FY2526_FROM, FY2526_TO), // v2: E30
    // ── Zone C – FY 2026-27 ─────────────────────────────────────────────────
    mw('C', 'Tailor',              'Grade I',  9500,  FY2627_FROM, FY2627_TO),
    mw('C', 'Tailor',              'Grade II', 9200,  FY2627_FROM, FY2627_TO),
    mw('C', 'Helper',              'Grade I',  8900,  FY2627_FROM, FY2627_TO),
    mw('C', 'Helper',              'Grade II', 8600,  FY2627_FROM, FY2627_TO),
    mw('C', 'Checker',             'Grade I',  9100,  FY2627_FROM, FY2627_TO),
    mw('C', 'Ironer',              'Grade I',  9100,  FY2627_FROM, FY2627_TO),
    mw('C', 'Factory Manager',     'Grade I', 37000,  FY2627_FROM, FY2627_TO),
    mw('C', 'Production Manager',  'Grade I', 19000,  FY2627_FROM, FY2627_TO),
    mw('C', 'IE',                  'Grade I', 13700,  FY2627_FROM, FY2627_TO),
    mw('C', 'IE Incharge',         'Grade I', 15200,  FY2627_FROM, FY2627_TO),
    mw('C', 'Cutting Incharge',    'Grade I', 15200,  FY2627_FROM, FY2627_TO),
    mw('C', 'Finishing Incharge',  'Grade I', 15200,  FY2627_FROM, FY2627_TO),
    mw('C', 'Chief Mechanic',      'Grade I', 15750,  FY2627_FROM, FY2627_TO),
    mw('C', 'HR Manager',          'Grade I', 57750,  FY2627_FROM, FY2627_TO), // v2
    // ── Zone B (office) – FY 2025-26 ────────────────────────────────────────
    mw('B', 'Tailor',              'Grade I',  9900,  FY2526_FROM, FY2526_TO),
    mw('B', 'Factory Manager',     'Grade I', 38500,  FY2526_FROM, FY2526_TO),
    mw('B', 'Production Manager',  'Grade I', 19800,  FY2526_FROM, FY2526_TO),
    mw('B', 'IE',                  'Grade I', 14300,  FY2526_FROM, FY2526_TO),
    // ── Zone B – FY 2026-27 ──────────────────────────────────────────────────
    mw('B', 'Tailor',              'Grade I', 10400,  FY2627_FROM, FY2627_TO),
    mw('B', 'Factory Manager',     'Grade I', 40400,  FY2627_FROM, FY2627_TO),
  ], 'minimum_wages');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 8 — HOLIDAY CALENDAR
// ─────────────────────────────────────────────────────────────────────────────

async function seedHolidayCalendar() {
  await ins('holiday_calendar', [
    { factory_id: null, holiday_date: '2026-01-14', holiday_name: 'Pongal',               is_national: false },
    { factory_id: null, holiday_date: '2026-01-26', holiday_name: 'Republic Day',         is_national: true  },
    { factory_id: F2,   holiday_date: '2026-02-05', holiday_name: 'Kandigai Factory Day', is_national: false },
    { factory_id: null, holiday_date: '2026-03-10', holiday_name: 'Maha Shivaratri',      is_national: false },
    { factory_id: null, holiday_date: '2026-04-14', holiday_name: 'Tamil New Year',       is_national: false },
    { factory_id: null, holiday_date: '2026-05-01', holiday_name: 'May Day',              is_national: true  },
    { factory_id: null, holiday_date: '2026-08-15', holiday_name: 'Independence Day',     is_national: true  },
    { factory_id: null, holiday_date: '2026-10-02', holiday_name: 'Gandhi Jayanti',       is_national: true  },
    { factory_id: null, holiday_date: '2026-11-04', holiday_name: 'Diwali',               is_national: false },
    { factory_id: null, holiday_date: '2026-12-25', holiday_name: 'Christmas',            is_national: false },
  ], 'holiday_calendar');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 9 — INCENTIVE SLABS
// ─────────────────────────────────────────────────────────────────────────────

async function seedIncentiveSlabs() {
  await ins('incentive_slabs', [
    { efficiency_from:  67.00, efficiency_to:  70.00, incentive_pct:  4.0 },
    { efficiency_from:  70.01, efficiency_to:  73.00, incentive_pct:  5.0 },
    { efficiency_from:  73.01, efficiency_to:  77.00, incentive_pct:  6.5 },
    { efficiency_from:  77.01, efficiency_to:  80.00, incentive_pct:  8.5 }, // Line B 78%
    { efficiency_from:  80.01, efficiency_to:  83.00, incentive_pct: 11.0 }, // Stage ERP wrongly uses this for Line B
    { efficiency_from:  83.01, efficiency_to:  86.00, incentive_pct: 14.0 },
    { efficiency_from:  86.01, efficiency_to:  91.00, incentive_pct: 17.0 }, // Line A 88%
    { efficiency_from:  91.01, efficiency_to:  94.00, incentive_pct: 20.0 },
    { efficiency_from:  94.01, efficiency_to:  96.00, incentive_pct: 23.0 },
    { efficiency_from:  96.01, efficiency_to: 100.00, incentive_pct: 25.0 },
    { efficiency_from: 100.01, efficiency_to: 104.00, incentive_pct: 30.0 },
  ], 'incentive_slabs');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 10 — ATTENDANCE BONUS CONFIG
// ─────────────────────────────────────────────────────────────────────────────

async function seedAttendanceBonusConfig() {
  const FROM = '2025-04-01';
  const rows = [];
  const desig500 = ['Tailor', 'Floater'];
  const desig300 = ['Helper', 'Checker', 'Weaver', 'Mechanic', 'Ironer'];
  for (const fid of [F1, F2]) {
    for (const d of desig500) rows.push({ factory_id: fid, designation: d, bonus_amount: 500, effective_from: FROM });
    for (const d of desig300) rows.push({ factory_id: fid, designation: d, bonus_amount: 300, effective_from: FROM });
  }
  await ins('attendance_bonus_config', rows, 'attendance_bonus_config');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 11 — PERFORMANCE BONUS CONFIG  (A25)
// ─────────────────────────────────────────────────────────────────────────────

async function seedPerformanceBonusConfig() {
  await ins('performance_bonus_config', [
    { period: 'OCT_MAR', cycle_start_year: 2025, rate: 0.0833,
      effective_from: '2025-10-01', effective_to: '2026-03-31',
      notes: 'Statutory 8.33% – Oct 2025 to Mar 2026' },
    { period: 'APR_SEP', cycle_start_year: 2026, rate: 0.0833,
      effective_from: '2026-04-01', effective_to: '2026-09-30',
      notes: 'Statutory 8.33% – Apr 2026 to Sep 2026' },
  ], 'performance_bonus_config');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 12 — LOAN LEDGER
// ─────────────────────────────────────────────────────────────────────────────

async function seedLoanLedger() {
  await ins('loan_ledger', [
    { id: LOAN_E7, employee_id: E[7],
      sanctioned_amount: 50000, emi_amount: 5000, installments_total: 10,
      installments_paid: 3, outstanding_balance: 35000,
      loan_date: '2025-11-01', status: 'ACTIVE',
      remarks: 'Staff welfare loan – M14 FAIL: ERP deducts 3000 not 5000' },
    { id: LOAN_E24, employee_id: E[24],
      sanctioned_amount: 40000, emi_amount: 5000, installments_total: 8,
      installments_paid: 2, outstanding_balance: 30000,
      loan_date: '2025-12-01', status: 'ACTIVE',
      remarks: 'Kandigai worker loan – causes M18 50% cap breach' },
  ], 'loan_ledger');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 13 — ADVANCE LEDGER
// ─────────────────────────────────────────────────────────────────────────────

async function seedAdvanceLedger() {
  await ins('advance_ledger', [
    { id: ADV_E8, employee_id: E[8],
      advance_date: '2026-02-10', amount: 2000,
      deducted_month: null, status: 'PENDING',
      remarks: 'Advance for medical emergency – M15 FAIL: not deducted in payroll' },
    // No entry for E2 → M15 phantom deduction FAIL (payroll deducts 1500 but no ledger row)
  ], 'advance_ledger');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 14 — EL BALANCE
// ─────────────────────────────────────────────────────────────────────────────

async function seedElBalance() {
  await ins('el_balance', [
    { employee_id: E[14], year: 2025, opening_balance: 8,  accrued_days: 12,   used_days: 2, encashed_days: 0,  balance_days: 18,   encashment_amount: 0 },
    { employee_id: E[15], year: 2025, opening_balance: 5,  accrued_days: 12,   used_days: 0, encashed_days: 0,  balance_days: 17,   encashment_amount: 0 },
    { employee_id: E[16], year: 2025, opening_balance: 3,  accrued_days: 12.5, used_days: 1, encashed_days: 0,  balance_days: 14.5, encashment_amount: 0 },
    // FAIL A26: accrued=11.0 (correct 12.5)
    { employee_id: E[17], year: 2025, opening_balance: 2,  accrued_days: 11.0, used_days: 0, encashed_days: 0,  balance_days: 13.0, encashment_amount: 0 },
    // FAIL A26: encashment_amount=6000 (correct = (24000×0.5/26)×18 = 8307.69)
    { employee_id: E[18], year: 2025, opening_balance: 6,  accrued_days: 12,   used_days: 0, encashed_days: 18, balance_days: 0,    encashment_amount: 6000 },
    { employee_id: E[19], year: 2025, opening_balance: 4,  accrued_days: 13,   used_days: 2, encashed_days: 0,  balance_days: 15,   encashment_amount: 0 },
    { employee_id: E[20], year: 2025, opening_balance: 2,  accrued_days: 12,   used_days: 0, encashed_days: 0,  balance_days: 14,   encashment_amount: 0 },
    { employee_id: E[20], year: 2026, opening_balance: 14, accrued_days: 1.1,  used_days: 1, encashed_days: 0,  balance_days: 14.1, encashment_amount: 0 },
    // WARN A26: worker should not have EL balance
    { employee_id: E[22], year: 2025, opening_balance: 0,  accrued_days: 5,    used_days: 0, encashed_days: 0,  balance_days: 5,    encashment_amount: 0 },
    // v2: E28 and E30 are staff → valid EL records
    { employee_id: E[28], year: 2025, opening_balance: 1,  accrued_days: 12,   used_days: 0, encashed_days: 0,  balance_days: 13,   encashment_amount: 0 },
    { employee_id: E[30], year: 2025, opening_balance: 10, accrued_days: 12,   used_days: 0, encashed_days: 0,  balance_days: 22,   encashment_amount: 0 },
  ], 'el_balance');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 15 — COMPOFF LEDGER
// ─────────────────────────────────────────────────────────────────────────────

async function seedCompoffLedger() {
  await ins('compoff_ledger', [
    { id: CO_E12, employee_id: E[12],
      compoff_date: '2026-02-08', hours_earned: 3,
      approved_by: 'Factory Manager – TKM V (email ref: TKM/CO/2026-02-08)',
      compensated_date: null, status: 'EARNED',
      note: 'M22 FAIL – hours leaked into OT in Stage ERP' },
    { id: CO_E9, employee_id: E[9],
      compoff_date: '2026-01-25', hours_earned: 2,
      approved_by: 'Factory Manager – TKM V (email ref: TKM/CO/2026-01-25)',
      compensated_date: '2026-02-02', status: 'COMPENSATED',
      note: 'M22 PASS case' },
  ], 'compoff_ledger');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 16 — ESI CYCLE ENROLLMENT
// ─────────────────────────────────────────────────────────────────────────────

async function seedEsiCycleEnrollment() {
  await ins('esi_cycle_enrollment', [
    { employee_id: E[10], cycle: 'OCT_MAR', cycle_year: 2025, is_eligible: true,
      qualifying_gross: 20000, determination_month: '2025-10' },
    { employee_id: E[7],  cycle: 'OCT_MAR', cycle_year: 2025, is_eligible: true,
      qualifying_gross: 19000, determination_month: '2025-10' },
    { employee_id: E[13], cycle: 'OCT_MAR', cycle_year: 2025, is_eligible: true,
      qualifying_gross: 16000, determination_month: '2025-10' },
    { employee_id: E[20], cycle: 'OCT_MAR', cycle_year: 2025, is_eligible: true,
      qualifying_gross: 20800, determination_month: '2025-10' },
    // v2: E28 gross=20800 < 21K → ESI eligible
    { employee_id: E[28], cycle: 'OCT_MAR', cycle_year: 2025, is_eligible: true,
      qualifying_gross: 20800, determination_month: '2025-10' },
    // v2: E29 gross=11200 < 21K → ESI eligible
    { employee_id: E[29], cycle: 'OCT_MAR', cycle_year: 2025, is_eligible: true,
      qualifying_gross: 11200, determination_month: '2025-10' },
  ], 'esi_cycle_enrollment');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 17 — PAYROLL SNAPSHOTS
// TKM_FEB record_count: E1-E12 + E26 + E27 = 14
// KAN_FEB record_count: E13-E25 + E28 + E29 + E30 = 16
// ─────────────────────────────────────────────────────────────────────────────

async function seedPayrollSnapshots() {
  await ins('payroll_snapshots', [
    { id: PS.TKM_FEB, factory_id: F1, month_year: MONTH,     record_count: 14,
      storage_path: 'payroll/2026-02/tkm_v_feb2026.json',    status: 'RAW' },
    { id: PS.KAN_FEB, factory_id: F2, month_year: MONTH,     record_count: 16,
      storage_path: 'payroll/2026-02/kandigai_feb2026.json', status: 'RAW' },
    { id: PS.TKM_DEC, factory_id: F1, month_year: DEC_MONTH, record_count: 5,
      storage_path: 'payroll/2025-12/tkm_v_dec2025.json',   status: 'AUDITED' },
    { id: PS.KAN_DEC, factory_id: F2, month_year: DEC_MONTH, record_count: 5,
      storage_path: 'payroll/2025-12/kandigai_dec2025.json', status: 'AUDITED' },
  ], 'payroll_snapshots');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 18 — SAVIOR RAW PUNCHES
//
// Mar 17–19: all 30 employees + TKM_GHOST01 (D01)
// D01 FAIL round-off: E27 Mar 17 time_in=09:01, time_out=17:35 (actual ~8.57h)
//   but normal_hrs stored as 5.5 → >2h discrepancy → D01 time round-off FAIL MEDIUM
// D01 ID match FAIL: TKM_GHOST01 Mar 18 not in employee master
// D02 FAIL missing OUT: E3 Mar 18
// D02 FAIL missing IN: E4 Mar 19
// D02 FAIL early punch: E5 Mar 17 (06:30, 2.5h before shift)
// D04 FAIL worker late: E4 Mar 18 09:20 (no grace for workers)
// D04 FAIL pool exhaustion: E28 Mar 17+18 use permission (2 days, pool full),
//   E28 Mar 19 late again but still marked 'approved' permission → FAIL
// M09 qualifying OT days:
//   E16 Feb 11 and Feb 18: extra_hrs=5.5 each → 2 qualifying days → ₹700 PASS
//   E19 Feb 4, Feb 11, Feb 18: extra_hrs=5.5 each → 3 qualifying days → ₹600 FAIL (should be ₹1050)
// ─────────────────────────────────────────────────────────────────────────────

async function seedSaviorRawPunches() {
  const rows = [];

  const punch = (factoryId, empNo, date, overrides = {}) => ({
    factory_id:  factoryId,
    emp_no:      empNo,
    punch_date:  date,
    time_in:     `${date}T09:01:00+05:30`,
    time_out:    `${date}T17:35:00+05:30`,
    normal_hrs:  8.57,
    extra_hrs:   0,
    late_hrs:    0,
    late_reason: null,
    early_hrs:   0,
    ot_hrs_ded:  0,
    compoff_hrs: 0,
    ot_appr:     false,
    appr:        true,
    layoff:      null,
    att:         'P',
    permission:  null,
    remarks:     null,
    raw_payload: null,
    employee_id: null,
    ...overrides,
  });

  const TKM = {
    1:'TKM001', 2:'TKM002', 3:'TKM003', 4:'TKM004', 5:'TKM005', 6:'TKM006',
    7:'TKM007', 8:'TKM008', 9:'TKM009', 10:'TKM010', 11:'TKM011', 12:'TKM012',
  };
  const KAN = {
    13:'KAN001', 14:'KAN002', 15:'KAN003', 16:'KAN004', 17:'KAN005', 18:'KAN006',
    19:'KAN007', 20:'KAN008', 21:'KAN009', 22:'KAN010', 23:'KAN011', 24:'KAN012',
  };

  // ── M09: Feb OT qualifying days for E16 and E19 ──────────────────────────
  // E16: 2 qualifying days (extra_hrs > 5) → staff_ot_amount=₹700 PASS
  rows.push(punch(F2, 'KAN004', '2026-02-11', {
    extra_hrs: 5.5, normal_hrs: 8.57,
    time_out: '2026-02-11T22:04:00+05:30',
    ot_appr: true, remarks: 'M09 PASS: E16 qualifying OT day 1 of 2 (5.5h extra)',
  }));
  rows.push(punch(F2, 'KAN004', '2026-02-18', {
    extra_hrs: 5.0, normal_hrs: 8.57,
    time_out: '2026-02-18T21:31:00+05:30',
    ot_appr: true, remarks: 'M09 PASS: E16 qualifying OT day 2 of 2 (5.0h extra) → total 10.5h = 2 days × ₹350 = ₹700',
  }));
  // E19: 3 qualifying days → should be ₹1050 but Stage ERP pays ₹600 → M09 FAIL
  rows.push(punch(F2, 'KAN007', '2026-02-04', {
    extra_hrs: 5.5, normal_hrs: 8.57,
    time_out: '2026-02-04T22:04:00+05:30',
    ot_appr: true, remarks: 'M09 FAIL: E19 qualifying OT day 1 of 3 (5.5h extra)',
  }));
  rows.push(punch(F2, 'KAN007', '2026-02-11', {
    extra_hrs: 5.5, normal_hrs: 8.57,
    time_out: '2026-02-11T22:04:00+05:30',
    ot_appr: true, remarks: 'M09 FAIL: E19 qualifying OT day 2 of 3 (5.5h extra)',
  }));
  rows.push(punch(F2, 'KAN007', '2026-02-18', {
    extra_hrs: 5.5, normal_hrs: 8.57,
    time_out: '2026-02-18T22:04:00+05:30',
    ot_appr: true, remarks: 'M09 FAIL: E19 qualifying OT day 3 of 3 → 3 qualifying days × ₹350=₹1050 but ERP paid ₹600',
  }));

  // ── MAR 17 ────────────────────────────────────────────────────────────────
  const d1 = '2026-03-17';
  for (let i = 1; i <= 12; i++) {
    const ov = {};
    if (i === 5)  { ov.time_in='2026-03-17T06:30:00+05:30'; ov.early_hrs=2.5; ov.remarks='D02 TEST – early punch 06:30 (2.5h before shift) LOW'; }
    if (i === 11) { ov.extra_hrs=2.75; }
    rows.push(punch(F1, TKM[i], d1, ov));
  }
  // E26 Pandian: 1st late (2h exactly)
  rows.push(punch(F1, 'TKM013', d1, { time_in:'2026-03-17T09:11:00+05:30', late_hrs:2.0, late_reason:'personal', remarks:'Late exactly 2h – 1st late (E26)' }));
  // E27 Ramu: D01 FAIL round-off – normal_hrs=5.5 but actual ~8.57h
  rows.push(punch(F1, 'TKM014', d1, {
    time_in:  '2026-03-17T09:01:00+05:30',
    time_out: '2026-03-17T17:35:00+05:30',
    normal_hrs: 5.5,  // FAIL D01: should be 8.57; stored hours differ from time diff by >2h
    remarks: 'D01 TEST – normal_hrs=5.5 vs actual ~8.57h (time_out−time_in); round-off discrepancy >2h → D01 FAIL MEDIUM',
  }));
  for (let i = 13; i <= 24; i++) {
    const ov = {};
    if (i === 16) { ov.time_in='2026-03-17T09:09:00+05:30'; ov.late_hrs=0; }
    rows.push(punch(F2, KAN[i], d1, ov));
  }
  rows.push(punch(F2, 'KAN013', d1)); // E25 Jothi
  // E28 Preethi: Mar 17 – 1st late (15 min), marks as permission (day 1 of 2 allowed)
  rows.push(punch(F2, 'KAN014', d1, {
    time_in: '2026-03-17T09:15:00+05:30', late_hrs: 0.25,
    permission: 'approved', remarks: 'D04: E28 late Mar 17 – permission day 1 of 2 (pool: 0.25h used)',
  }));
  // E29 Selvi: Mar 17 – layoff
  rows.push(punch(F2, 'KAN015', d1, {
    layoff: 'Y', att: 'LAYOFF', normal_hrs: 4,
    time_out: '2026-03-17T13:00:00+05:30',
    remarks: 'E29 layoff half-day Mar 17',
  }));
  rows.push(punch(F2, 'KAN016', d1)); // E30 clean

  // ── MAR 18 ────────────────────────────────────────────────────────────────
  const d2 = '2026-03-18';
  for (let i = 1; i <= 12; i++) {
    const ov = {};
    if (i === 3) { ov.time_out=null; ov.normal_hrs=0; ov.remarks='D02: OUT punch missing – mispunch'; }
    if (i === 4) { ov.time_in='2026-03-18T09:20:00+05:30'; ov.late_hrs=0.333; ov.late_reason='transport delay'; ov.normal_hrs=8.24; ov.remarks='D04 TEST – worker 20min late (09:20); no grace; deduction applicable'; }
    if (i === 9) { ov.layoff='Y'; ov.att='LAYOFF'; ov.normal_hrs=4; ov.time_out='2026-03-18T13:00:00+05:30'; }
    if (i === 6) { ov.att='A'; ov.time_in=null; ov.time_out=null; ov.normal_hrs=0; }
    rows.push(punch(F1, TKM[i], d2, ov));
  }
  // E26 Pandian: 2nd late (2h exactly) → both lates now ineligible for bonus/incentive
  rows.push(punch(F1, 'TKM013', d2, { time_in:'2026-03-18T09:11:00+05:30', late_hrs:2.0, late_reason:'personal', remarks:'Late exactly 2h – 2nd late (E26) → ineligible M07+M08' }));
  rows.push(punch(F1, 'TKM014', d2)); // E27 clean
  // D01: Ghost emp_no not in employee master → D01 ID match FAIL MEDIUM
  rows.push(punch(F1, 'TKM_GHOST01', d2, { remarks:'D01 TEST – emp_no TKM_GHOST01 not in employee master → D01 ID match FAIL MEDIUM', employee_id:null }));
  for (let i = 13; i <= 24; i++) {
    const ov = {};
    if (i === 17) { ov.time_in='2026-03-18T09:15:00+05:30'; ov.late_hrs=0.25; ov.remarks='Staff late 9:15 – half-day deduction triggered'; }
    rows.push(punch(F2, KAN[i], d2, ov));
  }
  rows.push(punch(F2, 'KAN013', d2)); // E25 clean
  // E28 Preethi: Mar 18 – 2nd late (20 min), permission (day 2 of 2 → pool NOW EXHAUSTED)
  rows.push(punch(F2, 'KAN014', d2, {
    time_in: '2026-03-18T09:20:00+05:30', late_hrs: 0.333,
    permission: 'approved', remarks: 'D04: E28 late Mar 18 – permission day 2 of 2 (pool NOW EXHAUSTED after this day)',
  }));
  // E29 Selvi: Mar 18 – layoff day 2
  rows.push(punch(F2, 'KAN015', d2, {
    layoff: 'Y', att: 'LAYOFF', normal_hrs: 4,
    time_out: '2026-03-18T13:00:00+05:30',
    remarks: 'E29 layoff half-day Mar 18',
  }));
  rows.push(punch(F2, 'KAN016', d2)); // E30 clean

  // ── MAR 19 ────────────────────────────────────────────────────────────────
  const d3 = '2026-03-19';
  for (let i = 1; i <= 12; i++) {
    const ov = {};
    if (i === 4)  { ov.time_in=null; ov.normal_hrs=0; ov.appr=false; ov.remarks='D02 TEST – IN punch missing; HIGH'; }
    if (i === 12) { ov.compoff_hrs=3.0; ov.extra_hrs=3.0; ov.remarks='Comp-off 3hrs – must NOT flow to OT'; }
    rows.push(punch(F1, TKM[i], d3, ov));
  }
  rows.push(punch(F1, 'TKM013', d3)); // E26 clean
  rows.push(punch(F1, 'TKM014', d3)); // E27 clean
  for (let i = 13; i <= 24; i++) {
    const ov = {};
    if (i === 18) { ov.time_in='2026-03-19T09:35:00+05:30'; ov.late_hrs=0.583; ov.remarks='Staff late >9:30 – full-day deduction'; }
    rows.push(punch(F2, KAN[i], d3, ov));
  }
  rows.push(punch(F2, 'KAN013', d3)); // E25 clean
  // E28 Preethi: Mar 19 – 3rd late (15 min), pool EXHAUSTED → should be HALF deduction
  // Stage ERP still marks as 'approved' permission → D04 FAIL MEDIUM
  rows.push(punch(F2, 'KAN014', d3, {
    time_in: '2026-03-19T09:15:00+05:30', late_hrs: 0.25,
    permission: 'approved',  // FAIL D04: pool exhausted after Mar 18; this should trigger HALF deduction
    remarks: 'D04 FAIL: E28 3rd late; permission pool exhausted (2 days used Mar 17+18); ERP still marks approved → no deduction triggered → FAIL MEDIUM',
  }));
  // E29 Selvi: Mar 19 – layoff day 3
  rows.push(punch(F2, 'KAN015', d3, {
    layoff: 'Y', att: 'LAYOFF', normal_hrs: 4,
    time_out: '2026-03-19T13:00:00+05:30',
    remarks: 'E29 layoff half-day Mar 19',
  }));
  rows.push(punch(F2, 'KAN016', d3)); // E30 clean

  await ins('savior_raw_punches', rows,
    `savior_raw_punches (${rows.length} rows – Feb OT + 3 days × 30 employees + ghost)`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 19 — ATTENDANCE PROCESSED
// ─────────────────────────────────────────────────────────────────────────────

async function seedAttendanceProcessed() {
  const rows = [];

  // ── E6 long absenteeism Jan 12–22 (11 days) → D03 MEDIUM alert ───────────
  const longAbsDates = [
    '2026-01-12','2026-01-13','2026-01-14','2026-01-15','2026-01-16',
    '2026-01-17','2026-01-18','2026-01-19','2026-01-20','2026-01-21','2026-01-22',
  ];
  for (const d of longAbsDates) {
    rows.push({ employee_id: E[6], attendance_date: d, month_year: '2026-01',
      status: 'LOP', is_late: false, late_minutes: 0, is_early: false,
      ot_hours: 0, compoff_hrs: 0, effective_hours: 0, deduction_type: 'NONE', source: 'SAVIOR' });
  }

  // ── Feb 5 holiday rows (Kandigai only) ───────────────────────────────────
  rows.push({ employee_id: E[22], attendance_date: '2026-02-05', month_year: '2026-02',
    status: 'P', is_late: false, late_minutes: 0, is_early: false,
    ot_hours: 0, compoff_hrs: 0, effective_hours: 8.5, deduction_type: 'NONE', source: 'SAVIOR' });
  rows.push({ employee_id: E[23], attendance_date: '2026-02-05', month_year: '2026-02',
    status: 'LOP', is_late: false, late_minutes: 0, is_early: false,
    ot_hours: 0, compoff_hrs: 0, effective_hours: 0, deduction_type: 'NONE', source: 'SAVIOR' });

  // ── E20 Feb 15 EL (D03: EL applied before LOP) ───────────────────────────
  rows.push({ employee_id: E[20], attendance_date: '2026-02-15', month_year: '2026-02',
    status: 'EL', is_late: false, late_minutes: 0, is_early: false,
    ot_hours: 0, compoff_hrs: 0, effective_hours: 8.5, deduction_type: 'NONE', source: 'SAVIOR' });

  // ── M09: E16 Feb OT qualifying days (raw punch + processed) ──────────────
  rows.push({ employee_id: E[16], attendance_date: '2026-02-11', month_year: '2026-02',
    status: 'P', is_late: false, late_minutes: 0, is_early: false,
    ot_hours: 5.5, compoff_hrs: 0, effective_hours: 8.57, deduction_type: 'NONE', source: 'SAVIOR' });
  rows.push({ employee_id: E[16], attendance_date: '2026-02-18', month_year: '2026-02',
    status: 'P', is_late: false, late_minutes: 0, is_early: false,
    ot_hours: 5.0, compoff_hrs: 0, effective_hours: 8.57, deduction_type: 'NONE', source: 'SAVIOR' });

  // ── M09: E19 Feb OT qualifying days ──────────────────────────────────────
  rows.push({ employee_id: E[19], attendance_date: '2026-02-04', month_year: '2026-02',
    status: 'P', is_late: false, late_minutes: 0, is_early: false,
    ot_hours: 5.5, compoff_hrs: 0, effective_hours: 8.57, deduction_type: 'NONE', source: 'SAVIOR' });
  rows.push({ employee_id: E[19], attendance_date: '2026-02-11', month_year: '2026-02',
    status: 'P', is_late: false, late_minutes: 0, is_early: false,
    ot_hours: 5.5, compoff_hrs: 0, effective_hours: 8.57, deduction_type: 'NONE', source: 'SAVIOR' });
  rows.push({ employee_id: E[19], attendance_date: '2026-02-18', month_year: '2026-02',
    status: 'P', is_late: false, late_minutes: 0, is_early: false,
    ot_hours: 5.5, compoff_hrs: 0, effective_hours: 8.57, deduction_type: 'NONE', source: 'SAVIOR' });

  // ── Mar 17, 18, 19 – all 30 employees ────────────────────────────────────
  const DAYS = [
    { date: '2026-03-17', month_year: '2026-03' },
    { date: '2026-03-18', month_year: '2026-03' },
    { date: '2026-03-19', month_year: '2026-03' },
  ];

  const TKM_IDS = [...Array.from({ length: 12 }, (_, k) => E[k + 1]), E[26], E[27]];
  const KAN_IDS = [...Array.from({ length: 13 }, (_, k) => E[k + 13]), E[28], E[29], E[30]];

  for (const { date, month_year } of DAYS) {
    for (const empId of [...TKM_IDS, ...KAN_IDS]) {
      let status = 'P', is_late = false, late_minutes = 0,
          ot_hours = 0, compoff_hrs = 0, effective_hours = 8.57,
          deduction_type = 'NONE';

      // ── existing employee overrides ──
      // Note: deduction_type enum only allows NONE / HALF / FULL.
      // Worker-late days (E4) use HALF as the deduction bucket; the worker-vs-staff
      // distinction is captured by the employee's category in the employees table.
      // Permission-approved lates (E28) store NONE while the pool is valid, then HALF
      // once the pool is exhausted — the is_late flag + remarks carry the audit detail.
      if (date === '2026-03-18') {
        if (empId === E[3])  { status = 'HALFDAY'; effective_hours = 0; }
        if (empId === E[6])  { status = 'LOP';     effective_hours = 0; }
        if (empId === E[9])  { status = 'LAYOFF';  effective_hours = 4; }
        if (empId === E[17]) { is_late = true; late_minutes = 15; deduction_type = 'HALF'; }
        if (empId === E[4])  { is_late = true; late_minutes = 20; deduction_type = 'HALF'; } // worker late – no grace
        if (empId === E[26]) { is_late = true; late_minutes = 120; }
      }
      if (date === '2026-03-19') {
        if (empId === E[18]) { is_late = true; late_minutes = 35; deduction_type = 'FULL'; }
        if (empId === E[12]) { compoff_hrs = 3.0; }
        if (empId === E[4])  { status = 'HALFDAY'; effective_hours = 0; }
      }
      if (date === '2026-03-17') {
        if (empId === E[11]) { ot_hours = 2.75; }
        if (empId === E[26]) { is_late = true; late_minutes = 120; }
      }

      // ── v2 employee overrides ──
      // E28: D04 pool exhaustion.
      // Days 1+2: permission within pool → deduction_type=NONE (permission covers it).
      // Day 3: pool exhausted → should be HALF but Stage ERP still writes NONE → D04 FAIL.
      // The audit engine catches this by checking permission_days_used >= 2 in summary
      // while late_deducted=0 in the payroll record.
      if (empId === E[28]) {
        if (date === '2026-03-17') { is_late = true; late_minutes = 15; deduction_type = 'NONE'; } // day 1 of 2 – within pool
        if (date === '2026-03-18') { is_late = true; late_minutes = 20; deduction_type = 'NONE'; } // day 2 of 2 – pool now exhausted
        if (date === '2026-03-19') {
          is_late = true; late_minutes = 15;
          deduction_type = 'NONE'; // FAIL D04: pool exhausted; correct value would be HALF
        }
      }
      // E29: layoff all 3 days
      if (empId === E[29]) {
        status = 'LAYOFF'; effective_hours = 4;
      }

      rows.push({
        employee_id: empId, attendance_date: date, month_year,
        status, is_late, late_minutes, is_early: false,
        ot_hours, compoff_hrs, effective_hours, deduction_type, source: 'SAVIOR',
      });
    }
  }

  await ins('attendance_processed', rows, `attendance_processed (${rows.length} rows)`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 20 — MONTHLY ATTENDANCE SUMMARY  (Feb 2026 – all 30 employees)
// ─────────────────────────────────────────────────────────────────────────────

async function seedMonthlyAttendanceSummary() {
  const mas = (empId, overrides) => ({
    employee_id: empId, month_year: MONTH,
    present_days: 22, absent_days: 0, lop_days: 0, layoff_days: 0,
    ot_hours: 0, el_days_used: 0, late_count: 0, late_hours_total: 0,
    compoff_hrs_total: 0, permission_hours_used: 0, permission_days_used: 0,
    sundays_in_month: SUNDAYS, working_days: WD,
    ...overrides,
  });

  await ins('monthly_attendance_summary', [
    mas(E[1],  {}),
    mas(E[2],  { late_count: 1, late_hours_total: 2.0 }),
    mas(E[3],  { present_days: 21, absent_days: 1, lop_days: 1, late_count: 1, late_hours_total: 2.02 }),
    mas(E[4],  {}),
    mas(E[5],  { present_days: 21, absent_days: 1, lop_days: 1 }),
    mas(E[6],  { present_days: 20, absent_days: 2, lop_days: 2 }),
    mas(E[7],  {}),
    mas(E[8],  {}),
    mas(E[9],  { layoff_days: 2 }),
    mas(E[10], {}),
    mas(E[11], { ot_hours: 2.75 }),
    mas(E[12], { compoff_hrs_total: 3.0 }),
    mas(E[13], {}),
    mas(E[14], {}),
    mas(E[15], {}),
    mas(E[16], { ot_hours: 10.5 }),   // 2 qualifying OT days (Feb 11 + Feb 18) → M09 PASS
    mas(E[17], { late_count: 1, late_hours_total: 0.25 }),
    mas(E[18], { late_count: 1, late_hours_total: 0.583 }),
    mas(E[19], { ot_hours: 16.5, permission_hours_used: 2.5, permission_days_used: 2 }),  // 3 qualifying OT days → M09 FAIL
    mas(E[20], { el_days_used: 1 }),
    mas(E[21], { present_days: 12 }),
    mas(E[22], {}),
    mas(E[23], { present_days: 21, absent_days: 1, lop_days: 1 }),
    mas(E[24], {}),
    mas(E[25], {}),
    mas(E[26], { late_count: 2, late_hours_total: 4.0 }),
    // ── v2 ──────────────────────────────────────────────────────────────────
    // E27: clean month (M10 FAIL is in payroll, not attendance)
    mas(E[27], {}),
    // E28: 3 lates in Feb, pool (2h/2 days) exhausted after 2nd late,
    //   3rd late undeducted → D04 FAIL; late_deducted=0 in payroll → also M16 gap
    mas(E[28], { late_count: 3, late_hours_total: 0.583,
                 permission_hours_used: 0.583, permission_days_used: 2 }),
    // E29: 3 layoff days (correct count, but pay RATE wrong in payroll → M21 FAIL)
    mas(E[29], { present_days: 19, layoff_days: 3 }),
    // E30: clean month (M13 WARN is in payroll TDS check)
    mas(E[30], {}),
  ], 'monthly_attendance_summary (30 rows)');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 21 — PAYROLL RECORDS  (Feb 2026, all 30 employees)
//
// v2 ADDITIONS:
//   E27 – M10 FAIL: epf_opted_in=false but epf_deducted=1164 (should be 0)
//   E28 – D04/M16 FAIL: 3rd late undeducted; late_deducted=0 (should be 20800/22/2=472.73)
//   E29 – M21 FAIL: layoff_days=3 (count correct), but ERP uses full-day rate not half-day
//            correct layoff_pay = 11200/22/2 × 3 = 763.64
//            ERP wrong:          11200/22   × 3 = 1527.27 (full-day → overpayment)
//   E30 – M13 WARN: fixed_gross=107000/month → annual ≈₹12.84L; tds_deducted=0
// ─────────────────────────────────────────────────────────────────────────────

async function seedPayrollRecords() {
  const earned = (empId, presentDays, wd = WD) => {
    const c = CTC[empId];
    return {
      earned_basic: r2((c.basic / wd) * presentDays),
      earned_hra:   r2((c.hra   / wd) * presentDays),
      earned_da:    r2((c.da    / wd) * presentDays),
      earned_oa:    r2((c.oa    / wd) * presentDays),
    };
  };

  const tkmInc = (empId, presentDays) => {
    const eg_ = r2((g(CTC[empId]) / WD) * presentDays);
    return wInc(eg_, LINE_A_IPCT, LINE_A_ACHIEVED);
  };

  const kanIncWrong = (empId, presentDays) => {
    const eg_ = r2((g(CTC[empId]) / WD) * presentDays);
    return wInc(eg_, LINE_B_IPCT_WRONG, LINE_B_ACHIEVED);
  };

  const kanStaffIncWrong = (empId, mult) => {
    const fg = g(CTC[empId]);
    return sInc(fg, LINE_B_TAILORS, LINE_B_PRESENT, LINE_B_IPCT_WRONG, LINE_B_ACHIEVED, mult);
  };

  const rows = [];

  // ── E1 Rajan – M13 FAIL: TDS wrongly deducted (income ≈₹1.34L/yr) ───────
  {
    const e = earned(E[1], 22);
    const inc = tkmInc(E[1], 22);
    const epf = calcEPF(e.earned_basic, e.earned_da, e.earned_oa);
    const esi = calcESI(e.earned_basic + e.earned_da + e.earned_oa + e.earned_hra);
    const tds = 500;
    const totE = r2(11200 + 500 + inc);
    const totD = r2(epf + esi + tds);
    rows.push({ snapshot_id: PS.TKM_FEB, employee_id: E[1], month_year: MONTH,
      fixed_basic: 6000, fixed_hra: 1500, fixed_da: 3200, fixed_oa: 500, ...e,
      attendance_bonus: 500, incentive_amount: inc, staff_ot_amount: 0, worker_ot_amount: 0,
      epf_deducted: epf, esi_deducted: esi, pt_deducted: 0, tds_deducted: tds,
      loan_deducted: 0, advance_deducted: 0, lwf_deducted: 0, late_deducted: 0, misc_deducted: 0,
      total_earnings: totE, total_deductions: totD, net_pay: r2(totE - totD),
      cpf_amount: 12, lop_days: 0, layoff_days: 0, ot_hours: 0,
      efficiency_pct: LINE_A_EFF, achieved_days: LINE_A_ACHIEVED });
  }

  // ── E2 Murugan – M15 FAIL: phantom advance (₹1500 deducted, no ledger entry) ──
  {
    const e = earned(E[2], 22);
    const inc = tkmInc(E[2], 22);
    const epf = calcEPF(e.earned_basic, e.earned_da, e.earned_oa);
    const esi = calcESI(r2(e.earned_basic + e.earned_da + e.earned_oa + e.earned_hra));
    const phantom = 1500;
    const totE = r2(11200 + 500 + inc);
    const totD = r2(epf + esi + phantom);
    rows.push({ snapshot_id: PS.TKM_FEB, employee_id: E[2], month_year: MONTH,
      fixed_basic: 6000, fixed_hra: 1500, fixed_da: 3200, fixed_oa: 500, ...e,
      attendance_bonus: 500, incentive_amount: inc, staff_ot_amount: 0, worker_ot_amount: 0,
      epf_deducted: epf, esi_deducted: esi, pt_deducted: 0, tds_deducted: 0,
      loan_deducted: 0, advance_deducted: phantom, lwf_deducted: 0, late_deducted: 0, misc_deducted: 0,
      total_earnings: totE, total_deductions: totD, net_pay: r2(totE - totD),
      cpf_amount: 0, lop_days: 0, layoff_days: 0, ot_hours: 0,
      efficiency_pct: LINE_A_EFF, achieved_days: LINE_A_ACHIEVED });
  }

  // ── E3 Karthik – 1 absent, late>2h: bonus/incentive correctly 0 ──────────
  {
    const e = earned(E[3], 21);
    const epf = calcEPF(e.earned_basic, e.earned_da, e.earned_oa);
    const esi = calcESI(r2(e.earned_basic + e.earned_da + e.earned_oa + e.earned_hra));
    const totE = r2(9927.27);
    const totD = r2(epf + esi);
    rows.push({ snapshot_id: PS.TKM_FEB, employee_id: E[3], month_year: MONTH,
      fixed_basic: 6000, fixed_hra: 1200, fixed_da: 2800, fixed_oa: 400, ...e,
      attendance_bonus: 0, incentive_amount: 0, staff_ot_amount: 0, worker_ot_amount: 0,
      epf_deducted: epf, esi_deducted: esi, pt_deducted: 0, tds_deducted: 0,
      loan_deducted: 0, advance_deducted: 0, lwf_deducted: 0, late_deducted: 0, misc_deducted: 0,
      total_earnings: totE, total_deductions: totD, net_pay: r2(totE - totD),
      cpf_amount: 0, lop_days: 1, layoff_days: 0, ot_hours: 0,
      efficiency_pct: LINE_A_EFF, achieved_days: LINE_A_ACHIEVED });
  }

  // ── E4 Selvam – M06 FAIL: basic+da=8000 < 8800 ──────────────────────────
  {
    const e = earned(E[4], 22);
    const inc = tkmInc(E[4], 22);
    const epf = calcEPF(e.earned_basic, e.earned_da, e.earned_oa);
    const esi = calcESI(r2(e.earned_basic + e.earned_da + e.earned_oa + e.earned_hra));
    const totE = r2(9500 + 500 + inc);
    const totD = r2(epf + esi);
    rows.push({ snapshot_id: PS.TKM_FEB, employee_id: E[4], month_year: MONTH,
      fixed_basic: 5000, fixed_hra: 1200, fixed_da: 3000, fixed_oa: 300, ...e,
      attendance_bonus: 500, incentive_amount: inc, staff_ot_amount: 0, worker_ot_amount: 0,
      epf_deducted: epf, esi_deducted: esi, pt_deducted: 0, tds_deducted: 0,
      loan_deducted: 0, advance_deducted: 0, lwf_deducted: 0, late_deducted: 0, misc_deducted: 0,
      total_earnings: totE, total_deductions: totD, net_pay: r2(totE - totD),
      cpf_amount: 0, lop_days: 0, layoff_days: 0, ot_hours: 0,
      efficiency_pct: LINE_A_EFF, achieved_days: LINE_A_ACHIEVED });
  }

  // ── E5 Anbu – M07 FAIL (bonus=0 should be 300) + M23 FAIL (+₹50) ─────────
  {
    const e = earned(E[5], 21);
    const inc = tkmInc(E[5], 21);
    const epf = calcEPF(e.earned_basic, e.earned_da, e.earned_oa);
    const esi = calcESI(r2(e.earned_basic + e.earned_da + e.earned_oa + e.earned_hra));
    const totE = r2(10213.64 + 0 + inc);
    const totD = r2(epf + esi);
    rows.push({ snapshot_id: PS.TKM_FEB, employee_id: E[5], month_year: MONTH,
      fixed_basic: 6000, fixed_hra: 1400, fixed_da: 2900, fixed_oa: 400, ...e,
      attendance_bonus: 0, incentive_amount: inc, staff_ot_amount: 0, worker_ot_amount: 0,
      epf_deducted: epf, esi_deducted: esi, pt_deducted: 0, tds_deducted: 0,
      loan_deducted: 0, advance_deducted: 0, lwf_deducted: 0, late_deducted: 0, misc_deducted: 0,
      total_earnings: totE, total_deductions: totD,
      net_pay: r2(r2(totE - totD) + 50),  // FAIL M23: +₹50 arithmetic error
      cpf_amount: 0, lop_days: 1, layoff_days: 0, ot_hours: 0,
      efficiency_pct: LINE_A_EFF, achieved_days: LINE_A_ACHIEVED });
  }

  // ── E6 Lakshmi – M05/M07/M17 FAIL ───────────────────────────────────────
  {
    const eWrong = earned(E[6], 21);
    const epf = calcEPF(eWrong.earned_basic, eWrong.earned_da, eWrong.earned_oa);
    const esi = calcESI(r2(eWrong.earned_basic + eWrong.earned_da + eWrong.earned_oa + eWrong.earned_hra));
    const wrongGross = r2((11200 / WD) * 21);
    const totE = r2(wrongGross + 500);
    const totD = r2(epf + esi);
    rows.push({ snapshot_id: PS.TKM_FEB, employee_id: E[6], month_year: MONTH,
      fixed_basic: 6000, fixed_hra: 1500, fixed_da: 3200, fixed_oa: 500, ...eWrong,
      attendance_bonus: 500, incentive_amount: 0, staff_ot_amount: 0, worker_ot_amount: 0,
      epf_deducted: epf, esi_deducted: esi, pt_deducted: 0, tds_deducted: 0,
      loan_deducted: 0, advance_deducted: 0, lwf_deducted: 0, late_deducted: 0, misc_deducted: 0,
      total_earnings: totE, total_deductions: totD, net_pay: r2(totE - totD),
      cpf_amount: 0, lop_days: 1, layoff_days: 0, ot_hours: 0,
      efficiency_pct: LINE_A_EFF, achieved_days: LINE_A_ACHIEVED });
  }

  // ── E7 Sujatha – M10 FAIL (EPF not capped) + M14 FAIL (wrong EMI) ────────
  {
    const e = earned(E[7], 22);
    const epfWrong = r2((10000 + 6000 + 1000) * 0.12);  // 2040, not capped to 1800
    const esi = calcESI(r2(e.earned_basic + e.earned_da + e.earned_oa + e.earned_hra));
    const inc = tkmInc(E[7], 22);
    const loanWrong = 3000;  // should be 5000
    const totE = r2(19000 + 500 + inc);
    const totD = r2(epfWrong + esi + loanWrong);
    rows.push({ snapshot_id: PS.TKM_FEB, employee_id: E[7], month_year: MONTH,
      fixed_basic: 10000, fixed_hra: 2000, fixed_da: 6000, fixed_oa: 1000, ...e,
      attendance_bonus: 500, incentive_amount: inc, staff_ot_amount: 0, worker_ot_amount: 0,
      epf_deducted: epfWrong, esi_deducted: esi, pt_deducted: 0, tds_deducted: 0,
      loan_deducted: loanWrong, advance_deducted: 0, lwf_deducted: 0, late_deducted: 0, misc_deducted: 0,
      total_earnings: totE, total_deductions: totD, net_pay: r2(totE - totD),
      cpf_amount: 0, lop_days: 0, layoff_days: 0, ot_hours: 0,
      efficiency_pct: LINE_A_EFF, achieved_days: LINE_A_ACHIEVED });
  }

  // ── E8 Karpakam – M15 FAIL: advance PENDING, advance_deducted=0 ──────────
  {
    const e = earned(E[8], 22);
    const inc = tkmInc(E[8], 22);
    const epf = calcEPF(e.earned_basic, e.earned_da, e.earned_oa);
    const esi = calcESI(r2(e.earned_basic + e.earned_da + e.earned_oa + e.earned_hra));
    const totE = r2(10400 + 300 + inc);
    const totD = r2(epf + esi);
    rows.push({ snapshot_id: PS.TKM_FEB, employee_id: E[8], month_year: MONTH,
      fixed_basic: 6000, fixed_hra: 1200, fixed_da: 2800, fixed_oa: 400, ...e,
      attendance_bonus: 300, incentive_amount: inc, staff_ot_amount: 0, worker_ot_amount: 0,
      epf_deducted: epf, esi_deducted: esi, pt_deducted: 0, tds_deducted: 0,
      loan_deducted: 0, advance_deducted: 0, lwf_deducted: 0, late_deducted: 0, misc_deducted: 0,
      total_earnings: totE, total_deductions: totD, net_pay: r2(totE - totD),
      cpf_amount: 0, lop_days: 0, layoff_days: 0, ot_hours: 0,
      efficiency_pct: LINE_A_EFF, achieved_days: LINE_A_ACHIEVED });
  }

  // ── E9 Palani – M21 FAIL: layoff_days=1 (should be 2) ───────────────────
  {
    const e = earned(E[9], 22);
    const inc = tkmInc(E[9], 22);
    const epf = calcEPF(e.earned_basic, e.earned_da, e.earned_oa);
    const esi = calcESI(r2(e.earned_basic + e.earned_da + e.earned_oa + e.earned_hra));
    const totE = r2(10600 + 500 + inc);
    const totD = r2(epf + esi);
    rows.push({ snapshot_id: PS.TKM_FEB, employee_id: E[9], month_year: MONTH,
      fixed_basic: 6000, fixed_hra: 1300, fixed_da: 2900, fixed_oa: 400, ...e,
      attendance_bonus: 500, incentive_amount: inc, staff_ot_amount: 0, worker_ot_amount: 0,
      epf_deducted: epf, esi_deducted: esi, pt_deducted: 0, tds_deducted: 0,
      loan_deducted: 0, advance_deducted: 0, lwf_deducted: 0, late_deducted: 0, misc_deducted: 0,
      total_earnings: totE, total_deductions: totD, net_pay: r2(totE - totD),
      cpf_amount: 0, lop_days: 0, layoff_days: 1, ot_hours: 0,  // FAIL M21: should be 2
      efficiency_pct: LINE_A_EFF, achieved_days: LINE_A_ACHIEVED });
  }

  // ── E10 Meena – M11 FAIL: ESI cycle active, Stage ERP deducts 0 ──────────
  {
    const e = earned(E[10], 22);
    const inc = tkmInc(E[10], 22);
    const epf = calcEPF(e.earned_basic, e.earned_da, e.earned_oa);
    const totE = r2(23000 + 500 + inc);
    const totD = r2(epf + 135);
    rows.push({ snapshot_id: PS.TKM_FEB, employee_id: E[10], month_year: MONTH,
      fixed_basic: 13000, fixed_hra: 3000, fixed_da: 5000, fixed_oa: 2000, ...e,
      attendance_bonus: 500, incentive_amount: inc, staff_ot_amount: 0, worker_ot_amount: 0,
      epf_deducted: epf, esi_deducted: 0,  // FAIL M11: should be ~172.5
      pt_deducted: 135, tds_deducted: 0,
      loan_deducted: 0, advance_deducted: 0, lwf_deducted: 0, late_deducted: 0, misc_deducted: 0,
      total_earnings: totE, total_deductions: totD, net_pay: r2(totE - totD),
      cpf_amount: 0, lop_days: 0, layoff_days: 0, ot_hours: 0,
      efficiency_pct: LINE_A_EFF, achieved_days: LINE_A_ACHIEVED });
  }

  // ── E11 Balu – M09 FAIL: OT stored as 2.45h not 2.75h ───────────────────
  {
    const e = earned(E[11], 22);
    const inc = tkmInc(E[11], 22);
    const epf = calcEPF(e.earned_basic, e.earned_da, e.earned_oa);
    const wrongOT = wOT(11200, 2.45);
    const esi = calcESI(r2(11200 + wrongOT));
    const totE = r2(11200 + 500 + inc + wrongOT);
    const totD = r2(epf + esi);
    rows.push({ snapshot_id: PS.TKM_FEB, employee_id: E[11], month_year: MONTH,
      fixed_basic: 6000, fixed_hra: 1500, fixed_da: 3200, fixed_oa: 500, ...e,
      attendance_bonus: 500, incentive_amount: inc, staff_ot_amount: 0, worker_ot_amount: wrongOT,
      epf_deducted: epf, esi_deducted: esi, pt_deducted: 0, tds_deducted: 0,
      loan_deducted: 0, advance_deducted: 0, lwf_deducted: 0, late_deducted: 0, misc_deducted: 0,
      total_earnings: totE, total_deductions: totD, net_pay: r2(totE - totD),
      cpf_amount: 0, lop_days: 0, layoff_days: 0, ot_hours: 2.75,
      efficiency_pct: LINE_A_EFF, achieved_days: LINE_A_ACHIEVED });
  }

  // ── E12 Kamatchi – M22 FAIL: compoff 3h leaked into worker_ot_amount ──────
  {
    const e = earned(E[12], 22);
    const inc = tkmInc(E[12], 22);
    const epf = calcEPF(e.earned_basic, e.earned_da, e.earned_oa);
    const wrongOT = wOT(11200, 3.0);
    const esi = calcESI(r2(11200 + wrongOT));
    const totE = r2(11200 + 500 + inc + wrongOT);
    const totD = r2(epf + esi);
    rows.push({ snapshot_id: PS.TKM_FEB, employee_id: E[12], month_year: MONTH,
      fixed_basic: 6000, fixed_hra: 1500, fixed_da: 3200, fixed_oa: 500, ...e,
      attendance_bonus: 500, incentive_amount: inc, staff_ot_amount: 0, worker_ot_amount: wrongOT,
      epf_deducted: epf, esi_deducted: esi, pt_deducted: 0, tds_deducted: 0,
      loan_deducted: 0, advance_deducted: 0, lwf_deducted: 0, late_deducted: 0, misc_deducted: 0,
      total_earnings: totE, total_deductions: totD, net_pay: r2(totE - totD),
      cpf_amount: 0, lop_days: 0, layoff_days: 0, ot_hours: 0,
      efficiency_pct: LINE_A_EFF, achieved_days: LINE_A_ACHIEVED });
  }

  // ── E13 Priya – M08 FAIL: wrong 11% slab ─────────────────────────────────
  {
    const e = earned(E[13], 22);
    const incWrong = kanIncWrong(E[13], 22);
    const epf = calcEPF(e.earned_basic, e.earned_da, e.earned_oa);
    const esi = calcESI(16000);
    const totE = r2(16000 + 500 + incWrong);
    const totD = r2(epf + esi);
    rows.push({ snapshot_id: PS.KAN_FEB, employee_id: E[13], month_year: MONTH,
      fixed_basic: 9000, fixed_hra: 2000, fixed_da: 4000, fixed_oa: 1000, ...e,
      attendance_bonus: 500, incentive_amount: incWrong, staff_ot_amount: 0, worker_ot_amount: 0,
      epf_deducted: epf, esi_deducted: esi, pt_deducted: 0, tds_deducted: 0,
      loan_deducted: 0, advance_deducted: 0, lwf_deducted: 0, late_deducted: 0, misc_deducted: 0,
      total_earnings: totE, total_deductions: totD, net_pay: r2(totE - totD),
      cpf_amount: 0, lop_days: 0, layoff_days: 0, ot_hours: 0,
      efficiency_pct: LINE_B_EFF, achieved_days: LINE_B_ACHIEVED });
  }

  // ── E14 Suresh – M08 FAIL ────────────────────────────────────────────────
  {
    const e = earned(E[14], 22);
    const incWrong = kanStaffIncWrong(E[14], 3);
    const totE = r2(75000 + incWrong);
    const totD = r2(1800 + 208);
    rows.push({ snapshot_id: PS.KAN_FEB, employee_id: E[14], month_year: MONTH,
      fixed_basic: 45000, fixed_hra: 9000, fixed_da: 15000, fixed_oa: 6000, ...e,
      attendance_bonus: 0, incentive_amount: incWrong, staff_ot_amount: 0, worker_ot_amount: 0,
      epf_deducted: 1800, esi_deducted: 0, pt_deducted: 208, tds_deducted: 0,
      loan_deducted: 0, advance_deducted: 0, lwf_deducted: 0, late_deducted: 0, misc_deducted: 0,
      total_earnings: totE, total_deductions: totD, net_pay: r2(totE - totD),
      cpf_amount: 0, lop_days: 0, layoff_days: 0, ot_hours: 0,
      efficiency_pct: LINE_B_EFF, achieved_days: LINE_B_ACHIEVED });
  }

  // ── E15 Ramesh – M08 FAIL + M12 FAIL (PT 135 not 208) ───────────────────
  {
    const e = earned(E[15], 22);
    const incWrong = kanStaffIncWrong(E[15], 2);
    const totE = r2(31500 + incWrong);
    const totD = r2(1800 + 135);
    rows.push({ snapshot_id: PS.KAN_FEB, employee_id: E[15], month_year: MONTH,
      fixed_basic: 20000, fixed_hra: 4000, fixed_da: 6000, fixed_oa: 1500, ...e,
      attendance_bonus: 0, incentive_amount: incWrong, staff_ot_amount: 0, worker_ot_amount: 0,
      epf_deducted: 1800, esi_deducted: 0, pt_deducted: 135, tds_deducted: 0,
      loan_deducted: 0, advance_deducted: 0, lwf_deducted: 0, late_deducted: 0, misc_deducted: 0,
      total_earnings: totE, total_deductions: totD, net_pay: r2(totE - totD),
      cpf_amount: 0, lop_days: 0, layoff_days: 0, ot_hours: 0,
      efficiency_pct: LINE_B_EFF, achieved_days: LINE_B_ACHIEVED });
  }

  // ── E16 Vijaya – M09 PASS: staff OT ₹700 (2 qualifying days × ₹350) ──────
  {
    const e = earned(E[16], 22);
    const incWrong = kanStaffIncWrong(E[16], 2);
    const staffOT = 700;
    const totE = r2(24000 + incWrong + staffOT);
    const totD = r2(1800 + 135);
    rows.push({ snapshot_id: PS.KAN_FEB, employee_id: E[16], month_year: MONTH,
      fixed_basic: 15000, fixed_hra: 3000, fixed_da: 5000, fixed_oa: 1000, ...e,
      attendance_bonus: 0, incentive_amount: incWrong, staff_ot_amount: staffOT, worker_ot_amount: 0,
      epf_deducted: 1800, esi_deducted: 0, pt_deducted: 135, tds_deducted: 0,
      loan_deducted: 0, advance_deducted: 0, lwf_deducted: 0, late_deducted: 0, misc_deducted: 0,
      total_earnings: totE, total_deductions: totD, net_pay: r2(totE - totD),
      cpf_amount: 0, lop_days: 0, layoff_days: 0, ot_hours: 10.5,
      efficiency_pct: LINE_B_EFF, achieved_days: LINE_B_ACHIEVED });
  }

  // ── E17 Nalini – M16 FAIL: late deduction ₹300 (should be ₹545.45) ───────
  {
    const e = earned(E[17], 22);
    const incWrong = kanStaffIncWrong(E[17], 2);
    const wrongLate = 300;
    const totE = r2(24000 + incWrong);
    const totD = r2(1800 + 135 + wrongLate);
    rows.push({ snapshot_id: PS.KAN_FEB, employee_id: E[17], month_year: MONTH,
      fixed_basic: 15000, fixed_hra: 3000, fixed_da: 5000, fixed_oa: 1000, ...e,
      attendance_bonus: 0, incentive_amount: incWrong, staff_ot_amount: 0, worker_ot_amount: 0,
      epf_deducted: 1800, esi_deducted: 0, pt_deducted: 135, tds_deducted: 0,
      loan_deducted: 0, advance_deducted: 0, lwf_deducted: 0, late_deducted: wrongLate, misc_deducted: 0,
      total_earnings: totE, total_deductions: totD, net_pay: r2(totE - totD),
      cpf_amount: 0, lop_days: 0, layoff_days: 0, ot_hours: 0,
      efficiency_pct: LINE_B_EFF, achieved_days: LINE_B_ACHIEVED });
  }

  // ── E18 Mani – full-day deduction correctly applied (M16 PASS) ───────────
  {
    const e = earned(E[18], 22);
    const incWrong = kanStaffIncWrong(E[18], 2);
    const fullDayDed = r2(24000 / WD);
    const totE = r2(24000 + incWrong);
    const totD = r2(1800 + 135 + fullDayDed);
    rows.push({ snapshot_id: PS.KAN_FEB, employee_id: E[18], month_year: MONTH,
      fixed_basic: 15000, fixed_hra: 3000, fixed_da: 5000, fixed_oa: 1000, ...e,
      attendance_bonus: 0, incentive_amount: incWrong, staff_ot_amount: 0, worker_ot_amount: 0,
      epf_deducted: 1800, esi_deducted: 0, pt_deducted: 135, tds_deducted: 0,
      loan_deducted: 0, advance_deducted: 0, lwf_deducted: 0, late_deducted: fullDayDed, misc_deducted: 0,
      total_earnings: totE, total_deductions: totD, net_pay: r2(totE - totD),
      cpf_amount: 0, lop_days: 0, layoff_days: 0, ot_hours: 0,
      efficiency_pct: LINE_B_EFF, achieved_days: LINE_B_ACHIEVED });
  }

  // ── E19 Deepa – M09 FAIL: staff OT ₹600 paid (should be ₹1050 = 3 × ₹350) ─
  {
    const e = earned(E[19], 22);
    const incWrong = kanStaffIncWrong(E[19], 2);
    const staffOT = 600;
    const permDed = r2(25500 / WD / 8 * 0.5);
    const totE = r2(25500 + incWrong + staffOT);
    const totD = r2(1800 + 135 + permDed);
    rows.push({ snapshot_id: PS.KAN_FEB, employee_id: E[19], month_year: MONTH,
      fixed_basic: 16000, fixed_hra: 3000, fixed_da: 5500, fixed_oa: 1000, ...e,
      attendance_bonus: 0, incentive_amount: incWrong, staff_ot_amount: staffOT, worker_ot_amount: 0,
      epf_deducted: 1800, esi_deducted: 0, pt_deducted: 135, tds_deducted: 0,
      loan_deducted: 0, advance_deducted: 0, lwf_deducted: 0, late_deducted: permDed, misc_deducted: 0,
      total_earnings: totE, total_deductions: totD, net_pay: r2(totE - totD),
      cpf_amount: 0, lop_days: 0, layoff_days: 0, ot_hours: 16.5,
      efficiency_pct: LINE_B_EFF, achieved_days: LINE_B_ACHIEVED });
  }

  // ── E20 Kavitha – EL consumed (D03) ──────────────────────────────────────
  {
    const e = earned(E[20], 22);
    const incWrong = kanStaffIncWrong(E[20], 2);
    const esi = calcESI(20800);
    const totE = r2(20800 + incWrong);
    const totD = r2(1800 + esi);
    rows.push({ snapshot_id: PS.KAN_FEB, employee_id: E[20], month_year: MONTH,
      fixed_basic: 13000, fixed_hra: 2500, fixed_da: 4500, fixed_oa: 800, ...e,
      attendance_bonus: 0, incentive_amount: incWrong, staff_ot_amount: 0, worker_ot_amount: 0,
      epf_deducted: 1800, esi_deducted: esi, pt_deducted: 0, tds_deducted: 0,
      loan_deducted: 0, advance_deducted: 0, lwf_deducted: 0, late_deducted: 0, misc_deducted: 0,
      total_earnings: totE, total_deductions: totD, net_pay: r2(totE - totD),
      cpf_amount: 0, lop_days: 0, layoff_days: 0, ot_hours: 0,
      efficiency_pct: LINE_B_EFF, achieved_days: LINE_B_ACHIEVED });
  }

  // ── E21 Gopal – new joiner Feb 16, WARN M10: no UAN ─────────────────────
  {
    const presentDays = 12;
    const e = earned(E[21], presentDays);
    const epf = r2((e.earned_basic + e.earned_da + e.earned_oa) * 0.12);
    const esi = calcESI(r2(e.earned_basic + e.earned_da + e.earned_oa + e.earned_hra));
    const earnedGross = r2((11200 / WD) * presentDays);
    rows.push({ snapshot_id: PS.KAN_FEB, employee_id: E[21], month_year: MONTH,
      fixed_basic: 6000, fixed_hra: 1500, fixed_da: 3200, fixed_oa: 500, ...e,
      attendance_bonus: 0, incentive_amount: 0, staff_ot_amount: 0, worker_ot_amount: 0,
      epf_deducted: epf, esi_deducted: esi, pt_deducted: 0, tds_deducted: 0,
      loan_deducted: 0, advance_deducted: 0, lwf_deducted: 0, late_deducted: 0, misc_deducted: 0,
      total_earnings: earnedGross, total_deductions: r2(epf + esi),
      net_pay: r2(earnedGross - epf - esi),
      cpf_amount: 0, lop_days: 0, layoff_days: 0, ot_hours: 0,
      efficiency_pct: 0, achieved_days: 0 });
  }

  // ── E22 Saroja – M20 PASS + M08 FAIL (wrong 11%) ─────────────────────────
  {
    const e = earned(E[22], 22);
    const incWrong = kanIncWrong(E[22], 22);
    const epf = calcEPF(e.earned_basic, e.earned_da, e.earned_oa);
    const esi = calcESI(11200);
    const totE = r2(11200 + 500 + incWrong);
    const totD = r2(epf + esi);
    rows.push({ snapshot_id: PS.KAN_FEB, employee_id: E[22], month_year: MONTH,
      fixed_basic: 6000, fixed_hra: 1500, fixed_da: 3200, fixed_oa: 500, ...e,
      attendance_bonus: 500, incentive_amount: incWrong, staff_ot_amount: 0, worker_ot_amount: 0,
      epf_deducted: epf, esi_deducted: esi, pt_deducted: 0, tds_deducted: 0,
      loan_deducted: 0, advance_deducted: 0, lwf_deducted: 0, late_deducted: 0, misc_deducted: 0,
      total_earnings: totE, total_deductions: totD, net_pay: r2(totE - totD),
      cpf_amount: 0, lop_days: 0, layoff_days: 0, ot_hours: 0,
      efficiency_pct: LINE_B_EFF, achieved_days: LINE_B_ACHIEVED });
  }

  // ── E23 Kumar – M20 FAIL: absent on Kandigai holiday Feb 5 ───────────────
  {
    const e = earned(E[23], 21);
    const incWrong = kanIncWrong(E[23], 21);
    const epf = calcEPF(e.earned_basic, e.earned_da, e.earned_oa);
    const earnedGross = r2((9800 / WD) * 21);
    const esi = calcESI(earnedGross);
    const totE = r2(earnedGross + 0 + incWrong);
    const totD = r2(epf + esi);
    rows.push({ snapshot_id: PS.KAN_FEB, employee_id: E[23], month_year: MONTH,
      fixed_basic: 5500, fixed_hra: 1200, fixed_da: 2800, fixed_oa: 300, ...e,
      attendance_bonus: 0, incentive_amount: incWrong, staff_ot_amount: 0, worker_ot_amount: 0,
      epf_deducted: epf, esi_deducted: esi, pt_deducted: 0, tds_deducted: 0,
      loan_deducted: 0, advance_deducted: 0, lwf_deducted: 0, late_deducted: 0, misc_deducted: 0,
      total_earnings: totE, total_deductions: totD, net_pay: r2(totE - totD),
      cpf_amount: 0, lop_days: 1, layoff_days: 0, ot_hours: 0,
      efficiency_pct: LINE_B_EFF, achieved_days: LINE_B_ACHIEVED });
  }

  // ── E24 Ravi – M18 FAIL: deductions > 50% of earned gross ────────────────
  {
    const e = earned(E[24], 22);
    const incWrong = kanIncWrong(E[24], 22);
    const epf = calcEPF(e.earned_basic, e.earned_da, e.earned_oa);  // 1320
    const esi = calcESI(12500);                                       // 93.75
    const loanEMI = 5000;
    const totE = r2(12500 + 500 + incWrong);
    const totD = r2(epf + esi + loanEMI);
    rows.push({ snapshot_id: PS.KAN_FEB, employee_id: E[24], month_year: MONTH,
      fixed_basic: 7000, fixed_hra: 1500, fixed_da: 3500, fixed_oa: 500, ...e,
      attendance_bonus: 500, incentive_amount: incWrong, staff_ot_amount: 0, worker_ot_amount: 0,
      epf_deducted: epf, esi_deducted: esi, pt_deducted: 0, tds_deducted: 0,
      loan_deducted: loanEMI, advance_deducted: 0, lwf_deducted: 0, late_deducted: 0, misc_deducted: 0,
      total_earnings: totE, total_deductions: totD, net_pay: r2(totE - totD),
      cpf_amount: 0, lop_days: 0, layoff_days: 0, ot_hours: 0,
      efficiency_pct: LINE_B_EFF, achieved_days: LINE_B_ACHIEVED });
  }

  // ── E25 Jothi – M08 scope FAIL: Ironer paid production incentive ──────────
  {
    const e = earned(E[25], 22);
    const incWrong = kanIncWrong(E[25], 22);
    const epf = calcEPF(e.earned_basic, e.earned_da, e.earned_oa);
    const eg25 = eg(CTC[E[25]], 22);
    const esi = calcESI(eg25);
    const totE = r2(eg25 + 500 + incWrong);
    const totD = r2(epf + esi);
    rows.push({ snapshot_id: PS.KAN_FEB, employee_id: E[25], month_year: MONTH,
      fixed_basic: 7000, fixed_hra: 1400, fixed_da: 3000, fixed_oa: 400, ...e,
      attendance_bonus: 500, incentive_amount: incWrong, staff_ot_amount: 0, worker_ot_amount: 0,
      epf_deducted: epf, esi_deducted: esi, pt_deducted: 0, tds_deducted: 0,
      loan_deducted: 0, advance_deducted: 0, lwf_deducted: 0, late_deducted: 0, misc_deducted: 0,
      total_earnings: totE, total_deductions: totD, net_pay: r2(totE - totD),
      cpf_amount: 0, lop_days: 0, layoff_days: 0, ot_hours: 0,
      efficiency_pct: LINE_B_EFF, achieved_days: LINE_B_ACHIEVED });
  }

  // ── E26 Pandian – M07 FAIL (bonus paid) + M08 FAIL (incentive paid) ───────
  {
    const e = earned(E[26], 22);
    const incWrong = tkmInc(E[26], 22);
    const epf = calcEPF(e.earned_basic, e.earned_da, e.earned_oa);
    const eg26 = eg(CTC[E[26]], 22);
    const esi = calcESI(eg26);
    const totE = r2(eg26 + 500 + incWrong);
    const totD = r2(epf + esi);
    rows.push({ snapshot_id: PS.TKM_FEB, employee_id: E[26], month_year: MONTH,
      fixed_basic: 6000, fixed_hra: 1500, fixed_da: 3200, fixed_oa: 500, ...e,
      attendance_bonus: 500, incentive_amount: incWrong, staff_ot_amount: 0, worker_ot_amount: 0,
      epf_deducted: epf, esi_deducted: esi, pt_deducted: 0, tds_deducted: 0,
      loan_deducted: 0, advance_deducted: 0, lwf_deducted: 0, late_deducted: 0, misc_deducted: 0,
      total_earnings: totE, total_deductions: totD, net_pay: r2(totE - totD),
      cpf_amount: 0, lop_days: 0, layoff_days: 0, ot_hours: 0,
      efficiency_pct: LINE_A_EFF, achieved_days: LINE_A_ACHIEVED });
  }

  // ── E27 Ramu – M10 FAIL: epf_opted_in=false but EPF wrongly deducted ──────
  // Correct EPF = 0 (opted out). ERP deducts 12% × (6000+3200+500) = 1164.
  {
    const e = earned(E[27], 22);
    const inc = tkmInc(E[27], 22);
    const epfWrong = r2((e.earned_basic + e.earned_da + e.earned_oa) * 0.12); // 1164 – should be 0
    const esi = calcESI(r2(e.earned_basic + e.earned_da + e.earned_oa + e.earned_hra));
    const eg27 = eg(CTC[E[27]], 22);
    const totE = r2(eg27 + 500 + inc);
    const totD = r2(epfWrong + esi);  // FAIL M10: epf should be 0
    rows.push({ snapshot_id: PS.TKM_FEB, employee_id: E[27], month_year: MONTH,
      fixed_basic: 6000, fixed_hra: 1500, fixed_da: 3200, fixed_oa: 500, ...e,
      attendance_bonus: 500, incentive_amount: inc, staff_ot_amount: 0, worker_ot_amount: 0,
      epf_deducted: epfWrong,  // FAIL M10: employee opted out; should be 0
      esi_deducted: esi, pt_deducted: 0, tds_deducted: 0,
      loan_deducted: 0, advance_deducted: 0, lwf_deducted: 0, late_deducted: 0, misc_deducted: 0,
      total_earnings: totE, total_deductions: totD, net_pay: r2(totE - totD),
      cpf_amount: 0, lop_days: 0, layoff_days: 0, ot_hours: 0,
      efficiency_pct: LINE_A_EFF, achieved_days: LINE_A_ACHIEVED });
  }

  // ── E28 Preethi – D04 FAIL: 3rd late undeducted (pool exhausted after 2 days) ─
  // correct half-day deduction = 20800/22/2 = 472.73; ERP shows 0.
  {
    const e = earned(E[28], 22);
    const incWrong = kanStaffIncWrong(E[28], 2);
    const epf = 1800;  // base 18300 > 15000 → capped
    const esi = calcESI(20800);  // 20800 < 21000 → ESI applicable
    const correctLateDed = r2(20800 / WD / 2);  // 472.73
    const totE = r2(20800 + incWrong);
    const totD = r2(epf + esi + 0);  // FAIL D04/M16: late_deducted=0 (should be 472.73)
    rows.push({ snapshot_id: PS.KAN_FEB, employee_id: E[28], month_year: MONTH,
      fixed_basic: 13000, fixed_hra: 2500, fixed_da: 4500, fixed_oa: 800, ...e,
      attendance_bonus: 0, incentive_amount: incWrong, staff_ot_amount: 0, worker_ot_amount: 0,
      epf_deducted: epf, esi_deducted: esi, pt_deducted: 0, tds_deducted: 0,
      loan_deducted: 0, advance_deducted: 0, lwf_deducted: 0,
      late_deducted: 0,  // FAIL D04/M16: pool exhausted; 3rd late should have deducted 472.73 half-day
      misc_deducted: 0,
      total_earnings: totE, total_deductions: totD, net_pay: r2(totE - totD),
      cpf_amount: 0, lop_days: 0, layoff_days: 0, ot_hours: 0,
      efficiency_pct: LINE_B_EFF, achieved_days: LINE_B_ACHIEVED });
  }

  // ── E29 Selvi – M21 FAIL: layoff pay at wrong rate (full-day not half-day) ──
  // 3 layoff days. attendance_summary.layoff_days=3 matches payroll.layoff_days=3 (count OK).
  // Correct layoff pay = 11200/22/2 × 3 = 763.64 (half-day).
  // ERP wrong: 11200/22 × 3 = 1527.27 (full-day) → overpayment of 763.63.
  // We model this by: earned on 19 present days + wrong full-day layoff pay included in totE.
  {
    const presentDays = 19;
    const e = earned(E[29], presentDays);
    const incWrong = kanIncWrong(E[29], presentDays);
    const epf = calcEPF(e.earned_basic, e.earned_da, e.earned_oa);
    const esi = calcESI(r2(e.earned_basic + e.earned_da + e.earned_oa + e.earned_hra));
    const correctLayoffPay = r2(11200 / WD / 2 * 3);  // 763.64
    const wrongLayoffPay   = r2(11200 / WD     * 3);  // 1527.27 (ERP uses full-day rate)
    // ERP total_earnings inflated because it adds full-day layoff instead of half-day
    const totE = r2(eg(CTC[E[29]], presentDays) + wrongLayoffPay + incWrong);
    const totD = r2(epf + esi);
    rows.push({ snapshot_id: PS.KAN_FEB, employee_id: E[29], month_year: MONTH,
      fixed_basic: 6000, fixed_hra: 1500, fixed_da: 3200, fixed_oa: 500, ...e,
      attendance_bonus: 0,  // ineligible (3 layoff days → treated as absences for bonus)
      incentive_amount: incWrong, staff_ot_amount: 0, worker_ot_amount: 0,
      epf_deducted: epf, esi_deducted: esi, pt_deducted: 0, tds_deducted: 0,
      loan_deducted: 0, advance_deducted: 0, lwf_deducted: 0, late_deducted: 0, misc_deducted: 0,
      total_earnings: totE,  // FAIL M21: inflated by wrongLayoffPay - correctLayoffPay = 763.63
      total_deductions: totD, net_pay: r2(totE - totD),
      cpf_amount: 0, lop_days: 0,
      layoff_days: 3,  // count is CORRECT (unlike E9) – the RATE is wrong
      ot_hours: 0,
      efficiency_pct: LINE_B_EFF, achieved_days: LINE_B_ACHIEVED });
  }

  // ── E30 Anand R – M13 WARN: annual income ~₹12.84L (>₹12L), tds_deducted=0 ─
  // fixed_gross = 65000+12000+22000+8000 = 107000/month → ₹12.84L/year.
  // With staff incentive (wrong 11% slab) annual projection is even higher.
  // Stage ERP does not deduct TDS → WARN M13 (income clearly above ₹12L threshold).
  {
    const e = earned(E[30], 22);
    const incWrong = kanStaffIncWrong(E[30], 2);
    const totE = r2(107000 + incWrong);
    const totD = r2(1800 + 208);  // EPF capped + PT=208 (>30K)
    rows.push({ snapshot_id: PS.KAN_FEB, employee_id: E[30], month_year: MONTH,
      fixed_basic: 65000, fixed_hra: 12000, fixed_da: 22000, fixed_oa: 8000, ...e,
      attendance_bonus: 0, incentive_amount: incWrong, staff_ot_amount: 0, worker_ot_amount: 0,
      epf_deducted: 1800, esi_deducted: 0, pt_deducted: 208,
      tds_deducted: 0,  // WARN M13: annual ≈₹12.84L > ₹12L threshold; TDS should be reviewed
      loan_deducted: 0, advance_deducted: 0, lwf_deducted: 0, late_deducted: 0, misc_deducted: 0,
      total_earnings: totE, total_deductions: totD, net_pay: r2(totE - totD),
      cpf_amount: 0, lop_days: 0, layoff_days: 0, ot_hours: 0,
      efficiency_pct: LINE_B_EFF, achieved_days: LINE_B_ACHIEVED });
  }

  await ins('payroll_records', rows,
    `payroll_records Feb 2026 (${rows.length} rows – all 27 modules + v2 additions)`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 22 — PAYROLL RECORDS DEC 2025  (A24 Labour Welfare Fund)
// PASS: E1 lwf=20, E13 lwf=20
// FAIL: E7 lwf=0, E11 lwf=25 (wrong amount), E14 lwf=0
// ─────────────────────────────────────────────────────────────────────────────

async function seedPayrollRecordsDec() {
  const WD_DEC = 22;
  const decRow = (snapId, empId, presentDays, lwf) => {
    const c = CTC[empId];
    const fg = g(c);
    const eg_ = r2((fg / WD_DEC) * presentDays);
    const eb   = r2((c.basic / WD_DEC) * presentDays);
    const ehra = r2((c.hra   / WD_DEC) * presentDays);
    const eda  = r2((c.da    / WD_DEC) * presentDays);
    const eoa  = r2((c.oa    / WD_DEC) * presentDays);
    const epf  = calcEPF(eb, eda, eoa);
    const esi  = eg_ <= 21000 ? calcESI(eg_) : 0;
    const pt   = calcPT(eg_);
    const totD = r2(epf + esi + pt + lwf);
    return {
      snapshot_id: snapId, employee_id: empId, month_year: DEC_MONTH,
      fixed_basic: c.basic, fixed_hra: c.hra, fixed_da: c.da, fixed_oa: c.oa,
      earned_basic: eb, earned_hra: ehra, earned_da: eda, earned_oa: eoa,
      attendance_bonus: 0, incentive_amount: 0, staff_ot_amount: 0, worker_ot_amount: 0,
      epf_deducted: epf, esi_deducted: esi, pt_deducted: pt, tds_deducted: 0,
      loan_deducted: 0, advance_deducted: 0, lwf_deducted: lwf,
      late_deducted: 0, misc_deducted: 0,
      total_earnings: eg_, total_deductions: totD, net_pay: r2(eg_ - totD),
      cpf_amount: 0, lop_days: 0, layoff_days: 0, ot_hours: 0,
      efficiency_pct: 0, achieved_days: 0,
    };
  };

  const rows = [
    decRow(PS.TKM_DEC, E[1],  22, 20),  // PASS
    decRow(PS.TKM_DEC, E[7],  22,  0),  // FAIL A24: not deducted
    decRow(PS.TKM_DEC, E[11], 22, 25),  // FAIL A24: wrong amount (25 not 20)
    decRow(PS.KAN_DEC, E[13], 22, 20),  // PASS
    decRow(PS.KAN_DEC, E[14], 22,  0),  // FAIL A24: not deducted
  ];

  await ins('payroll_records', rows, `payroll_records Dec 2025 – A24 LWF (${rows.length} rows)`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 23 — LINE PRODUCTION DATA  (Feb 2026)
// ─────────────────────────────────────────────────────────────────────────────

async function seedLineProductionData() {
  await ins('line_production_data', [
    { factory_id: F1, month_year: MONTH,
      line_name: 'Line A', style_number: 'ST-2026-001', sam: 25,
      total_tailors: LINE_A_TAILORS, present_tailors: LINE_A_PRESENT,
      planned_days: 22, achieved_days: LINE_A_ACHIEVED,
      production_qty: 3200, efficiency_pct: LINE_A_EFF, incentive_type: 'production',
      notes: 'TKM Line A – 88% → slab 17% – M08 PASS' },
    { factory_id: F2, month_year: MONTH,
      line_name: 'Line B', style_number: 'ST-2026-002', sam: 25,
      total_tailors: LINE_B_TAILORS, present_tailors: LINE_B_PRESENT,
      planned_days: 22, achieved_days: LINE_B_ACHIEVED,
      production_qty: 2500, efficiency_pct: LINE_B_EFF, incentive_type: 'production',
      notes: 'Kandigai Line B – 78% → correct 8.5%; Stage ERP used 11% → M08 FAIL' },
    { factory_id: F2, month_year: MONTH,
      line_name: 'Finishing', style_number: null, sam: 0,
      total_tailors: 0, present_tailors: 0,
      planned_days: 22, achieved_days: 18, production_qty: 0,
      efficiency_pct: null, incentive_type: 'finishing',
      notes: 'M08 scope: E25 Jothi (Ironer) must NOT get production incentive' },
  ], 'line_production_data');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 24 — PERFORMANCE BONUS ACCRUAL  (Oct–Dec 2025, A25)
// E9: FAIL A25 – layoff days excluded from days_present (should be 22, ERP=20)
// ─────────────────────────────────────────────────────────────────────────────

async function seedPerformanceBonusAccrual() {
  const RATE = 0.0833;
  const accrual = (wage, wd, days) => r2((wage / wd) * days * RATE);
  const rows = [];

  const e1Wage = g(CTC[E[1]]);
  rows.push({ employee_id: E[1], month_year: '2025-10', bonus_period: 'OCT_MAR', employee_wage: e1Wage, working_days: 22, days_present: 22, bonus_rate: RATE, accrued_amount: accrual(e1Wage, 22, 22) });
  rows.push({ employee_id: E[1], month_year: '2025-11', bonus_period: 'OCT_MAR', employee_wage: e1Wage, working_days: 21, days_present: 21, bonus_rate: RATE, accrued_amount: accrual(e1Wage, 21, 21) });
  rows.push({ employee_id: E[1], month_year: '2025-12', bonus_period: 'OCT_MAR', employee_wage: e1Wage, working_days: 22, days_present: 22, bonus_rate: RATE, accrued_amount: accrual(e1Wage, 22, 22) });

  const e9Wage = g(CTC[E[9]]);
  // FAIL A25: layoff days wrongly excluded → days_present=20 (should be 22)
  rows.push({ employee_id: E[9], month_year: '2025-10', bonus_period: 'OCT_MAR', employee_wage: e9Wage, working_days: 22, days_present: 20, bonus_rate: RATE, accrued_amount: accrual(e9Wage, 22, 20) });
  rows.push({ employee_id: E[9], month_year: '2025-11', bonus_period: 'OCT_MAR', employee_wage: e9Wage, working_days: 21, days_present: 21, bonus_rate: RATE, accrued_amount: accrual(e9Wage, 21, 21) });
  rows.push({ employee_id: E[9], month_year: '2025-12', bonus_period: 'OCT_MAR', employee_wage: e9Wage, working_days: 22, days_present: 22, bonus_rate: RATE, accrued_amount: accrual(e9Wage, 22, 22) });

  // FAIL A25 — wrong bonus rate: E5 Dec 2025 uses 0.10 instead of 0.0833
  const e5Wage = g(CTC[E[5]]);
  rows.push({
    employee_id: E[5],
    month_year:  '2025-12',
    bonus_period: 'OCT_MAR',
    employee_wage: e5Wage,
    working_days: 22,
    days_present: 22,
    bonus_rate: 0.10,   // deliberate wrong rate
    accrued_amount: r2((e5Wage / 22) * 22 * 0.10)
  });
  await ins('performance_bonus_accrual', rows, `performance_bonus_accrual (${rows.length} rows)`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 25 — RECONCILIATION UPLOADS  (A27)
// TKM EPF: ECR matches → PASS
// KAN EPF: ECR ₹500 short → FAIL CRITICAL
// Both ESIC challans match → PASS
// ─────────────────────────────────────────────────────────────────────────────

async function seedReconciliationUploads() {
  // System EPF totals for Feb 2026
  const TKM_SYS_EPF = r2(
    1164 + 1164 + 1053.82 + 996 + 1065.27 + 1111.09 +
    2040 + 1104 + 1116 + 1800 + 1164 + 1164 +
    1164 + // E26 Pandian
    1164   // E27 Ramu (wrongly deducted, opted-out — still appears in ERP challan)
  );
  const KAN_SYS_EPF = r2(
    1680 + 1800 + 1800 + 1800 + 1800 + 1800 +
    1800 + 1800 + 634.91 + 1164 + 985.09 + 1320 +
    1680 + // E25 Jothi
    1800 + // E28 Preethi
    1164 + // E29 Selvi
    1800   // E30 Anand
  );

  const TKM_SYS_ESI = r2(84 + 84 + 74.45 + 71.25 + 76.6 + 80.18 + 142.5 + 78 + 79.5 + 0 + 86.34 + 86.86 + 84 + 84);
  const KAN_SYS_ESI = r2(120 + 0 + 0 + 0 + 0 + 0 + 0 + 156 + 45.82 + 84 + 70.16 + 93.75 + 87.75 + 156 + 84 + 0);

  await ins('reconciliation_uploads', [
    { factory_id: F1, month_year: MONTH, file_type: 'EPFO_ECR',
      storage_path: 'reconciliation/2026-02/tkm_ecr_feb2026.txt',
      total_amount: TKM_SYS_EPF, status: 'PENDING',
      notes: 'TKM V EPFO ECR Feb 2026 – matches system total → A27 PASS' },
    { factory_id: F2, month_year: MONTH, file_type: 'EPFO_ECR',
      storage_path: 'reconciliation/2026-02/kan_ecr_feb2026.txt',
      total_amount: r2(KAN_SYS_EPF - 500), status: 'PENDING',
      notes: 'Kandigai EPFO ECR Feb 2026 – ₹500 short vs system → A27 FAIL CRITICAL' },
    { factory_id: F1, month_year: MONTH, file_type: 'ESIC_CHALLAN',
      storage_path: 'reconciliation/2026-02/tkm_esic_feb2026.pdf',
      total_amount: TKM_SYS_ESI, status: 'PENDING',
      notes: 'TKM V ESIC Challan Feb 2026 – matches system → A27 PASS' },
    { factory_id: F2, month_year: MONTH, file_type: 'ESIC_CHALLAN',
      storage_path: 'reconciliation/2026-02/kan_esic_feb2026.pdf',
      total_amount: KAN_SYS_ESI, status: 'PENDING',
      notes: 'Kandigai ESIC Challan Feb 2026 – matches system → A27 PASS' },
  ], 'reconciliation_uploads');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 26 — USER PROFILES
// SKIPPED in seeder — user_profiles.id is the Supabase Auth UUID (not generated
// by this table). Inserting arbitrary UUIDs here will fail the FK to auth.users.
// Create users via the Supabase Auth dashboard or CLI first, then their profile
// rows are inserted automatically by the post-signup trigger (or manually via
// the Supabase table editor using the real Auth UUIDs).
// ─────────────────────────────────────────────────────────────────────────────

async function seedUserProfiles() {
  console.log('  ⚠  user_profiles skipped — create users via Supabase Auth dashboard first.');
  console.log('     (PK must be a real Supabase Auth UUID; seeder cannot generate them)');
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('  MAGNUM PAYROLL — COMBINED SEEDER v2  (gap-coverage build)');
  console.log('══════════════════════════════════════════════════════════════');
  console.log(`  Supabase URL : ${process.env.SUPABASE_URL}`);
  console.log(`  Seeding      : 30 employees × 2 factories`);
  console.log(`  Audit month  : Feb 2026 (WD=${WD})`);
  console.log(`  Dec month    : Dec 2025 (A24 LWF)`);
  console.log(`  Jan 2026     : E6 long absenteeism (D03)`);
  console.log(`  v2 additions : E27 M10-opt-out | E28 D04-pool | E29 M21-rate | E30 M13-warn`);
  console.log(`                 E16/E19 Feb OT punches (M09) | E27 round-off punch (D01)`);
  console.log('══════════════════════════════════════════════════════════════\n');

  const steps = [
    ['System Config',                    seedSystemConfig],
    ['Factories',                        seedFactories],
    ['Shifts',                           seedShifts],
    ['Employees (30)',                   seedEmployees],
    ['Employee Shifts',                  seedEmployeeShifts],
    ['CTC Records',                      seedCtcRecords],
    ['Minimum Wages',                    seedMinimumWages],
    ['Holiday Calendar',                 seedHolidayCalendar],
    ['Incentive Slabs',                  seedIncentiveSlabs],
    ['Attendance Bonus Config',          seedAttendanceBonusConfig],
    ['Perf Bonus Config (A25)',          seedPerformanceBonusConfig],
    ['Loan Ledger',                      seedLoanLedger],
    ['Advance Ledger',                   seedAdvanceLedger],
    ['EL Balance',                       seedElBalance],
    ['Compoff Ledger',                   seedCompoffLedger],
    ['ESI Cycle Enrollment',             seedEsiCycleEnrollment],
    ['Payroll Snapshots',                seedPayrollSnapshots],
    ['Savior Raw Punches',               seedSaviorRawPunches],
    ['Attendance Processed',             seedAttendanceProcessed],
    ['Monthly Att Summary (30)',         seedMonthlyAttendanceSummary],
    ['Payroll Records Feb 2026 (30)',    seedPayrollRecords],
    ['Payroll Records Dec 2025 (A24)',   seedPayrollRecordsDec],
    ['Line Production Data',             seedLineProductionData],
    ['Perf Bonus Accrual (A25)',         seedPerformanceBonusAccrual],
    ['Reconciliation Uploads',           seedReconciliationUploads],
    ['User Profiles',                    seedUserProfiles],
  ];

  let passed = 0;
  let failed = 0;
  for (const [label, fn] of steps) {
    process.stdout.write(`\n[${String(passed + failed + 1).padStart(2, '0')}] ${label} ... `);
    try {
      await fn();
      passed++;
    } catch (err) {
      console.error(`\n     ERROR: ${err.message}`);
      failed++;
      if (['Factories', 'Employees (30)'].includes(label)) {
        console.error('  ⚠  Foundational table failed – aborting.');
        break;
      }
    }
  }

  console.log('\n');
  console.log('══════════════════════════════════════════════════════════════');
  console.log(`  DONE  ✓ ${passed} sections passed  ✗ ${failed} sections failed`);
  console.log('══════════════════════════════════════════════════════════════');

  if (failed === 0) {
    console.log('\n  ✅  All mock data seeded.  Run n8n workflows to generate check_results.\n');
  } else {
    console.log('\n  ⚠  Some sections failed.  Review errors above.\n');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('\nFatal:', err);
  process.exit(1);
});