import SAT from "sat";
import type { BuildingNode } from '../types';

export function forcePolygonCollision({
  iterations = 10,
  damping = 0.5,
  excludeIds = [],
}: {
  iterations?: number;
  damping?: number;
  excludeIds?: string[];
} = {}) {
  let nodes: BuildingNode[] = [];

  const force = () => {
    for (let k = 0; k < iterations; k++) {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];

          const polyA = new SAT.Polygon(
            new SAT.Vector(a.x, a.y),
            a.polygon.map(([x, y]: [number, number]) => new SAT.Vector(x, y))
          );
          const polyB = new SAT.Polygon(
            new SAT.Vector(b.x, b.y),
            b.polygon.map(([x, y]: [number, number]) => new SAT.Vector(x, y))
          );

          const response = new SAT.Response();
          if (SAT.testPolygonPolygon(polyA, polyB, response)) {
            const offset = response.overlapV.clone().scale(damping / 2);

            a.x -= offset.x * 2;
            a.y -= offset.y * 2;
            b.x += offset.x * 2;
            b.y += offset.y * 2;
          }
        }
      }
    }
  };

  force.initialize = (_nodes: BuildingNode[]) => {
    // Ignore nodes, that should be excluded from check
    nodes = _nodes.filter((node) => !excludeIds.includes(node.id));
  };

  return force;
}
