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

## File principali

- `index.html` — ingresso dell'app.
- `app.html` — interfaccia TopoGTP e client Supabase.
- `config.js` — configurazione guidata del database.
- `supabase-schema.sql` — schema, RLS, trigger, indici, realtime e dati iniziali.

## Collegamento a Supabase

1. Crea o scegli un progetto Supabase.
2. Esegui `supabase-schema.sql` nel SQL Editor del progetto.
3. Nel progetto apri **Connect** e copia **Project URL** e **Publishable key** (`sb_publishable_...`).
4. Apri TopoGTP e premi **Database team** in basso a sinistra.
5. Incolla URL e Publishable key e premi **Salva e collega**.
6. Crea il primo account TopoGTP. Gli altri colleghi potranno usare il proprio account.

Non usare mai nel browser una Secret key / `service_role`. La sicurezza dei dati client e gestita dalle policy RLS definite nello schema.

## Database

Tabella principale: `public.knowledge_entries`.

Gli utenti autenticati possono leggere, inserire, modificare ed eliminare le conoscenze del team. Realtime aggiorna automaticamente i dispositivi connessi quando una voce cambia.
