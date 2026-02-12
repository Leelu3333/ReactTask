import { useState, useEffect } from 'react';

function SingleProductModal({ product, addCart, closeModal }) {
  const [cartQty, setCartQty] = useState(1);

  useEffect(() => {
    if (product) {
      setCartQty(1);
    }
  }, [product]);

  const handleAddCart = () => {
    addCart(product.id, cartQty);
    closeModal();
    setCartQty(1);
  };
  // 如果沒有資料，先回傳一個空的結構，避免讀取 product.title 報錯
  if (!product)
    return (
      <div className="modal fade" id="productModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content"></div>
        </div>
      </div>
    );
  return (
    <div className="modal" id="productModal">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">產品名稱：{product.title}</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <img className="w-100" src={product.imageUrl} />
            <p className="mt-3">產品內容：{product.description}</p>
            <p>產品描述：{product.story}</p>
            <p>
              價錢：<del>原價 ${product.origin_price}</del>，特價：$
              {product.price}
            </p>
            <div className="d-flex align-items-center">
              <label style={{ width: '150px' }}>購買數量：</label>
              <button
                className="btn btn-danger"
                type="button"
                id="button-addon1"
                aria-label="Decrease quantity"
                onClick={() => setCartQty((pre) => (pre === 1 ? 1 : pre - 1))}
              >
                <i className="fa-solid fa-minus"></i>
              </button>
              <input
                className="form-control"
                type="number"
                min="1"
                max="10"
                value={cartQty}
                onChange={(e) => setCartQty(Number(e.target.value))}
              />
              <button
                className="btn btn-primary"
                type="button"
                id="button-addon2"
                aria-label="Decrease quantity"
                onClick={() => setCartQty((pre) => pre + 1)}
              >
                <i className="fa-solid fa-plus"></i>
              </button>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleAddCart()}
            >
              加入購物車
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default SingleProductModal;
