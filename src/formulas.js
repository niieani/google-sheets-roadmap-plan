export function FILL_BLANKS(range, referenceRange) {
  return range.map(function (row, index) {
    if (referenceRange?.[index]?.[0] === '') {
      // row[0] = "";
      return row // Return row as is
    }

    if (row[0] === '') {
      let skipped = index
      while (range[--skipped]?.[0] === '') {
        row[0] = range[skipped][0]
      }
      row[0] = range[skipped]?.[0] ?? ''
    }

    return row
  })
}

export function GROUPED_RESEQUENCE(sequenceColumn, groupColumn) {
  var output = []
  var groupSequences = {}

  for (var i = 0; i < sequenceColumn.length; i++) {
    var group = groupColumn[i][0]
    var sequence = sequenceColumn[i][0]

    if (!groupSequences[group]) {
      groupSequences[group] = []
    }

    groupSequences[group].push(sequence)
  }

  for (var group in groupSequences) {
    groupSequences[group].sort(function (a, b) {
      return a - b
    })
  }

  for (var i = 0; i < sequenceColumn.length; i++) {
    var group = groupColumn[i][0]
    var sequence = sequenceColumn[i][0]
    var newSequence = groupSequences[group].indexOf(sequence) + 1
    output.push([group + '-' + newSequence])
  }

  return output
}

export function ADD_TO_LAST_PART(value, separator = '-', add = -1) {
  const parts = value.split(separator)
  const last = parts.pop()
  return `${parts.join(separator)}${separator}${Number(last) + add}`
}

export function MAKE_START_DATE(
  sequencingRange,
  teamNameRange,
  endDateRange,
  initialStartDate,
) {
  let lastEndDate = new Date(initialStartDate)
  let maxSequence = Math.max(...sequencingRange)

  for (let i = 1; i <= maxSequence; i++) {
    let currentSequenceIndex = sequencingRange.indexOf(i)
    let currentTeam = teamNameRange[currentSequenceIndex]
    let currentEndDate = new Date(endDateRange[currentSequenceIndex])

    if (currentTeam === teamNameRange[0]) {
      if (currentEndDate > lastEndDate) {
        lastEndDate = currentEndDate
      }
    }
  }

  return lastEndDate
}
