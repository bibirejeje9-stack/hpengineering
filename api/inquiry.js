'use strict';
// Vercel Node.js function. No third-party runtime packages required.
const LIMIT = 12000;
const FIELDS = ['fullName','company','email','phone','clientType','state','city','projectType','service','description','schedule','contactMethod','consent','website','startedAt'];
const REQUIRED = ['fullName','email','clientType','state','projectType','service','description'];
const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const reply = (res,code,message) => res.status(code).json({ok:code<300,message});
const clean=(val,max=500)=>String(val??'').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F<>]/g,'').trim().slice(0,max);
const esc=(s)=>clean(s,4500).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const dig=async(value)=>{const data=new TextEncoder().encode(value);return [...new Uint8Array(await crypto.subtle.digest('SHA-256',data))].map(x=>x.toString(16).padStart(2,'0')).join('');};
const redis=async(command)=>{const r=await fetch(`${process.env.UPSTASH_REDIS_REST_URL.replace(/\/$/,'')}`,{method:'POST',headers:{Authorization:`Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify(command),signal:AbortSignal.timeout(4500)});if(!r.ok)throw Error('Rate-limit service unavailable');const j=await r.json();if(j.error)throw Error('Rate-limit rejected');return j.result;};
async function email(to,subject,html,replyTo){const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.RESEND_FROM,to:[to],subject,html,...(replyTo?{reply_to:replyTo}:{})}),signal:AbortSignal.timeout(9000)});if(!r.ok)throw Error('Email provider did not accept the message');return r.json();}
module.exports=async(req,res)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='POST'){res.setHeader('Allow','POST');return reply(res,405,'Method not allowed.');}
  if(!process.env.RESEND_API_KEY||!process.env.RESEND_FROM||!process.env.UPSTASH_REDIS_REST_URL||!process.env.UPSTASH_REDIS_REST_TOKEN)return reply(res,503,'Online enquiries are temporarily unavailable. Please email peterhenry.engineering@gmail.com.');
  if(Number(req.headers['content-length']||0)>LIMIT)return reply(res,413,'Enquiry is too long.');
  const origin=req.headers.origin;const site=process.env.PUBLIC_SITE_ORIGIN||'https://hp-engineering.vercel.app';
  if(origin && origin!==site && origin!== 'https://www.hp-engineering.vercel.app')return reply(res,403,'Invalid request origin.');
  const data=req.body;
  if(!data||typeof data!=='object'||Array.isArray(data)||Object.keys(data).some(x=>!FIELDS.includes(x)))return reply(res,400,'Invalid submission.');
  if(clean(data.website))return reply(res,200,'Thank you for your enquiry.'); // honeypot; no delivery
  if(!Number.isFinite(Number(data.startedAt))||Date.now()-Number(data.startedAt)<3500)return reply(res,400,'Please review your enquiry and try again.');
  const d={};for(const f of FIELDS)d[f]=clean(data[f],f==='description'?4000:250);
  if(REQUIRED.some(f=>!d[f])||!EMAIL.test(d.email)||d.fullName.length<2||d.description.length<20||data.consent!==true)return reply(res,400,'Please complete the required fields and consent to contact.');
  if(d.description.length>4000||!['Email','Phone',''].includes(d.contactMethod))return reply(res,400,'Invalid enquiry fields.');
  const ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
  try {
    const key=(await dig(ip)).slice(0,32);
    const count=await redis(['INCR',`hp:inquiry:hour:${key}:${Math.floor(Date.now()/3600000)}`]);
    if(Number(count)===1)await redis(['EXPIRE',`hp:inquiry:hour:${key}:${Math.floor(Date.now()/3600000)}`,3600]);
    if(Number(count)>5)return reply(res,429,'Too many enquiries. Please try again later.');
    const dedup=(await dig([d.email.toLowerCase(),d.projectType,d.description.toLowerCase()].join('|'))).slice(0,40);
    const acquired=await redis(['SET',`hp:inquiry:duplicate:${dedup}`,'pending','EX',600,'NX']);
    if(acquired!=='OK')return reply(res,409,'This enquiry was already received recently. Please avoid resubmitting it.');
    const fields=[['Name',d.fullName],['Company',d.company],['Email',d.email],['Phone',d.phone],['Client type',d.clientType],['State',d.state],['City',d.city],['Project type',d.projectType],['Service',d.service],['Schedule',d.schedule],['Preferred contact',d.contactMethod],['Project description',d.description]];
    const body='<h2>New HP Engineering project enquiry</h2>'+fields.map(([k,v])=>`<p><strong>${esc(k)}:</strong> ${esc(v).replace(/\n/g,'<br>')}</p>`).join('');
    try {await email('peterhenry.engineering@gmail.com',`HP Engineering enquiry — ${d.projectType}`,body,d.email);}
    catch(err){await redis(['DEL',`hp:inquiry:duplicate:${dedup}`]);throw err;}
    await redis(['SET',`hp:inquiry:duplicate:${dedup}`,'delivered','EX',86400]);
    // Notification delivery is the acceptance criterion; confirmation is best-effort.
    try {await email(d.email,'We received your HP Engineering enquiry',`<p>Hello ${esc(d.fullName)},</p><p>Thank you for contacting HP Engineering. We have received the information about your ${esc(d.projectType)} project and will review your enquiry.</p><p>HP Engineering<br>peterhenry.engineering@gmail.com</p>`);}catch(_err){/* Avoid logging personal data or disclosing provider details. */}
    return reply(res,200,'Your enquiry was received. Thank you.');
  } catch(_err){return reply(res,503,'We could not submit your enquiry right now. Please email peterhenry.engineering@gmail.com.');}
};
