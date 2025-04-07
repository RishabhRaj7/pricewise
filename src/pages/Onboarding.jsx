import { useNavigate } from "react-router-dom";
import MinimalLayout from "../layouts/MinimalLayout";

export default function Onboarding() {
  const navigate = useNavigate();

  return (
    <MinimalLayout>
    <div className="h-screen flex flex-col justify-between p-4">
      <div className="text-center mt-10">
        <img src={`${import.meta.env.BASE_URL}onboard1.png`} alt="Slide" className="mx-auto" />
        <div className="bg-white p-4 rounded-xl shadow mt-6">
          <h2 className="font-bold text-lg">Never miss a better deal again</h2>
          <p className="text-sm text-gray-600">Track price history, and buy when it’s cheapest.</p>
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={() => navigate("/login")} className="bg-green-500 text-white rounded-full p-3">
          ➜
        </button>
      </div>
    </div>
    </MinimalLayout>
  );
}
