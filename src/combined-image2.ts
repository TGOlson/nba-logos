import path from "path";
import { Franchise } from "./types";
import { FRANCHISE_PATH, readJSON } from "./util";
import { createSprite } from "quick-sprite";

export async function buildCombinedImage2(): Promise<void> {
  const franchises: Franchise[] = await readJSON(FRANCHISE_PATH);
  const sortedFranchises = franchises.filter(x => x.active).sort((a, b) => a.name.localeCompare(b.name));

  const teamSprites = [];

  for (const franchise of sortedFranchises) {
    console.log('Building sprite for:', franchise.id);

    const sources = franchise.teams.map(team => {
      const p = path.resolve(__dirname, `../data/img/team/${team.id}.png`);

      return {key: team.id, path: p};
    });
    const teamSprite = await createSprite(sources, {
      fillMode: 'horizontal',
      dedupe: true,
      padding: 5,
    });


    teamSprites.push({key: franchise.id, image: teamSprite.image})
  }

  console.log('Building combined sprite');
  const {mapping, image} = await createSprite(teamSprites);


  // original, high quality
  image.write(path.resolve(__dirname, '../assets/logos_2.png'));
}
