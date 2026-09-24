"""Build the Cadbury Canvas PDF.

Renders index.html with Chromium (render.js), finds the page each chapter starts on,
re-renders with those numbers in the contents page, then stamps the v1 page furniture
(italic page numbers and the dotted left edge) on every page after the cover.
"""
import json, subprocess, sys
from pathlib import Path
import pymupdf as fitz

ROOT = Path(__file__).parent
BUILD = ROOT / "build"
OUT = ROOT / "Cadbury_Canvas_Strategy_v5.pdf"
CHAPTERS = {
    "exec": "Executive summary", "s1": "Understanding the problem", "s2": "What this transforms for Dairy Milk",
    "s3": "The product: Cadbury Canvas", "s4": "Is this a B2B or B2C problem?", "s5": "The step-by-step strategy",
    "s6": "Getting buy-in inside Cadbury", "s7": "Protecting the brand", "s8": "The business model",
    "s9": "Bringing other manufacturers on board", "s10": "Measuring success",
    "s11": "Assumptions and open questions", "s12": "Where each question is answered",
}
NAVY = (0x26 / 255, 0x2B / 255, 0x5F / 255)
EDGE = (0.80, 0.80, 0.82)


def render(toc_file=None):
    raw = BUILD / "raw.pdf"
    cmd = ["node", str(ROOT / "render.js"), str(raw)] + ([str(toc_file)] if toc_file else [])
    subprocess.run(cmd, check=True)
    return raw


def chapter_pages(pdf):
    doc = fitz.open(pdf)
    found = {}
    for key, title in CHAPTERS.items():
        for i in range(2, len(doc)):  # skip cover and contents
            page = doc[i]
            # a chapter title is set large (h1); match on the first 24 characters at >= 20pt
            for b in page.get_text("dict")["blocks"]:
                for l in b.get("lines", []):
                    txt = "".join(s["text"] for s in l["spans"])
                    if any(s["size"] >= 20 for s in l["spans"]) and title[:24] in txt:
                        found[key] = i + 1
                        break
                if key in found:
                    break
            if key in found:
                break
    return found


def stamp(raw, out):
    doc = fitz.open(raw)
    font = fitz.Font(fontfile=str(ROOT / "fonts" / "Fraunces-Italic.ttf"))
    for i, page in enumerate(doc):
        if i == 0:
            continue
        w, h = page.rect.width, page.rect.height
        # dotted left edge, as in v1
        y = 40
        while y < h - 40:
            page.draw_line((26, y), (26, y + 1.2), color=EDGE, width=0.8)
            y += 3.2
        label = str(i + 1)
        tw = font.text_length(label, 10.5)
        tw_ = fitz.TextWriter(page.rect)
        tw_.append(((w - tw) / 2 + 4, h - 30), label, font=font, fontsize=10.5)
        tw_.write_text(page, color=NAVY)
    doc.set_metadata({"title": "Cadbury Canvas: marketing strategy", "author": "", "subject": "", "keywords": "", "creator": "", "producer": ""})
    doc.save(out, garbage=4, deflate=True)


def main():
    BUILD.mkdir(exist_ok=True)
    toc_file = BUILD / "toc.json"
    toc = {}
    for _ in range(3):  # converge: page numbers in the contents cannot move chapters, but be safe
        raw = render(toc_file if toc else None)
        new = chapter_pages(raw)
        if new == toc:
            break
        toc = new
        toc_file.write_text(json.dumps(toc))
    raw = render(toc_file)
    missing = set(CHAPTERS) - set(toc)
    if missing:
        sys.exit(f"chapter titles not found: {missing}")
    stamp(raw, OUT)
    print(f"{OUT.name}: {fitz.open(OUT).page_count} pages; chapters {toc}")


if __name__ == "__main__":
    main()
