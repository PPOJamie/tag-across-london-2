# Tag Across London — Game Console

A mobile-first, dependency-free web app built from the supplied **Tag Across London: Teams Rulesheet**.

## Quickest way to use it

Open `tag-across-london.html` from the download bundle. It is a single self-contained file and works without installation.

## Hosted / installable version

The `tag-across-london-site` folder is the multi-file version. Serve the folder over HTTP so the offline cache and “Install app” feature can work:

```bash
cd tag-across-london-site
python3 -m http.server 8080
```

Then open `http://localhost:8080` in a browser. The same folder can be uploaded to GitHub Pages, Netlify, Cloudflare Pages or any ordinary static web host.

## Included features

- Animated start and destination wheels that enforce the valid pairings in the rulesheet.
- Used-station filtering so completed routes cannot be rolled again.
- Challenge spinner with completed-challenge filtering, one free reroll per round and a 15-minute timed reroll.
- Schematic London station map, selected-route line, optional browser geolocation and an external transit-directions button.
- 15-minute Runner head-start timer, 10-minute bus timer with a no-immediate-bus lock, and 15-minute challenge timer.
- Team names, points, challenge tie-break counts, automatic role switching and round tracking.
- Entering/leaving message generator, local game log, undo, export/import and text-log download.
- Local browser storage and a service worker for offline use when hosted.

## Rules interpretation

The rulesheet overview and the detailed Runner section appear to swap the role labels. The app follows the detailed mechanics: **Runners connect stations; Chasers catch Runners**. Because the document is not explicit about whether a catch gives the Chasers a point or only denies the Runners a point, the app provides a **Catch scoring** setting. Its default is “Chasers gain 1 point,” matching the overview’s “to score a point” wording after correcting the swapped labels.

## Map note

The built-in map is schematic and the marker positions are approximate. It is designed for game setup and quick orientation, not navigation or live transport status. The “Open transit directions” button launches a normal transit route in Google Maps for the selected stations.

## Privacy and data

Game state is saved in `localStorage` on the current browser. Optional location is displayed only in the current page and is not transmitted by this app. External transit directions open a third-party map site in a new tab.

## Customising the game

Station lists, route pairings and challenge text are near the top of `app.js` in the `STATIONS`, `ROUTES` and `CHALLENGES` constants. After changing them, update the service-worker cache name in `sw.js` so returning players receive the new files.
