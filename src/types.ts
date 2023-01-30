export type Team = {
  id: string,
  year: number,
}

export type Franchise = {
  id: string,
  name: string,
  active: boolean,
  teams: Team[]
}
