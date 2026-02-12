import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-teal/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-8 h-8 bg-gradient-to-tr from-teal to-gold rounded-lg"
            />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-light to-gold-light">
              TrackChain
            </span>
          </Link>

          <div className="flex space-x-4">
            <NavLink to="/" icon={<Home size={18} />} label="Home" active={isActive('/')} />
            <NavLink to="/student" icon={<User size={18} />} label="Student" active={isActive('/student')} />
            <NavLink to="/vendor" icon={<ShieldCheck size={18} />} label="Vendor" active={isActive('/vendor')} />
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, icon, label, active }) => (
  <Link to={to} className="relative group">
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
      active ? 'text-teal-light' : 'text-gray-400 hover:text-white'
    }`}>
      {icon}
      <span>{label}</span>
    </div>
    {active && (
      <motion.div
        layoutId="navbar-underline"
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold"
        initial={false}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    )}
  </Link>
);

export default Navbar;
