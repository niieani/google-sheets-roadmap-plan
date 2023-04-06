export interface Project {
  estimatedDuration: number
  workersCount: number
  workStream: string
}

export interface Options {
  teamCapacity: number
  startDate: Date
}

export interface CalculatedProject {
  remainingDays: number
  startDate?: Date
  endDate?: Date
}

export function calculateProjectDates<ProjectT extends Project>(
  projects: ProjectT[],
  options: Options,
): (Required<CalculatedProject> & ProjectT)[] {
  const { teamCapacity, startDate } = options
  const calculatedProjects = projects.map(
    (project): CalculatedProject & ProjectT => ({
      ...project,
      remainingDays: project.estimatedDuration,
    }),
  )
  const currentDate = new Date(startDate)

  if (projects.some((project) => project.workersCount > teamCapacity)) {
    throw new Error(
      'The workersCount for a project cannot be higher than the teamCapacity',
    )
  }

  while (calculatedProjects.some(({ remainingDays }) => remainingDays > 0)) {
    let usedCapacity = 0
    for (const project of calculatedProjects) {
      if (project.remainingDays <= 0) {
        continue
      }
      if (usedCapacity >= teamCapacity) {
        break
      }

      const capacityToUse = Math.min(
        project.workersCount,
        teamCapacity - usedCapacity,
      )
      usedCapacity += capacityToUse

      if (!project.startDate) {
        project.startDate = new Date(currentDate)
      }

      project.remainingDays -= capacityToUse

      if (project.remainingDays <= 0) {
        const endDate = new Date(currentDate)
        endDate.setDate(endDate.getDate() + 1)
        project.endDate = endDate
      }
    }

    // increment the date by one day
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return calculatedProjects as (Required<CalculatedProject> & ProjectT)[]
}

// TODO: support providing "actuals" that would override the estimates, but still keep everything else calculated
export function CALCULATE_ROADMAP(
  estimatedDuration: [number][],
  workersCount: [number][],
  workStream: [string][],
  startDate: Date,
  teamCapacity: number,
  sequencing?: [number | undefined | null][],
): ([Date, Date] | [undefined, undefined])[] {
  const projects = estimatedDuration.map((estimatedDuration, index) => ({
    index,
    estimatedDuration: estimatedDuration?.[0],
    workersCount: workersCount[index]?.[0] ?? 1,
    workStream: workStream[index]?.[0],
    sequence: sequencing
      ? sequencing[index]?.[0] ?? Number.POSITIVE_INFINITY
      : index,
  }))

  const results = calculateProjectDates(
    projects
      .filter(
        ({ estimatedDuration, workStream }) => estimatedDuration && workStream,
      )
      .sort((a, b) => a.sequence - b.sequence),
    { startDate, teamCapacity },
  )

  return projects.map(({ index }) => {
    const result = results.find(
      ({ index: resultIndex }) => resultIndex === index,
    )
    return result
      ? [result.startDate!, result.endDate!]
      : [undefined, undefined]
  })
}
