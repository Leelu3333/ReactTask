import { createHashRouter } from 'react-router-dom';
import FrontendLayout from './layout/FrontendLayout';
import Home from './views/front/Home';
import Products from './views/front/Products';
import SingleProduct from './views/front/SingleProduct';
import Cart from './views/front/Cart';
import NotFound from './views/front/NotFound';
import Checkout from './views/front/Checkout';
import Login from './views/front/Login';
import AdminLayout from './layout/AdminLayout';
import AdminProducts from './views/admin/AdminProducts';
import AdminHome from './views/admin/AdminHome';
import ProtectedRoute from './components/ProtectedRoute';

export const router = createHashRouter([
  // --- 前台 ---
  {
    path: '/',
    element: <FrontendLayout />,
    children: [
      {
        index: true,
        element: <Home />, //首頁
      },
      {
        path: 'product',
        element: <Products />,
      },
      {
        path: 'product/:id',
        element: <SingleProduct />,
      },
      {
        path: 'cart',
        element: <Cart />,
      },
      {
        path: 'checkout',
        element: <Checkout />,
      },
      {
        path: 'login',
        element: <Login />,
      },
    ],
  },
  // --- 後台 ---
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminHome />,
      },
      {
        path: 'products',
        element: <AdminProducts />,
      },
    ],
  },
  {
    path: '*', // 404 頁面
    element: <NotFound />,
  },
]);
