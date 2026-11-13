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
function collectionSinnerCounts(){
 const counts=new Map([['all',{identity:[0,0],ego:[0,0]}],...collectionSinners().map(s=>[s.id,{identity:[0,0],ego:[0,0]}])]);
 for(const row of collectionRows()){
  if(row.kind!=='identity'&&row.kind!=='ego')continue;
  const owned=collectionOwned(row);
  const global=counts.get('all')[row.kind],sinner=counts.get(row.sinner)?.[row.kind];
  global[1]++;if(owned)global[0]++;
  if(sinner){sinner[1]++;if(owned)sinner[0]++}
 }
 for(const button of document.querySelectorAll('#collectionSinnerTabs [data-collection-sinner]')){
  const countsFor=counts.get(button.dataset.collectionSinner);
  if(!countsFor)continue;
  const [identityOwned,identityTotal]=countsFor.identity;
  const [egoOwned,egoTotal]=countsFor.ego;
  const idText='인격 '+identityOwned+'/'+identityTotal;
  const egoText='E.G.O '+egoOwned+'/'+egoTotal;
  const idLabel=button.querySelector('[data-collection-count="identity"]');
  const egoLabel=button.querySelector('[data-collection-count="ego"]');
  if(idLabel)idLabel.textContent=idText;
  if(egoLabel)egoLabel.textContent=egoText;
  button.title=button.dataset.collectionSinner==='all'?'전체 · '+idText+' · '+egoText:
   (collectionSinners().find(x=>x.id===button.dataset.collectionSinner)?.name||'')+' · '+idText+' · '+egoText;
 }
}
function renderCollection(){
 const grid=$('collectionGrid');if(!grid)return;
 const list=collectionRows();collectionStats();collectionSinnerCounts();collectionExportUpdateSummary();
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

// PNG로 내보내는 보유 도감: 브라우저 저장소의 O 체크만 읽고 원본 데이터는 변경하지 않습니다.
function collectionPictureWrap(ctx,value,maxWidth,maxLines=4){
 const chars=Array.from(String(value||'')),lines=[''];
 for(let i=0;i<chars.length;i++){
  const c=chars[i],last=lines.length-1;
  if(ctx.measureText(lines[last]+c).width>maxWidth&&lines[last]){
   if(lines.length>=maxLines){
    let s=lines[last];
    while(s&&ctx.measureText(s+'…').width>maxWidth)s=s.slice(0,-1);
    lines[last]=s+'…';
    break;
   }
   lines.push(c);
  }else lines[last]+=c;
 }
 return lines.map(x=>x.trim()).filter(Boolean);
}
function collectionPictureRounded(ctx,x,y,w,h,r){
 ctx.beginPath();
 if(typeof ctx.roundRect==='function')ctx.roundRect(x,y,w,h,r);
 else ctx.rect(x,y,w,h);
}
async function collectionPictureImage(src){
 if(!src)return null;
 const urls=[src,collectionImageMirror(src)].filter((url,i,a)=>url&&a.indexOf(url)===i);
 for(const url of urls){
  const loaded=await new Promise(resolve=>{
   const img=new Image();let done=false;
   const finish=result=>{if(done)return;done=true;clearTimeout(timer);img.onload=null;img.onerror=null;resolve(result)};
   img.crossOrigin='anonymous';img.decoding='async';
   const timer=setTimeout(()=>finish(null),15000);
   img.onload=()=>finish(img);
   img.onerror=()=>finish(null);
   img.src=url;
  });
  if(loaded)return loaded;
 }
 return null;
}
function collectionPictureDrawCover(ctx,img,x,y,w,h,position){
 if(!img)return false;
 const iw=img.naturalWidth,ih=img.naturalHeight;
 if(!iw||!ih)return false;
 const scale=Math.max(w/iw,h/ih),sw=iw*scale,sh=ih*scale;
 const px=/^([0-9]{1,3})% center$/.exec(position||'');
 const center=px?Math.min(100,Number(px[1]))/100:0.5;
 ctx.drawImage(img,x+(w-sw)*center,y+(h-sh)*0.5,sw,sh);
 return true;
}
function collectionPictureOwnedMark(ctx,x,y){
 ctx.fillStyle='#0c6949';ctx.strokeStyle='#f6deaa';ctx.lineWidth=2.5;
 ctx.beginPath();ctx.arc(x,y,15,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.fillStyle='#ffffff';ctx.font='900 18px "Malgun Gothic",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('O',x,y+1);
 ctx.textBaseline='alphabetic';
}
function collectionPictureCard(ctx,row,image,x,y,w,h,sinnerName,cardScale=1){
 // 카드 크기가 변해도 이름, 별, O 배지, E.G.O 원형 비율을 함께 유지합니다.
 if(cardScale!==1){
  ctx.save();ctx.translate(x,y);ctx.scale(cardScale,cardScale);
  collectionPictureCard(ctx,row,image,0,0,w/cardScale,h/cardScale,sinnerName,1);
  ctx.restore();return;
 }
 const identity=row.kind==='identity',imageHeight=identity?h:152;
 const border=identity?(row.rarity===3?'#d4a750':row.rarity===2?'#b14537':'#8b785a'):'#786447';
 ctx.save();
 collectionPictureRounded(ctx,x,y,w,h,11);ctx.fillStyle='#151b20';ctx.fill();
 ctx.clip();
 if(identity){
  if(image){collectionPictureDrawCover(ctx,image,x+2,y+2,w-4,h-4,row.imagePosition)}
  else {ctx.fillStyle='#a4b0b4';ctx.font='13px "Malgun Gothic",sans-serif';ctx.textAlign='center';ctx.fillText('이미지 연결 실패',x+w/2,y+h/2)}
  const grad=ctx.createLinearGradient(0,y+h*.47,0,y+h);
  grad.addColorStop(0,'rgba(0,0,0,0)');grad.addColorStop(.65,'rgba(0,0,0,.65)');grad.addColorStop(1,'rgba(0,0,0,.93)');
  ctx.fillStyle=grad;ctx.fillRect(x,y+h*.47,w,h*.53);
  ctx.font='900 14px "Malgun Gothic",sans-serif';ctx.textAlign='center';
  ctx.fillStyle='#ffdc6b';ctx.shadowColor='#000000';ctx.shadowBlur=4;
  const lines=collectionPictureWrap(ctx,row.name,w-13,4);
  const step=18;
  lines.forEach((line,i)=>ctx.fillText(line,x+w/2,y+h-12-(lines.length-1-i)*step));
  ctx.shadowBlur=0;
  ctx.textAlign='left';ctx.font='900 16px "Malgun Gothic",sans-serif';ctx.fillStyle='#ffdb75';
  ctx.fillText('★'.repeat(row.rarity),x+8,y+19);
  collectionPictureOwnedMark(ctx,x+w-20,y+19);
 }else{
  const cx=x+w/2,cy=y+79,r=65;
  ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.clip();
  if(image)collectionPictureDrawCover(ctx,image,cx-r,cy-r,2*r,2*r,'50% center');
  else{ctx.fillStyle='#263039';ctx.fillRect(cx-r,cy-r,2*r,2*r);ctx.fillStyle='#b3babe';ctx.font='12px "Malgun Gothic",sans-serif';ctx.textAlign='center';ctx.fillText('이미지 연결 실패',cx,cy)}
  ctx.restore();
  ctx.beginPath();ctx.arc(cx,cy,r+1,0,Math.PI*2);
  ctx.strokeStyle=({ZAYIN:'#99764c',TETH:'#c17e3c',HE:'#9f61bc',WAW:'#d36c45',ALEPH:'#dc4545'})[row.rarity]||'#a17b4e';ctx.lineWidth=4;ctx.stroke();
  collectionPictureOwnedMark(ctx,x+w-20,y+19);
  ctx.textAlign='center';ctx.fillStyle='#ffda70';ctx.font='800 13px "Malgun Gothic",sans-serif';
  const lines=collectionPictureWrap(ctx,row.name,w-12,2);
  lines.forEach((line,i)=>ctx.fillText(line,cx,y+170+i*16));
  ctx.fillStyle='#aab3b8';ctx.font='11px "Malgun Gothic",sans-serif';
  ctx.fillText(row.rarity+(sinnerName?' · '+sinnerName:''),cx,y+h-12);
 }
 ctx.restore();
 ctx.strokeStyle=border;ctx.lineWidth=2;
 collectionPictureRounded(ctx,x+1,y+1,w-2,h-2,10);ctx.stroke();
}
// 저장 체크박스는 화면의 인격/E.G.O 탭·등급 선택과 독립적으로 적용합니다.
function collectionExportSelection(){
 const allowedIdentity=$('collectionExportIdentity')?.checked===true;
 const allowedEgo=$('collectionExportEgo')?.checked===true;
 const ranks=new Set([1,2,3].filter(n=>$('collectionExportRank'+n)?.checked===true));
 const sinner=collectionSinnerFilter;
 const sinnerOrder=new Map(collectionSinners().map((s,i)=>[s.id,i]));
 const selected=collectionRows().map((row,seq)=>({...row,seq})).filter(row=>
  collectionOwned(row)&&(sinner==='all'||row.sinner===sinner)&&(
   (allowedIdentity&&row.kind==='identity'&&ranks.has(Number(row.rarity)))||
   (allowedEgo&&row.kind==='ego')
  ));
 const sort=(a,b)=>collectionOrder==='name'?a.name.localeCompare(b.name,'ko'):(sinnerOrder.get(a.sinner)-sinnerOrder.get(b.sinner))||(b.seq-a.seq);
 return {
  identities:selected.filter(row=>row.kind==='identity').sort(sort),
  egos:selected.filter(row=>row.kind==='ego').sort(sort),
  ranks:[...ranks].sort()
 };
}
// 인격과 E.G.O를 같은 수감자 단위로 한 번만 묶고 빈 수감자는 생략합니다.
function collectionExportSinnerGroups(identities,egos,sinners){
 return sinners.map(s=>({
  sinner:s.id,
  identities:identities.filter(row=>row.sinner===s.id),
  egos:egos.filter(row=>row.sinner===s.id)
 })).filter(group=>group.identities.length||group.egos.length);
}
function collectionExportSizeSettings(){
 const slider=$('collectionExportCardSize');
 const raw=Number(slider?.value);
 const percent=Number.isFinite(raw)?Math.max(40,Math.min(120,raw)):70;
 const factor=percent/100;
 const width=1120,pad=32;
 const baseWidth=(width-pad*2-5*12)/6;
 const cardW=baseWidth*factor;
 const gap=Math.max(6,Math.round(12*factor));
 const cols=Math.max(1,Math.floor((width-pad*2+gap+0.001)/(cardW+gap)));
 return {percent,factor,width,pad,cardW,gap,cols};
}
// 사진 저장 설정도 다른 도감 설정과 동일한 IndexedDB(meta)에 보관합니다.
const collectionExportPreferenceDefaults=Object.freeze({
 identity:true,ego:true,rank1:true,rank2:true,rank3:true,groupBySinner:true,cardSize:70
});
const collectionExportPreferenceControls={
 identity:'collectionExportIdentity',ego:'collectionExportEgo',
 rank1:'collectionExportRank1',rank2:'collectionExportRank2',rank3:'collectionExportRank3',
 groupBySinner:'collectionExportGroupBySinner'
};
let collectionExportSaveQueue=Promise.resolve();
function collectionExportNormalizePreferences(value){
 const prefs=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
 const normalized={...collectionExportPreferenceDefaults};
 for(const key of Object.keys(collectionExportPreferenceControls)){
  if(typeof prefs[key]==='boolean')normalized[key]=prefs[key];
 }
 if(typeof prefs.cardSize==='number'&&Number.isFinite(prefs.cardSize)){
  normalized.cardSize=Math.max(40,Math.min(120,Math.round(prefs.cardSize/5)*5));
 }
 return normalized;
}
function collectionExportReadPreferences(){
 const raw={};
 for(const [key,id] of Object.entries(collectionExportPreferenceControls))raw[key]=$(id).checked;
 raw.cardSize=Number($('collectionExportCardSize').value);
 return collectionExportNormalizePreferences(raw);
}
function collectionExportApplyPreferences(value){
 const prefs=collectionExportNormalizePreferences(value);
 for(const [key,id] of Object.entries(collectionExportPreferenceControls))$(id).checked=prefs[key];
 $('collectionExportCardSize').value=String(prefs.cardSize);
 collectionExportUpdateSummary();
}
function collectionExportSavePreferences(){
 const prefs=collectionExportReadPreferences();
 state.collectionExportPrefs=prefs;
 // 순서대로 저장하여 체크를 빠르게 바꿔도 마지막 설정이 남도록 합니다.
 collectionExportSaveQueue=collectionExportSaveQueue.catch(()=>{}).then(()=>
  action('meta','put',{id:'collectionExportPrefsV1',values:prefs}));
 return collectionExportSaveQueue;
}
function collectionExportSettingsChanged(){
 collectionExportUpdateSummary();
 collectionExportSavePreferences().catch(e=>{
  console.error('사진 저장 설정 저장 실패',e);
  toast('사진 저장 설정을 저장하지 못했습니다. 브라우저 저장 공간을 확인해 주세요.');
 });
}
function collectionExportUpdateSummary(){
 const identity=$('collectionExportIdentity');
 if(!identity)return;
 for(const n of [1,2,3]){
  const box=$('collectionExportRank'+n);
  if(box)box.disabled=!identity.checked;
 }
 const size=collectionExportSizeSettings();
 const sizeValue=$('collectionExportCardSizeValue');
 if(sizeValue)sizeValue.textContent=size.percent+'%';
 const selection=collectionExportSelection();
 const total=selection.identities.length+selection.egos.length;
 const out=$('collectionExportSummary');
 if(out)out.textContent='저장 예정 '+total+'종 · 인격 '+selection.identities.length+' · E.G.O '+selection.egos.length;
}
// 내보낼 PNG를 실제 저장 전에 보여줍니다. 취소하면 로컬 미리보기만 폐기합니다.
const collectionPreviewState={url:'',filename:''};
function collectionPreviewClose(download=false){
 const modal=$('collectionPreviewModal');
 if(!modal||modal.hidden)return;
 const url=collectionPreviewState.url,filename=collectionPreviewState.filename;
 modal.hidden=true;
 $('collectionPreviewImage').removeAttribute('src');
 collectionPreviewState.url='';
 collectionPreviewState.filename='';
 if(download&&url&&filename){
  const link=document.createElement('a');
  link.href=url;link.download=filename;
  document.body.appendChild(link);link.click();link.remove();
  // 브라우저 다운로드가 URL을 읽을 시간을 보장합니다.
  setTimeout(()=>URL.revokeObjectURL(url),20000);
  toast('PNG 저장을 시작했습니다.');
 }else if(url){
  URL.revokeObjectURL(url);
 }
 $('collectionDownloadPicture')?.focus();
}
function collectionPreviewOpen(blob,filename,meta){
 collectionPreviewClose();
 const url=URL.createObjectURL(blob);
 collectionPreviewState.url=url;
 collectionPreviewState.filename=filename;
 $('collectionPreviewImage').src=url;
 $('collectionPreviewMeta').textContent=meta;
 $('collectionPreviewModal').hidden=false;
 $('collectionPreviewClose').focus();
}

async function collectionDownloadOwnedPicture(){
 const button=$('collectionDownloadPicture');
 if(!button||button.disabled)return;
 const {identities,egos,ranks}=collectionExportSelection();
 const allRows=[...identities,...egos];
 if(!allRows.length){toast('선택한 사진 저장 조건에 해당하는 보유 항목이 없습니다.');return}
 const sinnerFilter=collectionSinnerFilter;
 const sinners=collectionSinners();
 const old=button.textContent;
 button.disabled=true;button.textContent='사진 준비 중…';
 try{
  const images=new Array(allRows.length);let next=0,loaded=0;
  const worker=async()=>{while(next<allRows.length){
   const i=next++;
   images[i]=await collectionPictureImage(allRows[i].image);
   loaded++;
   if(loaded%8===0||loaded===allRows.length)button.textContent='사진 준비 '+loaded+'/'+allRows.length;
  }};
  await Promise.all(Array.from({length:Math.min(8,allRows.length)},()=>worker()));
  const canvas=document.createElement('canvas');
  const ctx=canvas.getContext('2d');
  if(!ctx)throw new Error('브라우저에서 이미지 캔버스를 지원하지 않습니다');
  const {width,pad,cols,gap,cardW,factor}=collectionExportSizeSettings();
  const grouped=$('collectionExportGroupBySinner')?.checked!==false;
  const groups=grouped?collectionExportSinnerGroups(identities,egos,sinners):[];
  const identityHeight=Math.round(cardW*370/240),egoHeight=Math.round(230*factor);
  const sections=[
   {kind:'identity',items:identities,title:'인격',height:identityHeight},
   {kind:'ego',items:egos,title:'E.G.O',height:egoHeight}
  ].filter(section=>section.items.length);
  const sectionHeader=57,sectionBottom=14,head=143,footer=48;
  // 수감자 사이에는 1px 선이 들어갈 최소한의 공간만 유지합니다.
  const groupBreak=5,mixedGap=3;
  const groupedBlockHeight=(items,height)=>{
   const count=Math.ceil(items.length/cols);
   return count?count*height+(count-1)*gap:0;
  };
  const groupContentHeight=group=>groupedBlockHeight(group.identities,identityHeight)+
   (group.identities.length&&group.egos.length?mixedGap:0)+
   groupedBlockHeight(group.egos,egoHeight);
  const contentHeight=grouped?
   groups.reduce((sum,group,i)=>sum+(i?groupBreak:0)+groupContentHeight(group),0)+sectionBottom:
   sections.reduce((sum,section)=>sum+sectionHeader+Math.ceil(section.items.length/cols)*(section.height+gap)+sectionBottom,0);
  canvas.width=width;
  canvas.height=head+contentHeight+footer;
  if(canvas.height>30000)throw new Error('보유 이미지가 너무 길어 저장할 수 없습니다. 수감자를 선택해 나눠 저장해 주세요');
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.fillStyle='#0c1216';ctx.fillRect(0,0,width,canvas.height);
  const sinner=sinnerFilter==='all'?'전체':sinners.find(s=>s.id===sinnerFilter)?.name||'전체';
  ctx.fillStyle='#f0d5a3';ctx.font='900 31px "Malgun Gothic",sans-serif';ctx.textAlign='left';
  ctx.fillText('LIMBUS COMPANY · 보유 도감',pad,60);
  ctx.fillStyle='#adb8b7';ctx.font='16px "Malgun Gothic",sans-serif';
  ctx.fillText(sinner+' · 인격 '+identities.length+'종 · E.G.O '+egos.length+'종 · O 보유 항목만',pad,96);
  ctx.strokeStyle='#495254';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pad,114);ctx.lineTo(width-pad,114);ctx.stroke();
  const loadedMap=new Map(allRows.map((row,i)=>[row.id,images[i]]));
  let y=head;
  if(grouped){
   // 수감자별 인격 카드 다음에 그 수감자의 원형 E.G.O를 배치합니다.
   // 수감자 이름/번호는 쓰지 않고 가로 구분선과 여백만 추가합니다.
   for(let g=0;g<groups.length;g++){
    const group=groups[g];
    if(g>0){
     const dividerY=y+groupBreak/2;
     ctx.strokeStyle='#62716c';ctx.lineWidth=1;
     ctx.beginPath();ctx.moveTo(pad+12,dividerY);ctx.lineTo(width-pad-12,dividerY);ctx.stroke();
     y+=groupBreak;
    }
    for(let i=0;i<group.identities.length;i++){
     const row=group.identities[i],x=pad+(i%cols)*(cardW+gap);
     const cy=y+Math.floor(i/cols)*(identityHeight+gap);
     collectionPictureCard(ctx,row,loadedMap.get(row.id),x,cy,cardW,identityHeight,'',factor);
    }
    y+=groupedBlockHeight(group.identities,identityHeight);
    if(group.identities.length&&group.egos.length)y+=mixedGap;
    for(let i=0;i<group.egos.length;i++){
     const row=group.egos[i],x=pad+(i%cols)*(cardW+gap);
     const cy=y+Math.floor(i/cols)*(egoHeight+gap);
     collectionPictureCard(ctx,row,loadedMap.get(row.id),x,cy,cardW,egoHeight,'',factor);
    }
    y+=groupedBlockHeight(group.egos,egoHeight);
   }
  }else{
   // 구분 끔: 기존 인격/E.G.O 구역별 저장 방식을 유지합니다.
   for(const section of sections){
    ctx.fillStyle='#edd39f';ctx.font='900 22px "Malgun Gothic",sans-serif';ctx.textAlign='left';
    ctx.fillText(section.title+' · '+section.items.length+'종',pad,y+28);
    if(section.kind==='identity'){
     const marks=ranks.map(n=>'★'.repeat(n)).join(' / ');
     ctx.fillStyle='#a3b1ad';ctx.font='13px "Malgun Gothic",sans-serif';
     ctx.fillText('포함 등급: '+marks,pad+210,y+27);
    }
    ctx.strokeStyle='#3d4848';ctx.beginPath();ctx.moveTo(pad,y+43);ctx.lineTo(width-pad,y+43);ctx.stroke();
    y+=sectionHeader;
    for(let i=0;i<section.items.length;i++){
     const row=section.items[i],x=pad+(i%cols)*(cardW+gap),cy=y+Math.floor(i/cols)*(section.height+gap);
     collectionPictureCard(ctx,row,loadedMap.get(row.id),x,cy,cardW,section.height,sinners.find(s=>s.id===row.sinner)?.name||'',factor);
    }
    y+=Math.ceil(section.items.length/cols)*(section.height+gap)+sectionBottom;
   }
  }
  const failed=images.filter(img=>!img).length;
  ctx.fillStyle='#76878a';ctx.font='13px "Malgun Gothic",sans-serif';ctx.textAlign='left';
  ctx.fillText('Illustrations © Project Moon · 개인용 보유 도감',pad,canvas.height-15);
  const blob=await new Promise((resolve,reject)=>{
   try{canvas.toBlob(b=>b?resolve(b):reject(new Error('PNG 파일 생성에 실패했습니다')),'image/png')}
   catch(e){reject(e)}
  });
  const date=new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Seoul'});
  const mode=identities.length&&egos.length?'both':identities.length?'identity':'ego';
  const filterPart=sinnerFilter==='all'?'':('-'+sinnerFilter);
  const rankPart=identities.length?('-stars'+ranks.join('')):'';
  const filename='limbus-owned-'+mode+rankPart+filterPart+'-'+date+'.png';
  const fileSize=(blob.size/1024/1024).toFixed(1);
  const meta='총 '+allRows.length+'종 · 인격 '+identities.length+'종 · E.G.O '+egos.length+'종 · '+canvas.width+'×'+canvas.height+'px · '+fileSize+'MB'+(failed?' · 사진 '+failed+'장 연결 실패':'');
  collectionPreviewOpen(blob,filename,meta);
  if(failed)toast('사진 '+failed+'장이 연결되지 않았습니다. 미리보기를 확인해 주세요.');
 }catch(e){
  console.error('보유 사진 저장 실패',e);
  toast('사진 저장 실패: '+(e?.message||'브라우저 이미지 제한을 확인해 주세요'));
 }finally{
  button.disabled=false;button.textContent=old;
 }
}
async function collectionSave(){await action('meta','put',{id:'collectionOwnedV1',values:state.collectionOwned||{}})}
function wireCollection(){
 const sinners=collectionSinners();
 const sinnerTab=(id,name,selected)=>'<button type="button" class="collection-filter collection-sinner-tab'+(selected?' selected':'')+'" data-collection-sinner="'+esc(id)+'"><span class="collection-sinner-name">'+esc(name)+'</span><span class="collection-sinner-count"><span data-collection-count="identity">인격 0/0</span><span data-collection-count="ego">E.G.O 0/0</span></span></button>';
 $('collectionSinnerTabs').innerHTML=sinnerTab('all','전체',true)+sinners.map(s=>sinnerTab(s.id,s.name,false)).join('');
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
 collectionExportApplyPreferences(state.collectionExportPrefs);
 $('collectionExportCardSize').addEventListener('input',collectionExportUpdateSummary);
 $('collectionExportCardSize').addEventListener('change',collectionExportSettingsChanged);
 for(const id of ['collectionExportIdentity','collectionExportEgo','collectionExportRank1','collectionExportRank2','collectionExportRank3','collectionExportGroupBySinner']){
  $(id).addEventListener('change',collectionExportSettingsChanged);
 }
 $('collectionDownloadPicture').addEventListener('click',collectionDownloadOwnedPicture);
 $('collectionPreviewClose').addEventListener('click',()=>collectionPreviewClose());
 $('collectionPreviewCancel').addEventListener('click',()=>collectionPreviewClose());
 $('collectionPreviewSave').addEventListener('click',()=>collectionPreviewClose(true));
 $('collectionPreviewModal').addEventListener('click',e=>{if(e.target===$('collectionPreviewModal'))collectionPreviewClose()});
 window.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!$('collectionPreviewModal').hidden){
   e.preventDefault();collectionPreviewClose();
  }
 });
 $('collectionCopy').addEventListener('click',async()=>{
  const rows=collectionRows().filter(r=>collectionOwned(r)&&!r.base),sinners=collectionSinners();
  const txt='림버스 컴퍼니 보유 목록\n인격 '+collectionRows().filter(r=>r.kind==='identity'&&collectionOwned(r)).length+' / 195 · E.G.O '+collectionRows().filter(r=>r.kind==='ego'&&collectionOwned(r)).length+' / 117\n\n'+sinners.map(s=>s.name+'\n'+rows.filter(r=>r.sinner===s.id).map(r=>'- ['+(r.kind==='identity'?'인격':'E.G.O')+'] '+r.name).join('\n')).join('\n\n');
  try{await navigator.clipboard.writeText(txt);toast('보유 목록을 복사했어요')}catch{toast('클립보드 복사 권한을 확인해 주세요')}
 });
}