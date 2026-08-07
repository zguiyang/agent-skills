#!/usr/bin/env python3
"""Resolve AdonisJS official doc topics to URLs and optional live Markdown."""

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


def to_md_url(url: str) -> str:
    if not url.startswith("http"):
        return url
    if url.endswith(".md"):
        return url
    return url.rstrip("/") + ".md"


def load_index() -> list[dict]:
    if INDEX_PATH.exists():
        return json.loads(INDEX_PATH.read_text())
    urls = URLS_PATH.read_text().splitlines() if URLS_PATH.exists() else []
    out = []
    for u in urls:
        u = u.strip()
        if not u:
            continue
        md = to_md_url(u)
        slug = md.replace(DOCS_BASE + "/", "").removesuffix(".md").strip("/") or "home"
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
        "auth": "auth",
        "login": "session-guard",
        "token": "access-tokens",
        "jwt": "access-tokens",
    }
    for t in tokens:
        mapped = aliases.get(t)
        if mapped and mapped in hay:
            s += 2
    return s


def resolve(query: str, limit: int = 8) -> list[dict]:
    q = query.strip()
    if q.startswith("http://") or q.startswith("https://"):
        md = to_md_url(q)
        return [{"slug": md, "url": md, "title": md, "_score": 100}]
    prefixes = ("guides/", "reference/", "tutorial/", "start/")
    if q.startswith("/") or q.startswith(prefixes) or q in {"v6-to-v7", "installation", "introduction"}:
        slug = q.lstrip("/").removesuffix(".md")
        return [{"slug": slug, "url": f"{DOCS_BASE}/{slug}.md", "title": slug, "_score": 100}]
    tokens = tokenize(q)
    ranked = []
    for item in load_index():
        sc = score(item, tokens)
        if sc:
            ranked.append({**item, "url": to_md_url(item["url"]), "_score": sc})
    ranked.sort(key=lambda x: (-x["_score"], x.get("slug", "")))
    return ranked[:limit]


SECTION_FILES = {
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

START_SLUGS = {
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


def local_excerpt(slug: str, max_chars: int = 2500) -> str | None:
    slug = slug.replace(DOCS_BASE + "/", "").removesuffix(".md").lstrip("/")
    ref_name = None
    for prefix, name in SECTION_FILES.items():
        if slug.startswith(prefix) or slug == prefix:
            ref_name = name
            break
    if ref_name is None and (slug in START_SLUGS or slug.split("/")[0] in START_SLUGS):
        ref_name = "getting-started.md"
    if not ref_name:
        return None
    path = REFS / ref_name
    if not path.exists():
        return None
    text = path.read_text(errors="replace").strip()
    if len(text) > max_chars:
        return text[:max_chars] + "\n…\n"
    return text


def looks_like_marketing_shell(text: str) -> bool:
    return "Everything you need to get building" in text and "Our sponsors" in text


def fetch_url(url: str, timeout: int = 45) -> str:
    """Fetch official Markdown; try .md URL first, then Jina, then bare URL."""
    headers = {"User-Agent": "adonisjs-skill/2.0"}
    md_url = to_md_url(url)
    candidates = [md_url, f"https://r.jina.ai/{md_url}", url]
    if url != md_url:
        candidates.append(f"https://r.jina.ai/{url}")

    errors: list[str] = []
    for target in candidates:
        try:
            req = urllib.request.Request(target, headers=headers)
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                raw = resp.read().decode("utf-8", errors="replace")
            if "Markdown Content:" in raw:
                raw = raw.split("Markdown Content:", 1)[1]
            raw = re.sub(r"\n{3,}", "\n\n", raw).strip()
            if looks_like_marketing_shell(raw):
                errors.append(f"marketing shell from {target}")
                continue
            if len(raw) > 400:
                return raw
            errors.append(f"too short from {target}")
        except Exception as exc:  # noqa: BLE001
            errors.append(f"{target}: {exc}")
            continue
    raise RuntimeError(f"Failed to fetch {url}; tried={errors}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Look up AdonisJS official docs")
    parser.add_argument("query", help="topic keywords, slug, or full docs URL")
    parser.add_argument("--fetch", action="store_true", help="download latest official Markdown")
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
    print("\n--- Local cheat-sheet ---\n")
    excerpt = local_excerpt(slug if not str(slug).startswith("http") else "")
    if excerpt:
        print(excerpt)
    else:
        print("(no local cheat-sheet; use --fetch or open the URL)")

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
        print("\nTip: re-run with --fetch to pull the latest official .md page.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
