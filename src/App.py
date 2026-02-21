import React, { useState } from 'react';
import Navbar from './components/Navbar';
import BedrockFinder from './components/BedrockFinder';
import OreFinder from './components/OreFinder';
import ChunkBase from './components/ChunkBase';

export default function App() {
  const [activeTab, setActiveTab] = useState('bedrock');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-gray-100 pb-24">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="pt-4">
        {activeTab === 'bedrock' && <BedrockFinder />}
        {activeTab === 'ore' && <OreFinder />}
        {activeTab === 'chunk' && <ChunkBase />}
      </div>

      <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent backdrop-blur-md border-t border-purple-500/20 py-4 z-40">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
            Desenvolvido por Masterotaku
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Motor de busca multi-core • 
            {activeTab === 'bedrock' && ' Bedrock Coordinate Finder'}
            {activeTab === 'ore' && ' Ore Finder'}
            {activeTab === 'chunk' && ' Chunk Base'}
          </p>
        </div>
      </footer>
    </div>
  );
}
