import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import MinimalLayout from "../layouts/MinimalLayout";
import { getUserByPhoneNumber, createUserWithPhone } from "../utils/userService";

export default function OTP() {
  const [otpInput, setOtpInput] = useState("");
  const navigate = useNavigate();

  const handleVerify = async () => {
    const storedOTP = localStorage.getItem("otp");
    const phoneNumber = localStorage.getItem("phoneNumber");
  
    if (otpInput === storedOTP) {
      const user = await getUserByPhoneNumber(phoneNumber);
  
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        navigate("/location");
      } else {
        // If user doesn't exist, create new one with just phone number
        const newUser = await createUserWithPhone(phoneNumber);
        if (newUser) {
          localStorage.setItem("user", JSON.stringify(newUser));
          navigate("/location");
        } else {
          toast.error("Unable to create new user. Please try again.");
        }
      }
      
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
