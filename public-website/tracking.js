(() => {
  const cfg = window.AMCORE_CONFIG || {};
  const KEY = 'amcore_consent_v1';
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };

  // Google Consent Mode defaults before measurement tags are loaded.
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500
  });

  function getConsent(){
    try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; }
  }
  function saveConsent(c){ localStorage.setItem(KEY, JSON.stringify({...c, ts: Date.now()})); }

  function loadGoogle(){
    const id = cfg.tracking?.googleTagId;
    if (!id || document.querySelector('script[data-amcore-google]')) return;
    const s = document.createElement('script');
    s.async = true; s.dataset.amcoreGoogle = '1';
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(s);
    window.gtag('js', new Date());
    window.gtag('config', id, { anonymize_ip: true });
  }
  function loadMeta(){
    const id = cfg.tracking?.metaPixelId;
    if (!id || window.fbq) return;
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', id); fbq('track', 'PageView');
  }
  function applyConsent(c){
    const analytics = !!c?.analytics;
    const marketing = !!c?.marketing;
    window.gtag('consent', 'update', {
      analytics_storage: analytics ? 'granted' : 'denied',
      ad_storage: marketing ? 'granted' : 'denied',
      ad_user_data: marketing ? 'granted' : 'denied',
      ad_personalization: marketing ? 'granted' : 'denied'
    });
    if (analytics || marketing) loadGoogle();
    if (marketing) loadMeta();
  }

  window.amcoreTrack = function(name, params={}){
    const c = getConsent();
    if (c?.analytics && cfg.tracking?.googleTagId) window.gtag('event', name, params);
    if (c?.marketing && window.fbq) window.fbq('trackCustom', name, params);
  };

  function closeBanner(){ document.querySelector('.cookie-banner')?.remove(); }
  function setConsent(c){ saveConsent(c); applyConsent(c); closeBanner(); }

  function showBanner(){
    if (getConsent()) return;
    const el = document.createElement('div');
    el.className = 'cookie-banner';
    el.innerHTML = `<div><strong>Your privacy choices</strong><p>We use necessary storage to run the site. With your permission, analytics helps us improve it and marketing technology helps measure advertising. You can reject non-essential tracking.</p><a href="privacy.html#cookies">Privacy & cookies</a></div><div class="cookie-actions"><button class="btn btn-secondary" data-consent="reject">Reject non-essential</button><button class="btn btn-secondary" data-consent="analytics">Analytics only</button><button class="btn btn-primary" data-consent="all">Accept all</button></div>`;
    document.body.appendChild(el);
    el.addEventListener('click', e => {
      const v = e.target?.dataset?.consent;
      if (v === 'reject') setConsent({analytics:false, marketing:false});
      if (v === 'analytics') setConsent({analytics:true, marketing:false});
      if (v === 'all') setConsent({analytics:true, marketing:true});
    });
  }

  const existing = getConsent();
  if (existing) applyConsent(existing);
  document.addEventListener('DOMContentLoaded', showBanner);

  document.addEventListener('click', e => {
    const phone = e.target.closest('a[href^="tel:"]');
    const mail = e.target.closest('a[href^="mailto:"]');
    if (phone) window.amcoreTrack('click_phone', {location: location.pathname});
    if (mail) window.amcoreTrack('click_email', {location: location.pathname});
  });
})();
