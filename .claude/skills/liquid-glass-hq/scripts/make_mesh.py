#!/usr/bin/env python3
"""Paint a gradient-mesh scene (bg.jpg) and its blurred copy (bg-blur.jpg) for the glass template.

The default palette is the Stripe-style mesh: magenta, sky, violet, amber, flowing in a band
across the top of the page that ends on a skewed diagonal, over a light canvas.

Usage:
    python3 make_mesh.py out_dir/
    python3 make_mesh.py out_dir/ --colors "#ef008f,#6ec3f4,#7038ff,#ffba27" --canvas "#f6f9fc"
    python3 make_mesh.py out_dir/ --band 1.0 --canvas "#0a2540"     # full-bleed mesh on a dark canvas
    python3 make_mesh.py out_dir/ --seed 7                           # a different arrangement of the blobs
"""
import argparse
import random
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

W, H = 2000, 1300


def hex_rgb(h: str) -> np.ndarray:
    h = h.strip().lstrip("#")
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], dtype=np.float64)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("out", type=Path, help="directory to write bg.jpg and bg-blur.jpg into")
    ap.add_argument("--colors", default="#ef008f,#6ec3f4,#7038ff,#ffba27", help="comma-separated mesh colours")
    ap.add_argument("--canvas", default="#f6f9fc", help="page colour the mesh sits on")
    ap.add_argument("--band", type=float, default=0.46, help="how far down the mesh reaches (0-1 of height); 1 = full bleed")
    ap.add_argument("--skew", type=float, default=-12, help="angle in degrees of the band's bottom edge")
    ap.add_argument("--seed", type=int, default=5)
    args = ap.parse_args()

    rng = random.Random(args.seed)
    colors = [hex_rgb(c) for c in args.colors.split(",")]
    canvas = hex_rgb(args.canvas)

    # Work at quarter size: blobs are soft anyway, and it keeps this fast.
    w, h = W // 4, H // 4
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float64)
    acc = np.zeros((h, w, 3))
    wsum = np.zeros((h, w, 1))
    cov = np.zeros((h, w, 1))
    n_blobs = max(6, len(colors) * 3)
    for i in range(n_blobs):
        c = colors[i % len(colors)]
        cx = rng.uniform(-0.1, 1.1) * w
        cy = rng.uniform(-0.15, args.band * 0.9) * h
        rx = rng.uniform(0.18, 0.38) * w
        ry = rng.uniform(0.18, 0.34) * h
        g = np.exp(-(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2))[..., None]
        wg = g ** 2.5          # sharper weights keep neighbouring hues distinct instead of averaging to grey
        acc += wg * c
        wsum += wg
        cov += g
    mesh = acc / np.maximum(wsum, 1e-6)
    # Where no blob reaches, fade to the canvas rather than to black.
    cover = np.clip(cov * 2.5, 0, 1)
    mesh = mesh * cover + canvas * (1 - cover)

    if args.band < 1:
        # Skewed bottom edge: the band ends on a diagonal, with a short soft falloff.
        slope = np.tan(np.radians(args.skew))
        edge = args.band * h + (xx - w / 2) * slope
        t = np.clip((edge - yy) / (0.04 * h) + 0.5, 0, 1)[..., None]
        mesh = mesh * t + canvas * (1 - t)

    img = Image.fromarray(np.clip(mesh, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(6))
    sharp = img.resize((W, H), Image.BICUBIC)
    args.out.mkdir(parents=True, exist_ok=True)
    sharp.save(args.out / "bg.jpg", quality=86, optimize=True, progressive=True)
    blur = sharp.resize((W // 2, H // 2), Image.LANCZOS).filter(ImageFilter.GaussianBlur(24))
    blur.save(args.out / "bg-blur.jpg", quality=72, optimize=True, progressive=True)
    for f in ("bg.jpg", "bg-blur.jpg"):
        print(f"{args.out / f} {(args.out / f).stat().st_size // 1024}KB")


if __name__ == "__main__":
    main()
