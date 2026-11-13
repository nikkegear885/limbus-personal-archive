/* 5층런용 층별 테마팩 참고 티어 · 개인 평가/추가 팩은 IndexedDB에만 보관 */
(function(){
'use strict';
const SOURCES={
  speed:{label:'검슈 5층런 루트 (2026.06)',url:'https://gall.dcinside.com/mgallery/board/view/?id=limbuscompany&no=495443'},
  shine:{label:'별빛 절약형 5층런 (2026.10)',url:'https://gall.dcinside.com/mgallery/board/view/?id=lobotomycorporation&no=6180885'},
  hard:{label:'하드 5층런 비교 (2026.08)',url:'https://gall.dcinside.com/mgallery/board/view/?id=limbuscompany&no=535050'},
  hole:{label:'5층 구멍런 공략 (2026.10)',url:'https://gall.dcinside.com/mgallery/board/view/?id=limbuscompany&no=572705'},
  tournament:{label:'거던대회 1위 루트 (2026.04)',url:'https://gall.dcinside.com/mgallery/board/view/?id=limbuscompany&no=452649'},
  guide:{label:'15층 공통 팩·덱별 팁 (2025.10)',url:'https://gall.dcinside.com/mgallery/board/view/?id=limbuscompany&no=326861'},
  charge:{label:'충전·출혈 15층 후기 (2026.10)',url:'https://gall.dcinside.com/mgallery/board/view/?id=limbuscompany&no=576923'},
  easy:{label:'노말 5층 탐색팩 사례 (2026.06)',url:'https://gall.dcinside.com/mgallery/board/view/?id=limbuscompany&no=497077'},
  spider:{label:'거미집 5층런 공략 (2026.08)',url:'https://gall.dcinside.com/mgallery/board/view/?id=limbuscompany&no=542601'}
};
// 층, 팩 이름, 기본 평가, 덱 키워드, 추천 이유, 참고 글
const DATA=[
[1,'카지노 푸어','S','공통','5층 고속런에서 자주 쓰는 1층 출발점. 코스트·기프트 보상도 확인.', 'speed'],
[1,'공장 자동화','A','공통','초반 부담이 낮은 대체 출발 팩. 귀신 들린 신발·오더메이드 확인.','guide'],
[1,'잊혀진 자들','A','공통','카지노 푸어가 없을 때 검슈 5층런의 대안.','speed'],
[1,'신앙과 침식','B','공통','분노·색욕 자원을 활용할 수 있을 때 핏빛 갈기 획득 후보.','guide'],
[2,'헬스치킨','S','공통','범용 5층런의 핵심 경유지. 양념장·오염된 실과 바늘 등 보상 확인.','guide'],
[2,'낙화','A','파열,충전,출혈','생강꽃 등 기프트를 노리는 충전·출혈 혼합 빌드 대안.','charge'],
[3,'증오와 절망','S','공통','3~4층 5층런 루트에서 활용. 보스 공략과 필요한 기프트를 확인.','hard'],
[3,'탄환이 찍은 마침표','S','공통','묵시적 계약 갱신·흑염파이프·톱니 파편 등 범용 기프트 경유지.','guide'],
[3,'베어낼 것','A','호흡,파열','검슈 5층런의 쉬운 경로. 호흡·참격 빌드에 적합.','speed'],
[3,'꿰뚫을 것','B','호흡','베어낼 것이 안 나올 때의 대체 팩. 클리어 시간은 늘 수 있음.','speed'],
[3,'낙화','A','파열,충전,출혈','생강꽃·만화경 등 조건부 재료가 필요할 때.','charge'],
[3,'우미다','B','공통','특정 구멍런 빌드에서 활용하는 대안 경로.','hole'],
[4,'증오와 절망','S','공통','고속 5층런에서 4층 경유 팩으로 자주 채택.','speed'],
[4,'2호선','S','공통','굴레·메트로놈 등 보상 목표. 덱 화력과 난이도 조건을 확인.','guide'],
[4,'탄환이 찍은 마침표','A','공통','3층에 다른 팩을 갔을 때 후속 기프트 보충용.','charge'],
[4,'빠져드는 색욕','B','공통','노말에서 선택 가능한 대체 팩 사례.','easy'],
[4,'먹어치운 탐식','B','공통','노말에서 선택 가능한 대체 팩 사례.','easy'],
[5,'2호선','S','공통','검슈 5층런의 대표 마무리 팩. 하드 전환·해금 여부 확인.','shine'],
[5,'1호선','S','공통','거짓 광배·뱀 허물 등 범용 기프트 확보를 노리는 마무리 후보.','guide'],
[5,'육참골단','A','호흡,출혈,공통','참격·호흡 편성에서 전용 기프트가 필요할 때.','guide'],
[5,'빠져드는 색욕','A','공통','노말 5층런의 접근하기 쉬운 대체 경로.','easy'],
[5,'먹어치운 탐식','A','공통','노말 5층런의 접근하기 쉬운 대체 경로.','easy'],
[5,'워프특급 살인사건 복각','A','파열,충전','파열·충전 빌드의 기프트 확보용. 등장·해금 시 사용.','guide'],
[5,'LCB 정기검진','A','파열,화상','파열 또는 화상 기프트가 필요한 경우에 우선 고려.','guide'],
[5,'바라볼 수밖에 없는','A','파열,호흡','파열 관련 전용 기프트를 노리는 선택.','guide'],
[5,'20번구의 기적 복각','B','공통','봉제인형·선물 보따리 등 기프트 조합 경유지.','guide'],
[5,'시살시 복각','B','진동,공통','시간 관련 기프트가 필요할 때 선택하는 후반 팩.','guide'],
[5,'5호선','B','공통','깨어질 화포 등 대체 기프트 확보용.','guide'],
[5,'변하지 않는','B','공통','깨진 안경을 노리는 대체 팩. 보상 우선순위 확인.','guide'],
[5,'탐식의 재림','B','충전,출혈','충출 계열 15층 장기 루트에서 선택한 사례.','charge']
].map(([floor,name,tier,tags,note,source])=>({
 floor,name,tier,tags:tags.split(','),note,source,id:floor+'|'+name
}));
const TIERS=['S','A','B','C'];
const TIER_LABEL={S:'우선 추천',A:'좋은 대안',B:'조건부 선택',C:'비추천·보류'};
let prefs={ratings:{},extra:[]};
let activeFloor=1;
let activeTag='전체';
let activeTier='전체';
let query='';
const el=id=>document.getElementById(id);
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[c]));
function normalize(x){
 const ratings={}; const extra=[];
 if(x&&typeof x==='object'&&!Array.isArray(x)){
  if(x.ratings&&typeof x.ratings==='object'&&!Array.isArray(x.ratings)){
   for(const [k,v] of Object.entries(x.ratings)){if(k.length<=180&&TIERS.includes(v))ratings[k]=v;}
  }
  if(Array.isArray(x.extra)){
   const seen=new Set();
   for(const value of x.extra.slice(0,120)){
    if(!value||typeof value!=='object')continue;
    const id=String(value.id||'').slice(0,100),name=String(value.name||'').trim().slice(0,65),floor=Number(value.floor),tier=value.tier;
    if(!id||seen.has(id)||!name||!Number.isInteger(floor)||floor<1||floor>5||!TIERS.includes(tier))continue;
    seen.add(id);
    extra.push({id,name,floor,tier,tags:['공통'],note:String(value.note||'').slice(0,220),source:null,custom:true});
   }
  }
 }
 return {ratings,extra};
}
const rating=item=>prefs.ratings[item.id]||item.tier;
function allEntries(){
 return [...DATA,...prefs.extra];
}
function matches(item){
 return item.floor===activeFloor&&
  (activeTag==='전체'||item.tags.includes('공통')||item.tags.includes(activeTag))&&
  (activeTier==='전체'||rating(item)===activeTier)&&
  (!query||[item.name,item.note,item.tags.join(' ')].join(' ').toLocaleLowerCase('ko').includes(query));
}
function sourceHTML(item){
 const src=SOURCES[item.source];
 return src?'<a class="pack-tier-source" href="'+escapeHTML(src.url)+'" target="_blank" rel="noopener noreferrer">참고 공략 ↗</a>':'<span class="pack-tier-custom-label">내가 추가한 팩</span>';
}
function packCard(item){
 const current=rating(item);
 return '<article class="pack-tier-card'+(item.custom?' user-pack':'')+'">'+
  '<div class="pack-tier-card-top"><div class="pack-tier-name">'+escapeHTML(item.name)+'</div><span class="pack-tier-token '+current.toLowerCase()+'">'+current+'</span></div>'+
  '<p>'+escapeHTML(item.note||'내가 추가한 테마팩')+'</p>'+
  '<div class="pack-tier-card-bottom">'+sourceHTML(item)+
  '<select data-pack-rating="'+encodeURIComponent(item.id)+'" aria-label="'+escapeHTML(item.name)+' 개인 티어">'+
  '<option value=""'+(!prefs.ratings[item.id]?' selected':'')+'>기본 '+item.tier+'</option>'+
  TIERS.map(t=>'<option value="'+t+'"'+(prefs.ratings[item.id]===t?' selected':'')+'>내 평가 '+t+'</option>').join('')+
  '</select>'+(item.custom?'<button type="button" class="btn small quiet" data-pack-remove="'+encodeURIComponent(item.id)+'">삭제</button>':'')+
  '</div></article>';
}
function render(){
 const floorBox=el('packTierFloors'),board=el('packTierBoard');
 if(!board||!floorBox)return;
 floorBox.innerHTML=[1,2,3,4,5].map(f=>'<button type="button" class="pack-tier-floor'+(activeFloor===f?' active':'')+'" data-pack-floor="'+f+'" aria-pressed="'+(activeFloor===f)+'">'+f+'층</button>').join('');
 if(el('packTierTag'))el('packTierTag').value=activeTag;
 if(el('packTierRank'))el('packTierRank').value=activeTier;
 const visible=allEntries().filter(matches).sort((a,b)=>TIERS.indexOf(rating(a))-TIERS.indexOf(rating(b))||a.name.localeCompare(b.name,'ko'));
 el('packTierCount').textContent=visible.length+'개';
 board.innerHTML=visible.length?TIERS.map(t=>{
  const list=visible.filter(p=>rating(p)===t);
  if(!list.length)return '';
  return '<section class="pack-tier-row"><div class="pack-tier-row-head"><span class="pack-tier-token '+t.toLowerCase()+'">'+t+'</span><strong>'+TIER_LABEL[t]+'</strong><small>'+list.length+'개</small></div><div class="pack-tier-grid">'+list.map(packCard).join('')+'</div></section>';
 }).join(''):'<div class="gift-empty">조건에 맞는 테마팩이 없습니다. 덱 필터를 변경하거나 팩을 직접 추가할 수 있습니다.</div>';
}
async function store(){
 await action('meta','put',{id:'packTierPrefsV1',values:{ratings:prefs.ratings,extra:prefs.extra}});
}
function wire(){
 const floorBox=el('packTierFloors'),board=el('packTierBoard');
 if(!floorBox||!board)return;
 floorBox.addEventListener('click',e=>{
  const button=e.target.closest('button[data-pack-floor]');
  if(!button)return;
  activeFloor=Number(button.dataset.packFloor);render();
 });
 board.addEventListener('change',async e=>{
  const select=e.target.closest('select[data-pack-rating]');
  if(!select)return;
  const id=decodeURIComponent(select.dataset.packRating);
  if(select.value)prefs.ratings[id]=select.value;
  else delete prefs.ratings[id];
  try{await store();render()}catch(err){alert('팩 티어 저장 실패: '+err.message);}
 });
 board.addEventListener('click',async e=>{
  const button=e.target.closest('button[data-pack-remove]');
  if(!button||!confirm('내가 추가한 팩을 삭제할까요?'))return;
  const id=decodeURIComponent(button.dataset.packRemove);
  prefs.extra=prefs.extra.filter(p=>p.id!==id);delete prefs.ratings[id];
  try{await store();render()}catch(err){alert('팩 삭제 저장 실패: '+err.message);}
 });
 el('packTierTag').addEventListener('change',e=>{activeTag=e.target.value;render()});
 el('packTierRank').addEventListener('change',e=>{activeTier=e.target.value;render()});
 el('packTierSearch').addEventListener('input',e=>{query=e.target.value.trim().toLocaleLowerCase('ko');render()});
 el('packTierReset').addEventListener('click',()=>{
  activeTag='전체';activeTier='전체';query='';
  el('packTierSearch').value='';render();
 });
 const add=async()=>{
  const input=el('packTierAddName'),name=input.value.trim();
  if(!name){input.focus();return}
  if(name.length>65){alert('팩 이름은 65자까지 입력할 수 있습니다.');return}
  if(allEntries().some(p=>p.floor===activeFloor&&p.name===name)){alert('이 층에 이미 등록된 팩입니다.');return}
  if(prefs.extra.length>=120){alert('직접 추가한 팩은 최대 120개입니다.');return}
  const id='user|'+Date.now().toString(36)+'|'+Math.random().toString(36).slice(2,8);
  prefs.extra.push({id,name,floor:activeFloor,tier:el('packTierAddRank').value,tags:['공통'],note:'',source:null,custom:true});
  activeTag='전체';activeTier='전체';query='';el('packTierSearch').value='';
  try{await store();input.value='';render()}catch(err){alert('팩 추가 저장 실패: '+err.message)}
 };
 el('packTierAdd').addEventListener('click',add);
 el('packTierAddName').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();add()}});
 render();
}
window.LIMBUS_PACK_TIERS={
 load:x=>{prefs=normalize(x);render()},
 render,wire,
 backup:()=>JSON.parse(JSON.stringify({ratings:prefs.ratings,extra:prefs.extra})),
 restore:async x=>{prefs=normalize(x);await store();render()},
 stats:()=>({builtIn:DATA.length,custom:prefs.extra.length})
};
})();
