const { WORLD_MAP }        = require('./world');
const { EUROPE_MAP }       = require('./europe');
const { AFRICA_MAP }       = require('./africa');
const { KOELN_MAP }        = require('./koeln');
const { MARBELLA_MAP }     = require('./marbella');
const { GERMANY_MAP }      = require('./germany');
const { SANANDREAS_MAP }   = require('./sanandreas');
const { BIKINI_BOTTOM_MAP }= require('./bikiniBottom');

const MAPS = {
  world:        WORLD_MAP,
  europe:       EUROPE_MAP,
  africa:       AFRICA_MAP,
  koeln:        KOELN_MAP,
  marbella:     MARBELLA_MAP,
  germany:      GERMANY_MAP,
  sanandreas:   SANANDREAS_MAP,
  bikiniBottom: BIKINI_BOTTOM_MAP
};

function getMap(mapId) {
  return MAPS[mapId] || WORLD_MAP;
}

function getAvailableMaps() {
  return Object.values(MAPS).map(m => ({
    id: m.id,
    name: m.name,
    description: m.description || '',
    territoryCount: m.territories.length,
    continentCount: Object.keys(m.continents).length,
    estimatedTime: m.estimatedTime || 60
  }));
}

function buildAdjacencySet(map) {
  const adj = {};
  for (const t of map.territories) {
    adj[t.id] = new Set(t.adjacencies || []);
  }
  for (const cc of (map.crossConnections || [])) {
    if (adj[cc.from]) adj[cc.from].add(cc.to);
    if (adj[cc.to])   adj[cc.to].add(cc.from);
  }
  return adj;
}

function bfsConnected(startId, ownerId, territories, adjacencySet) {
  const visited = new Set([startId]);
  const queue = [startId];
  while (queue.length > 0) {
    const current = queue.shift();
    for (const neighbor of (adjacencySet[current] || new Set())) {
      if (!visited.has(neighbor) && territories[neighbor]?.owner === ownerId) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return visited;
}

function areConnected(fromId, toId, ownerId, territories, adjacencySet) {
  return bfsConnected(fromId, ownerId, territories, adjacencySet).has(toId);
}

module.exports = { getMap, getAvailableMaps, buildAdjacencySet, bfsConnected, areConnected };
