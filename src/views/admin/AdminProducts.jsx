import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import * as bootstrap from 'bootstrap';
import ProductModal from '../../components/ProductModal';
import Pagination from '../../components/Pagination';
import { useNavigate } from 'react-router-dom';
import AdminSingleProduct from './AdminSingleProduct';
import useMessage from '../../hooks/useMessage';

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

function AdminProducts() {
  const navigate = useNavigate();
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

  const { showError, showSuccess } = useMessage();

  // 取得所有商品資料
  const getData = async (page = 1) => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products?page=${page}`,
      );
      setProducts(res.data.products);
      setPagination(res.data.pagination);
      showSuccess('取得成功');
    } catch (error) {
      showError(error.response.data.message);
    }
  };

  // 登出
  const checkLoggOut = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/logout`);

      // 清空所有資料
      setProducts([]);
      setTempProduct(null);

      // 移除 token
      document.cookie = 'hexToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      delete axios.defaults.headers.common.Authorization;
      toast.success(res.data.message);
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

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
      <div className="container mt-5">
        {/* 按鈕 */}
        <div className="d-flex justify-content-evenly mb-3">
          <button
            type="button"
            className="btn btn-warning "
            onClick={() => openModal(INITIAL_TEMPLATE_DATA, 'create')}
          >
            新增商品
          </button>
          <button className="btn btn-dark" type="button" onClick={checkLoggOut}>
            登出
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
                      <td
                        className={
                          item.is_enabled ? 'text-success' : 'text-danger'
                        }
                      >
                        {item.is_enabled ? '啟用' : '未啟用'}
                      </td>

                      <td>
                        <button
                          type="button"
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
          </div>
        </div>
      </div>

      {/* 查看單一商品元件 */}
      <AdminSingleProduct
        tempProduct={tempProduct}
        setTempProduct={setTempProduct}
      />

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
export default AdminProducts;
