// =====================================================================
// UTAH CRITICAL MINERALS — Sentinel-2 Multi-Layer Remote Sensing Demo
// Google Earth Engine (Code Editor, JavaScript)
// Run at: https://code.earthengine.google.com
// Author: Laxman Barre
//
// HONEST SCOPE: this is a METHODOLOGY DEMONSTRATION. Sentinel-2 gives a
// COARSE alteration signal (ASTER / hyperspectral are better). Treat the
// alteration layers as screening indicators, not confirmed mineralogy.
// =====================================================================

// ---- 1. Area of interest -------------------------------------------------
// Regional view over SE Utah mining country.
var region = ee.Geometry.Rectangle([-110.5, 37.0, -109.0, 38.5]);

// Focused site: White Mesa Mill (APPROXIMATE — open it in the map and nudge
// onto the real footprint before trusting any site-level numbers).
var whiteMesa = ee.Geometry.Point([-109.491, 37.533]);
var site = whiteMesa.buffer(5000); // 5 km analysis radius

Map.centerObject(region, 9);

// ---- 2. Clean summer composite (one function, reused per year) -----------
function summerComposite(year) {
  var col = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
    .filterBounds(region)
    .filterDate(year + '-06-01', year + '-09-30')
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20));
  print('Sentinel-2 scenes for ' + year + ':', col.size()); // <-- READ THIS
  return col.median().clip(region);
}

var comp2026 = summerComposite('2026');
var comp2023 = summerComposite('2023');

// ---- 3. NDVI (vegetation / disturbance) ---------------------------------
var ndvi2026 = comp2026.normalizedDifference(['B8', 'B4']).rename('NDVI');
var ndvi2023 = comp2023.normalizedDifference(['B8', 'B4']).rename('NDVI');

Map.addLayer(ndvi2026,
  {min: -0.2, max: 0.8, palette: ['brown', 'yellow', 'lightgreen', 'green', 'darkgreen']},
  'NDVI 2026');

// ---- 4. Mineral alteration band ratios (the minerals-relevant part) ------
// Vegetation hides rock, so mask vegetated pixels before reading alteration.
var rockMask = ndvi2026.lt(0.25);
var r = comp2026.updateMask(rockMask);

// Iron-oxide / gossan staining (ferric):  Red / Blue   = B4 / B2
var ironOxide = r.select('B4').divide(r.select('B2')).rename('IronOxide');
// Clay / Al-OH (argillic alteration):     SWIR1 / SWIR2 = B11 / B12
var clay      = r.select('B11').divide(r.select('B12')).rename('Clay');
// Ferrous iron:                           SWIR1 / NIR   = B11 / B8
var ferrous   = r.select('B11').divide(r.select('B8')).rename('Ferrous');

var ratioVis = {min: 0.8, max: 1.6, palette: ['000080', '00ffff', 'ffff00', 'ff0000']};
Map.addLayer(ironOxide, ratioVis, 'Iron-oxide ratio (B4/B2)', false);
Map.addLayer(clay, {min: 0.9, max: 1.3, palette: ['000080', '00ffff', 'ffff00', 'ff0000']},
  'Clay / Al-OH ratio (B11/B12)', false);
Map.addLayer(ferrous, ratioVis, 'Ferrous ratio (B11/B8)', false);

// False-color alteration composite: Iron(R) / Clay(G) / Ferrous(B)
var alteration = ee.Image.cat([ironOxide, clay, ferrous]);
Map.addLayer(alteration, {min: 0.8, max: 1.6}, 'Alteration RGB (Fe / Clay / Ferrous)', false);

// ---- 5. Change detection at the mine site (2023 -> 2026) ------------------
var ndviChange = ndvi2026.subtract(ndvi2023).rename('NDVI_change').clip(site);
Map.addLayer(ndviChange,
  {min: -0.3, max: 0.3, palette: ['red', 'white', 'blue']}, // red = loss, blue = gain
  'NDVI change 2023->2026 (mine site)', false);

// ---- 6. True color for reference -----------------------------------------
Map.addLayer(comp2026, {min: 0, max: 3000, bands: ['B4', 'B3', 'B2']},
  'True color 2026', false);

// ---- 7. Export a portfolio GeoTIFF ---------------------------------------
Export.image.toDrive({
  image: ndvi2026,
  description: 'Utah_NDVI_Summer2026',
  folder: 'geospatial-portfolio',
  region: region,
  scale: 30,
  crs: 'EPSG:4326',
  maxPixels: 1e9
});

print('>> Read the scene counts printed above and put the REAL numbers in your README.');
print('>> Toggle the layers (top-right) to show NDVI, alteration ratios, and change.');
