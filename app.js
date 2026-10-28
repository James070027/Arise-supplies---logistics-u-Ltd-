/* ===== helpers ===== */
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=s=>parseInt(String(s).replace(/\D/g,''),10)||0;
const stars=v=>Math.min(5,Math.max(1,parseInt(v)||5));
const clone=o=>JSON.parse(JSON.stringify(o));
const ld=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}};
const sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};

/* ===== state ===== */
const BASE=Object.assign({},DEF,window.LIVE||{});
const S={products:ld('arise_products',clone(BASE.products)),inside:ld('arise_inside',clone(BASE.inside)),outside:ld('arise_outside',clone(BASE.outside)),reviews:ld('arise_reviews',clone(BASE.reviews)),settings:{...DEF.settings,...(BASE.settings||{}),...ld('arise_settings',{})}};
let ADMIN_PASS='Arise2026';try{ADMIN_PASS=localStorage.getItem('arise_admin_pass')||ADMIN_PASS}catch(e){}
let orders=ld('arise_cart',[]),busy=false;
const waNum=()=>S.settings.wa;
function persist(){sv('arise_products',S.products);sv('arise_inside',S.inside);sv('arise_outside',S.outside);sv('arise_reviews',S.reviews);sv('arise_settings',S.settings);}

/* ===== public rendering ===== */
function renderProducts(){
 $('productGrid').innerHTML=S.products.map((p,i)=>{
  const vid=p.photo&&/\.(mp4|mov|webm)$/i.test(p.photo);
  const m=p.photo?(vid?`<video src="${esc(p.photo)}" controls></video>`:`<img src="${esc(p.photo)}" alt="${esc(p.name)}">`):'COMING SOON';
  const cls=p.photo?'product-img':`product-img coming ${esc(p.cat)}`;
  return `<div class="product-card"><div class="${cls}">${m}</div><div class="product-body"><b>${esc(p.name)}</b><br><small style="opacity:.6">${esc(p.qty)}</small><br><b style="color:#C41E1E">${esc(p.price)} UGX</b><br><div style="display:flex;gap:8px;margin-top:12px"><input type="number" min="1" value="1" id="pq${i}" class="input" inputmode="numeric" aria-label="Quantity" style="width:72px;margin:0;text-align:center"><button class="btn btn-red" style="flex:1;justify-content:center" onclick="addItem(${i})">Add +</button></div></div></div>`;
 }).join('');
}
function renderRecipes(){
 const c=['','gold','','green'];
 $('recipeList').innerHTML=DEF.recipes.map((r,i)=>`<div class="recipe-card ${c[i%4]}"><h3>${i+1}. ${esc(r[0])}</h3><p><b>You need:</b> ${esc(r[1])}<br><b>Steps:</b> ${esc(r[2])}</p></div>`).join('');
}
function renderReviews(){
 const n=S.reviews.length,avg=n?(S.reviews.reduce((s,r)=>s+stars(r.stars),0)/n).toFixed(1):'-';
 $('revStats').innerHTML=`<div class="card" style="text-align:center"><b style="font-size:32px;color:#FFB800">${avg}★</b><br><small>${n} reviews</small></div><div class="card" style="text-align:center"><b style="font-size:32px">500+</b><br><small>Business clients</small></div><div class="card dark" style="text-align:center"><b style="font-size:32px;color:#FFB800">20X</b><br><small>Loyalty: 500k min = 1KG FREE</small></div>`;
 $('reviewsGrid').innerHTML=S.reviews.map(r=>`<div class="card"><div style="color:#FFB800">${'★'.repeat(stars(r.stars))}</div><b>${esc(r.name)} - ${esc(r.location)}</b><br><small style="opacity:.5">${esc(r.product)}</small><p style="margin-top:10px">${esc(r.text)}</p></div>`).join('');
}
function renderDelivery(){
 [['deliveryInsideTable','inside'],['deliveryOutsideTable','outside']].forEach(([id,k])=>{
  $(id).innerHTML='<tr><th>Area</th><th>Fee</th><th>Time</th></tr>'+S[k].map(f=>`<tr><td>${esc(f.area)}</td><td>${esc(f.fee)}</td><td>${esc(f.time)}</td></tr>`).join('');
 });
}
function renderSocial(){
 const s=S.settings;
 document.querySelectorAll('.wa-display').forEach(e=>e.textContent=s.waDisplay);
 const h=`<a href="${esc(s.x)}" target="_blank" rel="noopener" class="s-x">X</a><a href="${esc(s.fb)}" target="_blank" rel="noopener" class="s-fb">f</a><a href="${esc(s.ig)}" target="_blank" rel="noopener" class="s-ig">IG</a><a href="${esc(s.yt)}" target="_blank" rel="noopener" class="s-yt">YT</a>`;
 document.querySelectorAll('.socialLinks').forEach(e=>e.innerHTML=h);
}
function renderPublic(){renderProducts();renderReviews();renderDelivery();renderSocial();}
function greet(){
 const h=new Date().getHours();let g,t;
 if(h>=5&&h<12){g='Good morning';t='We are at Wandegeya Opposite The Junction, next to the mosque. Fresh meat is ready this morning: Apollo minced, beef, goat and chicken, weighed honestly and delivered cold.';}
 else if(h>=12&&h<17){g='Good afternoon';t='Fresh meat available now. Afternoon orders are delivered in 1 to 3 hours inside Kampala, cold chain maintained.';}
 else{g='Good evening';t='We are open until 9PM. Fresh meat for tomorrow is being prepared. Order tonight for 6AM delivery tomorrow.';}
 $('greetingH1').innerHTML=`${esc(g)}, Fresh Meat Delivered From Wandegeya, <span>Every Morning at 6AM.</span>`;
 $('greetingP').textContent=t;
}

/* ===== navigation ===== */
function showPage(id){
 document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
 $('page-'+id).classList.add('active');
 document.querySelectorAll('.drawer a').forEach(a=>a.classList.toggle('active',a.dataset.page===id));
 window.scrollTo(0,0);toggleDrawer(false);
}
function toggleDrawer(f){
 const d=$('drawer'),o=$('drawerOverlay'),open=f===undefined?!d.classList.contains('open'):f;
 d.classList.toggle('open',open);o.classList.toggle('open',open);
}
function toggleOrder(f){
 const p=$('orderPanel'),o=$('orderOverlay'),open=f===undefined?!p.classList.contains('open'):f;
 p.classList.toggle('open',open);o.classList.toggle('open',open);
}
function toggleChat(){$('chatBox').classList.toggle('open');}
function makeOrderAction(){if(orders.length)toggleOrder(true);else showPage('products');}
function directOrder(t){window.open(`https://api.whatsapp.com/send?phone=${waNum()}&text=${encodeURIComponent(t)}`,'_blank');}

/* ===== cart ===== */
function addItem(i){
 const p=S.products[i];if(!p)return;
 const inp=$('pq'+i),q=Math.min(999,Math.max(1,parseInt(inp&&inp.value)||1));
 const f=orders.find(x=>x.name===p.name);
 if(f)f.q+=q;else orders.push({name:p.name,qty:p.qty,price:p.price,q});
 if(inp)inp.value=1;
 updateOrders();toast(`${p.name} x${q} added. Keep adding, then tap View Order.`);
}
let toastT;
function toast(m){const t=$('toast');t.textContent=m;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2200);}
function setQty(i,v){const n=parseInt(v);if(!n||n<=0)orders.splice(i,1);else orders[i].q=Math.min(999,n);updateOrders();}
function changeQty(i,d){orders[i].q+=d;if(orders[i].q<=0)orders.splice(i,1);updateOrders();}
function removeItem(i){orders.splice(i,1);updateOrders();}
function updateOrders(){
 const t=orders.reduce((s,x)=>s+x.q,0);
 ['orderCount','drawerCount','totalItems'].forEach(id=>$(id).textContent=t);
 $('estTotal').textContent=orders.reduce((s,c)=>s+num(c.price)*c.q,0).toLocaleString();
 $('makeOrderFAB').textContent=orders.length?`🛒 View Order (${t})`:'→ Make Order';
 sv('arise_cart',orders);
 $('orderItems').innerHTML=orders.length?orders.map((c,i)=>`<div style="display:flex;gap:10px;padding:12px;border-bottom:1px solid #f0f0f0;align-items:center"><div style="flex:1"><b style="font-size:12.5px">${esc(c.name)}</b><br><small style="opacity:.6">${esc(c.qty)} - ${esc(c.price)} UGX</small></div><div class="qty"><button onclick="changeQty(${i},-1)">-</button><input type="number" min="1" value="${c.q}" onchange="setQty(${i},this.value)" aria-label="Quantity" style="width:44px;text-align:center;border:none;background:transparent;font-weight:700;font-size:13px"><button onclick="changeQty(${i},1)">+</button></div><button onclick="removeItem(${i})" style="background:none;border:none;cursor:pointer">🗑️</button></div>`).join(''):'<p style="text-align:center;opacity:.45;margin-top:36px">Your selection is empty<br>Go to products and tap Add to Order</p>';
}
function checkout(){
 if(busy)return;
 const v=id=>$(id).value.trim();
 const name=v('cName'),phone=v('cPhone'),loc=v('cLocation'),notes=v('cNotes'),time=$('cTime').value;
 if(!name||!phone||!loc){alert('Please fill Name, Phone, Location');return;}
 if(!orders.length){alert('Add products first');return;}
 busy=true;setTimeout(()=>busy=false,4000);
 const items=orders.map(c=>({...c}));
 const total=items.reduce((s,c)=>s+num(c.price)*c.q,0);
 const h=ld('arise_order_history',[]);
 h.push({id:Date.now(),name,phone,loc,time,items,total,date:new Date().toLocaleString(),confirmed:false});
 sv('arise_order_history',h);
 const lines=items.map((c,i)=>`${i+1}. ${c.name} - ${c.qty} x ${c.q} (${c.price} UGX)`).join('\n');
 const enc=encodeURIComponent(`*NEW ORDER - ARISE SUPPLIES*\n\n*Customer:*\nName: ${name}\nPhone: ${phone}\nLocation: ${loc}\nDelivery: ${time}\n\n*Products:*\n${lines}\n\nTotal Items: ${items.reduce((s,x)=>s+x.q,0)}\nTotal Amount: ${total.toLocaleString()} UGX\nNotes: ${notes||'None'}`);
 orders=[];updateOrders();
 ['cName','cPhone','cLocation','cNotes'].forEach(id=>$(id).value='');
 if(!navigator.onLine){try{localStorage.setItem('arise_pending_order',enc)}catch(e){}$('offlineMsg').style.display='block';alert('You are offline. Order saved. We will ask to send it when internet returns.');return;}
 window.open(`https://api.whatsapp.com/send?phone=${waNum()}&text=${enc}`,'_blank');
 toggleOrder(false);
}
window.addEventListener('online',()=>{
 let p=null;try{p=localStorage.getItem('arise_pending_order')}catch(e){}
 if(p&&confirm('You have an order saved while offline. Send it now on WhatsApp?')){
  window.open(`https://api.whatsapp.com/send?phone=${waNum()}&text=${p}`,'_blank');
  try{localStorage.removeItem('arise_pending_order')}catch(e){}
  $('offlineMsg').style.display='none';
 }
});

/* ===== chat ===== */
function sendChat(){
 const i=$('chatInput'),t=i.value.trim();if(!t)return;
 const m=$('chatMsgs');
 m.innerHTML+=`<div class="msg user">${esc(t)}</div>`;
 const c=ld('arise_chats',[]);c.push({msg:t,time:new Date().toLocaleString()});sv('arise_chats',c);
 i.value='';
 setTimeout(()=>{m.innerHTML+=`<div class="msg bot">Tap <a href="https://api.whatsapp.com/send?phone=${waNum()}&text=${encodeURIComponent(t)}" target="_blank" rel="noopener"><b>Send on WhatsApp</b></a> to reach our team, or call ${esc(S.settings.waDisplay)}.</div>`;m.scrollTop=m.scrollHeight;},500);
 m.scrollTop=m.scrollHeight;
}

/* ===== admin ===== */
function openAdmin(){$('admin').style.display='grid';}
function closeAdmin(){
 $('admin').style.display='none';$('adminContent').style.display='none';
 $('adminLogin').style.display='block';$('pass').value='';
}
function login(){
 if($('pass').value!==ADMIN_PASS){alert('Wrong password');return;}
 $('adminLogin').style.display='none';$('adminContent').style.display='block';renderAdmin();
}
function changePassword(){
 const np=$('newPass').value.trim(),cp=$('confirmPass').value.trim();
 if(np.length<4){alert('Password must be at least 4 characters');return;}
 if(np!==cp){alert('Passwords do not match');return;}
 try{localStorage.setItem('arise_admin_pass',np)}catch(e){}
 ADMIN_PASS=np;$('newPass').value='';$('confirmPass').value='';alert('Password changed');
}
function showTab(t){
 document.querySelectorAll('.admin-tab').forEach(e=>e.classList.toggle('active',e.dataset.tab===t));
 document.querySelectorAll('.admin-section').forEach(e=>e.classList.toggle('active',e.id==='admin-'+t));
}
function renderAdmin(){renderLoyalty();renderOrderHistory();renderEditors();renderSettings();renderChats();}
function clearData(k){if(confirm('Clear this data?')){try{localStorage.removeItem(k)}catch(e){}renderLoyalty();renderOrderHistory();}}

const FIELDS={
 products:[['name','Name'],['qty','Qty'],['price','Price'],['photo','Photo/video file']],
 inside:[['area','Area'],['fee','Fee'],['time','Time']],
 outside:[['area','Area'],['fee','Fee'],['time','Time']],
 reviews:[['name','Name'],['location','Location'],['product','Product'],['text','Review'],['stars','Stars']]
};
const NEWROW={
 products:{name:'New Product',qty:'1KG',price:'20,000',photo:'',cat:''},
 inside:{area:'New Area',fee:'10,000 UGX',time:'2 hours'},
 outside:{area:'New Area',fee:'30,000 UGX',time:'3 hours'},
 reviews:{name:'New Customer',location:'Kampala',product:'Product',text:'Great service, fresh meat, on time delivery.',stars:5}
};
function renderEditors(){
 [['products','productEditor'],['inside','insideEditor'],['outside','outsideEditor'],['reviews','reviewsEditor']].forEach(([k,id])=>{
  $(id).innerHTML=S[k].map((r,i)=>`<div class="erow">`+FIELDS[k].map(([f,ph])=>`<input value="${esc(r[f])}" placeholder="${ph}" onchange="setF('${k}',${i},'${f}',this.value)">`).join('')+`<button class="btn btn-small btn-red" onclick="delRow('${k}',${i})">X</button></div>`).join('');
 });
}
function setF(k,i,f,v){
 S[k][i][f]=f==='price'?num(v).toLocaleString('en-US'):f==='stars'?stars(v):v;
 persist();renderPublic();
}
function delRow(k,i){if(confirm('Delete this row?')){S[k].splice(i,1);persist();renderEditors();renderPublic();}}
function addRow(k){S[k].push({...NEWROW[k]});persist();renderEditors();renderPublic();}
function renderSettings(){
 const s=S.settings;
 $('settingWA').value=s.wa;$('settingX').value=s.x;$('settingFB').value=s.fb;$('settingIG').value=s.ig;$('settingYT').value=s.yt;
}
function saveSettings(){
 const wa=$('settingWA').value.replace(/\D/g,'');
 if(wa.length<10){alert('Invalid WhatsApp number (use format 256766791805)');return;}
 const s=S.settings;
 s.wa=wa;s.waDisplay=wa.replace(/^256/,'0');
 s.x=$('settingX').value.trim()||DEF.settings.x;s.fb=$('settingFB').value.trim()||DEF.settings.fb;
 s.ig=$('settingIG').value.trim()||DEF.settings.ig;s.yt=$('settingYT').value.trim()||DEF.settings.yt;
 persist();renderSocial();alert('Settings saved');
}
function renderChats(){
 const c=ld('arise_chats',[]);
 $('adminChats').innerHTML=c.length?c.map(x=>`<div class="item"><b>${esc(x.time)}</b><br>${esc(x.msg)}</div>`).join(''):'<p style="opacity:.5;font-size:12px">No chat messages yet</p>';
}

/* ===== orders & loyalty (counted only when admin confirms an order) ===== */
function renderOrderHistory(){
 const h=ld('arise_order_history',[]);
 $('orderHistoryList').innerHTML=h.length?h.slice().reverse().map(o=>`<div class="item"><b>${esc(o.name)}</b> - ${esc(o.phone)} - ${esc(o.date)}<br><small>${esc(o.loc)} - ${esc(o.time)} - Total: ${(o.total||0).toLocaleString()} UGX</small><br><small>${o.items.map(i=>esc(i.name)+' x'+i.q).join(', ')}</small><br>${o.confirmed?'<small style="color:#0F7A3D"><b>✔ Confirmed (counted for loyalty)</b></small>':`<button class="btn btn-small btn-gold" style="margin-top:6px" onclick="confirmOrder(${o.id})">Confirm & count loyalty</button>`}</div>`).join(''):'<p style="opacity:.5;font-size:12px">No orders yet.</p>';
}
function confirmOrder(id){
 const h=ld('arise_order_history',[]),o=h.find(x=>x.id===id);
 if(!o||o.confirmed)return;
 o.confirmed=true;sv('arise_order_history',h);
 const L=ld('arise_loyalty',{}),k=String(o.phone).replace(/\s/g,'');
 const e=L[k]||(L[k]={name:o.name,phone:k,orders:0,total:0,rewards:0});
 e.name=o.name;e.orders++;e.total+=o.total;
 sv('arise_loyalty',L);renderOrderHistory();renderLoyalty();
}
function redeem(k){
 const L=ld('arise_loyalty',{});
 if(L[k]&&confirm('Mark 1KG reward as given and restart the count?')){L[k].orders=0;L[k].total=0;L[k].rewards=(L[k].rewards||0)+1;sv('arise_loyalty',L);renderLoyalty();}
}
function renderLoyalty(){
 const E=Object.values(ld('arise_loyalty',{}));
 $('loyaltyList').innerHTML=E.length?E.sort((a,b)=>b.orders-a.orders).map(c=>{
  const ok=c.orders>=20&&c.total>=500000,p=Math.min(c.orders/20*100,100),col=ok?'#0F7A3D':'#FFB800';
  return `<div class="item" style="border-left:4px solid ${col}"><b>${esc(c.name)}</b> - ${esc(c.phone)}<br><small>Orders: ${c.orders}/20 - Total: ${c.total.toLocaleString()} UGX - Rewards given: ${c.rewards||0}</small><div style="background:#eee;height:8px;border-radius:100px;margin:6px 0"><div style="background:${col};width:${p}%;height:8px;border-radius:100px"></div></div>${ok?`<b style="color:#0F7A3D">🎉 ELIGIBLE FOR 1KG FREE!</b><br><button class="btn btn-small btn-red" data-k="${esc(c.phone)}" onclick="redeem(this.dataset.k)">Reward given</button>`:`<small style="opacity:.6">Needs ${Math.max(0,20-c.orders)} more orders and ${Math.max(0,500000-c.total).toLocaleString()} UGX more</small>`}</div>`;
 }).join(''):'<p style="opacity:.5;font-size:12px">No confirmed orders yet.</p>';
}

function addManualOrder(){
 const name=$('mName').value.trim(),phone=$('mPhone').value.trim(),total=num($('mTotal').value);
 if(!name||!phone||!total){alert('Enter name, phone and order total');return;}
 const h=ld('arise_order_history',[]),id=Date.now();
 h.push({id,name,phone,loc:'WhatsApp',time:'-',items:[{name:'WhatsApp order',q:1}],total,date:new Date().toLocaleString(),confirmed:false});
 sv('arise_order_history',h);confirmOrder(id);
 ['mName','mPhone','mTotal'].forEach(i=>$(i).value='');
}
function exportLive(){
 const txt='window.LIVE='+JSON.stringify({products:S.products,inside:S.inside,outside:S.outside,reviews:S.reviews,settings:S.settings},null,1)+';';
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'text/javascript'}));a.download='live.js';
 document.body.appendChild(a);a.click();a.remove();
}
/* ===== init ===== */
document.querySelectorAll('[data-page]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();showPage(a.dataset.page);}));
$('drawerOrder').addEventListener('click',e=>{e.preventDefault();toggleDrawer(false);toggleOrder(true);});
document.querySelectorAll('.admin-tab').forEach(t=>t.addEventListener('click',()=>showTab(t.dataset.tab)));
$('faqList').addEventListener('click',e=>{
 const b=e.target.closest('.faq b');if(!b)return;
 const f=b.parentElement;f.classList.toggle('open');
 b.querySelector('span').textContent=f.classList.contains('open')?'−':'+';
});
$('chatInput').addEventListener('keydown',e=>{if(e.key==='Enter')sendChat();});
let taps=0;
$('logoTap').addEventListener('click',()=>{taps++;if(taps>=5){openAdmin();taps=0;}setTimeout(()=>taps=0,2000);});
if('serviceWorker' in navigator&&location.protocol.startsWith('http')){navigator.serviceWorker.register('sw.js').catch(()=>{});}
greet();renderPublic();renderRecipes();updateOrders();
