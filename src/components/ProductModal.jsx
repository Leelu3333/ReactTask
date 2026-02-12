import { useEffect, useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function ProductModal({ modalType, templateData, closeModal, getData }) {
  const [tempData, setTempData] = useState(templateData);

  useEffect(() => {
    setTempData(templateData);
  }, [templateData]);

  // modal表單輸入處理
  const handleEditProductChange = (e) => {
    const { name, value } = e.target;
    setTempData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // 更新圖片陣列
  const handleImageChange = (index, value) => {
    setTempData((prevData) => {
      const newImages = [...prevData.imagesUrl];
      newImages[index] = value;

      return { ...prevData, imagesUrl: newImages };
    });
  };

  // 新增圖片
  const handleAddImage = () => {
    setTempData((prevData) => ({
      ...prevData,
      imagesUrl: [...prevData.imagesUrl, ''],
    }));
  };

  // 移除圖片
  const handleRemoveImage = () => {
    setTempData((prevData) => {
      const newImages = [...prevData.imagesUrl];
      newImages.pop();
      return { ...prevData, imagesUrl: newImages };
    });
  };

  // 更新商品資訊(新增、編輯)
  const updateProduct = async (id) => {
    let url = `${API_BASE}/api/${API_PATH}/admin/product`;
    let method = 'post';

    if (modalType === 'edit') {
      url = `${API_BASE}/api/${API_PATH}/admin/product/${id}`;
      method = 'put';
    }

    const productData = {
      data: {
        title: tempData.title,
        category: tempData.category,
        style: tempData.style,
        description: tempData.description,
        color: tempData.color,
        size: tempData.size,
        level: tempData.level,
        story: tempData.story,
        origin_price: Number(tempData.origin_price),
        price: Number(tempData.price),
        qty: Number(tempData.qty),
        unit: tempData.unit,
        content: tempData.content,
        is_enabled: Number(tempData.is_enabled),
        imageUrl: tempData.imageUrl,
        imagesUrl: tempData.imagesUrl.filter((url) => url !== ''),
      },
    };
    try {
      const res = await axios[method](url, productData);
      toast.success(res.data.message);
      getData();
      closeModal();
    } catch (error) {
      const message =
        error?.response?.data?.message || '資料填寫不完整或發生錯誤';
      alert(message);
    }
  };

  // 刪除商品
  const deleteProduct = async (id) => {
    try {
      const res = await axios.delete(
        `${API_BASE}/api/${API_PATH}/admin/product/${id}`,
      );
      getData();
      closeModal();
      toast.success('資料刪除成功:', res.data);
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  //上傳圖片
  const updatePhoto = async (e) => {
    e.preventDefault();
    const file = e.target.files?.[0];

    if (!file) {
      alert('請先選擇檔案');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file-to-upload', file);

      const res = await axios.post(
        `${API_BASE}/api/${API_PATH}/admin/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      setTempData((pre) => ({
        ...pre,
        imageUrl: res.data.imageUrl,
      }));
      toast.success('上傳成功');
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  return (
    <div
      id="productModal"
      className="modal fade"
      tabIndex="-1"
      aria-labelledby="productModalLabel"
      aria-hidden="true"
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
                <span className="text-danger">{tempData.title}</span>嗎？
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
                        value={tempData.title}
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
                        value={tempData.category}
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
                        value={tempData.style}
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
                        value={tempData.description}
                        onChange={handleEditProductChange}
                      />
                    </td>

                    <th>顏色</th>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        name="color"
                        value={tempData.color}
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
                        value={tempData.size}
                        onChange={handleEditProductChange}
                      />
                    </td>

                    <th>商品程度</th>
                    <td>
                      <select
                        className="form-select"
                        name="level"
                        value={tempData.level}
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
                        value={tempData.story}
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
                        value={tempData.origin_price}
                        onChange={handleEditProductChange}
                        min="0"
                      />
                    </td>

                    <th>售價</th>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        name="price"
                        value={tempData.price}
                        onChange={handleEditProductChange}
                        min="0"
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
                        value={tempData.qty}
                        onChange={handleEditProductChange}
                        min="0"
                      />
                    </td>

                    <th>單位</th>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        name="unit"
                        value={tempData.unit}
                        onChange={handleEditProductChange}
                      />
                    </td>
                  </tr>

                  {/* 上傳圖片 */}
                  <tr>
                    <th>上傳圖片</th>
                    <td colSpan="3">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        className="form-control"
                        id="fileInput"
                        onChange={(e) => updatePhoto(e)}
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
                        value={tempData.imageUrl}
                        onChange={handleEditProductChange}
                      />
                    </td>
                  </tr>

                  {/* 更多照片 */}
                  <tr>
                    <th>更多照片網址</th>
                    <td colSpan="3">
                      {tempData.imagesUrl.map((image, index) => (
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
                            {tempData.imagesUrl.length < 5 &&
                              tempData.imagesUrl[tempData.imagesUrl.length] !==
                                '' && (
                                <button
                                  type="button"
                                  className="btn btn-outline-primary btn-sm w-100 mb-2"
                                  onClick={handleAddImage}
                                >
                                  新增圖片
                                </button>
                              )}

                            {tempData.imagesUrl.length >= 2 && (
                              <button
                                type="button"
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
                        value={tempData.is_enabled}
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
                onClick={() => deleteProduct(tempData.id)}
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
                  onClick={() => updateProduct(tempData.id)}
                >
                  確認
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default ProductModal;
