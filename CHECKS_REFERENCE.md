<!-- markdownlint-disable -->
# Check Results Reference — Severity & Status

## Status

| Status | Meaning | Action Required |
|--------|---------|-----------------|
| **PASS** | The check ran and the actual value matches the expected value within tolerance. | None — record is clean. |
| **FAIL** | The actual value does not match the expected value. A real discrepancy exists in the payroll or attendance data. | Must be investigated and corrected before payroll is finalised. |
| **WARN** | The check ran but the result is ambiguous or needs human judgement. The system cannot definitively call it a pass or fail. | HR or payroll team should review and decide. |
| **SKIP** | The check was not applicable to this employee (e.g. a worker-only rule applied to a staff member) or the required data was missing. | No action unless the skip itself is unexpected. |

---

## Severity

Severity describes the **business impact** of a FAIL or WARN on that check — it does not change based on whether the check passed.

| Severity | When it is used | Examples |
|----------|----------------|---------|
| **CRITICAL** | Statutory compliance risk. A failure here can result in legal liability, government penalties, or employee rights violation. | Minimum wage breach (M06), net pay mismatch (M23), 50% deduction cap breach (M18), EPF/ESI reconciliation against challan (A27) |
| **HIGH** | Significant financial error affecting employee take-home or statutory deductions. Needs correction before the pay run is processed. | Gross salary mismatch (M05), EPF deduction wrong (M10), incentive applied to ineligible employee (M08), OT calculation error (M09), LOP mismatch (M17), bonus shortfall (A25), EL encashment shortfall (A26), missing OUT punch (D02), EL used before LOP for staff (D03), late deduction missing (D04) |
| **MEDIUM** | A process or data quality issue that is unlikely to cause an immediate financial error but should be resolved to keep records clean. | Employee ID not found in master (D01), punch sequence anomaly, professional tax slab check (M12), TDS projection review (M13), holiday pay (M20), layoff pay (M21), comp-off isolation (M22), EL found for an ineligible worker (A26) |
| **LOW** | Informational check. A pass here confirms that a routine rule was satisfied. Failures are minor and low-risk. | Attendance data received on time (D01), worker punctuality (D04), CPF carry-forward drift (M19), LWF deduction (A24), bonus accrual for passing employees (A25), EPF/ESI system vs ECR for passing runs (A27) |

---

## Severity vs Status — How They Interact

Severity is a property of the **check rule itself**, not the outcome. A CRITICAL check can PASS (meaning the critical rule was satisfied — good). A LOW check can FAIL (minor issue, low urgency).

| Combination | Interpretation |
|-------------|----------------|
| CRITICAL + FAIL | Highest priority — statutory violation. Fix immediately. |
| CRITICAL + WARN | Statutory rule needs human review before payroll is locked. |
| CRITICAL + PASS | Critical rule verified and clean. |
| HIGH + FAIL | Financial error in the pay record. Correct before payment. |
| HIGH + WARN | Likely fine but needs a manual check (e.g. EL vs LOP decision). |
| MEDIUM + FAIL | Process issue — fix in current cycle if possible. |
| LOW + FAIL | Minor discrepancy — log and address in next cycle. |

---

## Module Reference

### Daily Checks (D-series)

| Code | Name | What it checks | Typical Severity |
|------|------|----------------|-----------------|
| D01 | Pipeline Health | Savior attendance data arrived before 11 AM, record counts match, employee IDs exist in master | LOW – MEDIUM |
| D02 | Punch Validation | First punch = IN, last punch = OUT. Flags missing IN or OUT as mispunch. Early punch detection. | MEDIUM – HIGH |
| D03 | Attendance Calc | Holiday = Present, staff EL balance checked before LOP, worker absent without leave = LOP, layoff = half-day | MEDIUM – HIGH |
| D04 | Late / Early | Staff: 09:00–09:10 grace, 09:11–09:30 half-day, >09:30 full-day. Workers: no grace, late hours reduce paid hours. | MEDIUM – HIGH |

### Monthly Checks (M-series)

| Code | Name | What it checks | Typical Severity |
|------|------|----------------|-----------------|
| M05 | Gross Salary | Earned gross = (fixed gross ÷ working days) × present days | HIGH |
| M06 | Minimum Wage | Basic + DA ≥ applicable minimum wage for zone/category | CRITICAL |
| M07 | Attendance Bonus | Bonus eligibility and amount based on absent/late count | HIGH |
| M08 | Incentive | Production incentive applied only to eligible designations at correct efficiency slab | HIGH |
| M09 | Overtime | OT rate = (basic ÷ 26 ÷ 8 × 2) × OT hours for workers; qualifying OT days × flat rate for staff | HIGH |
| M10 | EPF | 12% of earned basic, capped at ₹1,800 (base ≤ ₹15,000) | HIGH |
| M11 | ESI | 0.75% of gross (incl. OT) for employees with gross ≤ ₹21,000 | HIGH |
| M12 | Prof. Tax | PT slab deduction based on gross pay band (state-specific) | MEDIUM |
| M13 | TDS | Annual income projection checked against ₹12L new regime limit | MEDIUM |
| M14 | Loan Deductions | EMI amount and instalment count match the loan agreement | HIGH |
| M15 | Salary Advance | Advance recovery deducted in the correct month and amount | HIGH |
| M16 | Late Deduction | Late deductions applied correctly per the D04 rule output | MEDIUM |
| M17 | Absence / LOP | LOP days in payroll match attendance record | HIGH |
| M18 | 50% Cap | Total deductions do not exceed 50% of gross earnings (Payment of Wages Act) | CRITICAL |
| M19 | CPF Adjustment | CPF carry-forward from prior months has not drifted | LOW |
| M20 | Holiday Pay | National/festival holidays marked Present and paid correctly | MEDIUM |
| M21 | Layoff Pay | Layoff compensation calculated at 50% basic+DA where applicable | MEDIUM |
| M22 | Comp Off | Comp-off hours are isolated and not double-counted in OT | HIGH |
| M23 | Net Pay | Net pay = total earnings − total deductions (final reconciliation) | CRITICAL |

### Annual Checks (A-series)

| Code | Name | What it checks | Typical Severity |
|------|------|----------------|-----------------|
| A24 | Labour Welfare | LWF deducted in December at the correct slab | LOW – HIGH |
| A25 | Perf. Bonus Audit | Statutory bonus accrual (Oct–Mar cycle) matches payout | LOW – HIGH |
| A26 | Earned Leave | EL encashment amount matches accrued balance at year-end; worker EL eligibility verified | LOW – HIGH |
| A27 | EPF/ESI Recon | System-computed EPF/ESI totals reconcile against ECR filing and bank bulk transfer | LOW – HIGH |
