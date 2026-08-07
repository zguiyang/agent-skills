#!/usr/bin/env python3
"""Resolve AdonisJS official doc topics to URLs and optional live text."""

from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX_PATH = ROOT / "assets" / "doc-index.json"
URLS_PATH = ROOT / "assets" / "doc-urls.txt"
REFS = ROOT / "references"
DOCS_BASE = "https://docs.adonisjs.com"


def load_index() -> list[dict]:
    if INDEX_PATH.exists():
        return json.loads(INDEX_PATH.read_text())
    urls = URLS_PATH.read_text().splitlines() if URLS_PATH.exists() else []
    out = []
    for u in urls:
        u = u.strip()
        if not u:
            continue
        slug = u.replace(DOCS_BASE + "/", "").strip("/") or ""
        out.append({"slug": slug or "home", "url": u, "title": slug or "home"})
    return out


def tokenize(q: str) -> list[str]:
    return [t for t in re.split(r"[^a-z0-9]+", q.lower()) if t]


def score(item: dict, tokens: list[str]) -> int:
    hay = f"{item.get('slug', '')} {item.get('url', '')} {item.get('title', '')}".lower()
    s = 0
    for t in tokens:
        if t in hay:
            s += 3 if t in item.get("slug", "").lower() else 1
    # light boosts for common aliases
    aliases = {
        "orm": "lucid",
        "db": "database",
        "validator": "validation",
        "validate": "validation",
        "test": "testing",
        "tests": "testing",
        "cli": "ace",
        "command": "ace",
        "upgrade": "v6-to-v7",
    }
    for t in tokens:
        mapped = aliases.get(t)
        if mapped and mapped in hay:
            s += 2
    return s


def resolve(query: str, limit: int = 8) -> list[dict]:
    q = query.strip()
    if q.startswith("http://") or q.startswith("https://"):
        return [{"slug": q, "url": q, "title": q, "_score": 100}]
    if q.startswith("/") or q.startswith("guides/") or q.startswith("reference/") or q.startswith("tutorial/"):
        slug = q.lstrip("/")
        return [{"slug": slug, "url": f"{DOCS_BASE}/{slug}", "title": slug, "_score": 100}]
    tokens = tokenize(q)
    ranked = []
    for item in load_index():
        sc = score(item, tokens)
        if sc:
            ranked.append({**item, "_score": sc})
    ranked.sort(key=lambda x: (-x["_score"], x.get("slug", "")))
    return ranked[:limit]


def local_excerpt(slug: str, max_chars: int = 2500) -> str | None:
    # Map slug to section reference files
    section_files = {
        "guides/basics": "http-basics.md",
        "guides/frontend": "frontend.md",
        "guides/database": "database.md",
        "guides/auth": "auth.md",
        "guides/security": "security.md",
        "guides/concepts": "concepts.md",
        "guides/digging-deeper": "digging-deeper.md",
        "guides/ace": "ace-cli.md",
        "guides/testing": "testing.md",
        "tutorial": "tutorial.md",
        "reference": "reference.md",
        "v6-to-v7": "upgrade-v6-to-v7.md",
    }
    ref_name = None
    for prefix, name in section_files.items():
        if slug.startswith(prefix) or slug == prefix:
            ref_name = name
            break
    if ref_name is None:
        start_slugs = {
            "introduction",
            "installation",
            "folder-structure",
            "stacks-and-starter-kits",
            "dev-environment",
            "configuration",
            "deployment",
            "faqs",
            "releases",
            "contributing",
            "governance",
        }
        if slug in start_slugs:
            ref_name = "getting-started.md"
    if not ref_name:
        return None
    path = REFS / ref_name
    if not path.exists():
        return None
    text = path.read_text(errors="replace")
    marker = f"### {slug}"
    if marker in text:
        chunk = text.split(marker, 1)[1]
        chunk = chunk.split("\n### ", 1)[0]
        chunk = chunk.strip()
        if len(chunk) > max_chars:
            chunk = chunk[:max_chars] + "\n…\n"
        return chunk
    return text[:max_chars] + ("\n…\n" if len(text) > max_chars else "")


def fetch_url(url: str, timeout: int = 45) -> str:
    # Prefer Jina reader for markdown; fall back to raw HTML text
    headers = {"User-Agent": "adonisjs/1.0"}
    for target in (f"https://r.jina.ai/{url}", url):
        try:
            req = urllib.request.Request(target, headers=headers)
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                raw = resp.read().decode("utf-8", errors="replace")
            if "Markdown Content:" in raw:
                raw = raw.split("Markdown Content:", 1)[1]
            raw = re.sub(r"\n{3,}", "\n\n", raw).strip()
            if len(raw) > 400:
                return raw
        except Exception:
            continue
    raise RuntimeError(f"Failed to fetch {url}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Look up AdonisJS official docs")
    parser.add_argument("query", help="topic keywords, slug, or full docs URL")
    parser.add_argument("--fetch", action="store_true", help="download latest page text")
    parser.add_argument("--limit", type=int, default=8)
    parser.add_argument("--max-chars", type=int, default=6000)
    args = parser.parse_args()

    hits = resolve(args.query, limit=args.limit)
    if not hits:
        print("No matches. Browse references/docs-index.md or open https://docs.adonisjs.com")
        return 1

    print(f"Pinned docs base: {DOCS_BASE} (AdonisJS v7)\n")
    print("Matches:")
    for i, h in enumerate(hits, 1):
        print(f"  {i}. {h.get('url')}  (score={h.get('_score')}, slug={h.get('slug')})")

    top = hits[0]
    slug = top.get("slug", "")
    print("\n--- Local excerpt ---\n")
    excerpt = local_excerpt(slug if not str(slug).startswith("http") else "")
    if excerpt:
        print(excerpt)
    else:
        print("(no local excerpt; use --fetch or open the URL)")

    if args.fetch:
        print("\n--- Live fetch ---\n")
        try:
            text = fetch_url(top["url"])
            if len(text) > args.max_chars:
                text = text[: args.max_chars] + "\n…\n"
            print(text)
        except Exception as e:
            print(f"Live fetch failed: {e}", file=sys.stderr)
            return 1
    else:
        print("\nTip: re-run with --fetch to pull the latest official page.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
