# Tag Across London — game website

This package contains two versions of the same game companion.

## Use immediately

Open **tag-across-london.html** in a modern browser. It is one self-contained file, needs no installation and keeps the game state in that browser.

## Put it online or install it as an app

Upload the contents of **hosted-site** to any static web host. For a local test:

```bash
cd hosted-site
python3 -m http.server 8080
```

Then visit `http://localhost:8080`. Serving the folder over HTTP enables the offline cache and browser installation prompt.

## Main features

- Valid start and destination spins from the supplied route table.
- Used-station filtering and automatic role switching between rounds.
- All 31 challenges, one free reroll per round and a timed 15-minute reroll.
- Schematic station map with selected-route highlighting and transit-directions link.
- 15-minute head-start timer, 10-minute bus timer and 15-minute challenge timer.
- Team scores, completed-challenge tie-break totals, station-update message generator and game log.
- Local save, undo, import/export and downloadable text log.

## Rules interpretation

The rulesheet overview appears to swap the Runner and Chaser labels compared with the detailed rules. The app follows the detailed mechanics: Runners connect stations and Chasers catch Runners. A catch-scoring selector lets the group choose whether a catch awards the Chasers one point or simply denies the Runners a point.

The map is schematic and its positions are approximate. Use a live transport app for navigation and service information.
