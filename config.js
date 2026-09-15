// TopoGTP - configurazione database condiviso.
// Project URL e Publishable key sono valori pubblici per natura nelle web app.
// La sicurezza effettiva e' gestita dalle policy RLS di Supabase.
(function () {
  const STORAGE_KEY = 'topogtp_supabase_config_v1';
  const CONFIG_VERSION_KEY = 'topogtp_team_config_version';
  const CONFIG_VERSION = '2026-09-15-v2';
  const DEFAULT_URL = 'https://uxlofvwwutklgvsyadzxp.supabase.co';
  const DEFAULT_KEY = 'sb_publishable_YL_FuQLIl1gXJc7wX7JrmA_W1dR9iXx';

  // Elimina una sola volta eventuali vecchi override salvati nel browser.
  // Questo evita che un URL/chiave inseriti durante i test precedenti sostituiscano
  // la configurazione ufficiale del database del team.
  try {
    if (localStorage.getItem(CONFIG_VERSION_KEY) !== CONFIG_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(CONFIG_VERSION_KEY, CONFIG_VERSION);
    }
  } catch (_) {}

  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch (_) {}

  window.TOPOGTP_CONFIG = {
    SUPABASE_URL: saved.SUPABASE_URL || DEFAULT_URL,
    SUPABASE_ANON_KEY: saved.SUPABASE_ANON_KEY || DEFAULT_KEY,
    APP_NAME: 'TopoGTP',
    KNOWLEDGE_TABLE: 'knowledge_entries'
  };

  function addSetupButton() {
    if (document.getElementById('topogtp-db-setup')) return;
    const btn = document.createElement('button');
    btn.id = 'topogtp-db-setup';
    btn.textContent = '⚙ Database team';
    btn.style.cssText = 'position:fixed;left:18px;bottom:18px;z-index:90;border:1px solid #284d6c;background:#0d2234;color:#eaf6ff;border-radius:12px;padding:10px 12px;cursor:pointer;box-shadow:0 12px 30px rgba(0,0,0,.35)';
    btn.onclick = showSetup;
    document.body.appendChild(btn);
  }

  function showSetup() {
    const old = document.getElementById('topogtp-db-modal');
    if (old) old.remove();
    const cfg = window.TOPOGTP_CONFIG || {};
    const wrap = document.createElement('div');
    wrap.id = 'topogtp-db-modal';
    wrap.style.cssText = 'position:fixed;z-index:120;inset:0;background:rgba(2,8,14,.88);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:18px';
    wrap.innerHTML = `
      <div style="width:min(520px,100%);background:#0b1b2b;border:1px solid #24445f;border-radius:20px;padding:22px;color:#eef7ff;box-shadow:0 24px 60px rgba(0,0,0,.45);font-family:Inter,Segoe UI,Arial,sans-serif">
        <h2 style="margin:0 0 7px">Database condiviso TopoGTP</h2>
        <p style="margin:0 0 16px;color:#96adc1;line-height:1.5">TopoGTP e' gia collegato al database centrale del team. Usa questi campi solo se in futuro vuoi cambiare progetto Supabase.</p>
        <label style="display:block;font-size:12px;color:#96adc1;font-weight:700;margin:9px 0 6px">Project URL</label>
        <input id="tgSupabaseUrl" value="${String(cfg.SUPABASE_URL || '').replace(/"/g,'&quot;')}" style="width:100%;background:#071521;border:1px solid #24445f;color:#fff;border-radius:11px;padding:11px 12px;outline:none">
        <label style="display:block;font-size:12px;color:#96adc1;font-weight:700;margin:12px 0 6px">Publishable key</label>
        <textarea id="tgSupabaseKey" style="width:100%;min-height:92px;resize:vertical;background:#071521;border:1px solid #24445f;color:#fff;border-radius:11px;padding:11px 12px;outline:none">${String(cfg.SUPABASE_ANON_KEY || '').replace(/</g,'&lt;')}</textarea>
        <div style="display:flex;gap:9px;margin-top:15px;flex-wrap:wrap">
          <button id="tgSaveDb" style="border:0;border-radius:11px;padding:11px 13px;background:#38bdf8;color:#03131d;font-weight:800;cursor:pointer">Salva e collega</button>
          <button id="tgCloseDb" style="border:1px solid #24445f;border-radius:11px;padding:11px 13px;background:#10243a;color:#fff;cursor:pointer">Chiudi</button>
          <button id="tgResetDb" style="margin-left:auto;border:1px solid #62303a;border-radius:11px;padding:11px 13px;background:#351820;color:#ffd7dc;cursor:pointer">Ripristina database team</button>
        </div>
        <div id="tgDbMsg" style="font-size:12px;color:#96adc1;margin-top:12px;line-height:1.45">Non inserire mai service_role o chiavi segrete.</div>
      </div>`;
    document.body.appendChild(wrap);
    document.getElementById('tgCloseDb').onclick = () => wrap.remove();
    document.getElementById('tgResetDb').onclick = () => {
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
      location.reload();
    };
    document.getElementById('tgSaveDb').onclick = () => {
      const url = document.getElementById('tgSupabaseUrl').value.trim().replace(/\/$/, '');
      const key = document.getElementById('tgSupabaseKey').value.trim();
      const msg = document.getElementById('tgDbMsg');
      if (!/^https:\/\/.+\.supabase\.co$/i.test(url)) {
        msg.textContent = 'Project URL non valido.';
        msg.style.color = '#ff9ca7';
        return;
      }
      if (!key.startsWith('sb_publishable_')) {
        msg.textContent = 'Usa la Publishable key che inizia con sb_publishable_.';
        msg.style.color = '#ff9ca7';
        return;
      }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ SUPABASE_URL:url, SUPABASE_ANON_KEY:key })); } catch (_) {}
      msg.textContent = 'Configurazione salvata. Ricarico TopoGTP…';
      msg.style.color = '#2ee6a6';
      setTimeout(() => location.reload(), 350);
    };
  }

  window.addEventListener('DOMContentLoaded', addSetupButton);

  // Migrazione una tantum delle conoscenze locali verso il database centrale.
  window.addEventListener('load', () => {
    let attempts = 0;
    const timer = setInterval(async () => {
      attempts++;
      try {
        if (typeof db !== 'undefined' && typeof user !== 'undefined' && db && user) {
          clearInterval(timer);
          if (localStorage.getItem('topogtp_migrated_to_supabase_v1') === '1') return;
          let local = [];
          try { local = JSON.parse(localStorage.getItem('topogtp_knowledge_v3') || '[]'); } catch (_) {}
          if (!Array.isArray(local) || !local.length) {
            localStorage.setItem('topogtp_migrated_to_supabase_v1','1');
            return;
          }
          const table = window.TOPOGTP_CONFIG.KNOWLEDGE_TABLE || 'knowledge_entries';
          const { data: remote, error } = await db.from(table).select('title,body');
          if (error) return;
          const seen = new Set((remote || []).map(x => `${String(x.title).trim().toLowerCase()}||${String(x.body).trim().toLowerCase()}`));
          for (const x of local) {
            if (!x || !x.title || !x.body) continue;
            const sig = `${String(x.title).trim().toLowerCase()}||${String(x.body).trim().toLowerCase()}`;
            if (seen.has(sig)) continue;
            const row = {
              title: String(x.title).trim(),
              category: x.category || 'Altro',
              author_name: x.author_name || x.author || user.user_metadata?.full_name || user.email || 'Collega',
              tags: Array.isArray(x.tags) ? x.tags : [],
              body: String(x.body).trim(),
              created_by: user.id
            };
            const { error: insertError } = await db.from(table).insert(row);
            if (!insertError) seen.add(sig);
          }
          localStorage.setItem('topogtp_migrated_to_supabase_v1','1');
          if (typeof loadRemote === 'function') await loadRemote();
        }
      } catch (_) {}
      if (attempts >= 25) clearInterval(timer);
    }, 800);
  });
})();
