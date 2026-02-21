import React from 'react';
import { Map, Gem, Grid3x3, Info } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'bedrock', name: 'Bedrock Finder', icon: Map, color: 'emerald' },
    { id: 'ore', name: 'Ore Finder', icon: Gem, color: 'purple' },
    { id: 'chunk', name: 'Chunk Base', icon: Grid3x3, color: 'blue' }
  ];

  return (
    <nav className="bg-gray-800/50 backdrop-blur-sm border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Map className="w-8 h-8 text-emerald-400" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent">
                Minecraft Tools
              </h1>
              <p className="text-xs text-gray-500">by Masterotaku</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                    isActive
                      ? `bg-${tab.color}-600 text-white shadow-lg shadow-${tab.color}-500/50`
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden md:inline">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
