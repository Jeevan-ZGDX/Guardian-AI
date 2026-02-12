import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, AlertTriangle, CheckCircle, Loader, Type, FileText, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
  const { token, user } = useAuth();
  const [formStep, setFormStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      const response = await axios.post('http://localhost:8000/api/issues', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubmissionResult(response.data);
      setFormStep(2); // Success step
    } catch (error) {
      console.error("Submission failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setFormStep(p => p + 1);
  const prevStep = () => setFormStep(p => p - 1);

  return (
    <div className="min-h-screen pt-24 px-4 flex flex-col items-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-teal/20 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-20 left-20 w-64 h-64 bg-gold/10 rounded-full blur-[100px] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-white mb-2">Raise an Issue</h2>
          <p className="text-gray-400">Welcome, {user?.full_name || 'Student'}. Help us maintain standards.</p>
        </div>

        <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 h-1 bg-gray-800 w-full">
            <motion.div 
              className="h-full bg-gradient-to-r from-teal to-gold"
              initial={{ width: '0%' }}
              animate={{ width: `${(formStep + 1) * 33.33}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <AnimatePresence mode='wait'>
            {formStep === 0 && (
              <Step1_Details 
                key="step1" 
                data={formData} 
                onChange={handleInputChange} 
                onNext={nextStep} 
              />
            )}
            {formStep === 1 && (
              <Step2_Review 
                key="step2" 
                data={formData} 
                onSubmit={handleSubmit} 
                onPrev={prevStep} 
                isSubmitting={isSubmitting} 
              />
            )}
            {formStep === 2 && (
              <Step3_Success 
                key="step3" 
                result={submissionResult} 
                onReset={() => {
                  setFormData({ title: '', description: '' });
                  setFormStep(0);
                  setSubmissionResult(null);
                }} 
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

const Step1_Details = ({ data, onChange, onNext }) => (
  <motion.div
    initial={{ x: 50, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: -50, opacity: 0 }}
    className="space-y-6"
  >
    <div className="flex items-center space-x-3 text-gold-light mb-6">
      <div className="p-3 bg-gold/10 rounded-xl"><Type size={24} /></div>
      <h3 className="text-2xl font-bold">What's the issue?</h3>
    </div>

    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-400 ml-1">Title</label>
        <input
          name="title"
          value={data.title}
          onChange={onChange}
          placeholder="e.g. Broken Projector"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-400 ml-1">Description</label>
        <textarea
          name="description"
          value={data.description}
          onChange={onChange}
          placeholder="Describe the issue in detail..."
          rows={4}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all resize-none"
        />
      </div>
    </div>

    <div className="flex justify-end mt-8">
      <button 
        onClick={onNext}
        disabled={!data.title || !data.description}
        className="px-8 py-3 bg-gold text-black font-bold rounded-xl hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
      >
        <span>Review</span>
        <ArrowRight size={18} />
      </button>
    </div>
  </motion.div>
);

const Step2_Review = ({ data, onSubmit, onPrev, isSubmitting }) => (
  <motion.div
    initial={{ x: 50, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: -50, opacity: 0 }}
    className="space-y-6"
  >
    <div className="flex items-center space-x-3 text-teal-light mb-6">
      <div className="p-3 bg-teal/10 rounded-xl"><FileText size={24} /></div>
      <h3 className="text-2xl font-bold">Review Submission</h3>
    </div>

    <div className="bg-white/5 rounded-2xl p-6 space-y-4 border border-white/10">
      <div>
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Title</span>
        <p className="text-lg text-white font-medium">{data.title}</p>
      </div>
      <div>
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</span>
        <p className="text-gray-300">{data.description}</p>
      </div>
      <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-gold">
        <AlertTriangle size={16} />
        <span className="text-sm">This will be recorded on the blockchain.</span>
      </div>
    </div>

    <div className="flex justify-between mt-8">
      <button onClick={onPrev} className="px-6 py-3 text-gray-400 hover:text-white transition-colors">
        Back
      </button>
      <button 
        onClick={onSubmit}
        disabled={isSubmitting}
        className="px-8 py-3 bg-gradient-to-r from-teal to-teal-dark text-white font-bold rounded-xl shadow-lg shadow-teal/20 hover:shadow-teal/40 disabled:opacity-50 transition-all flex items-center space-x-2"
      >
        {isSubmitting ? <Loader className="animate-spin" size={20} /> : <Send size={20} />}
        <span>{isSubmitting ? 'Submitting...' : 'Submit Issue'}</span>
      </button>
    </div>
  </motion.div>
);

const Step3_Success = ({ result, onReset }) => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="text-center py-8"
  >
    <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
      <CheckCircle size={40} />
    </div>
    <h3 className="text-3xl font-bold text-white mb-2">Issue Submitted!</h3>
    <p className="text-gray-400 mb-8">Your issue has been recorded on the blockchain.</p>

    <div className="bg-black/40 rounded-xl p-4 mb-8 text-left space-y-2 border border-white/10 font-mono text-sm">
      <div className="flex justify-between">
        <span className="text-gray-500">Status</span>
        <span className="text-teal font-bold">{result.status}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500">Severity</span>
        <span className={`font-bold ${result.severity === 3 ? 'text-red-500' : 'text-yellow-500'}`}>Level {result.severity}</span>
      </div>
      <div className="pt-2 border-t border-white/10">
        <span className="text-gray-500 block mb-1">Block Hash</span>
        <span className="text-xs text-gray-600 break-all">{result.block_hash}</span>
      </div>
    </div>

    <button 
      onClick={onReset}
      className="px-8 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all"
    >
      Raise Another Issue
    </button>
  </motion.div>
);

export default StudentDashboard;
