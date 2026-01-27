import { useEffect, useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { currency } from '../../utils/filter';

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function Cart() {
  const [cartData, setCartData] = useState({ carts: [] });
  //取得購物車資料
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
  //更新購物車資料
  const updateCart = async (cardId, productId, qty = 1) => {
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
    }
  };
  // 刪除單筆資料
  const deleteCart = async (cardId) => {
    try {
      const res = await axios.delete(
        `${API_BASE}/api/${API_PATH}/cart/${cardId}`,
      );
      toast.success(res.data.message);
      const res2 = await axios.get(`${API_BASE}/api/${API_PATH}/cart`);
      setCartData(res2.data.data);
    } catch (error) {
      toast.error(`刪除失敗: ${error.response?.data?.message}，請洽工作人員`);
    }
  };
  // 刪除全部資料
  const deleteAllCart = async () => {
    try {
      const res = await axios.delete(`${API_BASE}/api/${API_PATH}/carts`);
      toast.success(res.data.message);
      const res2 = await axios.get(`${API_BASE}/api/${API_PATH}/cart`);
      setCartData(res2.data.data);
    } catch (error) {
      toast.error(`刪除失敗: ${error.response?.data?.message}，請洽工作人員`);
    }
  };
  return (
    <>
      {cartData?.carts?.length === 0 ? (
        <div className="text-center mt-5">購物車空空的喔~</div>
      ) : (
        <>
          <Toaster position="top-right" reverseOrder={false} />
          <h1>購物車</h1>
          <div className="container mt-5">
            <div className="text-end">
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => {
                  deleteAllCart();
                }}
              >
                清空購物車
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
                        onClick={() => {
                          deleteCart(item.id);
                        }}
                      >
                        刪除
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
                          defaultValue={item.qty}
                          min="1"
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
          </div>
        </>
      )}
    </>
  );
}
export default Cart;
