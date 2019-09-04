# Tanky McTankface

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
- [x] Add scaling to window size
- [ ] Fix uphill speed vs accel
- [ ] Add muzzle and explosion effects
- [ ] Add sounds
- [ ] Add simple start screen
- [ ] Add more items if size allows, repeat
- [ ] Final balance
