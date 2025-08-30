import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';

import CustomCheckbox from '../../utils/CustomCheckbox';

const AccordionCategory = ({ title, topics, isActive, isLoadingTopics, onClick, selectedTopics, onTopicToggle, limit }) => (
      <div className="border-b border-slate-200">
    <button onClick={onClick} className={`w-full flex justify-between items-center p-3 text-left transition-colors ${isActive ? 'text-emerald-600 bg-emerald-100' : 'text-slate-800 hover:bg-slate-100'}`}>
      <span className="font-medium">{title}</span>
      <ChevronDown size={20} className={`transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`} />
    </button>
    <AnimatePresence>
      {isActive && (
                 <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden bg-white">
          <div className="p-3">
            {isLoadingTopics ? (
                             <div className="flex items-center justify-center p-4"><Loader2 className="animate-spin text-emerald-600"/></div>
            ) : (
                             <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2">
                 {topics.map(topic => {
                   const isChecked = selectedTopics.some(t => t.id === topic.id);
                   const isDisabled = !isChecked && selectedTopics.length >= limit;
                   return (
                     <div key={topic.id} className={`p-2 rounded-md transition-colors ${isDisabled ? 'opacity-60' : 'hover:bg-slate-100'}`}>
                         <CustomCheckbox id={`topic-${topic.id}`} label={topic.name} checked={isChecked} onChange={() => { if (!isDisabled) { onTopicToggle(topic); }}}/>
                     </div>
                   );
                 })}
               </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const IntentTopicModal = ({ isOpen, onClose, currentOptions, setCurrentOptions }) => {
  const [categories, setCategories] = useState([]);
  const [topicsCache, setTopicsCache] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [limit, setLimit] = useState(6);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const fetchInitialData = async () => {
        setIsLoading(true);
        try {
          const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GET_BUYING_INTENT_CATEGORIES}`);
          const data = await res.json();
          setCategories(data.data?.categories || []);
          setLimit(data.data?.intent_data_topics_limit || 6);
        } catch (error) {
          toast.error("Failed to load buying intent categories.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchInitialData();
    } else {
      setActiveCategory(null);
      setSelectedTopics([]);
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  const handleCategoryClick = async (category) => {
    const newActiveCategory = activeCategory === category ? null : category;
    setActiveCategory(newActiveCategory);
    if (newActiveCategory && !topicsCache[newActiveCategory]) {
      setIsLoadingTopics(true);
      try {
        const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GET_BUYING_INTENT_IDS_PER_CATEGORY}?catagory=${encodeURIComponent(newActiveCategory)}`);
        const data = await res.json();
        setTopicsCache(prev => ({ ...prev, [newActiveCategory]: data.data?.intents || [] }));
      } catch (error) {
        toast.error(`Failed to load topics for ${newActiveCategory}.`);
      } finally {
        setIsLoadingTopics(false);
      }
    }
  };

  const handleTopicToggle = (topic) => {
    const isSelected = selectedTopics.some(t => t.id === topic.id);
    if (isSelected) {
      setSelectedTopics(prev => prev.filter(t => t.id !== topic.id));
    } else {
      if (selectedTopics.length < limit) {
        setSelectedTopics(prev => [...prev, topic]);
      } else {
        toast.warn(`You can select a maximum of ${limit} topics.`);
      }
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    const newTopicNames = selectedTopics.map(t => t.name);
    const updatedOptions = [...new Set([...currentOptions, ...newTopicNames])];
    setCurrentOptions(updatedOptions);

    toast.success("Buying intent options updated!");
    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 1000);
  };
  
  const topicsForActiveCategory = activeCategory ? topicsCache[activeCategory] || [] : [];

  return (
    <AnimatePresence>
      {isOpen && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[90vh] md:h-[85vh] flex flex-col overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0">
            <h2 className="text-lg font-semibold text-slate-800">Intent Topic Settings</h2>
            <button onClick={onClose} disabled={isSaving} className="p-1 rounded-full hover:bg-slate-100 disabled:opacity-50"><X size={20} /></button>
          </header>
                      <div className="flex flex-col md:flex-row flex-grow overflow-y-auto md:overflow-hidden">
              <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-slate-200 overflow-y-auto">
                              {isLoading ? (
                  <div className="flex items-center justify-center h-full p-6"><Loader2 className="animate-spin text-emerald-600" size={24}/></div>
              ) : (
                categories.map(category => (<AccordionCategory key={category} title={category} topics={topicsForActiveCategory} isActive={activeCategory === category} isLoadingTopics={isLoadingTopics && activeCategory === category} onClick={() => handleCategoryClick(category)} selectedTopics={selectedTopics} onTopicToggle={handleTopicToggle} limit={limit}/>))
              )}
            </div>
            <div className="w-full h-48 md:h-auto overflow-hidden md:w-1/2 bg-slate-50 p-4 flex flex-col flex-shrink-0">
              <div className='flex items-center justify-between'>
                <h3 className="font-semibold text-slate-800 mb-2">Selected Topics</h3>
                <span className={`font-medium text-sm px-2 py-0.5 rounded-full ${selectedTopics.length === limit ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-600'}`}>{selectedTopics.length} / {limit}</span>
              </div>
              <div className="flex-grow border border-slate-200 rounded-md p-3 bg-white overflow-y-auto min-h-[150px]">
                {selectedTopics.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-sm text-slate-500 text-center py-4">No topics selected.</div>
                ) : (
                  <div className='space-y-1'>{selectedTopics.map(topic => (<div key={topic.id} className="flex justify-between items-center text-sm text-slate-700 p-1.5 bg-slate-100 rounded-md"><span>{topic.name}</span><button onClick={() => handleTopicToggle(topic)} className="p-0.5 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600"><X size={14}/></button></div>))}</div>
                )}
              </div>
            </div>
          </div>
          <footer className="flex items-center justify-end p-2 md:p-4 border-t border-slate-200 space-x-3 flex-shrink-0 bg-white">
            <button onClick={onClose} disabled={isSaving} className="py-2 px-4 font-semibold rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 transition-colors">Close</button>
            <button onClick={handleSave} disabled={isSaving || selectedTopics.length === 0} className="flex items-center justify-center w-28 h-10 py-2 px-4 font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-emerald-500/40">
              {isSaving ? <Loader2 className="animate-spin"/> : 'Save'}
            </button>
          </footer>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntentTopicModal;
