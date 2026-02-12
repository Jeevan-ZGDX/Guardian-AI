import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, ShieldCheck, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen pt-20 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3], 
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-teal/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, -45, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 right-0 w-2/3 h-2/3 bg-gold/5 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-light via-white to-gold-light">
          Campus Issue <br /> Resolution
        </h1>
        <p className="text-gray-400 text-xl max-w-2xl mx-auto">
          Secure, transparent, and AI-powered complaint tracking on the blockchain.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full px-4">
        <RoleCard 
          to="/student"
          title="Student"
          description="Raise issues, track status, and improve your campus environment."
          icon={<User size={48} />}
          color="teal"
          delay={0.2}
        />
        <RoleCard 
          to="/vendor"
          title="Vendor"
          description="Manage inventory, verify issues, and submit voice reports."
          icon={<ShieldCheck size={48} />}
          color="gold"
          delay={0.4}
        />
      </div>
    </div>
  );
};

const RoleCard = ({ to, title, description, icon, color, delay }) => {
  const isTeal = color === 'teal';
  
  return (
    <Link to={to} className="block group">
      <motion.div
        initial={{ opacity: 0, x: isTeal ? -50 : 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay }}
        whileHover={{ scale: 1.05, y: -5 }}
        className={`relative p-8 rounded-2xl border backdrop-blur-sm transition-all duration-300 h-full
          ${isTeal ? 'border-teal/30 bg-teal/5 hover:border-teal hover:shadow-[0_0_30px_rgba(20,184,166,0.3)]' 
                   : 'border-gold/30 bg-gold/5 hover:border-gold hover:shadow-[0_0_30px_rgba(251,191,36,0.3)]'}
        `}
      >
        <div className={`mb-6 p-4 rounded-full w-fit ${isTeal ? 'bg-teal/20 text-teal-light' : 'bg-gold/20 text-gold-light'}`}>
          {icon}
        </div>
        <h3 className={`text-3xl font-bold mb-3 ${isTeal ? 'text-teal-light' : 'text-gold-light'}`}>
          {title}
        </h3>
        <p className="text-gray-400 mb-6 leading-relaxed">
          {description}
        </p>
        <div className={`flex items-center space-x-2 font-medium ${isTeal ? 'text-teal' : 'text-gold'}`}>
          <span>Get Started</span>
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </motion.div>
    </Link>
  );
};

export default LandingPage;
