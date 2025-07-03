import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

import LoginWithGoogleButton from "../button/LoginWithGoogleButton";

export default function LoginModal({ onClose, onSwitch }) {
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    // e.preventDefault();
    // // call backend API
    // const res = await fetch("/api/auth/login", {});
    // const data = await res.json();
    // login(data.user, data.token); // save to context
    // onClose();
    alert("Chức năng này chưa được triển khai");
    e.preventDefault();
  };

  
    return (
      <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded w-full max-w-sm relative">
          <button className="absolute top-2 right-3" onClick={onClose}>×</button>
          <h2 className="text-2xl font-bold mb-4 text-dark-gray text-center text-shadow-light-gray">Đăng nhập</h2>
          <form onSubmit={handleSubmit}>
            <label className="text-dark-gray">Email</label>
            <input className="border border-dark-gray p-2 w-full h-10 mb-2 rounded-lg" type="email" placeholder="Nhập email" required />
            <label className="text-dark-gray">Mật khẩu</label>
            <input className="border border-dark-gray p-2 w-full h-10 mb-2 rounded-lg" type="password" placeholder="Nhập mật khẩu" required />
            
            <div className="text-sm mb-2">
              <button
                type="button"
                className="text-light-green hover:underline"
                onClick={() => alert("Chức năng này chưa được triển khai")}
              >
                Quên mật khẩu?
              </button>
            </div>
            
            <button type="submit" className="w-full h-10 transition-colors focus:ring-2 hover:bg-[#124232] bg-light-green text-white py-2 rounded-lg">Đăng nhập</button>
          </form>

          <p className="text-center text-sm mt-2 text-darkgray">__hoặc__</p>
          <LoginWithGoogleButton/>

          <p className="mt-4 text-sm text-center">
            Bạn chưa có tài khoản?{' '}
            <button className="text-light-green hover:underline" onClick={onSwitch}>Đăng ký</button>
          </p>
        </div>
      </div>
    );
  }
  