import React, { useState, useEffect } from 'react';
import { PlusCircle, MinusCircle, Send, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { OrderItem, MenuItem } from '../types';

export default function NewOrder() {
  const [tableNumber, setTableNumber] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('active', true)
        .order('category', { ascending: true });

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      alert('Erro ao carregar o cardápio');
    }
  };

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addItem = () => {
    if (!selectedItem) {
      alert('Por favor selecione um item do cardápio');
      return;
    }

    if (quantity < 1) {
      alert('A quantidade deve ser maior que zero');
      return;
    }

    const menuItem = menuItems.find(item => item.id === selectedItem);
    if (!menuItem) {
      alert('Item não encontrado no cardápio');
      return;
    }

    setItems([...items, {
      menu_item_id: menuItem.id,
      name: menuItem.name,
      quantity: quantity,
      price: menuItem.price
    }]);

    setSelectedItem('');
    setQuantity(1);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tableNumber) {
      alert('Por favor informe o número da mesa');
      return;
    }

    if (items.length === 0) {
      alert('Por favor adicione pelo menos um item ao pedido');
      return;
    }

    if (loading) {
      return; // Previne múltiplos envios
    }

    try {
      setLoading(true);
      const total = calculateTotal();

      const { error } = await supabase
        .from('orders')
        .insert([{
          table_number: parseInt(tableNumber),
          items: items,
          status: 'pending',
          total: total
        }]);

      if (error) throw error;

      setTableNumber('');
      setItems([]);
      setSelectedItem('');
      setQuantity(1);
      alert('Pedido enviado com sucesso!');
    } catch (error: any) {
      console.error('Error submitting order:', error);
      alert(error.message || 'Erro ao enviar pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Novo Pedido</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Número da Mesa
          </label>
          <input
            type="number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            min="1"
            required
          />
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Pesquisar item ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Item
                </label>
                <select
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Selecione um item</option>
                  {filteredMenuItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} - R$ {item.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Quantidade
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="1"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={addItem}
            className="mt-4 w-full flex items-center justify-center py-2 text-blue-600 hover:text-blue-800"
          >
            <PlusCircle size={24} className="mr-2" />
            Adicionar ao Pedido
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
              <div>
                <span className="font-medium">{item.name}</span>
                <div className="text-sm text-gray-600">
                  {item.quantity}x R$ {item.price.toFixed(2)}
                </div>
              </div>
              
              <div className="flex items-center">
                <span className="mr-4 font-medium">
                  R$ {(item.quantity * item.price).toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <MinusCircle size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-xl font-bold text-right">
              Total: R$ {calculateTotal().toFixed(2)}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} className="mr-2" />
          {loading ? 'Enviando...' : 'Enviar Pedido'}
        </button>
      </form>
    </div>
  );
}