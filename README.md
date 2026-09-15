# TopoGTP

Assistente tecnico web per topografi con base di conoscenza condivisa.

## Stato attuale

- Interfaccia responsive con scroll corretto.
- Assistente che cerca nelle procedure del team.
- Base di conoscenza con titolo, categoria, autore, tag e contenuto.
- Inserimento, modifica, eliminazione, ricerca, import/export JSON.
- Autenticazione utenti tramite Supabase Auth.
- Database PostgreSQL Supabase con Row Level Security.
- Aggiornamenti realtime tra colleghi.
- Migrazione automatica una tantum delle conoscenze locali verso il database centrale.
- Modalita locale di emergenza quando il database non e configurato.
- Pubblicazione GitHub Pages attivata tramite GitHub Actions.

## File principali

- `index.html` — ingresso dell'app.
- `app.html` — interfaccia TopoGTP e client Supabase.
- `config.js` — configurazione guidata del database.
- `supabase-schema.sql` — schema, RLS, trigger, indici, realtime e dati iniziali.

## Database

Tabella principale: `public.knowledge_entries`.

Gli utenti autenticati possono leggere, inserire, modificare ed eliminare le conoscenze del team. Realtime aggiorna automaticamente i dispositivi connessi quando una voce cambia.
