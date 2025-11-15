'use client';

import { useState } from 'react';
import { FaSearch, FaTimes, FaTools, FaNewspaper, FaComments } from 'react-icons/fa';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('tools');

  if (!isOpen) return null;

  const handleSearch = () => {
    if (searchTerm.trim()) {
      window.location.href = `/${selectedSection}?search=${encodeURIComponent(searchTerm.trim())}`;
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200]">
      <div className="glass-panel p-6 rounded-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-cyber-green">
            <span data-text="SEARCH DATABASE">
              SEARCH DATABASE
            </span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-cyber-green transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Search Input */}
        <div className="mb-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyber-green/60" />
            <input
              type="text"
              placeholder="Enter search term..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full bg-terminal-bg border border-cyber-green/50 pl-10 pr-4 py-3 rounded text-cyber-green focus:border-cyber-green focus:outline-none"
              autoFocus
            />
          </div>
        </div>

        {/* Section Selection */}
        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-2">Search in:</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSelectedSection('tools')}
              className={`flex flex-col items-center p-3 rounded border transition-all ${
                selectedSection === 'tools'
                  ? 'bg-cyber-green/20 border-cyber-green text-cyber-green'
                  : 'border-cyber-green/30 text-gray-400 hover:border-cyber-green/60'
              }`}
            >
              <FaTools className="mb-1" />
              <span className="text-xs">Tools</span>
            </button>
            <button
              onClick={() => setSelectedSection('news')}
              className={`flex flex-col items-center p-3 rounded border transition-all ${
                selectedSection === 'news'
                  ? 'bg-cyber-blue/20 border-cyber-blue text-cyber-blue'
                  : 'border-cyber-green/30 text-gray-400 hover:border-cyber-green/60'
              }`}
            >
              <FaNewspaper className="mb-1" />
              <span className="text-xs">News</span>
            </button>
            <button
              onClick={() => setSelectedSection('forums')}
              className={`flex flex-col items-center p-3 rounded border transition-all ${
                selectedSection === 'forums'
                  ? 'bg-cyber-purple/20 border-cyber-purple text-cyber-purple'
                  : 'border-cyber-green/30 text-gray-400 hover:border-cyber-green/60'
              }`}
            >
              <FaComments className="mb-1" />
              <span className="text-xs">Forums</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={handleSearch}
            disabled={!searchTerm.trim()}
            className="flex-1 bg-cyber-green text-black py-2 px-4 rounded hover:bg-cyber-blue transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            SEARCH
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-transparent border border-cyber-green text-cyber-green py-2 px-4 rounded hover:bg-cyber-green hover:text-black transition-colors"
          >
            CANCEL
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Tip: Press Enter to search, Escape to close
          </p>
        </div>
      </div>
    </div>
  );
}
