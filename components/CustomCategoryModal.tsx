
import React, { useState } from 'react';
import { X, Plus, Trash2, Save, FolderPlus, Lock, Unlock, Eye, EyeOff, UserPlus } from 'lucide-react';
import { CustomCategory, CustomItem } from '../types.ts';

interface CustomCategoryModalProps {
  onClose: () => void;
  onSave: (category: CustomCategory) => void;
  initialData?: CustomCategory;
}

interface InternalCustomItem extends CustomItem {
  isLocked: boolean;
}

const CustomCategoryModal: React.FC<CustomCategoryModalProps> = ({ onClose, onSave, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [items, setItems] = useState<InternalCustomItem[]>(
    initialData?.items.map(item => ({ ...item, isLocked: true })) || 
    [{ word: '', hint: '', isLocked: false }]
  );

  const addItem = () => {
    setItems(prev => [
      ...prev.map(item => ({ ...item, isLocked: true })),
      { word: '', hint: '', isLocked: false }
    ]);
  };
  
  const updateItem = (index: number, field: keyof CustomItem, value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const toggleLock = (index: number) => {
    const newItems = [...items];
    newItems[index].isLocked = !newItems[index].isLocked;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    } else {
      setItems([{ word: '', hint: '', isLocked: false }]);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const validItems = items.filter(i => i.word.trim() && i.hint.trim());
    if (validItems.length === 0) return;

    onSave({
      id: initialData?.id || Date.now().toString(),
      name: name.trim(),
      items: validItems.map(({ word, hint }) => ({ word, hint }))
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-800 w-full max-w-lg rounded-3xl border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-700 flex items-center justify-between flex-shrink-0">
          <div className="flex flex-col">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <FolderPlus className="text-indigo-400" />
              {initialData ? 'Edit Category' : 'New Custom Category'}
            </h3>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">Secret Entry Mode Active</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          <div>
            <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Category Name</label>
            <input 
              type="text" 
              placeholder="e.g., Family Secrets"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white transition-all shadow-inner"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest">Secret Items</label>
              <button 
                onClick={addItem}
                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 uppercase tracking-widest bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20 transition-all hover:bg-indigo-500/20"
              >
                <Plus className="w-3 h-3" /> Add Next Secret
              </button>
            </div>
            
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={idx} className={`relative transition-all duration-300 ${
                  item.isLocked 
                    ? 'bg-slate-900/40 border-slate-700/50 p-3 rounded-xl border border-dashed opacity-80' 
                    : 'bg-slate-900 p-5 rounded-2xl border-2 border-indigo-500/50 shadow-lg scale-[1.02]'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                        item.isLocked ? 'bg-slate-800 text-slate-500' : 'bg-indigo-500 text-white'
                      }`}>
                        SECRET #{idx + 1}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleLock(idx)} className="p-2 text-slate-400 hover:text-indigo-400">
                        {item.isLocked ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button onClick={() => removeItem(idx)} className="p-2 text-slate-500 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {!item.isLocked ? (
                    <div className="grid grid-cols-1 gap-4">
                      <input 
                        type="text" 
                        placeholder="Secret Word"
                        value={item.word}
                        onChange={(e) => updateItem(idx, 'word', e.target.value)}
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl outline-none text-white"
                      />
                      <textarea 
                        placeholder="Hint"
                        value={item.hint}
                        onChange={(e) => updateItem(idx, 'hint', e.target.value)}
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl outline-none text-white resize-none"
                      />
                    </div>
                  ) : (
                    <div className="text-[9px] text-slate-600 font-bold uppercase italic py-2">Encrypted</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-700 flex-shrink-0">
          <button 
            onClick={handleSave}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold rounded-2xl shadow-lg"
          >
            SAVE CATEGORY
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomCategoryModal;
