import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import MinimalLayout from "../layouts/MinimalLayout";

export default function OTP() {
  const [otpInput, setOtpInput] = useState("");
  const navigate = useNavigate();

  const handleVerify = () => {
    const storedOTP = localStorage.getItem("otp");

    if (otpInput === storedOTP) {
      navigate("/location");
    } else {
      toast.error("Incorrect OTP. Please try again.");
    }
  };

  const handleResend = () => {
    const newOTP = Math.floor(1000 + Math.random() * 9000);
    localStorage.setItem("otp", newOTP);
    toast.info(`New OTP: ${newOTP}`);
  };

  return (
    <MinimalLayout>
      <div className="p-6 h-screen flex flex-col justify-between">
        <div>
          {/* Back button */}
          <button
            onClick={() =>
              navigate("/login", {
                state: { phoneNumber: localStorage.getItem("phoneNumber") },
              })
            }
            className="text-sm text-gray-600 mb-4"
          >
            ← Back
          </button>

          <p className="text-lg font-semibold mb-4">Enter your 4-digit code</p>
          <input
            type="text"
            className="border p-2 rounded w-full text-center text-xl tracking-widest"
            maxLength={4}
            value={otpInput}
            onChange={(e) => setOtpInput(e.target.value)}
          />
          <button onClick={handleResend} className="text-green-500 mt-2 text-sm">
            Resend Code
          </button>
        </div>
        <button
          onClick={handleVerify}
          className="bg-green-500 text-white w-14 h-14 mx-auto rounded-full"
        >
          ➜
        </button>
      </div>
    </MinimalLayout>
  );
}
