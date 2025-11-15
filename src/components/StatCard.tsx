import { motion } from 'framer-motion';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  delay?: number;
}

export default function StatCard({ icon, label, value, delay = 0 }: StatCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + delay, duration: 0.4 }} className="bg-terminal-bg/50 border border-cyber-green/20 p-4 rounded-lg flex items-center space-x-4 hover:bg-cyber-green/10 transition-colors">
      <div className="text-cyber-green text-2xl">{icon}</div>
      <div><div className="text-xs text-gray-400 uppercase tracking-wider">{label}</div><div className="font-bold text-base text-white">{value}</div></div>
    </motion.div>
  );
}