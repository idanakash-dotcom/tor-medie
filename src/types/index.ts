export type Population = 'חוד' | 'מינהלה' | 'מודיעין ואבטחה' | 'טכנולוגיה'

export interface FormInputs {
  currentAge: number
  startYear: number
  eligibleYears: number
  population: Population
  determiningWage: number
  currentBalance: number
  monthlyContribution: number
  annualReturn: number
  conversionFactor: number
  hasWithdrawals: boolean
  withdrawalsAmount: number
  plannedRetirementAge: number
  showScenarios: boolean
}

export interface CalcResult {
  accrualRate: number
  budgetPension: number
  yearsUntilRetirement: number
  balanceAtRetirement: number
  yearsTo67: number
  balanceAt67: number
  pensionAt67: number
  bridgePension: number
  limitingFactor: 'תקציבית' | 'צוברת'
}

export interface ScenarioRow {
  retirementAge: number
  yearsTo67: number
  balanceAtRetirement: number
  balanceAt67: number
  pensionAt67: number
  budgetPension: number
  bridgePension: number
  limitingFactor: 'תקציבית' | 'צוברת'
}
