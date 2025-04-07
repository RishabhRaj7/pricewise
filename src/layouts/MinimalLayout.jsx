// src/layouts/MinimalLayout.jsx
export default function MinimalLayout({ children }) {
  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-[#fbfbfb]">
      {children}
    </div>
  );
}
