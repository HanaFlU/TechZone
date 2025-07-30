import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import AuthService from "../../services/AuthService";
import useAuthForm from "../../hooks/useAuthForm";


import { IoMdClose } from "react-icons/io";
import {toast} from "react-toastify";


export default function RegisterModal({ onClose, onSwitch }) {
  const { login } = useContext(AuthContext);

  const initialFields ={
    name: "",
    phone: "",
    email: "",
    birthdate: "",
    gender: "",
    password: "",
    comfirmpassword: "",
  };


  const validateRegister = (fields) => {
    const { phone, email, password, comfirmpassword } = fields;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10,11}$/;

    if (!emailRegex.test(email)) {
      return "Email không hợp lệ";
    }

    if (!phoneRegex.test(phone)) {
      return "Số điện thoại không hợp lệ";
    }

    if (password.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (password !== comfirmpassword) {
      return "Mật khẩu nhập lại không khớp";
    }

    return "";

  }

  const { formData, error, setError, handleChange, validate } = useAuthForm(initialFields, validateRegister);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errMsg = validate();
    if (errMsg) {
      setError(errMsg);
      return;
    };

    try {
      console.log(formData);
      const data = await AuthService.register(formData);
      setError(null); 
      toast.success("Đăng ký thành công!");
      onClose();
    } catch (err) {
      console.error("Error during registration:", err);
      toast.error("Lỗi kết nối tới máy chủ. Đăng ký thất bại.");
      return;
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-full max-w-lg relative">
        <button className="absolute top-2 right-6 text-dark-gray w-2 h-2 cursor-pointer" onClick={onClose}>
          <IoMdClose  className="text-dark-gray w-6 h-8" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-dark-gray text-center text-shadow-light-gray">Đăng ký</h2>
        <form onSubmit={handleSubmit}>
          
          <div className="flex gap-2 mb-2">
            <div className="w-1/2">
              <label className="text-dark-gray">Họ và tên</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                type="text"
                className="border border-dark-gray p-2 w-full h-10 rounded-lg"
                placeholder="Họ và tên"
                required
              />
            </div>
            <div className="w-1/2">
              <label className="text-dark-gray">Số điện thoại</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                type="text"
                className="border border-dark-gray p-2 w-full h-10 rounded-lg"
                placeholder="Số điện thoại"
                required
              />
            </div>
          </div>
          
          <div className="mb-2">
            <label className="text-dark-gray">Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              className="border border-dark-gray p-2 w-full h-10 rounded-lg"
              placeholder="Email"
              required
            />
          </div>
          
          <div className="flex gap-2 mb-2">
            <div className="w-1/2">
              <label className="text-dark-gray">Ngày sinh</label>
              <input
                name="birthdate"
                value={formData.birthdate}
                onChange={handleChange}
                type="date"
                className="border border-dark-gray p-2 w-full h-10 rounded-lg"
                placeholder="Ngày sinh"
                required
              />
            </div>
            <div className="w-1/2">
              <label className="text-dark-gray">Giới tính</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="border border-dark-gray p-2 w-full h-10 rounded-lg"
                required
              >
                <option value="">Chọn giới tính</option>
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <div className="w-1/2">
              <label className="text-dark-gray">Mật khẩu</label>
              <input
                name="password"
                value={formData.password}
                onChange={handleChange}
                type="password"
                className="border border-dark-gray p-2 w-full h-10 rounded-lg"
                placeholder="Mật khẩu"
                required
              />
            </div>
            <div className="w-1/2">
              <label className="text-dark-gray">Nhập lại mật khẩu</label>
              <input
                name="comfirmpassword"
                value={formData.comfirmpassword}
                onChange={handleChange}
                type="password"
                className="border border-dark-gray p-2 w-full h-10 rounded-lg"
                placeholder="Nhập lại mật khẩu"
                required />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

          <button
            type="submit"
            className="w-full h-10 transition-colors focus:ring-2 hover:bg-[#124232] bg-light-green text-white py-2 rounded-lg"
          >
            Đăng ký
          </button>
        </form>
        <p className="mt-4 text-sm text-center">
          <span>Đã có tài khoản? </span>
          <button
            className="text-light-green hover:underline"
            onClick={onSwitch}
          >
            Đăng Nhập
          </button>
        </p>
      </div>
    </div>
  );
}
