import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function useAutoRedirectAfterLogin() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            if (user.role === "AD") {
                navigate("/admin/dashboard");
            } else {
                navigate("/");
            }
        }
    }, [user, navigate]);
}