import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Save, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { WishlistItem } from '../../types';
import { guestService } from '../../services/guest.service';
import { Button } from '../common/Button';

interface GuestWishlistManagerProps {
  initialWishlist: WishlistItem[];
  onLogout: () => void;
}

export const GuestWishlistManager: React.FC<GuestWishlistManagerProps> = ({ initialWishlist, onLogout }) => {
  const { t } = useTranslation();
  const [items, setItems] = useState<WishlistItem[]>(initialWishlist);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const resetForm = () => {
    setItemName('');
    setDescription('');
    setPriority('medium');
    setIsAdding(false);
    setEditingId(null);
    setError('');
  };

  const handleAdd = async () => {
    if (!itemName.trim()) return;
    setLoading(true);
    setError('');
    try {
      const id = await guestService.addItem({
        item_name: itemName,
        description,
        priority
      });

      // Optimistic update or just add
      const newItem: WishlistItem = {
        id,
        birthday_id: '', // Not needed for display
        tenant_id: '',
        item_name: itemName,
        description,
        priority,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setItems([newItem, ...items]);
      resetForm();
    } catch (err) {
      console.error(err);
      setError(t('guest.sessionExpired'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingId || !itemName.trim()) return;
    setLoading(true);
    setError('');
    try {
      await guestService.updateItem(editingId, {
        item_name: itemName,
        description,
        priority
      });

      setItems(items.map(item => item.id === editingId ? {
        ...item,
        item_name: itemName,
        description,
        priority,
        updated_at: new Date().toISOString()
      } : item));
      
      resetForm();
    } catch (err) {
      console.error(err);
      setError(t('guest.updateError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('guest.deleteConfirm'))) return;
    setLoading(true);
    try {
      await guestService.deleteItem(id);
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
      setError(t('guest.deleteError'));
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item: WishlistItem) => {
    setEditingId(item.id);
    setItemName(item.item_name);
    setDescription(item.description || '');
    setPriority(item.priority);
    setIsAdding(false);
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'text-red-500 bg-red-50';
      case 'medium': return 'text-orange-500 bg-orange-50';
      case 'low': return 'text-green-500 bg-green-50';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">{t('guest.myWishlist')}</h2>
        <Button variant="secondary" size="sm" onClick={onLogout}>
            {t('guest.exit')}
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {!isAdding && !editingId && (
        <Button onClick={() => setIsAdding(true)} className="w-full">
            <Plus className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {t('guest.addNewItem')}
        </Button>
      )}

      {(isAdding || editingId) && (
        <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm space-y-4">
          <h3 className="font-semibold text-gray-700">{isAdding ? t('guest.addNewItem') : t('guest.editItem')}</h3>
          
          <div className="space-y-3">
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('wishlist.itemName')}</label>
                <input
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder={t('wishlist.itemNamePlaceholder')}
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('wishlist.description')}</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none h-20"
                    placeholder={t('wishlist.descriptionPlaceholder')}
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('wishlist.priority')}</label>
                <div className="flex gap-2">
                    {(['high', 'medium', 'low'] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPriority(p)}
                            className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${
                                priority === p 
                                    ? 'border-purple-500 bg-purple-50 text-purple-700' 
                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {t(`wishlist.${p}`)}
                        </button>
                    ))}
                </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={isAdding ? handleAdd : handleUpdate} isLoading={loading} className="flex-1">
                <Save className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {t('guest.save')}
            </Button>
            <Button variant="outline" onClick={resetForm} disabled={loading}>
                {t('guest.cancel')}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {items.length === 0 && !isAdding && (
            <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                {t('guest.emptyWishlist')}
            </div>
        )}
        
        {items.map((item) => (
            <div key={item.id} className={`bg-white p-4 rounded-xl border border-gray-100 shadow-sm transition-all ${editingId === item.id ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex justify-between items-start gap-3">
                    <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(item.priority)}`}>
                                {t(`wishlist.${item.priority}`)}
                            </span>
                            <h4 className="font-medium text-gray-800">{item.item_name}</h4>
                        </div>
                        {item.description && (
                            <p className="text-sm text-gray-500 mt-1 whitespace-pre-wrap">{item.description}</p>
                        )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                        <button 
                            onClick={() => startEdit(item)}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};
