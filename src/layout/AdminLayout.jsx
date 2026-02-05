import { Outlet, Link } from 'react-router';

const AdminLayout = () => {
  return (
    <div>
      <header>
        <ul className="nav">
          <li className="nav-item">
            <Link className="nav-link active" to="/admin">
              後臺首頁
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link active" to="/admin/products">
              商品列表
            </Link>
          </li>
        </ul>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="mt-5 text-center">
        <p>© 2025 我的網站</p>
      </footer>
    </div>
  );
};
export default AdminLayout;
