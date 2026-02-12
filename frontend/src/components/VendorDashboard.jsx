import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Mic, Link as LinkIcon, RefreshCw, Check, Upload, FileAudio } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const VendorDashboard = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  
  return (
    <div className="min-h-screen pt-20 px-4 pb-10 bg-black text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gold mb-2">Vendor Dashboard</h1>
            <p className="text-gray-400">Manage resources and verify resolutions.</p>
          </div>
          
          <div className="flex space-x-2 mt-4 md:mt-0 bg-white/5 p-1 rounded-xl">
            <TabButton id="inventory" label="Inventory" icon={<Package size={18} />} active={activeTab} onClick={setActiveTab} />
            <TabButton id="reports" label="Voice Reports" icon={<Mic size={18} />} active={activeTab} onClick={setActiveTab} />
            <TabButton id="chain" label="Blockchain" icon={<LinkIcon size={18} />} active={activeTab} onClick={setActiveTab} />
          </div>
        </div>

        <div className="relative min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === 'inventory' && <InventoryPanel key="inventory" />}
            {activeTab === 'reports' && <VoiceReportPanel key="reports" />}
            {activeTab === 'chain' && <BlockchainPanel key="chain" />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ id, label, icon, active, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
      active ? 'bg-gold text-black font-bold shadow-lg shadow-gold/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const InventoryPanel = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/inventory', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInventory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async (id) => {
    try {
      const res = await axios.post(`http://localhost:8000/api/inventory/${id}/check`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Availability: ${res.data.available ? 'Available' : 'Out of Stock'} (Qty: ${res.data.qty})`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {loading ? (
        <div className="col-span-full flex justify-center py-20"><RefreshCw className="animate-spin text-gold" size={32} /></div>
      ) : (
        inventory.map((item) => (
          <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-gold/50 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gold/10 rounded-xl text-gold group-hover:bg-gold group-hover:text-black transition-colors">
                <Package size={24} />
              </div>
              <span className="text-xs font-mono text-gray-500">#{item.id}</span>
            </div>
            <h3 className="text-xl font-bold mb-1">{item.name}</h3>
            <p className="text-gray-400 mb-6">{item.qty} units in stock</p>
            <button 
              onClick={() => checkAvailability(item.id)}
              className="w-full py-2 bg-white/5 hover:bg-gold hover:text-black rounded-lg transition-colors text-sm font-medium"
            >
              Check Availability
            </button>
          </div>
        ))
      )}
    </motion.div>
  );
};

const VoiceReportPanel = () => {
  const [file, setFile] = useState(null);
  const [issueId, setIssueId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const { token } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !issueId) return;

    setSubmitting(true);
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('issue_id', issueId);

    try {
      const res = await axios.post('http://localhost:8000/api/report', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-gold mb-6 flex items-center gap-2">
          <Mic className="text-gold" /> Submit Voice Report
        </h2>
        
        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Issue ID (Copy from Blockchain)</label>
              <input
                value={issueId}
                onChange={(e) => setIssueId(e.target.value)}
                placeholder="Paste Issue ID here..."
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors"
              />
            </div>

            <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-gold/50 transition-colors">
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
                id="audio-upload"
              />
              <label htmlFor="audio-upload" className="cursor-pointer flex flex-col items-center gap-4">
                <div className="p-4 bg-white/5 rounded-full">
                  {file ? <FileAudio className="text-gold" size={32} /> : <Upload className="text-gray-400" size={32} />}
                </div>
                <span className="text-gray-300 font-medium">
                  {file ? file.name : "Click to upload voice recording"}
                </span>
                <span className="text-xs text-gray-500">Supports WAV, MP3, M4A</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!file || !issueId || submitting}
              className="w-full py-4 bg-gold text-black font-bold rounded-xl hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2"
            >
              {submitting ? <RefreshCw className="animate-spin" /> : <Check />}
              <span>Submit Report</span>
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
              <div className="flex items-center gap-3 text-green-400 mb-4">
                <Check className="w-6 h-6" />
                <h3 className="font-bold text-lg">Report Processed Successfully</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between p-3 bg-black/20 rounded-lg">
                  <span className="text-gray-400">Transcript</span>
                  <span className="text-white text-right max-w-[60%]">{result.report.transcript}</span>
                </div>
                <div className="flex justify-between p-3 bg-black/20 rounded-lg">
                  <span className="text-gray-400">Summary</span>
                  <span className="text-white text-right max-w-[60%]">{result.report.summary}</span>
                </div>
                <div className="flex justify-between p-3 bg-black/20 rounded-lg">
                  <span className="text-gray-400">Transaction Hash</span>
                  <span className="text-gold font-mono text-xs truncate ml-4">{result.block_hash}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => { setResult(null); setFile(null); setIssueId(''); }}
              className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-colors"
            >
              Submit Another
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const BlockchainPanel = () => {
  const [chain, setChain] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    axios.get('http://localhost:8000/api/chain', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setChain(res.data.chain))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      {loading ? (
        <div className="flex justify-center py-20"><RefreshCw className="animate-spin text-gold" size={32} /></div>
      ) : (
        <div className="relative border-l-2 border-gold/20 ml-6 space-y-8 py-4">
          {chain.map((block, idx) => (
            <div key={block.hash} className="relative pl-8">
              {/* Timeline Node */}
              <div className="absolute -left-[11px] top-6 w-5 h-5 rounded-full bg-black border-4 border-gold" />
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-gold/30 transition-colors">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-2">
                  <span className="text-gold font-mono text-sm font-bold">Block #{block.index}</span>
                  <span className="text-gray-500 text-xs font-mono">{new Date(block.timestamp * 1000).toLocaleString()}</span>
                </div>
                
                <div className="bg-black/50 rounded-xl p-4 font-mono text-xs text-gray-300 overflow-x-auto">
                  <div className="grid grid-cols-[80px_1fr] gap-2 mb-2">
                    <span className="text-gray-500">Hash:</span>
                    <span className="text-teal truncate">{block.hash}</span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-2 mb-2">
                    <span className="text-gray-500">Prev:</span>
                    <span className="text-gray-600 truncate">{block.prev_hash}</span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-2">
                    <span className="text-gray-500">Data:</span>
                    <span className="text-white whitespace-pre-wrap break-all">
                      {typeof block.data === 'string' && block.data.startsWith('{') 
                        ? JSON.stringify(JSON.parse(block.data), null, 2) 
                        : block.data}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default VendorDashboard;
