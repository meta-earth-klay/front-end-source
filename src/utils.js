import * as turf from '@turf/turf';
import Mapbox from 'mapbox-gl';

// for 10x10 resolution
export const step_x = 0.00012789768185452;
export const step_y = 0.00012789768185452;

export function getCenter(tiles) {
  let geoJson = getPolygonFromTiles(tiles);
  return turf.center(geoJson);
}

export function getArea(tiles) {
  let geoJson = getPolygonFromTiles(tiles);
  return turf.area(geoJson);
}

export function getBBox(tiles) {
  let geoJson = getPolygonFromTiles(tiles);
  let bbox = turf.bbox(geoJson);
  return [[bbox[0], bbox[1]], [bbox[2], bbox[3]]];
}

export function getWHBBox(geoJson) {
  let bbox = turf.bbox(geoJson);
  let from = turf.point([bbox[0], bbox[1]]);
  let to = turf.point([bbox[0], bbox[3]]);

  let w = turf.distance(from, to);

  from = turf.point([bbox[0], bbox[1]]);
  to = turf.point([bbox[2], bbox[1]]);

  let h = turf.distance(from, to);
  return { w, h }
}

export function getBBoxPolygon(geoJson) {
  let bbox = turf.bbox(geoJson);
  return turf.bboxPolygon(bbox);
}

export function getBBoxFromTileIds(tileIds) {
  let tiles = getTilesFromTileIds(tileIds);
  let geoJson = getPolygonFromTiles(tiles);
  let bbox = turf.bbox(geoJson);
  return [[bbox[0], bbox[1]], [bbox[2], bbox[3]]];
}

export function getTileFromTileId(tileId) {
  return {
    bounds: getMercatorBoundsFromTileId(tileId),
    id: tileId,
  };
}

export function getTilesFromTileIds(tileIds) {
  return tileIds.map(tileId => getTileFromTileId(tileId));
}

export function getLngLatFromId(id) {
  return getLngLatFromMercatorCoordinate(getMercatorCoordinateFromTileId(id));
}

export function getMercatorCoordinateFromLngLat(cord) {
  const wrappedCord = cord.wrap();

  let x = ((wrappedCord.lng + 180) / 360) * 256;
  let y =
    ((1 -
      Math.log(
        Math.tan((wrappedCord.lat * Math.PI) / 180) +
        1 / Math.cos((wrappedCord.lat * Math.PI) / 180)
      ) /
      Math.PI) /
      2) *
    Math.pow(2, 0) *
    256;
  return { x, y };
}

export function getMercatorCoordinateBoundsFromMercatorCoordinate(
  mercatorCord
) {
  const n = mercatorCord.y - (mercatorCord.y % step_y);
  const s = n + step_y;
  const w = mercatorCord.x - (mercatorCord.x % step_x);
  const e = w + step_x;

  return { nw: { x: w, y: n }, se: { x: e, y: s } };
}

export function getLngLatFromMercatorCoordinate(mercatorCord, precision = 6) {
  const lng = Number.parseFloat(
    ((mercatorCord.x / 256) * 360 - 180).toFixed(precision)
  );
  const n = Math.PI - (2 * Math.PI * mercatorCord.y) / 256;
  const lat = Number.parseFloat(
    ((180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)))).toFixed(
      precision
    )
  );
  return new Mapbox.LngLat(lng, lat);
}

export function getPositionFromMercatorCoordinate(mercatorCord) {
  const x = Math.round(mercatorCord.x / step_x);
  const y = Math.round(mercatorCord.y / step_y);
  return { x, y };
}

export function getIdFromMercatorCoordinate(mercatorCord) {
  const position = getPositionFromMercatorCoordinate(mercatorCord);
  return getIdFromPosition(position);
}

export function getIdFromPosition(position) {
  return position.x * Math.round(256 / step_y) + (position.y + 1);
}

export function getBoundsFromMercatorCoordinateBounds(
  mercatorBounds,
  adjust = 0
) {
  // sw, ne
  const xy = mercatorBounds.nw;
  const ne = getLngLatFromMercatorCoordinate({
    x: xy.x + step_x + step_x * adjust,
    y: xy.y - step_y * adjust,
  });
  const sw = getLngLatFromMercatorCoordinate({
    x: xy.x - step_x * adjust,
    y: xy.y + step_y + step_y * adjust,
  });
  return new Mapbox.LngLatBounds(ne, sw);
}

export function getGridDataFromBounds(bounds) {
  const nw = getMercatorCoordinateFromLngLat(bounds.getNorthWest());
  const se = getMercatorCoordinateFromLngLat(bounds.getSouthEast());

  const nwTile = getMercatorCoordinateBoundsFromMercatorCoordinate(nw);
  const seTile = getMercatorCoordinateBoundsFromMercatorCoordinate(se);

  let features = [];

  for (let x = nwTile.nw.x; x <= seTile.se.x; x += step_x) {
    let startPoint = { x: x, y: nwTile.nw.y };
    let endPoint = { x: x, y: seTile.se.y };

    let sP = getLngLatFromMercatorCoordinate(startPoint);
    let eP = getLngLatFromMercatorCoordinate(endPoint);
    let vertical = turf.lineString(
      [
        [sP.lng, sP.lat],
        [eP.lng, eP.lat],
      ],
      { name: 'V' }
    );
    features.push(vertical);
  }

  for (let y = nwTile.nw.y; y <= seTile.se.y; y += step_y) {
    let startPoint = { x: nwTile.nw.x, y: y };
    let endPoint = { x: seTile.se.x, y: y };

    let sP = getLngLatFromMercatorCoordinate(startPoint);
    let eP = getLngLatFromMercatorCoordinate(endPoint);
    let horizontal = turf.lineString(
      [
        [sP.lng, sP.lat],
        [eP.lng, eP.lat],
      ],
      { name: 'H' }
    );
    features.push(horizontal);
  }

  return turf.featureCollection(features);
}

export function getTilesFromBounds(bounds) {
  const nw = getMercatorCoordinateFromLngLat(bounds.getNorthWest());
  const se = getMercatorCoordinateFromLngLat(bounds.getSouthEast());

  const nwTile = getMercatorCoordinateBoundsFromMercatorCoordinate(nw);
  const seTile = getMercatorCoordinateBoundsFromMercatorCoordinate(se);

  return getTilesBetweenMercatorBounds(nwTile, seTile);
}

export function getTilesTotalBetweenMercatorBounds(nwTile, seTile) {
  const totalWNum = Math.round((seTile.se.x - nwTile.nw.x) / step_x); // Total tile with
  const totalHNum = Math.round((seTile.se.y - nwTile.nw.y) / step_y); // Total tile height
  return { h: totalHNum, w: totalWNum };

}
export function getTilesBetweenMercatorBounds(nwTile, seTile) {
  const tiles = [];
  for (let x = nwTile.nw.x; x < seTile.se.x; x += step_x) {
    for (let y = nwTile.nw.y; y < seTile.se.y; y += step_y) {
      const tile = {
        bounds: {
          nw: { x: x, y: y },
          se: { x: x + step_x, y: y + step_y },
        },
        id: getIdFromMercatorCoordinate({ x, y }),
        data: undefined,
      };
      tiles.push(tile);
    }
  }

  return tiles;
}

export function getPolygonFromTile(tile) {
  const bounds = getBoundsFromMercatorCoordinateBounds(tile.bounds);

  return turf.polygon(
    [
      [
        bounds.getNorthWest().toArray(),
        bounds.getSouthWest().toArray(),
        bounds.getSouthEast().toArray(),
        bounds.getNorthEast().toArray(),
        bounds.getNorthWest().toArray(),
      ],
    ],
    tile.data,
    { id: tile.id }
  );
}

export function getPolygonFromTiles(tiles) {
  return turf.featureCollection(tiles.map((tile) => getPolygonFromTile(tile)));
}

export function getFeatureFromGeoJson(geoJson) {
  return turf.feature(geoJson);
}

export function getCollectionFromPolygons(polygons) {
  return turf.featureCollection(polygons);
}

export function getNwSeFromBounds(a, b) {
  // a - actual
  // b - first selected

  if (a.nw.x >= b.nw.x && a.nw.y >= b.nw.y) {
    // bottom - right
    return [b, a];
  } else if (a.nw.x <= b.nw.x && a.nw.y <= b.nw.y) {
    // top - left
    return [a, b];
  } else if (a.nw.x >= b.nw.x && a.nw.y <= b.nw.y) {
    // top right
    return [
      { nw: { x: b.nw.x, y: a.nw.y }, se: { x: b.se.x, y: a.se.y } },
      { nw: { x: a.nw.x, y: b.nw.y }, se: { x: a.se.x, y: b.se.y } },
    ];
  } else if (a.nw.x <= b.nw.x && a.nw.y >= b.nw.y) {
    // bottom - left
    return [
      { nw: { x: a.nw.x, y: b.nw.y }, se: { x: a.se.x, y: b.se.y } },
      { nw: { x: b.nw.x, y: a.nw.y }, se: { x: b.se.x, y: a.se.y } },
    ];
  }

  return [a, b];
}

export function getMercatorCoordinateFromTileId(id) {
  const coordY = Math.round(256 / step_y);
  const idModX = id % coordY;

  return {
    x: (idModX === 0 ? id / coordY - 1 : (id - idModX) / coordY) * step_x,
    y: (idModX === 0 ? coordY - 1 : idModX - 1) * step_y,
  };
}
export function getPositionFromTileId(id) {
  const coordY = Math.round(256 / step_y);
  const idModX = id % coordY;

  return {
    x: (idModX === 0 ? id / coordY - 1 : (id - idModX) / coordY),
    y: (idModX === 0 ? coordY - 1 : idModX - 1),
  };
}
export function getMercatorBoundsFromTileId(id) {
  const tileCoord = getMercatorCoordinateFromTileId(id);
  return {
    nw: tileCoord,
    se: {
      x: tileCoord.x + step_x,
      y: tileCoord.y + step_y,
    },
  };
}

export function cleanCoord(featureCollection) {
  // var options = { units: 'miles', maxEdge: 1 };
  // return turf.concave(featureCollection, options);
  return turf.dissolve(featureCollection, {propertyName: 'combine'});
}

const exportedObject = {
  step_x,
  step_y,
  getMercatorCoordinateFromLngLat,
  getMercatorCoordinateBoundsFromMercatorCoordinate,
  getLngLatFromMercatorCoordinate,
  getPositionFromMercatorCoordinate,
  getIdFromMercatorCoordinate,
  getIdFromPosition,
  getBoundsFromMercatorCoordinateBounds,
  getGridDataFromBounds,
  getTilesFromBounds,
  getTilesBetweenMercatorBounds,
  getTilesTotalBetweenMercatorBounds,
  getPolygonFromTile,
  getPolygonFromTiles,
  getFeatureFromGeoJson,
  getCollectionFromPolygons,
  getNwSeFromBounds,
  getMercatorCoordinateFromTileId,
  getMercatorBoundsFromTileId,
  getPositionFromTileId,
  getArea,
  getCenter,
  getBBox,
  getBBoxFromTileIds,
  getTilesFromTileIds,
  getLngLatFromId,
  getWHBBox,
  getBBoxPolygon,
  cleanCoord,
};
export default exportedObject;
