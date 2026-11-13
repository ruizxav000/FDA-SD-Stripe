#!/usr/bin/env python3
"""Make the pre-blurred copy of a background photo that the glass surfaces show.

Usage:
    python3 make_blur.py path/to/bg.jpg            # writes bg-blur.jpg beside it
    python3 make_blur.py bg.jpg -o out/bg-blur.jpg --radius 28

Also downsizes the sharp photo to 2000px wide (if larger) so the page stays light.
Glass looks right when the blur copy is half the width of the sharp one and blurred
hard enough that no edges survive: shapes and colour, no detail.
"""
import argparse
from pathlib import Path

from PIL import Image, ImageFilter


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("photo", type=Path, help="the sharp background photo (jpg/png/webp)")
    ap.add_argument("-o", "--out", type=Path, help="where to write the blurred copy (default: bg-blur.jpg beside the photo)")
    ap.add_argument("--radius", type=float, default=24, help="gaussian blur radius at half size (default 24)")
    ap.add_argument("--max-width", type=int, default=2000, help="downsize the sharp photo to this width (default 2000)")
    ap.add_argument("--keep-sharp", action="store_true", help="don't rewrite the sharp photo")
    args = ap.parse_args()

    im = Image.open(args.photo).convert("RGB")
    if not args.keep_sharp and im.width > args.max_width:
        im = im.resize((args.max_width, round(im.height * args.max_width / im.width)), Image.LANCZOS)
        sharp_out = args.photo.with_suffix(".jpg")
        im.save(sharp_out, quality=82, optimize=True, progressive=True)
        print(f"sharp: {sharp_out} {im.size}")

    half = im.resize((im.width // 2, im.height // 2), Image.LANCZOS)
    blurred = half.filter(ImageFilter.GaussianBlur(args.radius))
    out = args.out or args.photo.with_name("bg-blur.jpg")
    blurred.save(out, quality=70, optimize=True, progressive=True)
    print(f"blur:  {out} {blurred.size} {out.stat().st_size // 1024}KB")


if __name__ == "__main__":
    main()
