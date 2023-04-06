import { CalculatedProject, calculateProjectDates } from './roadmap'

const asISOStringDate = (date: Date) => date.toISOString().slice(0, 10)
const asISOStringDates = (projects: Required<CalculatedProject>[]) =>
  projects.map(({ startDate, endDate }) => [
    asISOStringDate(startDate),
    asISOStringDate(endDate),
  ])

describe('calculateProjectDates', () => {
  test('should calculate project start and end dates correctly', () => {
    const projects = [
      { estimatedDuration: 10, workersCount: 2, workStream: 'A' },
      { estimatedDuration: 20, workersCount: 1, workStream: 'B' },
      { estimatedDuration: 30, workersCount: 1, workStream: 'A' },
    ]

    const options = {
      teamCapacity: 2,
      startDate: new Date('2023-04-05'),
    }

    const expectedResults = [
      // all 2 workers used up for first 5 days
      ['2023-04-05', '2023-04-10'],
      // 1 worker used up 20 days
      ['2023-04-10', '2023-04-30'],
      // 1 worker used up 30 days
      ['2023-04-10', '2023-05-10'],
    ]

    const result = calculateProjectDates(projects, options)

    expect(asISOStringDates(result)).toEqual(expectedResults)
  })

  test('should calculate independent work streams start and end dates correctly', () => {
    const projects = [
      { estimatedDuration: 10, workersCount: 1, workStream: 'A' },
      { estimatedDuration: 20, workersCount: 1, workStream: 'B' },
    ]

    const options = {
      teamCapacity: 2,
      startDate: new Date('2023-04-05'),
    }

    const expectedResults = [
      ['2023-04-05', '2023-04-15'],
      ['2023-04-05', '2023-04-25'],
    ]

    const result = calculateProjectDates(projects, options)

    expect(asISOStringDates(result)).toEqual(expectedResults)
  })

  test('should calculate project start and end dates correctly with complex overlapping workstreams', () => {
    const projects = [
      { estimatedDuration: 10, workersCount: 2, workStream: 'A' },
      { estimatedDuration: 20, workersCount: 1, workStream: 'B' },
      { estimatedDuration: 60, workersCount: 3, workStream: 'A' },
      { estimatedDuration: 40, workersCount: 2, workStream: 'B' },
      { estimatedDuration: 10, workersCount: 1, workStream: 'C' },
    ]

    const options = {
      teamCapacity: 3,
      startDate: new Date('2023-04-05'),
    }

    const expectedResults = [
      ['2023-04-05', '2023-04-10'], // A
      ['2023-04-05', '2023-04-25'], // B
      // capacity from 04-10 to 04-25 is only 2 (that "eats up" first 30 days),
      // then remaining 30 days take 10 days, as capacity is 3
      ['2023-04-10', '2023-05-05'], // A
      // all workers are freed up on 05-05
      ['2023-05-05', '2023-05-25'], // B
      ['2023-05-05', '2023-05-15'], // C
    ]

    const result = calculateProjectDates(projects, options)

    expect(asISOStringDates(result)).toEqual(expectedResults)
  })

  test('should calculate project start and end dates correctly with complex overlapping workstreams (capacity 4)', () => {
    const projects = [
      { estimatedDuration: 10, workersCount: 2, workStream: 'A' },
      { estimatedDuration: 20, workersCount: 1, workStream: 'B' },
      { estimatedDuration: 60, workersCount: 3, workStream: 'A' },
      { estimatedDuration: 40, workersCount: 2, workStream: 'B' },
      { estimatedDuration: 10, workersCount: 1, workStream: 'C' },
    ]

    const options = {
      teamCapacity: 4,
      startDate: new Date('2023-04-05'),
    }

    const expectedResults = [
      ['2023-04-05', '2023-04-10'], // A
      ['2023-04-05', '2023-04-25'], // B
      ['2023-04-05', '2023-04-29'], // A
      ['2023-04-25', '2023-05-17'], // B
      ['2023-04-29', '2023-05-09'], // C
    ]

    const result = calculateProjectDates(projects, options)

    expect(asISOStringDates(result)).toEqual(expectedResults)
  })

  test('should throw error if workersCount for a project is higher than the teamCapacity', () => {
    const projects = [
      { estimatedDuration: 10, workersCount: 3, workStream: 'A' },
    ]

    const options = {
      teamCapacity: 2,
      startDate: new Date('2023-04-05'),
    }

    expect(() => calculateProjectDates(projects, options)).toThrow(
      'The workersCount for a project cannot be higher than the teamCapacity',
    )
  })
})
