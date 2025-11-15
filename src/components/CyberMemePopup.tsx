'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaLaugh, FaSync, FaShareAlt } from 'react-icons/fa';

interface Meme {
  url: string;
  topic: string;
  source: string;
  date: string;
  title: string;
  description?: string;
}

interface CyberMemePopupProps {
  onClose: () => void;
}

const CyberMemePopup = ({ onClose }: CyberMemePopupProps) => {
  const [meme, setMeme] = useState<Meme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('CyberMemePopup component mounted');

  const fetchMeme = async (refresh = false) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching meme...', refresh ? 'with refresh' : 'normal');
      const response = await fetch(`/api/cybersecurity-meme${refresh ? '?refresh=true' : ''}`, {
        cache: 'no-store'
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to fetch meme');
      }
      
      const data = await response.json();
      console.log('Meme data received:', data);
      
      if (data.success && data.meme) {
        setMeme(data.meme);
      } else {
        throw new Error(data.error || 'Invalid meme data received');
      }
    } catch (err) {
      console.error('Error fetching meme:', err);
      setError('Failed to load meme. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeme();
  }, []);

  const handleRefresh = () => {
    fetchMeme(true);
  };

  const handleShare = async () => {
    if (meme && navigator.share) {
      try {
        await navigator.share({
          title: meme.title,
          text: `Check out today's cybersecurity meme about ${meme.topic}!`,
          url: window.location.href
        });
      } catch (err) {
        // Fallback to clipboard copy
        navigator.clipboard.writeText(`${meme.title} - ${window.location.href}`);
      }
    } else if (meme) {
      // Fallback to clipboard copy
      navigator.clipboard.writeText(`${meme.title} - ${window.location.href}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-panel rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyber-purple/30">
          <div className="flex items-center space-x-3">
            <FaLaugh className="text-cyber-purple text-xl" />
            <h2 className="text-xl font-bold text-cyber-purple">Daily Cyber Meme</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-cyber-purple transition-colors p-1"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-cyber-purple border-t-transparent rounded-full mb-4"></div>
              <p className="text-gray-400">Loading today&apos;s cybersecurity meme...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={() => fetchMeme(true)}
                className="bg-cyber-purple text-white px-4 py-2 rounded-lg font-bold hover:bg-cyber-pink transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : meme ? (
            <div className="space-y-4">
              {/* Meme Title */}
              <div className="text-center">
                <h3 className="text-lg font-bold text-cyber-green mb-2">{meme.title}</h3>
                <p className="text-sm text-gray-400">
                  Topic: {meme.topic} • {meme.date}
                </p>
                {meme.source && (
                  <div className="flex items-center justify-center space-x-2 text-xs">
                    <span className={`px-2 py-1 rounded ${
                      meme.source === 'reddit' 
                        ? 'bg-orange-500/20 text-orange-400' 
                        : 'bg-cyber-purple/20 text-cyber-purple'
                    }`}>
                      {meme.source === 'reddit' ? '🔥 Reddit Fresh' : '💎 Curated Quality'}
                    </span>
                  </div>
                )}
              </div>

              {/* Meme Image */}
              <div className="bg-terminal-bg border border-cyber-purple/30 rounded-lg p-4">
                <div className="relative max-w-lg mx-auto">
                  <img
                    src={meme.url}
                    alt={`Cybersecurity meme about ${meme.topic}`}
                    className="w-full h-auto rounded-lg shadow-lg"
                    onError={(e) => {
                      // If image fails to load, show placeholder
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1lbWUgVW5hdmFpbGFibGU8L3RleHQ+PC9zdmc+';
                    }}
                  />
                </div>
                
                {/* Meme Caption */}
                {meme.description && (
                  <div className="mt-4 p-4 bg-cyber-green/10 border border-cyber-green/30 rounded-lg text-center">
                    <p className="text-lg font-bold text-cyber-green leading-relaxed">
                      {meme.description}
                    </p>
                    <div className="mt-2 flex items-center justify-center space-x-2 text-sm text-gray-400">
                      <span>🎯</span>
                      <span>
                        {meme.source === 'reddit' ? 'Fresh from Reddit Community' : 
                         meme.source === 'curated' ? 'Curated CyberSec Collection' : 'Generated'}
                      </span>
                      {meme.source === 'curated' && (
                        <span className="text-xs bg-cyber-green/20 text-cyber-green px-2 py-1 rounded">
                          Always Available
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center space-x-4 pt-4">
                <button
                  onClick={handleRefresh}
                  className="flex items-center space-x-2 bg-cyber-blue text-white px-4 py-2 rounded-lg font-bold hover:bg-cyber-blue/80 transition-colors"
                >
                  <FaSync />
                  <span>New Meme</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 bg-cyber-green text-white px-4 py-2 rounded-lg font-bold hover:bg-cyber-green/80 transition-colors"
                >
                  <FaShareAlt />
                  <span>Share</span>
                </button>
              </div>

              {/* Fun Facts */}
              <div className="bg-cyber-purple/10 border border-cyber-purple/30 rounded-lg p-4 mt-6">
                <h4 className="font-bold text-cyber-purple mb-2">💡 Did You Know?</h4>
                <p className="text-sm text-gray-300">
                  {meme.topic === 'SQL injection vulnerabilities' && "SQL injection attacks account for over 65% of web application attacks!"}
                  {meme.topic === 'Password security' && "The most common password in 2024 is still '123456' - don't be that person!"}
                  {meme.topic === 'Phishing attempts' && "95% of successful cyber attacks start with a phishing email!"}
                  {meme.topic === 'Social engineering' && "Human psychology is often the weakest link in cybersecurity!"}
                  {meme.topic === 'Two-factor authentication' && "2FA can block up to 99.9% of automated attacks!"}
                  {meme.topic === 'Penetration testing' && "Ethical hackers help companies find vulnerabilities before the bad guys do!"}
                  {meme.topic === 'Bug bounty hunting' && "Some bug bounty hunters earn over $1 million annually finding vulnerabilities!"}
                  {meme.topic === 'Ransomware attacks' && "Ransomware attacks happen every 11 seconds globally!"}
                  {!['SQL injection vulnerabilities', 'Password security', 'Phishing attempts', 'Social engineering', 'Two-factor authentication', 'Penetration testing', 'Bug bounty hunting', 'Ransomware attacks'].includes(meme.topic) && 
                    "Cybersecurity is a field that constantly evolves - stay curious and keep learning!"}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CyberMemePopup;
