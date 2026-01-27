import { useEffect, useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useParams } from 'react-router';

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function SingleProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState();

  useEffect(() => {
    const handleView = async (id) => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/${API_PATH}/product/${id}`,
        );
        setProduct(res.data.product);
      } catch (error) {
        toast.error(
          `取得商品資料失敗: ${error.response?.data?.message}，請洽工作人員`,
        );
      }
    };
    handleView(id);
  }, [id]);

  const addCart = async (id, qty = 1) => {
    try {
      const data = {
        product_id: id,
        qty,
      };
      const res = await axios.post(`${API_BASE}/api/${API_PATH}/cart`, {
        data,
      });
      toast.success(`${res.data.message}`);
    } catch (error) {
      toast.error(
        `加入購物車失敗: ${error.response?.data?.message}，請洽工作人員`,
      );
    }
  };

  return (
    <>
      {!product ? (
        <div className="text-center mt-5">載入中...</div>
      ) : (
        <>
          <h1>商品詳細頁</h1>
          <Toaster position="top-right" reverseOrder={false} />
          <div className="container mt-5">
            <div className="card mb-3">
              {/* 主圖 */}
              <img
                src={product.imageUrl}
                className="card-img-top primary-image"
                alt="主圖"
              />
              <div className="card-body">
                {/* 標題、類別、風格 */}
                <div className="mb-3">
                  <span className="badge bg-primary ms-2">
                    {product.category}
                  </span>
                  {product.style && (
                    <span className="badge bg-secondary ms-2">
                      {product.style}
                    </span>
                  )}
                </div>
                <h5 className="card-title">{product.title}</h5>

                {/* 材料 / 顏色 / 尺寸 */}
                <div className="card-text d-flex mb-2">
                  <p className="mb-0 me-2">材料：</p>
                  <p className="mb-0">{product.description || '-'}</p>
                </div>
                <div className="card-text d-flex mb-2">
                  <p className="mb-0 me-2">顏色：</p>
                  <p className="mb-0">{product.color || '-'}</p>
                </div>
                <div className="card-text d-flex mb-2">
                  <p className="mb-0 me-2">尺寸：</p>
                  <p className="mb-0">{product.size || '-'}</p>
                </div>

                {/* 商品程度 / 故事 */}
                <div className="card-text d-flex mb-2">
                  <p className="mb-0 me-2">商品程度：</p>
                  <p className="mb-0">{product.level || '-'}</p>
                </div>
                <div className="card-text d-flex mb-2 ">
                  <p className="mb-0 me-2 text-nowrap">商品故事：</p>
                  <p className="mb-0 text-start">{product.story || '-'}</p>
                </div>

                {/* 價格、數量、單位 */}
                <div className="d-flex mb-2 justify-content-evenly">
                  <p className="card-text text-secondary me-3">
                    原價：
                    <del>{product.origin_price}</del> 元
                  </p>
                  <p className="card-text me-3">售價：{product.price} 元</p>
                  <p className="card-text">
                    數量：{product.qty} {product.unit}
                  </p>
                </div>

                {/* 更多圖片 */}
                {product.imagesUrl?.length > 0 && (
                  <>
                    <h5 className="mt-3 text-start">更多圖片：</h5>
                    <div className="d-flex flex-wrap">
                      {product.imagesUrl.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          className="images me-2 mb-2 object-fit-cover"
                          style={{ height: '200px' }}
                          alt={`副圖 ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
                <div className="">
                  <button
                    className="btn btn-primary w-100"
                    onClick={() => addCart(product.id)}
                  >
                    加入購物車
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
export default SingleProduct;
