import React, { useEffect, useState } from 'react';
import { PlusCircle, Trash2, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { MenuItem } from '../types';

export default function MenuManagement() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    description: '',
    category: ''
  });

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('category', { ascending: true });

    if (error) {
      console.error('Error:', error);
      return;
    }

    setItems(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newItem.name || !newItem.price) {
      alert('Por favor preencha nome e preço');
      return;
    }

    try {
      const { error } = await supabase
        .from('menu_items')
        .insert([{
          name: newItem.name,
          price: parseFloat(newItem.price),
          description: newItem.description,
          category: newItem.category,
          active: true
        }]);

      if (error) throw error;

      setNewItem({ name: '', price: '', description: '', category: '' });
      fetchMenu();
    } catch (error) {
      console.error('Error:', error);
      alert('Erro ao adicionar item');
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ active: false })
        .eq('id', id);

      if (error) throw error;
      
      fetchMenu();
    } catch (error) {
      console.error('Error:', error);
      alert('Erro ao remover item');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Gerenciar Cardápio</h1>
      
      <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Preço</label>
            <input
              type="number"
              step="0.01"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Categoria</label>
            <input
              type="text"
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Descrição</label>
            <input
              type="text"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Save size={20} className="mr-2" />
          Adicionar Item
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.filter(item => item.active).map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-md p-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-green-600 font-medium">
                  R$ {item.price.toFixed(2)}
                </p>
                {item.description && (
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                )}
                {item.category && (
                  <p className="text-xs text-gray-500 mt-1">
                    Categoria: {item.category}
                  </p>
                )}
              </div>
              <button
                onClick={() => deleteItem(item.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}