import React, { useState, useEffect } from 'react';
import { PlusCircle, MinusCircle, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { OrderItem, MenuItem } from '../types';

export default function NewOrder() {
  const [tableNumber, setTableNumber] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para o termo de pesquisa

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
    } finally {
      setLoading(false);
    }
  };

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
      setLoading(false); // Garante que o loading seja false após o envio
    }
  };

  // Função para filtrar os itens do menu com base no termo de pesquisa
  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-50 rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Novo Pedido</h1>
  
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Número da Mesa */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número da Mesa
          </label>
          <input
            type="number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200"
            min="1"
            required
          />
        </div>
  
        {/* Seleção de Itens e Quantidade */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Barra de Pesquisa e Lista de Itens */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item
              </label>
              <input
                type="text"
                placeholder="Pesquisar item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200"
              />
              {/* Lista de Itens Filtrados */}
              <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                {filteredMenuItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item.id)}
                    className={`p-2 cursor-pointer hover:bg-blue-50 transition duration-200 ${
                      selectedItem === item.id ? 'bg-blue-100 border-l-4 border-blue-500' : 'border-l-4 border-transparent'
                    }`}
                  >
                    <span className="font-medium text-gray-800">{item.name}</span>
                    <span className="block text-sm text-gray-600">R$ {item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
  
            {/* Quantidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200"
                min="1"
              />
            </div>
          </div>
  
          {/* Botão de Adicionar Item */}
          <button
            type="button"
            onClick={addItem}
            className="w-full flex items-center justify-center py-2 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-md shadow-md hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
          >
            <PlusCircle size={20} className="mr-2" />
            Adicionar ao Pedido
          </button>
        </div>
  
        {/* Lista de Itens Adicionados */}
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition duration-200"
            >
              <div>
                <span className="font-medium text-gray-800">{item.name}</span>
                <div className="text-sm text-gray-600">
                  {item.quantity}x R$ {item.price.toFixed(2)}
                </div>
              </div>
              <div className="flex items-center">
                <span className="mr-4 font-medium text-gray-800">
                  R$ {(item.quantity * item.price).toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200"
                >
                  <MinusCircle size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
  
        {/* Total do Pedido */}
        {items.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-xl font-bold text-right text-gray-800">
              Total: R$ {calculateTotal().toFixed(2)}
            </div>
          </div>
        )}
  
        {/* Botão de Enviar Pedido */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center py-2 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-md shadow-md hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} className="mr-2" />
          {loading ? 'Enviando...' : 'Enviar Pedido'}
        </button>
      </form>
    </div>
  );
}