/* Plain scripts keep this static page usable on GitHub Pages and via file://. */
(() => {
  const timeline = document.getElementById('trip-timeline');
  const trips = Array.isArray(window.TRAVEL_TRIPS) ? window.TRAVEL_TRIPS : [];
  const isCalendarDate = value => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  };
  const entries = trips.map((trip, index) => trip && ({ ...trip, entryId: `trip-${index}` }))
    .filter(trip => trip && typeof trip.city === 'string' && typeof trip.country === 'string')
    .sort((a, b) => (isCalendarDate(b.date) ? b.date : '').localeCompare(isCalendarDate(a.date) ? a.date : ''));
  if (!timeline) return;

  const formatDate = new Intl.DateTimeFormat('en', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
  });
  const fragment = document.createDocumentFragment();
  let year;
  let list;
  entries.forEach(trip => {
    const tripYear = isCalendarDate(trip.date) ? trip.date.slice(0, 4) : 'Undated';
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
    if (isCalendarDate(trip.date)) date.dateTime = trip.date;
    date.textContent = isCalendarDate(trip.date) ? formatDate.format(new Date(`${trip.date}T00:00:00Z`)) : 'Date to be added';
    const title = document.createElement('h4');
    title.className = 'trip-title';
    title.textContent = `${trip.city}, ${trip.country}`;
    const description = document.createElement('p');
    description.className = 'trip-description';
    description.textContent = typeof trip.description === 'string' ? trip.description : '';
    item.append(date, title, description);
    list.append(item);
  });
  if (entries.length) timeline.replaceChildren(fragment);

  const container = document.getElementById('travel-map');
  const status = document.getElementById('map-status');
  if (!container || !status) return;
  const locations = entries.map(trip => {
    const { latitude, longitude } = trip.coordinates || trip;
    return { trip, latitude, longitude };
  }).filter(({ latitude, longitude }) => Number.isFinite(latitude) && Number.isFinite(longitude)
    && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180);
  if (!window.L) {
    status.textContent = 'The map could not load. Please check your connection or browse the timeline below.';
    return;
  }
  container.hidden = false;
  const map = L.map(container, { scrollWheelZoom: false, worldCopyJump: true }).setView([20, 0], 2);
  const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  const summary = locations.length
    ? `${locations.length} ${locations.length === 1 ? 'trip' : 'trips'} on the map. Select a marker to explore the timeline.`
    : entries.length ? 'No trip coordinates have been added yet. You can browse the timeline below.'
      : 'No trips have been added yet. Places will appear here as the archive grows.';
  status.textContent = summary;
  tiles.on('tileerror', () => {
    status.textContent = `${summary} Some map tiles could not load. Check your connection; trip markers and the timeline remain available.`;
  });
  const icon = L.divIcon({ className: 'trip-marker', html: '<span aria-hidden="true"></span>', iconSize: [44, 44], iconAnchor: [22, 22], popupAnchor: [0, -12] });
  locations.forEach(location => {
    const { trip, latitude, longitude } = location;
    const popup = document.createElement('div');
    // Repeated visits share a popup list so overlapping markers never hide a trip.
    locations.filter(other => other.latitude === latitude && other.longitude === longitude).forEach(({ trip: visit }) => {
      const entry = document.createElement('div');
      entry.className = 'map-visit';
      const heading = document.createElement('strong');
      heading.textContent = `${visit.city}, ${visit.country}`;
      const date = document.createElement('p');
      date.textContent = isCalendarDate(visit.date) ? formatDate.format(new Date(`${visit.date}T00:00:00Z`)) : 'Date to be added';
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
    L.marker([latitude, longitude], { icon, title: `${trip.city}, ${trip.country}`, alt: `${trip.city}, ${trip.country} — view trip`, riseOnHover: true })
      .addTo(map).bindPopup(popup, {
        maxWidth: 220, maxHeight: 180,
        autoPanPaddingTopLeft: [12, 105], autoPanPaddingBottomRight: [12, 12]
      });
  });
  if (locations.length) {
    map.fitBounds(L.latLngBounds(locations.map(({ latitude, longitude }) => [latitude, longitude])), { padding: [35, 35], maxZoom: 6 });
  }
  // Recompute sizing when responsive layouts or device orientation change.
  if (window.ResizeObserver) new ResizeObserver(() => map.invalidateSize()).observe(container);
})();
