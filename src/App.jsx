import { useEffect, useRef, useState } from 'react';
import './assets/style.css';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import * as bootstrap from 'bootstrap';

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

function App() {
  // 儲存登入表單輸入
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
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
  // 圖片上傳
  //const [file, setFile] = useState(null);
  //const [preview, setPreview] = useState(null);

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
      //setPage('home');
      toast.success('登入成功');
    } catch (error) {
      toast.error(error.response.data.message);
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
      setFormData({
        username: '',
        password: '',
      });

      // 移除 token
      document.cookie = 'hexToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      delete axios.defaults.headers.common.Authorization;
      toast.success(res.data.message);
    } catch (error) {
      console.log(error);
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
        console.log('權限檢查失敗：', error.response?.data?.message);
        setIsAuth(false);
      }
    };
    checkLoggIn();
  }, []);

  // 取得所有商品資料
  const getData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`);
      setProducts(res.data.products);
      console.log('API 回傳的原始資料:', res.data.products);
    } catch (error) {
      toast.error(
        `取得所有商品資料失敗: ${error.response.data.message}，請洽工作人員`
      );
    }
  };

  // modal表單輸入處理
  const handleEditProductChange = (e) => {
    const { name, value } = e.target;
    setTemplateData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // 更新商品資訊
  const updateProduct = async (id) => {
    let url = `${API_BASE}/api/${API_PATH}/admin/product`;
    let method = 'post';

    if (modalType === 'edit') {
      url = `${API_BASE}/api/${API_PATH}/admin/product/${id}`;
      method = 'put';
    }

    const productData = {
      data: {
        title: templateData.title,
        category: templateData.category,
        style: templateData.style,
        description: templateData.description,
        color: templateData.color,
        size: templateData.size,
        level: templateData.level,
        story: templateData.story,
        origin_price: Number(templateData.origin_price),
        price: Number(templateData.price),
        qty: Number(templateData.qty),
        unit: templateData.unit,
        content: templateData.content,
        is_enabled: Number(templateData.is_enabled),
        imageUrl: templateData.imageUrl,
        imagesUrl: templateData.imagesUrl.filter((url) => url !== ''),
      },
    };
    try {
      const res = await axios[method](url, productData);
      console.log(res.data);
      getData();
      closeModal();
    } catch (error) {
      console.log(error.response);
    }
  };

  // 刪除商品
  const deleteProduct = async (id) => {
    try {
      const res = await axios.delete(
        `${API_BASE}/api/${API_PATH}/admin/product/${id}`
      );
      getData();
      closeModal();
      toast.success('資料刪除成功:', res.data);
    } catch (error) {
      toast.error('刪除資料時發生錯誤:', error);
    }
  };

  // 使用 ref 控制 Modal
  const openModal = (product, type) => {
    setModalType(type);

    setTemplateData((prevData) => ({
      ...prevData,
      ...product,
    }));

    productModalRef.current.show();
  };
  const closeModal = () => {
    productModalRef.current.hide();
    setTemplateData(INITIAL_TEMPLATE_DATA);
  };

  // 更新圖片陣列
  const handleImageChange = (index, value) => {
    setTemplateData((prevData) => {
      const newImages = [...prevData.imagesUrl];
      newImages[index] = value;

      return { ...prevData, imagesUrl: newImages };
    });
  };

  // 新增圖片
  const handleAddImage = () => {
    setTemplateData((prevData) => ({
      ...prevData,
      imagesUrl: [...prevData.imagesUrl, ''],
    }));
  };

  // 移除圖片
  const handleRemoveImage = () => {
    setTemplateData((prevData) => {
      const newImages = [...prevData.imagesUrl];
      newImages.pop();
      return { ...prevData, imagesUrl: newImages };
    });
  };

  // 上傳圖片
  // const updatePhoto = async (e) => {
  //   e.preventDefault();

  //   if (!file) {
  //     alert('請先選擇檔案');
  //     return;
  //   }

  //   const formData = new FormData();
  //   formData.append('file-to-upload', file);

  //   try {
  //     const res = await axios.post(
  //       `${API_BASE}/api/${API_PATH}/admin/upload`,
  //       formData,
  //       {
  //         headers: {
  //           'Content-Type': 'multipart/form-data',
  //         },
  //       }
  //     );
  //     setPreview(res.data.imageUrl);
  //     toast.success('上傳成功');
  //   } catch (error) {
  //     toast.error('上傳失敗');
  //   }
  // };

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
                <p className="text-secondary">請選擇一個商品查看</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        // 登入頁面
        <div className="container login">
          <div className="row justify-content-center">
            <h1 className="h3 mb-3 font-weight-normal">請先登入</h1>
            <div className="col-8">
              <form
                id="formsignin"
                className="form-signin"
                onSubmit={handleSubmit}
              >
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
      {/* MODAL */}
      <div
        id="productModal"
        className="modal fade"
        tabIndex="-1"
        aria-labelledby="productModalLabel"
        aria-hidden="true"
        ref={productModalRef}
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content border-0">
            <div
              className={`modal-header ${
                modalType === 'delete' ? 'bg-danger' : 'bg-dark'
              } text-white`}
            >
              <h5 id="productModalLabel" className="modal-title">
                <span>
                  {modalType === 'delete'
                    ? '刪除產品'
                    : modalType === 'edit'
                    ? '編輯產品'
                    : '新增產品'}
                </span>
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {modalType === 'delete' ? (
                <p className="fs-4">
                  確定要刪除
                  <span className="text-danger">{templateData.title}</span>嗎？
                </p>
              ) : (
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
                          value={templateData.title}
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
                          value={templateData.category}
                          onChange={handleEditProductChange}
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
                          value={templateData.style}
                          onChange={handleEditProductChange}
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
                          value={templateData.description}
                          onChange={handleEditProductChange}
                        />
                      </td>

                      <th>顏色</th>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          name="color"
                          value={templateData.color}
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
                          value={templateData.size}
                          onChange={handleEditProductChange}
                        />
                      </td>

                      <th>商品程度</th>
                      <td>
                        <select
                          className="form-select"
                          name="level"
                          value={templateData.level}
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
                          value={templateData.story}
                          onChange={handleEditProductChange}
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
                          name="origin_price"
                          value={templateData.origin_price}
                          onChange={handleEditProductChange}
                        />
                      </td>

                      <th>售價</th>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          name="price"
                          value={templateData.price}
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
                          name="qty"
                          value={templateData.qty}
                          onChange={handleEditProductChange}
                        />
                      </td>

                      <th>單位</th>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          name="unit"
                          value={templateData.unit}
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
                          value={templateData.imageUrl}
                          onChange={handleEditProductChange}
                        />
                      </td>
                    </tr>

                    {/* 更多照片 */}
                    <tr>
                      <th>更多照片網址</th>
                      <td colSpan="3">
                        {templateData.imagesUrl.map((image, index) => (
                          <div key={index} className="d-flex ">
                            <input
                              type="text"
                              value={image}
                              onChange={(e) =>
                                handleImageChange(index, e.target.value)
                              }
                              placeholder={`圖片網址 ${index + 1}`}
                              className="form-control mb-2 w-75"
                            />
                            <div className="ms-2 d-flex justify-content-between">
                              {templateData.imagesUrl.length < 5 &&
                                templateData.imagesUrl[
                                  templateData.imagesUrl.length
                                ] !== '' && (
                                  <button
                                    className="btn btn-outline-primary btn-sm w-100 mb-2"
                                    onClick={handleAddImage}
                                  >
                                    新增圖片
                                  </button>
                                )}

                              {templateData.imagesUrl.length >= 2 && (
                                <button
                                  className="ms-2 btn btn-outline-danger btn-sm w-100 mb-2"
                                  onClick={handleRemoveImage}
                                >
                                  取消圖片
                                </button>
                              )}
                            </div>
                          </div>
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
                          value={templateData.is_enabled}
                          onChange={handleEditProductChange}
                        >
                          <option value="1">啟用</option>
                          <option value="0">未啟用</option>
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
            <div className="modal-footer">
              {modalType === 'delete' ? (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => deleteProduct(templateData.id)}
                >
                  刪除
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    data-bs-dismiss="modal"
                    onClick={() => closeModal()}
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => updateProduct(templateData.id)}
                  >
                    確認
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* 上傳圖片 */}
      {/*<>
        <h2 className="mb-4">上傳圖片</h2>
        <form onSubmit={updatePhoto}>
          <input
            type="file"
            onChange={(e) => {
              const selectedFile = e.target.files[0];
              setFile(selectedFile);
              setPreview(URL.createObjectURL(selectedFile)); // 本地預覽
            }}
          />
          <button type="submit" className="btn btn-dark">
            Upload
          </button>
        </form>
        <p>上傳網址:{preview}</p>
        {preview && <img src={preview} width="200" />}
      </>*/}
    </>
  );
}

export default App;
