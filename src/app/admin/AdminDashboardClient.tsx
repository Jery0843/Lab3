'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import AdminSecurityDashboard from '@/components/AdminSecurityDashboard';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSync, FaServer, FaGraduationCap, FaTimes, FaSave, FaChartBar, FaCog, FaUser, FaShieldAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface Machine {
  id: string;
  name: string;
  os: string;
  difficulty: string;
  status: string;
  dateCompleted: string | null;
  tags: string[];
  writeup: string | null;
}

interface THMRoom {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  status: string;
  tags: string[];
  writeup: string | null;
  roomCode: string;
  dateCompleted: string | null;
}

export default function AdminDashboardClient() {
  const [activeTab, setActiveTab] = useState<'htb' | 'thm' | 'stats' | 'security'>('htb');
  
  // HTB State
  const [htbMachines, setHtbMachines] = useState<Machine[]>([]);
  const [showHtbModal, setShowHtbModal] = useState(false);
  const [selectedHtbMachine, setSelectedHtbMachine] = useState<Machine | null>(null);
  
  // THM State
  const [thmRooms, setThmRooms] = useState<THMRoom[]>([]);
  const [showThmModal, setShowThmModal] = useState(false);
  const [selectedThmRoom, setSelectedThmRoom] = useState<THMRoom | null>(null);
  
  // Stats State
  const [showHtbStatsModal, setShowHtbStatsModal] = useState(false);
  const [showThmStatsModal, setShowThmStatsModal] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch HTB machines
      const htbResponse = await fetch('/api/admin/htb-machines-d1');
      if (htbResponse.ok) {
        const htbData = await htbResponse.json();
        setHtbMachines(Array.isArray(htbData) ? htbData : htbData.machines || []);
      }

      // Fetch THM rooms
      const thmResponse = await fetch('/api/admin/thm-rooms-d1');
      if (thmResponse.ok) {
        const thmData = await thmResponse.json();
        setThmRooms(Array.isArray(thmData) ? thmData : thmData.rooms || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    }
  };

  const handleHtbSubmit = async (machineData: Omit<Machine, 'id'>) => {
    try {
      const url = '/api/admin/htb-machines-d1';
      const method = selectedHtbMachine ? 'PUT' : 'POST';
      const body = selectedHtbMachine ? { ...machineData, id: selectedHtbMachine.id } : machineData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (response.ok) {
        fetchData();
        setShowHtbModal(false);
        setSelectedHtbMachine(null);
        setError('✅ HTB machine saved successfully!');
        setTimeout(() => setError(null), 3000);
      } else {
        throw new Error('Failed to save machine');
      }
    } catch (error) {
      setError('❌ Failed to save HTB machine');
    }
  };

  const handleThmSubmit = async (roomData: Omit<THMRoom, 'id'>) => {
    try {
      const url = '/api/admin/thm-rooms-d1';
      const method = selectedThmRoom ? 'PUT' : 'POST';
      const body = selectedThmRoom ? { ...roomData, id: selectedThmRoom.id } : roomData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (response.ok) {
        fetchData();
        setShowThmModal(false);
        setSelectedThmRoom(null);
        setError('✅ THM room saved successfully!');
        setTimeout(() => setError(null), 3000);
      } else {
        throw new Error('Failed to save room');
      }
    } catch (error) {
      setError('❌ Failed to save THM room');
    }
  };

  const handleDelete = async (id: string, type: 'htb' | 'thm') => {
    if (!confirm(`Are you sure you want to delete this ${type.toUpperCase()} item?`)) return;

    try {
      const url = type === 'htb' ? `/api/admin/htb-machines-d1?id=${id}` : `/api/admin/thm-rooms-d1?id=${id}`;
      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        fetchData();
        setError(`✅ ${type.toUpperCase()} item deleted successfully!`);
        setTimeout(() => setError(null), 3000);
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      setError(`❌ Failed to delete ${type.toUpperCase()} item`);
    }
  };

  return (
    <Layout>
      <div className="py-8 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-cyber font-bold text-cyber-green mb-2">ADMIN DASHBOARD</h1>
          <p className="text-cyber-blue">Manage HTB machines and THM rooms</p>
        </motion.div>

        {/* Error/Success Banner */}
        {error && (
          <div className={`mb-6 p-4 rounded-lg border ${error.includes('✅') ? 'bg-green-900/20 border-green-500/50 text-green-400' : 'bg-red-900/20 border-red-500/50 text-red-400'}`}>
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-gray-400 hover:text-white">×</button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-6 mb-8">
          <button
            onClick={() => setActiveTab('htb')}
            className={`px-8 py-4 rounded-xl font-bold transition-all border-2 ${
              activeTab === 'htb'
                ? 'bg-cyber-green text-black border-cyber-green shadow-lg transform scale-105'
                : 'bg-black/30 text-cyber-green border-cyber-green/50 hover:bg-cyber-green/10 hover:border-cyber-green'
            }`}
          >
            <FaServer className="inline mr-3 text-lg" />
            HTB Machines ({htbMachines.length})
          </button>
          <button
            onClick={() => setActiveTab('thm')}
            className={`px-8 py-4 rounded-xl font-bold transition-all border-2 ${
              activeTab === 'thm'
                ? 'bg-cyber-purple text-white border-cyber-purple shadow-lg transform scale-105'
                : 'bg-black/30 text-cyber-purple border-cyber-purple/50 hover:bg-cyber-purple/10 hover:border-cyber-purple'
            }`}
          >
            <FaGraduationCap className="inline mr-3 text-lg" />
            THM Rooms ({thmRooms.length})
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-8 py-4 rounded-xl font-bold transition-all border-2 ${
              activeTab === 'stats'
                ? 'bg-cyber-blue text-white border-cyber-blue shadow-lg transform scale-105'
                : 'bg-black/30 text-cyber-blue border-cyber-blue/50 hover:bg-cyber-blue/10 hover:border-cyber-blue'
            }`}
          >
            <FaChartBar className="inline mr-3 text-lg" />
            Stats & Settings
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-8 py-4 rounded-xl font-bold transition-all border-2 ${
              activeTab === 'security'
                ? 'bg-red-500 text-white border-red-500 shadow-lg transform scale-105'
                : 'bg-black/30 text-red-400 border-red-500/50 hover:bg-red-500/10 hover:border-red-500'
            }`}
          >
            <FaShieldAlt className="inline mr-3 text-lg" />
            Security
          </button>
        </div>

        {/* Security Tab */}
        {activeTab === 'security' && (
          <AdminSecurityDashboard />
        )}

        {/* Other tabs content would go here - HTB, THM, Stats */}
        {activeTab === 'htb' && (
          <div>
            <h2 className="text-2xl font-bold text-cyber-green mb-4">HTB Machines</h2>
            <p className="text-gray-400">HTB machines management interface</p>
          </div>
        )}

        {activeTab === 'thm' && (
          <div>
            <h2 className="text-2xl font-bold text-cyber-purple mb-4">THM Rooms</h2>
            <p className="text-gray-400">THM rooms management interface</p>
          </div>
        )}

        {activeTab === 'stats' && (
          <div>
            <h2 className="text-2xl font-bold text-cyber-blue mb-4">Stats & Settings</h2>
            <p className="text-gray-400">Statistics and settings management</p>
          </div>
        )}
      </div>
    </Layout>
  );
}