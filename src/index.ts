import { buildCombinedImage } from './combined-image';
import { buildCombinedImage2 } from './combined-image2';
import { convertRawData } from './convert-raw-data';
import { buildTeamImages } from './team-image';

async function main () {
  const [_, __, cmd] = process.argv;

  switch (cmd) {
    case '--convert-raw-data':
      return await convertRawData();
    case '--build-combined-image':
      return await buildCombinedImage();
    case '--build-combined-image-2':
      return await buildCombinedImage2();
    case '--build-team-images':
      return await buildTeamImages();
    default:
      console.log('Unexpected command:', cmd);
      break;
  }
}

main().catch(err => console.log('Error running main', err));
