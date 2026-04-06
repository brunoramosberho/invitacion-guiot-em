#!/usr/bin/env python3
"""Genera assets/og-preview.png (1200×630) para Open Graph / WhatsApp.

Regenerar con nombre en la preview (p. ej. listas VIP o captura manual):
  OG_GUEST_NAME='María López' .venv/bin/python scripts/generate_og_image.py

Nota: WhatsApp/Facebook leen esta imagen al rastrear la URL; en hosting 100 %
estático el nombre en la tarjeta no cambia con ?n= sin un endpoint dinámico.
"""
import os
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "og-preview.png"
FONT_DIR = ROOT / "assets" / "fonts"

FONT_URLS = {
    "IMFeENit28P.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/imfellenglish/IMFeENit28P.ttf",
    "IMFeENrm28P.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/imfellenglish/IMFeENrm28P.ttf",
    "IBMPlexMono-Medium.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/ibmplexmono/IBMPlexMono-Medium.ttf",
}


def ensure_fonts() -> None:
    FONT_DIR.mkdir(parents=True, exist_ok=True)
    for fname, url in FONT_URLS.items():
        dest = FONT_DIR / fname
        if dest.exists() and dest.stat().st_size > 0:
            continue
        print(f"Downloading {fname} …")
        req = urllib.request.Request(url, headers={"User-Agent": "invitacion-guiot-em/og-gen"})
        with urllib.request.urlopen(req, timeout=60) as resp:
            dest.write_bytes(resp.read())


def load_font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_DIR / name), size)


def main() -> None:
    ensure_fonts()
    guest = (os.environ.get("OG_GUEST_NAME") or "Invitado/a").strip() or "Invitado/a"

    W, H = 1200, 630
    base = Image.new("RGBA", (W, H), (8, 7, 6, 255))
    dr = ImageDraw.Draw(base)

    # Brillo cálido muy suave (centro)
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse(
        [-200, -140, W + 200, H + 300],
        fill=(245, 230, 190, 22),
    )
    base = Image.alpha_composite(base, glow)

    dr = ImageDraw.Draw(base)
    font_mono = load_font("IBMPlexMono-Medium.ttf", 20)
    font_mono_sm = load_font("IBMPlexMono-Medium.ttf", 15)
    name_size = 62 if len(guest) <= 18 else max(36, 62 - (len(guest) - 18) * 2)
    name_md = max(22, min(30, int(name_size * 0.48)))
    font_italic = load_font("IMFeENit28P.ttf", name_size)
    font_italic_sub = load_font("IMFeENit28P.ttf", 28)
    font_italic_md = load_font("IMFeENit28P.ttf", name_md)
    font_roman_sm = load_font("IMFeENrm28P.ttf", 22)

    dr.text((W // 2, 52), "INVITACIÓN EXCLUSIVA", fill=(255, 255, 255, 58), font=font_mono, anchor="mt")
    dr.text((W // 2, 86), "Solo con enlace nominal · SS26", fill=(255, 255, 255, 42), font=font_mono_sm, anchor="mt")

    dr.text((W // 2, 138), guest, fill=(255, 255, 255, 200), font=font_italic, anchor="mt")
    dr.text((W // 2, 218), "Para ti · giot × Expresso Martínez", fill=(255, 255, 255, 92), font=font_italic_sub, anchor="mt")

    cx = W // 2
    env_top = 268
    env_bot = 598

    body = [
        (cx - 310, env_top + 40),
        (cx + 310, env_top + 40),
        (cx + 350, env_bot),
        (cx - 350, env_bot),
    ]
    dr.polygon(body, fill="#151311", outline="#3d3a34")

    # Pliegues (tonos discretos)
    dr.polygon([body[0], body[3], (cx, env_top + 145)], fill="#181714")
    dr.polygon([body[1], body[2], (cx, env_top + 145)], fill="#171613")
    dr.polygon([body[3], body[2], (cx, env_top + 145)], fill="#1a1815")

    flap = [(cx - 318, env_top + 38), (cx + 318, env_top + 38), (cx, env_top + 172)]
    dr.polygon(flap, fill="#1e1c17", outline="#4a4540")

    dr.text((cx - 280, env_top + 58), "DE PARTE DE", fill=(255, 255, 255, 50), font=font_mono_sm)
    dr.text((cx - 280, env_top + 78), "giot × Expresso Martínez", fill=(255, 255, 255, 75), font=font_roman_sm)

    seal_cx, seal_cy = cx + 210, env_top + 200
    dr.ellipse(
        [seal_cx - 52, seal_cy - 52, seal_cx + 52, seal_cy + 52],
        outline=(200, 40, 30, 255),
        width=3,
    )
    seal_font = load_font("IMFeENrm28P.ttf", 18)
    seal_mono = load_font("IBMPlexMono-Medium.ttf", 12)
    dr.text((seal_cx, seal_cy - 14), "giot", fill=(200, 50, 40, 255), font=seal_font, anchor="mm")
    dr.text((seal_cx, seal_cy + 8), "× EM", fill=(200, 50, 40, 255), font=seal_font, anchor="mm")
    dr.text((seal_cx, seal_cy + 32), "JUN 2026", fill=(180, 60, 50, 255), font=seal_mono, anchor="mm")

    dr.text((cx - 280, env_top + 300), "PARA", fill=(255, 255, 255, 55), font=font_mono_sm)
    dr.text((cx - 280, env_top + 322), guest, fill=(255, 255, 255, 175), font=font_italic_md)
    dr.text(
        (cx - 280, env_top + 364),
        "Inauguración SS26 · Madrid",
        fill=(255, 255, 255, 45),
        font=font_mono_sm,
    )

    dr.text(
        (W // 2, H - 36),
        "18 Jun 2026 · 20:00 h · Expresso Martínez · Chamberí",
        fill=(255, 255, 255, 40),
        font=font_mono_sm,
        anchor="mt",
    )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    base.convert("RGB").save(OUT, "PNG", optimize=True)
    print(f"Wrote {OUT}")

    at_path = ROOT / "assets" / "apple-touch-icon.png"
    s = 180
    ati = Image.new("RGB", (s, s), "#080706")
    ad = ImageDraw.Draw(ati)
    inset = 46
    ad.ellipse([inset, inset, s - inset, s - inset], outline="#c8281e", width=5)
    cx_, cy_, off = s // 2, s // 2, 24
    ad.line([(cx_ - off, cy_ - off), (cx_ + off, cy_ + off)], fill="#c8281e", width=5)
    ad.line([(cx_ + off, cy_ - off), (cx_ - off, cy_ + off)], fill="#c8281e", width=5)
    ati.save(at_path, "PNG", optimize=True)
    print(f"Wrote {at_path}")


if __name__ == "__main__":
    main()
