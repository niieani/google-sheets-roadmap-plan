// import { getColumnName } from './helpers'
// import axios from 'axios'
export {
  ADD_TO_LAST_PART,
  FILL_BLANKS,
  GROUPED_RESEQUENCE,
  MAKE_START_DATE,
} from './formulas'

export { CALCULATE_ROADMAP } from './roadmap'

export function onOpen() {
  const spreadsheet = SpreadsheetApp.getActive()
  const menuItems = [
    { name: 'Apply Unique Colors', functionName: 'applyUniqueColors' },
    {
      name: 'Remove Conditional Formatting',
      functionName: 'removeConditionalFormatting',
    },
  ]
  spreadsheet.addMenu('Custom Utils', menuItems)
}

export function applyUniqueColors() {
  const sheet = SpreadsheetApp.getActiveSheet()
  const range = sheet.getActiveRange()
  const column = range?.getColumn()
  if (!column) return

  const numRows = sheet.getLastRow()

  const selectedColumnRange = sheet.getRange(1, column, numRows, 1)
  const values = selectedColumnRange.getValues()

  const uniqueValues = []
  // skip the header (1st row)
  for (let i = 1; i < values.length; i++) {
    if (uniqueValues.indexOf(values[i][0]) === -1) {
      uniqueValues.push(values[i][0])
    }
  }

  for (const uniqueValue of uniqueValues) {
    const backgroundColor = getRandomColor()
    const rule = SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(uniqueValue)
      .setBackground(backgroundColor)
      .setRanges([selectedColumnRange])
      .build()

    const rules = sheet.getConditionalFormatRules()
    rules.push(rule)
    sheet.setConditionalFormatRules(rules)
  }
}

export function removeConditionalFormatting() {
  const sheet = SpreadsheetApp.getActiveSheet()
  const range = sheet.getActiveRange()
  if (!range) return
  const column = range.getColumn()

  const rules = sheet.getConditionalFormatRules()
  const newRules = []

  for (const rule of rules) {
    const ruleRanges = rule.getRanges()
    let shouldKeep = false

    for (const ruleRange of ruleRanges) {
      if (ruleRange.getColumn() !== column) {
        shouldKeep = true
        break
      }
    }

    if (shouldKeep) {
      newRules.push(rule)
    }
  }

  sheet.setConditionalFormatRules(newRules)
}

function getRandomColor() {
  let color = '#'
  for (let i = 0; i < 3; i++) {
    const colorComponent = Math.floor(Math.random() * 128) + 127
    color += colorComponent.toString(16)
  }
  return color
}
