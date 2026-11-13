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
function collectionPictureCard(ctx,row,image,x,y,w,h,sinnerName){
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
  ctx.fillText(row.rarity+' · '+sinnerName,cx,y+h-12);
 }
 ctx.restore();
 ctx.strokeStyle=border;ctx.lineWidth=2;
 collectionPictureRounded(ctx,x+1,y+1,w-2,h-2,10);ctx.stroke();
}
async function collectionDownloadOwnedPicture(){
 const button=$('collectionDownloadPicture');
 if(!button||button.disabled)return;
 const kind=collectionKind,filter=collectionSinnerFilter;
 const sinners=collectionSinners();
 const index=new Map(sinners.map((x,i)=>[x.id,i]));
 const rows=collectionRows().map((row,seq)=>({...row,seq})).filter(row=>
  row.kind===kind&&collectionOwned(row)&&(filter==='all'||row.sinner===filter));
 if(!rows.length){toast('선택한 탭에 보유 중인 항목이 없습니다.');return}
 rows.sort((a,b)=>collectionOrder==='name'?a.name.localeCompare(b.name,'ko'):(index.get(a.sinner)-index.get(b.sinner))||(b.seq-a.seq));
 const old=button.textContent;
 button.disabled=true;button.textContent='사진 준비 중…';
 try{
  const images=new Array(rows.length);let next=0,loaded=0;
  const worker=async()=>{while(next<rows.length){
   const i=next++;
   images[i]=await collectionPictureImage(rows[i].image);
   loaded++;
   if(loaded%8===0||loaded===rows.length)button.textContent='사진 준비 '+loaded+'/'+rows.length;
  }};
  await Promise.all(Array.from({length:Math.min(8,rows.length)},worker));
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
  if(!ctx)throw new Error('브라우저에서 이미지 캔버스를 지원하지 않습니다');
  const width=1120,pad=32,cols=6,gap=12,cardW=(width-pad*2-gap*(cols-1))/cols;
  const tileH=kind==='identity'?Math.round(cardW*370/240):230;
  const rowCount=Math.ceil(rows.length/cols),head=150,foot=45;
  canvas.width=width;canvas.height=head+rowCount*(tileH+gap)+foot;
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.fillStyle='#0c1216';ctx.fillRect(0,0,width,canvas.height);
  const sinner=filter==='all'?'전체':sinners.find(s=>s.id===filter)?.name||'전체';
  ctx.fillStyle='#f0d5a3';ctx.font='900 31px "Malgun Gothic",sans-serif';ctx.textAlign='left';
  ctx.fillText('LIMBUS COMPANY · 보유 '+(kind==='identity'?'인격':'E.G.O'),pad,63);
  ctx.fillStyle='#adb8b7';ctx.font='16px "Malgun Gothic",sans-serif';
  ctx.fillText(sinner+' · '+rows.length+'종 · 체크한 항목만',pad,96);
  ctx.strokeStyle='#495254';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pad,115);ctx.lineTo(width-pad,115);ctx.stroke();
  for(let i=0;i<rows.length;i++){
   const row=rows[i],x=pad+(i%cols)*(cardW+gap),y=head+Math.floor(i/cols)*(tileH+gap);
   collectionPictureCard(ctx,row,images[i],x,y,cardW,tileH,sinners.find(s=>s.id===row.sinner)?.name||'');
  }
  const failed=images.filter(img=>!img).length;
  ctx.fillStyle='#76878a';ctx.font='13px "Malgun Gothic",sans-serif';ctx.textAlign='left';
  ctx.fillText('Illustrations © Project Moon · 개인용 보유 도감',pad,canvas.height-15);
  const blob=await new Promise((resolve,reject)=>{
   try{canvas.toBlob(b=>b?resolve(b):reject(new Error('PNG 파일 생성에 실패했습니다')),'image/png')}
   catch(e){reject(e)}
  });
  const url=URL.createObjectURL(blob),link=document.createElement('a');
  const date=new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Seoul'});
  const filterPart=filter==='all'?'':('-'+filter);
  link.href=url;link.download='limbus-owned-'+(kind==='identity'?'identity':'ego')+filterPart+'-'+date+'.png';
  document.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),20000);
  toast(failed?('PNG 저장 완료 · 이미지 '+failed+'개 연결 실패(빈 칸으로 표시)'):'보유 중인 '+rows.length+'종을 PNG로 저장했습니다.');
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
 $('collectionDownloadPicture').addEventListener('click',collectionDownloadOwnedPicture);
 $('collectionCopy').addEventListener('click',async()=>{
  const rows=collectionRows().filter(r=>collectionOwned(r)&&!r.base),sinners=collectionSinners();
  const txt='림버스 컴퍼니 보유 목록\n인격 '+collectionRows().filter(r=>r.kind==='identity'&&collectionOwned(r)).length+' / 195 · E.G.O '+collectionRows().filter(r=>r.kind==='ego'&&collectionOwned(r)).length+' / 117\n\n'+sinners.map(s=>s.name+'\n'+rows.filter(r=>r.sinner===s.id).map(r=>'- ['+(r.kind==='identity'?'인격':'E.G.O')+'] '+r.name).join('\n')).join('\n\n');
  try{await navigator.clipboard.writeText(txt);toast('보유 목록을 복사했어요')}catch{toast('클립보드 복사 권한을 확인해 주세요')}
 });
}