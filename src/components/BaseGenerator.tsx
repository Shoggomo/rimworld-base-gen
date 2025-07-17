import { useEffect, useMemo, useState } from "react";
import { forceCenter, forceLink, forceSimulation } from "d3-force";
import type { BuildingNode, BuildingLink } from "../types";
import { forcePolygonCollision } from "../utils/forces";
import { polygonToGridTiles, tileToCoords } from "../utils/geometry";
import { SeededRandom } from "../utils/seededRandom";

const GRID_SIZE = 10;
const GRID_WIDTH = 100;
const GRID_HEIGHT = 100;

interface BaseGeneratorProps {
  buildings: BuildingNode[];
  links: BuildingLink<string>[];
  fastGeneration?: boolean;
  seed?: number;
}

export default function BaseGenerator({
  buildings,
  links,
  fastGeneration = true,
  seed = 12345,
}: BaseGeneratorProps) {
  const width = GRID_WIDTH;
  const height = GRID_HEIGHT;
  const LINK_DISTANCE = 10;

  const newNodes = useMemo(() => {
    const rng = new SeededRandom(seed);
    return buildings.map((building) => ({
      ...building,
      x: width / 2 + rng.nextRange(-1, 1),
      y: height / 2 + rng.nextRange(-1, 1),
    }));
  }, [buildings, width, height, seed]);

  const mappedLinks = useMemo(() => {
    const mappedLinks: BuildingLink<BuildingNode>[] = links
      .map((link) => ({
        source: newNodes.find((node) => node.id === link.source)!,
        target: newNodes.find((node) => node.id === link.target)!,
        strength: link.strength,
      }))
      .filter((link) => link.source && link.target);

    return mappedLinks;
  }, [newNodes, links]);

  const [nodes, setNodes] = useState<BuildingNode[]>(newNodes);

  useEffect(() => {
    if (newNodes.length === 0) {
      setNodes([]);
      return;
    }

    const simulation = forceSimulation<
      BuildingNode,
      BuildingLink<BuildingNode>
    >(newNodes)
      .force(
        "link",
        forceLink<BuildingNode, BuildingLink<BuildingNode>>(mappedLinks)
          .id((d) => d.id)
          .distance(LINK_DISTANCE)
      )
      .force("center", forceCenter(width / 2, height / 2))
      .force("collision", forcePolygonCollision())
      .on(fastGeneration ? "end" : "tick", () => {
        const nodes = simulation.nodes();
        // set rounded values for coordinates
        nodes.forEach((node) => {
          node.roundX = Math.floor(node.x!);
          node.roundY = Math.floor(node.y!);
        });

        // update state on every frame
        setNodes([...simulation.nodes()]);
      });

    if (fastGeneration) {
      while (simulation.alpha() > simulation.alphaMin()) {
        simulation.tick();
      }
    }

    return () => {
      simulation.stop();
    };
  }, [width, height, mappedLinks, newNodes, fastGeneration]);

  if (buildings.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-rw-primary-950 border-2 border-rw-primary-600 rounded-lg">
        <p className="text-rw-primary-300">
          Add some buildings to generate a base layout
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main view */}
      <div className="bg-rw-primary-950 border border-rw-primary-600 rounded-lg p-2">
        <h3 className="text-base font-semibold text-rw-primary-100 mb-2">
          Generated Base Layout
        </h3>
        <div className="flex justify-center items-center min-h-[400px]">
          <svg
            width={GRID_WIDTH * GRID_SIZE}
            height={GRID_HEIGHT * GRID_SIZE}
            className="border border-rw-primary-600 rounded bg-rw-primary-900 max-w-full max-h-full"
            viewBox={`0 0 ${GRID_WIDTH * GRID_SIZE} ${GRID_HEIGHT * GRID_SIZE}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Grid lines */}
            {[...Array(GRID_WIDTH + 1)].map((_, i) => (
              <line
                key={`v-${i}`}
                x1={i * GRID_SIZE}
                y1={0}
                x2={i * GRID_SIZE}
                y2={GRID_HEIGHT * GRID_SIZE}
                stroke="#92400e"
                strokeWidth={0.5}
                opacity={0.3}
              />
            ))}
            {[...Array(GRID_HEIGHT + 1)].map((_, i) => (
              <line
                key={`h-${i}`}
                x1={0}
                y1={i * GRID_SIZE}
                x2={GRID_WIDTH * GRID_SIZE}
                y2={i * GRID_SIZE}
                stroke="#92400e"
                strokeWidth={0.5}
                opacity={0.3}
              />
            ))}

            {/* Buildings */}
            {nodes.map((building) => {
              //   const tiles = polygonToGridTiles(building.polygon);
              const innerTiles = polygonToGridTiles(building.innerPolygon);
              //   const translatedPolygon = building.polygon.map(([x, y]) => [
              //     building.roundX! * GRID_SIZE + x * GRID_SIZE,
              //     building.roundY! * GRID_SIZE + y * GRID_SIZE,
              //   ]);

              return (
                <g key={building.id}>
                  {/* Outer tiles */}
                  {/* {tiles.map(tileToCoords).map(([dx, dy], i) => (
                    <rect
                      key={`${building.id}-cell-${i}`}
                      x={building.roundX! * GRID_SIZE + dx}
                      y={building.roundY! * GRID_SIZE + dy}
                      width={GRID_SIZE}
                      height={GRID_SIZE}
                      fill={building.color}
                      stroke="#92400e"
                      strokeWidth={1}
                      opacity={0.7}
                    />
                  ))} */}

                  {/* Inner tiles */}
                  {innerTiles.map(tileToCoords).map(([dx, dy], i) => (
                    <rect
                      key={`${building.id}-inner-cell-${i}`}
                      x={building.roundX! * GRID_SIZE + dx}
                      y={building.roundY! * GRID_SIZE + dy}
                      width={GRID_SIZE}
                      height={GRID_SIZE}
                      fill={building.color}
                      stroke="#92400e"
                      strokeWidth={1}
                    />
                  ))}

                  {/* Building outline */}
                  {/* <polygon
                    points={translatedPolygon
                      .map(([x, y]) => `${x},${y}`)
                      .join(" ")}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth={2}
                  /> */}

                  {/* Building label */}
                  <text
                    x={building.roundX! * GRID_SIZE}
                    y={building.roundY! * GRID_SIZE - 5}
                    fontSize={12}
                    textAnchor="middle"
                    fill="#fbbf24"
                    fontWeight="bold"
                  >
                    {building.name}
                  </text>
                </g>
              );
            })}

            {/* Links (optional visualization) 
            {simulationLinks.map((link) => {
              const source = nodes.find((node) => node.id === link.source.id);
              const target = nodes.find((node) => node.id === link.target.id);
              if (!source || !target) return null;

              const sourceX = source.roundX! * GRID_SIZE;
              const sourceY = source.roundY! * GRID_SIZE;
              const targetX = target.roundX! * GRID_SIZE;
              const targetY = target.roundY! * GRID_SIZE;

              return (
                <line
                  key={`${link.source.id}-${link.target.id}`}
                  x1={sourceX}
                  y1={sourceY}
                  x2={targetX}
                  y2={targetY}
                  stroke="#f97316"
                  strokeWidth={link.strength}
                  opacity={0.4}
                />
              );
            })}
            */}
          </svg>
        </div>
      </div>
    </div>
  );
}
