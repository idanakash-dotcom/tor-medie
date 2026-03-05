import { describe, it, expect } from 'vitest'
import {
  calcAccrualRate,
  calcBudgetPension,
  calcBalanceAtRetirement,
  calcBalanceAt67,
  calcPensionAt67,
  calcBridgePension,
  calcAll,
  calcScenarios,
  MIN_RETIREMENT_AGE,
} from '../utils/calc'

describe('calcAccrualRate', () => {
  it('returns 2% per year for 20 years → 40%', () => {
    expect(calcAccrualRate(20)).toBeCloseTo(0.40)
  })

  it('caps at 70% for 35+ years', () => {
    expect(calcAccrualRate(35)).toBeCloseTo(0.70)
    expect(calcAccrualRate(40)).toBeCloseTo(0.70)
    expect(calcAccrualRate(50)).toBeCloseTo(0.70)
  })

  it('returns 0 for 0 years', () => {
    expect(calcAccrualRate(0)).toBe(0)
  })

  it('returns 30% for 15 years', () => {
    expect(calcAccrualRate(15)).toBeCloseTo(0.30)
  })
})

describe('calcBudgetPension', () => {
  it('calculates correctly for 20 years and 25000 wage', () => {
    // 0.02 * 20 = 0.40 → 25000 * 0.40 = 10000
    expect(calcBudgetPension(25000, 20)).toBeCloseTo(10000)
  })

  it('caps at 70% for 40 years', () => {
    // 25000 * 0.70 = 17500
    expect(calcBudgetPension(25000, 40)).toBeCloseTo(17500)
  })

  it('returns 0 for 0 wage', () => {
    expect(calcBudgetPension(0, 20)).toBe(0)
  })
})

describe('calcBalanceAtRetirement', () => {
  it('returns currentBalance when yearsUntilRetirement = 0', () => {
    expect(calcBalanceAtRetirement(500000, 4000, 0.04, 0)).toBe(500000)
  })

  it('grows balance with 0% return (only contributions)', () => {
    // 500000 + 4000*12*5 = 500000 + 240000 = 740000
    expect(calcBalanceAtRetirement(500000, 4000, 0, 5)).toBeCloseTo(740000)
  })

  it('applies compound growth with positive return', () => {
    const result = calcBalanceAtRetirement(100000, 0, 0.04, 10)
    // 100000 * (1.04)^10 ≈ 148024
    expect(result).toBeCloseTo(148024, -1)
  })

  it('calculates combined growth + contributions', () => {
    // balance=0, contrib=12000/yr, r=0, n=5 → 60000
    expect(calcBalanceAtRetirement(0, 1000, 0, 5)).toBeCloseTo(60000)
  })

  it('returns 0 (not negative) for negative years', () => {
    expect(calcBalanceAtRetirement(500000, 4000, 0.04, -3)).toBe(500000)
  })
})

describe('calcBalanceAt67', () => {
  it('returns balanceAtRetirement when yearsTo67 = 0', () => {
    expect(calcBalanceAt67(500000, 0.04, 0)).toBe(500000)
  })

  it('grows correctly with compound interest', () => {
    // 500000 * 1.04^10 ≈ 740122
    const result = calcBalanceAt67(500000, 0.04, 10)
    expect(result).toBeCloseTo(740122, -1)
  })

  it('returns same amount with 0% return', () => {
    expect(calcBalanceAt67(500000, 0, 10)).toBe(500000)
  })
})

describe('calcPensionAt67', () => {
  it('divides balance by conversion factor', () => {
    expect(calcPensionAt67(1000000, 200)).toBeCloseTo(5000)
  })

  it('returns 0 for zero balance', () => {
    expect(calcPensionAt67(0, 200)).toBe(0)
  })

  it('returns 0 for zero conversion factor', () => {
    expect(calcPensionAt67(1000000, 0)).toBe(0)
  })
})

describe('calcBridgePension', () => {
  it('returns budgetPension when it is lower', () => {
    const r = calcBridgePension(8000, 12000)
    expect(r.bridgePension).toBeCloseTo(8000)
    expect(r.limitingFactor).toBe('תקציבית')
  })

  it('returns pensionAt67 when it is lower', () => {
    const r = calcBridgePension(12000, 8000)
    expect(r.bridgePension).toBeCloseTo(8000)
    expect(r.limitingFactor).toBe('צוברת')
  })

  it('returns budgetPension when equal (budget is limiting)', () => {
    const r = calcBridgePension(10000, 10000)
    expect(r.bridgePension).toBeCloseTo(10000)
    expect(r.limitingFactor).toBe('תקציבית')
  })
})

describe('calcAll', () => {
  const baseParams = {
    currentAge: 45,
    eligibleYears: 20,
    determiningWage: 25000,
    currentBalance: 600000,
    monthlyContribution: 4000,
    annualReturn: 0.04,
    conversionFactor: 200,
    hasWithdrawals: false,
    withdrawalsAmount: 0,
    plannedRetirementAge: 50,
  }

  it('returns all required fields', () => {
    const result = calcAll(baseParams)
    expect(result).toHaveProperty('accrualRate')
    expect(result).toHaveProperty('budgetPension')
    expect(result).toHaveProperty('balanceAtRetirement')
    expect(result).toHaveProperty('balanceAt67')
    expect(result).toHaveProperty('pensionAt67')
    expect(result).toHaveProperty('bridgePension')
    expect(result).toHaveProperty('limitingFactor')
  })

  it('accrualRate is correct', () => {
    const result = calcAll(baseParams)
    expect(result.accrualRate).toBeCloseTo(0.40)
  })

  it('budgetPension is correct', () => {
    const result = calcAll(baseParams)
    expect(result.budgetPension).toBeCloseTo(10000)
  })

  it('yearsUntilRetirement is calculated correctly', () => {
    const result = calcAll(baseParams)
    expect(result.yearsUntilRetirement).toBe(5) // 50 - 45
  })

  it('yearsTo67 is calculated correctly', () => {
    const result = calcAll(baseParams)
    expect(result.yearsTo67).toBe(17) // 67 - 50
  })

  it('withdrawals reduce balance', () => {
    const withDrawal = calcAll({ ...baseParams, hasWithdrawals: true, withdrawalsAmount: 100000 })
    const noDrawal = calcAll(baseParams)
    expect(withDrawal.balanceAtRetirement).toBeLessThan(noDrawal.balanceAtRetirement)
    expect(noDrawal.balanceAtRetirement - withDrawal.balanceAtRetirement).toBeCloseTo(100000, -1)
  })

  it('bridge pension is min of budget and pension67', () => {
    const result = calcAll(baseParams)
    expect(result.bridgePension).toBeLessThanOrEqual(result.budgetPension)
    expect(result.bridgePension).toBeLessThanOrEqual(result.pensionAt67)
  })
})

describe('calcScenarios', () => {
  const baseParams = {
    currentAge: 43,
    population: 'חוד' as const,
    eligibleYears: 20,
    determiningWage: 25000,
    currentBalance: 600000,
    monthlyContribution: 4000,
    annualReturn: 0.04,
    conversionFactor: 200,
    hasWithdrawals: false,
    withdrawalsAmount: 0,
  }

  it('returns multiple scenario rows', () => {
    const rows = calcScenarios(baseParams)
    expect(rows.length).toBeGreaterThanOrEqual(2)
  })

  it('scenarios are sorted by retirement age', () => {
    const rows = calcScenarios(baseParams)
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].retirementAge).toBeGreaterThan(rows[i - 1].retirementAge)
    }
  })

  it('starts from minimum age for חוד (45)', () => {
    const rows = calcScenarios(baseParams)
    expect(rows[0].retirementAge).toBeGreaterThanOrEqual(MIN_RETIREMENT_AGE['חוד'])
  })

  it('starts from currentAge when it exceeds min age', () => {
    const highAgeParams = { ...baseParams, currentAge: 55, population: 'חוד' as const }
    const rows = calcScenarios(highAgeParams)
    expect(rows[0].retirementAge).toBeGreaterThanOrEqual(55)
  })
})

describe('MIN_RETIREMENT_AGE', () => {
  it('has correct values for all populations', () => {
    expect(MIN_RETIREMENT_AGE['חוד']).toBe(45)
    expect(MIN_RETIREMENT_AGE['מינהלה']).toBe(53)
    expect(MIN_RETIREMENT_AGE['מודיעין ואבטחה']).toBe(46.5)
    expect(MIN_RETIREMENT_AGE['טכנולוגיה']).toBe(46.5)
  })
})
