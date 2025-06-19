import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function RegisterModal({ onClose, onSwitch }) {
    const { login } = useContext(AuthContext);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      // call backend API
      const res = await fetch("/api/auth/login", {});
      const data = await res.json();
      login(data.user, data.token); // save to context
      onClose();
    };
  
    return (
      <div className="fixed inset-0 bg-opacity-500 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded w-full max-w-sm relative">
          <button className="absolute top-2 right-3" onClick={onClose}>×</button>
          <h2 className="text-xl font-bold mb-4">Đăng ký</h2>
          <form onSubmit={handleSubmit}>
            <input className="border p-2 w-full mb-2" type="email" placeholder="Email" required />
            <input className="border p-2 w-full mb-4" type="password" placeholder="Mật khẩu" required />
            <button type="submit" className="bg-green-600 text-white w-full py-2 rounded">Đăng ký</button>
          </form>
          <p className="mt-4 text-sm text-center">
            Đã có tài khoản?{' '}
            <button className="text-green-600" onClick={onSwitch}>Đăng Nhập</button>
          </p>
        </div>
      </div>
    );
  }
  