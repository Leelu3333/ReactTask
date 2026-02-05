import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { emailValidation, passwordValidation } from '../../utils/validation';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function Login() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
  });

  const onSubmit = async (formData) => {
    try {
      const res = await axios.post(`${API_BASE}/admin/signin`, formData);
      const { token, expired } = res.data;
      // 儲存 Token 到 Cookie
      // eslint-disable-next-line
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;

      // 設定 axios 預設 header
      // eslint-disable-next-line
      axios.defaults.headers.common.Authorization = token;

      toast.success('登入成功');
      setTimeout(() => {
        navigate('/admin');
      }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  return (
    // 登入頁面
    <div className="container login">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="row justify-content-center">
        <h1 className="h3 mb-3 font-weight-normal">請先登入</h1>
        <div className="col-8">
          <form
            id="formsignin"
            className="form-signin"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                id="username"
                name="username"
                placeholder="name@example.com"
                required
                autoFocus
                autoComplete="username"
                {...register('username', emailValidation)}
              />
              {errors.username && (
                <p className="text-danger">{errors.username.message}</p>
              )}
              <label htmlFor="username">Email address</label>
            </div>
            <div className="form-floating">
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                placeholder="Password"
                required
                autoComplete="current-password"
                {...register('password', passwordValidation)}
              />
              <label htmlFor="password">Password</label>
              {errors.password && (
                <p className="text-danger">{errors.password.message}</p>
              )}
            </div>
            <button
              className="btn btn-lg btn-primary w-100 mt-3"
              type="submit"
              disabled={!isValid}
            >
              登入
            </button>
          </form>
        </div>
      </div>
      <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
    </div>
  );
}
export default Login;
