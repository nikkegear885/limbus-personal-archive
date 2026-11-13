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
// PNG 이름은 띄어쓰기를 우선 존중하고, 카드 폭보다 긴 단어만 음절 단위로 나눕니다.
// 말줄임표 없이 전체 이름을 표시하기 위해 카드 행 높이를 이름에 맞춰 계산합니다.
function collectionPictureWrapWords(ctx,value,maxWidth){
 const words=String(value||'').trim().replace(/\s+/g,' ').split(' ').filter(Boolean);
 const lines=[];let line='';
 const fits=value=>ctx.measureText(value).width<=maxWidth;
 const flush=()=>{if(line){lines.push(line);line=''}};
 for(const word of words){
  const joined=line?line+' '+word:word;
  if(fits(joined)){line=joined;continue}
  flush();
  if(fits(word)){line=word;continue}
  const parts=word.split(/(?<=::)|(?<=\/)|(?<=-)/u).filter(Boolean);
  for(const part of parts){
   if(fits(line+part)){line+=part;continue}
   flush();
   if(fits(part)){line=part;continue}
   for(const ch of Array.from(part)){
    if(line&&!fits(line+ch))flush();
    line+=ch;
   }
  }
 }
 flush();
 return lines;
}
function collectionPictureTitleLines(ctx,row,cardW,factor){
 const identity=row.kind==='identity';
 ctx.save();
 ctx.font=(identity?'900 32px':'900 30px')+' "Malgun Gothic",sans-serif';
 const lines=collectionPictureWrapWords(ctx,row.name,cardW/factor-16);
 ctx.restore();
 return lines.length?lines:[''];
}
function collectionPictureGridLayout(ctx,items,columns,cardW,gap,factor,cropPercent){
 const cols=Math.max(1,columns),cells=[];let total=0;
 for(let start=0;start<items.length;start+=cols){
  const chunk=items.slice(start,start+cols);
  const rowCells=chunk.map((row,i)=>{
   const identity=row.kind==='identity';
   const lines=collectionPictureTitleLines(ctx,row,cardW,factor);
   const imageHeight=identity?
    Math.round(cardW*370/240*(1-cropPercent/100)):Math.round(154*factor);
   const titleHeight=Math.ceil(((identity?38:36)*lines.length+19+(identity?0:19))*factor);
   return {row,x:i*(cardW+gap),lines,imageHeight,neededHeight:imageHeight+titleHeight};
  });
  const rowHeight=Math.max(...rowCells.map(item=>item.neededHeight));
  rowCells.forEach(item=>cells.push({...item,y:total,height:rowHeight}));
  total+=rowHeight+gap;
 }
 return {cells,height:items.length?total-gap:0};
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
function collectionPictureCard(ctx,row,image,x,y,w,h,sinnerName,cardScale=1,cropPercent=0,titleLines=null){
 // 이미지 카드 글씨는 기존 14/13px에서 32/30px로 확대한 저장 전용 렌더러입니다.
 if(cardScale!==1){
  ctx.save();ctx.translate(x,y);ctx.scale(cardScale,cardScale);
  collectionPictureCard(ctx,row,image,0,0,w/cardScale,h/cardScale,sinnerName,1,cropPercent,titleLines);
  ctx.restore();return;
 }
 const identity=row.kind==='identity';
 const photoHeight=identity?Math.round(w*370/240*(1-cropPercent/100)):154;
 const border=identity?(row.rarity===3?'#d4a750':row.rarity===2?'#b14537':'#8b785a'):'#786447';
 const lines=titleLines||collectionPictureTitleLines(ctx,row,w,1);
 const lineHeight=identity?38:36;
 const labelY=y+photoHeight+9;
 ctx.save();
 collectionPictureRounded(ctx,x,y,w,h,11);ctx.fillStyle='#151b20';ctx.fill();
 ctx.clip();
 if(identity){
  if(image){
   const fullArtworkHeight=photoHeight/(1-cropPercent/100);
   collectionPictureDrawCover(ctx,image,x+2,y+2,w-4,fullArtworkHeight-4,row.imagePosition);
  }else{
   ctx.fillStyle='#a4b0b4';ctx.font='13px "Malgun Gothic",sans-serif';ctx.textAlign='center';
   ctx.fillText('이미지 연결 실패',x+w/2,y+photoHeight/2);
  }
  ctx.textAlign='left';ctx.font='900 16px "Malgun Gothic",sans-serif';
  ctx.fillStyle='#ffdb75';ctx.shadowColor='#000';ctx.shadowBlur=3;
  ctx.fillText('★'.repeat(row.rarity),x+8,y+19);ctx.shadowBlur=0;
 }else{
  const cx=x+w/2,cy=y+79,r=65;
  ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.clip();
  if(image)collectionPictureDrawCover(ctx,image,cx-r,cy-r,2*r,2*r,'50% center');
  else{
   ctx.fillStyle='#263039';ctx.fillRect(cx-r,cy-r,2*r,2*r);
   ctx.fillStyle='#b3babe';ctx.font='12px "Malgun Gothic",sans-serif';
   ctx.textAlign='center';ctx.fillText('이미지 연결 실패',cx,cy);
  }
  ctx.restore();
  ctx.beginPath();ctx.arc(cx,cy,r+1,0,Math.PI*2);
  ctx.strokeStyle=({ZAYIN:'#99764c',TETH:'#c17e3c',HE:'#9f61bc',WAW:'#d36c45',ALEPH:'#dc4545'})[row.rarity]||'#a17b4e';
  ctx.lineWidth=4;ctx.stroke();
 }
 // 커진 이름은 사진 밖의 어두운 영역에 두어 일러스트를 가리지 않습니다.
 ctx.fillStyle='#10191e';ctx.fillRect(x,y+photoHeight,w,h-photoHeight);
 ctx.textAlign='center';ctx.textBaseline='top';ctx.fillStyle='#ffdf85';
 ctx.font=(identity?'900 32px':'900 30px')+' "Malgun Gothic",sans-serif';
 lines.forEach((line,i)=>ctx.fillText(line,x+w/2,labelY+i*lineHeight));
 ctx.textBaseline='alphabetic';
 if(!identity){
  ctx.fillStyle='#aab3b8';ctx.font='11px "Malgun Gothic",sans-serif';
  ctx.fillText(row.rarity+(sinnerName?' · '+sinnerName:''),x+w/2,labelY+lines.length*lineHeight+8);
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
// 홍루까지 왼쪽, 히스클리프부터 오른쪽. 카탈로그 순서가 바뀌어도 수감자 ID로 분리합니다.
function collectionExportSplitSinnerGroups(groups){
 const leftIds=new Set(['yisang','faust','don','ryoshu','meursault','honglu']);
 return [
  groups.filter(group=>leftIds.has(group.sinner)),
  groups.filter(group=>!leftIds.has(group.sinner))
 ];
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
 identity:true,ego:true,rank1:true,rank2:true,rank3:true,groupBySinner:true,splitSides:false,cropPercent:0,cardSize:70
});
const collectionExportPreferenceControls={
 identity:'collectionExportIdentity',ego:'collectionExportEgo',
 rank1:'collectionExportRank1',rank2:'collectionExportRank2',rank3:'collectionExportRank3',
 groupBySinner:'collectionExportGroupBySinner',splitSides:'collectionExportSplitSides'
};
let collectionExportSaveQueue=Promise.resolve();
function collectionExportNormalizePreferences(value){
 const prefs=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
 const normalized={...collectionExportPreferenceDefaults};
 for(const key of Object.keys(collectionExportPreferenceControls)){
  if(typeof prefs[key]==='boolean')normalized[key]=prefs[key];
 }
 if([0,30,40].includes(prefs.cropPercent))normalized.cropPercent=prefs.cropPercent;
 else if(prefs.cropBottom===true)normalized.cropPercent=30; // 기존 30% 체크 보존
 if(typeof prefs.cardSize==='number'&&Number.isFinite(prefs.cardSize)){
  normalized.cardSize=Math.max(40,Math.min(120,Math.round(prefs.cardSize/5)*5));
 }
 return normalized;
}
function collectionExportReadPreferences(){
 const raw={};
 for(const [key,id] of Object.entries(collectionExportPreferenceControls))raw[key]=$(id).checked;
 raw.cardSize=Number($('collectionExportCardSize').value);
 raw.cropPercent=Number($('collectionExportCropPercent').value);
 return collectionExportNormalizePreferences(raw);
}
function collectionExportApplyPreferences(value){
 const prefs=collectionExportNormalizePreferences(value);
 for(const [key,id] of Object.entries(collectionExportPreferenceControls))$(id).checked=prefs[key];
 $('collectionExportCardSize').value=String(prefs.cardSize);
 $('collectionExportCropPercent').value=String(prefs.cropPercent);
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
 const split=$('collectionExportSplitSides');
 if(split)split.disabled=$('collectionExportGroupBySinner')?.checked!==true;
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
  const splitSides=grouped&&$('collectionExportSplitSides')?.checked===true;
  const cropPercent=Number($('collectionExportCropPercent').value)||0;
  const groups=grouped?collectionExportSinnerGroups(identities,egos,sinners):[];
  // 기존 분할 구성과 카드 크기 설정은 유지하고, 이름 줄 수에 맞춰 행 높이만 계산합니다.
  const splitGroups=splitSides?collectionExportSplitSinnerGroups(groups):[];
  const availableSideWidth=(width-pad*2-12)/2;
  const maxSideCols=Math.max(1,Math.floor((availableSideWidth+gap+0.001)/(cardW+gap)));
  const sideColumnCounts=splitGroups.map(side=>{
   const maxItems=Math.max(0,...side.map(group=>Math.max(group.identities.length,group.egos.length)));
   return maxItems?Math.min(maxSideCols,maxItems):0;
  });
  const sideWidths=sideColumnCounts.map(count=>count?count*cardW+(count-1)*gap:0);
  const sideGap=sideWidths.length===2&&sideWidths[0]&&sideWidths[1]?8:0;
  const exportWidth=splitSides?Math.ceil(pad*2+sideWidths.reduce((sum,w)=>sum+w,0)+sideGap):width;
  const sidePositions=[pad,pad+(sideWidths[0]||0)+sideGap];
  const sections=[
   {kind:'identity',items:identities},
   {kind:'ego',items:egos}
  ].filter(section=>section.items.length);
  const head=8,footer=8,sectionGap=8,groupBreak=5,mixedGap=3;
  const layoutCache=new WeakMap();
  const getLayout=(items,columnCount)=>{
   let cache=layoutCache.get(items);
   if(!cache){cache=new Map();layoutCache.set(items,cache)}
   const actualCols=Math.max(1,columnCount);
   if(!cache.has(actualCols))cache.set(actualCols,collectionPictureGridLayout(ctx,items,actualCols,cardW,gap,factor,cropPercent));
   return cache.get(actualCols);
  };
  const groupHeight=(group,columnCount)=>getLayout(group.identities,columnCount).height+
   (group.identities.length&&group.egos.length?mixedGap:0)+
   getLayout(group.egos,columnCount).height;
  const groupsHeight=(items,columnCount)=>items.reduce((sum,group,i)=>sum+(i?groupBreak:0)+groupHeight(group,columnCount),0);
  const contentHeight=splitSides?
   Math.max(...splitGroups.map((side,i)=>groupsHeight(side,sideColumnCounts[i]||1))):
   grouped?groupsHeight(groups,cols):
   sections.reduce((sum,section,i)=>sum+(i?sectionGap:0)+getLayout(section.items,cols).height,0);
  const logicalHeight=head+contentHeight+footer;
  if(logicalHeight>30000)throw new Error('보유 이미지가 너무 길어 저장할 수 없습니다. 수감자를 선택해 나눠 저장해 주세요');
  const pixelBudget=90000000,maxEdge=30000;
  const outputScale=[3,2,1].find(n=>
   exportWidth*n<=maxEdge&&logicalHeight*n<=maxEdge&&exportWidth*logicalHeight*n*n<=pixelBudget);
  if(!outputScale)throw new Error('사진이 너무 길어 저장할 수 없습니다. 수감자를 나눠 저장해 주세요');
  canvas.width=exportWidth*outputScale;
  canvas.height=Math.ceil(logicalHeight*outputScale);
  ctx.setTransform(outputScale,0,0,outputScale,0,0);
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.fillStyle='#0c1216';ctx.fillRect(0,0,exportWidth,logicalHeight);
  const loadedMap=new Map(allRows.map((row,i)=>[row.id,images[i]]));
  const drawGrid=(items,columnCount,x,y,sinnerName='')=>{
   const current=getLayout(items,columnCount);
   for(const item of current.cells){
    collectionPictureCard(ctx,item.row,loadedMap.get(item.row.id),x+item.x,y+item.y,cardW,item.height,
     sinnerName,factor,cropPercent,item.lines);
   }
   return current.height;
  };
  if(splitSides){
   if(sideGap){
    const centerX=sidePositions[1]-sideGap/2;
    ctx.strokeStyle='#4c5c59';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(centerX,head);ctx.lineTo(centerX,logicalHeight-footer);ctx.stroke();
   }
   for(let sideIndex=0;sideIndex<2;sideIndex++){
    const sideX=sidePositions[sideIndex],sideCols=sideColumnCounts[sideIndex]||1,sideWidth=sideWidths[sideIndex];
    let y=head;
    for(const [groupIndex,group] of splitGroups[sideIndex].entries()){
     if(groupIndex){
      const dividerY=y+groupBreak/2;
      ctx.strokeStyle='#62716c';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(sideX+3,dividerY);ctx.lineTo(sideX+sideWidth-3,dividerY);ctx.stroke();
      y+=groupBreak;
     }
     y+=drawGrid(group.identities,sideCols,sideX,y);
     if(group.identities.length&&group.egos.length)y+=mixedGap;
     y+=drawGrid(group.egos,sideCols,sideX,y);
    }
   }
  }else if(grouped){
   let y=head;
   for(const [i,group] of groups.entries()){
    if(i){
     const dividerY=y+groupBreak/2;
     ctx.strokeStyle='#62716c';ctx.lineWidth=1;
     ctx.beginPath();ctx.moveTo(pad+12,dividerY);ctx.lineTo(width-pad-12,dividerY);ctx.stroke();
     y+=groupBreak;
    }
    y+=drawGrid(group.identities,cols,pad,y);
    if(group.identities.length&&group.egos.length)y+=mixedGap;
    y+=drawGrid(group.egos,cols,pad,y);
   }
  }else{
   let y=head;
   for(const [i,section] of sections.entries()){
    if(i){
     const dividerY=y+sectionGap/2;
     ctx.strokeStyle='#62716c';ctx.lineWidth=1;
     ctx.beginPath();ctx.moveTo(pad+12,dividerY);ctx.lineTo(width-pad-12,dividerY);ctx.stroke();
     y+=sectionGap;
    }
    y+=drawGrid(section.items,cols,pad,y);
   }
  }
  const failed=images.filter(img=>!img).length;
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
 $('collectionExportCropPercent').addEventListener('change',collectionExportSettingsChanged);
 for(const id of ['collectionExportIdentity','collectionExportEgo','collectionExportRank1','collectionExportRank2','collectionExportRank3','collectionExportGroupBySinner','collectionExportSplitSides']){
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