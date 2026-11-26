/* Fourline · Mais ensino — modo offline (service worker) */
const V='fl-13.2-1';
const CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>{})))))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('fl-')&&x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('message',e=>{if(e.data==='skip')self.skipWaiting()});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);if(u.origin!==self.location.origin)return; // Neon e fontes: direto na rede
  if(u.pathname.endsWith('/sw.js'))return;
  const page=r.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('/index.html');
  if(page){
    // página: sempre a versão mais nova da rede; sem internet, a cópia guardada
    e.respondWith(fetch(r).then(res=>{if(res&&res.ok&&res.type==='basic'){const cp=res.clone();caches.open(V).then(c=>c.put('index.html',cp))}return res})
      .catch(()=>caches.open(V).then(c=>c.match('index.html').then(x=>x||c.match('./'))).then(x=>x||new Response('<h1>Sem conexão</h1><p>Abra o Fourline uma vez com internet para usar sem conexão.</p>',{headers:{'Content-Type':'text/html; charset=utf-8'}}))));
    return}
  // ícones e manifesto: cópia guardada primeiro
  e.respondWith(caches.open(V).then(c=>c.match(r,{ignoreSearch:true}).then(x=>x||fetch(r).then(res=>{if(res&&res.ok&&res.type==='basic')c.put(r,res.clone());return res}))));
});
