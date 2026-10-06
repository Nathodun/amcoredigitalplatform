// Example Vercel-style serverless lead handler.
// Set CRM_WEBHOOK_URL as a server-side environment variable. Never expose CRM secrets in browser JS.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  const body = req.body || {};
  const allowed = ['name','phone','email','postcode','projectType','buildingType','message','quoteReference','quoteLow','quoteHigh','estimatedKw','source','utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid','marketingConsent'];
  const lead = Object.fromEntries(allowed.filter(k => body[k] !== undefined).map(k => [k, String(body[k]).slice(0, 4000)]));
  if (!lead.name || (!lead.email && !lead.phone)) return res.status(400).json({ ok:false, error:'Name and a contact method are required' });
  const target = process.env.CRM_WEBHOOK_URL;
  if (!target) return res.status(503).json({ ok:false, error:'CRM webhook not configured' });
  try {
    const r = await fetch(target, { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({...lead, receivedAt:new Date().toISOString()}) });
    if (!r.ok) throw new Error(`CRM returned ${r.status}`);
    return res.status(200).json({ok:true});
  } catch (err) {
    console.error(err);
    return res.status(502).json({ok:false, error:'Lead delivery failed'});
  }
}
