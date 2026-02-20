import React, { useState, useRef } from 'react';
import { Gem, Search, StopCircle, Copy, Download, AlertTriangle } from 'lucide-react';
import { ORE_TYPES, createOreWorker } from '../engines/OreEngine';

export default function OreFinder() {
  const [edition, setEdition] = useState('bedrock');
  const [seed, setSeed] = useState('');
  const [selectedOre, setSelectedOre] = useState('diamond');
  const [maxResults, setMaxResults] = useState(10);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState({ tested: 0, found: 0 });
  const [error, setError] = useState('');
  const workersRef = useRef([]);

  const startSearch = () => {
    setError('');
    setResults([]);
    setProgress({ tested: 0, found: 0 });
    
    if (!seed.trim()) {
      setError('A Seed é obrigatória!');
      return;
    }

    setIsSearching(true);
    
    const ore = ORE_TYPES[selectedOre];
    const workerUrl = createOreWorker(edition);
    const workers = [];
    let allResults = [];
    let completedWorkers = 0;

    for (let i = 0; i < 4; i++) {
      const worker = new Worker(workerUrl);
      workers.push(worker);
      
      worker.onmessage = function(e) {
        const { type } = e.data;
        
        if (type === 'progress') {
          setProgress(prev => ({
            tested: prev.tested + 1,
            found: prev.found
          }));
        } else if (type === 'ore_found') {
          allResults.push({ x: e.data.x, y: e.data.y, z: e.data.z });
          setResults([...allResults]);
          setProgress(prev => ({
            ...prev,
            found: allResults.length
          }));
        } else if (type === 'complete') {
          completedWorkers++;
          if (completedWorkers === 4) {
            setIsSearching(false);
            workers.forEach(w => w.terminate());
            URL.revokeObjectURL(workerUrl);
          }
        }
      };

      worker.postMessage({
        seed: seed,
        oreType: selectedOre,
        minY: ore.minY,
        maxY: ore.maxY,
        maxResults: Math.ceil(maxResults / 4),
        workerId: i,
        quadrant: i
      });
    }
    
    workersRef.current = workers;
  };

  const stopSearch = () => {
    workersRef.current.forEach(w => w.terminate());
    setIsSearching(false);
  };

  const copyResults = () => {
    const text = results.map(r => `/tp @p ${r.x} ${r.y} ${r.z}`).join('\n');
    navigator.clipboard.writeText(text);
  };

  const exportResults = () => {
    const data = `Ore Finder Results
Edition: ${edition}
Ore Type: ${ORE_TYPES[selectedOre].name}
Seed: ${seed}
Found: ${results.length} locations

Coordinates:
${results.map((r, i) => `${i + 1}. X: ${r.x}, Y: ${r.y}, Z: ${r.z}`).join('\n')}`;
    
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedOre}_locations.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Gem className="w-8 h-8 text-purple-400" />
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Ore Finder
          </h1>
        </div>
        <p className="text-gray-400 text-sm md:text-base">
          Encontre minérios preciosos no seu mundo do Minecraft
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Painel de Seleção */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 shadow-2xl">
            <h2 className="text-xl font-semibold text-purple-400 mb-4">Configurações</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Edição
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setEdition('java')}
                    disabled={isSearching}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      edition === 'java'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    } disabled:opacity-50`}
                  >
                    ☕ Java
                  </button>
                  <button
                    onClick={() => setEdition('bedrock')}
                    disabled={isSearching}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      edition === 'bedrock'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    } disabled:opacity-50`}
                  >
                    📱 Bedrock
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de Minério
                </label>
                <select
                  value={selectedOre}
                  onChange={(e) => setSelectedOre(e.target.value)}
                  disabled={isSearching}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:ring-2 focus:ring-purple-500 outline-none disabled:opacity-50"
                >
                  {Object.entries(ORE_TYPES).map(([key, ore]) => (
                    <option key={key} value={key}>
                      {ore.icon} {ore.name} (Y: {ore.minY} a {ore.maxY})
                    </option>
                  ))}
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
                  disabled={isSearching}
                  placeholder="Ex: 123456789"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 outline-none disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Máximo de Resultados
                </label>
                <input
                  type="number"
                  value={maxResults}
                  onChange={(e) => setMaxResults(parseInt(e.target.value))}
                  disabled={isSearching}
                  min="1"
                  max="50"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:ring-2 focus:ring-purple-500 outline-none disabled:opacity-50"
                />
              </div>

              {error && (
                <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {isSearching ? (
                <button
                  onClick={stopSearch}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <StopCircle className="w-5 h-5" />
                  Parar Busca
                </button>
              ) : (
                <button
                  onClick={startSearch}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-purple-500/50 flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Buscar Minérios
                </button>
              )}
            </div>
          </div>

          {/* Info do Minério */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-purple-400 mb-3">
              {ORE_TYPES[selectedOre].icon} {ORE_TYPES[selectedOre].name}
            </h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>• <strong>Altura:</strong> Y {ORE_TYPES[selectedOre].minY} até {ORE_TYPES[selectedOre].maxY}</p>
              <p>• <strong>Melhor Y:</strong> {ORE_TYPES[selectedOre].peakY}</p>
              <p>• <strong>Raridade:</strong> {ORE_TYPES[selectedOre].rarity}</p>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-purple-400">
              Resultados {results.length > 0 && `(${results.length})`}
            </h2>
            {results.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={copyResults}
                  className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-2 rounded-lg font-medium transition-all border border-blue-500/30 flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copiar
                </button>
                <button
                  onClick={exportResults}
                  className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 px-4 py-2 rounded-lg font-medium transition-all border border-emerald-500/30 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exportar
                </button>
              </div>
            )}
          </div>

          {isSearching && (
            <div className="mb-4 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-blue-400 font-semibold">Procurando...</span>
              </div>
              <div className="text-sm text-gray-400">
                Testadas: {progress.tested.toLocaleString()} posições • Encontradas: {progress.found}
              </div>
            </div>
          )}

          {results.length === 0 && !isSearching ? (
            <div className="text-center py-12 text-gray-500">
              <Gem className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>Configure os parâmetros e clique em "Buscar Minérios"</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-purple-500/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-purple-400 font-bold text-lg">#{index + 1}</span>
                      <div className="font-mono text-sm">
                        <span className="text-emerald-400">X: {result.x}</span>
                        <span className="text-gray-500 mx-2">•</span>
                        <span className="text-blue-400">Y: {result.y}</span>
                        <span className="text-gray-500 mx-2">•</span>
                        <span className="text-purple-400">Z: {result.z}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(`/tp @p ${result.x} ${result.y} ${result.z}`)}
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