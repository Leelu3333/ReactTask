import { useState } from 'react';
import './assets/style.css';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function App() {
  // 表單資料狀態(儲存登入表單輸入)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  // 登入狀態管理(控制顯示登入或產品頁）
  const [isAuth, setIsAuth] = useState(false);
  // 產品資料狀態
  const [products, setProducts] = useState([]);
  // 目前選中的產品
  const [tempProduct, setTempProduct] = useState(null);
  // 頁面狀態
  const [page, setPage] = useState('home');
  // 新增的商品資料
  const [addProducts, setAddProducts] = useState({
    imageUrl: '', // 主圖
    imagesUrl: [], // 副圖
    is_enabled: '1', // 預設啟用
  });
  // 修改商品Modal 是否開啟
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 修改商品暫存資料
  const [editProductData, setEditProductData] = useState({});

  // 登入表單輸入處理
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData, // 保留原有屬性
      [name]: value, // 更新特定屬性
    }));
  };

  // 登入提交處理
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/admin/signin`, formData);
      const { token, expired } = res.data;
      // 儲存 Token 到 Cookie
      // eslint-disable-next-line
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;

      // 設定 axios 預設 header
      // eslint-disable-next-line
      axios.defaults.headers.common.Authorization = `${token}`;

      // 載入產品資料
      getData();

      // 更新登入狀態
      setIsAuth(true);
      setPage('home');
      toast.success('登入成功');
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  // 驗證
  const checkLoggIn = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/api/user/check`);
      toast.success('驗證成功');
      console.log(res);
    } catch (error) {
      toast.error(error.data.message);
    }
  };

  // 登出
  const checkLoggOut = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/logout`);
      // 清除登入狀態
      setIsAuth(false);

      // 清空所有資料
      setProducts([]);
      setTempProduct(null);
      setPage('home');
      setAddProducts({
        imageUrl: '', // 主圖
        imagesUrl: [], // 副圖
        is_enabled: '1', // 預設啟用
      });
      setFormData({
        username: '',
        password: '',
      });

      // 移除 token
      document.cookie = 'hexToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      delete axios.defaults.headers.common.Authorization;
      toast.success(res.data.message);
    } catch (error) {
      toast.error('登出失敗，請洽工作人員');
      console.log(error);
    }
  };

  // 取得所有商品資料
  const getData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`);
      setProducts(res.data.products);
    } catch (error) {
      toast.error(
        `取得所有商品資料失敗: ${error.response.data.message}，請洽工作人員`
      );
    }
  };

  // 商品表單輸入處理
  const handleAddProductChange = (e) => {
    const { name, value } = e.target;

    // 如果是副圖
    if (name.startsWith('imagesUrl')) {
      const index = parseInt(name.match(/\d+/)[0]); // 取 index
      setAddProducts((prevData) => {
        const images = prevData.imagesUrl ? [...prevData.imagesUrl] : [];
        images[index] = value;
        return { ...prevData, imagesUrl: images };
      });
    } else {
      setAddProducts((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  // 新增商品
  const addProductBtn = async (e) => {
    e.preventDefault();

    // 整理數字欄位
    const payload = {
      data: {
        ...addProducts,
        origin_price: Number(addProducts.origin_price) || 0,
        price: Number(addProducts.price) || 0,
        num: Number(addProducts.num) || 0,
        is_enabled: Number(addProducts.is_enabled),
      },
    };

    try {
      const res = await axios.post(
        `${API_BASE}/api/${API_PATH}/admin/product`,
        payload
      );
      toast.success('資料新增成功:', res.data);
      // 1️⃣ 清空新增商品表單
      setAddProducts({
        imageUrl: '',
        imagesUrl: [],
        is_enabled: '1',
      });

      // 2️⃣ 重新抓取產品資料
      getData();

      // 3️⃣ 切換頁面到商品列表
      setPage('products');
    } catch (error) {
      toast.error('新增失敗');
      console.log(error);
    }
  };

  // 刪除商品
  const deleteProduct = async (id) => {
    try {
      const res = await axios.delete(
        `${API_BASE}/api/${API_PATH}/admin/product/${id}`
      );
      getData();
      toast.success('資料刪除成功:', res.data);
      console.log();
    } catch (error) {
      toast.error('刪除資料時發生錯誤:', error);
    }
  };

  // 點擊修改按鈕時，打開 Modal 並把資料帶入
  const openEditModal = (product) => {
    setEditProductData({ ...product }); // 複製一份資料進暫存
    setIsEditModalOpen(true);
  };

  // 編輯商品表單輸入處理
  const handleEditProductChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('imagesUrl')) {
      const index = parseInt(name.match(/\d+/)[0]);
      setEditProductData((prevData) => {
        const images = prevData.imagesUrl ? [...prevData.imagesUrl] : [];

        if (value.trim() === '') {
          // 刪掉空的副圖
          images.splice(index, 1);
        } else {
          images[index] = value;
        }

        return { ...prevData, imagesUrl: images };
      });
    } else {
      // 其他欄位正常更新
      setEditProductData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  // 修改商品資料
  const updateProduct = async (id, data) => {
    const payload = {
      data: {
        ...data,
        origin_price: Number(data.origin_price) || 0,
        price: Number(data.price) || 0,
        num: Number(data.num) || 0,
        is_enabled: Number(data.is_enabled),
        imagesUrl:
          data.imagesUrl?.filter((img) => img && img.trim() !== '') || [],
      },
    };

    try {
      const res = await axios.put(
        `${API_BASE}/api/${API_PATH}/admin/product/${id}`,
        payload
      );
      toast.success('更新成功');
      getData(); // 更新列表
      setIsEditModalOpen(false); // 關閉 modal
      console.log(res);
    } catch (error) {
      toast.error('更新失敗');
      console.log(error);
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      {isAuth ? (
        <div className="container mt-5">
          {page === 'home' && (
            <>
              <h2 className="mb-4">後台管理</h2>
              <div className="d-flex gap-3">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    getData();
                    setPage('products');
                  }}
                >
                  查看全部商品
                </button>

                <button
                  className="btn btn-warning"
                  onClick={() => setPage('create')}
                >
                  新增商品
                </button>
                <button className="btn btn-dark" onClick={checkLoggOut}>
                  登出
                </button>
              </div>
            </>
          )}
          {/* 查看所有商品 */}
          {page === 'products' && (
            <>
              {/* 按鈕 */}
              <div className="d-flex justify-content-evenly">
                <button
                  className="btn btn-success mb-3"
                  type="button"
                  onClick={checkLoggIn}
                >
                  驗證登入
                </button>
                <button
                  className="btn btn-outline-secondary mb-3"
                  onClick={() => setPage('home')}
                >
                  ← 回選單
                </button>
              </div>

              {/* 產品列表 */}
              <div className="container">
                <div className="mt-5">
                  <h2>產品列表</h2>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>產品名稱</th>
                        <th>原價</th>
                        <th>售價</th>
                        <th>是否啟用</th>
                        <th>查看細節</th>
                        <th>修改</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products && products.length > 0 ? (
                        products.map((item) => (
                          <tr key={item.id}>
                            <td>{item.title}</td>
                            <td>{item.origin_price}</td>
                            <td>{item.price}</td>
                            <td>{item.is_enabled ? '啟用' : '未啟用'}</td>
                            <td>
                              <button
                                className="btn btn-primary"
                                onClick={() => setTempProduct(item)}
                              >
                                查看細節
                              </button>
                            </td>
                            <td>
                              <div className="btn-group">
                                <button
                                  type="button"
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={() => openEditModal(item)}
                                >
                                  編輯
                                </button>

                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => deleteProduct(item.id)}
                                >
                                  刪除
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5">尚無產品資料</td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* 單一產品 */}
                  {tempProduct ? (
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
                                onClick={() => setTempProduct(false)}
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
                                  <h5 className="card-title">
                                    {tempProduct.title}
                                  </h5>

                                  {/* 材料 / 顏色 / 尺寸 */}
                                  <div className="card-text d-flex mb-2">
                                    <p className="mb-0 me-2">材料：</p>
                                    <p className="mb-0">
                                      {tempProduct.description || '-'}
                                    </p>
                                  </div>
                                  <div className="card-text d-flex mb-2">
                                    <p className="mb-0 me-2">顏色：</p>
                                    <p className="mb-0">
                                      {tempProduct.color || '-'}
                                    </p>
                                  </div>
                                  <div className="card-text d-flex mb-2">
                                    <p className="mb-0 me-2">尺寸：</p>
                                    <p className="mb-0">
                                      {tempProduct.size || '-'}
                                    </p>
                                  </div>

                                  {/* 商品程度 / 故事 */}
                                  <div className="card-text d-flex mb-2">
                                    <p className="mb-0 me-2">商品程度：</p>
                                    <p className="mb-0">
                                      {tempProduct.level || '-'}
                                    </p>
                                  </div>
                                  <div className="card-text d-flex mb-2 ">
                                    <p className="mb-0 me-2 text-nowrap">
                                      商品故事：
                                    </p>
                                    <p className="mb-0 text-start">
                                      {tempProduct.story || '-'}
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
                                      數量：{tempProduct.num} {tempProduct.unit}
                                    </p>
                                  </div>

                                  {/* 是否啟用 */}
                                  <p className="card-text">
                                    狀態:{' '}
                                    {tempProduct.is_enabled ? '啟用' : '未啟用'}
                                  </p>

                                  {/* 商品內容 */}
                                  {tempProduct.content && (
                                    <p className="card-text">
                                      商品內容: {tempProduct.content}
                                    </p>
                                  )}

                                  {/* 更多圖片 */}
                                  {tempProduct.imagesUrl?.length > 0 && (
                                    <>
                                      <h5 className="mt-3">更多圖片：</h5>
                                      <div className="d-flex flex-wrap">
                                        {tempProduct.imagesUrl.map(
                                          (url, index) => (
                                            <img
                                              key={index}
                                              src={url}
                                              className="images me-2 mb-2"
                                              alt={`副圖 ${index + 1}`}
                                            />
                                          )
                                        )}
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
                  ) : (
                    <p className="text-secondary">請選擇一個商品查看</p>
                  )}
                  {/* 編輯產品 */}
                  {isEditModalOpen && (
                    <>
                      <div
                        className="modal-backdrop fade show"
                        onClick={() => setIsEditModalOpen(false)}
                      ></div>
                      <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-lg">
                          <div className="modal-content">
                            <div className="modal-body">
                              <h5>編輯商品</h5>
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  updateProduct(
                                    editProductData.id,
                                    editProductData
                                  );
                                }}
                              >
                                <table className="table table-bordered align-middle">
                                  <tbody>
                                    {/* 產品名稱 */}
                                    <tr>
                                      <th>產品名稱</th>
                                      <td colSpan="3">
                                        <input
                                          type="text"
                                          className="form-control"
                                          name="title"
                                          value={editProductData.title || ''}
                                          onChange={handleEditProductChange}
                                        />
                                      </td>
                                    </tr>

                                    {/* 類別 / 風格 */}
                                    <tr>
                                      <th>類別</th>
                                      <td>
                                        <select
                                          className="form-select"
                                          name="category"
                                          value={editProductData.category || ''}
                                          onChange={handleEditProductChange}
                                        >
                                          <option value="">請選擇</option>
                                          <option value="沙發 / 座椅類">
                                            沙發 / 座椅類
                                          </option>
                                          <option value="儲物 / 櫃體類">
                                            儲物 / 櫃體類
                                          </option>
                                          <option value="床具 / 寢臥類">
                                            床具 / 寢臥類
                                          </option>
                                          <option value="桌類 / 檯面類">
                                            桌類 / 檯面類
                                          </option>
                                          <option value="擺飾 / 家飾類">
                                            擺飾 / 家飾類
                                          </option>
                                        </select>
                                      </td>

                                      <th>風格</th>
                                      <td>
                                        <select
                                          className="form-select"
                                          name="style"
                                          value={editProductData.style || ''}
                                          onChange={handleEditProductChange}
                                        >
                                          <option value="">請選擇</option>
                                          <option value="工業風">工業風</option>
                                          <option value="義大利現代">
                                            義大利現代
                                          </option>
                                          <option value="現代北歐">
                                            現代北歐
                                          </option>
                                          <option value="日式無印">
                                            日式無印
                                          </option>
                                          <option value="現代簡約風">
                                            現代簡約風
                                          </option>
                                          <option value="世紀中期">
                                            世紀中期
                                          </option>
                                          <option value="療癒奶油">
                                            療癒奶油
                                          </option>
                                          <option value="侘寂">侘寂</option>
                                        </select>
                                      </td>
                                    </tr>

                                    {/* 材料 / 顏色 */}
                                    <tr>
                                      <th>材料</th>
                                      <td>
                                        <input
                                          type="text"
                                          className="form-control"
                                          name="description"
                                          value={
                                            editProductData.description || ''
                                          }
                                          onChange={handleEditProductChange}
                                        />
                                      </td>

                                      <th>顏色</th>
                                      <td>
                                        <input
                                          type="text"
                                          className="form-control"
                                          name="color"
                                          value={editProductData.color || ''}
                                          onChange={handleEditProductChange}
                                        />
                                      </td>
                                    </tr>

                                    {/* 尺寸 / 商品程度 */}
                                    <tr>
                                      <th>尺寸 (mm)</th>
                                      <td>
                                        <input
                                          type="text"
                                          className="form-control"
                                          name="size"
                                          placeholder="800 (寬), 350 (深), 1800 (高)"
                                          value={editProductData.size || ''}
                                          onChange={handleEditProductChange}
                                        />
                                      </td>

                                      <th>商品程度</th>
                                      <td>
                                        <select
                                          className="form-select"
                                          name="level"
                                          value={editProductData.level || ''}
                                          onChange={handleEditProductChange}
                                        >
                                          <option value="">請選擇</option>
                                          <option value="A">A</option>
                                          <option value="B">B</option>
                                          <option value="C">C</option>
                                          <option value="D">D</option>
                                          <option value="E">E</option>
                                        </select>
                                      </td>
                                    </tr>

                                    {/* 商品故事 */}
                                    <tr>
                                      <th>商品故事</th>
                                      <td colSpan="3">
                                        <input
                                          type="text"
                                          className="form-control"
                                          name="story"
                                          value={editProductData.story || ''}
                                          onChange={handleEditProductChange}
                                        />
                                      </td>
                                    </tr>

                                    {/* 價格 / 售價 */}
                                    <tr>
                                      <th>原始價格</th>
                                      <td>
                                        <input
                                          type="number"
                                          className="form-control"
                                          name="origin_price"
                                          value={
                                            editProductData.origin_price || 0
                                          }
                                          onChange={handleEditProductChange}
                                        />
                                      </td>

                                      <th>售價</th>
                                      <td>
                                        <input
                                          type="number"
                                          className="form-control"
                                          name="price"
                                          value={editProductData.price || 0}
                                          onChange={handleEditProductChange}
                                        />
                                      </td>
                                    </tr>

                                    {/* 數量 / 單位 */}
                                    <tr>
                                      <th>數量</th>
                                      <td>
                                        <input
                                          type="number"
                                          className="form-control"
                                          name="num"
                                          value={editProductData.num || 0}
                                          onChange={handleEditProductChange}
                                        />
                                      </td>

                                      <th>單位</th>
                                      <td>
                                        <input
                                          type="text"
                                          className="form-control"
                                          name="unit"
                                          value={editProductData.unit || ''}
                                          onChange={handleEditProductChange}
                                        />
                                      </td>
                                    </tr>

                                    {/* 主照片 */}
                                    <tr>
                                      <th>主照片網址</th>
                                      <td colSpan="3">
                                        <input
                                          type="text"
                                          className="form-control"
                                          name="imageUrl"
                                          value={editProductData.imageUrl || ''}
                                          onChange={handleEditProductChange}
                                        />
                                      </td>
                                    </tr>

                                    {/* 更多照片 */}
                                    <tr>
                                      <th>更多照片網址</th>
                                      <td colSpan="3">
                                        {[0, 1, 2].map((i) => (
                                          <input
                                            key={i}
                                            type="text"
                                            className="form-control mb-2"
                                            placeholder={`副圖 ${i + 1}`}
                                            name={`imagesUrl[${i}]`}
                                            value={
                                              editProductData.imagesUrl?.[i] ||
                                              ''
                                            }
                                            onChange={handleEditProductChange}
                                          />
                                        ))}
                                      </td>
                                    </tr>

                                    {/* 是否啟用 */}
                                    <tr>
                                      <th>是否啟用</th>
                                      <td colSpan="3">
                                        <select
                                          className="form-select"
                                          name="is_enabled"
                                          value={
                                            editProductData.is_enabled
                                              ? '1'
                                              : '0'
                                          }
                                          onChange={handleEditProductChange}
                                        >
                                          <option value="1">啟用</option>
                                          <option value="0">未啟用</option>
                                        </select>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>

                                <div className="text-end">
                                  <button
                                    className="btn btn-primary me-2"
                                    type="submit"
                                  >
                                    儲存修改
                                  </button>
                                  <button
                                    className="btn btn-danger"
                                    onClick={() => setIsEditModalOpen(false)}
                                  >
                                    取消
                                  </button>
                                </div>
                              </form>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
          {/* 新增商品 */}
          {page === 'create' && (
            <>
              <button
                className="btn btn-outline-secondary mb-3"
                onClick={() => setPage('home')}
              >
                ← 回選單
              </button>
              <h2 className="mb-4">新增商品</h2>
              <form id="form" className="form" onSubmit={addProductBtn}>
                <table className="table table-bordered align-middle">
                  <tbody>
                    {/* 產品名稱 */}
                    <tr>
                      <th>產品名稱</th>
                      <td colSpan="3">
                        <input
                          type="text"
                          className="form-control"
                          onChange={handleAddProductChange}
                          name="title"
                        />
                      </td>
                    </tr>

                    {/* 類別 / 風格 */}
                    <tr>
                      <th>類別</th>
                      <td>
                        <select
                          className="form-select"
                          onChange={handleAddProductChange}
                          name="category"
                        >
                          <option value="">請選擇</option>
                          <option value="沙發 / 座椅類">沙發 / 座椅類</option>
                          <option value="儲物 / 櫃體類">儲物 / 櫃體類</option>
                          <option value="床具 / 寢臥類">床具 / 寢臥類</option>
                          <option value="桌類 / 檯面類">桌類 / 檯面類</option>
                          <option value="擺飾 / 家飾類">擺飾 / 家飾類</option>
                        </select>
                      </td>

                      <th>風格</th>
                      <td>
                        <select
                          className="form-select"
                          name="style"
                          onChange={handleAddProductChange}
                        >
                          <option value="">請選擇</option>
                          <option value="工業風">工業風</option>
                          <option value="義大利現代">義大利現代</option>
                          <option value="現代北歐">現代北歐</option>
                          <option value="日式無印">日式無印</option>
                          <option value="現代簡約風">現代簡約風</option>
                          <option value="世紀中期">世紀中期</option>
                          <option value="療癒奶油">療癒奶油</option>
                          <option value="侘寂">侘寂</option>
                        </select>
                      </td>
                    </tr>

                    {/* 材料 / 顏色 */}
                    <tr>
                      <th>材料</th>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          name="description"
                          onChange={handleAddProductChange}
                        />
                      </td>

                      <th>顏色</th>
                      <td>
                        <input
                          type="text"
                          name="color"
                          className="form-control"
                          onChange={handleAddProductChange}
                        />
                      </td>
                    </tr>

                    {/* 尺寸 / 商品程度 */}
                    <tr>
                      <th>尺寸 (mm)</th>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="800 (寬), 350 (深), 1800 (高)"
                          onChange={handleAddProductChange}
                          name="size"
                        />
                      </td>

                      <th>商品程度</th>
                      <td>
                        <select
                          className="form-select"
                          name="level"
                          onChange={handleAddProductChange}
                        >
                          <option value="">請選擇</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                          <option value="E">E</option>
                        </select>
                      </td>
                    </tr>

                    {/* 商品故事 */}
                    <tr>
                      <th>商品故事</th>
                      <td colSpan="3">
                        <input
                          type="text"
                          className="form-control"
                          onChange={handleAddProductChange}
                          name="story"
                        />
                      </td>
                    </tr>

                    {/* 價格 */}
                    <tr>
                      <th>原始價格</th>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          onChange={handleAddProductChange}
                          name="origin_price"
                        />
                      </td>

                      <th>售價</th>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          onChange={handleAddProductChange}
                          name="price"
                        />
                      </td>
                    </tr>

                    {/* 數量 / 單位 */}
                    <tr>
                      <th>數量</th>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          onChange={handleAddProductChange}
                          name="num"
                        />
                      </td>

                      <th>單位</th>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          onChange={handleAddProductChange}
                          name="unit"
                        />
                      </td>
                    </tr>

                    {/* 主照片 */}
                    <tr>
                      <th>主照片網址</th>
                      <td colSpan="3">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="主圖網址"
                          name="imageUrl"
                          onChange={handleAddProductChange}
                        />
                      </td>
                    </tr>

                    {/* 更多照片 */}
                    <tr>
                      <th>更多照片網址</th>
                      <td colSpan="3">
                        <input
                          type="text"
                          className="form-control mb-2"
                          placeholder="副圖 1"
                          name="imagesUrl[0]"
                          onChange={handleAddProductChange}
                        />
                        <input
                          type="text"
                          className="form-control mb-2"
                          placeholder="副圖 2"
                          name="imagesUrl[1]"
                          onChange={handleAddProductChange}
                        />
                        <input
                          type="text"
                          className="form-control"
                          placeholder="副圖 3"
                          name="imagesUrl[2]"
                          onChange={handleAddProductChange}
                        />
                      </td>
                    </tr>

                    {/* 是否啟用 */}
                    <tr>
                      <th>是否啟用</th>
                      <td colSpan="3">
                        <select
                          className="form-select"
                          onChange={handleAddProductChange}
                          name="is_enabled"
                        >
                          <option value="1">啟用</option>
                          <option value="0">未啟用</option>
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="text-end">
                  <button className="btn btn-primary" type="submit">
                    新增商品
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      ) : (
        // 登入頁面
        <div className="container login">
          <div className="row justify-content-center">
            <h1 className="h3 mb-3 font-weight-normal">請先登入</h1>
            <div className="col-8">
              <form id="form" className="form-signin" onSubmit={handleSubmit}>
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="username"
                    name="username"
                    placeholder="name@example.com"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    autoFocus
                  />
                  <label htmlFor="username">Email address</label>
                </div>
                <div className="form-floating">
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="password">Password</label>
                </div>
                <button
                  className="btn btn-lg btn-primary w-100 mt-3"
                  type="submit"
                >
                  登入
                </button>
              </form>
            </div>
          </div>
          <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
        </div>
      )}
    </>
  );
}

export default App;
