// 대장 플레이 전용 서비스 워커. 범위는 /daejang-play/ 안쪽만 (다른 앱에 영향 없음).
// 인터넷 먼저, 끊기면 마지막으로 받은 화면을 보여 준다. 캐시 이름은 daejang-play- 로만 시작.
const CACHE = 'daejang-play-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(n => n.startsWith('daejang-play-') && n !== CACHE).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.registration.scope)) return;
  event.respondWith((async () => {
    try {
      const res = await fetch(req);
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    } catch (e) {
      const hit = await caches.match(req, { ignoreSearch: true });
      return hit || (req.mode === 'navigate' ? caches.match(self.registration.scope) : Response.error());
    }
  })());
});
