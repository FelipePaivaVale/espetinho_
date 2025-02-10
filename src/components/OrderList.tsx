import React, { useEffect, useState, useRef } from 'react';
import { Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Order } from '../types';

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const isMounted = useRef(true); // Para evitar loops desnecessários

  // Função para buscar pedidos
  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar pedidos:', error);
      return;
    }

    if (isMounted.current) {
      setOrders(data || []);
    }
  };

  useEffect(() => {
    isMounted.current = true; // Marca o componente como montado
    fetchOrders(); // Carrega pedidos na montagem

    const interval = setInterval(() => {
      fetchOrders();
    }, 3000);

    return () => {
      isMounted.current = false; // Marca como desmontado
      clearInterval(interval); // Evita loops infinitos
    };
  }, []);

  // Função para concluir pedido
  const completeOrder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', id);

      if (error) throw error;

      // Remove o pedido localmente para evitar recarregar a lista toda hora
      setOrders((prevOrders) => prevOrders.filter(order => order.id !== id));
    } catch (error) {
      console.error('Erro ao completar pedido:', error);
      alert('Erro ao completar pedido');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Pedidos Pendentes</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Mesa {order.table_number}</h2>
              <button
                onClick={() => completeOrder(order.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={20} />
              </button>
            </div>
            
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <div>
                    <span>{item.name}</span>
                    <span className="text-sm text-gray-600 ml-2">
                      (R$ {item.price.toFixed(2)})
                    </span>
                  </div>
                  <span className="font-medium">x{item.quantity}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {new Date(order.created_at).toLocaleTimeString()}
              </span>
              <span className="font-bold text-green-600">
                Total: R$ {order.total.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          Nenhum pedido pendente
        </div>
      )}
    </div>
  );
}
