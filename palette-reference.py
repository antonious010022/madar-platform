# ============================================================
# MADAR — brand-new palette: "Aurora Indigo + Liquid Gold"
# Pure color remap. No sizes/spacing/structure touched.
# ============================================================

HEX_MAP = {
    # ---- Primary (was petrol teal) : royal indigo-violet ----
    "#10665A": "#4B2FD1",   # main CTA/brand color (used site-wide, pre-split code)
    "#117A6B": "#4B2FD1",   # md-teal
    "#0B5147": "#2E1C86",   # md-teal-deep
    "#0E5348": "#2E1C86",   # teal-deep variant used inline across pages
    "#063B34": "#1E1259",   # md-teal-dark
    "#072E33": "#130B30",   # hero alt-gradient darkest stop
    "#0A4A55": "#2E1C86",   # hero alt-gradient mid stop
    "#12606B": "#4631B0",   # hero alt-gradient light stop / primary-variant
    "#123B66": "#2E1C86",   # features dark band gradient stop
    "#249786": "#6B4FE0",   # md-teal-mid
    "#58B5A5": "#9B82EC",   # md-teal-light
    "#6FD3C0": "#B9A6F2",   # accent-0 light
    "#8FE0D1": "#C9B8F2",   # lighter teal tint
    "#CFE8E2": "#E3DAFB",   # pale teal tint
    "#E5F3F0": "#EFEAFD",   # md-teal-soft
    "#E4F0EC": "#EFEAFD",   # teal-soft used inline (badges/chips)
    "#16665A": "#4B2FD1",   # (defensive alt-case, harmless if absent)
    "#0E1712": "#120D24",   # near-black ink used for recording-mode bg

    # ---- Gold (kept as the luxury metal, refined/richer) ----
    "#B9791F": "#C9972E",
    "#B77A20": "#C9972E",
    "#8F5D14": "#946518",
    "#8A5A15": "#946518",
    "#D5A04A": "#E3B659",
    "#E0A83E": "#E3B659",
    "#EDBC62": "#E3B659",
    "#FBF3E4": "#FBF1DE",
    "#F6E9D3": "#F7E6C4",
    "#C98A1E": "#C9972E",
    "#5F4416": "#6B4710",
    "#92400E": "#8A4A12",

    # ---- Neutrals: paper / ink / muted / borders ----
    "#FAF6ED": "#F7F5FB",
    "#FDF9EE": "#F7F5FB",
    "#F3F0E7": "#F1EEF9",
    "#F0EBE0": "#ECE8F7",
    "#DED4BD": "#E3E0EE",
    "#22291F": "#171333",
    "#14231F": "#171333",
    "#5C5A4A": "#433F66",
    "#30453F": "#433F66",
    "#8A8570": "#6E6B85",
    "#687B75": "#6E6B85",
    "#91A09B": "#9D99B8",
    "#B4AE99": "#A39FBE",
    "#DDE9E5": "#E3E0EE",
    "#C5D8D2": "#C9C2E6",

    # ---- Secondary "plum" family -> true plum (wine/mauve), distinct from primary ----
    "#4C3F63": "#7D2E68",
    "#EAE6F1": "#F6E8F1",

    # ---- Error / danger (one consolidated refined red family) ----
    "#C53030": "#D6334B",
    "#B91C1C": "#A1172B",
    "#9B1C1C": "#A1172B",
    "#B83232": "#A1172B",
    "#FCA5A5": "#F0919E",
    "#FDE8E8": "#FCE9EC",
    "#FBEAEB": "#FCE9EC",
    "#FFF7F7": "#FFF6F7",
    "#F3D0D0": "#F6CCD3",

    # ---- Accent system v3: blue / violet / coral / pink -> sapphire / orchid / coral / rose ----
    "#2F6FDE": "#2A5FD6",
    "#1D4DA8": "#1A3E94",
    "#E7F0FE": "#E8EEFD",
    "#D6E5FD": "#D8E3FB",
    "#B9D0F7": "#BBCDF5",
    "#8DB8FF": "#8DB4F5",
    "#3B82F6": "#3B82F6",   # (PresentationTools pen swatch — intentionally not remapped; see exclusions)

    "#7A4FD8": "#9A3FC4",
    "#5732A8": "#6B2B8A",
    "#F0EAFD": "#F6E9FB",
    "#C9B8F2": "#D6B8EC",
    "#BBA0FF": "#CB9EEA",

    "#E5604A": "#E2694A",
    "#B93E2B": "#A3402A",
    "#FDECE8": "#FDECE6",
    "#FF9C8A": "#F2A78E",

    "#D4488A": "#C23B72",
    "#A82C6A": "#8A2850",
    "#FCE9F2": "#FBE8F1",
    "#FF9FCB": "#E894B8",
}
# remove the deliberate no-op (keeps PEN_COLORS untouched without special-casing the file)
del HEX_MAP["#3B82F6"]

TRIPLE_MAP = {
    # old rgb -> new rgb  (kept in lockstep with HEX_MAP above)
    (6, 59, 52):     (30, 18, 89),     # teal-dark shadow -> primary-dark shadow
    (16, 102, 90):   (75, 47, 209),    # #10665A
    (17, 122, 107):  (75, 47, 209),    # #117A6B
    (88, 181, 165):  (155, 130, 236),  # #58B5A5
    (94, 180, 170):  (155, 130, 236),  # decor.jsx continent (teal-ish)
    (183, 122, 32):  (201, 151, 46),   # #B77A20
    (185, 121, 31):  (201, 151, 46),   # #B9791F
    (213, 160, 74):  (227, 182, 89),   # #D5A04A
    (224, 168, 62):  (227, 182, 89),   # #E0A83E
    (237, 188, 98):  (227, 182, 89),   # #EDBC62
    (201, 138, 30):  (201, 151, 46),   # #C98A1E
    (212, 175, 100): (227, 182, 89),   # decor.jsx continent (gold-ish)
    (47, 111, 222):  (42, 95, 214),    # #2F6FDE
    (122, 79, 216):  (154, 63, 196),   # #7A4FD8
    (87, 50, 168):   (107, 43, 138),   # #5732A8
    (229, 96, 74):   (226, 105, 74),   # #E5604A
    (180, 120, 90):  (226, 105, 74),   # decor.jsx continent (terracotta -> coral)
    (250, 246, 237): (247, 245, 251),  # #FAF6ED
    (34, 41, 31):    (23, 19, 51),     # #22291F (modal backdrops)
    (14, 23, 18):    (18, 13, 36),     # #0E1712 (modal backdrops)
    (197, 216, 210): (201, 194, 230),  # #C5D8D2
    (239, 68, 68):   (161, 23, 43),    # PresentationTools error bg -> pairs with new error-soft text
}
