/* Plain scripts keep this static page usable on GitHub Pages and via file://. */
(() => {
  const timeline = document.getElementById('trip-timeline');
  const trips = Array.isArray(window.TRAVEL_TRIPS) ? window.TRAVEL_TRIPS : [];
  const isMonth = value => typeof value === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
  const isCalendarDate = value => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  };
  const hasDate = value => isMonth(value) || isCalendarDate(value);
  const entries = trips.filter(trip => trip && typeof trip === 'object').map((trip, index) => ({
    ...trip,
    entryId: `trip-${typeof trip.id === 'string' && /^[a-z0-9_-]+$/i.test(trip.id) ? trip.id : index}`,
    places: (Array.isArray(trip.places) ? trip.places : [trip])
      .filter(place => place && typeof place.city === 'string' && typeof place.country === 'string')
  })).filter(trip => trip.places.length)
    .sort((a, b) => (hasDate(b.date) ? b.date : '').localeCompare(hasDate(a.date) ? a.date : ''));
  if (!timeline) return;

  const formatDate = new Intl.DateTimeFormat('en', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
  });
  const formatMonth = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const dateLabel = value => isMonth(value)
    ? formatMonth.format(new Date(`${value}-01T00:00:00Z`))
    : isCalendarDate(value) ? formatDate.format(new Date(`${value}T00:00:00Z`)) : 'Date to be added';
  const fragment = document.createDocumentFragment();
  let year;
  let list;
  entries.forEach(trip => {
    const tripYear = hasDate(trip.date) ? trip.date.slice(0, 4) : 'Undated';
    if (tripYear !== year) {
      year = tripYear;
      const group = document.createElement('div');
      group.className = 'timeline-year';
      const heading = document.createElement('h3');
      heading.id = `year-${year}`;
      heading.textContent = year;
      list = document.createElement('ol');
      list.className = 'trip-list';
      list.setAttribute('aria-labelledby', heading.id);
      group.append(heading, list);
      fragment.append(group);
    }
    const item = document.createElement('li');
    item.id = trip.entryId;
    item.tabIndex = -1;
    const date = document.createElement('time');
    date.className = 'trip-date';
    if (hasDate(trip.date)) date.dateTime = trip.date;
    date.textContent = dateLabel(trip.date);
    const title = document.createElement('h4');
    title.className = 'trip-title';
    title.textContent = Array.isArray(trip.places) && !trip.city
      ? [...new Set(trip.places.map(place => place.country))].join(' / ')
      : `${trip.city}, ${trip.country}`;
    const places = document.createElement('p');
    places.className = 'trip-places';
    places.textContent = trip.places.map(place => place.city).join(' · ');
    const description = document.createElement('p');
    description.className = 'trip-description';
    description.textContent = typeof trip.description === 'string' ? trip.description : '';
    item.append(date, title);
    if (!trip.city) item.append(places);
    if (description.textContent) item.append(description);
    list.append(item);
  });
  if (entries.length) timeline.replaceChildren(fragment);
  else {
    timeline.querySelector('.empty-state h3').textContent = 'Stories to come.';
    timeline.querySelector('.empty-state p').textContent = 'No trips have been added to this archive yet.';
  }

  const container = document.getElementById('travel-map');
  const status = document.getElementById('map-status');
  if (!container || !status) return;
  const visits = entries.flatMap(trip => trip.places.map(place => {
    const { latitude, longitude } = place.coordinates || place;
    return { trip, place, latitude, longitude };
  })).filter(({ latitude, longitude }) => Number.isFinite(latitude) && Number.isFinite(longitude)
    && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180);
  // A city visited on multiple trips gets one marker and links to every visit.
  const cities = new Map();
  visits.forEach(visit => {
    const key = `${visit.place.city.trim().toLowerCase()}|${visit.place.country.trim().toLowerCase()}`;
    if (!cities.has(key)) cities.set(key, visit);
  });
  const locations = [...cities.values()];
  if (!window.L) {
    status.textContent = 'The map could not load. Please check your connection or browse the timeline below.';
    container.querySelector('.map-loading').textContent = 'The world map is temporarily unavailable. Please reload to try again.';
    return;
  }
  container.replaceChildren();
  const map = L.map(container, { scrollWheelZoom: false, worldCopyJump: true }).setView([20, 0], 2);
  const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  const summary = locations.length
    ? `${locations.length} ${locations.length === 1 ? 'city' : 'cities'} on the map. Select a marker to explore the timeline.`
    : entries.length ? 'No trip coordinates have been added yet. You can browse the timeline below.'
      : 'No trips have been added yet. Places will appear here as the archive grows.';
  status.textContent = summary;
  tiles.on('tileerror', () => {
    status.textContent = `${summary} Some map tiles could not load. Check your connection; trip markers and the timeline remain available.`;
  });
  const icon = L.divIcon({ className: 'trip-marker', html: '<span aria-hidden="true"></span>', iconSize: [44, 44], iconAnchor: [22, 22], popupAnchor: [0, -12] });
  locations.forEach(location => {
    const { place, latitude, longitude } = location;
    const popupContent = () => {
      const popup = document.createElement('div');
      // Nearby cities share links at wide zooms, keeping overlapping markers usable.
      visits.filter(other => map.latLngToLayerPoint([latitude, longitude])
        .distanceTo(map.latLngToLayerPoint([other.latitude, other.longitude])) < 44)
        .sort((a, b) => Number(b.place.city === place.city) - Number(a.place.city === place.city))
        .forEach(({ trip: visit, place: visitedPlace }) => {
          const entry = document.createElement('div');
          entry.className = 'map-visit';
          const heading = document.createElement('strong');
          heading.textContent = `${visitedPlace.city}, ${visitedPlace.country}`;
          const date = document.createElement('p');
          date.textContent = dateLabel(visit.date);
          const link = document.createElement('a');
          link.href = `#${visit.entryId}`;
          link.textContent = 'View in timeline ↓';
          link.addEventListener('click', () => {
            map.closePopup();
            document.getElementById(visit.entryId).focus({ preventScroll: true });
          });
          entry.append(heading, date, link);
          popup.append(entry);
        });
      return popup;
    };
    L.marker([latitude, longitude], { icon, title: `${place.city}, ${place.country}`, alt: `${place.city}, ${place.country} — view trip`, riseOnHover: true })
      .addTo(map).bindPopup(popupContent, {
        maxWidth: 220, maxHeight: 180,
        autoPanPaddingTopLeft: [12, 105], autoPanPaddingBottomRight: [12, 12]
      });
  });
  if (locations.length) {
    map.fitBounds(L.latLngBounds(locations.map(({ latitude, longitude }) => [latitude, longitude])), { padding: [35, 35], maxZoom: 6 });
  }
  // Recompute sizing when responsive layouts or device orientation change.
  requestAnimationFrame(() => map.invalidateSize());
  if (window.ResizeObserver) new ResizeObserver(() => map.invalidateSize()).observe(container);
})();
