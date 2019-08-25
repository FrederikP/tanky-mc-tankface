# Tanky McTankface

## Compile and zip for 13K contest

```
npm run build
zip -r game.zip dist/
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
- [ ] Introduce first item to be dropped by enemy
- [ ] Add background with paralax effect
- [ ] Add intro/tutorial text (and mission?)
- [ ] Add simple menu
- [ ] Autoload progress from local storage
- [ ] Allow reseting progress
- [ ] Add muzzle and explosion effects

## Text Ideas

### First play:

Tanky McTankface,

your time has come to put your parts to the test. You cannot win, as there are no winners in war (except for the arms industry...).
Make it as far as you can. Gather any parts you can find. When you break down, we will use them to build a better version for the next attempt.

### Next playthrough

Welcome back, Tanky McTankface.