import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useCart } from "../context/CartContext";
import { allProducts } from "../data/products";

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, addToCart } = useCart();
  
  // Calculate total items in cart for badge
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // AI functionality state
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recognizedItems, setRecognizedItems] = useState([]);
  const [notFoundItems, setNotFoundItems] = useState([]);
  const fileInputRef = useRef(null);

  // Function to check if a route is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // AI Panel toggle
  const toggleAIPanel = () => {
    setIsAIPanelOpen(!isAIPanelOpen);
    
    // Only reset recognized items when opening the panel
    if (!isAIPanelOpen) {
      setRecognizedItems([]);
      setNotFoundItems([]);
    }
  };

  // Function for adding products to cart one by one, based on Account.jsx handleOrderAgain implementation
  const addProductsToCart = (products) => {
    if (!products || products.length === 0) return;
    
    console.log('Adding multiple products to cart:', products);
    
    // Add each item to cart individually, similar to Account.jsx handleOrderAgain
    products.forEach(product => {
      console.log('Adding product to cart:', product.name);
      
      // Format exactly like in Account.jsx
      const formattedProduct = {
        name: product.name,
        image: product.image || `https://placehold.co/100x100?text=${encodeURIComponent(product.name)}`,
        quantityText: product.quantityText || "1 unit",
        prices: product.prices || [],
        productid: product.productid || product.id // Include productid
      };
      
      // Add to cart directly, one at a time
      addToCart(formattedProduct);
    });
  };

  // Handle image upload for AI processing
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setRecognizedItems([]);
    setNotFoundItems([]);

    try {
      // Create FormData for the API call
      const formData = new FormData();
      formData.append('image', file);

      // For demonstration, we'll simulate an API response with mock data
      setTimeout(() => {
        try {
          // Updated mock recognized items
          const mockRecognizedItems = ['Face Wash', 'Milk', 'Granola', 'Eau De Toilette', 'Chips', 'Eggs'];
          setRecognizedItems(mockRecognizedItems);
          
          // Match recognized items with products in localStorage
          const matchedProducts = findMatchingProducts(mockRecognizedItems);
          console.log('Matched products:', matchedProducts); 
          
          // Use our helper function to add products to cart
          addProductsToCart(matchedProducts);
          
          // Set loading to false
          setIsLoading(false);
        } catch (error) {
          console.error('Error processing recognition results:', error);
          setIsLoading(false);
        }
      }, 2000);
    } catch (error) {
      console.error('Error processing image:', error);
      setIsLoading(false);
    }
  };

  // Function to find matching products from localStorage
  const findMatchingProducts = (recognizedItems) => {
    const matchedProducts = [];
    const notFoundItems = [];
    
    // Get products from localStorage instead of imported allProducts
    let localProducts = [];
    try {
      const storedProducts = localStorage.getItem('allProducts');
      if (storedProducts) {
        localProducts = JSON.parse(storedProducts);
        console.log('Found products in localStorage:', localProducts.length);
      } else {
        // Fallback to imported allProducts if localStorage is empty
        localProducts = allProducts;
        console.log('Using fallback products:', allProducts.length);
      }
    } catch (error) {
      console.error('Error retrieving products from localStorage:', error);
      localProducts = allProducts; // Fallback
    }
    
    // Similar to Explore.jsx search functionality
    const calculateSimilarity = (text, query) => {
      if (!text) return 0;
      
      // Exact match gets highest score
      if (text.includes(query)) return 3;
      
      // Check for word matches (complete words)
      const textWords = text.split(/\s+/);
      const queryWords = query.split(/\s+/);
      
      let score = 0;
      queryWords.forEach(qWord => {
        // Only consider words with 3+ characters
        if (qWord.length < 3) return;
        
        // Check for exact word match
        if (textWords.some(word => word === qWord)) {
          score += 2;
          return;
        }
        
        // Check for word starts with - less weight
        if (textWords.some(word => word.startsWith(qWord) && qWord.length >= 4)) {
          score += 0.5;
        }
      });
      
      return score;
    };
    
    recognizedItems.forEach(item => {
      const lowerItem = item.toLowerCase();
      
      // Search and score products similar to Explore.jsx
      const scoredProducts = localProducts.map(product => {
        const keywords = `${product.name} ${product.category || ''}`.toLowerCase();
        const similarity = calculateSimilarity(keywords, lowerItem);
        return { ...product, similarity };
      })
      .filter(product => product.similarity >= 0.5) // Higher threshold like in Explore.jsx
      .sort((a, b) => b.similarity - a.similarity);
      
      // Take the best match if available
      const bestMatch = scoredProducts.length > 0 ? scoredProducts[0] : null;
      
      if (bestMatch) {
        // Only add product if it's not already added
        if (!matchedProducts.some(p => p.productid === bestMatch.productid)) {
          matchedProducts.push({
            ...bestMatch,
            name: bestMatch.name,
            image: bestMatch.image || `https://placehold.co/100x100?text=${encodeURIComponent(bestMatch.name)}`,
            quantityText: bestMatch.quantityText || "1 unit",
            prices: bestMatch.prices || [],
            productid: bestMatch.productid || bestMatch.id
          });
        }
      } else {
        notFoundItems.push(item);
      }
    });
    
    setNotFoundItems(notFoundItems);
    console.log('Matched products to add to cart:', matchedProducts.length);
    
    return matchedProducts;
  };

  return (
    <div className="min-h-screen flex flex-col max-w-[420px] mx-auto relative">
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Fixed AI Button positioned within the mobile viewport (480px) */}
      <div 
        className="fixed w-14 h-14 rounded-full bg-green-600 text-white flex items-center justify-center shadow-lg z-50 cursor-pointer"
        style={{ 
          bottom: '80px',
          right: window.innerWidth <= 480 ? '20px' : `calc(50% - 210px + 20px)`, 
          // When screen is mobile (≤480px): 20px from right edge
          // When screen is larger: Position relative to the container's right edge
        }}
        onClick={toggleAIPanel}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor"
          className="w-6 h-6"
        >
          <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM6.262 6.072a8.25 8.25 0 1010.562-.766 4.5 4.5 0 01-1.318 1.357L14.25 7.5l.165.33a.809.809 0 01-1.086 1.085l-.604-.302a1.125 1.125 0 00-1.298.21l-.132.131c-.439.44-.439 1.152 0 1.591l.296.296c.256.257.622.374.98.314l1.17-.195c.323-.054.654.036.905.245l1.33 1.108c.32.267.46.694.358 1.1a8.7 8.7 0 01-2.288 4.04l-.723.724a1.125 1.125 0 01-1.298.21l-.153-.076a1.125 1.125 0 01-.622-1.006v-1.089c0-.298-.119-.585-.33-.796l-1.347-1.347a1.875 1.875 0 01-.544-1.724l.124-.622-1.04-.52a.809.809 0 01-.106-1.384l.64-.425a1.125 1.125 0 00.21-1.298L9.75 6.125l-.238.48a.809.809 0 01-1.1.386l-.36-.18a2.25 2.25 0 00-1.138-.314l-.792.793a4.5 4.5 0 01.88-1.228L6.262 6.072z" />
        </svg>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 max-w-[420px] mx-auto bg-white shadow-lg rounded-t-xl border-t border-gray-100 z-50">
        <div className="flex justify-around items-center py-2">
          <button
            onClick={() => navigate("/home")}
            className={`flex flex-col items-center p-2 ${
              isActive("/home") ? "text-green-600" : "text-gray-500"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
              <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </button>

          <button
            onClick={() => navigate("/explore")}
            className={`flex flex-col items-center p-2 ${
              isActive("/explore") ? "text-green-600" : "text-gray-500"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path
                fillRule="evenodd"
                d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs mt-1">Explore</span>
          </button>

          <button
            onClick={() => navigate("/cart")}
            className={`flex flex-col items-center p-2 relative ${
              isActive("/cart") || isActive("/optimized-cart") ? "text-green-600" : "text-gray-500"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
            </svg>
            
            {/* Cart Badge */}
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
            
            <span className="text-xs mt-1">Cart</span>
          </button>

          <button
            onClick={() => navigate("/favourites")}
            className={`flex flex-col items-center p-2 ${
              isActive("/favourites") ? "text-green-600" : "text-gray-500"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
            <span className="text-xs mt-1">Favourites</span>
          </button>

          <button
            onClick={() => navigate("/account")}
            className={`flex flex-col items-center p-2 ${
              isActive("/account") ? "text-green-600" : "text-gray-500"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path
                fillRule="evenodd"
                d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs mt-1">Account</span>
          </button>
        </div>
      </nav>

      {/* AI Panel */}
      {isAIPanelOpen && (
        <div className="fixed bottom-40 left-0 right-0 mx-auto max-w-[360px] bg-white rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">AI Shopping Assistant</h3>
            <button onClick={toggleAIPanel} className="text-gray-400 hover:text-gray-500">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-5">
            {isLoading ? (
              <div className="text-center">
                <p className="mb-4">Processing your image...</p>
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500 mx-auto"></div>
              </div>
            ) : recognizedItems.length > 0 ? (
              <div>
                <h4 className="font-medium mb-3">Items recognized:</h4>
                <ul className="space-y-2 mb-4">
                  {recognizedItems.map((item, index) => {
                    const isFound = !notFoundItems.includes(item);
                    return (
                      <li key={index} 
                          className={`py-2 px-3 rounded-md flex justify-between items-center
                                      ${isFound ? "bg-green-50 border border-green-100" : "bg-gray-50 border border-gray-100"}`}
                      >
                        <span>{item}</span>
                        {isFound ? (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Match found</span>
                        ) : (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">No match</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
                
                {recognizedItems.length - notFoundItems.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-green-600 font-medium">
                      Added {recognizedItems.length - notFoundItems.length} item(s) to your cart!
                    </p>
                    <div className="flex space-x-2">
                      <button 
                        className="flex-1 py-2 px-3 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors"
                        onClick={() => navigate('/cart')}
                      >
                        Go to Cart
                      </button>
                      <button 
                        className="flex-1 py-2 px-3 border border-green-600 text-green-600 rounded-md font-medium hover:bg-green-50 transition-colors"
                        onClick={() => {
                          setRecognizedItems([]);
                          setNotFoundItems([]);
                          fileInputRef.current.value = null;
                        }}
                      >
                        Scan Another Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-3 bg-yellow-50 rounded-md">
                    <p className="text-yellow-700">No matching products found in our catalog</p>
                    <button 
                      className="mt-2 py-2 px-4 bg-gray-200 text-gray-800 rounded-md font-medium hover:bg-gray-300 transition-colors"
                      onClick={() => {
                        setRecognizedItems([]);
                        setNotFoundItems([]);
                        fileInputRef.current.value = null;
                      }}
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="mb-4">Upload an image of your shopping list or items you want to buy</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  ref={fileInputRef}
                  className="hidden"
                />
                <button 
                  className="w-full py-3 px-4 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors"
                  onClick={() => fileInputRef.current.click()}
                >
                  Select Image
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
