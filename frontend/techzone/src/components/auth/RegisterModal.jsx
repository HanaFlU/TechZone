import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function RegisterModal({ onClose, onSwitch }) {
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    alert("Chức năng này chưa được triển khai");
    e.preventDefault();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-full max-w-lg relative">
        <button className="absolute top-2 right-3" onClick={onClose}>×</button>
        <h2 className="text-2xl font-bold mb-4 text-dark-gray text-center text-shadow-light-gray">Đăng ký</h2>
        <form onSubmit={handleSubmit}>
          
          <div className="flex gap-2 mb-2">
            <div className="w-1/2">
              <label className="text-dark-gray">Họ và tên</label>
              <input className="border border-dark-gray p-2 w-full h-10 rounded-lg" type="text" placeholder="Họ và tên" required />
            </div>
            <div className="w-1/2">
              <label className="text-dark-gray">Số điện thoại</label>
              <input className="border border-dark-gray p-2 w-full h-10 rounded-lg" type="text" placeholder="Số điện thoại" required />
            </div>
          </div>
          
          <div className="mb-2">
            <label className="text-dark-gray">Email</label>
            <input className="border border-dark-gray p-2 w-full h-10 rounded-lg" type="email" placeholder="Email" required />
          </div>
          
          <div className="flex gap-2 mb-2">
            <div className="w-1/2">
              <label className="text-dark-gray">Ngày sinh</label>
              <input className="border border-dark-gray p-2 w-full h-10 rounded-lg" type="date" placeholder="Ngày sinh" required />
            </div>
            <div className="w-1/2">
              <label className="text-dark-gray">Giới tính</label>
              <select className="border border-dark-gray p-2 w-full h-10 rounded-lg" required>
                <option value="">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <div className="w-1/2">
              <label className="text-dark-gray">Mật khẩu</label>
              <input className="border border-dark-gray p-2 w-full h-10 rounded-lg" type="password" placeholder="Mật khẩu" required />
            </div>
            <div className="w-1/2">
              <label className="text-dark-gray">Nhập lại mật khẩu</label>
              <input className="border border-dark-gray p-2 w-full h-10 rounded-lg" type="password" placeholder="Nhập lại mật khẩu" required />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-10 transition-colors focus:ring-2 hover:bg-[#124232] bg-light-green text-white py-2 rounded-lg"
          >
            Đăng ký
          </button>
        </form>
        <p className="mt-4 text-sm text-center">
          Đã có tài khoản?{' '}
          <button className="text-light-green hover:underline" onClick={onSwitch}>Đăng Nhập</button>
        </p>
      </div>
    </div>
  );
}
