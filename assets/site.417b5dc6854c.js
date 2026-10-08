(() => {
  'use strict';
  const routes={main:'/',story:'/story/',perfume:'/products/perfume/',diffuser:'/products/diffuser/',wash:'/products/hand-wash/',cream:'/products/hand-cream/'};
  const names=['컬렉션 전반','오 드 퍼퓸 50 mL','디퓨저 150 mL','핸드워시 250 mL','핸드크림 50 mL'];
  const types=['유통·입점','기업·기관 선물'];
  const recipient='03chan.choi@gmail.com';
  const deliveryEndpoint='https://formsubmit.co/ajax/'+recipient;
  const deliveryFormURL=typeof location!=='undefined'?location.href.split('#')[0]:'';
  const exportRoot=typeof document!=='undefined'&&document.currentScript?new URL('../',document.currentScript.src):null;
  function portableRoute(target){if(!exportRoot)return target;const parts=target.split('#');return new URL(parts[0].replace(/^\//,'')+'index.html',exportRoot).href+(parts[1]?'#'+parts[1]:'');}
  const ui={
    ko:{prefix:'',products:names,types:types,generic:'파트너',unset:'미정',inquiry:'문의',title:['유통·입점 문의','기업·기관 선물 문의','파트너 문의'],fields:['문의 유형','제품','수량','희망 일정','배송 지역','문의 내용'],status:'메일 앱에서 내용을 확인한 뒤 보내 주세요. 앱이 열리지 않으면 아래 이메일 주소로 문의해 주세요.'},
    en:{prefix:'/en',products:['The full collection','Eau de Parfum 50 mL','Diffuser 150 mL','Hand Wash 250 mL','Hand Cream 50 mL'],types:['Retail & distribution','Corporate & institutional gifts'],generic:'Partnership',unset:'To be confirmed',inquiry:'enquiry',title:['Retail & distribution enquiry','Corporate & institutional gift enquiry','Partner enquiry'],fields:['Enquiry type','Product','Quantity required','Preferred date','Delivery region','Message'],status:'Review the draft in your email app before sending. If the app does not open, use the email address below to contact us.'},
    'zh-tw':{prefix:'/zh-tw',products:['全系列','淡香精 50 mL','擴香 150 mL','洗手露 250 mL','護手霜 50 mL'],types:['通路合作','企業・機構贈禮'],generic:'合作',unset:'待確認',inquiry:'洽詢',title:['通路合作洽詢','企業・機構贈禮洽詢','合作洽詢'],fields:['洽詢類型','產品','數量','預計日期','配送地區','洽詢內容'],status:'請先在郵件 App 確認草稿，再自行寄出。若 App 未開啟，請透過下方的電子郵件地址聯繫我們。'}
  };
  function languageUI(language){return Object.prototype.hasOwnProperty.call(ui,language)?ui[language]:ui.ko;}
  function languageTarget(base,hash){return base+(/^#[a-z][a-z0-9-]*$/i.test(hash)?hash:'');}
  function legacyTarget(hash,language='ko') {
    const m=/^#(main|story|perfume|diffuser|wash|cream)(?:\/([a-z-]+))?$/.exec(hash);
    if(!m)return null;
    return portableRoute(languageUI(language).prefix+routes[m[1]]+(m[2]?'#'+(m[2]==='partners'?'partners':m[1]+'-'+m[2]):''));
  }
  function mailDraft(type, values,language='ko') {
    const u=languageUI(language);
    const safeType=types.includes(type)?u.types[types.indexOf(type)]:u.generic;
    const product=u.products[Math.max(0,names.indexOf(values.product))];
    const quantity=/^\d{1,6}$/.test(values.quantity||'')&&Number(values.quantity)>0?values.quantity:u.unset;
    const schedule=/^\d{4}-\d{2}-\d{2}$/.test(values.schedule||'')?values.schedule:u.unset;
    const clean=(value,length)=>String(value||'').replace(/\u0000/g,'').slice(0,length)||u.unset;
    const body=[u.fields[0]+': '+safeType,u.fields[1]+': '+product,u.fields[2]+': '+quantity,u.fields[3]+': '+schedule,u.fields[4]+': '+clean(values.region,100),'',u.fields[5]+':',clean(values.message,2000)].join('\n');
    const contact=[values.name?clean(values.name,100):'',values.email?clean(values.email,254):''].filter(Boolean).join('\n');
    return 'mailto:'+recipient+'?subject='+encodeURIComponent('[SILENT BLEND] '+safeType+' '+u.inquiry+' / '+product)+'&body='+encodeURIComponent((contact?contact+'\n\n':'')+body);
  }
  const copyUI={
    ko:{to:'받는 사람',subject:'제목',copied:'작성 내용을 복사했습니다. 사용하는 메일에 붙여 넣고 확인한 뒤 보내 주세요.',emailCopied:'이메일 주소를 복사했습니다.',manual:'자동 복사를 사용할 수 없습니다. 아래 내용을 직접 선택해 복사해 주세요.'},
    en:{to:'To',subject:'Subject',copied:'Enquiry text copied. Paste it into your email, review it, and send when ready.',emailCopied:'Email address copied.',manual:'Automatic copying is unavailable. Select and copy the text below.'},
    'zh-tw':{to:'收件人',subject:'主旨',copied:'已複製洽詢內容。請貼到電子郵件中，確認後再寄出。',emailCopied:'已複製電子郵件地址。',manual:'目前無法自動複製，請手動選取並複製下方內容。'}
  };
  function inquiryText(type,values,language='ko'){
    const labels=Object.prototype.hasOwnProperty.call(copyUI,language)?copyUI[language]:copyUI.ko;
    const draft=new URL(mailDraft(type,values,language));
    return labels.to+': '+draft.pathname+'\n'+labels.subject+': '+draft.searchParams.get('subject')+'\n\n'+draft.searchParams.get('body');
  }
  async function copyText(value,clipboard){
    try{if(typeof clipboard?.writeText!=='function')return false;await clipboard.writeText(value);return true;}
    catch{return false;}
  }
  const deliveryUI={
    ko:{send:'문의 보내기',sending:'전송 중…',sent:'접수 완료',sendingNote:'문의를 전송하고 있습니다. 잠시 기다려 주세요.',success:'문의가 접수되었습니다. 입력하신 이메일로 답변드리겠습니다.',error:'문의가 접수되지 않았습니다. 입력 내용은 그대로 유지했습니다. 다시 시도하거나 아래에서 메일로 직접 보내 주세요.',uncertain:'전송 결과를 확인하지 못했습니다. 입력 내용은 그대로 유지했습니다. 잠시 뒤 다시 시도하거나 아래에서 메일로 직접 보내 주세요.',pending:'현재 온라인 접수를 완료할 수 없습니다. 입력 내용을 복사하거나 아래에서 메일로 직접 보내 주세요.'},
    en:{send:'Send enquiry',sending:'Sending…',sent:'Enquiry received',sendingNote:'Your enquiry is being sent. Please wait.',success:'Your enquiry has been received. We will reply to the email address you provided.',error:'Your enquiry was not accepted. Your message has been kept. Please try again or send it using your email app below.',uncertain:'We could not confirm the result. Your message has been kept. Please try again later or send it using your email app below.',pending:'Online enquiries are temporarily unavailable. Please copy your message or send it using your email app below.'},
    'zh-tw':{send:'送出洽詢',sending:'傳送中…',sent:'已收到洽詢',sendingNote:'正在傳送您的洽詢，請稍候。',success:'已收到您的洽詢，我們將透過您填寫的電子郵件地址回覆。',error:'洽詢未成功送出，填寫的內容已保留。請再試一次，或使用下方的郵件 App 寄送。',uncertain:'目前無法確認傳送結果，填寫的內容已保留。請稍後再試，或使用下方的郵件 App 寄送。',pending:'目前暫時無法完成線上洽詢。請複製內容，或使用下方的郵件 App 寄送。'}
  };
  function submissionPayload(type,values,language='ko'){
    const email=String(values.email||'').trim();
    if(!/^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/.test(email)||email.length>254||!String(values.message||'').trim()||String(values.message).length>2000||values._honey)throw new Error('invalid');
    const draft=new URL(mailDraft(type,values,language));
    return {name:String(values.name||'').replace(/[\r\n\u0000]/g,' ').slice(0,100),email,_replyto:email,_subject:draft.searchParams.get('subject'),message:draft.searchParams.get('body'),_template:'table',_url:deliveryFormURL,_honey:''};
  }
  // Treat activation and ambiguous responses separately from accepted submissions.
  // An HTTP 200 alone does not establish that the enquiry has been accepted.
  function deliveryResult(data){
    if(!data||typeof data!=='object')return 'uncertain';
    const message=String(data.message||'');
    if(/activat|confirm.{0,40}email|verif.{0,40}email|check.{0,40}(?:mail|inbox)/i.test(message))return 'pending';
    if(data.success===true||data.success==='true')return 'sent';
    if(data.success===false||data.success==='false')return 'error';
    return 'uncertain';
  }
  async function submitInquiry(payload,fetcher,signal){
    try{
      const response=await fetcher(deliveryEndpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},credentials:'omit',referrerPolicy:'no-referrer',body:JSON.stringify(payload),signal});
      if(!response.ok)return response.status>=400&&response.status<500?'error':'uncertain';
      return deliveryResult(await response.json());
    }catch{return 'uncertain';}
  }
  if(typeof module!=='undefined')module.exports={legacyTarget,mailDraft,languageTarget,inquiryText,copyText,submissionPayload,deliveryResult,submitInquiry};
  if(typeof document==='undefined')return;
  const formSource=document.querySelector('input[name="_url"]');if(formSource)formSource.value=deliveryFormURL;
  const language=document.body.dataset.locale||'ko';
  const localUI=languageUI(language);
  const localCopy=copyUI[language]||copyUI.ko;
  const localDelivery=deliveryUI[language]||deliveryUI.ko;
  function migrateHash(){const target=legacyTarget(location.hash,language);if(target){location.replace(target);return true;}return false;}
  if(migrateHash())return;
  window.addEventListener('hashchange',migrateHash);
  const mobile=window.matchMedia('(max-width:1000px)');
  const menu=document.querySelector('.site-nav'),toggle=document.querySelector('.menu-toggle');
  const languageSwitch=document.querySelector('.language-switch');
  function closeLanguage(focus=false){if(!languageSwitch)return;const wasOpen=languageSwitch.open;languageSwitch.open=false;if(wasOpen&&focus)languageSwitch.querySelector('summary').focus();}
  languageSwitch?.addEventListener('toggle',()=>{if(languageSwitch.open)closeMenu();});
  document.querySelectorAll('[data-language-href]').forEach(a=>a.addEventListener('click',()=>{a.href=languageTarget(a.dataset.languageHref,location.hash);}));
  function closeMenu(focus=false){if(!menu||!toggle)return;const wasOpen=menu.classList.contains('open');menu.classList.remove('open');toggle.setAttribute('aria-expanded','false');if(focus&&wasOpen)toggle.focus();}
  toggle?.addEventListener('click',()=>{const expanded=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(expanded));menu.classList.toggle('open',expanded);if(expanded)closeLanguage();});
  document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeMenu();if(!e.target.closest('.language-switch'))closeLanguage();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu(true);closeLanguage(true);}});
  menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>closeMenu()));
  mobile.addEventListener('change',()=>closeMenu());
  document.querySelectorAll('[data-gallery]').forEach(button=>{
    button.addEventListener('click',()=>{
      const parent=button.closest('.product-layout'),image=parent.querySelector('.gallery-main img'),thumb=button.querySelector('img');
      image.removeAttribute('srcset');image.src=button.dataset.fullSrc;
      if(button.dataset.fullSrcset)image.srcset=button.dataset.fullSrcset;
      image.width=Number(thumb.getAttribute('width'));image.height=Number(thumb.getAttribute('height'));
      image.dataset.asset=button.dataset.gallery;image.alt=button.getAttribute('aria-label')||thumb.alt;
      image.parentElement.classList.toggle('photo',!button.dataset.gallery.startsWith('K'));
      parent.querySelectorAll('[data-gallery]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    });
    button.addEventListener('keydown',e=>{
      const items=Array.from(button.parentElement.querySelectorAll('[data-gallery]'));let i=items.indexOf(button);
      if(e.key==='ArrowRight')i=(i+1)%items.length;else if(e.key==='ArrowLeft')i=(i-1+items.length)%items.length;
      else if(e.key==='Home')i=0;else if(e.key==='End')i=items.length-1;else return;
      e.preventDefault();items[i].focus();items[i].click();
    });
  });
  const dialog=document.getElementById('dialog'),form=document.getElementById('inquiry-form'),status=document.getElementById('inquiry-status');
  const copyFallback=document.getElementById('copy-fallback'),copyField=document.getElementById('copy-text');
  const sendButton=document.getElementById('send-inquiry'),newButton=document.getElementById('new-inquiry');
  const closeButton=dialog?.querySelector('.dialog-close');
  let opener=null,inquiryType='파트너',copyRequest=0,deliveryState='idle';
  function showStatus(message,state){status.hidden=false;status.textContent=message;status.dataset.state=state;}
  function setDeliveryState(state){
    deliveryState=state;form.dataset.delivery=state;
    const sending=state==='sending',sent=state==='sent';
    form.setAttribute('aria-busy',String(sending));
    form.querySelectorAll('input,select,textarea').forEach(field=>{field.disabled=sending||sent;});
    sendButton.disabled=sending||sent;sendButton.textContent=sending?localDelivery.sending:sent?localDelivery.sent:localDelivery.send;
    closeButton.disabled=sending;newButton.hidden=!sent;
    document.getElementById('copy-inquiry').disabled=sending;
    document.getElementById('email-fallback').disabled=sending;
  }
  function valuesForCopy(){return Object.fromEntries(Array.from(form.elements).filter(el=>el.name).map(el=>[el.name,el.value]));}
  function clearCopy(){copyRequest++;if(copyFallback)copyFallback.hidden=true;if(copyField)copyField.value='';}
  async function copyInquiry(value,success){
    const request=++copyRequest;
    const copied=await copyText(value,navigator.clipboard);
    if(request!==copyRequest||!dialog?.open)return;
    showStatus(copied?success:localCopy.manual,'copy');
    copyFallback.hidden=copied;copyField.value=copied?'':value;
    if(!copied){copyField.focus();copyField.select();copyField.setSelectionRange(0,value.length);}
  }
  document.querySelectorAll('[data-contact]').forEach(button=>button.addEventListener('click',()=>{
    if(!dialog||!form)return;
    if(typeof dialog.showModal!=='function'){location.href='mailto:03chan.choi@gmail.com';return;}
    const keepDraft=['error','uncertain','pending'].includes(deliveryState);
    if(!keepDraft){form.reset();setDeliveryState('idle');status.hidden=true;status.textContent='';}
    clearCopy();opener=button;
    if(!keepDraft)inquiryType=types.includes(button.dataset.contact)?button.dataset.contact:'파트너';
    document.getElementById('inquiry-title').textContent=localUI.title[types.includes(inquiryType)?types.indexOf(inquiryType):2];
    const selected=form.querySelector('[data-product="'+document.body.dataset.page+'"]');
    if(selected&&!keepDraft)form.elements.namedItem('product').value=selected.value;
    dialog.showModal();document.body.classList.add('dialog-open');form.elements.namedItem('email').focus();
  }));
  closeButton?.addEventListener('click',()=>{if(deliveryState!=='sending')dialog.close();});
  dialog?.addEventListener('cancel',e=>{if(deliveryState==='sending')e.preventDefault();});
  dialog?.addEventListener('click',e=>{if(e.target!==dialog||deliveryState==='sending')return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
  dialog?.addEventListener('close',()=>{
    if(!['error','uncertain','pending'].includes(deliveryState)){form.reset();setDeliveryState('idle');status.textContent='';status.hidden=true;}
    clearCopy();document.body.classList.remove('dialog-open');opener?.focus();opener=null;
  });
  document.getElementById('copy-inquiry')?.addEventListener('click',()=>{
    copyInquiry(inquiryText(inquiryType,valuesForCopy(),language),localCopy.copied);
  });
  document.getElementById('copy-email')?.addEventListener('click',()=>copyInquiry('03chan.choi@gmail.com',localCopy.emailCopied));
  document.getElementById('email-fallback')?.addEventListener('click',()=>{
    showStatus(localUI.status,'copy');location.href=mailDraft(inquiryType,valuesForCopy(),language);
  });
  newButton?.addEventListener('click',()=>{form.reset();setDeliveryState('idle');clearCopy();status.hidden=true;form.elements.namedItem('email').focus();});
  form?.addEventListener('submit',async e=>{
    e.preventDefault();if(['sending','sent'].includes(deliveryState)||!form.reportValidity())return;
    let payload;
    try{payload=submissionPayload(inquiryType,Object.fromEntries(new FormData(form)),language);}
    catch{showStatus(localDelivery.error,'error');return;}
    clearCopy();setDeliveryState('sending');showStatus(localDelivery.sendingNote,'sending');
    const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),25000);
    const result=await submitInquiry(payload,(url,options)=>window.fetch(url,options),controller.signal);
    clearTimeout(timeout);setDeliveryState(result);
    showStatus(result==='sent'?localDelivery.success:localDelivery[result],result);status.focus();
  });
  window.addEventListener('beforeunload',e=>{if(deliveryState==='sending'){e.preventDefault();e.returnValue='';}});
  window.addEventListener('pagehide',()=>{if(dialog?.open)dialog.close();form?.reset();});
  const rail=document.getElementById('story-rail'),story=document.getElementById('page-story');
  const tabs=document.querySelector('.product-tabs');
  const chapters=['place','gates','architecture','symbols','trees','scent','design','everyday','ballo'];
  let pending=false;
  function activeLinkFollower(container){
    if(!container)return ()=>{};
    let dragging=false,pausedUntil=0,resumeTimer;
    function pauseAfterGesture(){
      pausedUntil=Date.now()+600;clearTimeout(resumeTimer);
      resumeTimer=setTimeout(scheduleNavigation,620);
    }
    function reveal(link){
      if(!link||container.scrollWidth<=container.clientWidth+1)return;
      const box=container.getBoundingClientRect(),item=link.getBoundingClientRect();
      const left=box.left+container.clientLeft,right=left+container.clientWidth;
      if(item.left>=left+16&&item.right<=right-16)return;
      const target=Math.max(0,Math.min(container.scrollWidth-container.clientWidth,
        container.scrollLeft+item.left-left-(container.clientWidth-item.width)/2));
      // Move this horizontal strip only; never move the document vertically.
      if(Math.abs(target-container.scrollLeft)>1)container.scrollTo({left:target,behavior:'instant'});
    }
    container.addEventListener('pointerdown',()=>{dragging=true;clearTimeout(resumeTimer);});
    function finishGesture(){if(dragging){dragging=false;pauseAfterGesture();}}
    window.addEventListener('pointerup',finishGesture);
    window.addEventListener('pointercancel',finishGesture);
    container.addEventListener('wheel',event=>{if(event.deltaX||event.shiftKey)pauseAfterGesture();},{passive:true});
    container.addEventListener('scroll',()=>{if(!dragging&&Date.now()<pausedUntil)pauseAfterGesture();},{passive:true});
    container.addEventListener('focusin',event=>{
      const link=event.target.closest('a');if(!dragging&&link&&container.contains(link))reveal(link);
    });
    window.addEventListener('pagehide',()=>clearTimeout(resumeTimer));
    return link=>{if(!dragging&&Date.now()>=pausedUntil)reveal(link);};
  }
  const followChapter=activeLinkFollower(rail),followProduct=activeLinkFollower(tabs);
  function updateNavigation(){
    pending=false;
    if(rail&&story){
      let active=0;chapters.forEach((id,i)=>{if(document.getElementById('story-'+id)?.getBoundingClientRect().top<=160)active=i;});
      const links=rail.querySelectorAll('[data-chapter-link]');links.forEach((a,i)=>{if(i===active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
      rail.querySelector('.chapter-position').textContent=String(active+1).padStart(2,'0')+' / 09';
      const ratio=Math.max(0,Math.min(1,(160-story.getBoundingClientRect().top)/Math.max(1,story.scrollHeight-window.innerHeight+160)));
      rail.style.setProperty('--chapter-progress',(ratio*100).toFixed(1)+'%');
      followChapter(links[active]);
    }
    if(tabs){let active=null;tabs.querySelectorAll('a').forEach(a=>{const section=document.getElementById(a.hash.slice(1));if(section&&section.getBoundingClientRect().top<=150)active=a;});tabs.querySelectorAll('a').forEach(a=>{if(a===active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});followProduct(active);}
  }
  function scheduleNavigation(){if(!pending){pending=true;requestAnimationFrame(updateNavigation);}}
  window.addEventListener('scroll',scheduleNavigation,{passive:true});window.addEventListener('resize',scheduleNavigation);window.addEventListener('hashchange',scheduleNavigation);scheduleNavigation();
  document.fonts?.ready.then(scheduleNavigation);
})();
