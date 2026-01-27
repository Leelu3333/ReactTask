import { useEffect, useRef, useState } from 'react';
import './assets/style.css';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import * as bootstrap from 'bootstrap';
import ProductModal from './assets/components/ProductModal';
import Pagination from './assets/components/Pagination';
import Login from './views/front/Login';

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;
const INITIAL_TEMPLATE_DATA = {
  id: '', // 產品 ID
  title: '', // 產品名稱
  category: '', // 類別
  style: '', // 風格
  description: '', // 材料 / 產品描述
  color: '', // 顏色
  size: '', // 尺寸
  level: '', // 商品程度
  story: '', // 商品故事
  origin_price: '', // 原始價格
  price: '', // 售價
  qty: 0, // 數量
  unit: '', // 單位
  content: '', // 說明內容
  is_enabled: 1, // 是否啟用
  imageUrl: '', // 主照片網址
  imagesUrl: [''], // 更多照片網址
};

function App2() {
  // 登入狀態管理
  const [isAuth, setIsAuth] = useState(false);
  // 所有產品資料
  const [products, setProducts] = useState([]);
  // 可以查看的單一產品
  const [tempProduct, setTempProduct] = useState(null);
  // useRef 建立對 DOM 元素的參照
  const productModalRef = useRef(null);
  const [modalType, setModalType] = useState(''); // "create", "edit", "delete"
  // 產品表單資料模板
  const [templateData, setTemplateData] = useState(INITIAL_TEMPLATE_DATA);
  //分頁
  const [pagination, setPagination] = useState({});

  // 取得所有商品資料
  const getData = async (page = 1) => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products?page=${page}`,
      );
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error(
        `取得所有商品資料失敗: ${error.response?.data?.message}，請洽工作人員`,
      );
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
      setTempProduct(INITIAL_TEMPLATE_DATA);

      // 移除 token
      document.cookie = 'hexToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      delete axios.defaults.headers.common.Authorization;
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

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
    // 初始化 Bootstrap Modal
    productModalRef.current = new bootstrap.Modal('#productModal', {
      keyboard: false,
    });

    // Modal 關閉時移除焦點
    document
      .querySelector('#productModal')
      .addEventListener('hide.bs.modal', () => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      });

    // 檢查管理員權限並載入資料
    const checkLoggIn = async () => {
      try {
        await axios.post(`${API_BASE}/api/user/check`);
        setIsAuth(true);
        // 載入產品資料
        getData();
      } catch (error) {
        toast.error(error.response?.data?.message);
        setIsAuth(false);
      }
    };
    checkLoggIn();
  }, []);

  // 使用 ref 控制 Modal
  const openModal = (product, type) => {
    setModalType(type);

    setTemplateData({
      ...INITIAL_TEMPLATE_DATA,
      ...product,
    });

    productModalRef.current.show();
  };
  const closeModal = () => {
    productModalRef.current.hide();
    setTemplateData(INITIAL_TEMPLATE_DATA);
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      {isAuth ? (
        // 查看所有商品
        <div className="container mt-5">
          {/* 按鈕 */}
          <div className="d-flex justify-content-evenly mb-3">
            <button
              className="btn btn-warning "
              onClick={() => openModal(INITIAL_TEMPLATE_DATA, 'create')}
            >
              新增商品
            </button>
            {/* <button
              className="btn btn-info "
              //onClick={() => setPage('updatePhoto')}
            >
              上傳圖片
            </button> */}
            <button className="btn btn-dark" onClick={checkLoggOut}>
              登出
            </button>
          </div>

          {/* 產品列表 */}
          <div className="container">
            <div className="mt-5">
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
                                  <h5 className="mt-3 text-start">
                                    更多圖片：
                                  </h5>
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
              ) : (
                <>
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
                            <td
                              className={
                                item.is_enabled ? 'text-success' : 'text-danger'
                              }
                            >
                              {item.is_enabled ? '啟用' : '未啟用'}
                            </td>

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
                                  onClick={() => openModal(item, 'edit')}
                                >
                                  編輯
                                </button>

                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => openModal(item, 'delete')}
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
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <Login getData={getData} setIsAuth={setIsAuth} />
      )}
      {/* modal元件 */}
      <ProductModal
        modalType={modalType}
        templateData={templateData}
        closeModal={closeModal}
        getData={getData}
      />
      {/* 分頁元件 */}
      <Pagination pagination={pagination} getData={getData} />
    </>
  );
}

export default App2;
