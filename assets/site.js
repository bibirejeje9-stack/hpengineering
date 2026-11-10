(()=>{
'use strict';
const menuButton=document.getElementById('menu-toggle');const nav=document.getElementById('main-nav');
if(menuButton&&nav){menuButton.addEventListener('click',()=>{const on=nav.classList.toggle('mobile-open');menuButton.setAttribute('aria-expanded',String(on));menuButton.setAttribute('aria-label',on?'Close navigation':'Open navigation');});}
document.querySelectorAll('.dropdown-trigger').forEach(el=>{el.addEventListener('click',()=>{const dd=el.closest('.nav-dropdown');const open=!dd.classList.contains('open');document.querySelectorAll('.nav-dropdown.open').forEach(d=>{d.classList.remove('open');d.querySelector('.dropdown-trigger')?.setAttribute('aria-expanded','false')});dd.classList.toggle('open',open);el.setAttribute('aria-expanded',String(open));});});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.querySelectorAll('.nav-dropdown.open').forEach(d=>{d.classList.remove('open');d.querySelector('.dropdown-trigger')?.setAttribute('aria-expanded','false')});nav?.classList.remove('mobile-open');menuButton?.setAttribute('aria-expanded','false');}});
document.addEventListener('click',e=>{if(!e.target.closest('.nav-dropdown'))document.querySelectorAll('.nav-dropdown.open').forEach(d=>{d.classList.remove('open');d.querySelector('.dropdown-trigger')?.setAttribute('aria-expanded','false')});});
const year=document.getElementById('year');if(year)year.textContent=new Date().getFullYear();
document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{const v=btn.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===btn));document.querySelectorAll('[data-category]').forEach(x=>x.classList.toggle('hidden',v!=='all'&&x.dataset.category!==v));}));
const state=document.getElementById('state-select');if(state){const list='Alabama,Alaska,Arizona,Arkansas,California,Colorado,Connecticut,Delaware,Florida,Georgia,Hawaii,Idaho,Illinois,Indiana,Iowa,Kansas,Kentucky,Louisiana,Maine,Maryland,Massachusetts,Michigan,Minnesota,Mississippi,Missouri,Montana,Nebraska,Nevada,New Hampshire,New Jersey,New Mexico,New York,North Carolina,North Dakota,Ohio,Oklahoma,Oregon,Pennsylvania,Rhode Island,South Carolina,South Dakota,Tennessee,Texas,Utah,Vermont,Virginia,Washington,West Virginia,Wisconsin,Wyoming,District of Columbia';list.split(',').forEach(x=>{const op=document.createElement('option');op.value=x;op.textContent=x;state.append(op);});}
const form=document.getElementById('project-form');
if(form){
  const started=form.querySelector('[name="startedAt"]');if(started)started.value=String(Date.now());
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const feedback=document.getElementById('form-feedback');
    const submit=form.querySelector('[type="submit"]');
    if(!form.checkValidity()){form.reportValidity();feedback.textContent='Please complete the required fields.';feedback.dataset.error='true';return;}
    const raw=Object.fromEntries(new FormData(form).entries());
    const payload={...raw,consent:form.querySelector('[name="consent"]').checked,startedAt:Number(raw.startedAt)};
    submit.disabled=true;submit.textContent='Submitting…';feedback.textContent='Sending your project enquiry securely…';feedback.dataset.error='false';
    try{
      const resp=await fetch('/api/inquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const outcome=await resp.json().catch(()=>({message:'The server could not process your request.'}));
      if(!resp.ok||!outcome.ok)throw Error(outcome.message||'Submission failed.');
      feedback.textContent='Your enquiry has been received. Thank you.';feedback.dataset.error='false';
      if(window.hpTrack)window.hpTrack('project_inquiry_success');
      form.reset();if(started)started.value=String(Date.now());
    }catch(err){feedback.textContent=err.message||'Enquiry unavailable. Please email peterhenry.engineering@gmail.com.';feedback.dataset.error='true';}
    finally{submit.disabled=false;submit.textContent='Submit Project Enquiry ↗';}
  });
  form.addEventListener('focusin',()=>{if(!form.dataset.started){form.dataset.started='1';if(window.hpTrack)window.hpTrack('contact_form_start');}},{once:true});
}
window.hpTrack=(event)=>{if(typeof window.va==='function')window.va('event',{name:event});};
document.querySelectorAll('a[href*="contact.html"]').forEach(link=>link.addEventListener('click',()=>window.hpTrack('primary_contact_cta')));
})();
