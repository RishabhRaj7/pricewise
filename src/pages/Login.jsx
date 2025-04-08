import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import MinimalLayout from "../layouts/MinimalLayout";

export default function Login() {
  const location = useLocation();
  const [number, setNumber] = useState(location.state?.phoneNumber || "");
  const navigate = useNavigate();

  const handleNext = () => {
    if (!number || number.length !== 10 || isNaN(number)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    const otp = Math.floor(1000 + Math.random() * 9000);
    localStorage.setItem("otp", otp);
    localStorage.setItem("phoneNumber", number);
    toast.success(`OTP: ${otp}`);
    navigate("/otp");
  };

  return (
    <MinimalLayout>
      <div className="p-6 h-screen flex flex-col justify-between">
        <div className="text-center">
          <img
            src={`${import.meta.env.BASE_URL}groceries.png`}
            alt="Groceries"
            className="scale-150 mx-auto mb-4"
          />
          <div className="relative z-10">
            <p className="text-lg font-semibold">Login</p>
            <div className="mt-4">
              <label className="block text-sm mb-1">Mobile Number</label>
              <div className="flex items-center border rounded p-2">
                <span>🇮🇳 +91</span>
                <input
                  type="text"
                  className="ml-2 outline-none w-full"
                  placeholder="Enter number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={handleNext}
          className="bg-green-500 text-white w-14 h-14 mx-auto rounded-full"
        >
          ➜
        </button>
      </div>
    </MinimalLayout>
  );
}
