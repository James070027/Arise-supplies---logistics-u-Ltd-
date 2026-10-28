const C='arise-v4',FILES=['./','index.html','style.css','data.js','app.js','live.js','manifest.json','logo.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(FILES.map(u=>c.add(u).catch(()=>{})))));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||!r.url.startsWith('http'))return;
e.respondWith(fetch(r).then(res=>{if(res.ok){const cl=res.clone();caches.open(C).then(c=>c.put(r,cl));}return res;}).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))));});
