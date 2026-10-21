/**
 * Add real trips here when ready. This dataset is deliberately empty.
 * date: ISO calendar date (YYYY-MM-DD), used to sort newest first.
 * city, country, description: plain text.
 * coordinates: { latitude: number (-90..90), longitude: number (-180..180) }.
 * photos: array of site-relative paths, e.g. "photos/trip-name/image.jpg".
 * Keep paths relative, with no leading slash, for GitHub Pages project hosting.
 * The map uses coordinates; photo paths are reserved for a future gallery.
 * Existing coordinates objects are supported unchanged. Top-level latitude and
 * longitude are also accepted if coordinates is omitted. Use numbers, not strings.
 *
 * Shape (template only; not a trip):
 * {
 *   date: "YYYY-MM-DD",
 *   city: "City",
 *   country: "Country",
 *   coordinates: { latitude: 0, longitude: 0 },
 *   description: "Your travel notes.",
 *   photos: []
 * }
 */
window.TRAVEL_TRIPS = [];
