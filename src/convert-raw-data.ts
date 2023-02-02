import { writeFile } from 'fs/promises';
import { Franchise, Team } from './types';
import { FRANCHISE_PATH, RAW_FRANCHISE_PATH, RAW_TEAM_PATH, readJSON } from './util';

type RawFranchise = {
  id: string;
  name: string;
  active: boolean;
  image: string;
  url: string;
};

type RawTeam = {
  id: string;
  franchiseId: string;
  seasonId: string;
  name: string;
  year: number;
  image: string;
  url: string;
};


export async function convertRawData(): Promise<void> {
  const rawFranchises: RawFranchise[] = await readJSON(RAW_FRANCHISE_PATH);
  const rawTeams: RawTeam[] = await readJSON(RAW_TEAM_PATH);

  const teamsByFranchiseId: {[key: string]: Team[]} = rawTeams.reduce((acc: {[key: string]: Team[]}, rawTeam) => {
    const league = rawTeam.seasonId.split('_')[0];

    if (!league) throw new Error(`Unexpected unable to parse league for team: ${rawTeam.id}`);

    const team = {
      id: rawTeam.id,
      name: rawTeam.name,
      year: rawTeam.year,
      league,
    };

    const prevTeams: Team[] = acc[rawTeam.franchiseId] || [];

    return {...acc, [rawTeam.franchiseId]: [...prevTeams, team]}

  }, {});

  const franchises: Franchise[] = rawFranchises.map(({id, name, active}) => {
    const teams = teamsByFranchiseId[id];

    if (!teams) throw new Error(`Unexpected no teams found for franchise: ${id}`);

    return {id, name, active, teams};
  });

  writeFile(FRANCHISE_PATH, JSON.stringify(franchises))
}
