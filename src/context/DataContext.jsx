import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as mockData from '../data/mock'
import { supabase } from '../lib/supabase'

const DataContext = createContext(null)

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

export function DataProvider({ children, isMock = false }) {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSupabaseData = useCallback(async ({ rethrow = false } = {}) => {
    try {
      setIsLoading(true)
      setError(null)

      const queries = [
        { key: 'factories', query: supabase.from('factories').select('*') },
        { key: 'employees', query: supabase.from('employees').select('*') },
        { key: 'checkRuns', query: supabase.from('check_runs').select('*') },
        { key: 'checkResults', query: supabase.from('check_results').select('*, factories(name)') },
        { key: 'alerts', query: supabase.from('alerts').select('*, factories(name), check_results(module_code)') },
        { key: 'payrollRecords', query: supabase.from('payroll_records').select('*') },
        { key: 'minimumWages', query: supabase.from('minimum_wages').select('*') },
        { key: 'holidayCalendar', query: supabase.from('holiday_calendar').select('*') },
        { key: 'attendanceBonusConfig', query: supabase.from('attendance_bonus_config').select('*, factories(name)') },
        { key: 'incentiveSlabs', query: supabase.from('incentive_slabs').select('*') },
        { key: 'configAuditLog', query: supabase.from('config_audit_log').select('*') },
        { key: 'lwfTests', query: supabase.from('lwf_tests').select('*').maybeSingle(), optional: true },
        { key: 'performanceBonusAccrual', query: supabase.from('performance_bonus_accrual').select('*') },
        { key: 'elBalance', query: supabase.from('el_balance').select('*') },
      ]

      const results = await Promise.all(queries.map(({ query }) => query))
      const queryMap = Object.fromEntries(
        queries.map(({ key }, index) => [key, results[index]])
      )

      const failedQueries = queries
        .map(({ key, optional }) => ({ key, optional, error: queryMap[key].error }))
        .filter(({ error, optional }) => error && !optional)

      if (failedQueries.length) {
        const details = failedQueries
          .map(({ key, error: queryError }) => `${key}: ${queryError.message}`)
          .join(' | ')

        throw new Error(`Supabase query failed. ${details}`)
      }

      const fData = queryMap.factories.data
      const empData = queryMap.employees.data
      const crData = queryMap.checkRuns.data
      const resultsData = queryMap.checkResults.data
      const alertsData = queryMap.alerts.data
      const prData = queryMap.payrollRecords.data
      const mwData = queryMap.minimumWages.data
      const hcData = queryMap.holidayCalendar.data
      const abcData = queryMap.attendanceBonusConfig.data
      const isData = queryMap.incentiveSlabs.data
      const calData = queryMap.configAuditLog.data
      const pbData = queryMap.performanceBonusAccrual.data
      const elData = queryMap.elBalance.data

      // Map Factories
      const factories = (fData || []).map(f => {
        const factoryAlerts = (alertsData || []).filter(a => a.factory_id === f.id && a.status === 'NEW')
        const factoryResults = (resultsData || []).filter(r => r.factory_id === f.id)
        const passed = factoryResults.filter(r => r.status === 'PASS').length
        const score = factoryResults.length ? Math.round((passed / factoryResults.length) * 100) : 100

        return {
          id: f.id,
          name: f.name,
          zone: f.zone,
          location: f.state,
          isActive: f.is_active,
          score,
          alertCount: factoryAlerts.length
        }
      })

      // Map Check Runs
      const checkRuns = (crData || []).map(cr => ({
        id: cr.id,
        runType: cr.run_type,
        factoryId: cr.factory_id,
        period: cr.period,
        startedAt: cr.started_at,
        completedAt: cr.completed_at,
        status: cr.status,
        total: cr.total_checks,
        passed: cr.passed,
        failed: cr.failed,
        warnings: cr.warnings
      })).sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))

      // Map Alerts
      const alerts = (alertsData || []).map(a => ({
        id: a.id,
        checkResultId: a.check_result_id,
        factoryId: a.factory_id,
        factory: a.factories?.name || 'Unknown',
        severity: a.severity,
        module: a.check_results?.module_code || 'SYS',
        title: a.title,
        body: a.body,
        status: a.status,
        createdAt: a.created_at,
        acknowledgedBy: a.acknowledged_by,
        comments: [] // Missing comment mapping for brevity unless queried
      })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

      // Map Check Results (split by daily/monthly for the UI)
      const dailyModules = ['D01', 'D02', 'D03', 'D04']
      const dailyCheckResults = (resultsData || []).filter(r => dailyModules.includes(r.module_code)).map(r => ({
        id: r.id, runId: r.run_id, moduleCode: r.module_code, employeeId: r.employee_id, factoryId: r.factory_id,
        status: r.status, checkName: r.check_name, expected: r.expected_value, actual: r.actual_value,
        variance: r.variance, message: r.message, severity: r.severity, period: r.period
      }))

      const monthlyCheckResults = (resultsData || []).filter(r => !dailyModules.includes(r.module_code)).map(r => ({
        id: r.id, runId: r.run_id, moduleCode: r.module_code, employeeId: r.employee_id, factoryId: r.factory_id,
        status: r.status, checkName: r.check_name, expected: r.expected_value, actual: r.actual_value,
        variance: r.variance, message: r.message, severity: r.severity, period: r.period
      }))

      // Map Payroll Records
      const payrollRecords = (prData || []).map(pr => ({
        id: pr.id, employeeId: pr.employee_id, factoryId: pr.factory_id, monthYear: pr.month_year,
        fixedBasic: pr.fixed_basic, fixedHra: pr.fixed_hra, fixedDa: pr.fixed_da, fixedOa: pr.fixed_oa,
        presentDays: pr.achieved_days || 0, lopDays: pr.lop_days, layoffDays: pr.layoff_days, otHours: pr.ot_hours,
        earnedBasic: pr.earned_basic, earnedHra: pr.earned_hra, earnedDa: pr.earned_da, earnedOa: pr.earned_oa,
        attendanceBonus: pr.attendance_bonus, incentiveAmount: pr.incentive_amount, staffOtAmount: pr.staff_ot_amount,
        workerOtAmount: pr.worker_ot_amount, epfDeducted: pr.epf_deducted, esiDeducted: pr.esi_deducted,
        ptDeducted: pr.pt_deducted, tdsDeducted: pr.tds_deducted, loanDeducted: pr.loan_deducted,
        advanceDeducted: pr.advance_deducted, lwfDeducted: pr.lwf_deducted, lateDeducted: pr.late_deducted,
        miscDeducted: pr.misc_deducted, totalEarnings: pr.total_earnings, totalDeductions: pr.total_deductions,
        netPay: pr.net_pay, cpfAmount: pr.cpf_amount, efficiencyPct: pr.efficiency_pct, achievedDays: pr.achieved_days
      }))

      // Config and others
      const minimumWages = (mwData || []).map(mw => ({
        id: mw.id, zone: mw.zone, category: mw.category, grade: mw.grade,
        basic: mw.basic, da: mw.da, basicDa: mw.basic_da,
        effectiveFrom: mw.effective_from, effectiveTo: mw.effective_to
      }))
      const holidayCalendar = (hcData || []).map(hc => ({
        id: hc.id, factoryId: hc.factory_id, date: hc.holiday_date, name: hc.holiday_name, isNational: hc.is_national
      }))
      const attendanceBonusConfig = (abcData || []).map(abc => ({
        id: abc.id, factoryId: abc.factory_id, factory: abc.factories?.name,
        designation: abc.designation, bonusAmount: abc.bonus_amount, effectiveFrom: abc.effective_from
      }))
      const incentiveSlabs = (isData || []).map(islb => ({
        id: islb.id, effFrom: islb.efficiency_from, effTo: islb.efficiency_to, incentivePct: islb.incentive_pct
      }))
      const configAuditLog = (calData || []).map(cal => ({
        id: cal.id, tableName: cal.table_name, recordId: cal.record_id, operation: cal.operation,
        oldValues: cal.old_values, newValues: cal.new_values, changedBy: cal.changed_by, changedAt: cal.changed_at
      }))

      // Mapped Employees
      const employees = (empData || []).map(emp => ({
        id: emp.id, empNo: emp.emp_no, factoryId: emp.factory_id, name: emp.name,
        category: emp.category, designation: emp.designation, grade: emp.grade,
        zone: emp.zone, doj: emp.date_of_joining, isActive: emp.is_active
      }))

      // Derive trendData from Check Runs (grouping conditionally)
      // This is simplified. In a real scenario we use actual stats grouped by month.
      const trendData = mockData.trendData // fallback format
      // Generate some dummy Mispunches and long absences for UI demonstration if tables missing
      const mispunches = []
      const longAbsentees = []

      // Generate Annual Checks mock mappings for the UI
      const annualChecks = mockData.annualChecks 

      setData({
        factories,
        employees,
        checkRuns,
        dailyCheckResults,
        monthlyCheckResults,
        alerts,
        payrollRecords,
        minimumWages,
        holidayCalendar,
        attendanceBonusConfig,
        incentiveSlabs,
        configAuditLog,
        trendData,
        mispunches,
        longAbsentees,
        annualChecks
      })

      return true
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(err.message)
      if (rethrow) {
        throw err
      }
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshData = useCallback(() => fetchSupabaseData({ rethrow: true }), [fetchSupabaseData])

  useEffect(() => {
    if (isMock) {
      setData({
        factories: mockData.factories,
        employees: mockData.employees,
        checkRuns: mockData.checkRuns,
        dailyCheckResults: mockData.dailyCheckResults,
        monthlyCheckResults: mockData.monthlyCheckResults,
        alerts: mockData.alerts,
        payrollRecords: mockData.payrollRecords,
        minimumWages: mockData.minimumWages,
        holidayCalendar: mockData.holidayCalendar,
        attendanceBonusConfig: mockData.attendanceBonusConfig,
        incentiveSlabs: mockData.incentiveSlabs,
        configAuditLog: mockData.configAuditLog,
        trendData: mockData.trendData,
        mispunches: mockData.mispunches,
        longAbsentees: mockData.longAbsentees,
        annualChecks: mockData.annualChecks
      })
      setIsLoading(false)
    } else {
      fetchSupabaseData()
    }
  }, [isMock, fetchSupabaseData])

  return (
    <DataContext.Provider
      value={{
        data,
        isLoading,
        error,
        refreshData,
        isMock
      }}
    >
      {children}
    </DataContext.Provider>
  )
}
