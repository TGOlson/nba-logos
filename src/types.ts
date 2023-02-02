export type Team = {
  id: string,
  year: number,
  name: string,
  league: string,
}

export type Franchise = {
  id: string,
  name: string,
  active: boolean,
  teams: Team[]
}
