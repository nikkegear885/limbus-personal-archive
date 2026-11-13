/* 개인 보유 도감: 인격/E.G.O 사진 체크 */
'use strict';
let collectionKind='identity', collectionOwnerFilter='all', collectionSinnerFilter='all', collectionOrder='sinner';
const collectionRows=()=>window.LIMBUS_COLLECTION_CATALOG?.rows||[];
const collectionSinners=()=>window.LIMBUS_COLLECTION_CATALOG?.sinners||[];
const collectionOwned=row=>!!row.base||!!state.collectionOwned?.[row.id];
function collectionStats(){
 const rows=collectionRows(),ids=rows.filter(x=>x.kind==='identity'),egos=rows.filter(x=>x.kind==='ego');
 $('collectionIdCount').textContent=ids.filter(collectionOwned).length+' / '+ids.length;
 $('collectionEgoCount').textContent=egos.filter(collectionOwned).length+' / '+egos.length;
 const sinner=collectionSinners().find(s=>s.id===collectionSinnerFilter);
 $('collectionStatus').textContent=(sinner?sinner.name+' · ':'전체 · ')+(collectionKind==='identity'?'인격':'E.G.O')+' 보유 '+rows.filter(x=>x.kind===collectionKind&&(collectionSinnerFilter==='all'||x.sinner===collectionSinnerFilter)&&collectionOwned(x)).length+'개';
}
// 외부 raw GitHub 접근 실패 시 동일 저장소의 동일 이미지 파일을 CDN에서 재시도.
function collectionImageMirror(src){
 try{
  const url=new URL(src);
  if(url.hostname!=='raw.githubusercontent.com')return '';
  const parts=url.pathname.split('/').filter(Boolean);
  if(parts.length<4)return '';
  const [owner,repo,branch,...path]=parts;
  if(!/^[A-Za-z0-9_.-]+$/.test(owner)||!/^[A-Za-z0-9_.-]+$/.test(repo)||!/^[A-Za-z0-9_.-]+$/.test(branch))return '';
  return 'https://cdn.jsdelivr.net/gh/'+owner+'/'+repo+'@'+branch+'/'+path.join('/');
 }catch{return ''}
}
function renderCollection(){
 const grid=$('collectionGrid');if(!grid)return;
 const list=collectionRows();collectionStats();
 const q=$('collectionSearch').value.trim().toLocaleLowerCase('ko'),rank=$('collectionRarity').value;
 const sl=collectionSinners(),order=new Map(sl.map((s,i)=>[s.id,i]));
 const matches=list.map((row,i)=>({...row,seq:i})).filter(row=>row.kind===collectionKind&&(collectionSinnerFilter==='all'||row.sinner===collectionSinnerFilter)&&(collectionOwnerFilter==='all'||collectionOwned(row)===(collectionOwnerFilter==='owned'))&&(!rank||String(row.rarity)===rank)&&(!q||(row.name+' '+(sl.find(s=>s.id===row.sinner)?.name||'')).toLocaleLowerCase('ko').includes(q)));
 matches.sort((a,b)=>collectionOrder==='name'?a.name.localeCompare(b.name,'ko'):(order.get(a.sinner)-order.get(b.sinner))||(b.seq-a.seq));
 $('collectionVisible').textContent=matches.length+'개 표시';
 grid.innerHTML=matches.length?matches.map(row=>{
  const owned=collectionOwned(row),sinner=sl.find(s=>s.id===row.sinner)?.name||'';
  const fallback='<span class="collection-no-image"'+(row.image?' style="display:none"':'')+'>이미지 미등록</span>';
  // 가로형 게임 원화를 쓰는 인격만 개별 포커스에 맞춰 자릅니다.
  const portraitStyle=row.kind==='identity'&&/^[0-9]{1,3}% center$/.test(row.imagePosition||'')?' style="object-position:'+esc(row.imagePosition)+'"':'';
  const pic=row.image?'<img src="'+esc(row.image)+'" data-collection-backup="'+esc(collectionImageMirror(row.image))+'" loading="lazy" decoding="async"'+portraitStyle+' alt="'+esc(sinner+' '+row.name)+'">'+fallback:fallback;
  const attributes=' data-collection-id="'+esc(row.id)+'"'+(row.base?' disabled title="기본 지급 항목"':'')+' aria-pressed="'+owned+'" aria-label="'+esc(sinner+' '+row.name+' · '+(owned?'보유':'미보유'))+'"';
  if(row.kind==='identity'){
   return '<button type="button" class="collection-card identity-card rarity-'+row.rarity+(owned?' owned':'')+'"'+attributes+'><span class="collection-image">'+pic+'<span class="collection-card-grade">'+esc('★'.repeat(row.rarity))+'</span><span class="collection-owned-mark">'+(owned?'O':'')+'</span><span class="collection-name-overlay">'+esc(row.name)+'</span></span></button>';
  }
  return '<button type="button" class="collection-card ego-card ego-rank-'+esc(String(row.rarity).toLowerCase())+(owned?' owned':'')+'"'+attributes+'><span class="collection-ego-wrap"><span class="collection-image collection-ego-circle">'+pic+'<span class="collection-owned-mark">'+(owned?'O':'')+'</span></span></span><span class="collection-ego-name">'+esc(row.name)+'</span><span class="collection-ego-meta">'+esc(row.rarity)+' · '+esc(sinner)+'</span></button>';
 }).join(''):'<div class="collection-empty">조건에 맞는 항목이 없습니다. 필터를 초기화해 보세요.</div>';
 document.querySelectorAll('[data-collection-kind]').forEach(b=>b.classList.toggle('selected',b.dataset.collectionKind===collectionKind));
 document.querySelectorAll('[data-collection-owner]').forEach(b=>b.classList.toggle('selected',b.dataset.collectionOwner===collectionOwnerFilter));
 document.querySelectorAll('[data-collection-sinner]').forEach(b=>b.classList.toggle('selected',b.dataset.collectionSinner===collectionSinnerFilter));
}
async function collectionSave(){await action('meta','put',{id:'collectionOwnedV1',values:state.collectionOwned||{}})}
function wireCollection(){
 const sinners=collectionSinners();
 $('collectionSinnerTabs').innerHTML='<button class="collection-filter selected" data-collection-sinner="all">전체</button>'+sinners.map(s=>'<button class="collection-filter" data-collection-sinner="'+esc(s.id)+'">'+esc(s.name)+'</button>').join('');
 $('collectionSinnerTabs').addEventListener('click',e=>{const b=e.target.closest('button[data-collection-sinner]');if(!b)return;collectionSinnerFilter=b.dataset.collectionSinner;renderCollection()});
 $('collectionMode').addEventListener('click',e=>{const b=e.target.closest('button[data-collection-kind]');if(!b)return;collectionKind=b.dataset.collectionKind;$('collectionRarity').innerHTML=collectionKind==='identity'?'<option value="">전체 등급</option><option value="3">3성</option><option value="2">2성</option><option value="1">1성</option>':'<option value="">전체 등급</option><option>ZAYIN</option><option>TETH</option><option>HE</option><option>WAW</option><option>ALEPH</option>';$('collectionRarity').value='';renderCollection()});
 $('collectionOwnershipFilters').addEventListener('click',e=>{const b=e.target.closest('button[data-collection-owner]');if(!b)return;collectionOwnerFilter=b.dataset.collectionOwner;renderCollection()});
 $('collectionSearch').addEventListener('input',renderCollection);
 $('collectionRarity').addEventListener('change',renderCollection);
 $('collectionSort').addEventListener('change',e=>{collectionOrder=e.target.value;renderCollection()});
 // 캡처 단계에서 이미지 실패를 처리하여 검증된 동일 파일 미러로 우선 재시도합니다.
 $('collectionGrid').addEventListener('error',e=>{
  const img=e.target;
  if(!(img instanceof HTMLImageElement))return;
  const backup=img.dataset.collectionBackup;
  if(backup&&!img.dataset.collectionRetried){
   img.dataset.collectionRetried='1';
   img.src=backup;
   return;
  }
  img.style.display='none';
  const placeholder=img.nextElementSibling;
  if(placeholder?.classList.contains('collection-no-image')){
   placeholder.style.display='grid';
   placeholder.textContent='이미지 연결 실패';
  }
 },true);
 $('collectionGrid').addEventListener('click',async e=>{
  const b=e.target.closest('button[data-collection-id]');if(!b||b.disabled)return;
  const id=b.dataset.collectionId,row=collectionRows().find(r=>r.id===id);if(!row)return;
  state.collectionOwned={...(state.collectionOwned||{})};if(collectionOwned(row))delete state.collectionOwned[id];else state.collectionOwned[id]=true;
  renderCollection();
  try{await collectionSave()}catch(err){console.error(err);toast('보유 상태 저장 실패: 다시 확인해 주세요')}
 });
 $('collectionClearFilters').addEventListener('click',()=>{collectionSinnerFilter='all';collectionOwnerFilter='all';collectionOrder='sinner';$('collectionSearch').value='';$('collectionRarity').value='';$('collectionSort').value='sinner';renderCollection()});
 $('collectionCopy').addEventListener('click',async()=>{
  const rows=collectionRows().filter(r=>collectionOwned(r)&&!r.base),sinners=collectionSinners();
  const txt='림버스 컴퍼니 보유 목록\n인격 '+collectionRows().filter(r=>r.kind==='identity'&&collectionOwned(r)).length+' / 195 · E.G.O '+collectionRows().filter(r=>r.kind==='ego'&&collectionOwned(r)).length+' / 117\n\n'+sinners.map(s=>s.name+'\n'+rows.filter(r=>r.sinner===s.id).map(r=>'- ['+(r.kind==='identity'?'인격':'E.G.O')+'] '+r.name).join('\n')).join('\n\n');
  try{await navigator.clipboard.writeText(txt);toast('보유 목록을 복사했어요')}catch{toast('클립보드 복사 권한을 확인해 주세요')}
 });
}