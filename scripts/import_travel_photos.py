"""Convert photos from photo-inbox into website-ready WebP images."""
import json
from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1]
inbox = root / "photo-inbox"
output = root / "images" / "travel"
manifest_file = root / "data" / "photo-manifest.js"
known_ids = []
for line in (root / "data" / "trips.js").read_text().splitlines():
    stripped = line.strip()
    if stripped.startswith("id:"):
        known_ids.append(stripped.split("'", 2)[1])
output.mkdir(parents=True, exist_ok=True)

if inbox.exists():
    for folder in sorted(inbox.iterdir()):
        if not folder.is_dir() or folder.name not in known_ids:
            continue
        destination = output / folder.name
        destination.mkdir(parents=True, exist_ok=True)
        for source in sorted(folder.iterdir()):
            if not source.is_file() or source.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
                continue
            filename = "".join(c if c.isalnum() or c == "-" else "-" for c in source.stem.lower()).strip("-")
            if not filename:
                continue
            with Image.open(source) as original:
                image = ImageOps.exif_transpose(original).convert("RGB")
                image.thumbnail((1800, 1800), Image.Resampling.LANCZOS)
                image.save(destination / (filename + ".webp"), "WEBP", quality=82, method=6)
            source.unlink()
        if not any(folder.iterdir()):
            folder.rmdir()

manifest = {}
for folder in sorted(output.iterdir()):
    if not folder.is_dir() or folder.name not in known_ids:
        continue
    images = []
    for path in sorted(folder.glob("*.webp")):
        with Image.open(path) as image:
            width, height = image.size
        images.append({"src": path.relative_to(root).as_posix(), "alt": path.stem.replace("-", " ").capitalize(), "width": width, "height": height})
    if images:
        manifest[folder.name] = images
manifest_file.write_text("window.TRAVEL_PHOTO_MANIFEST = " + json.dumps(manifest, indent=2) + ";\n")
