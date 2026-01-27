import { Outlet, Link } from 'react-router';

const FrontendLayout = () => {
  return (
    <div>
      <header>
        <ul className="nav">
          <li className="nav-item">
            <Link className="nav-link active" to="/">
              首頁
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link active" to="/product">
              商品列表頁面
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link active" to="/cart">
              購物車頁面
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
export default FrontendLayout;
