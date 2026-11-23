(() => {
  if (!/\.github\.io$/.test(location.hostname)) return;
  let current = document.querySelector('meta[name="portfolio-version"]')?.content || null;
  const key = 'portfolio-reload-position';
  try { const old = JSON.parse(sessionStorage.getItem(key) || 'null');
    if (old && Date.now() - old.time < 60000) { requestAnimationFrame(() => scrollTo(0, old.y)); sessionStorage.removeItem(key); }
  } catch {}
  async function check() {
    if (document.hidden) return;
    try { const res = await fetch('site-version.json?t=' + Date.now(), {cache:'no-store'});
      if (!res.ok) return;
      const next = (await res.json()).version;
      if (current && next !== current) {
        sessionStorage.setItem(key, JSON.stringify({y:scrollY,time:Date.now()}));
        location.reload(); return;
      }
      current = next;
    } catch {}
  }
  check(); setInterval(check,30000);
})();