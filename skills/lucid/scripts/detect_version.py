#!/usr/bin/env python3
"""Detect @adonisjs/lucid (and host Adonis major) from package.json."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

PACKAGE_KEYS = ("@adonisjs/lucid",)
HOST_KEYS = ("@adonisjs/core",)

DOCS_BASE = "https://lucid.adonisjs.com"
DEFAULT_DOCS = f"{DOCS_BASE}/docs/introduction"


def find_pkg(start: Path) -> Path | None:
    cur = start.resolve()
    for path in [cur, *cur.parents]:
        cand = path / "package.json"
        if cand.exists():
            return cand
        if path.parent == path:
            break
    return None


def major_from_spec(spec: str) -> int | None:
    match = re.search(r"(\d+)\.", spec)
    if match:
        return int(match.group(1))
    match = re.search(r"(\d+)$", spec.strip())
    return int(match.group(1)) if match else None


def detect(path: Path) -> dict:
    pkg_path = find_pkg(path)
    result: dict = {
        "project_path": str(path.resolve()),
        "package_json": str(pkg_path) if pkg_path else None,
        "package": None,
        "version_spec": None,
        "major": None,
        "host_package": None,
        "host_version_spec": None,
        "host_major": None,
        "docs": DEFAULT_DOCS,
        "docs_base": DOCS_BASE,
        "notes": [],
    }
    if not pkg_path:
        result["notes"].append("No package.json found; using current Lucid docs URL.")
        return result

    data = json.loads(pkg_path.read_text(encoding="utf-8"))
    deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}

    for key in HOST_KEYS:
        if key in deps:
            result["host_package"] = key
            result["host_version_spec"] = deps[key]
            result["host_major"] = major_from_spec(deps[key])
            result["notes"].append(f"Host {key}@{deps[key]}")
            break

    found_key = None
    found_spec = None
    for key in PACKAGE_KEYS:
        if key in deps:
            found_key, found_spec = key, deps[key]
            break

    if not found_key:
        result["notes"].append(f"None of {PACKAGE_KEYS} found; still pin {DEFAULT_DOCS}.")
        return result

    major = major_from_spec(found_spec)
    result["package"] = found_key
    result["version_spec"] = found_spec
    result["major"] = major
    result["notes"].append(
        f"Detected {found_key}@{found_spec}"
        + (f" → major {major}" if major else " (semver major unclear)")
        + f"; docs {DEFAULT_DOCS}"
    )
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description="Detect Lucid package version")
    parser.add_argument("--path", default=".", help="project directory")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()
    info = detect(Path(args.path))
    if args.json:
        print(json.dumps(info, indent=2))
    else:
        for key in (
            "project_path",
            "package_json",
            "package",
            "version_spec",
            "major",
            "host_package",
            "host_major",
            "docs",
            "docs_base",
        ):
            print(f"{key}: {info.get(key)}")
        for note in info["notes"]:
            print(f"- {note}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
