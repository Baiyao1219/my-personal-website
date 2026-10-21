/**
 * Confirmed trips only. Keep each id unique and stable for timeline/gallery links.
 * date: YYYY-MM for a confirmed month, or YYYY-MM-DD for a confirmed day.
 * places: [{ city, country, latitude, longitude }]; coordinates are finite numbers.
 * description: optional plain text; omit until personal notes are provided.
 * photos: site-relative paths, or { src, alt, width, height, srcset? } objects.
 * srcset: optional [{ src, width }] image variants. See TRAVEL.md for examples.
 * Keep paths relative, with no leading slash, for GitHub Pages project hosting.
 * One gallery.html template reads photos by trip id; empty arrays show no images.
 * Legacy single-city records and nested coordinates objects remain supported.
 *
 * Shape (template only; not a trip):
 * {
 *   id: "unique-trip-id",
 *   date: "YYYY-MM",
 *   places: [{ city: "City", country: "Country", latitude: 0, longitude: 0 }],
 *   photos: []
 * }
 */
window.TRAVEL_TRIPS = [
  {
    id: '2026-10-croatia',
    date: '2026-10',
    places: [
      // GeoNames city location: https://www.geonames.org/3190261/split.html
      { city: 'Split', country: 'Croatia', latitude: 43.50891, longitude: 16.43915 },
      // UNESCO historic city: https://whc.unesco.org/en/list/810/ (N43 31 1.5 E16 15 4.9).
      { city: 'Trogir', country: 'Croatia', latitude: 43.51708, longitude: 16.25136 },
      // GeoNames city location: https://www.geonames.org/3186952/zadar.html
      { city: 'Zadar', country: 'Croatia', latitude: 44.11578, longitude: 15.22514 }
    ],
    photos: []
  },
  {
    id: '2026-09-sweden',
    date: '2026-09',
    places: [
      // GeoNames city location: https://www.geonames.org/2673730/stockholm.html
      { city: 'Stockholm', country: 'Sweden', latitude: 59.32938, longitude: 18.06871 }
    ],
    photos: []
  }
];
