import { useEffect, useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router';

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function Products() {
  // 所有產品資料
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  // 取得所有商品資料
  useEffect(() => {
    const getData = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/${API_PATH}/products/all`);
        setProducts(res.data.products);
      } catch (error) {
        toast.error(
          `取得所有商品資料失敗: ${error.response?.data?.message}，請洽工作人員`,
        );
      }
    };
    getData();
  }, []);

  const handleView = (id) => {
    navigate(`/product/${id}`);
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <h1 className="text-center">商品列表</h1>
      <div className="container mt-5">
        <div className="row">
          {products.map((item) => (
            <div className="col-md-4 mb-4" key={item.id}>
              <div className="card h-100">
                {/* h-100 讓同列卡片等高 */}
                <img
                  src={item.imageUrl}
                  className="card-img-top object-fit-cover"
                  style={{ height: '200px' }} // 固定高度
                  alt={item.title}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title text-truncate">{item.title}</h5>
                  {/* text-truncate 防止標題過長 */}
                  <p
                    className="card-text text-secondary"
                    style={{ fontSize: '0.9rem' }}
                  >
                    {/* 限制描述文字行數 */}
                    {item.story?.length > 50
                      ? `${item.story.substring(0, 50)}...`
                      : item.story}
                  </p>
                  <div className="mt-auto">
                    {/* mt-auto 將價格與按鈕推至底部對齊 */}
                    <p className="card-text text-end">
                      <del className="text-muted">${item.origin_price}</del>
                      <span className="text-danger ms-2 fw-bold">
                        ${item.price}
                      </span>
                    </p>
                    <button
                      className="btn btn-primary w-100"
                      onClick={() => handleView(item.id)}
                    >
                      查看細節
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
export default Products;
