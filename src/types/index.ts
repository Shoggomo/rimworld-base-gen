import * as d3 from "d3-force";

export type Point = [number, number];
export type Polygon = Point[];

export interface BuildingNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  shape: 'circle' | 'rectangle';
  width: number;
  height: number;
  polygon: Polygon;
  innerPolygon: Polygon;
  x: number;
  y: number;
  roundX: number;
  roundY: number;
  color: string;
}

export interface BuildingLink<T extends string | BuildingNode>
  extends d3.SimulationLinkDatum<BuildingNode> {
  source: T;
  target: T;
  strength: number;
}

export interface BuildingTemplate {
  id: string;
  name: string;
  shape: 'circle' | 'rectangle';
  width: number;
  height: number;
  color: string;
}
