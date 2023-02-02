import { existsSync } from "fs";
import { writeFile } from "fs/promises";
import Jimp from 'jimp/es';
import path from "path";
import { createSprite } from "quick-sprite";
import { Franchise, Team } from "./types";
import { FRANCHISE_PATH, readJSON } from "./util";

const IMAGE_WIDTH = 125;
const IMAGE_HEIGHT = 125;
const PADDING = 5;

export async function buildTeamImages(): Promise<void> {
  const franchises: Franchise[] = await readJSON(FRANCHISE_PATH);
  const sortedFranchises = franchises.filter(x => !x.active).sort((a, b) => a.name.localeCompare(b.name));

  const teamsById: {[key: string]: Team} = sortedFranchises.map(x => x.teams).flat().reduce((accum, team) => {
    return {...accum, [team.id]: team}
  }, {});
  
  const font = await Jimp.loadFont(Jimp.FONT_SANS_12_BLACK);

  const transform = (key: string, image: Jimp): Jimp => {    
    const team = teamsById[key];
    
    if (!team) throw new Error('Unexpected index error');
    
    const year = `(${team.year - 1}/${team.year.toString().slice(2)})`;
    const league = team.league === 'NBA' ? '' : `(${team.league})`;
    const text = `${team.name} ${year} ${league}`;
    
    // add an extra row for longer team names
    const height = team.name.length >= 22 ? 180 : 170;

    const out = new Jimp(IMAGE_WIDTH, height, '#ffffff');
    
    
    return out
      .composite(image, 0, 0)
      .print(
        font, 
        0, 
        IMAGE_HEIGHT + PADDING, 
        { text: text, alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER }, 
        IMAGE_WIDTH, 
        height - IMAGE_HEIGHT - PADDING
      );
  }

  for (const franchise of sortedFranchises) {
    console.log('Building logo sprite for', franchise.id);

    const sortedTeams = franchise.teams.sort((a, b) => b.year - a.year);

    const teamSources = sortedTeams.map(({id, league}) => {
      const p = path.resolve(__dirname, `../data/img/team/${id}.png`);

      const fileExists = existsSync(p);

      if (fileExists) {
        return {key: id, path: p};
      } else {
        console.log('No logo found for:', id, '. Using league image:', league);

        return {
          key: id,
          path: path.resolve(__dirname, `../data/img/${league}.png`)
        }
      }
    })

    if (teamSources.length) {
      const {image} = await createSprite(teamSources, {
        fillMode: 'row',
        maxWidth: 1875, // 15 logos
        padding: PADDING,
        transform,
      });
  
      image.write(path.resolve(__dirname, `../assets/team_defunct/${franchise.id}.png`))
    }
  }
}
