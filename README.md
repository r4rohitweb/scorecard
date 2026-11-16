# Pitch Cricket

A React Native and Expo cricket scoring prototype for Android, iOS, and web.

## Run in a browser during development

From this project folder, run:

```powershell
npm.cmd install
npx.cmd expo start --web
```

Open the localhost URL Expo prints in the terminal. For changes while Expo is already running, press `r` in the terminal or refresh the browser.

## Run the static web export with XAMPP

This project is stored under `C:\xampp\htdocs\testing\scoreboard`. Export it with:

```powershell
npx.cmd expo export --platform web
```

Then open `http://localhost/testing/scoreboard/dist/` while Apache is running. The export uses this XAMPP subpath for its JavaScript, CSS, and bundled assets. Do not open `dist/index.html` directly as a `file://` URL.

## Current prototype

- Four-action dashboard: new match, live score, players, and match history
- Three-step match setup with team names, player squads, overs, batting order, striker, non-striker, and opening bowler
- Ball-by-ball scoring, over history, bowler changes, wicket batter selection, innings break, chase target, match result, and Player of the Match
- Match data saved locally on the device or browser with AsyncStorage
- Demo authentication and sample completed match

Supabase authentication, cloud database sync, role permissions, and Realtime updates are not connected yet. Local saved data stays in that browser/device profile and is not shared across devices.
