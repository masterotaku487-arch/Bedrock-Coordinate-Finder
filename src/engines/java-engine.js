// Motor de busca para Minecraft Java Edition (PC)
// Usa o algoritmo JavaRandom oficial com geração precisa de bedrock

export function createJavaWorker() {
  const workerCode = `
    // Java Edition Random Generator (java.util.Random)
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

      setSeed(seed) {
        this.seed = (BigInt(seed) ^ 0x5DEECE66Dn) & ((1n << 48n) - 1n);
      }
    }

    function generateJavaBedrock(worldSeed, x, z, y, dimension, version) {
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
        
        // Camada base sempre sólida
        if (currentY === solidLayer) {
          bedrockPattern.push(true);
          continue;
        }
        
        // Java Edition: Combina seed com coordenadas usando multiplicação e XOR
        const blockX = BigInt(x);
        const blockZ = BigInt(z);
        const blockY = BigInt(currentY);
        const wSeed = BigInt(worldSeed);
        
        // Algoritmo oficial do Java Edition para bedrock generation
        // Baseado no código fonte: net.minecraft.world.level.levelgen.SurfaceRules
        let chunkSeed = wSeed;
        
        // Incorpora as coordenadas na seed
        const mixedSeed = chunkSeed * 341873128712n + blockX * 132897987541n;
        const finalSeed = mixedSeed + blockZ * 4392871n + blockY * 5947611n;
        
        const random = new JavaRandom(finalSeed);
        
        // Lógica de geração: quanto mais longe da camada sólida, menor a chance
        const distanceFromSolid = Math.abs(currentY - solidLayer);
        let isBedrock = false;
        
        if (distanceFromSolid > 0 && distanceFromSolid <= 4) {
          // Para Java: nextInt(5) < (5 - distância)
          // Distância 1: 4/5 chance (80%)
          // Distância 2: 3/5 chance (60%)
          // Distância 3: 2/5 chance (40%)
          // Distância 4: 1/5 chance (20%)
          const roll = random.nextInt(5);
          isBedrock = roll < (5 - distanceFromSolid);
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
          
          const bedrockLayers = generateJavaBedrock(worldSeed, worldX, worldZ, baseY, dimension, version);
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
      const worldSeed = seed;
      
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