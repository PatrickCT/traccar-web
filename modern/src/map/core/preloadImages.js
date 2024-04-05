import palette from '../../common/theme/palette';
import { loadImage, prepareIcon } from './mapUtil';

import defaultSvg from '../../resources/images/icon/default.svg';
import crossSvg from '../../resources/images/icon/cross.svg';
import directionSvg from '../../resources/images/direction.svg';
import cardirectionSvg from '../../resources/images/car_direction.svg';
import backgroundSvg from '../../resources/images/background.svg';
import animalSvg from '../../resources/images/icon/animal.svg';
import bicycleSvg from '../../resources/images/icon/bicycle.svg';
import boatSvg from '../../resources/images/icon/boat.svg';
import busSvg from '../../resources/images/icon/bus.svg';
import carSvg from '../../resources/images/icon/car.svg';
import craneSvg from '../../resources/images/icon/crane.svg';
import helicopterSvg from '../../resources/images/icon/helicopter.svg';
import motorcycleSvg from '../../resources/images/icon/motorcycle.svg';
import offroadSvg from '../../resources/images/icon/offroad.svg';
import personSvg from '../../resources/images/icon/person.svg';
import pickupSvg from '../../resources/images/icon/pickup.svg';
import planeSvg from '../../resources/images/icon/plane.svg';
import scooterSvg from '../../resources/images/icon/scooter.svg';
import shipSvg from '../../resources/images/icon/ship.svg';
import tractorSvg from '../../resources/images/icon/tractor.svg';
import trainSvg from '../../resources/images/icon/train.svg';
import tramSvg from '../../resources/images/icon/tram.svg';
import trolleybusSvg from '../../resources/images/icon/trolleybus.svg';
import truckSvg from '../../resources/images/icon/truck.svg';
import vanSvg from '../../resources/images/icon/van.svg';
import clusterSvg from '../../resources/images/backgroundCluster.svg';
import stopSvg from '../../resources/images/icon/stop.svg';
import directionWhite from '../../resources/images/direction-white.svg';

export const mapIcons = {
  animal: animalSvg,
  bicycle: bicycleSvg,
  boat: boatSvg,
  bus: busSvg,
  car: carSvg,
  crane: craneSvg,
  default: defaultSvg,
  helicopter: helicopterSvg,
  motorcycle: motorcycleSvg,
  offroad: offroadSvg,
  person: personSvg,
  pickup: pickupSvg,
  plane: planeSvg,
  scooter: scooterSvg,
  ship: shipSvg,
  stop: stopSvg,
  tractor: tractorSvg,
  train: trainSvg,
  tram: tramSvg,
  trolleybus: trolleybusSvg,
  truck: truckSvg,
  van: vanSvg,
  cross: crossSvg,
  cluster: clusterSvg,
  carDirection: cardirectionSvg,
};

export const mapIconKey = (category) => (mapIcons.hasOwnProperty(category) ? category : 'default');

export const mapImages = {};

export default async () => {
  const background = await loadImage(backgroundSvg);
  mapImages.background = await prepareIcon(background);
  const cluster = await loadImage(clusterSvg);
  mapImages.cluster = await prepareIcon(cluster);
  mapImages.direction = await prepareIcon(await loadImage(directionSvg));
  mapImages.directionWhite = await prepareIcon(await loadImage(directionWhite), null, palette.colors.white);
  await Promise.all(Object.keys(mapIcons).map(async (category) => {
    const results = [];
    ['primary', 'positive', 'negative', 'neutral'].forEach((color) => {
      const imagePath = mapIcons[category];
      results.push(loadImage(imagePath).then((icon) => {
        // console.info(`Loading  ${category}-${color}`);
        if (category === 'carDirection') {
          mapImages[`${category}-${color}`] = prepareIcon(null, icon, palette.colors[color]);
        } else {
          mapImages[`${category}-${color}`] = prepareIcon(background, icon, palette.colors[color]);
        }

        // eslint-disable-next-line no-unused-vars
      }).catch((error) => {
        // console.error(`Error loading image '${category}-${color}' from path '${imagePath}':`, error);
      }));
    });
    await Promise.all(results);
  }));
};
