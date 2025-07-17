import type { Point, Polygon } from "../types";

const MARGIN = 1;

export function rectPoly(width: number, height: number): Polygon {
  const halfWidth = Math.round(width / 2);
  const halfHeight = Math.round(height / 2);
  return [
    [-halfWidth, -halfHeight],
    [halfWidth, -halfHeight],
    [halfWidth, halfHeight],
    [-halfWidth, halfHeight],
  ];
}

export function circlePoly(diameter: number): Polygon {
  const radius = diameter / 2;
  const points: Point[] = [];
  const segments = 32; // number of segments to approximate the circle
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push([Math.cos(angle) * radius, Math.sin(angle) * radius]);
  }
  return points;
}

export function tileToCoords(tile: Point): Point {
  return [tile[0] * 10, tile[1] * 10]; // GRID_SIZE = 10
}

export function polygonToGridTiles(polygon: Polygon) {
  const tiles = new Set<Point>();
  for (let y = -100; y < 200; y++) {
    // GRID_HEIGHT = 100
    for (let x = -100; x < 200; x++) {
      // GRID_WIDTH = 100
      const centerX = x + 0.5;
      const centerY = y + 0.5;
      if (pointInPolygon([centerX, centerY], polygon)) {
        tiles.add([x, y]);
      }
    }
  }
  return Array.from(tiles);
}

export function pointInPolygon(point: Point, vs: Polygon) {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0],
      yi = vs[i][1];
    const xj = vs[j][0],
      yj = vs[j][1];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function createPolygons(
  shape: "circle" | "rectangle",
  width: number,
  height: number
) {
  const innerPolygon =
    shape === "circle" ? circlePoly(width) : rectPoly(width, height);

  const outerPolygon =
    shape === "circle"
      ? circlePoly(width + MARGIN / 2)
      : rectPoly(width + MARGIN, height + MARGIN );

  return { outerPolygon, innerPolygon };
}
