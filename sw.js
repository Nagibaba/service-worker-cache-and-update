const CACHE = 'cache-and-update-v1';
const resources = [
      // '/style.css',
      'service-worker-cache-and-update/',
      '/service-worker-cache-and-update/offline.html',


    ]

self.addEventListener('install', function(evt) {
  console.log('The service worker is being installed.');
  evt.waitUntil(precache());
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          // Return true if you want to remove this cache,
          // but remember that caches are shared across
          // the whole origin
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', function(evt) {
  console.log('The service worker is serving the asset.');
  if(!(evt.request.url.indexOf('http') === 0)){
    return evt.respondWith(fetch(evt.request))
  }
  evt.respondWith(fromCache(evt.request));
  evt.waitUntil(update(evt.request));
});

function precache() {
  return caches.open(CACHE).then(function (cache) {
    return cache.addAll(resources);
  });
}

function fromCache(request) {
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request).then(function (matching) {
      return matching || fetch(request).catch(error=>{
                return caches.match('./offline.html')
            });
    });
  });
}

function update(request) {
  console.log(1, request.mode, request.origin, request.url, request.action)
  // if(request.mode !== 'navigate'){
  //   return true;
  // }
  return caches.open(CACHE).then(function (cache) {
    return fetch(request).then(function (response) {
      // console.log(response.status)
      // if(response.status>=200 && response.status<300){
        return cache.put(request, response);
      // } 
    });
  });
}


