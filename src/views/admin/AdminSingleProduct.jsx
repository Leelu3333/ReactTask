function AdminSingleProduct({ tempProduct, setTempProduct }) {
  // 如果沒有資料，就不渲染任何內容，避免報錯
  if (!tempProduct) return null;

  return (
    <>
      <div
        className="modal-backdrop fade show"
        onClick={() => setTempProduct(null)}
      ></div>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-scrollable modal-lg">
          <div className="modal-content">
            <div className="p-3 text-end">
              <button
                className="btn-close"
                onClick={() => setTempProduct(null)}
              />
            </div>
            <div className="modal-body">
              <div className="card mb-3">
                {/* 主圖 */}
                <img
                  src={tempProduct.imageUrl}
                  className="card-img-top primary-image"
                  alt="主圖"
                />
                <div className="card-body">
                  {/* 標題、類別、風格 */}
                  <div className="mb-3">
                    <span className="badge bg-primary ms-2">
                      {tempProduct.category}
                    </span>
                    {tempProduct.style && (
                      <span className="badge bg-secondary ms-2">
                        {tempProduct.style}
                      </span>
                    )}
                  </div>
                  <h5 className="card-title">{tempProduct.title}</h5>

                  {/* 材料 / 顏色 / 尺寸 */}
                  <div className="card-text d-flex mb-2">
                    <p className="mb-0 me-2">材料：</p>
                    <p className="mb-0">{tempProduct.description || '-'}</p>
                  </div>
                  <div className="card-text d-flex mb-2">
                    <p className="mb-0 me-2">顏色：</p>
                    <p className="mb-0">{tempProduct.color || '-'}</p>
                  </div>
                  <div className="card-text d-flex mb-2">
                    <p className="mb-0 me-2">尺寸：</p>
                    <p className="mb-0">{tempProduct.size || '-'}</p>
                  </div>

                  {/* 商品程度 / 故事 */}
                  <div className="card-text d-flex mb-2">
                    <p className="mb-0 me-2">商品程度：</p>
                    <p className="mb-0">{tempProduct.level || '-'}</p>
                  </div>
                  <div className="card-text d-flex mb-2 ">
                    <p className="mb-0 me-2 text-nowrap">商品故事：</p>
                    <p className="mb-0 text-start">
                      {tempProduct.story || '-'}
                    </p>
                  </div>

                  {/* 是否啟用 */}
                  <div className="card-text d-flex mb-2 ">
                    <p className="mb-0 me-2 text-nowrap">狀態：</p>
                    <p className="mb-0 text-start">
                      {tempProduct.is_enabled ? '啟用' : '未啟用'}
                    </p>
                  </div>

                  {/* 價格、數量、單位 */}
                  <div className="d-flex mb-2 justify-content-evenly">
                    <p className="card-text text-secondary me-3">
                      原價：
                      <del>{tempProduct.origin_price}</del> 元
                    </p>
                    <p className="card-text me-3">
                      售價：{tempProduct.price} 元
                    </p>
                    <p className="card-text">
                      數量：{tempProduct.qty} {tempProduct.unit}
                    </p>
                  </div>

                  {/* 更多圖片 */}
                  {tempProduct.imagesUrl?.length > 0 && (
                    <>
                      <h5 className="mt-3 text-start">更多圖片：</h5>
                      <div className="d-flex flex-wrap">
                        {tempProduct.imagesUrl.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            className="images me-2 mb-2"
                            alt={`副圖 ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default AdminSingleProduct;
