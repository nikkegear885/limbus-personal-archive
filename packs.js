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
  spider:{label:'거미집 5층런 공략 (2026.08)',url:'https://gall.dcinside.com/mgallery/board/view/?id=limbuscompany&no=542601'},
  atlas:{label:'거던 네비 테마팩 도감 · 등장 층',url:'https://md-navi.com/theme-packs'}
};
// 층, 팩 이름, 기본 평가, 덱 키워드, 추천 이유, 참고 글
// 팩명 / 노말 등장 층 / 하드 등장 층 / 노말 티어 / 하드 티어 / 덱 / 참고 설명 / 출처.
// 등장 층은 거던 네비의 2026-11 테마팩 도감과 대조. 티어는 5층런 기준 비공식 추천도.
const CATALOG=[
['카지노 푸어','1,2','1','S,B','S','공통','초반 코스트·기프트를 확보하는 빠른 루트. 전투 구성도 확인.','speed'],
['공장 자동화','1,2','1,2','A,B','A,B','공통','귀신 들린 신발 등 초반 기프트 후보.','guide'],
['잊혀진 자들','1','1','A','A','공통','카지노 푸어가 없을 때 선택할 만한 1층 대안.','speed'],
['못과 망치','1','1','B','B','공통','초반 기프트 보상과 덱 상성을 확인하고 선택.','atlas'],
['신앙과 침식','1,2','1','B,B','B','출혈,공통','덱과 맞는 기프트 보상이 나왔을 때 선택.','guide'],
['둥지, 공방, 기술','1,2','1','B,B','B','공통','초반 일반 전투와 상점 경로가 무난한 선택지.','atlas'],
['사랑할 수 없는','1,2','1,2','B,B','B,B','공통','기프트 보상이 덱과 잘 맞을 때 선택.','atlas'],
['속하지 못하는','1','1','B','B','공통','해금 및 보상 상황에 따라 고려할 대체 출발 팩.','atlas'],
['베어낼 것','2,3','1,2','A,A','B,A','호흡,파열','참격·호흡 중심 빌드에서 활용하는 경로.','speed'],
['꿰뚫을 것','2,3','1,2','B,B','B,B','호흡,공통','기본 선택지가 없을 때 무난한 대안.','speed'],
['레이크 월드','2','1','A','B','공통','2층 보상과 전투 구성을 보고 선택.','atlas'],
['바스라질 것','2,3','1,2','B,B','B,B','공통','일반 기프트 파밍 보조용.','atlas'],
['우.미.다','2','2,3','A','B,B','공통','구멍런 등 일부 빠른 클리어 빌드에서 사용.','hole'],
['헬스 치킨','2','2','S','S','공통','기프트 파밍 핵심 경유지. 양념장·실과 바늘 관련 보상을 확인.','guide'],
['감정에 복종한 것','3','2','A','A','공통','3층 보상과 전투 동선을 고려하는 대체 팩.','atlas'],
['감정에 홀리는 것','3','2','B','B','공통','보상 기프트가 맞을 때 선택.','atlas'],
['감정으로 평가된 것','3','2','B','B','공통','다른 우선 팩이 없을 때 보상 비교 후 선택.','atlas'],
['낙화','3','2,3','A','A,A','파열,충전,출혈','생강꽃 등 키워드용 기프트 후보.','charge'],
['마주하지 않는','3','2,3','B','B,B','공통','유리한 이벤트 보상이 있을 때 선택.','atlas'],
['저택의 부산물','3','1','B','B','공통','편성에 맞는 기프트를 확인한 뒤 선택.','atlas'],
['증오와 절망','3,4','3,4','S,S','S,A','공통','보스 위주 단축 루트로 자주 채택.','speed'],
['오픈런','3,4','3,4','B,B','B,B','공통','기프트·전투 경로가 유리하면 선택.','atlas'],
['탄환이 찍은 마침표','4','3,4','S','S,A','호흡,출혈,공통','흑염 파이프·톱니 파편 등 필요 기프트 확인.','guide'],
['빠져드는 색욕','4,5','3,4','A,A','B,B','공통','기본 보상이 좋을 때 고르는 범용 대안.','easy'],
['먹어치운 탐식','4,5','3,4','A,A','B,B','파열,공통','키워드 기프트를 보충하는 노말 대안.','easy'],
['육참골단','4,5','3,4','A,A','A,B','호흡,출혈','참격·호흡 편성에서 전용 기프트를 노리는 팩.','guide'],
['20번구의 기적','4','3,4','B','A,B','공통','봉제인형·선물 보따리 계열 보상 확인.','guide'],
['기어오는 심연','4,5','3,4','B,B','B,B','공통','대체 키워드 기프트 경유지.','atlas'],
['어느 세계','4,5','3,4','B,B','B,B','공통','핵심 팩이 없을 때 경로와 보상을 비교.','atlas'],
['초라한 질투','4,5','3,4','B,B','B,B','공통','키워드 보상과 덱 상성을 보고 선택.','atlas'],
['전락하는 우울','4,5','3,4','B,B','B,B','침잠','침잠 덱이라면 우선도를 높일 수 있는 대안.','atlas'],
['호박색 어스름의 시련','4,5','4,5','B,B','B,B','공통','범용 대체 팩. 전투 길이 확인.','atlas'],
['워프특급 살인사건','4,5','4,5','B,A','B,A','파열,충전','파열·충전 기프트를 노릴 때 활용.','guide'],
['시간살인시간','4,5','4,5','B,B','B,B','진동,공통','시간 관련 기프트와 키워드 구성을 보고 선택.','guide'],
['LCB 정기검진','5','4,5','S','A,A','파열,화상','전용 기프트 파밍을 위한 후반 후보.','guide'],
['심야청소','5','4,5','A','A,A','출혈,공통','찰랑이는 연료통 등 후반 기프트 확보용.','guide'],
['꿰고 뚫는 이들','5','4','S','A','파열,공통','노말 5층의 빠른 마무리 후보.','atlas'],
['가르고 베는 이들','5','4','A','A','호흡,공통','참격 위주 편성의 노말 5층 대안.','atlas'],
['부수고 깨뜨릴 이들','5','4','A','B','진동,공통','노말 5층의 보상·경로 비교용.','atlas'],
['경험기억','5','5','B','B','공통','5층 보상이 편성에 맞을 때 고려.','atlas'],
['절차탁춘','5','5','B','B','공통','마지막 층 경로와 기프트에 따라 선택.','atlas'],
['타래 엮기','5','5','B','B','공통','마지막 층 기프트 선택지에 따라 고려.','atlas'],
['새벽 뒤 꿰뚫어 오는 쐐기','5','5','B','B','공통','5층 한정 등장 팩. 덱 상성 확인.','atlas'],
['2호선','','4,5','','S,S','공통','메트로놈·굴레 등 보상과 보스 전투를 확인.','guide'],
['1호선','','5','','S','침잠,공통','거짓 광배·뱀 허물 등을 노리는 하드 5층 마무리.','guide'],
['3호선','','5','','A','공통','키워드 구성·보스와 보상에 따른 후반 대안.','atlas'],
['4호선 - 제 3구간','','5','','S','파열,공통','파열 5층런에서 활용되는 철도 마무리 팩.','speed'],
['4호선 - 제 4구간','','5','','A','공통','5층 보스와 파티 딜링을 보고 선택.','atlas'],
['5호선','','5','','B','호흡,공통','애달픈 날숨 등 후반 기프트 확인.','guide'],
['바라볼 수밖에 없는','','5','','A','파열,호흡','파열 관련 기프트를 노리는 하드 마무리.','guide'],
['변하지 않는','','4,5','','B,B','공통','깨진 안경 등이 필요할 때 선택.','guide'],
['탐식의 재림','','4,5','','B,B','충전,출혈','충전·출혈 혼합 빌드의 조건부 선택.','charge'],
['순환호흡','','4,5','','A,A','호흡','호흡 전용 기프트가 필요한 경우 가치 상승.','atlas'],
['시산혈해','','4,5','','A,B','출혈','출혈 덱의 기프트 확보용 후반 선택지.','atlas'],
['20번구의 기적 BokGak','','4,5','','B,B','공통','복각 전용 보상과 봉제인형 구성을 확인.','guide'],
['워프특급 살인사건 BokGak','','4,5','','A,A','파열,충전','파열·충전 기프트 확보 목적의 복각 팩.','guide'],
['시간살인시간 BokGak','','4,5','','B,B','진동,공통','시간 관련 기프트를 노리는 복각 루트.','guide'],
['육참골단 BokGak','','4,5','','A,A','호흡,출혈','참격·호흡 기프트 조합을 노리는 복각 팩.','guide'],
['파죽지세','','4,5','','B,B','파열','파열 중심 편성에서 비교할 대안.','atlas'],
['침잠쇄도','','4,5','','A,A','침잠','침잠 편성의 후반 후보.','atlas'],
['악으로 규정되는','','4,5','','B,B','공통','전용 기프트 목표가 있을 때 선택.','atlas'],
['보존의 신념','','4,5','','B,B','공통','기프트 보상과 전투 난도를 보고 선택.','atlas'],
['가라앉은 우울','','5','','A','침잠','침잠 덱 후반 기프트 확보용.','atlas'],
['교본','','5','','B','공통','5층 한정 후보. 경로와 보상 확인.','atlas'],
['꿈이 끝나는','','5','','B','공통','5층 한정 후보. 경로와 보상 확인.','atlas']
];
const DATA=CATALOG.flatMap(([name,nFloors,hFloors,nRanks,hRanks,tags,note,source])=>{
 const result=[];
 for(const [difficulty,floors,ranks] of [['normal',nFloors,nRanks],['hard',hFloors,hRanks]]){
  if(!floors)continue;
  const ids=floors.split(','), tiers=ranks.split(',');
  if(ids.length!==tiers.length)throw Error('팩 층·티어 데이터 개수 불일치: '+name+' '+difficulty);
  ids.forEach((value,i)=>{const floor=Number(value);if(!Number.isInteger(floor)||floor<1||floor>5||!['S','A','B','C'].includes(tiers[i]))throw Error('팩 티어 데이터 오류: '+name);result.push({floor,name,tier:tiers[i],tags:tags.split(','),note,source,id:floor+'|'+name,difficulty})});
 }
 return result;
});
const MODES={
 normal:{label:'노말',description:'1~5층 모두 노말 · 노말 팩만 표시'},
 hybrid:{label:'노말 → 하드 5층',description:'1~4층 노말 · 5층 하드로 전환'},
 hard:{label:'하드',description:'1~5층 모두 하드 · 하드 팩만 표시'}
};
const floorDifficulty=(mode,floor)=>mode==='hard'||(mode==='hybrid'&&floor===5)?'hard':'normal';
const TIERS=['S','A','B','C'];
const TIER_LABEL={S:'우선 추천',A:'좋은 대안',B:'조건부 선택',C:'비추천·보류'};
let prefs={ratings:{},extra:[]};
let activeFloor=1;
let activeMode='normal';
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
    extra.push({id,name,floor,tier,mode:MODES[value.mode]?value.mode:'all',tags:['공통'],note:String(value.note||'').slice(0,220),source:null,custom:true});
   }
  }
 }
 return {ratings,extra};
}
const ratingKey=item=>activeMode+'|'+item.id;
const customRating=item=>prefs.ratings[ratingKey(item)]||null;
const rating=item=>customRating(item)||prefs.ratings[item.id]||item.tier;
function allEntries(){return [...DATA,...prefs.extra];}
function matches(item){
 return item.floor===activeFloor&&
  (item.custom?(item.mode==='all'||item.mode===activeMode):item.difficulty===floorDifficulty(activeMode,item.floor))&&
  (activeTag==='전체'||item.tags.includes('공통')||item.tags.includes(activeTag))&&
  (activeTier==='전체'||rating(item)===activeTier)&&
  (!query||[item.name,item.note,item.tags.join(' ')].join(' ').toLocaleLowerCase('ko').includes(query));
}
function sourceHTML(item){
 const src=SOURCES[item.source];
 return src?'<a class="pack-tier-source" href="'+escapeHTML(src.url)+'" target="_blank" rel="noopener noreferrer">참고 공략 ↗</a>':'<span class="pack-tier-custom-label">내가 추가한 팩</span>';
}
function packCard(item){
 const current=rating(item), mine=customRating(item), inherited=!mine&&prefs.ratings[item.id];
 return '<article class="pack-tier-card'+(item.custom?' user-pack':'')+'">'+
  '<div class="pack-tier-card-top"><div class="pack-tier-name">'+escapeHTML(item.name)+'</div><span class="pack-tier-token '+current.toLowerCase()+'">'+current+'</span></div>'+
  '<p>'+escapeHTML(item.note||'내가 추가한 테마팩')+'</p>'+
  '<div class="pack-tier-card-bottom">'+sourceHTML(item)+
  '<select data-pack-rating="'+encodeURIComponent(item.id)+'" aria-label="'+escapeHTML(item.name)+' 개인 티어">'+
  '<option value=""'+(!mine?' selected':'')+'>'+(inherited?'기존 평가 '+prefs.ratings[item.id]:'기본 '+item.tier)+'</option>'+
  TIERS.map(t=>'<option value="'+t+'"'+(mine===t?' selected':'')+'>내 평가 '+t+'</option>').join('')+
  '</select>'+(item.custom?'<button type="button" class="btn small quiet" data-pack-remove="'+encodeURIComponent(item.id)+'">삭제</button>':'')+
  '</div></article>';
}
function render(){
 const floorBox=el('packTierFloors'),modeBox=el('packTierModes'),board=el('packTierBoard');
 if(!board||!floorBox||!modeBox)return;
 modeBox.innerHTML=Object.entries(MODES).map(([id,m])=>'<button type="button" class="pack-tier-mode'+(activeMode===id?' active':'')+'" data-pack-mode="'+id+'" aria-pressed="'+(activeMode===id)+'">'+escapeHTML(m.label)+'</button>').join('');
 floorBox.innerHTML=[1,2,3,4,5].map(f=>'<button type="button" class="pack-tier-floor'+(activeFloor===f?' active':'')+'" data-pack-floor="'+f+'" aria-pressed="'+(activeFloor===f)+'">'+f+'층 <small>'+(floorDifficulty(activeMode,f)==='hard'?'하드':'노말')+'</small></button>').join('');
 if(el('packTierRoute'))el('packTierRoute').textContent=MODES[activeMode].description;
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
 const floorBox=el('packTierFloors'),modeBox=el('packTierModes'),board=el('packTierBoard');
 if(!floorBox||!modeBox||!board)return;
 modeBox.addEventListener('click',e=>{
  const button=e.target.closest('button[data-pack-mode]');
  if(!button||!MODES[button.dataset.packMode])return;
  activeMode=button.dataset.packMode;render();
 });
 floorBox.addEventListener('click',e=>{
  const button=e.target.closest('button[data-pack-floor]');
  if(!button)return;
  activeFloor=Number(button.dataset.packFloor);render();
 });
 board.addEventListener('change',async e=>{
  const select=e.target.closest('select[data-pack-rating]');
  if(!select)return;
  const id=decodeURIComponent(select.dataset.packRating);
  const key=activeMode+'|'+id;
  if(select.value)prefs.ratings[key]=select.value;
  else delete prefs.ratings[key];
  try{await store();render()}catch(err){alert('팩 티어 저장 실패: '+err.message);}
 });
 board.addEventListener('click',async e=>{
  const button=e.target.closest('button[data-pack-remove]');
  if(!button||!confirm('내가 추가한 팩을 삭제할까요?'))return;
  const id=decodeURIComponent(button.dataset.packRemove);
  prefs.extra=prefs.extra.filter(p=>p.id!==id);for(const mode of Object.keys(MODES))delete prefs.ratings[mode+'|'+id];delete prefs.ratings[id];
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
  if(allEntries().some(p=>p.floor===activeFloor&&p.name===name&&(p.custom?(p.mode==='all'||p.mode===activeMode):p.difficulty===floorDifficulty(activeMode,activeFloor)))){alert('이 층에 이미 등록된 팩입니다.');return}
  if(prefs.extra.length>=120){alert('직접 추가한 팩은 최대 120개입니다.');return}
  const id='user|'+Date.now().toString(36)+'|'+Math.random().toString(36).slice(2,8);
  prefs.extra.push({id,name,floor:activeFloor,mode:activeMode,tier:el('packTierAddRank').value,tags:['공통'],note:'',source:null,custom:true});
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
