import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import MinimalLayout from "../layouts/MinimalLayout";

export default function Login() {
  const [number, setNumber] = useState("");
  const navigate = useNavigate();

  const handleNext = () => {
    if (!number || !/^[6-9]\d{9}$/.test(number)) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    const generatedOTP = Math.floor(1000 + Math.random() * 9000);
    localStorage.setItem("otp", generatedOTP);
    toast.success(`Your OTP is ${generatedOTP}`);

    navigate("/otp");
  };

  return (
    <MinimalLayout>
    <div className="relative min-h-screen bg-[#fbfbfb] overflow-hidden">
      <div className="relative z-10 p-6 flex flex-col justify-between h-full">
        <div className="text-center mt-20">
          <div className="z-0 w-full flex justify-center">
            <img
              src={`${import.meta.env.BASE_URL}groceries.png`}
              alt="Groceries"
              className="scale-150"
            />
          </div>
          <div className="relative z-10">
            <p className="text-lg font-semibold">Login</p>
            <div className="mt-4">
              <label className="block text-sm mb-1">Mobile Number</label>
              <div className="flex items-center border rounded p-2">
                <span>🇮🇳 +91</span>
                <input
                  type="tel"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="ml-2 outline-none w-full"
                  placeholder="Enter number"
                />
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={handleNext}
          className="bg-green-500 text-white w-14 h-14 mx-auto rounded-full mt-10"
        >
          ➜
        </button>
      </div>
    </div>
    </MinimalLayout>
  );
}
