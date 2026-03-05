import type { Population, CalcResult, ScenarioRow } from '../types'

/** גיל פרישה מינימלי לפי אוכלוסייה (MVP – ללא מדרגות לפי שנת פרישה) */
export const MIN_RETIREMENT_AGE: Record<Population, number> = {
  'חוד': 45,
  'מינהלה': 53,
  'מודיעין ואבטחה': 46.5,
  'טכנולוגיה': 46.5,
}

/**
 * אחוז צבירה תקציבי
 * accrualRate = min(0.70, 0.02 * eligibleYears)
 */
export function calcAccrualRate(eligibleYears: number): number {
  return Math.min(0.70, 0.02 * eligibleYears)
}

/**
 * קצבה תקציבית רעיונית (חודשית)
 * = שכר קובע * אחוז צבירה
 */
export function calcBudgetPension(determiningWage: number, eligibleYears: number): number {
  return determiningWage * calcAccrualRate(eligibleYears)
}

/**
 * יתרה צבורה בעת הפרישה
 * Compound growth + PMT formula (annual contributions)
 * r = ריאלי שנתי
 * If yearsUntilRetirement = 0 → returns currentBalance directly (minus withdrawals handled outside)
 */
export function calcBalanceAtRetirement(
  currentBalance: number,
  monthlyContribution: number,
  annualReturn: number, // e.g. 0.04 for 4%
  yearsUntilRetirement: number,
): number {
  if (yearsUntilRetirement <= 0) return Math.max(0, currentBalance)
  const r = annualReturn
  const n = yearsUntilRetirement
  const annualContrib = monthlyContribution * 12

  if (r === 0) {
    return currentBalance + annualContrib * n
  }

  const growthFactor = Math.pow(1 + r, n)
  const balancePV = currentBalance * growthFactor
  const contribFV = annualContrib * ((growthFactor - 1) / r)
  return balancePV + contribFV
}

/**
 * יתרה בגיל 67 (ללא הפקדות לאחר פרישה)
 */
export function calcBalanceAt67(
  balanceAtRetirement: number,
  annualReturn: number,
  yearsTo67: number,
): number {
  if (yearsTo67 <= 0) return balanceAtRetirement
  if (annualReturn === 0) return balanceAtRetirement
  return balanceAtRetirement * Math.pow(1 + annualReturn, yearsTo67)
}

/**
 * קצבה חודשית מהצבירה בגיל 67
 * = balanceAt67 / conversionFactor
 */
export function calcPensionAt67(
  balanceAt67: number,
  conversionFactor: number,
): number {
  if (conversionFactor <= 0) return 0
  return balanceAt67 / conversionFactor
}

/**
 * קצבת גישור = min(קצבה תקציבית, קצבה צוברת בגיל 67)
 * לפי עקרון הטיוטה: הנמוכה מבין השתיים
 */
export function calcBridgePension(
  budgetPension: number,
  pensionAt67: number,
): { bridgePension: number; limitingFactor: 'תקציבית' | 'צוברת' } {
  if (budgetPension <= pensionAt67) {
    return { bridgePension: budgetPension, limitingFactor: 'תקציבית' }
  }
  return { bridgePension: pensionAt67, limitingFactor: 'צוברת' }
}

/**
 * חישוב מלא לגיל פרישה נתון
 */
export function calcAll(params: {
  currentAge: number
  eligibleYears: number
  determiningWage: number
  currentBalance: number
  monthlyContribution: number
  annualReturn: number
  conversionFactor: number
  hasWithdrawals: boolean
  withdrawalsAmount: number
  plannedRetirementAge: number
}): CalcResult {
  const {
    currentAge,
    eligibleYears,
    determiningWage,
    currentBalance,
    monthlyContribution,
    annualReturn,
    conversionFactor,
    hasWithdrawals,
    withdrawalsAmount,
    plannedRetirementAge,
  } = params

  const yearsUntilRetirement = Math.max(0, plannedRetirementAge - currentAge)
  const yearsTo67 = Math.max(0, 67 - plannedRetirementAge)
  const accrualRate = calcAccrualRate(eligibleYears)
  const budgetPension = calcBudgetPension(determiningWage, eligibleYears)

  let balanceAtRetirement = calcBalanceAtRetirement(
    currentBalance,
    monthlyContribution,
    annualReturn,
    yearsUntilRetirement,
  )

  if (hasWithdrawals && withdrawalsAmount > 0) {
    balanceAtRetirement = Math.max(0, balanceAtRetirement - withdrawalsAmount)
  }

  const balanceAt67 = calcBalanceAt67(balanceAtRetirement, annualReturn, yearsTo67)
  const pensionAt67 = calcPensionAt67(balanceAt67, conversionFactor)
  const { bridgePension, limitingFactor } = calcBridgePension(budgetPension, pensionAt67)

  return {
    accrualRate,
    budgetPension,
    yearsUntilRetirement,
    balanceAtRetirement,
    yearsTo67,
    balanceAt67,
    pensionAt67,
    bridgePension,
    limitingFactor,
  }
}

/**
 * חישוב תרחישים לגילי פרישה שונים
 */
export function calcScenarios(params: {
  currentAge: number
  population: Population
  eligibleYears: number
  determiningWage: number
  currentBalance: number
  monthlyContribution: number
  annualReturn: number
  conversionFactor: number
  hasWithdrawals: boolean
  withdrawalsAmount: number
}): ScenarioRow[] {
  const minAge = MIN_RETIREMENT_AGE[params.population]
  const baseAge = Math.max(minAge, params.currentAge)
  const ages = [
    baseAge,
    baseAge + 1,
    baseAge + 2,
    baseAge + 3,
    baseAge + 5,
  ]
  // deduplicate & sort
  const uniqueAges = [...new Set(ages)].sort((a, b) => a - b)

  return uniqueAges.map(age => {
    const r = calcAll({ ...params, plannedRetirementAge: age })
    return {
      retirementAge: age,
      yearsTo67: r.yearsTo67,
      balanceAtRetirement: r.balanceAtRetirement,
      balanceAt67: r.balanceAt67,
      pensionAt67: r.pensionAt67,
      budgetPension: r.budgetPension,
      bridgePension: r.bridgePension,
      limitingFactor: r.limitingFactor,
    }
  })
}

/** פרמוט מספר כסף */
export function fmtILS(n: number): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(Math.round(n))
}

/** פרמוט אחוז */
export function fmtPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`
}
