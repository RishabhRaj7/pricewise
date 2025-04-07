import { Outlet, useLocation, useNavigate } from "react-router-dom";

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="h-screen flex justify-center bg-[#fbfbfb] overflow-hidden">
      <div className="w-full max-w-[420px] h-full flex flex-col justify-between bg-[#fbfbfb] relative">
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
        <div className="bg-white shadow-md border-t flex justify-around py-2 rounded-t-xl">
          {[
            { label: "Shop", icon: "🏠", path: "/home" },
            { label: "Explore", icon: "🧭", path: "/explore" },
            { label: "Cart", icon: "🛒", path: "/cart" },
            { label: "Favourites", icon: "❤️", path: "/favourites" },
            { label: "Account", icon: "👤", path: "/account" },
          ].map((item) => (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center px-3 py-1 rounded-lg cursor-pointer ${
                currentPath === item.path
                  ? "text-green-600 bg-green-100"
                  : "text-gray-500"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
