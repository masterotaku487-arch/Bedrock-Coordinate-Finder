// Motor de busca para Minecraft Bedrock Edition (Celular/Console)
// Usa o gerador LCG do Bedrock com constantes específicas

export function createBedrockWorker() {
  const workerCode = `
    // Bedrock Edition Random Generator (baseado em LCG C++)
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

      setSeed(newSeed) {
        this.seed = BigInt(newSeed) & 0xFFFFFFFFn;
      }
    }

    function generateBedrockBedrock(worldSeed, x, z, y, dimension, version) {
      const bedrockPattern = [];
      const versionNum = parseFloat(version);
      
      // Define range baseado na dimensão e versão
      let minY, maxY, solidLayer;
      
      if (dimension === 'nether') {
        minY = 123;
        maxY = 127;
        solidLayer = 127;
      } else if (versionNum >= 1.18) {
        minY = -64;
        maxY = -59;
        solidLayer = -64;
      } else {
        minY = 0;
        maxY = 4;
        solidLayer = 0;
      }
      
      for (let dy = 0; dy <= (maxY - minY); dy++) {
        const currentY = y + dy;
        
        // Camada sólida sempre tem bedrock
        if (currentY === solidLayer) {
          bedrockPattern.push(true);
          continue;
        }
        
        // Bedrock Edition usa uma combinação diferente para seed de posição
        const blockX = x;
        const blockZ = z;
        const blockY = currentY;
        
        // Combinação de seed do Bedrock (diferente do Java)
        let positionSeed = worldSeed;
        positionSeed = (positionSeed + blockX * 2654435761) & 0xFFFFFFFF;
        positionSeed = (positionSeed + blockZ * 1597334677) & 0xFFFFFFFF;
        positionSeed = (positionSeed + blockY * 1403630841) & 0xFFFFFFFF;
        
        const random = new BedrockRandom(positionSeed);
        
        // Lógica de geração por altura
        const distanceFromSolid = Math.abs(currentY - solidLayer);
        let isBedrock = false;
        
        if (distanceFromSolid <= 4) {
          const threshold = 5 - distanceFromSolid;
          const roll = random.nextInt(5);
          isBedrock = roll < threshold;
        }
        
        bedrockPattern.push(isBedrock);
      }
      
      return bedrockPattern;
    }

    function matchesPattern(worldSeed, startX, startZ, pattern, gridSize, layer, dimension, version) {
      const centerOffset = Math.floor(gridSize / 2);
      const baseY = parseInt(layer);
      
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          const worldX = startX + (col - centerOffset);
          const worldZ = startZ + (row - centerOffset);
          
          const bedrockLayers = generateBedrockBedrock(worldSeed, worldX, worldZ, baseY, dimension, version);
          const hasBedrock = bedrockLayers[0];
          
          if (pattern[row][col] !== hasBedrock) {
            return false;
          }
        }
      }
      
      return true;
    }

    self.onmessage = function(e) {
      const { seed, pattern, gridSize, layer, dimension, version, workerId, quadrant } = e.data;
      const worldSeed = parseInt(seed);
      
      let radius = 2500;
      let found = false;
      let tested = 0;
      const updateInterval = 50;
      
      let xStart, xEnd, zStart, zEnd;
      
      switch(quadrant) {
        case 0: xStart = 0; xEnd = radius; zStart = 0; zEnd = radius; break;
        case 1: xStart = -radius; xEnd = 0; zStart = 0; zEnd = radius; break;
        case 2: xStart = 0; xEnd = radius; zStart = -radius; zEnd = 0; break;
        case 3: xStart = -radius; xEnd = 0; zStart = -radius; zEnd = 0; break;
      }
      
      while (!found && radius <= 25000) {
        for (let x = xStart; x <= xEnd; x += 1) {
          for (let z = zStart; z <= zEnd; z += 1) {
            tested++;
            
            if (tested % updateInterval === 0) {
              self.postMessage({
                type: 'progress',
                workerId: workerId,
                x: x,
                z: z,
                tested: tested,
                radius: radius * 4
              });
            }
            
            if (matchesPattern(worldSeed, x, z, pattern, gridSize, layer, dimension, version)) {
              self.postMessage({
                type: 'found',
                workerId: workerId,
                x: x,
                z: z,
                tested: tested
              });
              found = true;
              return;
            }
          }
        }
        
        if (!found) {
          radius += 2500;
          xStart = quadrant === 1 || quadrant === 3 ? -radius : 0;
          xEnd = quadrant === 0 || quadrant === 2 ? radius : 0;
          zStart = quadrant === 2 || quadrant === 3 ? -radius : 0;
          zEnd = quadrant === 0 || quadrant === 1 ? radius : 0;
          
          self.postMessage({
            type: 'progress',
            workerId: workerId,
            x: 0,
            z: 0,
            tested: tested,
            radius: radius * 4,
            expanding: true
          });
        }
      }
      
      if (!found) {
        self.postMessage({
          type: 'notfound',
          workerId: workerId,
          tested: tested
        });
      }
    };
  `;

  const blob = new Blob([workerCode], { type: 'application/javascript' });
  return URL.createObjectURL(blob);
}
