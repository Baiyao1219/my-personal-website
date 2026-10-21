/* Plain scripts keep this static page usable on GitHub Pages and via file://. */
(() => {
  const timeline = document.getElementById('trip-timeline');
  const trips = Array.isArray(window.TRAVEL_TRIPS) ? window.TRAVEL_TRIPS : [];
  const isCalendarDate = value => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  };
  const entries = trips.filter(trip => trip && isCalendarDate(trip.date)
    && typeof trip.city === 'string' && typeof trip.country === 'string')
    .slice().sort((a, b) => b.date.localeCompare(a.date));
  if (!timeline || entries.length === 0) return;

  const formatDate = new Intl.DateTimeFormat('en', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
  });
  const fragment = document.createDocumentFragment();
  let year;
  let list;
  entries.forEach(trip => {
    const tripYear = trip.date.slice(0, 4);
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
    const date = document.createElement('time');
    date.className = 'trip-date';
    date.dateTime = trip.date;
    date.textContent = formatDate.format(new Date(`${trip.date}T00:00:00Z`));
    const title = document.createElement('h4');
    title.className = 'trip-title';
    title.textContent = `${trip.city}, ${trip.country}`;
    const description = document.createElement('p');
    description.className = 'trip-description';
    description.textContent = typeof trip.description === 'string' ? trip.description : '';
    item.append(date, title, description);
    list.append(item);
  });
  timeline.replaceChildren(fragment);
})();
