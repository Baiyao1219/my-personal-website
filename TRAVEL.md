# Travel Archive

## Existing site

The repository is a static site: one `index.html` with inline CSS, local JPEGs,
and anchor navigation. There is no framework, package manager, build command,
or repository-defined Actions workflow. The palette is off-white (`#f7f6f2`),
with Georgia headings, Arial body text, fine rules, and uppercase navigation.
GitHub's successful `pages build and deployment` run on `main` uses the dynamic
Pages workflow. The build log confirms checkout `ref: main`, Jekyll `source: .`,
and artifact output `./_site` containing the root `index.html` and images.
This verifies publishing from the repository root on `main`. The settings endpoint
was unavailable through the connector; the successful build log supplies the source evidence.

## Changes

- `index.html`: only the Travel navigation target changes from `#travel` to
  `travel.html`. All existing CSS, sections, text, and images are preserved.
- `travel.html`: dedicated archive with title/subtitle, Leaflet map with
  OpenStreetMap tiles, timeline, empty state, and homepage navigation.
- `travel.css`: styles for the new page using the existing palette and typography.
- `data/trips.js`: confirmed month-level trips with multiple places, stable IDs,
  empty photo arrays, field documentation, and coordinate sources.
- `travel.js`: map markers and timeline from the same dataset, newest first and
  grouped by year. Invalid dates appear last under Undated. Text is safely rendered.
- `TRAVEL.md`: these maintenance and preview instructions.

The original README and all five JPEG files are included unchanged in this copy.
Leaflet 1.9.4 is the only library, served locally from `vendor/leaflet/` with its
license and original image assets. This removes the runtime dependency on unpkg.
The map container has a responsive explicit height and is visible from the initial
HTML, with a loading message replaced on initialization. It stays visible even if
Leaflet cannot load. Versioned Travel CSS/JS URLs avoid reusing the prior cached
page logic. The world view also initializes if the trip dataset is empty.
No new photos, build configuration, or deployment settings are added.
Existing homepage travel photos are not treated as dated trips.

## Preview

Serve the repository locally (internet is needed only for OpenStreetMap tiles):

```powershell
cd outputs/website-repository
python -m http.server 8000
```

Visit `http://localhost:8000/travel.html`.
The automated browser checks separately mount this checkout at `/my-personal-website/`
and verify both pages and their relative assets there. Substitute an installed
Python command if needed. No installation or build step is required for the site.

## Add a trip later

Edit `data/trips.js` and add objects to `window.TRAVEL_TRIPS`. Use a unique, permanent
`id` containing letters, numbers, hyphens or underscores; `date` (`YYYY-MM` for a
confirmed month, `YYYY-MM-DD` only for a confirmed day); `places` (an array of
`{ city, country, latitude, longitude }`); and `photos` (an array of relative paths,
empty until photos are supplied). `description` is optional. Never fabricate dates
or personal notes. The new trip shape does not require duplicating country/city at
the trip level. Each place owns its location; one trip may include multiple countries.
The supplied trips use `2026-10` (Split, Trogir, Zadar) and `2026-09` (Stockholm).
Dates render as October 2026 and September 2026, without an invented day.
Stable timeline anchors are `#trip-2026-10-croatia` and `#trip-2026-09-sweden`.
The code sorts entries automatically; array order does not matter. Photo paths
are stored for a future gallery; no images are loaded. No fabricated trips are supplied.
Legacy single-city records with nested `coordinates` or top-level latitude and
longitude remain supported. Use finite numbers in latitude -90..90
and longitude -180..180. Zero is valid. Invalid coordinates omit only the marker.
Invalid dates appear in an Undated timeline group instead of losing a trip.

Markers have 44px touch targets, keyboard focus, city/country/date popups and links
to timeline entries. Each distinct city/country has one marker, including repeated
visits. Nearby markers share city/visit links at wide zooms, so Split and Trogir
remain accessible when their touch targets overlap; zooming in separates them.
The map supports drag, pinch zoom, keyboard controls, and large +/− buttons.
Wheel zoom is disabled so the page scrolls naturally. An empty dataset shows a
world view and a helpful message. Leaflet failure preserves the timeline; tile
failure shows a connection message and retains markers.

Tiles use `https://tile.openstreetmap.org/{z}/{x}/{y}.png` with visible attribution,
normal browser caching/referrers, and no prefetch or offline download. See the
[tile policy](https://operations.osmfoundation.org/policies/tiles/).
No API key or Pages configuration change is required. Automated interaction
tests mock tiles to avoid automated pan/zoom traffic to the community servers.

Keep links and paths relative (no leading `/`) so they stay within the project
base path. New photo paths should be relative to `travel.html`.

## Coordinate sources

Coordinates identify cities, not personal routes, hotels, or photo locations:

- [Split — GeoNames](https://www.geonames.org/3190261/split.html): 43.50891, 16.43915.
- [Trogir — UNESCO historic city](https://whc.unesco.org/en/list/810/):
  N43 31 1.5 E16 15 4.9, converted and rounded to 43.51708, 16.25136.
- [Zadar — GeoNames](https://www.geonames.org/3186952/zadar.html): 44.11578, 15.22514.
- [Stockholm — GeoNames](https://www.geonames.org/2673730/stockholm.html): 59.32938, 18.06871.

GeoNames data is provided under CC BY; these links preserve source credit.

## Deployment

No new configuration is needed for the existing root GitHub Pages site.
The authoritative local Git checkout is now `outputs/website-repository/`, with
`.git`, `index.html`, `travel.html`, `travel.css`, `travel.js`, `TRAVEL.md`, and
`data/trips.js` at the correct repository-relative paths. The older
`outputs/my-personal-website/` and ZIP are exports, not this checkout.
Open `outputs/website-repository/` as the repository in your Git client. Review
the changed files, create a feature branch, commit, and publish that branch
when ready. Open a pull request targeting `main` and review before merging.
Do not upload the containing `outputs/` folder into the GitHub repository.
Leave existing images and other files in place. A push to the publishing
branch can trigger the existing deployment; no push or deployment was performed
while preparing this local copy.

The eventual public route is:
`https://baiyao1219.github.io/my-personal-website/travel.html`.
