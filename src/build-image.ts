import { readdir, writeFile } from "fs/promises";
import Jimp from "jimp/es";
import path from "path";
import { Franchise, Team } from "./types";
import { FRANCHISE_PATH, readJSON } from "./util";

const IMG_WIDTH = 125;
const IMG_HEIGHT = 125;
const PADDING = 5;

export async function buildImage(): Promise<void> {
  const franchises: Franchise[] = await readJSON(FRANCHISE_PATH);
  const sortedFranchises = franchises.filter(x => x.active).sort((a, b) => a.name.localeCompare(b.name));

  const fileNames: string[] = await readdir(path.resolve(__dirname, '../data/img/team'));

  const teamImages: {id: string, image: Jimp}[] = await Promise.all(fileNames.map(f => {
    const id = f.split('.')[0];
    if (!id) throw new Error(`Unable to parse id for: ${f}`);

    const p = path.resolve(__dirname, `../data/img/team/${f}`);

    return Jimp.read(p).then(image => ({id, image}));
  }));

  const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

  const teamImagesById: {[key: string]: Jimp} = teamImages.reduce((acc, x) => ({...acc, [x.id]: x.image}), {})

  const numberElementsX = sortedFranchises.length;
  const numberElementsY = sortedFranchises.reduce((x, fr) => fr.teams.length > x ? fr.teams.length : x, 0);

  const width = (numberElementsX + 1) * (IMG_WIDTH + PADDING) + PADDING;
  const height = numberElementsY * (IMG_HEIGHT + PADDING) + PADDING;

  const image = new Jimp(width, height, '#ffffff');

  // franchise id => (year => coords + dims)
  const mapping: {[key: string]: {
    [key: number]: {
      x: number,
      y: number,
      width: number,
      height: number,
    }
  }} = {};

  Array.from(Array(numberElementsY)).forEach((_x, i) => {
    const year = 2023 - i;
    const text = `${year - 1}/${year.toString().slice(2)}`; // eg. 2022/23
    const xOffset = PADDING;
    const yOffset = i * (IMG_HEIGHT + PADDING)

    image.print(font, xOffset, yOffset, { text, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE }, IMG_WIDTH, IMG_HEIGHT);
  });

  sortedFranchises.forEach((franchise: Franchise, i: number) => {
    const sortedTeams = franchise.teams.sort((a, b) => b.year - a.year);
    const franchiseMapping: {
      [key: number]: {
        x: number,
        y: number,
        width: number,
        height: number,
      }
    } = {};

    sortedTeams.forEach(({id, year}: Team, j: number) => {
      const xOffset = (i + 1) * (IMG_WIDTH + PADDING) + PADDING;
      const yOffset = j * (IMG_HEIGHT + PADDING) + PADDING;

      const teamImage = teamImagesById[id];

      if (teamImage) {
        franchiseMapping[year] = {
          x: xOffset,
          y: yOffset,
          width: IMG_WIDTH,
          height: IMG_HEIGHT,
        }

        image.composite(teamImage, xOffset, yOffset);
      } else {
        console.log(`Unable to find team image for ${id}`);
      }
    });

    mapping[franchise.id] = franchiseMapping;
  });


  // original, high quality
  image.write(path.resolve(__dirname, '../assets/logos.png'));

  // lower quality jpg
  image
    .quality(50)
    .write(path.resolve(__dirname, '../assets/logos_compressed.jpg'));

  writeFile(path.resolve(__dirname, '../assets/logos.mapping.json'), JSON.stringify(mapping));
}
