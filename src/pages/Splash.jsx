import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/onboarding");
    }, 1500); // 500ms delay

    return () => clearTimeout(timer); // cleanup
  }, [navigate]);

  return (
  <MinimalLayout>
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <img src="/logo.png" alt="PriceWise Logo" className="mx-auto mb-4 w-32" />
        <p className="text-blue-800 font-bold text-lg">Getting Best Deals For You</p>
      </div>
    </div>
    </MinimalLayout>
  );
}
