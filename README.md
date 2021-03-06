# Tanky McTankface

Tanky McTankface is a [js13k](https://js13kgames.com/) game for the 2019 edition of the contest. The zipped game including all dependencies must at most 13kb in size.
The deadline is 13:00 CEST, 13th September 2019.

You take control of the tank and try to go as far as you can while fighting enemy turrets. You gather items along the way, but they are no applied instantly. Only when you are destroyed and start back at the beginning, the items will be applied and you will become more powerful. Compare Highscores to see how well you did.

## Latest version

[Play](https://tanky.upseil.com/master/)

[Download ZIP](https://tanky.upseil.com/master/tanky.zip)

## Notes

* mostly tested with 1080p monitor. Some scaling will be performed, but experience will be best on 1080p
* enemies will sometimes not be very smart, but it was a design decision. some will shoot upper curve, some directly
* enemy inaccuracy is random and will overall decrease with progress

## Setup for development

First clone the repository and change directory to the project root.
Then:
```
npm install
```

## Compile for development

```
npm run build-dev
```

## Compile and zip for 13K contest

```
npm run build
zip -r -j tanky.zip dist/*
advzip -z -4 tanky.zip
```

## Starting dev server

```
npm run start
```

Game will be accessible running at http://localhost:9000/

## ToDo

- [x] Shooting will blacken the terrain
- [x] Introduce first enemy
- [x] Add enemy health bar
- [x] Add charge shooting mechanic
- [x] Add health bar
- [x] Autoload highscore from local storage
- [x] Introduce first item to be dropped by enemy
- [x] Autoload loot from local storage
- [x] Add background with paralax effect
- [x] Add intro/tutorial text
- [x] Add scaling to window size
- [x] Fix uphill speed vs accel
- [x] Add muzzle and explosion effects
- [x] Add sounds
- [x] Add simple start screen
- [x] Mirror repo to github and include link to repo in game menu
- [x] Optimize performance
- [x] Add enemy tanks to give more enemy variance
- [x] Fix health very low number formatting bug
- [x] Add more items if size allows, repeat
- [ ] Final balance

## Libraries and Tools

This project benefits from these great open source projects:

* [Kontra.js](https://straker.github.io/kontra/)
* [TypeScript](https://www.typescriptlang.org/)
* [webpack](https://webpack.js.org/)
* [terser](https://terser.org/)
* [SoundBox](https://sb.bitsnbites.eu/) - I converted the player code to typescript, see [this file](src/soundbox/player.ts)

And more...