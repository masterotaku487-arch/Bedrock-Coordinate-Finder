// Motor de busca para minérios do Minecraft
// Suporta Java e Bedrock Edition

export const ORE_TYPES = {
  diamond: {
    name: 'Diamante',
    icon: '💎',
    minY: -64,
    maxY: 16,
    peakY: -59,
    rarity: 'legendary'
  },
  emerald: {
    name: 'Esmeralda',
    icon: '💚',
    minY: -16,
    maxY: 320,
    peakY: 236,
    rarity: 'legendary'
  },
  ancient_debris: {
    name: 'Ancient Debris',
    icon: '🔥',
    minY: 8,
    maxY: 119,
    peakY: 15,
    rarity: 'legendary'
  },
  gold: {
    name: 'Ouro',
    icon: '🟡',
    minY: -64,
    maxY: 32,
    peakY: -16,
    rarity: 'rare'
  },
  iron: {
    name: 'Ferro',
    icon: '⚙️',
    minY: -64,
    maxY: 320,
    peakY: 16,
    rarity: 'common'
  },
  copper: {
    name: 'Cobre',
    icon: '🔶',
    minY: -16,
    maxY: 112,
    peakY: 48,
    rarity: 'common'
  },
  coal: {
    name: 'Carvão',
    icon: '⚫',
    minY: 0,
    maxY: 320,
    peakY: 96,
    rarity: 'common'
  },
  lapis: {
    name: 'Lapis Lazuli',
    icon: '🔵',
    minY: -64,
    maxY: 64,
    peakY: 0,
    rarity: 'rare'
  },
  redstone: {
    name: 'Redstone',
    icon: '🔴',
    minY: -64,
    maxY: 15,
    peakY: -59,
    rarity: 'common'
  }
};

export function createOreWorker(edition = 'bedrock') {
  const workerCode = edition === 'java' ? `
    // Java Edition Ore Generator
    class JavaRandom {
      constructor(seed) {
        this.seed = (BigInt(seed) ^ 0x5DEECE66Dn) & ((1n << 48n) - 1n);
      }

      next(bits) {
        this.seed = (this.seed * 0x5DEECE66Dn + 0xBn) & ((1n << 48n) - 1n);
        return Number(this.seed >> (48n - BigInt(bits)));
      }

      nextInt(bound) {
        if (bound <= 0) return 0;
        if ((bound & -bound) === bound) {
          return Number((BigInt(bound) * BigInt(this.next(31))) >> 31n);
        }
        let bits, val;
        do {
          bits = this.next(31);
          val = bits % bound;
        } while (bits - val + (bound - 1) < 0);
        return Number(val);
      }
    }

    function generateOre(worldSeed, x, y, z, oreType) {
      const blockX = BigInt(x);
      const blockY = BigInt(y);
      const blockZ = BigInt(z);
      const wSeed = BigInt(worldSeed);
      
      // Seed específica para geração de minérios
      const oreSeed = wSeed ^ (blockX * 3129871n) ^ (blockZ * 116129781n) ^ (blockY * 142587n);
      const random = new JavaRandom(oreSeed);
      
      // Verifica se há minério nesta posição
      const roll = random.nextInt(10000);
      
      // Chances baseadas no tipo de minério e altura
      let threshold = 0;
      
      switch(oreType) {
        case 'diamond':
          threshold = y >= -64 && y <= 16 ? (y === -59 ? 100 : 50) : 0;
          break;
        case 'emerald':
          threshold = y >= -16 && y <= 320 ? 20 : 0;
          break;
        case 'ancient_debris':
          threshold = y >= 8 && y <= 119 ? (y === 15 ? 80 : 30) : 0;
          break;
        case 'gold':
          threshold = y >= -64 && y <= 32 ? 60 : 0;
          break;
        case 'iron':
          threshold = y >= -64 && y <= 320 ? 150 : 0;
          break;
        case 'copper':
          threshold = y >= -16 && y <= 112 ? 120 : 0;
          break;
        case 'coal':
          threshold = y >= 0 && y <= 320 ? 200 : 0;
          break;
        case 'lapis':
          threshold = y >= -64 && y <= 64 ? 70 : 0;
          break;
        case 'redstone':
          threshold = y >= -64 && y <= 15 ? 90 : 0;
          break;
      }
      
      return roll < threshold;
    }

    self.onmessage = function(e) {
      const { seed, oreType, minY, maxY, maxResults, workerId, quadrant } = e.data;
      const worldSeed = seed;
      
      let radius = 500;
      let found = [];
      let tested = 0;
      const updateInterval = 100;
      
      let xStart, xEnd, zStart, zEnd;
      
      switch(quadrant) {
        case 0: xStart = 0; xEnd = radius; zStart = 0; zEnd = radius; break;
        case 1: xStart = -radius; xEnd = 0; zStart = 0; zEnd = radius; break;
        case 2: xStart = 0; xEnd = radius; zStart = -radius; zEnd = 0; break;
        case 3: xStart = -radius; xEnd = 0; zStart = -radius; zEnd = 0; break;
      }
      
      while (found.length < maxResults && radius <= 5000) {
        for (let x = xStart; x <= xEnd && found.length < maxResults; x += 4) {
          for (let z = zStart; z <= zEnd && found.length < maxResults; z += 4) {
            for (let y = minY; y <= maxY && found.length < maxResults; y += 4) {
              tested++;
              
              if (tested % updateInterval === 0) {
                self.postMessage({
                  type: 'progress',
                  workerId: workerId,
                  x: x,
                  y: y,
                  z: z,
                  tested: tested,
                  found: found.length
                });
              }
              
              if (generateOre(worldSeed, x, y, z, oreType)) {
                found.push({ x, y, z });
                self.postMessage({
                  type: 'ore_found',
                  workerId: workerId,
                  x: x,
                  y: y,
                  z: z,
                  total: found.length
                });
              }
            }
          }
        }
        
        if (found.length < maxResults) {
          radius += 500;
          xStart = quadrant === 1 || quadrant === 3 ? -radius : 0;
          xEnd = quadrant === 0 || quadrant === 2 ? radius : 0;
          zStart = quadrant === 2 || quadrant === 3 ? -radius : 0;
          zEnd = quadrant === 0 || quadrant === 1 ? radius : 0;
        }
      }
      
      self.postMessage({
        type: 'complete',
        workerId: workerId,
        results: found,
        tested: tested
      });
    };
  ` : `
    // Bedrock Edition Ore Generator
    class BedrockRandom {
      constructor(seed) {
        this.seed = BigInt(seed) & 0xFFFFFFFFn;
      }

      next() {
        this.seed = (this.seed * 1103515245n + 12345n) & 0xFFFFFFFFn;
        return Number((this.seed >> 16n) & 0x7FFFn);
      }

      nextInt(bound) {
        if (bound <= 0) return 0;
        const result = this.next() % bound;
        return result < 0 ? result + bound : result;
      }
    }

    function generateOre(worldSeed, x, y, z, oreType) {
      let positionSeed = worldSeed;
      positionSeed = (positionSeed + x * 1619) & 0xFFFFFFFF;
      positionSeed = (positionSeed + z * 31337) & 0xFFFFFFFF;
      positionSeed = (positionSeed + y * 52591) & 0xFFFFFFFF;
      
      const random = new BedrockRandom(positionSeed);
      const roll = random.nextInt(10000);
      
      let threshold = 0;
      
      switch(oreType) {
        case 'diamond':
          threshold = y >= -64 && y <= 16 ? (y === -59 ? 100 : 50) : 0;
          break;
        case 'emerald':
          threshold = y >= -16 && y <= 320 ? 20 : 0;
          break;
        case 'ancient_debris':
          threshold = y >= 8 && y <= 119 ? (y === 15 ? 80 : 30) : 0;
          break;
        case 'gold':
          threshold = y >= -64 && y <= 32 ? 60 : 0;
          break;
        case 'iron':
          threshold = y >= -64 && y <= 320 ? 150 : 0;
          break;
        case 'copper':
          threshold = y >= -16 && y <= 112 ? 120 : 0;
          break;
        case 'coal':
          threshold = y >= 0 && y <= 320 ? 200 : 0;
          break;
        case 'lapis':
          threshold = y >= -64 && y <= 64 ? 70 : 0;
          break;
        case 'redstone':
          threshold = y >= -64 && y <= 15 ? 90 : 0;
          break;
      }
      
      return roll < threshold;
    }

    self.onmessage = function(e) {
      const { seed, oreType, minY, maxY, maxResults, workerId, quadrant } = e.data;
      const worldSeed = parseInt(seed);
      
      let radius = 500;
      let found = [];
      let tested = 0;
      const updateInterval = 100;
      
      let xStart, xEnd, zStart, zEnd;
      
      switch(quadrant) {
        case 0: xStart = 0; xEnd = radius; zStart = 0; zEnd = radius; break;
        case 1: xStart = -radius; xEnd = 0; zStart = 0; zEnd = radius; break;
        case 2: xStart = 0; xEnd = radius; zStart = -radius; zEnd = 0; break;
        case 3: xStart = -radius; xEnd = 0; zStart = -radius; zEnd = 0; break;
      }
      
      while (found.length < maxResults && radius <= 5000) {
        for (let x = xStart; x <= xEnd && found.length < maxResults; x += 4) {
          for (let z = zStart; z <= zEnd && found.length < maxResults; z += 4) {
            for (let y = minY; y <= maxY && found.length < maxResults; y += 4) {
              tested++;
              
              if (tested % updateInterval === 0) {
                self.postMessage({
                  type: 'progress',
                  workerId: workerId,
                  x: x,
                  y: y,
                  z: z,
                  tested: tested,
                  found: found.length
                });
              }
              
              if (generateOre(worldSeed, x, y, z, oreType)) {
                found.push({ x, y, z });
                self.postMessage({
                  type: 'ore_found',
                  workerId: workerId,
                  x: x,
                  y: y,
                  z: z,
                  total: found.length
                });
              }
            }
          }
        }
        
        if (found.length < maxResults) {
          radius += 500;
          xStart = quadrant === 1 || quadrant === 3 ? -radius : 0;
          xEnd = quadrant === 0 || quadrant === 2 ? radius : 0;
          zStart = quadrant === 2 || quadrant === 3 ? -radius : 0;
          zEnd = quadrant === 0 || quadrant === 1 ? radius : 0;
        }
      }
      
      self.postMessage({
        type: 'complete',
        workerId: workerId,
        results: found,
        tested: tested
      });
    };
  `;

  const blob = new Blob([workerCode], { type: 'application/javascript' });
  return URL.createObjectURL(blob);
}
