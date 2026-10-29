// Analytics is optional, strictly production-only, and never reads private study data.
const HOST = 'www.scripturetrails.com';
const CONSENT_KEY = 'scripture-trails:analytics-consent';
const SECTION_NAMES = Object.freeze({
  discover: 'Discover', reader: 'Bible reader', connections: 'Connection Atlas',
  'jesus-map': 'Journeys of Jesus', 'paul-map': 'Journeys of Paul',
  'hebrew-geography': 'Hebrew Bible geography', 'city-studies': 'Historical cities',
  entities: 'People, places and events', roadmap: 'Roadmap',
  journeys: 'Study journeys', notebook: 'Notebook', about: 'About'
});

export function isProductionHost(host) { return host === HOST; }
export function normaliseSection(value) {
  return Object.prototype.hasOwnProperty.call(SECTION_NAMES, value) ? value : 'discover';
}
export function sectionPageview(view) {
  const section = normaliseSection(view);
  return {
    page_title: 'Scripture Trails | ' + SECTION_NAMES[section],
    page_location: 'https://' + HOST + '/?view=' + encodeURIComponent(section)
  };
}

function readConsent(storage) {
  try {
    const value = storage.getItem(CONSENT_KEY);
    return value === 'allow' || value === 'deny' ? value : null;
  } catch { return null; }
}
function saveConsent(storage, value) {
  try { storage.setItem(CONSENT_KEY, value); } catch { /* Session-only choice. */ }
}

export async function initialiseAnalytics(win, doc) {
  // Neither config nor Google's library is requested from previews or localhost.
  if (!isProductionHost(win.location.hostname)) return false;
  let response;
  try { response = await win.fetch('/api/analytics-config', {cache: 'no-store', credentials: 'same-origin'}); }
  catch { return false; }
  if (!response.ok) return false;
  let config;
  try { config = await response.json(); } catch { return false; }
  const measurementId = config?.measurementId;
  if (typeof measurementId !== 'string' || !/^G-[A-Z0-9]{6,20}$/.test(measurementId)) return false;

  const panel = doc.getElementById('analytics-consent');
  const accept = doc.getElementById('analytics-allow');
  const decline = doc.getElementById('analytics-decline');
  const manage = doc.getElementById('analytics-manage');
  if (!panel || !accept || !decline || !manage) return false;

  let enabled = false;
  let lastSection = null;
  const currentSection = () => normaliseSection(
    doc.querySelector('.view.active-view')?.id?.replace(/^view-/, '') ||
    new URL(win.location.href).searchParams.get('view')
  );

  function trackSection(section) {
    const safe = normaliseSection(section);
    if (!enabled || safe === lastSection) return;
    lastSection = safe;
    // Do not send Bible references, searches, notes, highlights or URL parameters.
    win.gtag('event', 'page_view', sectionPageview(safe));
  }
  doc.addEventListener('scripturetrails:view-change', event => trackSection(event.detail?.view));

  function startTracking() {
    if (enabled) return;
    enabled = true;
    win.dataLayer = win.dataLayer || [];
    win.gtag = function gtag() { win.dataLayer.push(arguments); };
    win.gtag('js', new Date());
    win.gtag('consent', 'default', {
      analytics_storage: 'granted', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied'
    });
    win.gtag('config', measurementId, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
    const tag = doc.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    doc.head.appendChild(tag);
    trackSection(currentSection());
  }

  manage.hidden = false;
  accept.addEventListener('click', () => {
    saveConsent(win.localStorage, 'allow');
    panel.hidden = true;
    startTracking();
  });
  decline.addEventListener('click', () => {
    saveConsent(win.localStorage, 'deny');
    panel.hidden = true;
    if (enabled) {
      enabled = false;
      win.gtag('consent', 'update', {analytics_storage: 'denied'});
      // Stop further measurement immediately; subsequent loads never load GA.
      win.location.reload();
    }
  });
  manage.addEventListener('click', () => { panel.hidden = false; accept.focus(); });
  const choice = readConsent(win.localStorage);
  if (choice === 'allow') startTracking();
  else panel.hidden = choice === 'deny';
  return true;
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  void initialiseAnalytics(window, document);
}
