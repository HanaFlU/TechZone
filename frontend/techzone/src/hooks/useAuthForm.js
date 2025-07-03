import { useState } from "react";

export default function useAuthForm(initialFields, validateFn) {
    const [formData, setFormData] = useState(initialFields);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        if (validateFn) {
            return validateFn(formData);
        }
        return "";
    };

    return { formData, setFormData, error, setError, handleChange, validate };
}