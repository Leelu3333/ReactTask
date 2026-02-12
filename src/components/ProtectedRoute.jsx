import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { RotatingLines, RotatingSquare } from 'react-loader-spinner';

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function ProtectedRoute({ children }) {
  // 登入狀態管理
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  // 驗證
  useEffect(() => {
    // 檢查登入狀態
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('hexToken='))
      ?.split('=')[1];

    if (token) {
      axios.defaults.headers.common.Authorization = token;
    }

    // 檢查管理員權限並載入資料
    const checkLoggIn = async () => {
      try {
        await axios.post(`${API_BASE}/api/user/check`);
        setIsAuth(true);
      } catch (error) {
        console.log(error.response?.data?.message);
      } finally {
        setLoading(false);
      }
    };
    checkLoggIn();
  }, []);

  if (loading)
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh', // 滿螢幕高度
        }}
      >
        <RotatingLines
          strokeColor="red"
          strokeWidth="5"
          animationDuration="0.75"
          width="96"
          visible={true}
        />
      </div>
    );
  if (!isAuth) return <Navigate to="/login" />;

  return children;
}

export default ProtectedRoute;
