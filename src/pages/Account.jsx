import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Account() {
  const [user, setUser] = useState({
    name: "Rishabh Raj",
    phone: "+91 9876543210",
    email: "",
    avatar: `${import.meta.env.BASE_URL}logos/blinkit.png`,
  });

  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user.name);
  const [editedEmail, setEditedEmail] = useState(user.email);
  const [editedPhone, setEditedPhone] = useState(user.phone);
  const [showOtpPrompt, setShowOtpPrompt] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(null);

  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("User logged out");
    navigate("/login");
  };

  const handleSave = () => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(otp);
    toast.success(`OTP sent to email: ${otp}`);
    setShowOtpPrompt(true);
  };

  const verifyOtp = () => {
    if (enteredOtp === generatedOtp) {
      setUser({ name: editedName, email: editedEmail, phone: editedPhone, avatar: user.avatar });
      setIsEditing(false);
      setShowOtpPrompt(false);
      setEnteredOtp("");
      toast.success("OTP verified and details updated!");
    } else {
      toast.error("Invalid OTP");
    }
  };

  const handleWIP = (label) => toast.info(`${label} is still in the oven 🍕 Coming soon!`);

  return (
    <div className="max-w-[420px] mx-auto p-4 pb-24 bg-[#fbfbfb]">
      <div className="flex items-center gap-4 mb-6">
        <img
          src={user.avatar}
          alt="User Avatar"
          className="w-16 h-16 rounded-full object-cover border"
        />
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{user.name}</h2>
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-500 text-sm"
            >✏️</button>
          </div>
          {user.email && <p className="text-sm text-gray-500">{user.email}</p>}
          <p className="text-sm text-gray-500">{user.phone}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm divide-y text-sm">
        <button className="w-full text-left px-4 py-3 hover:bg-gray-50">🔄 Order History</button>
        <button onClick={() => handleWIP("Support") } className="w-full text-left px-4 py-3 hover:bg-gray-50">💬 Support</button>
        <button onClick={() => handleWIP("Settings")} className="w-full text-left px-4 py-3 hover:bg-gray-50">⚙️ Settings</button>
        <button onClick={() => handleWIP("Subscriptions")} className="w-full text-left px-4 py-3 hover:bg-gray-50">📦 Subscriptions</button>
        <button onClick={() => toast.info("Address management coming soon! 🗺️") } className="w-full text-left px-4 py-3 hover:bg-gray-50">🏠 Addresses</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm mt-4 divide-y text-sm">
        <button onClick={() => setShowPrivacy(true)} className="w-full text-left px-4 py-3 hover:bg-gray-50">🔐 Privacy Policy</button>
        <button onClick={() => setShowTerms(true)} className="w-full text-left px-4 py-3 hover:bg-gray-50">📄 Terms of Service</button>
      </div>

      <button
        onClick={handleLogout}
        className="mt-6 w-full bg-red-500 text-white py-2 rounded-xl shadow hover:bg-red-600"
      >
        🚪 Logout
      </button>

      {isEditing && (
        <div className="max-w-[420px] mx-auto fixed inset-0 bg-white z-50 p-6 overflow-y-auto">
          <button onClick={() => setIsEditing(false)} className="mb-4 text-gray-600">← Back</button>
          <h2 className="text-lg font-semibold mb-4">Edit Account</h2>

          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            className="border rounded px-3 py-2 w-full mb-4"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
          />

          <label className="block text-sm font-medium mb-1">Email Address</label>
          <input
            className="border rounded px-3 py-2 w-full mb-4"
            placeholder="Enter email address"
            value={editedEmail}
            onChange={(e) => setEditedEmail(e.target.value)}
          />

          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input
            className="border rounded px-3 py-2 w-full mb-6"
            placeholder="Enter phone number"
            value={editedPhone}
            onChange={(e) => setEditedPhone(e.target.value)}
          />

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="text-sm text-gray-500"
            >Cancel</button>
            <button
              onClick={handleSave}
              className="text-sm bg-green-500 text-white px-4 py-2 rounded"
            >Save</button>
          </div>
        </div>
      )}

      {showOtpPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white max-w-[320px] w-full p-6 rounded-xl text-center shadow-xl">
            <h3 className="text-md font-semibold mb-2">Verify OTP</h3>
            <p className="text-sm mb-4">Enter the 4-digit OTP sent to your email</p>
            <input
              type="text"
              maxLength={4}
              className="border px-4 py-2 rounded text-center mb-4 w-full"
              value={enteredOtp}
              onChange={(e) => setEnteredOtp(e.target.value)}
            />
            <div className="flex justify-between items-center gap-2">
              <button onClick={() => setShowOtpPrompt(false)} className="text-sm text-gray-500">Cancel</button>
              <button
                onClick={verifyOtp}
                className="text-sm bg-green-500 text-white px-4 py-2 rounded"
              >Verify</button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white max-w-[380px] w-full max-h-[80vh] overflow-y-auto rounded-xl p-4 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Privacy Policy</h3>
            <p className="text-sm text-gray-600">We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and disclose data when you use our application. We may collect data such as your name, phone number, email address, and address to personalize your experience, provide customer support, and improve our services. We do not sell or rent your information to third parties. Your data is stored securely and access is restricted to authorized personnel only. We may use cookies and similar technologies to enhance user experience and analyze usage trends. You may choose to disable cookies through your browser settings. Your continued use of the app implies agreement with this policy. If you have any questions or requests related to your data, please contact our support team. We reserve the right to update this policy and will notify users of significant changes through the app or email.</p>
            <button
              onClick={() => setShowPrivacy(false)}
              className="mt-4 w-full bg-green-500 text-white py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white max-w-[380px] w-full rounded-xl p-4 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Terms of Service</h3>
            <p className="text-sm text-gray-600">By using this app, you agree to the following terms: You must be at least 18 years old to use this service. You are responsible for maintaining the confidentiality of your account and password. You agree not to misuse the services or access them using unauthorized methods. We may suspend or terminate your account if we suspect any malicious activity, breach of terms, or illegal behavior. The content and features provided by this app are subject to change without notice. We are not liable for any loss or damage resulting from the use of the app. We retain the right to refuse service, remove content, or limit access at our discretion. These terms may be updated periodically, and continued usage implies acceptance of the latest version. Please review this section regularly for updates.</p>
            <button
              onClick={() => setShowTerms(false)}
              className="mt-4 w-full bg-green-500 text-white py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
