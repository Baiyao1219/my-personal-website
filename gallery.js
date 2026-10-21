(() => {
  const trips = Array.isArray(window.TRAVEL_TRIPS) ? window.TRAVEL_TRIPS : [];
  const id = new URLSearchParams(window.location.search).get('trip');
  const trip = trips.find(item => item && typeof item.id === 'string' && item.id === id);
  const title = document.getElementById('gallery-title');
  const status = document.getElementById('gallery-status');
  const grid = document.getElementById('photo-grid');
  if (!trip) {
    title.textContent = 'Trip not found.';
    status.textContent = 'This trip is not in the archive. Return to Travel Archive to find a gallery.';
    document.title = 'Trip not found — Baiyao';
    return;
  }

  const places = (Array.isArray(trip.places) ? trip.places : [trip])
    .filter(place => place && typeof place.city === 'string' && typeof place.country === 'string');
  const countries = [...new Set(places.map(place => place.country))].join(' / ');
  const cities = [...new Set(places.map(place => place.city))].join(' · ');
  const tripTitle = typeof trip.title === 'string' && trip.title.trim() ? trip.title : countries || 'Travel Gallery';
  title.textContent = tripTitle;
  document.title = `${tripTitle} — Travel Gallery — Baiyao`;
  document.getElementById('gallery-countries').textContent = countries;
  document.getElementById('gallery-cities').textContent = cities;
  document.getElementById('archive-link').href = `travel.html#trip-${encodeURIComponent(trip.id)}`;
  const month = typeof trip.date === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(trip.date);
  const day = typeof trip.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(trip.date);
  const parsedDate = new Date(`${trip.date}${month ? '-01' : ''}T00:00:00Z`);
  const validDate = (month || day) && !Number.isNaN(parsedDate.getTime())
    && parsedDate.toISOString().slice(0, month ? 7 : 10) === trip.date;
  if (validDate) {
    const time = document.createElement('time');
    time.dateTime = trip.date;
    time.textContent = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(parsedDate);
    document.getElementById('gallery-date').append(time);
  }

  // Only paths inside this project's directory are accepted, including file:// previews.
  const localPath = value => {
    if (typeof value !== 'string' || !value.trim() || /^[\\/]|^[a-z][a-z0-9+.-]*:/i.test(value)) return null;
    const base = new URL('.', document.baseURI);
    try {
      const url = new URL(value, base);
      return url.href.startsWith(base.href) ? url.href : null;
    } catch { return null; }
  };
  const dimension = value => Number.isInteger(value) && value > 0 ? value : null;
  const photos = (Array.isArray(trip.photos) ? trip.photos : []).map((photo, index) => {
    const item = typeof photo === 'string' ? { src: photo } : photo;
    if (!item || !localPath(item.src)) return null;
    return {
      src: localPath(item.src),
      alt: typeof item.alt === 'string' && item.alt.trim() ? item.alt : `Photo ${index + 1} from ${tripTitle}${cities ? ` — ${cities}` : ''}`,
      width: dimension(item.width) || 1200,
      height: dimension(item.height) || 900,
      caption: typeof item.caption === 'string' ? item.caption : '',
      srcset: (Array.isArray(item.srcset) ? item.srcset : [])
        .filter(source => source && localPath(source.src) && dimension(source.width))
        .map(source => `${localPath(source.src)} ${source.width}w`).join(', ')
    };
  }).filter(Boolean);
  document.getElementById('photo-count').textContent = `${photos.length} / ${photos.length === 1 ? 'PHOTO' : 'PHOTOS'}`;
  if (!photos.length) {
    status.textContent = 'Photos coming soon.';
    return;
  }
  status.hidden = true;
  grid.hidden = false;

  const dialog = document.getElementById('lightbox');
  const media = document.getElementById('lightbox-media');
  const previous = document.getElementById('lightbox-previous');
  const next = document.getElementById('lightbox-next');
  const close = document.getElementById('lightbox-close');
  let current = 0;
  let opener;
  const imageElement = (photo, sizes, lazy = false) => {
    const image = document.createElement('img');
    image.alt = photo.alt;
    image.width = photo.width;
    image.height = photo.height;
    image.decoding = 'async';
    image.loading = lazy ? 'lazy' : 'eager';
    if (photo.srcset) { image.srcset = photo.srcset; image.sizes = sizes; }
    image.src = photo.src;
    return image;
  };
  const showPhoto = index => {
    current = (index + photos.length) % photos.length;
    const photo = photos[current];
    const image = imageElement(photo, '92vw');
    image.draggable = false;
    image.hidden = true;
    const message = document.createElement('p');
    message.textContent = 'Loading photo…';
    const loaded = () => { image.hidden = false; message.hidden = true; };
    const failed = () => { image.hidden = true; message.hidden = false; message.textContent = 'This photo is currently unavailable.'; };
    image.addEventListener('load', loaded);
    image.addEventListener('error', failed);
    media.replaceChildren(image, message);
    if (image.complete) { if (image.naturalWidth) loaded(); else failed(); }
    document.getElementById('lightbox-counter').textContent = `Photo ${current + 1} of ${photos.length}`;
    document.getElementById('lightbox-caption').textContent = photo.caption || photo.alt;
    previous.disabled = next.disabled = photos.length < 2;
  };
  document.getElementById('lightbox-title').textContent = `${tripTitle} photo viewer`;
  photos.forEach((photo, index) => {
    const figure = document.createElement('figure');
    figure.className = 'photo-card';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'photo-button';
    button.setAttribute('aria-label', `Open photo ${index + 1}: ${photo.alt}`);
    button.setAttribute('aria-haspopup', 'dialog');
    const image = imageElement(photo, '(max-width: 480px) 88vw, (max-width: 900px) 43vw, 350px', true);
    image.addEventListener('error', () => {
      image.hidden = true;
      button.disabled = true;
      button.textContent = 'Photo unavailable.';
      button.setAttribute('aria-label', `Photo ${index + 1} unavailable`);
    });
    button.append(image);
    button.addEventListener('click', () => {
      opener = button;
      showPhoto(index);
      dialog.showModal();
      document.body.classList.add('lightbox-open');
      close.focus();
    });
    figure.append(button);
    if (photo.caption) {
      const caption = document.createElement('figcaption');
      caption.textContent = photo.caption;
      figure.append(caption);
    }
    grid.append(figure);
  });
  const bindControl = (button, action) => {
    button.addEventListener('click', action);
    // Handle taps directly, including immediately after a swipe suppresses mouse synthesis.
    let start;
    button.addEventListener('touchstart', event => {
      const touch = event.touches[0];
      start = event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : null;
    }, { passive: true });
    button.addEventListener('touchend', event => {
      const touch = event.changedTouches[0];
      if (start && !button.disabled && !event.touches.length
        && Math.hypot(touch.clientX - start.x, touch.clientY - start.y) < 15) {
        event.preventDefault();
        action();
      }
      start = null;
    });
    button.addEventListener('touchcancel', () => { start = null; }, { passive: true });
  };
  bindControl(previous, () => showPhoto(current - 1));
  bindControl(next, () => showPhoto(current + 1));
  bindControl(close, () => dialog.close());
  // Native modal dialog makes the background inert and traps keyboard focus.
  dialog.addEventListener('close', () => {
    document.body.classList.remove('lightbox-open');
    opener?.focus({ preventScroll: true });
  });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Tab') {
      const controls = [...dialog.querySelectorAll('button:not(:disabled)')];
      const target = event.shiftKey ? controls.at(-1) : controls[0];
      if ((event.shiftKey && document.activeElement === controls[0])
        || (!event.shiftKey && document.activeElement === controls.at(-1))) {
        event.preventDefault();
        target.focus();
      }
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showPhoto(current + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  let swipe;
  media.addEventListener('touchstart', event => {
    const touch = event.touches[0];
    swipe = event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY, id: touch.identifier } : null;
  }, { passive: true });
  media.addEventListener('touchend', event => {
    const touch = [...event.changedTouches].find(item => item.identifier === swipe?.id);
    if (!swipe || !touch || event.touches.length) { swipe = null; return; }
    const dx = touch.clientX - swipe.x;
    const dy = touch.clientY - swipe.y;
    swipe = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) showPhoto(current + (dx < 0 ? 1 : -1));
  }, { passive: true });
  media.addEventListener('touchcancel', () => { swipe = null; }, { passive: true });
})();
