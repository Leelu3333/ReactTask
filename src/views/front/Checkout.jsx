import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { currency } from '../../utils/filter';
import { useForm } from 'react-hook-form';
import { Oval } from 'react-loader-spinner';
import * as bootstrap from 'bootstrap';
import SingleProductModal from '../../components/SingleProductModal';
import {
  addressValidation,
  emailValidation,
  nameValidation,
  telValidation,
} from '../../utils/validation';
import { useDispatch } from 'react-redux';

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function Checkout() {
  // useRef 建立對 DOM 元素的參照
  const productModalRef = useRef(null);
  const [product, setProduct] = useState();
  //商品資料
  const [products, setProducts] = useState([]);
  //購物車資料
  const [cartData, setCartData] = useState({ carts: [] });
  // 載入狀態
  const [loadingCartId, setLoadingCartId] = useState(null);
  const [loadingProductId, setLoadingProductId] = useState(null);
  const [loadingItemId, setLoadingItemId] = useState(null);
  const [loadingClear, setLoadingClear] = useState(false);

  // 表單
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ mode: 'onChange' });

  // 送出表單
  const onSubmit = async (formdata) => {
    try {
      const data = {
        user: formdata,
        message: formdata.message,
      };
      const res = await axios.post(`${API_BASE}/api/${API_PATH}/order`, {
        data,
      });
      toast.success(`${res.data.message}`);
      const res2 = await axios.get(`${API_BASE}/api/${API_PATH}/cart`);
      setCartData(res2.data.data);
      reset();
    } catch (error) {
      console.log(error.response);
    }
  };
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
  // 取得購物車資料
  useEffect(() => {
    const getCartData = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/${API_PATH}/cart`);
        setCartData(res.data.data);
      } catch (error) {
        toast.error(
          `取得購物車資料失敗: ${error.response?.data?.message}，請洽工作人員`,
        );
      }
    };
    getCartData();
  }, []);
  // 更新購物車資料
  const updateCart = async (cardId, productId, qty = 1) => {
    setLoadingItemId(cardId);
    try {
      const data = {
        product_id: productId,
        qty,
      };
      const res = await axios.put(
        `${API_BASE}/api/${API_PATH}/cart/${cardId}`,
        {
          data,
        },
      );
      toast.success(res.data.message);
      const res2 = await axios.get(`${API_BASE}/api/${API_PATH}/cart`);
      setCartData(res2.data.data);
    } catch (error) {
      toast.error(
        `更改數量失敗: ${error.response?.data?.message}，請洽工作人員`,
      );
    } finally {
      setLoadingItemId(null);
    }
  };
  // 加入購物車
  const addCart = async (id, qty = 1) => {
    setLoadingCartId(id);
    try {
      const data = {
        product_id: id,
        qty,
      };
      const res = await axios.post(`${API_BASE}/api/${API_PATH}/cart`, {
        data,
      });
      toast.success(`${res.data.message}`);
      const res2 = await axios.get(`${API_BASE}/api/${API_PATH}/cart`);
      setCartData(res2.data.data);
    } catch (error) {
      toast.error(
        `加入購物車失敗: ${error.response?.data?.message}，請洽工作人員`,
      );
    } finally {
      setLoadingCartId(null);
    }
  };
  // 刪除單筆資料
  const deleteCart = async (cardId) => {
    setLoadingItemId(cardId);
    try {
      const res = await axios.delete(
        `${API_BASE}/api/${API_PATH}/cart/${cardId}`,
      );
      toast.success(res.data.message);
      const res2 = await axios.get(`${API_BASE}/api/${API_PATH}/cart`);
      setCartData(res2.data.data);
    } catch (error) {
      toast.error(`刪除失敗: ${error.response?.data?.message}，請洽工作人員`);
    } finally {
      setLoadingItemId(null);
    }
  };
  // 刪除全部資料
  const deleteAllCart = async () => {
    setLoadingClear(true);
    try {
      const res = await axios.delete(`${API_BASE}/api/${API_PATH}/carts`);
      toast.success(res.data.message);
      const res2 = await axios.get(`${API_BASE}/api/${API_PATH}/cart`);
      setCartData(res2.data.data);
    } catch (error) {
      toast.error(`刪除失敗: ${error.response?.data?.message}，請洽工作人員`);
    } finally {
      setLoadingClear(false);
    }
  };

  const handleView = async (id) => {
    setLoadingProductId(id);
    try {
      const res = await axios.get(`${API_BASE}/api/${API_PATH}/product/${id}`);
      setProduct(res.data.product);
    } catch (error) {
      toast.error(
        `取得商品資料失敗: ${error.response?.data?.message}，請洽工作人員`,
      );
    } finally {
      setLoadingProductId(null);
    }
    productModalRef.current.show();
  };

  // Modal 在 useEffect 中初始化
  useEffect(() => {
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
  }, []);

  // 使用 ref 控制 Modal
  const closeModal = () => {
    productModalRef.current.hide();
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      {/* 產品列表 */}
      <h1>產品列表</h1>
      <table className="table align-middle">
        <thead>
          <tr>
            <th>圖片</th>
            <th>商品名稱</th>
            <th>價格</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((item) => (
            <tr key={item.id}>
              <td style={{ width: '200px' }}>
                <div
                  style={{
                    height: '100px',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundImage: `url(${item.imageUrl})`,
                  }}
                ></div>
              </td>
              <td>{item.title}</td>
              <td>
                <del className="h6">原價：{item.origin_price}</del>
                <div className="h5">特價：{item.price}</div>
              </td>
              <td>
                <div className="btn-group btn-group-sm">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => handleView(item.id)}
                    disabled={loadingProductId === item.id}
                  >
                    {loadingProductId === item.id ? (
                      <Oval
                        visible={true}
                        height="16"
                        width="80"
                        color="#c7c7c7"
                        secondaryColor="#ababab"
                      />
                    ) : (
                      '查看更多'
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => addCart(item.id)}
                    disabled={loadingCartId === item.id}
                  >
                    {loadingCartId === item.id ? (
                      <Oval
                        visible={true}
                        height="16"
                        width="80"
                        color="#e67a7a"
                        secondaryColor="#e05252"
                      />
                    ) : (
                      '加到購物車'
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* 購物車列表 */}
      <h1>購物車列表</h1>
      <div className="container mt-5">
        {!cartData?.carts?.length ? (
          <div className="text-center mt-5 text-danger">購物車空空的喔...</div>
        ) : (
          <>
            <div className="text-end">
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                disabled={loadingClear}
                onClick={() => {
                  deleteAllCart();
                }}
              >
                {loadingClear ? (
                  <Oval
                    height="16"
                    width="60"
                    color="#e67a7a"
                    secondaryColor="#e05252"
                  />
                ) : (
                  '清空購物車'
                )}
              </button>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th></th>
                  <th>產品名稱</th>
                  <th>數量/單位</th>
                  <th className="text-end">小計</th>
                </tr>
              </thead>
              <tbody>
                {cartData?.carts?.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        disabled={loadingItemId === item.id}
                        onClick={() => {
                          deleteCart(item.id);
                        }}
                      >
                        {loadingItemId === item.id ? (
                          <Oval
                            height="16"
                            width="60"
                            color="#e67a7a"
                            secondaryColor="#e05252"
                          />
                        ) : (
                          '刪除'
                        )}
                      </button>
                    </td>
                    <td>{item.product.title}</td>
                    <td>
                      <div className="input-group input-group-sm mb-3">
                        <input
                          type="number"
                          className="form-control"
                          aria-label="Sizing example input"
                          aria-describedby="inputGroup-sizing-sm"
                          value={item.qty}
                          min="1"
                          disabled={loadingItemId === item.id}
                          onChange={(e) => {
                            updateCart(
                              item.id,
                              item.product_id,
                              Number(e.target.value),
                            );
                          }}
                        />
                        <span
                          className="input-group-text text-end"
                          id="inputGroup-sizing-sm"
                        >
                          {item.product.unit}
                        </span>
                      </div>
                    </td>
                    <td className="text-end">{currency(item.final_total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th className="text-end" colSpan="3">
                    總計
                  </th>
                  <td className="text-end">
                    {currency(cartData?.final_total)}
                  </td>
                </tr>
              </tfoot>
            </table>
            {/* 結帳頁面 */}
            <div className="my-5 row justify-content-center">
              <form className="col-md-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="form-control"
                    placeholder="請輸入 Email"
                    {...register('email', emailValidation)}
                  />
                  {errors.email && (
                    <p className="text-danger">{errors.email.message}</p>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    收件人姓名
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="form-control"
                    placeholder="請輸入收件人姓名"
                    {...register('name', nameValidation)}
                  />
                  {errors.name && (
                    <p className="text-danger">{errors.name.message}</p>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="tel" className="form-label">
                    收件人電話
                  </label>
                  <input
                    id="tel"
                    name="tel"
                    type="tel"
                    className="form-control"
                    placeholder="請輸入收件人電話"
                    {...register('tel', telValidation)}
                  />
                  {errors.tel && (
                    <p className="text-danger">{errors.tel.message}</p>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="address" className="form-label">
                    收件人地址
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    className="form-control"
                    placeholder="請輸入收件人地址"
                    {...register('address', addressValidation)}
                  />
                  {errors.address && (
                    <p className="text-danger">{errors.address.message}</p>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="message" className="form-label">
                    留言
                  </label>
                  <textarea
                    id="message"
                    className="form-control"
                    cols="30"
                    rows="10"
                    {...register('message')}
                  ></textarea>
                </div>
                <div className="text-end">
                  <button type="submit" className="btn btn-danger">
                    送出訂單
                  </button>
                </div>
              </form>
            </div>
          </>
        )}

        {/* 商品詳情 */}
        <SingleProductModal
          product={product}
          addCart={addCart}
          closeModal={closeModal}
        />
      </div>
    </>
  );
}
export default Checkout;
