# Tanky McTankface

## Setup for development

First clone the repository and change directory to the project root.
Then:
```
npm install
```

## Compile and zip for 13K contest

```
npm run build
zip -r -j game.zip dist/*
advzip -z -4 game.zip
```

## Starting dev server

```
npm run start
```

Game will be accessible running at http://localhost:9000/

## ToDo

- [x] Shooting will blacken the terrain (gras does not survive shot)
- [x] Introduce first enemy
- [x] Add enemy health bar
- [x] Add charge shooting mechanic
- [x] Add health bar
- [x] Autoload highscore from local storage
- [x] Introduce first item to be dropped by enemy
- [x] Autoload loot from local storage
- [x] Add background with paralax effect
- [x] Add intro/tutorial text
- [ ] Add simple start screen
- [ ] Add muzzle and explosion effects
- [ ] Add sounds
