import { useEffect, useMemo, useState } from "react";
import * as d3 from "d3-force";
import SAT from "sat";
import { forceCenter, forceLink, forceSimulation } from "d3-force";

type Point = [number, number];
type Polygon = Point[];

const GRID_SIZE = 10;
const GRID_WIDTH = 100;
const GRID_HEIGHT = 100;
const FAST_GENERATION = true;

function tileToCoords(tile: Point): Point {
  return [tile[0] * GRID_SIZE, tile[1] * GRID_SIZE];
}

function polygonToGridTiles(polygon: Polygon) {
  const tiles = new Set<Point>();
  for (let y = -GRID_HEIGHT; y < GRID_HEIGHT * 2; y++) {
    for (let x = -GRID_WIDTH; x < GRID_WIDTH * 2; x++) {
      const centerX = x + 0.5;
      const centerY = y + 0.5;
      if (pointInPolygon([centerX, centerY], polygon)) {
        tiles.add([x, y]);
      }
    }
  }
  return Array.from(tiles);
}

function pointInPolygon(point: Point, vs: Polygon) {
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

interface RoomNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  polygon: Polygon;
  innerPolygon: Polygon;
  x: number;
  y: number;
  roundX: number;
  roundY: number;
}

const roomNodeDefaults = {
  x: 0,
  y: 0,
  roundX: 0,
  roundY: 0,
};

interface RoomLink<T extends string | RoomNode>
  extends d3.SimulationLinkDatum<RoomNode> {
  source: T;
  target: T;
  strength: number;
}

function rectPoly(width: number, height: number): Polygon {
  const halfWidth = Math.round(width / 2);
  const halfHeight = Math.round(height / 2);
  return [
    [-halfWidth, -halfHeight],
    [halfWidth, -halfHeight],
    [halfWidth, halfHeight],
    [-halfWidth, halfHeight],
  ];
}

function circlePoly(diameter: number): Polygon {
  const radius = diameter / 2;
  const points: Point[] = [];
  const segments = 32; // number of segments to approximate the circle
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push([Math.cos(angle) * radius, Math.sin(angle) * radius]);
  }
  return points;
}

const defaultRooms: RoomNode[] = [
  // {
  //   ...roomNodeDefaults,
  //   id: "center",
  //   name: "Center",
  //   polygon: rectPoly(1, 1),
  //   innerPolygon: rectPoly(1, 1),
  // },
  {
    ...roomNodeDefaults,
    id: "storage",
    name: "Storage",
    polygon: circlePoly(10),
    innerPolygon: circlePoly(8),
  },
  {
    ...roomNodeDefaults,
    id: "kitchen",
    name: "Kitchen",
    polygon: circlePoly(8),
    innerPolygon: circlePoly(6),
  },
  {
    ...roomNodeDefaults,
    id: "bedroom",
    name: "Bedroom",
    polygon: rectPoly(9, 17),
    innerPolygon: rectPoly(7, 15),
  },
  {
    ...roomNodeDefaults,
    id: "fields",
    name: "Fields",
    polygon: rectPoly(5, 5),
    innerPolygon: rectPoly(3, 3),
  },
  {
    ...roomNodeDefaults,
    id: "fields2",
    name: "Fields2",
    polygon: rectPoly(10, 4),
    innerPolygon: rectPoly(8, 2),
  },
  {
    ...roomNodeDefaults,
    id: "fields3",
    name: "Fields3",
    polygon: rectPoly(6, 6),
    innerPolygon: rectPoly(4, 4),
  },
  {
    ...roomNodeDefaults,
    id: "fields4",
    name: "Fields4",
    polygon: rectPoly(4, 8),
    innerPolygon: rectPoly(2, 6),
  },
  {
    ...roomNodeDefaults,
    id: "fields5",
    name: "Fields5",
    polygon: rectPoly(4, 4),
    innerPolygon: rectPoly(2, 2),
  },
];

const defaultRoomLinks: RoomLink<string>[] = [
  {
    source: "storage",
    target: "kitchen",
    strength: 3,
  },
  {
    source: "fields",
    target: "kitchen",
    strength: 10,
  },
  {
    source: "fields2",
    target: "fields",
    strength: 2,
  },
  {
    source: "fields2",
    target: "kitchen",
    strength: 2,
  },
  {
    source: "fields3",
    target: "kitchen",
    strength: 10,
  },
  {
    source: "fields4",
    target: "kitchen",
    strength: 10,
  },
  {
    source: "fields5",
    target: "kitchen",
    strength: 2,
  },
  {
    source: "bedroom",
    target: "kitchen",
    strength: 5,
  },
];

// // Add link to center for every room
// defaultRooms
//   .filter((link) => link.id !== "center")
//   .forEach((room) => {
//     defaultRoomLinks.push({
//       source: room.id,
//       target: "center",
//       strength: 100,
//     });
//   });

// Create link between all rooms, where none exists yet. This is to avoid unnecesary space between nodes
defaultRooms.forEach((roomA, i) => {
  defaultRooms.forEach((roomB, j) => {
    if (i >= j) return; // avoid duplicates and self-links
    const linkExists = defaultRoomLinks.some(
      (link) =>
        (link.source === roomA.id && link.target === roomB.id) ||
        (link.source === roomB.id && link.target === roomA.id)
    );
    if (!linkExists) {
      defaultRoomLinks.push({
        source: roomA.id,
        target: roomB.id,
        strength: 1,
      });
    }
  });
});

function forcePolygonCollision({
  iterations = 10,
  damping = 0.5,
  excludeIds = [],
}: {
  iterations?: number;
  damping?: number;
  excludeIds?: string[];
} = {}) {
  let nodes: RoomNode[] = [];

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

  force.initialize = (_nodes: RoomNode[]) => {
    // Ignore nodes, that should be excluded from check
    nodes = _nodes.filter((node) => !excludeIds.includes(node.id));
  };

  return force;
}

export default function App() {
  const width = GRID_WIDTH;
  const height = GRID_HEIGHT;
  const LINK_DISTANCE = 10;

  const newNodes = useMemo(() => {
    const newNodes = defaultRooms.map((room) => ({
      ...room,
      // x: Math.random() * width,
      // y: Math.random() * height,
      x: width / 2 + Math.random() * 2,
      y: height / 2 + Math.random() * 2,
    }));
    // // put center into center
    // const center = newNodes.find((node) => node.id === "center")!;
    // center.fx = width / 2;
    // center.fy = height / 2;

    return newNodes;
  }, []);

  const mappedLinks = useMemo(() => {
    const sources = defaultRoomLinks.map((link) => link.source);
    const targets = defaultRoomLinks.map((link) => link.target);

    const mappedLinks: RoomLink<RoomNode>[] = defaultRoomLinks.map((_, i) => ({
      source: newNodes.find((node) => node.id === sources[i])!,
      target: newNodes.find((node) => node.id === targets[i])!,
      strength: _.strength,
    }));
    return mappedLinks;
  }, [newNodes]);

  const [nodes, setNodes] = useState<RoomNode[]>(newNodes);
  const [links, setLinks] = useState<RoomLink<RoomNode>[]>(mappedLinks);

  useEffect(() => {
    const simulation = forceSimulation<RoomNode, RoomLink<RoomNode>>(newNodes)
      .force(
        "link",
        forceLink<RoomNode, RoomLink<RoomNode>>(mappedLinks)
          .id((d) => d.id)
          .distance(LINK_DISTANCE)
      )
      .force("center", forceCenter(width / 2, height / 2))
      .force(
        "collision",
        forcePolygonCollision({
          // excludeIds: ["center"],
        })
      )
      .on(FAST_GENERATION ? "end" : "tick", () => {
        const nodes = simulation.nodes();
        // set rounded values for coordinates
        nodes.forEach((node) => {
          node.roundX = Math.round(node.x!);
          node.roundY = Math.round(node.y!);
        });

        // update state on every frame
        setNodes([...simulation.nodes()]);
        setLinks([...mappedLinks]);
      });

    if (FAST_GENERATION) {
      while (simulation.alpha() > simulation.alphaMin()) {
        simulation.tick();
      }
    }
    return () => {
      simulation.stop();
    };
  }, [width, height, mappedLinks, newNodes]);

  return (
    <div>
      <button>blah</button>
      <svg height={height} width={width} style={{ scale: 3, margin: "100px" }}>
        <rect width={width} height={height} rx={14} fill={"#272b4d"} />
        {nodes
          // .filter((node) => node.id !== "center")
          .map((node) => (
            <g key={node.id}>
              <polygon
                points={node.polygon
                  .map(([x, y]) => `${node.x! + x},${node.y! + y}`)
                  .join(" ")}
                fill="none"
                stroke="red"
                strokeWidth={1}
              />

              {/* <text x={node.x!} y={node.y!} fontSize={12} fill="#fff">
                {node.name}
              </text> */}
            </g>
          ))}
      </svg>

      <svg
        width={GRID_WIDTH * GRID_SIZE}
        height={GRID_HEIGHT * GRID_SIZE}
        className="border border-gray-300"
      >
        {[...Array(GRID_WIDTH)].map((_, i) => (
          <line
            key={`v-${i}`}
            x1={i * GRID_SIZE}
            y1={0}
            x2={i * GRID_SIZE}
            y2={GRID_HEIGHT * GRID_SIZE}
            stroke="#eee"
          />
        ))}
        {[...Array(GRID_HEIGHT)].map((_, i) => (
          <line
            key={`h-${i}`}
            x1={0}
            y1={i * GRID_SIZE}
            x2={GRID_WIDTH * GRID_SIZE}
            y2={i * GRID_SIZE}
            stroke="#eee"
          />
        ))}

        {nodes
          // .filter((node) => node.id !== "center")
          .map((room) => {
            const tiles = polygonToGridTiles(room.polygon);
            const innerTiles = polygonToGridTiles(room.innerPolygon);
            const translatedPolygon = room.polygon.map(([x, y]) => [
              room.roundX! * GRID_SIZE + x * GRID_SIZE,
              room.roundY! * GRID_SIZE + y * GRID_SIZE,
            ]);

            return (
              <g key={room.id}>
                {tiles.map(tileToCoords).map(([dx, dy], i) => (
                  <rect
                    key={`${room.id}-cell-${i}`}
                    x={room.roundX! * GRID_SIZE + dx}
                    y={room.roundY! * GRID_SIZE + dy}
                    width={GRID_SIZE}
                    height={GRID_SIZE}
                    fill="#4ade80"
                    stroke="#333"
                    strokeWidth={1}
                  />
                ))}

                {innerTiles.map(tileToCoords).map(([dx, dy], i) => (
                  <rect
                    key={`${room.id}-inner-cell-${i}`}
                    x={room.roundX! * GRID_SIZE + dx}
                    y={room.roundY! * GRID_SIZE + dy}
                    width={GRID_SIZE}
                    height={GRID_SIZE}
                    fill="#f97316"
                    stroke="#333"
                    strokeWidth={1}
                  />
                ))}

                <polygon
                  points={translatedPolygon
                    .map(([x, y]) => `${x},${y}`)
                    .join(" ")}
                  fill="none"
                  stroke="red"
                  strokeWidth={2}
                />

                <text
                  x={room.roundX! * GRID_SIZE}
                  y={room.roundY! * GRID_SIZE}
                  fontSize={12}
                  textAnchor="middle"
                  fill="#f00"
                >
                  {room.name}
                </text>
              </g>
            );
          })}

        {false &&
          links.map((link) => {
            const source = nodes.find((node) => node.id === link.source.id);
            const target = nodes.find((node) => node.id === link.target.id);
            if (!source || !target) return null;

            const sourceX = source.roundX! * GRID_SIZE + GRID_SIZE / 2;
            const sourceY = source.roundY! * GRID_SIZE + GRID_SIZE / 2;
            const targetX = target.roundX! * GRID_SIZE + GRID_SIZE / 2;
            const targetY = target.roundY! * GRID_SIZE + GRID_SIZE / 2;

            return (
              <line
                key={`${link.source.id}-${link.target.id}`}
                x1={sourceX}
                y1={sourceY}
                x2={targetX}
                y2={targetY}
                stroke="#f97316"
                strokeWidth={1}
              />
            );
          })}
      </svg>
    </div>
  );
}
