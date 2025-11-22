import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

function BottomSheet({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-b from-purple-900 to-indigo-900 rounded-t-3xl shadow-2xl max-h-[85vh] overflow-hidden safe-area-bottom"
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-white/30 rounded-full" />
            </div>
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            
            {/* Content */}
            <div className="overflow-y-auto mobile-scroll max-h-[calc(85vh-80px)] p-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default BottomSheet;