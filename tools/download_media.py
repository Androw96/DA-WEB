#!/usr/bin/env python3
import json
import sys
import urllib.request
from pathlib import Path
from urllib.parse import urlparse


def target_path(media_dir, url, attached_file):
    if attached_file:
        return media_dir / attached_file
    parsed = urlparse(url)
    return media_dir / Path(parsed.path).name


def main():
    manifest = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("public/media-manifest.json")
    media_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("public/uploads")
    items = json.loads(manifest.read_text(encoding="utf-8"))

    downloaded = 0
    skipped = 0
    failed = []

    for item in items:
        url = item.get("url")
        if not url:
            item["downloadStatus"] = "missing-url"
            skipped += 1
            continue

        destination = target_path(media_dir, url, item.get("attachedFile", ""))
        local_path = destination.as_posix()
        item["localPath"] = local_path
        item["localUrl"] = local_path.removeprefix("public/")
        destination.parent.mkdir(parents=True, exist_ok=True)
        if destination.exists() and destination.stat().st_size > 0:
            item["downloadStatus"] = "exists"
            skipped += 1
            continue

        try:
            print(f"Downloading {url} -> {destination}")
            urllib.request.urlretrieve(url, destination)
            item["downloadStatus"] = "downloaded"
            downloaded += 1
        except Exception as exc:
            item["downloadStatus"] = "failed"
            item["downloadError"] = str(exc)
            failed.append({"url": url, "error": str(exc)})

    report = {"downloaded": downloaded, "skipped": skipped, "failed": failed}
    manifest.write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    data_media = Path("data/media.json")
    if data_media.exists():
        data_media.write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    Path("public/media-download-report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
