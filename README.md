# Utah Critical Minerals — Sentinel-2 Remote Sensing Demo

Satellite remote-sensing analysis of a southeastern-Utah mining district (White Mesa Mill
area) using Google Earth Engine and Sentinel-2 imagery. This repository is a **methodology
demonstration**: it shows a reproducible pipeline for vegetation, mineral-alteration, and
change-detection mapping — not a confirmed geological finding.

> **Honest scope note.** Sentinel-2 gives a *coarse* alteration signal. Dedicated instruments
> (ASTER, or airborne hyperspectral) are far better for real mineral mapping. Treat the
> alteration layers here as **screening indicators**, not confirmed mineralogy.

![Sentinel-2 NDVI median composite over the White Mesa Mill mining district, summer 2026](utah_ndvi_2026_portfolio.png)

## What this shows

| Layer | What it measures | Bands used |
|-------|------------------|-----------|
| **NDVI** | Vegetation health / land disturbance | (B8 − B4) / (B8 + B4) |
| **Iron-oxide ratio** | Ferric iron / gossan staining | B4 / B2 |
| **Clay / Al-OH ratio** | Argillic (clay) alteration | B11 / B12 |
| **Ferrous ratio** | Ferrous iron | B11 / B8 |
| **Alteration RGB** | Iron / Clay / Ferrous combined | — |
| **NDVI change** | Land-cover change at the mine site, 2023 → 2026 | — |

Vegetated pixels (NDVI ≥ 0.25) are masked out before reading the alteration ratios, because
vegetation hides the underlying rock signal.

## Data

- **Satellite:** Sentinel-2 (ESA Copernicus)
- **Dataset:** `COPERNICUS/S2_SR_HARMONIZED` (surface reflectance, harmonized)
- **Date range:** June 1 – September 30 (summer, best vegetation/rock contrast)
- **Years:** 2026 (primary) and 2023 (change-detection baseline)
- **Scene filter:** `CLOUDY_PIXEL_PERCENTAGE < 20%` (scene-level metadata filter)
- **Composite:** per-year median, to reduce cloud and shadow artifacts
- **Scenes used:** 180 scenes (2026 summer composite, from the GEE Console). A separate 2023 summer composite is used only as the change-detection baseline.

## Method

1. Define the area of interest over the White Mesa Mill mining district (SE Utah).
2. Query the Sentinel-2 catalog for summer imagery and filter by location, date, and cloud cover.
3. Build a per-year median composite.
4. Compute NDVI (B8/B4).
5. Mask vegetation, then compute iron-oxide (B4/B2), clay (B11/B12), and ferrous (B11/B8) ratios.
6. Compute a 2023 → 2026 NDVI change layer over a 5 km radius around the mill.
7. Visualize all layers and export the NDVI composite as a GeoTIFF.

Full reproducible code: [`utah_minerals_remote_sensing.js`](utah_minerals_remote_sensing.js) —
paste into the [Earth Engine Code Editor](https://code.earthengine.google.com) and press **Run**.

## Limitations (read before citing this)

- **Alteration signal is coarse.** Sentinel-2 has only two SWIR bands; it cannot resolve
  specific minerals the way ASTER or hyperspectral sensors can. These ratios flag *where to
  look*, not *what is there*.
- **Desert bare-soil dominates NDVI** in this arid region, so low NDVI ≠ mining activity by itself.
- **Site coordinates are approximate** — verify the exact mill footprint visually before drawing
  site-level conclusions.
- **No ground truth / validation** was performed; this is a demonstration of method, not a survey.

## Why this matters (domain context)

Utah is a growing US critical-minerals hub — uranium/vanadium processing at the White Mesa
Mill and direct-lithium-extraction pilots on the Great Salt Lake, alongside a new University of
Utah Institute for Critical and Strategic Minerals. Satellite remote sensing supports this work
through exploration targeting (alteration mapping) and ESG / environmental-compliance monitoring
(land-cover change over time) — the two use cases this demo illustrates.

## Tools

Google Earth Engine (JavaScript API) · Sentinel-2 `S2_SR_HARMONIZED` · NDVI & alteration band
ratios · median compositing · change detection · Git/GitHub
