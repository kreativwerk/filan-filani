<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Supabase-Zugriff (Entwicklung)

Datenbank-Änderungen laufen über die Supabase-Verwaltungs-API:

```bash
echo "select 1;" | scripts/sql.sh
```

`scripts/sql.sh` liest `SUPABASE_ACCESS_TOKEN` aus `.env.local` (gitignored, nie
committen — der Token gilt für das gesamte Supabase-Konto). Neue Migrationen
gehören zusätzlich als Datei nach `supabase/migrations/`, damit der Schema-Stand
im Repo nachvollziehbar bleibt.
