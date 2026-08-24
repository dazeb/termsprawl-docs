#!/usr/bin/env bash
# Publish the termsprawl-docs SPA to hermes-box and update only its managed
# Caddy block. Mirrors termsprawl-web's pattern: CI-friendly (SSH_KEY/SSH_EXTRA
# overridable via env), ssh+tar (no rsync/scp), Caddy validate + reload with a
# backup restore on failure.
set -euo pipefail

repo_root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
readonly repo_root
readonly ssh_key="${SSH_KEY:-$HOME/.ssh/hermes-box_ed25519}"
readonly ssh_extra="${SSH_EXTRA:-}"
readonly remote="root@178.104.6.193"
readonly remote_root="/var/www/termsprawl-docs"
readonly caddy_fragment="$repo_root/scripts/termsprawl-docs.Caddyfile"

cd "$repo_root"
pnpm build

test -f "$repo_root/build/client/index.html"
test -f "$caddy_fragment"

ssh -i "$ssh_key" -o BatchMode=yes ${ssh_extra} "$remote" "install -d -m 0755 '$remote_root'"

# Non-destructive stream (keeps stale hashed assets); index.html overwritten.
tar -C "$repo_root/build/client" -czf - . \
  | ssh -i "$ssh_key" -o BatchMode=yes ${ssh_extra} "$remote" "tar -xzf - -C '$remote_root'"

remote_fragment=$(mktemp)
trap 'rm -f "$remote_fragment"' EXIT
ssh -i "$ssh_key" -o BatchMode=yes ${ssh_extra} "$remote" "cat > '$remote_fragment'" < "$caddy_fragment"

ssh -i "$ssh_key" -o BatchMode=yes ${ssh_extra} "$remote" \
  "python3 - '$remote_fragment'" <<'PY'
from pathlib import Path
import re, shutil, subprocess, sys

fragment_path = Path(sys.argv[1])
caddyfile = Path('/etc/caddy/Caddyfile')
fragment = fragment_path.read_text()
original = caddyfile.read_text()
backup = Path('/etc/caddy/Caddyfile.bak.termsprawl-docs')
shutil.copy2(caddyfile, backup)

pattern = r'\n?# BEGIN managed termsprawl-docs\n.*?# END managed termsprawl-docs\n?'
updated, replacements = re.subn(pattern, '\n' + fragment + '\n', original, flags=re.DOTALL)
if replacements == 0:
    updated = original.rstrip() + '\n\n' + fragment
elif replacements != 1:
    raise SystemExit(f'Expected at most one managed block, found {replacements}')

try:
    caddyfile.write_text(updated)
    subprocess.run(['caddy', 'validate', '--config', str(caddyfile)], check=True)
    subprocess.run(['caddy', 'reload', '--config', str(caddyfile)], check=True)
except Exception:
    shutil.copy2(backup, caddyfile)
    subprocess.run(['caddy', 'validate', '--config', str(caddyfile)], check=True)
    subprocess.run(['caddy', 'reload', '--config', str(caddyfile)], check=True)
    raise
finally:
    fragment_path.unlink(missing_ok=True)
PY

ssh -i "$ssh_key" -o BatchMode=yes ${ssh_extra} "$remote" \
  "test -f '$remote_root/index.html' && test \"\$(systemctl is-active caddy)\" = active && caddy validate --config /etc/caddy/Caddyfile"
