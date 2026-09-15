// Configurazione TopoGTP.
// I valori SUPABASE_URL e SUPABASE_ANON_KEY sono pubblici per natura nelle web app.
// La sicurezza e' gestita dalle policy RLS del database, non nascondendo questa chiave.
window.TOPOGTP_CONFIG = {
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: "",
  APP_NAME: "TopoGTP",
  KNOWLEDGE_TABLE: "knowledge_entries"
};
