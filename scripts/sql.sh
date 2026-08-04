#!/bin/bash
# Führt SQL über die Supabase-Verwaltungs-API aus
TOKEN=$(grep SUPABASE_ACCESS_TOKEN "$(dirname "$0")/../.env.local" | cut -d= -f2-)
python3 -c "
import json,sys
print(json.dumps({'query': sys.stdin.read()}))" | \
curl -s --max-time 60 -X POST "https://api.supabase.com/v1/projects/qfqudxzqortldyhxzuyf/database/query" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d @-
