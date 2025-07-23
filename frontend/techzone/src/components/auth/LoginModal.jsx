import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import AuthService from "../../services/AuthService";
import useAuthForm from "../../hooks/useAuthForm";

import LoginWithGoogleButton from "../button/LoginWithGoogleButton";
import { IoMdClose } from "react-icons/io";

export default function LoginModal({ onClose, onSwitch }) {
  const { login } = useContext(AuthContext);

  const initialFields = {
    email: "",
    password: "",
  };

  const validateLogin = (fields) => {
    const { email, password } = fields;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return "Email không hợp lệ";
    }

    if (password.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự";
    }

    return "";
  }

  const { formData, error, setError, handleChange, validate } = useAuthForm(initialFields, validateLogin);

  const handleSubmit = async (e) => {
    e.preventDefault();
        const errMsg = validate();
        if (errMsg) {
          setError(errMsg);
          return;
        };
    
        try {
          const data = await AuthService.login(formData);
          console.log('Login successful:', data);
          login(data.user, data.token);
          setError(null); 
    
          onClose();
        } catch (err) {
          if (err.message) {
            setError(err.message);
          } else {
            setError("Lỗi kết nối tới máy chủ.");
            return;
          }
        }
  };

 
  
    return (
      <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 ">
        <div className="bg-white p-6 rounded w-full max-w-sm relative">
          <button className="absolute top-2 right-6 text-dark-gray w-2 h-2 cursor-pointer" onClick={onClose}>
            <IoMdClose  className="text-dark-gray w-6 h-8" />
          </button>
          <h2 className="text-2xl font-bold mb-4 text-dark-gray text-center text-shadow-light-gray">Đăng nhập</h2>
          <form onSubmit={handleSubmit}>
            <label className="text-dark-gray">Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              className="border border-dark-gray p-2 w-full h-10 mb-2 rounded-lg"
              placeholder="Nhập email"
              required
            />
            <label className="text-dark-gray">Mật khẩu</label>
            <input
              name="password"
              value={formData.password}
              onChange={handleChange}
              type="password"
              className="border border-dark-gray p-2 w-full h-10 mb-2 rounded-lg"
              placeholder="Nhập mật khẩu"
              required
            />
            
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

            <div className="text-sm mb-2 text-right">
              <button
                type="button"
                className="text-light-green hover:underline"
                onClick={() => alert("Chức năng này chưa được triển khai")}
              >
                Quên mật khẩu?
              </button>
            </div>

            <button
              onSubmit={handleSubmit}
              type="submit"
              className="w-full h-10 transition-colors focus:ring-2 hover:bg-[#124232] bg-light-green text-white py-2 rounded-lg"
            >
              Đăng nhập
            </button>
          </form>

          <p className="text-center text-sm mt-2 text-darkgray">__hoặc__</p>
          
          <LoginWithGoogleButton onClose={onClose} />

          <p className="mt-4 text-sm text-center">
            <span>Bạn chưa có tài khoản? </span>
            <button
              className="text-light-green hover:underline"
              onClick={onSwitch}
            >
              Đăng ký
            </button>
          </p>
        </div>
      </div>
    );
  }
  