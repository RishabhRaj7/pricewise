import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { updateUser } from "../utils/userService";
import { supabase } from "../supabase.js";
import { useCart } from "../context/CartContext";

export default function Account() {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          return {
            name: parsed.name || "",
            phone: parsed.phonenumber ? `+91 ${parsed.phonenumber}` : "",
            email: parsed.email || "",
            avatar: `${import.meta.env.BASE_URL}logos/blinkit.png`,
          };
        }
        return {
          name: "",
          phone: "",
          email: "",
          avatar: `${import.meta.env.BASE_URL}logos/blinkit.png`,
        };
      });
      

  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedPhone, setEditedPhone] = useState("");
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const { addToCart, clearCart } = useCart();
  const navigate = useNavigate();
  
  useEffect(() => {
    setEditedName(user.name);
    setEditedEmail(user.email);
    setEditedPhone(user.phone);
  }, [user]);
  
  const [showOtpPrompt, setShowOtpPrompt] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(null);

  const handleLogout = () => {
    console.log("User logged out");
    localStorage.removeItem("cart");
    localStorage.clear();
    clearCart();
    navigate("/login");
  };

  const handleSave = () => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(otp);
    toast.success(`OTP sent to email: ${otp}`);
    setShowOtpPrompt(true);
  };

const verifyOtp = async () => {
    if (enteredOtp === generatedOtp) {
      const stored = localStorage.getItem("user");
      const storedUser = stored ? JSON.parse(stored) : null;
  
      if (!storedUser || !storedUser.userid) {
        toast.error("User ID missing.");
        return;
      }
  
      const updates = {
        name: editedName,
        email: editedEmail,
        phonenumber: editedPhone.replace("+91 ", ""),
      };
  
      const updatedUser = await updateUser(storedUser.userid, updates);
  
      if (updatedUser) {
        const updatedData = {
          ...storedUser,
          ...updates,
        };
        setUser({
          name: updatedUser.name,
          email: updatedUser.email,
          phone: `+91 ${updatedUser.phonenumber}`,
          avatar: user.avatar,
        });
        localStorage.setItem("user", JSON.stringify(updatedData));
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        setShowOtpPrompt(false);
        setEnteredOtp("");
      } else {
        toast.error("Failed to update user.");
      }
    } else {
      toast.error("Invalid OTP");
    }
  };
  
  const fetchOrderHistory = async () => {
    try {
      setIsLoadingOrders(true);
      const storedUser = localStorage.getItem("user");
      const userData = storedUser ? JSON.parse(storedUser) : null;
      
      if (!userData || !userData.userid) {
        toast.error("User information not available");
        setIsLoadingOrders(false);
        return;
      }
      
      // Fetch orders for this user
      const { data, error } = await supabase
        .from('orderhistory')
        .select(`
          *,
          product:productid(name)
        `)
        .eq('userid', userData.userid)
        .order('orderdate', { ascending: false });
        
      if (error) {
        console.error("Error fetching order history:", error);
        toast.error("Failed to load order history");
        setIsLoadingOrders(false);
        return;
      }
      
      // Map the product names to each order item
      const ordersWithProductNames = data.map(order => ({
        ...order,
        productname: order.product?.name || `Product #${order.productid}`
      }));
      
      // Group orders by orderid
      const groupedOrders = ordersWithProductNames.reduce((acc, order) => {
        if (!acc[order.orderid]) {
          acc[order.orderid] = {
            orderid: order.orderid,
            orderdate: order.orderdate,
            items: [],
            totalAmount: 0
          };
        }
        
        acc[order.orderid].items.push(order);
        acc[order.orderid].totalAmount += Number(order.totalprice);
        return acc;
      }, {});
      // Convert to array for rendering
      const ordersArray = Object.values(groupedOrders).sort((a, b) => b.orderid - a.orderid);
      
      setOrderHistory(ordersArray);
      setShowOrderHistory(true);
      setIsLoadingOrders(false);
    } catch (error) {
      console.error("Error in fetchOrderHistory:", error);
      toast.error("Something went wrong while fetching orders");
      setIsLoadingOrders(false);
    }
  };

  const handleOrderAgain = async (order) => {
    try {
      // Clear current cart first
      clearCart();
      
      // Get products from localStorage
      const allProductsJSON = localStorage.getItem("allProducts");
      if (!allProductsJSON) {
        toast.error("Product information not available");
        return;
      }
      
      const allProducts = JSON.parse(allProductsJSON);
      
      // Keep track of which items were successfully added
      let addedItemsCount = 0;
      
      // Add each item to cart
      for (const item of order.items) {
        // Find the matching product in allProducts using productid
        const matchingProduct = allProducts.find(product => product.productid === item.productid);
        
        if (matchingProduct) {
          // Use the exact same structure as in Home.jsx addToCart
          addToCart({
            name: matchingProduct.name,
            image: matchingProduct.image,
            quantityText: matchingProduct.quantityText,
            prices: matchingProduct.prices,
            productid: matchingProduct.productid // Use productid instead of id
          });
          
          // If the quantity in order history is more than 1, update the quantity
          if (item.quantity > 1) {
            // We need to update quantity to match order history
            // addToCart adds with quantity 1, so we need to add (quantity-1) more
            for (let i = 1; i < item.quantity; i++) {
              addToCart({
                name: matchingProduct.name,
                image: matchingProduct.image,
                quantityText: matchingProduct.quantityText,
                prices: matchingProduct.prices,
                productid: matchingProduct.productid // Use productid instead of id
              });
            }
          }
          
          addedItemsCount++;
        } else {
          console.log(`Product not found in allProducts: ${item.productid}`);
        }
      }
      
      if (addedItemsCount > 0) {
        toast.success(`${addedItemsCount} items added to cart!`);
        navigate("/cart");
      } else {
        toast.warning("Couldn't find any matching products in our catalog");
      }
    } catch (error) {
      console.error("Error in handleOrderAgain:", error);
      toast.error("Failed to add items to cart");
    }
  };

  const handleWIP = (label) => toast.info(`${label} is still in the oven 🍕 Coming soon!`);

  if (showOrderHistory) {
    return (
      <div className="max-w-[420px] mx-auto p-4 pb-24 bg-[#fbfbfb] min-h-screen">
        <div className="flex items-center mb-4">
          <button 
            onClick={() => setShowOrderHistory(false)}
            className="text-gray-600 mr-2"
          >
            ← Back
          </button>
          <h3 className="text-lg font-semibold">Order History</h3>
        </div>
        
        {isLoadingOrders ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <div>
            {orderHistory.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-2">No orders found</p>
                <p className="text-sm text-gray-400">Your order history will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orderHistory.map((order) => (
                  <div key={order.orderid} className="border rounded-lg p-4 bg-white shadow-sm">
                    <div className="mb-2">
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                        Order #{order.orderid}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-3">
                      {new Date(order.orderdate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    
                    <div className="border-t border-dashed pt-2 mb-2">
                      <p className="text-sm font-medium">Items ({order.items.length})</p>
                      <ul className="mt-1 space-y-1">
                        {order.items.map((item, index) => (
                          <li key={index} className="text-sm flex justify-between">
                            <span className="text-gray-800">
                              {item.productname} × {item.quantity}
                            </span>
                            <span className="font-medium">₹{Number(item.totalprice).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="border-t pt-2 flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Amount:</span>
                      <span className="text-lg font-semibold">₹{order.totalAmount.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() => handleOrderAgain(order)}
                      className="mt-4 w-full bg-green-500 text-white py-2 rounded-lg"
                    >
                      Order Again
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

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
        <button onClick={fetchOrderHistory} className="w-full text-left px-4 py-3 hover:bg-gray-50">🔄 Order History</button>
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
