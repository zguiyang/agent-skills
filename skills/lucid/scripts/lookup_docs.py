#!/usr/bin/env python3
"""Generic official-docs lookup for Knowledge-to-Skill generated Skills.

Configure DOCS_BASE (and optional aliases) per skill. Reads assets/doc-index.json.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX_PATH = ROOT / "assets" / "doc-index.json"
URLS_PATH = ROOT / "assets" / "doc-urls.txt"
REFS = ROOT / "references"

# --- skill-specific config (edit when copying into a skill) ---
DOCS_BASE = os.environ.get("SKILL_DOCS_BASE", "https://lucid.adonisjs.com")
DOCS_LABEL = os.environ.get("SKILL_DOCS_LABEL", "Lucid docs")
USER_AGENT = "knowledge-to-skill-lookup/1.0"
ALIASES: dict[str, str] = {
    "orm": "models",
    "model": "models",
    "migration": "migrations",
    "schema": "schema-generation",
    "relation": "relationships",
    "relations": "relationships",
    "query": "select-query-builder",
    "factory": "model-factories",
    "hook": "model-hooks",
    "hooks": "model-hooks",
    "trx": "transactions",
    "transaction": "transactions",
    "seed": "seeders",
    "crud": "crud-operations",
}
SECTION_FILES: dict[str, str] = {
    "docs/introduction": "getting-started.md",
    "docs/installation": "getting-started.md",
    "docs/configuration": "getting-started.md",
    "docs/commands": "getting-started.md",
    "docs/database-service": "database-service.md",
    "docs/transactions": "database-service.md",
    "docs/pagination": "database-service.md",
    "docs/debugging": "database-service.md",
    "docs/connection-manager": "database-service.md",
    "docs/validation": "database-service.md",
    "docs/models": "models.md",
    "docs/crud-operations": "models.md",
    "docs/model-hooks": "models.md",
    "docs/model-query-builder": "models.md",
    "docs/model-query-scopes": "models.md",
    "docs/serializing-models": "models.md",
    "docs/relationships": "relationships.md",
    "docs/belongs-to": "relationships.md",
    "docs/has-one": "relationships.md",
    "docs/has-many": "relationships.md",
    "docs/has-many-through": "relationships.md",
    "docs/many-to-many": "relationships.md",
    "docs/migrations": "migrations-schema.md",
    "docs/schema-builder": "migrations-schema.md",
    "docs/table-builder": "migrations-schema.md",
    "docs/schema-classes": "migrations-schema.md",
    "docs/schema-generation": "migrations-schema.md",
    "docs/schema-dumps": "migrations-schema.md",
    "docs/select-query-builder": "query-builders.md",
    "docs/insert-query-builder": "query-builders.md",
    "docs/update-and-delete-queries": "query-builders.md",
    "docs/raw-query-builder": "query-builders.md",
    "docs/seeders": "seeders-factories.md",
    "docs/model-factories": "seeders-factories.md",
    "docs/testing": "testing.md",
}
# --- end config ---


def to_md_url(url: str) -> str:
    if not url.startswith("http"):
        return url
    if url.endswith(".md"):
        return url
    return url.rstrip("/") + ".md"


def load_index() -> list[dict]:
    if INDEX_PATH.exists():
        return json.loads(INDEX_PATH.read_text(encoding="utf-8"))
    urls = URLS_PATH.read_text(encoding="utf-8").splitlines() if URLS_PATH.exists() else []
    out: list[dict] = []
    for u in urls:
        u = u.strip()
        if not u:
            continue
        md = to_md_url(u)
        slug = md.replace(DOCS_BASE.rstrip("/") + "/", "").removesuffix(".md").strip("/") or "home"
        out.append({"slug": slug, "url": md, "title": slug})
    return out


def tokenize(q: str) -> list[str]:
    return [t for t in re.split(r"[^a-z0-9]+", q.lower()) if t]


def score(item: dict, tokens: list[str]) -> int:
    hay = f"{item.get('slug', '')} {item.get('url', '')} {item.get('title', '')} {item.get('section', '')}".lower()
    s = 0
    for t in tokens:
        if t in hay:
            s += 3 if t in item.get("slug", "").lower() else 1
        mapped = ALIASES.get(t)
        if mapped and mapped in hay:
            s += 2
    return s


def resolve(query: str, limit: int = 8) -> list[dict]:
    q = query.strip()
    if q.startswith("http://") or q.startswith("https://"):
        md = to_md_url(q)
        return [{"slug": md, "url": md, "title": md, "_score": 100}]
    if "/" in q or q.endswith(".md"):
        slug = q.lstrip("/").removesuffix(".md")
        return [{"slug": slug, "url": f"{DOCS_BASE.rstrip('/')}/{slug}.md", "title": slug, "_score": 100}]
    tokens = tokenize(q)
    ranked: list[dict] = []
    for item in load_index():
        sc = score(item, tokens)
        if sc:
            ranked.append({**item, "url": to_md_url(item["url"]), "_score": sc})
    ranked.sort(key=lambda x: (-x["_score"], x.get("slug", "")))
    return ranked[:limit]


def local_excerpt(slug: str, max_chars: int = 2500) -> str | None:
    slug = slug.replace(DOCS_BASE.rstrip("/") + "/", "").removesuffix(".md").lstrip("/")
    ref_name = None
    for prefix, name in SECTION_FILES.items():
        if slug.startswith(prefix) or slug == prefix:
            ref_name = name
            break
    if not ref_name:
        return None
    path = REFS / ref_name
    if not path.exists():
        return None
    text = path.read_text(encoding="utf-8", errors="replace").strip()
    if len(text) > max_chars:
        return text[:max_chars] + "\n…\n"
    return text


def fetch_url(url: str, timeout: int = 45) -> str:
    headers = {"User-Agent": USER_AGENT}
    md_url = to_md_url(url)
    candidates = [md_url, f"https://r.jina.ai/{md_url}", url]
    errors: list[str] = []
    for target in candidates:
        try:
            req = urllib.request.Request(target, headers=headers)
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                raw = resp.read().decode("utf-8", errors="replace")
            if "Markdown Content:" in raw:
                raw = raw.split("Markdown Content:", 1)[1]
            raw = re.sub(r"\n{3,}", "\n\n", raw).strip()
            if len(raw) > 400:
                return raw
            errors.append(f"too short from {target}")
        except Exception as exc:  # noqa: BLE001
            errors.append(f"{target}: {exc}")
    raise RuntimeError(f"Failed to fetch {url}; tried={errors}")


def main() -> int:
    parser = argparse.ArgumentParser(description=f"Look up {DOCS_LABEL}")
    parser.add_argument("query", help="topic keywords, slug, or full docs URL")
    parser.add_argument("--fetch", action="store_true", help="download latest official Markdown")
    parser.add_argument("--limit", type=int, default=8)
    parser.add_argument("--max-chars", type=int, default=6000)
    args = parser.parse_args()

    hits = resolve(args.query, limit=args.limit)
    if not hits:
        print(f"No matches. Browse references/docs-index.md or open {DOCS_BASE}")
        return 1

    print(f"Pinned docs base: {DOCS_BASE} ({DOCS_LABEL})\n")
    print("Matches:")
    for i, h in enumerate(hits, 1):
        print(f"  {i}. {h.get('url')}  (score={h.get('_score')}, slug={h.get('slug')})")

    top = hits[0]
    slug = str(top.get("slug", ""))
    print("\n--- Local cheat-sheet ---\n")
    excerpt = local_excerpt(slug if not slug.startswith("http") else "")
    print(excerpt or "(no local cheat-sheet; use --fetch or open the URL)")

    if args.fetch:
        print("\n--- Live fetch ---\n")
        try:
            text = fetch_url(top["url"])
            if len(text) > args.max_chars:
                text = text[: args.max_chars] + "\n…\n"
            print(text)
        except Exception as exc:  # noqa: BLE001
            print(f"Live fetch failed: {exc}", file=sys.stderr)
            return 1
    else:
        print("\nTip: re-run with --fetch to pull the latest official .md page.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
