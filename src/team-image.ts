import { writeFile } from "fs/promises";
import path from "path";
import { createSprite } from "quick-sprite";
import { Franchise } from "./types";
import { FRANCHISE_PATH, readJSON } from "./util";

export async function buildTeamImages(): Promise<void> {
  const franchises: Franchise[] = await readJSON(FRANCHISE_PATH);
  const sortedFranchises = franchises.filter(x => x.active).sort((a, b) => a.name.localeCompare(b.name));

  for (const franchise of sortedFranchises) {
    console.log('Building logo sprite for', franchise.id);

    const sortedTeams = franchise.teams.sort((a, b) => b.year - a.year);

    const teamSources = sortedTeams.map(({id}) => {
      const p = path.resolve(__dirname, `../data/img/team/${id}.png`);

      return {key: id, path: p};
    });

    const {image, mapping} = await createSprite(teamSources, {
      fillMode: 'row',
      maxWidth: 1250, // 10 logos
      padding: 5
    });

    image.write(path.resolve(__dirname, `../assets/team/${franchise.id}.png`))

    await writeFile(path.resolve(__dirname, `../assets/team/${franchise.id}.mapping.json`), JSON.stringify(mapping));
  }
}
