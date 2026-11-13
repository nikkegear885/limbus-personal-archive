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
  const fallback='<span class="collection-no-image">이미지 미등록</span>';
  const pic=row.image?'<img src="'+esc(row.image)+'" loading="lazy" decoding="async" alt="'+esc(sinner+' '+row.name)+'" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'grid\'">'+fallback:fallback;
  return '<button type="button" class="collection-card '+(owned?'owned':'')+'" data-collection-id="'+esc(row.id)+'" '+(row.base?'disabled title="기본 지급 항목"':'')+' aria-pressed="'+owned+'"><span class="collection-image">'+pic+'<span class="collection-owned-mark">'+(owned?'✓':'')+'</span></span><span class="collection-text"><span class="collection-rank">'+esc(row.kind==='identity'?'★'.repeat(row.rarity):row.rarity)+' · '+esc(sinner)+'</span><span class="collection-name">'+esc(row.name)+'</span><span class="collection-ownership">'+(row.base?'기본 지급':owned?'✓ 보유':'＋ 미보유')+'</span></span></button>';
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