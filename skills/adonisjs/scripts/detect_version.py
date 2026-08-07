#!/usr/bin/env python3
"""Detect AdonisJS major version for the current or given project."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path


def find_pkg(start: Path) -> Path | None:
    cur = start.resolve()
    for p in [cur, *cur.parents]:
        cand = p / "package.json"
        if cand.exists():
            return cand
        # stop at filesystem root
        if p.parent == p:
            break
    return None


def major_from_spec(spec: str) -> int | None:
    m = re.search(r"(\d+)\.", spec)
    if m:
        return int(m.group(1))
    m = re.search(r"(\d+)$", spec.strip())
    return int(m.group(1)) if m else None


def detect(path: Path) -> dict:
    pkg_path = find_pkg(path)
    result = {
        "project_path": str(path.resolve()),
        "package_json": str(pkg_path) if pkg_path else None,
        "adonis_core": None,
        "major": None,
        "docs": None,
        "notes": [],
    }
    if not pkg_path:
        result["notes"].append("No package.json found; default guidance is AdonisJS v7 docs.")
        result["major"] = 7
        result["docs"] = "https://docs.adonisjs.com"
        return result

    data = json.loads(pkg_path.read_text())
    deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}
    core = deps.get("@adonisjs/core")
    result["adonis_core"] = core
    if not core:
        result["notes"].append("@adonisjs/core not found; not an Adonis app, or incomplete package.json.")
        result["major"] = 7
        result["docs"] = "https://docs.adonisjs.com"
        return result

    major = major_from_spec(core)
    result["major"] = major
    if major and major >= 7:
        result["docs"] = "https://docs.adonisjs.com"
        result["notes"].append("Use AdonisJS v7 docs and this skill’s v7 conventions.")
    elif major == 6:
        result["docs"] = "https://v6-docs.adonisjs.com"
        result["notes"].append(
            "Project appears to be v6. Prefer v6 docs unless upgrading; see references/upgrade-v6-to-v7.md."
        )
    else:
        result["docs"] = "https://docs.adonisjs.com"
        result["notes"].append(f"Unrecognized or old major ({major}); verify before coding.")

    adonisrc = pkg_path.parent / "adonisrc.ts"
    if adonisrc.exists():
        result["notes"].append(f"Found {adonisrc}")
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description="Detect AdonisJS version")
    parser.add_argument("--path", default=".", help="project directory (default: cwd)")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()
    info = detect(Path(args.path))
    if args.json:
        print(json.dumps(info, indent=2))
    else:
        print(f"project: {info['project_path']}")
        print(f"package.json: {info['package_json']}")
        print(f"@adonisjs/core: {info['adonis_core']}")
        print(f"major: {info['major']}")
        print(f"docs: {info['docs']}")
        for n in info["notes"]:
            print(f"- {n}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
