const CACHE = 'cache-and-update-v1.1.4';
const resources = [
      '/',
      '/az',
      '/offline.html',
      '/az/qiymet-cedveli-9',
      '/az/dasinma-sertleri-4',
      '/az/nece-isleyirik-10',
      '/az/haqqimizda-8',
      '/az/tez-tez-verilen-suallar-7',
      '/az/numune-saytlar-6',
      '/az/bloq-5',
      '/az/sifaris-et-xidmet-sertleri-3',
      '/az/gizlilik-siyaseti-2',
      '/az/elaqe-21'



    ]



self.addEventListener('install', function(evt) {
  console.log('The service worker is being installed.');
  self.skipWaiting()
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
          return cacheName !== CACHE;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', function(evt) {

  if(!(evt.request.url.indexOf('http') === 0)  || evt.request.method=="POST" || evt.request.mode !== 'navigate'){
    return evt.respondWith(fetch(evt.request))
  }
  evt.respondWith(fromCache(evt.request));
  evt.waitUntil(update(evt.request)
    // .then(refresh)
  );
});

function precache() {
  return caches.open(CACHE).then(function (cache) {
    return cache.addAll(resources);
  });
}

function fromCache(request) {
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request).then(function (matching) {
      return matching ||  fetch(request).catch(error=>{
                              return caches.match('/offline.html')
                          });
    });
  });
}

function update(request) {
  // if(request.mode !== 'navigate'){
  //   return true;
  // }

  // don't cache if get request

  if(/[?]/.test(request.url)){
    return true;
  }
  return caches.open(CACHE).then(function (cache) {

    return fetch(request).then(function (response) {
      console.log(response.type)
      if(response.status>300 || response.type!=='basic'){
        return true;
      }

      return cache.put(request, response.clone()).then(function () {
        return response;
      });

    });
  });
}


function refresh(response) {
  return self.clients.matchAll().then(function (clients) {
    clients.forEach(function (client) {

      var message = {
        type: 'refresh',
        url: response.url,
        eTag: response.headers.get('ETag')
      };
      client.postMessage(JSON.stringify(message));
    });
  });
}




// @ compare cached with network response. Should find a way to use it
// caches.open('cache-and-update-v1.1.4').then(function (cache) {
//     cache.match('/').then(m => m.text()).then(b=>{
//         fetch('/az').then(res=>res.text()).then(e => console.log(b.localeCompare(e)))
//     })
// })
