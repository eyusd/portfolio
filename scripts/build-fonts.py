"""Subset Geist Mono for the web, and cut static instances for build-time OG images.

Run once after changing the character set: python3 scripts/build-fonts.py
"""
from fontTools.ttLib import TTFont
from fontTools import subset
from fontTools.varLib import instancer

SRC = "assets-src/fonts/GeistMonoVF.woff"

# Latin + Latin-1 + Latin Extended-A, typographic punctuation, arrows, box drawing, a few symbols.
UNICODES = (
    list(range(0x20, 0x7F)) + list(range(0xA0, 0x180))
    + [0x2013, 0x2014, 0x2018, 0x2019, 0x201C, 0x201D, 0x2022, 0x2026, 0x2032, 0x2033, 0x20AC, 0x2122]
    + list(range(0x2190, 0x2200))           # arrows
    + [0x2212, 0x221A, 0x2248, 0x2260, 0x2264, 0x2265, 0x00D7, 0x00F7, 0x221E]
    + list(range(0x2500, 0x2580))           # box drawing
    + [0x25B2, 0x25CF, 0x25CB, 0x00B7, 0x2027]
)

def web():
    f = TTFont(SRC)
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.layout_features = ["kern", "liga", "calt", "ccmp", "locl", "mark", "mkmk", "zero", "ss01"]
    opts.name_IDs = []
    opts.notdef_outline = True
    opts.hinting = False
    opts.desubroutinize = True
    s = subset.Subsetter(opts)
    s.populate(unicodes=UNICODES)
    s.subset(f)
    f.flavor = "woff2"
    f.save("src/assets/fonts/geist-mono.woff2")

def statics():
    for w in (400, 700):
        f = TTFont(SRC)
        f.flavor = None
        inst = instancer.instantiateVariableFont(f, {"wght": w})
        inst.save(f"assets-src/fonts/GeistMono-{w}.ttf")

web()
statics()
