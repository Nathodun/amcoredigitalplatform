const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const cfg = window.AMCORE_CONFIG || {};

const menuBtn = $('.menu-btn');
const nav = $('.nav');
menuBtn?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
});
nav?.querySelectorAll('a').forEach(a => a.addEventListener('click',()=>nav.classList.remove('open')));

function captureAttribution(){
  const p = new URLSearchParams(location.search);
  const names = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid'];
  const out = {};
  names.forEach(k => { if (p.get(k)) out[k] = p.get(k); });
  try {
    const prev = JSON.parse(sessionStorage.getItem('amcore_attribution') || '{}');
    sessionStorage.setItem('amcore_attribution', JSON.stringify({...prev, ...out}));
  } catch {}
}
captureAttribution();
function attribution(){ try { return JSON.parse(sessionStorage.getItem('amcore_attribution') || '{}'); } catch { return {}; } }

function normalisePostcode(v){ return String(v||'').toUpperCase().replace(/\s+/g,'').trim(); }
function validUKPostcode(v){
  const p = normalisePostcode(v);
  return /^(GIR0AA|(?:[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}))$/.test(p);
}
function outward(v){
  const p = normalisePostcode(v);
  return p.length > 3 ? p.slice(0,-3) : p;
}
function postcodePrefix(v){ return (outward(v).match(/^[A-Z]{1,2}/)||[''])[0]; }
function coverageFor(v){
  if (!validUKPostcode(v)) return {valid:false, type:'invalid', title:'Check that postcode', copy:'Enter a full UK postcode, for example TS1 1AA or SW1A 1AA.'};
  const prefix = postcodePrefix(v);
  const fast = cfg.coverage?.fastTrackOutwardPrefixes || [];
  const specialist = cfg.coverage?.specialistLogisticsPrefixes || [];
  if (fast.includes(prefix)) return {valid:true,type:'fast',title:'North East fast-track area',copy:'This postcode is in Amcore’s core operating region. Remote triage and site-survey scheduling can usually follow the fast-track route.'};
  if (specialist.includes(prefix)) return {valid:true,type:'specialist',title:'Nationwide specialist scheduling',copy:'Amcore can assess projects here, with travel, engineer availability and logistics confirmed before the survey is booked.'};
  return {valid:true,type:'national',title:'Nationwide project coverage',copy:'This postcode can enter Amcore’s national survey route. Delivery is subject to project scope, engineer availability and agreed travel/logistics.'};
}

$$('.postcode-checker').forEach(form => form.addEventListener('submit', e => {
  e.preventDefault();
  const input = $('input[name="postcode"]', form);
  const result = $('.postcode-result', form) || form.nextElementSibling;
  const c = coverageFor(input.value);
  result.innerHTML = `<strong>${c.title}</strong><span>${c.copy}</span>${c.valid ? '<a href="ac-quote.html?postcode='+encodeURIComponent(input.value)+'">Continue to indicative quote →</a>' : ''}`;
  result.className = `postcode-result show ${c.type}`;
  window.amcoreTrack?.('postcode_checked',{coverage:c.type,postcode_area:postcodePrefix(input.value)});
}));

const energyForm = $('#energyForm');
const plannerResult = $('#plannerResult');
energyForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(energyForm);
  const site = data.get('site');
  const goals = data.getAll('goal');
  const size = data.get('size');
  const stack = [];
  let title = 'Start with efficient heating & cooling';
  let copy = 'A survey will confirm capacity, equipment locations and electrical requirements.';
  if (goals.includes('cooling') || goals.includes('heating')) stack.push('Air-to-air heat pump / AC');
  if (goals.includes('heating') && (size === 'large' || site === 'business')) stack.push('Compare air-to-water / VRF options');
  if (goals.includes('solar') || goals.includes('carbon')) stack.push('Solar PV');
  if (goals.includes('battery') || (goals.includes('solar') && goals.includes('reliability'))) stack.push('Battery storage');
  if (goals.includes('reliability')) stack.push('Controls + planned maintenance');
  if (!stack.length) stack.push('Site energy survey','Smart controls','Right-sized HVAC');
  if (site === 'business') {
    title = size === 'complex' ? 'Commercial energy masterplan' : 'Commercial comfort + energy survey';
    copy = 'We recommend a technical survey covering load profile, zones, operating hours, existing plant, controls and electrical capacity before fixing the system architecture.';
  } else if (goals.includes('cooling') && goals.includes('solar')) {
    title = 'Solar-supported all-season comfort';
    copy = 'A high-efficiency air-to-air heat pump can provide cooling and heating, while solar can offset daytime electricity demand. Battery storage may help extend self-use into the evening.';
  } else if (goals.includes('heating') && goals.includes('carbon')) {
    title = 'Low-carbon heating pathway';
    copy = 'We would compare targeted air-to-air heating with an air-to-water heat pump depending on layout, hot-water needs, heat loss and how many zones need simultaneous heat.';
  }
  plannerResult.innerHTML = `<p class="result-kicker">YOUR STARTING POINT</p><h3>${title}</h3><p>${copy}</p><div class="result-stack">${stack.map(x=>`<span>${x}</span>`).join('')}</div><a href="contact.html" class="text-link">Send this plan to Amcore →</a>`;
  window.amcoreTrack?.('energy_fit_complete',{site,size,goals:goals.join('|')});
});

// Indicative AC quotation engine. This is preliminary triage, not an engineering design calculation.
const quoteForm = $('#acQuoteForm');
const quoteResult = $('#quoteResult');
let lastQuote = null;
function roomDuty(fd){
  const length = Math.max(1, Number(fd.get('length')) || 0);
  const width = Math.max(1, Number(fd.get('width')) || 0);
  const height = Math.max(2, Number(fd.get('height')) || 2.4);
  const area = length * width;
  let wpm2 = 80;
  const insulation = fd.get('insulation');
  if (insulation === 'poor') wpm2 *= 1.20;
  if (insulation === 'good') wpm2 *= 0.92;
  const glazing = fd.get('glazing');
  if (glazing === 'large') wpm2 *= 1.18;
  if (glazing === 'very-large') wpm2 *= 1.35;
  const orientation = fd.get('orientation');
  if (orientation === 'south-west') wpm2 *= 1.15;
  const roomType = fd.get('roomType');
  if (roomType === 'kitchen') wpm2 *= 1.22;
  if (roomType === 'conservatory') wpm2 *= 1.45;
  if (roomType === 'server') wpm2 *= 1.70;
  const occupancy = Math.max(1, Number(fd.get('occupancy')) || 2);
  let watts = area * wpm2 * Math.max(1, height/2.4) + Math.max(0, occupancy-2)*120;
  if (fd.get('equipment') === 'high') watts += 700;
  if (fd.get('equipment') === 'medium') watts += 300;
  return {area, kw: watts/1000};
}
function selectUnit(kw){
  const sizes = [2.5,3.5,5.0,7.0,10.0,12.5,14.0];
  return sizes.find(s => s >= kw*1.08) || Math.ceil(kw);
}
function baseInstalled(unit, commercial){
  const domestic = unit <=2.5?1950:unit<=3.5?2150:unit<=5?2550:unit<=7?3150:unit<=10?4300:5200;
  return commercial ? domestic * 1.12 : domestic;
}
function money(n){ return new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(n); }
function buildQuote(fd){
  const site = fd.get('siteType') || 'home';
  const commercial = site === 'commercial';
  const rooms = Math.max(1, Number(fd.get('rooms')) || 1);
  const duty = roomDuty(fd);
  const unit = selectUnit(duty.kw);
  let base = baseInstalled(unit, commercial);
  if (rooms > 1) base += (rooms-1) * (commercial ? 1550 : 1350);
  const pipe = Math.max(0, (Number(fd.get('pipeRun'))||3) - (cfg.quote?.standardPipeMetres||3));
  base += pipe * (cfg.quote?.additionalPipePerMetre||55);
  if (fd.get('access') === 'difficult') base += cfg.quote?.complexAccessAllowance || 350;
  if (fd.get('electrical') === 'upgrade') base += cfg.quote?.electricalAllowance || 180;
  const low = Math.round(base * (cfg.quote?.priceBandLow||.94) / 10) * 10;
  const high = Math.round(base * (cfg.quote?.priceBandHigh||1.14) / 10) * 10;
  const c = coverageFor(fd.get('postcode'));
  const ref = `AC-${new Date().toISOString().slice(2,10).replaceAll('-','')}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
  return {ref, site, commercial, rooms, duty:duty.kw, area:duty.area, unit, low, high, coverage:c};
}
quoteForm?.addEventListener('submit', e => {
  e.preventDefault();
  const fd = new FormData(quoteForm);
  const pc = fd.get('postcode');
  if (!validUKPostcode(pc)) {
    quoteResult.innerHTML = `<div class="quote-alert">Please enter a valid UK postcode before calculating your estimate.</div>`;
    return;
  }
  lastQuote = buildQuote(fd);
  const q = lastQuote;
  const financeLine = cfg.finance?.enabled
    ? `<a href="finance.html?quote=${encodeURIComponent(q.ref)}" class="btn btn-secondary">Explore finance</a>`
    : `<span class="finance-gated">Finance is not being promoted on this prototype until regulatory status and approved wording are verified.</span>`;
  quoteResult.innerHTML = `<p class="result-kicker">INDICATIVE ESTIMATE • ${q.ref}</p><h2>${money(q.low)} – ${money(q.high)}</h2><p class="quote-vat">Domestic estimate shown inclusive of VAT assumptions. Commercial pricing is subject to scope and VAT treatment.</p><div class="quote-metrics"><div><span>Preliminary room duty</span><strong>${q.duty.toFixed(1)} kW</strong></div><div><span>Suggested nominal unit</span><strong>${q.unit} kW</strong></div><div><span>Coverage route</span><strong>${q.coverage.type === 'fast' ? 'North East fast-track' : q.coverage.type === 'national' ? 'National survey' : 'Specialist logistics'}</strong></div></div><p><strong>What this means:</strong> This is a budget range generated from the information supplied. A final design must verify fabric, solar gain, occupancy, equipment heat gains, pipe/drain routes, outdoor-unit position, electrical supply, planning constraints and manufacturer selection.</p><div class="quote-actions"><button type="button" class="btn btn-primary" id="sendQuoteLead">Send estimate to Amcore</button>${financeLine}</div>`;
  window.amcoreTrack?.('ac_quote_complete',{site:q.site,rooms:q.rooms,estimated_kw:Number(q.duty.toFixed(1)),unit_kw:q.unit,quote_low:q.low,quote_high:q.high,coverage:q.coverage.type});
  $('#leadCapture')?.scrollIntoView({behavior:'smooth',block:'start'});
});

document.addEventListener('click', e => {
  if (e.target.id === 'sendQuoteLead') {
    $('#leadCapture')?.scrollIntoView({behavior:'smooth',block:'start'});
    $('#quoteReference').value = lastQuote?.ref || '';
    window.amcoreTrack?.('lead_capture_open',{source:'ac_quote'});
  }
});

async function submitLead(form){
  const fd = new FormData(form);
  const payload = Object.fromEntries(fd.entries());
  Object.assign(payload, attribution());
  if (lastQuote) Object.assign(payload,{quoteReference:lastQuote.ref,quoteLow:lastQuote.low,quoteHigh:lastQuote.high,estimatedKw:lastQuote.duty.toFixed(1)});
  payload.source = form.dataset.formType || location.pathname;
  const msg = $('.form-msg', form);
  const endpoint = cfg.crm?.endpoint;
  if (!endpoint) {
    msg.textContent = 'Form architecture is ready. Connect the CRM endpoint in config.js before launch; no personal data has been transmitted from this prototype.';
    window.amcoreTrack?.('lead_form_demo',{source:payload.source});
    return;
  }
  try {
    const r = await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
    if (!r.ok) throw new Error('submission failed');
    msg.textContent = 'Thank you. Your enquiry has been sent to Amcore.';
    form.reset();
    window.amcoreTrack?.('lead_submit',{source:payload.source,project_type:payload.projectType||''});
  } catch {
    msg.textContent = 'We could not send the form. Please call 07879 321514 or email info@amcorelimited.co.uk.';
  }
}
$$('.crm-lead-form').forEach(form => form.addEventListener('submit', e => { e.preventDefault(); submitLead(form); }));

// Pre-fill quote page postcode from coverage checker.
if (quoteForm) {
  const p = new URLSearchParams(location.search).get('postcode');
  if (p) $('input[name="postcode"]', quoteForm).value = p;
  window.amcoreTrack?.('quote_start',{source:document.referrer ? 'referral' : 'direct'});
}

// Accreditation rendering: empty by default so unverified badges never appear.
const accList = $('#verifiedAccreditations');
if (accList) {
  const items = cfg.accreditations?.verified || [];
  accList.innerHTML = items.length ? items.map(x=>`<article class="verify-card"><strong>${x.name}</strong><p>Registration: ${x.registrationNumber||'Verified'}</p><a href="${x.registerUrl}" rel="noopener" target="_blank">Check register ↗</a></article>`).join('') : `<article class="verify-card pending"><strong>Trade certification display is gated</strong><p>No trade badge is displayed until Amcore’s company-level registration or an applicable engineer credential has been checked against the issuing body’s register and approved for website use.</p></article>`;
}
