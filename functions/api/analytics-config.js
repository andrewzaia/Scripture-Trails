// The measurement ID is a public tag destination, never a secret credential.
const HEADERS = {
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff'
};
export function analyticsConfig(request, env) {
  if (new URL(request.url).hostname !== 'www.scripturetrails.com') {
    return new Response(null, {status: 204, headers: HEADERS});
  }
  const id = env?.GA4_MEASUREMENT_ID;
  if (typeof id !== 'string' || !/^G-[A-Z0-9]{6,20}$/.test(id)) {
    return new Response(null, {status: 204, headers: HEADERS});
  }
  return new Response(JSON.stringify({measurementId: id}), {status: 200, headers: HEADERS});
}
export function onRequestGet({request, env}) { return analyticsConfig(request, env); }
