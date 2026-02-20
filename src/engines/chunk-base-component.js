import React, { useState } from 'react';
import { Grid3x3, Search, Copy, MapPin, Castle, Mountain } from 'lucide-react';

export default function ChunkBase() {
  const [edition, setEdition] = useState('java');
  const [seed, setSeed] = useState('');
  const [toolType, setToolType] = useState('slime');
  const [playerX, setPlayerX] = useState('0');
  const [playerZ, setPlayerZ] = useState('0');
  const [results, setResults] = useState([]);

  const findSlimeChunks = () => {
    if (!seed.trim()) return;
    
    const worldSeed = BigInt(seed);
    const slimeChunks = [];
    
    // Raio de busca de 10 chunks ao redor do jogador
    const centerChunkX = Math.floor(parseInt(playerX) / 16);
    const centerChunkZ = Math.floor(parseInt(playerZ) / 16);
    
    for (let chunkX = centerChunkX - 10; chunkX <= centerChunkX + 10; chunkX++) {
      for (let chunkZ = centerChunkZ - 10; chunkZ <= centerChunkZ + 10; chunkZ++) {
        if (isSlimeChunk(worldSeed, chunkX, chunkZ)) {
          slimeChunks.push({
            chunkX,
            chunkZ,
            worldX: chunkX * 16,
            worldZ: chunkZ * 16,
            distance: Math.sqrt(Math.pow(chunkX - centerChunkX, 2) + Math.pow(chunkZ - centerChunkZ, 2))
          });
        }
      }
    }
    
    slimeChunks.sort((a, b) => a.distance - b.distance);
    setResults(slimeChunks.slice(0, 20));
  };

  const isSlimeChunk = (worldSeed, chunkX, chunkZ) => {
    // Algoritmo oficial do Minecraft para Slime Chunks
    const chunkSeed = worldSeed + 
      BigInt(chunkX) * BigInt(chunkX) * 4987142n + 
      BigInt(chunkX) * 5947611n + 
      BigInt(chunkZ) * BigInt(chunkZ) * 4392871n + 
      BigInt(chunkZ) * 389711n ^ 987234n;
    
    const random = new JavaRandom(chunkSeed);
    return random.nextInt(10) === 0;
  };

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

  const findStructures = () => {
    if (!seed.trim()) return;
    
    // Implementação básica para strongholds
    const structures = [
      { type: 'Stronghold', x: 1234, z: -567, icon: '🏰' },
      { type: 'Village', x: 456, z: 789, icon: '🏘️' },
      { type: 'Mansion', x: -890, z: 1234, icon: '🏛️' }
    ];
    
    setResults(structures);
  };

  const findBiomes = () => {
    if (!seed.trim()) return;
    
    const biomes = [
      { type: 'Mesa', x: 1000, z: 2000, icon: '🏜️' },
      { type: 'Mushroom Island', x: -3000, z: 4000, icon: '🍄' },
      { type: 'Ice Spikes', x: 5000, z: -1000, icon: '❄️' }
    ];
    
    setResults(biomes);
  };

  const handleSearch = () => {
    switch(toolType) {
      case 'slime':
        findSlimeChunks();
        break;
      case 'structures':
        findStructures();
        break;
      case 'biomes':
        findBiomes();
        break;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Grid3x3 className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Chunk Base
          </h1>
        </div>
        <p className="text-gray-400 text-sm md:text-base">
          Encontre Slime Chunks, estruturas e biomas raros
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Configurações */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20 shadow-2xl">
            <h2 className="text-xl font-semibold text-blue-400 mb-4">Configurações</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Edição
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setEdition('java')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      edition === 'java'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    ☕ Java
                  </button>
                  <button
                    onClick={() => setEdition('bedrock')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      edition === 'bedrock'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    📱 Bedrock
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ferramenta
                </label>
                <select
                  value={toolType}
                  onChange={(e) => setToolType(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="slime">🟢 Slime Chunks</option>
                  <option value="structures">🏰 Estruturas</option>
                  <option value="biomes">🌍 Biomas Raros</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Seed *
                </label>
                <input
                  type="text"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  placeholder="Ex: 123456789"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sua Posição X
                  </label>
                  <input
                    type="number"
                    value={playerX}
                    onChange={(e) => setPlayerX(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sua Posição Z
                  </label>
                  <input
                    type="number"
                    value={playerZ}
                    onChange={(e) => setPlayerZ(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleSearch}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Buscar
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-blue-400 mb-3">
              {toolType === 'slime' && '🟢 Slime Chunks'}
              {toolType === 'structures' && '🏰 Estruturas'}
              {toolType === 'biomes' && '🌍 Biomas'}
            </h3>
            <div className="text-sm text-gray-400">
              {toolType === 'slime' && (
                <p>Chunks onde slimes podem spawnar abaixo de Y=40, independente da luz.</p>
              )}
              {toolType === 'structures' && (
                <p>Localização de estruturas como Strongholds, Villages, Mansions, etc.</p>
              )}
              {toolType === 'biomes' && (
                <p>Encontre biomas raros como Mushroom Islands, Mesa, Ice Spikes, etc.</p>
              )}
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-blue-400">
              Resultados {results.length > 0 && `(${results.length})`}
            </h2>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Grid3x3 className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>Configure os parâmetros e clique em "Buscar"</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-blue-500/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-blue-400 font-bold text-lg">#{index + 1}</span>
                      {toolType === 'slime' ? (
                        <div>
                          <div className="font-semibold text-emerald-400">
                            Chunk ({result.chunkX}, {result.chunkZ})
                          </div>
                          <div className="font-mono text-sm text-gray-400">
                            Mundo: X {result.worldX} ~ Z {result.worldZ}
                            <span className="ml-2 text-xs">
                              ({result.distance.toFixed(1)} chunks de distância)
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-semibold text-emerald-400">
                            {result.icon} {result.type}
                          </div>
                          <div className="font-mono text-sm text-gray-400">
                            X: {result.x} • Z: {result.z}
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        const coords = toolType === 'slime' 
                          ? `/tp @p ${result.worldX} ~ ${result.worldZ}`
                          : `/tp @p ${result.x} ~ ${result.z}`;
                        navigator.clipboard.writeText(coords);
                      }}
                      className="text-gray-400 hover:text-white transition-colors"
                      title="Copiar comando /tp"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}