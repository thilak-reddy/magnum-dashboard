// ─────────────────────────────────────────────────────────────
// MAGNUM PAYROLL VERIFICATION — MOCK DATA
// ─────────────────────────────────────────────────────────────

export const factories = [
  { id: 'f1', name: 'TKM V',          zone: 'C', location: 'Tiruvannamalai', isActive: true, score: 87, alertCount: 1 },
  { id: 'f2', name: 'TKM II',         zone: 'C', location: 'Tiruvannamalai', isActive: true, score: 56, alertCount: 5 },
  { id: 'f3', name: 'Kandigai',       zone: 'C', location: 'Kandigai',       isActive: true, score: 70, alertCount: 2 },
  { id: 'f4', name: 'Cheyyar',        zone: 'C', location: 'Cheyyar',        isActive: true, score: 94, alertCount: 0 },
  { id: 'f5', name: 'Kancheepuram',   zone: 'C', location: 'Kancheepuram',   isActive: true, score: 91, alertCount: 1 },
  { id: 'f6', name: 'Vellore',        zone: 'C', location: 'Vellore',        isActive: true, score: 88, alertCount: 0 },
  { id: 'f7', name: 'Tiruppur',       zone: 'C', location: 'Tiruppur',       isActive: true, score: 78, alertCount: 3 },
]

export const employees = [
  // TKM V (f1)
  { id: 'e01', empNo: 'TKM5-001', factoryId: 'f1', name: 'Kavitha Murugan',      category: 'worker', designation: 'Tailor',               grade: 'II', zone: 'C', doj: '2021-03-15', isActive: true },
  { id: 'e02', empNo: 'TKM5-002', factoryId: 'f1', name: 'Sujatha Ramachandran', category: 'staff',  designation: 'Factory Incharge',     grade: 'I',  zone: 'C', doj: '2018-07-01', isActive: true },
  { id: 'e03', empNo: 'TKM5-003', factoryId: 'f1', name: 'Priya Krishnamurthy',  category: 'staff',  designation: 'Production Manager',   grade: 'I',  zone: 'C', doj: '2019-02-10', isActive: true },
  { id: 'e04', empNo: 'TKM5-004', factoryId: 'f1', name: 'Rajan Subramanian',    category: 'worker', designation: 'Tailor',               grade: 'I',  zone: 'C', doj: '2020-08-20', isActive: true },
  { id: 'e05', empNo: 'TKM5-005', factoryId: 'f1', name: 'Karpakam Velu',        category: 'staff',  designation: 'IE Incharge',          grade: 'I',  zone: 'C', doj: '2017-11-05', isActive: true },
  { id: 'e06', empNo: 'TKM5-006', factoryId: 'f1', name: 'Murugesan Thangavel',  category: 'worker', designation: 'Helper',               grade: 'II', zone: 'C', doj: '2022-01-10', isActive: true },
  { id: 'e07', empNo: 'TKM5-007', factoryId: 'f1', name: 'Anitha Selvam',        category: 'worker', designation: 'Quality Checker',      grade: 'II', zone: 'C', doj: '2021-06-20', isActive: true },
  { id: 'e08', empNo: 'TKM5-008', factoryId: 'f1', name: 'Lakshmi Narayanan',    category: 'worker', designation: 'Tailor',               grade: 'I',  zone: 'C', doj: '2020-03-01', isActive: true },
  { id: 'e09', empNo: 'TKM5-009', factoryId: 'f1', name: 'Selvaraj Pillai',      category: 'mechanic', designation: 'Chief Mechanic',     grade: 'I',  zone: 'C', doj: '2016-09-12', isActive: true },
  { id: 'e10', empNo: 'TKM5-010', factoryId: 'f1', name: 'Meenakshi Sundaram',   category: 'worker', designation: 'Ironer',               grade: 'II', zone: 'C', doj: '2022-04-05', isActive: true },
  { id: 'e11', empNo: 'TKM5-011', factoryId: 'f1', name: 'Rajesh Palaniswamy',   category: 'staff',  designation: 'Cutting Incharge',     grade: 'I',  zone: 'C', doj: '2019-07-15', isActive: true },
  { id: 'e12', empNo: 'TKM5-012', factoryId: 'f1', name: 'Usha Venkatesan',      category: 'worker', designation: 'Packer',               grade: 'II', zone: 'C', doj: '2023-01-03', isActive: true },
  // Kandigai (f3)
  { id: 'e13', empNo: 'KAN-001',  factoryId: 'f3', name: 'Vijaya Anbazhagan',    category: 'staff',  designation: 'Factory Manager',      grade: 'I',  zone: 'C', doj: '2015-04-01', isActive: true },
  { id: 'e14', empNo: 'KAN-002',  factoryId: 'f3', name: 'Kumari Dhandapani',    category: 'worker', designation: 'Tailor',               grade: 'II', zone: 'C', doj: '2021-09-01', isActive: true },
  { id: 'e15', empNo: 'KAN-003',  factoryId: 'f3', name: 'Senthilkumar Ravi',    category: 'worker', designation: 'Tailor',               grade: 'I',  zone: 'C', doj: '2020-05-15', isActive: true },
  { id: 'e16', empNo: 'KAN-004',  factoryId: 'f3', name: 'Malathi Suresh',       category: 'staff',  designation: 'Finishing Incharge',   grade: 'I',  zone: 'C', doj: '2018-12-10', isActive: true },
  { id: 'e17', empNo: 'KAN-005',  factoryId: 'f3', name: 'Balamurugan Natarajan',category: 'worker', designation: 'Helper',               grade: 'II', zone: 'C', doj: '2022-06-20', isActive: true },
  { id: 'e18', empNo: 'KAN-006',  factoryId: 'f3', name: 'Revathi Kaliyamurthy', category: 'worker', designation: 'Quality Checker',      grade: 'II', zone: 'C', doj: '2021-11-01', isActive: true },
]

// ─── CHECK RUNS ─────────────────────────────────────────────
export const checkRuns = [
  { id: 'cr1', runType: 'DAILY',   factoryId: 'f1', period: '2026-03-26', startedAt: '2026-03-27T00:32:01Z', completedAt: '2026-03-27T00:32:47Z', status: 'COMPLETED', total: 48,  passed: 44, failed: 3, warnings: 1 },
  { id: 'cr2', runType: 'DAILY',   factoryId: 'f3', period: '2026-03-26', startedAt: '2026-03-27T00:33:10Z', completedAt: '2026-03-27T00:33:52Z', status: 'COMPLETED', total: 48,  passed: 42, failed: 4, warnings: 2 },
  { id: 'cr3', runType: 'MONTHLY', factoryId: 'f1', period: '2026-02',    startedAt: '2026-03-01T02:31:00Z', completedAt: '2026-03-01T02:34:20Z', status: 'COMPLETED', total: 228, passed: 198, failed: 17, warnings: 13 },
  { id: 'cr4', runType: 'MONTHLY', factoryId: 'f3', period: '2026-02',    startedAt: '2026-03-01T02:35:00Z', completedAt: '2026-03-01T02:38:40Z', status: 'COMPLETED', total: 216, passed: 152, failed: 43, warnings: 21 },
  { id: 'cr5', runType: 'ANNUAL',  factoryId: null,  period: '2026',       startedAt: '2026-01-01T06:00:00Z', completedAt: '2026-01-01T06:12:00Z', status: 'COMPLETED', total: 112, passed: 98, failed: 9, warnings: 5 },
]

// ─── DAILY CHECK RESULTS ────────────────────────────────────
export const dailyCheckResults = [
  // D01 Pipeline Health
  { id: 'dcr01', runId: 'cr1', moduleCode: 'D01', employeeId: null,  factoryId: 'f1', status: 'PASS', checkName: 'Attendance data received', expected: 'Data by 11 AM',      actual: 'Received 06:02 AM', variance: null, message: 'Savior data synced on time', severity: 'LOW',    period: '2026-03-26' },
  { id: 'dcr02', runId: 'cr1', moduleCode: 'D01', employeeId: null,  factoryId: 'f1', status: 'PASS', checkName: 'Record count match',        expected: '12 records',          actual: '12 records',        variance: 0,    message: 'All records synced correctly', severity: 'HIGH',   period: '2026-03-26' },
  { id: 'dcr03', runId: 'cr1', moduleCode: 'D01', employeeId: 'e06', factoryId: 'f1', status: 'WARN', checkName: 'Employee ID match',         expected: 'ID in master',        actual: 'Not found in master', variance: null, message: 'Murugesan Thangavel empNo not matched — may be new joiner', severity: 'MEDIUM', period: '2026-03-26' },
  // D02 Punch Validation
  { id: 'dcr04', runId: 'cr1', moduleCode: 'D02', employeeId: 'e01', factoryId: 'f1', status: 'FAIL', checkName: 'Missing OUT punch',         expected: 'OUT punch exists',    actual: 'No OUT punch',      variance: null, message: 'Kavitha Murugan has no OUT punch on 26-Mar', severity: 'HIGH',    period: '2026-03-26' },
  { id: 'dcr05', runId: 'cr1', moduleCode: 'D02', employeeId: 'e04', factoryId: 'f1', status: 'PASS', checkName: 'Punch sequence valid',      expected: 'IN → OUT',            actual: 'IN 08:57, OUT 17:35', variance: null, message: 'Valid punch sequence', severity: 'MEDIUM',  period: '2026-03-26' },
  { id: 'dcr06', runId: 'cr1', moduleCode: 'D02', employeeId: 'e02', factoryId: 'f1', status: 'PASS', checkName: 'Punch sequence valid',      expected: 'IN → OUT',            actual: 'IN 09:06, OUT 17:32', variance: null, message: 'Valid punch sequence', severity: 'MEDIUM',  period: '2026-03-26' },
  { id: 'dcr07', runId: 'cr1', moduleCode: 'D02', employeeId: 'e08', factoryId: 'f1', status: 'PASS', checkName: 'Punch sequence valid',      expected: 'IN → OUT',            actual: 'IN 08:52, OUT 17:41', variance: null, message: 'Valid punch sequence', severity: 'MEDIUM',  period: '2026-03-26' },
  // D03 Attendance Calculation
  { id: 'dcr08', runId: 'cr1', moduleCode: 'D03', employeeId: 'e02', factoryId: 'f1', status: 'WARN', checkName: 'EL before LOP — Staff',    expected: 'EL deducted first',   actual: 'LOP marked directly', variance: null, message: 'Sujatha Ramachandran has EL balance but LOP was marked', severity: 'HIGH',   period: '2026-03-26' },
  { id: 'dcr09', runId: 'cr1', moduleCode: 'D03', employeeId: 'e05', factoryId: 'f1', status: 'WARN', checkName: 'EL before LOP — Staff',    expected: 'EL deducted first',   actual: 'LOP marked directly', variance: null, message: 'Karpakam Velu has EL balance but LOP was marked', severity: 'HIGH',   period: '2026-03-26' },
  { id: 'dcr10', runId: 'cr1', moduleCode: 'D03', employeeId: 'e04', factoryId: 'f1', status: 'PASS', checkName: 'Attendance status',         expected: 'Present',             actual: 'P',                 variance: null, message: 'Attendance correctly marked Present', severity: 'MEDIUM', period: '2026-03-26' },
  // D04 Late/Early
  { id: 'dcr11', runId: 'cr1', moduleCode: 'D04', employeeId: 'e02', factoryId: 'f1', status: 'PASS', checkName: 'Staff grace period',        expected: 'IN by 09:10',         actual: 'IN 09:06',          variance: null, message: 'Within grace period — no deduction', severity: 'MEDIUM',  period: '2026-03-26' },
  { id: 'dcr12', runId: 'cr1', moduleCode: 'D04', employeeId: 'e03', factoryId: 'f1', status: 'FAIL', checkName: 'Staff late >9:30',          expected: 'Full-day deduction',  actual: 'No deduction applied', variance: null, message: 'Priya Krishnamurthy punched IN at 09:47 — full-day deduction required', severity: 'HIGH', period: '2026-03-26' },
  { id: 'dcr13', runId: 'cr1', moduleCode: 'D04', employeeId: 'e04', factoryId: 'f1', status: 'PASS', checkName: 'Worker punctuality',        expected: 'On time',             actual: 'IN 08:57',          variance: null, message: 'Worker punched in on time', severity: 'LOW',    period: '2026-03-26' },
]

// Long absenteeism flag
export const longAbsentees = [
  { employeeId: 'e06', employeeName: 'Murugesan Thangavel', factoryId: 'f1', factoryName: 'TKM V', absentSince: '2026-03-14', consecutiveDays: 13, lastReasonRecorded: null },
]

// Mispunches
export const mispunches = [
  { employeeId: 'e01', employeeName: 'Kavitha Murugan', empNo: 'TKM5-001', factoryId: 'f1', date: '2026-03-26', type: 'MISSING_OUT', timeIn: '09:02', timeOut: null, note: 'Savior shows no OUT record — HR to verify and manual-override before payroll close' },
]

// ─── MONTHLY PAYROLL RECORDS ─────────────────────────────────
export const payrollRecords = [
  { id: 'pr01', employeeId: 'e01', factoryId: 'f1', monthYear: '2026-03', fixedBasic: 8200,  fixedHra: 2460, fixedDa: 1800, fixedOa: 600,  presentDays: 25, lopDays: 1, layoffDays: 0, otHours: 4.5,  earnedBasic: 7884, earnedHra: 2365, earnedDa: 1731, earnedOa: 577,  attendanceBonus: 500,  incentiveAmount: 1620, staffOtAmount: 0,   workerOtAmount: 318, epfDeducted: 1460, esiDeducted: 119, ptDeducted: 0,   tdsDeducted: 0, loanDeducted: 0,    advanceDeducted: 0, lwfDeducted: 0, lateDeducted: 0, miscDeducted: 0, totalEarnings: 14995, totalDeductions: 1579, netPay: 13416, cpfAmount: 0, efficiencyPct: 88.5, achievedDays: 22 },
  { id: 'pr02', employeeId: 'e02', factoryId: 'f1', monthYear: '2026-03', fixedBasic: 14500, fixedHra: 4350, fixedDa: 2900, fixedOa: 1200, presentDays: 24, lopDays: 2, layoffDays: 0, otHours: 0,    earnedBasic: 13538, earnedHra: 4063, earnedDa: 2708, earnedOa: 1120, attendanceBonus: 0,    incentiveAmount: 2850, staffOtAmount: 0,   workerOtAmount: 0,   epfDeducted: 1800, esiDeducted: 0,   ptDeducted: 135, tdsDeducted: 0, loanDeducted: 0,    advanceDeducted: 0, lwfDeducted: 0, lateDeducted: 0, miscDeducted: 0, totalEarnings: 24279, totalDeductions: 1935, netPay: 22344, cpfAmount: 0, efficiencyPct: 88.5, achievedDays: 22 },
  { id: 'pr03', employeeId: 'e03', factoryId: 'f1', monthYear: '2026-03', fixedBasic: 18000, fixedHra: 5400, fixedDa: 3600, fixedOa: 1500, presentDays: 26, lopDays: 0, layoffDays: 0, otHours: 0,    earnedBasic: 18000, earnedHra: 5400, earnedDa: 3600, earnedOa: 1500, attendanceBonus: 0,    incentiveAmount: 5700, staffOtAmount: 0,   workerOtAmount: 0,   epfDeducted: 1800, esiDeducted: 0,   ptDeducted: 208, tdsDeducted: 0, loanDeducted: 0,    advanceDeducted: 0, lwfDeducted: 0, lateDeducted: 0, miscDeducted: 0, totalEarnings: 34200, totalDeductions: 2008, netPay: 32192, cpfAmount: 0, efficiencyPct: 88.5, achievedDays: 22 },
  { id: 'pr04', employeeId: 'e04', factoryId: 'f1', monthYear: '2026-03', fixedBasic: 9200,  fixedHra: 2760, fixedDa: 2100, fixedOa: 700,  presentDays: 26, lopDays: 0, layoffDays: 0, otHours: 12,   earnedBasic: 9200, earnedHra: 2760, earnedDa: 2100, earnedOa: 700,  attendanceBonus: 500,  incentiveAmount: 1850, staffOtAmount: 0,   workerOtAmount: 1056, epfDeducted: 1800, esiDeducted: 0,   ptDeducted: 135, tdsDeducted: 0, loanDeducted: 1500, advanceDeducted: 0, lwfDeducted: 0, lateDeducted: 0, miscDeducted: 0, totalEarnings: 18166, totalDeductions: 3435, netPay: 14731, cpfAmount: 0, efficiencyPct: 88.5, achievedDays: 22 },
  { id: 'pr05', employeeId: 'e05', factoryId: 'f1', monthYear: '2026-03', fixedBasic: 15500, fixedHra: 4650, fixedDa: 3100, fixedOa: 1300, presentDays: 25, lopDays: 1, layoffDays: 0, otHours: 0,    earnedBasic: 14923, earnedHra: 4481, earnedDa: 2981, earnedOa: 1252, attendanceBonus: 0,    incentiveAmount: 2990, staffOtAmount: 0,   workerOtAmount: 0,   epfDeducted: 1800, esiDeducted: 0,   ptDeducted: 208, tdsDeducted: 0, loanDeducted: 0,    advanceDeducted: 2000, lwfDeducted: 0, lateDeducted: 0, miscDeducted: 0, totalEarnings: 26627, totalDeductions: 4008, netPay: 22619, cpfAmount: 0, efficiencyPct: 88.5, achievedDays: 22 },
  { id: 'pr06', employeeId: 'e06', factoryId: 'f1', monthYear: '2026-03', fixedBasic: 7800,  fixedHra: 2340, fixedDa: 1600, fixedOa: 500,  presentDays: 20, lopDays: 6, layoffDays: 0, otHours: 0,    earnedBasic: 6000, earnedHra: 1800, earnedDa: 1231, earnedOa: 385,  attendanceBonus: 0,    incentiveAmount: 0,    staffOtAmount: 0,   workerOtAmount: 0,   epfDeducted: 1114, esiDeducted: 71,  ptDeducted: 0,   tdsDeducted: 0, loanDeducted: 0,    advanceDeducted: 0, lwfDeducted: 0, lateDeducted: 0, miscDeducted: 0, totalEarnings: 9416,  totalDeductions: 1185, netPay: 8231,  cpfAmount: 0, efficiencyPct: 0,    achievedDays: 0 },
  { id: 'pr07', employeeId: 'e07', factoryId: 'f1', monthYear: '2026-03', fixedBasic: 8500,  fixedHra: 2550, fixedDa: 1900, fixedOa: 600,  presentDays: 26, lopDays: 0, layoffDays: 0, otHours: 0,    earnedBasic: 8500, earnedHra: 2550, earnedDa: 1900, earnedOa: 600,  attendanceBonus: 300,  incentiveAmount: 1700, staffOtAmount: 0,   workerOtAmount: 0,   epfDeducted: 1200, esiDeducted: 111, ptDeducted: 0,   tdsDeducted: 0, loanDeducted: 0,    advanceDeducted: 0, lwfDeducted: 0, lateDeducted: 0, miscDeducted: 0, totalEarnings: 15550, totalDeductions: 1311, netPay: 14239, cpfAmount: 0, efficiencyPct: 88.5, achievedDays: 22 },
  { id: 'pr08', employeeId: 'e08', factoryId: 'f1', monthYear: '2026-03', fixedBasic: 9800,  fixedHra: 2940, fixedDa: 2200, fixedOa: 800,  presentDays: 25, lopDays: 1, layoffDays: 0, otHours: 6,    earnedBasic: 9423, earnedHra: 2827, earnedDa: 2115, earnedOa: 769,  attendanceBonus: 0,    incentiveAmount: 1960, staffOtAmount: 0,   workerOtAmount: 530, epfDeducted: 1735, esiDeducted: 0,   ptDeducted: 0,   tdsDeducted: 0, loanDeducted: 0,    advanceDeducted: 0, lwfDeducted: 0, lateDeducted: 0, miscDeducted: 0, totalEarnings: 17624, totalDeductions: 1735, netPay: 15889, cpfAmount: 0, efficiencyPct: 88.5, achievedDays: 22 },
  { id: 'pr09', employeeId: 'e09', factoryId: 'f1', monthYear: '2026-03', fixedBasic: 16000, fixedHra: 4800, fixedDa: 3200, fixedOa: 1400, presentDays: 26, lopDays: 0, layoffDays: 0, otHours: 18,   earnedBasic: 16000, earnedHra: 4800, earnedDa: 3200, earnedOa: 1400, attendanceBonus: 0,    incentiveAmount: 3200, staffOtAmount: 1050, workerOtAmount: 0,  epfDeducted: 1800, esiDeducted: 0,   ptDeducted: 208, tdsDeducted: 0, loanDeducted: 0,    advanceDeducted: 0, lwfDeducted: 0, lateDeducted: 0, miscDeducted: 0, totalEarnings: 29650, totalDeductions: 2008, netPay: 27642, cpfAmount: 0, efficiencyPct: 88.5, achievedDays: 22 },
  { id: 'pr10', employeeId: 'e10', factoryId: 'f1', monthYear: '2026-03', fixedBasic: 7600,  fixedHra: 2280, fixedDa: 1550, fixedOa: 450,  presentDays: 26, lopDays: 0, layoffDays: 0, otHours: 0,    earnedBasic: 7600, earnedHra: 2280, earnedDa: 1550, earnedOa: 450,  attendanceBonus: 300,  incentiveAmount: 0,    staffOtAmount: 0,   workerOtAmount: 0,   epfDeducted: 1159, esiDeducted: 90,  ptDeducted: 0,   tdsDeducted: 0, loanDeducted: 0,    advanceDeducted: 0, lwfDeducted: 0, lateDeducted: 0, miscDeducted: 0, totalEarnings: 12180, totalDeductions: 1249, netPay: 10931, cpfAmount: 0, efficiencyPct: 0,    achievedDays: 0 },
  { id: 'pr11', employeeId: 'e11', factoryId: 'f1', monthYear: '2026-03', fixedBasic: 13000, fixedHra: 3900, fixedDa: 2600, fixedOa: 1100, presentDays: 24, lopDays: 2, layoffDays: 0, otHours: 0,    earnedBasic: 12000, earnedHra: 3600, earnedDa: 2400, earnedOa: 1015, attendanceBonus: 0,    incentiveAmount: 2600, staffOtAmount: 0,   workerOtAmount: 0,   epfDeducted: 1800, esiDeducted: 0,   ptDeducted: 135, tdsDeducted: 0, loanDeducted: 0,    advanceDeducted: 0, lwfDeducted: 0, lateDeducted: 0, miscDeducted: 0, totalEarnings: 21615, totalDeductions: 1935, netPay: 19680, cpfAmount: 0, efficiencyPct: 88.5, achievedDays: 22 },
  { id: 'pr12', employeeId: 'e12', factoryId: 'f1', monthYear: '2026-03', fixedBasic: 7200,  fixedHra: 2160, fixedDa: 1450, fixedOa: 400,  presentDays: 23, lopDays: 3, layoffDays: 0, otHours: 0,    earnedBasic: 6369, earnedHra: 1910, earnedDa: 1283, earnedOa: 354,  attendanceBonus: 0,    incentiveAmount: 0,    staffOtAmount: 0,   workerOtAmount: 0,   epfDeducted: 1120, esiDeducted: 73,  ptDeducted: 0,   tdsDeducted: 0, loanDeducted: 0,    advanceDeducted: 0, lwfDeducted: 0, lateDeducted: 0, miscDeducted: 0, totalEarnings: 9916,  totalDeductions: 1193, netPay: 8723,  cpfAmount: 0, efficiencyPct: 0,    achievedDays: 0 },
]

// Intentional check failures baked into some records
// pr01: EPF slightly off (should be 1454, got 1460)
// pr06: LOP days mismatch (6 LOP but attendance says 5)
// pr07: Incentive wrong (worker, quality checker not eligible for production incentive)

// ─── MONTHLY CHECK RESULTS ───────────────────────────────────
export const monthlyCheckResults = [
  // M05 Gross
  { id: 'mc01', moduleCode: 'M05', employeeId: 'e01', factoryId: 'f1', monthYear: '2026-03', status: 'PASS', checkName: 'Earned gross',     expected: '₹12,557',  actual: '₹12,557', variance: 0,     message: 'Earned gross matches calculation', severity: 'HIGH'   },
  { id: 'mc02', moduleCode: 'M05', employeeId: 'e04', factoryId: 'f1', monthYear: '2026-03', status: 'PASS', checkName: 'Earned gross',     expected: '₹14,760',  actual: '₹14,760', variance: 0,     message: 'Earned gross matches calculation', severity: 'HIGH'   },
  { id: 'mc03', moduleCode: 'M05', employeeId: 'e06', factoryId: 'f1', monthYear: '2026-03', status: 'FAIL', checkName: 'Earned gross',     expected: '₹9,108',   actual: '₹9,416',  variance: 308,   message: 'Earned gross does not match — LOP days discrepancy (5 vs 6 LOP days)', severity: 'HIGH' },
  // M06 Min Wage
  { id: 'mc04', moduleCode: 'M06', employeeId: 'e01', factoryId: 'f1', monthYear: '2026-03', status: 'PASS', checkName: 'Min wage compliance', expected: '≥ ₹10,000', actual: '₹10,000', variance: 0, message: 'Basic+DA meets minimum wage', severity: 'CRITICAL' },
  { id: 'mc05', moduleCode: 'M06', employeeId: 'e12', factoryId: 'f1', monthYear: '2026-03', status: 'FAIL', checkName: 'Min wage compliance', expected: '≥ ₹8,650', actual: '₹8,650', variance: 0, message: 'PASS — basic+DA meets minimum', severity: 'CRITICAL' },
  // M07 Attendance Bonus
  { id: 'mc06', moduleCode: 'M07', employeeId: 'e01', factoryId: 'f1', monthYear: '2026-03', status: 'PASS', checkName: 'Attendance bonus', expected: '₹500',    actual: '₹500',   variance: 0,     message: 'Attendance bonus correct — eligible (0 absent, 0 late)', severity: 'HIGH'   },
  { id: 'mc07', moduleCode: 'M07', employeeId: 'e06', factoryId: 'f1', monthYear: '2026-03', status: 'PASS', checkName: 'Attendance bonus', expected: '₹0',      actual: '₹0',     variance: 0,     message: 'Not eligible — 6 absent days. Bonus correctly ₹0', severity: 'HIGH'   },
  { id: 'mc08', moduleCode: 'M07', employeeId: 'e10', factoryId: 'f1', monthYear: '2026-03', status: 'FAIL', checkName: 'Attendance bonus', expected: '₹0',      actual: '₹300',   variance: -300,  message: 'Meenakshi Sundaram is an Ironer — finishing incentive, NOT attendance bonus', severity: 'HIGH' },
  // M08 Incentive
  { id: 'mc09', moduleCode: 'M08', employeeId: 'e01', factoryId: 'f1', monthYear: '2026-03', status: 'PASS', checkName: 'Worker incentive', expected: '₹1,620',  actual: '₹1,620', variance: 0,     message: 'Incentive at 17% (88.5% efficiency) correct', severity: 'HIGH'   },
  { id: 'mc10', moduleCode: 'M08', employeeId: 'e07', factoryId: 'f1', monthYear: '2026-03', status: 'FAIL', checkName: 'Worker incentive', expected: '₹0',      actual: '₹1,700', variance: -1700, message: 'Quality Checker not in production line — incorrect incentive applied', severity: 'HIGH' },
  // M09 OT
  { id: 'mc11', moduleCode: 'M09', employeeId: 'e04', factoryId: 'f1', monthYear: '2026-03', status: 'PASS', checkName: 'Worker OT',        expected: '₹1,056',  actual: '₹1,056', variance: 0,     message: 'OT rate (8200÷26÷8×2) × 12hrs correct', severity: 'HIGH'   },
  { id: 'mc12', moduleCode: 'M09', employeeId: 'e09', factoryId: 'f1', monthYear: '2026-03', status: 'PASS', checkName: 'Staff OT',         expected: '₹1,050',  actual: '₹1,050', variance: 0,     message: '3 qualifying OT days × ₹350 correct', severity: 'HIGH'   },
  // M10 EPF
  { id: 'mc13', moduleCode: 'M10', employeeId: 'e01', factoryId: 'f1', monthYear: '2026-03', status: 'FAIL', checkName: 'EPF deduction',    expected: '₹1,454',  actual: '₹1,460', variance: -6,    message: 'EPF over-deducted by ₹6 — rounding difference in earned base', severity: 'HIGH' },
  { id: 'mc14', moduleCode: 'M10', employeeId: 'e04', factoryId: 'f1', monthYear: '2026-03', status: 'PASS', checkName: 'EPF capped at ₹1,800', expected: '₹1,800', actual: '₹1,800', variance: 0, message: 'EPF base >₹15k — correctly capped at ₹1,800', severity: 'HIGH' },
  // M11 ESI
  { id: 'mc15', moduleCode: 'M11', employeeId: 'e01', factoryId: 'f1', monthYear: '2026-03', status: 'PASS', checkName: 'ESI deduction',    expected: '₹119',    actual: '₹119',   variance: 0,     message: '0.75% of ₹15,880 (incl. OT) correct', severity: 'HIGH'   },
  { id: 'mc16', moduleCode: 'M11', employeeId: 'e07', factoryId: 'f1', monthYear: '2026-03', status: 'FAIL', checkName: 'ESI not deducted', expected: 'ESI ₹111', actual: '₹111',   variance: 0,     message: 'ESI correct', severity: 'HIGH'   },
  // M12 PT
  { id: 'mc17', moduleCode: 'M12', employeeId: 'e02', factoryId: 'f1', monthYear: '2026-03', status: 'PASS', checkName: 'Professional Tax', expected: '₹135',    actual: '₹135',   variance: 0,     message: 'PT slab ₹21k–₹30k = ₹135 correct', severity: 'MEDIUM'  },
  // M13 TDS
  { id: 'mc18', moduleCode: 'M13', employeeId: 'e03', factoryId: 'f1', monthYear: '2026-03', status: 'WARN', checkName: 'TDS check',        expected: 'Review annual', actual: '₹0', variance: null, message: 'Priya K annual projection ~₹4.1L — no TDS needed. Within ₹12L limit.', severity: 'MEDIUM' },
  // M14 Loan
  { id: 'mc19', moduleCode: 'M14', employeeId: 'e04', factoryId: 'f1', monthYear: '2026-03', status: 'PASS', checkName: 'Loan EMI',         expected: '₹1,500',  actual: '₹1,500', variance: 0,     message: 'Loan EMI correctly deducted — 8 of 12 installments paid', severity: 'HIGH'   },
  // M15 Advance
  { id: 'mc20', moduleCode: 'M15', employeeId: 'e05', factoryId: 'f1', monthYear: '2026-03', status: 'PASS', checkName: 'Salary advance',   expected: '₹2,000',  actual: '₹2,000', variance: 0,     message: 'Advance from Feb correctly deducted in Feb', severity: 'HIGH'   },
  // M16 Late deduction
  { id: 'mc21', moduleCode: 'M16', employeeId: 'e01', factoryId: 'f1', monthYear: '2026-03', status: 'PASS', checkName: 'Late deduction',   expected: '₹0',      actual: '₹0',     variance: 0,     message: 'No late instances — no deduction', severity: 'MEDIUM'  },
  // M17 LOP
  { id: 'mc22', moduleCode: 'M17', employeeId: 'e06', factoryId: 'f1', monthYear: '2026-03', status: 'FAIL', checkName: 'LOP match',        expected: '5 LOP days', actual: '6 LOP days in payroll', variance: null, message: 'LOP mismatch — attendance shows 5 days, payroll used 6 days', severity: 'HIGH' },
  // M18 50% cap
  { id: 'mc23', moduleCode: 'M18', employeeId: 'e04', factoryId: 'f1', monthYear: '2026-03', status: 'PASS', checkName: '50% deduction cap', expected: '≤₹7,083', actual: '₹1,935', variance: null, message: 'Total deductions well within 50% cap', severity: 'CRITICAL' },
  // M19-M23 Others
  { id: 'mc24', moduleCode: 'M19', employeeId: 'e01', factoryId: 'f1', monthYear: '2026-03', status: 'PASS', checkName: 'CPF adjustment',   expected: '₹0',      actual: '₹0',     variance: 0,     message: 'No CPF carry-forward drift', severity: 'LOW'     },
  { id: 'mc25', moduleCode: 'M20', employeeId: 'e01', factoryId: 'f1', monthYear: '2026-03', status: 'PASS', checkName: 'Holiday pay',      expected: 'P on holidays', actual: '2 holidays marked P', variance: null, message: 'Republic Day and Pongal marked Present correctly', severity: 'MEDIUM' },
  { id: 'mc26', moduleCode: 'M21', employeeId: 'e06', factoryId: 'f1', monthYear: '2026-03', status: 'PASS', checkName: 'Layoff pay',       expected: 'No layoff', actual: 'No layoff', variance: null, message: 'No layoff recorded — OK', severity: 'MEDIUM' },
  { id: 'mc27', moduleCode: 'M22', employeeId: 'e09', factoryId: 'f1', monthYear: '2026-03', status: 'PASS', checkName: 'Comp-off',         expected: 'Compoff not in OT', actual: 'Compoff isolated', variance: null, message: '3.5 compoff hrs not flowing into OT — correct', severity: 'HIGH' },
  { id: 'mc28', moduleCode: 'M23', employeeId: 'e01', factoryId: 'f1', monthYear: '2026-03', status: 'FAIL', checkName: 'Net pay',          expected: '₹13,422', actual: '₹13,416', variance: -6,    message: 'Net pay off by ₹6 — trace to EPF rounding (M10)', severity: 'CRITICAL' },
  { id: 'mc29', moduleCode: 'M23', employeeId: 'e03', factoryId: 'f1', monthYear: '2026-03', status: 'PASS', checkName: 'Net pay',          expected: '₹32,192', actual: '₹32,192', variance: 0,     message: 'Net pay reconciles exactly', severity: 'CRITICAL' },
]

// ─── ANNUAL CHECK RESULTS (flat, UI-ready) ───────────────────
export const annualCheckResults = [
  // A24 – Labour Welfare Fund
  { id: 'acr01', moduleCode: 'A24', employeeId: 'e01', factoryId: 'f1', checkName: 'LWF deduction check', expected: '₹20', actual: '₹20', variance: null,  severity: 'LOW',  status: 'PASS', message: null },
  { id: 'acr02', moduleCode: 'A24', employeeId: 'e02', factoryId: 'f1', checkName: 'LWF deduction check', expected: '₹20', actual: '₹20', variance: null,  severity: 'LOW',  status: 'PASS', message: null },
  { id: 'acr03', moduleCode: 'A24', employeeId: 'e04', factoryId: 'f1', checkName: 'LWF deduction check', expected: '₹20', actual: '₹0',  variance: 20,    severity: 'HIGH', status: 'FAIL', message: 'LWF not deducted in December. Rajan Subramanian — ₹20 missing.' },
  { id: 'acr04', moduleCode: 'A24', employeeId: 'e06', factoryId: 'f1', checkName: 'LWF deduction check', expected: '₹20', actual: '₹20', variance: null,  severity: 'LOW',  status: 'PASS', message: null },
  // A25 – Performance Bonus Audit
  { id: 'acr05', moduleCode: 'A25', employeeId: 'e01', factoryId: 'f1', checkName: 'Bonus accrual vs payout', expected: '₹5,108', actual: '₹5,108', variance: null, severity: 'LOW',  status: 'PASS', message: null },
  { id: 'acr06', moduleCode: 'A25', employeeId: 'e04', factoryId: 'f1', checkName: 'Bonus accrual vs payout', expected: '₹5,726', actual: '₹5,600', variance: 126,  severity: 'HIGH', status: 'FAIL', message: 'Rajan Subramanian — bonus short by ₹126. Accrued ₹5,726 vs paid ₹5,600.' },
  { id: 'acr07', moduleCode: 'A25', employeeId: 'e02', factoryId: 'f1', checkName: 'Bonus accrual vs payout', expected: '₹9,031', actual: '₹9,031', variance: null, severity: 'LOW',  status: 'PASS', message: null },
  // A26 – Earned Leave Encashment
  { id: 'acr08', moduleCode: 'A26', employeeId: 'e02', factoryId: 'f1', checkName: 'EL encashment check', expected: '₹6,143',  actual: '₹6,143',  variance: null, severity: 'LOW',    status: 'PASS', message: null },
  { id: 'acr09', moduleCode: 'A26', employeeId: 'e03', factoryId: 'f1', checkName: 'EL encashment check', expected: '₹10,385', actual: '₹10,385', variance: null, severity: 'LOW',    status: 'PASS', message: null },
  { id: 'acr10', moduleCode: 'A26', employeeId: 'e05', factoryId: 'f1', checkName: 'EL encashment check', expected: '₹7,173',  actual: '₹7,000',  variance: 173,  severity: 'HIGH',   status: 'FAIL', message: 'Karpakam Velu — encashment short by ₹173. Calculated ₹7,173 vs paid ₹7,000.' },
  { id: 'acr11', moduleCode: 'A26', employeeId: 'e01', factoryId: 'f1', checkName: 'EL encashment check', expected: '₹0',      actual: '₹0',      variance: null, severity: 'MEDIUM', status: 'WARN', message: 'Worker EL found — not eligible. Kavitha Murugan has 4 EL days but is classified as worker.' },
  // A27 – EPF / ESI Reconciliation (factory-level checks, no employeeId)
  { id: 'acr12', moduleCode: 'A27', employeeId: null, factoryId: 'f1', checkName: 'EPF system vs ECR',       expected: '₹1,86,400', actual: '₹1,86,400', variance: 0,   severity: 'LOW',  status: 'PASS', message: null },
  { id: 'acr13', moduleCode: 'A27', employeeId: null, factoryId: 'f1', checkName: 'ESI system vs challan',   expected: '₹21,840',   actual: '₹21,480',   variance: 360, severity: 'HIGH', status: 'FAIL', message: 'ESI challan short by ₹360. System total ₹21,840 vs challan ₹21,480.' },
  { id: 'acr14', moduleCode: 'A27', employeeId: null, factoryId: 'f1', checkName: 'Bank bulk vs net pay sum', expected: '₹21,84,320', actual: '₹21,83,960', variance: 360, severity: 'HIGH', status: 'FAIL', message: 'Bank transfer short by ₹360. Bulk payment ₹21,84,320 vs net pay sum ₹21,83,960.' },
]

// ─── ANNUAL CHECK RESULTS (raw, module-keyed) ────────────────
export const annualChecks = {
  a24: [
    { employeeId: 'e01', name: 'Kavitha Murugan',      factoryId: 'f1', lwfDeducted: 20, expected: 20, status: 'PASS' },
    { employeeId: 'e02', name: 'Sujatha Ramachandran', factoryId: 'f1', lwfDeducted: 20, expected: 20, status: 'PASS' },
    { employeeId: 'e04', name: 'Rajan Subramanian',    factoryId: 'f1', lwfDeducted: 0,  expected: 20, status: 'FAIL' },
    { employeeId: 'e06', name: 'Murugesan Thangavel',  factoryId: 'f1', lwfDeducted: 20, expected: 20, status: 'PASS' },
  ],
  a25: [
    { employeeId: 'e01', name: 'Kavitha Murugan',      factoryId: 'f1', monthlyAccruals: [842,842,842,842,842,898], totalAccrued: 5108, paidBonus: 5108, status: 'PASS' },
    { employeeId: 'e04', name: 'Rajan Subramanian',    factoryId: 'f1', monthlyAccruals: [944,944,944,944,944,1006], totalAccrued: 5726, paidBonus: 5600, status: 'FAIL', variance: 126 },
    { employeeId: 'e02', name: 'Sujatha Ramachandran', factoryId: 'f1', monthlyAccruals: [1490,1490,1490,1490,1490,1581], totalAccrued: 9031, paidBonus: 9031, status: 'PASS' },
  ],
  a26: [
    { employeeId: 'e02', name: 'Sujatha Ramachandran', category: 'staff', elBalance: 8.5, encashmentCalc: 6143,  encashmentPaid: 6143,  status: 'PASS' },
    { employeeId: 'e03', name: 'Priya Krishnamurthy',  category: 'staff', elBalance: 12,  encashmentCalc: 10385, encashmentPaid: 10385, status: 'PASS' },
    { employeeId: 'e05', name: 'Karpakam Velu',        category: 'staff', elBalance: 9,   encashmentCalc: 7173,  encashmentPaid: 7000,  status: 'FAIL', variance: 173 },
    { employeeId: 'e01', name: 'Kavitha Murugan',      category: 'worker', elBalance: 4,  encashmentCalc: 0,     encashmentPaid: 0,     status: 'WARN', message: 'Worker EL found — not eligible' },
  ],
  a27: {
    epfSystemTotal: 186400,
    epfEcrTotal:    186400,
    epfVariance:    0,
    esiSystemTotal:  21840,
    esiChallanTotal: 21480,
    esiVariance:       360,
    bankBulkPayment: 2184320,
    netPaySum:       2183960,
    bankVariance:        360,
    status: 'FAIL',
  }
}

// ─── ALERTS ──────────────────────────────────────────────────
export const alerts = [
  { id: 'a01', checkResultId: 'mc28', factoryId: 'f1', factory: 'TKM V',       severity: 'CRITICAL', module: 'M23', title: 'Net pay mismatch — Kavitha Murugan',          body: 'Net pay off by ₹6. EPF rounding error in M10 flows to M23.',           status: 'NEW',          createdAt: '2026-03-01T02:34:12Z', acknowledgedBy: null, comments: [] },
  { id: 'a02', checkResultId: 'mc10', factoryId: 'f1', factory: 'TKM V',       severity: 'HIGH',     module: 'M08', title: 'Wrong incentive — Anitha Selvam',               body: 'Quality Checker applied production incentive. Expected ₹0.',           status: 'NEW',          createdAt: '2026-03-01T02:34:18Z', acknowledgedBy: null, comments: [] },
  { id: 'a03', checkResultId: 'mc03', factoryId: 'f1', factory: 'TKM V',       severity: 'HIGH',     module: 'M05', title: 'Gross mismatch — Murugesan Thangavel',          body: 'Earned gross ₹308 higher than calculated. LOP day count differs.',     status: 'ACKNOWLEDGED', createdAt: '2026-03-01T02:34:05Z', acknowledgedBy: 'Divya (Central HR)', acknowledgedAt: '2026-03-01T09:21:00Z', comments: [{ author: 'Divya', time: '2026-03-01T09:21Z', body: 'Verified with factory HR — attendance sheet had error. Will be corrected in March payroll.' }] },
  { id: 'a04', checkResultId: 'mc22', factoryId: 'f1', factory: 'TKM V',       severity: 'HIGH',     module: 'M17', title: 'LOP mismatch — Murugesan Thangavel',            body: 'Payroll shows 6 LOP days. Attendance processed shows 5 days.',         status: 'ACKNOWLEDGED', createdAt: '2026-03-01T02:34:06Z', acknowledgedBy: 'Divya (Central HR)', acknowledgedAt: '2026-03-01T09:22:00Z', comments: [] },
  { id: 'a05', checkResultId: 'mc13', factoryId: 'f1', factory: 'TKM V',       severity: 'HIGH',     module: 'M10', title: 'EPF over-deducted — Kavitha Murugan',           body: 'EPF ₹1,460 deducted vs expected ₹1,454. Over by ₹6.',                  status: 'NEW',          createdAt: '2026-03-01T02:34:10Z', acknowledgedBy: null, comments: [] },
  { id: 'a06', checkResultId: 'mc08', factoryId: 'f1', factory: 'TKM V',       severity: 'MEDIUM',   module: 'M07', title: 'Wrong bonus category — Meenakshi Sundaram',    body: 'Ironer received attendance bonus. Should receive finishing incentive.',  status: 'NEW',          createdAt: '2026-03-01T02:34:14Z', acknowledgedBy: null, comments: [] },
  { id: 'a07', checkResultId: 'dcr04', factoryId: 'f1', factory: 'TKM V',      severity: 'HIGH',     module: 'D02', title: 'Missing OUT punch — Kavitha Murugan',           body: 'No OUT punch recorded on Mar 26. Manual override needed.',             status: 'NEW',          createdAt: '2026-03-27T00:32:44Z', acknowledgedBy: null, comments: [] },
  { id: 'a08', checkResultId: 'dcr12', factoryId: 'f1', factory: 'TKM V',      severity: 'HIGH',     module: 'D04', title: 'Late >9:30 not penalised — Priya Krishnamurthy', body: 'Staff punched IN at 09:47. Full-day deduction not applied in Stage ERP.', status: 'NEW',        createdAt: '2026-03-27T00:32:46Z', acknowledgedBy: null, comments: [] },
  { id: 'a09', checkResultId: null,    factoryId: 'f2', factory: 'TKM II',      severity: 'CRITICAL', module: 'M06', title: 'Min wage violation — 3 workers',                body: '3 Tailor Gr. II workers paid below C Zone minimum ₹9,560.',            status: 'NEW',          createdAt: '2026-03-01T02:38:00Z', acknowledgedBy: null, comments: [] },
  { id: 'a10', checkResultId: null,    factoryId: 'f3', factory: 'Kandigai',    severity: 'CRITICAL', module: 'M10', title: 'EPF over-deducted — Rajan S',                  body: 'EPF ₹2,160 deducted vs cap of ₹1,800. Employee base >₹15k.',           status: 'NEW',          createdAt: '2026-03-01T02:38:10Z', acknowledgedBy: null, comments: [] },
  { id: 'a11', checkResultId: null,    factoryId: 'f7', factory: 'Tiruppur',    severity: 'HIGH',     module: 'M18', title: '50% cap breached — Suresh K',                  body: 'Loan + advance = ₹9,800 on earned gross of ₹18,200. Exceeds 50% cap.', status: 'RESOLVED',     createdAt: '2026-03-01T02:40:00Z', acknowledgedBy: 'Meena (Central HR)', resolvedAt: '2026-03-05T11:00:00Z', comments: [{ author: 'Meena', time: '2026-03-02T10:00Z', body: 'Payroll team has been notified. Advance will be split across two months.' }] },
]

// ─── TREND DATA ───────────────────────────────────────────────
export const trendData = [
  { month: 'Oct', pass: 312, fail: 48, warn: 24 },
  { month: 'Nov', pass: 298, fail: 62, warn: 31 },
  { month: 'Dec', pass: 334, fail: 42, warn: 18 },
  { month: 'Jan', pass: 287, fail: 78, warn: 29 },
  { month: 'Feb', pass: 318, fail: 55, warn: 22 },
  { month: 'Mar', pass: 301, fail: 51, warn: 19 },
]

// ─── MINIMUM WAGES ────────────────────────────────────────────
export const minimumWages = [
  { id: 'mw01', zone: 'C', category: 'Tailor',            grade: 'I',  basic: 5980, da: 4020, basicDa: 10000, effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31' },
  { id: 'mw02', zone: 'C', category: 'Tailor',            grade: 'II', basic: 5300, da: 3700, basicDa: 9000,  effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31' },
  { id: 'mw03', zone: 'C', category: 'Helper',            grade: 'II', basic: 4900, da: 3500, basicDa: 8400,  effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31' },
  { id: 'mw04', zone: 'C', category: 'Quality Checker',   grade: 'II', basic: 5100, da: 3600, basicDa: 8700,  effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31' },
  { id: 'mw05', zone: 'C', category: 'Factory Manager',   grade: 'I',  basic: 9500, da: 6000, basicDa: 15500, effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31' },
  { id: 'mw06', zone: 'C', category: 'Mechanic',          grade: 'I',  basic: 7200, da: 5000, basicDa: 12200, effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31' },
  { id: 'mw07', zone: 'C', category: 'Ironer',            grade: 'II', basic: 4800, da: 3400, basicDa: 8200,  effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31' },
  { id: 'mw08', zone: 'C', category: 'Packer',            grade: 'II', basic: 4700, da: 3300, basicDa: 8000,  effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31' },
  { id: 'mw09', zone: 'B', category: 'IE',                grade: 'I',  basic: 8000, da: 5500, basicDa: 13500, effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31' },
  { id: 'mw10', zone: 'C', category: 'Tailor',            grade: 'I',  basic: 6200, da: 4300, basicDa: 10500, effectiveFrom: '2026-04-01', effectiveTo: null },
  { id: 'mw11', zone: 'C', category: 'Tailor',            grade: 'II', basic: 5500, da: 3900, basicDa: 9400,  effectiveFrom: '2026-04-01', effectiveTo: null },
]

// ─── HOLIDAY CALENDAR ─────────────────────────────────────────
export const holidayCalendar = [
  { id: 'h01', factoryId: null, date: '2026-01-14', name: 'Pongal',                 isNational: false },
  { id: 'h02', factoryId: null, date: '2026-01-15', name: 'Thiruvalluvar Day',      isNational: false },
  { id: 'h03', factoryId: null, date: '2026-01-16', name: 'Uzhavar Thirunal',       isNational: false },
  { id: 'h04', factoryId: null, date: '2026-01-26', name: 'Republic Day',           isNational: true  },
  { id: 'h05', factoryId: null, date: '2026-02-26', name: 'Maha Shivaratri',        isNational: false },
  { id: 'h06', factoryId: null, date: '2026-03-31', name: 'Good Friday',            isNational: true  },
  { id: 'h07', factoryId: null, date: '2026-04-14', name: 'Dr. Ambedkar Jayanthi', isNational: true  },
  { id: 'h08', factoryId: null, date: '2026-05-01', name: 'Labour Day',             isNational: true  },
  { id: 'h09', factoryId: null, date: '2026-08-15', name: 'Independence Day',       isNational: true  },
  { id: 'h10', factoryId: null, date: '2026-10-02', name: 'Gandhi Jayanti',         isNational: true  },
  { id: 'h11', factoryId: null, date: '2026-11-01', name: 'Diwali',                 isNational: false },
  { id: 'h12', factoryId: null, date: '2026-12-25', name: 'Christmas',              isNational: true  },
]

// ─── ATTENDANCE BONUS CONFIG ──────────────────────────────────
export const attendanceBonusConfig = [
  { id: 'ab01', factoryId: 'f1', factory: 'TKM V',    designation: 'Tailor',              bonusAmount: 500, effectiveFrom: '2025-04-01' },
  { id: 'ab02', factoryId: 'f1', factory: 'TKM V',    designation: 'Helper',              bonusAmount: 300, effectiveFrom: '2025-04-01' },
  { id: 'ab03', factoryId: 'f1', factory: 'TKM V',    designation: 'Quality Checker',     bonusAmount: 300, effectiveFrom: '2025-04-01' },
  { id: 'ab04', factoryId: 'f1', factory: 'TKM V',    designation: 'Ironer',              bonusAmount: 300, effectiveFrom: '2025-04-01' },
  { id: 'ab05', factoryId: 'f1', factory: 'TKM V',    designation: 'Packer',              bonusAmount: 300, effectiveFrom: '2025-04-01' },
  { id: 'ab06', factoryId: 'f3', factory: 'Kandigai', designation: 'Tailor',              bonusAmount: 500, effectiveFrom: '2025-04-01' },
  { id: 'ab07', factoryId: 'f3', factory: 'Kandigai', designation: 'Helper',              bonusAmount: 300, effectiveFrom: '2025-04-01' },
]

// ─── INCENTIVE SLABS ──────────────────────────────────────────
export const incentiveSlabs = [
  { id: 'is01', effFrom: 67,   effTo: 70,   incentivePct: 4   },
  { id: 'is02', effFrom: 71,   effTo: 73,   incentivePct: 5   },
  { id: 'is03', effFrom: 74,   effTo: 77,   incentivePct: 6.5 },
  { id: 'is04', effFrom: 78,   effTo: 80,   incentivePct: 8.5 },
  { id: 'is05', effFrom: 80.1, effTo: 83,   incentivePct: 11  },
  { id: 'is06', effFrom: 83.1, effTo: 86,   incentivePct: 14  },
  { id: 'is07', effFrom: 86.1, effTo: 91,   incentivePct: 17  },
  { id: 'is08', effFrom: 91.1, effTo: 94,   incentivePct: 20  },
  { id: 'is09', effFrom: 94.1, effTo: 96,   incentivePct: 23  },
  { id: 'is10', effFrom: 96.1, effTo: 100,  incentivePct: 25  },
  { id: 'is11', effFrom: 101,  effTo: 104,  incentivePct: 30  },
]

// ─── CONFIG AUDIT LOG ─────────────────────────────────────────
export const configAuditLog = [
  { id: 'cal01', tableName: 'minimum_wages',       recordId: 'mw10', operation: 'INSERT', oldValues: null, newValues: { category: 'Tailor', grade: 'I', basicDa: 10500 }, changedBy: 'Divya (Central HR)', changedAt: '2026-03-15T10:22:00Z' },
  { id: 'cal02', tableName: 'minimum_wages',       recordId: 'mw11', operation: 'INSERT', oldValues: null, newValues: { category: 'Tailor', grade: 'II', basicDa: 9400 }, changedBy: 'Divya (Central HR)', changedAt: '2026-03-15T10:23:00Z' },
  { id: 'cal03', tableName: 'attendance_bonus_config', recordId: 'ab06', operation: 'UPDATE', oldValues: { bonusAmount: 450 }, newValues: { bonusAmount: 500 }, changedBy: 'Meena (Central HR)', changedAt: '2026-03-10T14:15:00Z' },
  { id: 'cal04', tableName: 'holiday_calendar',    recordId: 'h12', operation: 'INSERT', oldValues: null, newValues: { name: 'Christmas', date: '2026-12-25' }, changedBy: 'Admin', changedAt: '2026-01-02T09:00:00Z' },
  { id: 'cal05', tableName: 'incentive_slabs',     recordId: 'is11', operation: 'UPDATE', oldValues: { incentivePct: 28 }, newValues: { incentivePct: 30 }, changedBy: 'Divya (Central HR)', changedAt: '2026-02-01T11:30:00Z' },
]

// ─── HELPERS ──────────────────────────────────────────────────
export const moduleNames = {
  D01: 'Pipeline Health',  D02: 'Punch Validation',    D03: 'Attendance Calc',  D04: 'Late / Early',
  M05: 'Gross Salary',     M06: 'Minimum Wage',         M07: 'Attendance Bonus', M08: 'Incentive',
  M09: 'Overtime',         M10: 'EPF',                  M11: 'ESI',              M12: 'Prof. Tax',
  M13: 'TDS',              M14: 'Loan Deductions',      M15: 'Salary Advance',   M16: 'Late Deduction',
  M17: 'Absence / LOP',   M18: '50% Cap',              M19: 'CPF Adjustment',   M20: 'Holiday Pay',
  M21: 'Layoff Pay',       M22: 'Comp Off',             M23: 'Net Pay',
  A24: 'Labour Welfare',   A25: 'Perf. Bonus Audit',   A26: 'Earned Leave',     A27: 'EPF/ESI Recon',
}

export const formatINR = (n) => {
  if (n == null) return '—'
  return '₹' + Number(n).toLocaleString('en-IN')
}

export const fmtDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
}

export const fmtTime = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

export const fmtDateTime = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}
