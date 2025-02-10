import React from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ClipboardList, PlusCircle, Menu } from 'lucide-react';
import NewOrder from './components/NewOrder';
import OrderList from './components/OrderList';
import MenuManagement from './components/MenuManagement';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex space-x-8">
                <Link
                  to="/"
                  className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
                >
                  <PlusCircle className="mr-2" size={20} />
                  Novo Pedido
                </Link>
                <Link
                  to="/orders"
                  className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
                >
                  <ClipboardList className="mr-2" size={20} />
                  Ver Pedidos
                </Link>
                <Link
                  to="/menu"
                  className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
                >
                  <Menu className="mr-2" size={20} />
                  Cardápio
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="py-10">
          <Routes>
            <Route path="/" element={<NewOrder />} />
            <Route path="/orders" element={<OrderList />} />
            <Route path="/menu" element={<MenuManagement />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App