import { buildImage } from './build-image';
import { convertRawData } from './convert-raw-data';

async function main () {
  const [_, __, cmd] = process.argv;

  switch (cmd) {
    case '--convert-raw-data':
      return await convertRawData();
    case '--build-image':
      return await buildImage();
    default:
      console.log('Unexpected command:', cmd);
      break;
  }
}

main().catch(err => console.log('Error running main', err));
