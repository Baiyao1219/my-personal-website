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
- `travel.html`: dedicated archive with title/subtitle, noninteractive map
  placeholder, timeline, empty state, and navigation back to homepage sections.
- `travel.css`: styles for the new page using the existing palette and typography.
- `data/trips.js`: empty dataset with field documentation and a commented template.
- `travel.js`: dependency-free timeline rendering, grouped by year and sorted
  newest first. Invalid calendar dates are omitted. Descriptions render as text.
- `TRAVEL.md`: these maintenance and preview instructions.

The original README and all five JPEG files are included unchanged in this copy.
No map library, new photos, dependencies, build configuration, or deployment
settings have been added. Existing homepage travel photos are not treated as dated trips.

## Preview

Open `travel.html` directly in a browser, or serve the parent directory:

```powershell
cd outputs/website-repository
python -m http.server 8000
```

Visit `http://localhost:8000/travel.html`.
The automated browser checks separately mount this checkout at `/my-personal-website/`
and verify both pages and their relative assets there. Substitute an installed
Python command if needed. No installation or build step is required for the site.

## Add a trip later

Edit `data/trips.js` and add objects to `window.TRAVEL_TRIPS`. Required fields:
`date` (`YYYY-MM-DD`), `city`, `country`, `coordinates` (`latitude`, `longitude`),
`description`, and `photos` (array of relative photo paths). Use actual trip dates.
The code sorts entries automatically; array order does not matter. Photo paths
and coordinates are stored for later use; the current page does not load images
or initialize a map. No fabricated trips are supplied.

Keep links and paths relative (no leading `/`) so they stay within the project
base path. New photo paths should be relative to `travel.html`.

## Deployment

No new configuration is needed for the existing root GitHub Pages site.
The authoritative local Git checkout is now `outputs/website-repository/`, with
`.git`, `index.html`, `travel.html`, `travel.css`, `travel.js`, `TRAVEL.md`, and
`data/trips.js` at the correct repository-relative paths. The older
`outputs/my-personal-website/` and ZIP are exports, not this checkout.
Open `outputs/website-repository/` as the repository in your Git client. Review
the six changed/new files, create a feature branch, commit, and publish that branch
when ready. Open a pull request targeting `main` and review before merging.
Do not upload the containing `outputs/` folder into the GitHub repository.
Leave existing images and other files in place. A push to the publishing
branch can trigger the existing deployment; no push or deployment was performed
while preparing this local copy.

The eventual public route is:
`https://baiyao1219.github.io/my-personal-website/travel.html`.
