import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { allProducts } from '../data/products';

const AIImageRecognition = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recognizedItems, setRecognizedItems] = useState([]);
  const fileInputRef = useRef(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const toggleAIPanel = () => {
    setIsOpen(!isOpen);
    setRecognizedItems([]);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);

    try {
      // Create FormData for the API call
      const formData = new FormData();
      formData.append('image', file);

      // This is a placeholder for the actual API call
      // Replace with your actual AI image recognition API
      // const response = await fetch('your-ai-image-recognition-api-endpoint', {
      //   method: 'POST',
      //   body: formData,
      // });
      // const data = await response.json();
      
      // For demonstration, we'll simulate an API response with mock data
      setTimeout(() => {
        // Simulate recognized items (replace with actual AI results)
        const mockRecognizedItems = ['Face Wash', 'Milk', 'Granola', 'Eau De Toilette', 'Chips'];
        setRecognizedItems(mockRecognizedItems);
        
        // Match recognized items with products in your store
        const matchedProducts = findMatchingProducts(mockRecognizedItems);
        
        // Add matched products to cart
        matchedProducts.forEach(product => {
          addToCart(product);
        });
        
        setIsLoading(false);
        
        // Close the panel and navigate to cart
        setTimeout(() => {
          setIsOpen(false);
          navigate('/cart');
        }, 2000);
      }, 2000);
    } catch (error) {
      console.error('Error processing image:', error);
      setIsLoading(false);
    }
  };

  // Function to find matching products from the allProducts list
  const findMatchingProducts = (recognizedItems) => {
    const matchedProducts = [];
    
    recognizedItems.forEach(item => {
      // Simple matching algorithm (can be improved with more sophisticated NLP techniques)
      const matchedProduct = allProducts.find(product => {
        const productName = product.name.toLowerCase();
        return productName.includes(item.toLowerCase()) || 
               item.toLowerCase().includes(productName);
      });
      
      if (matchedProduct) {
        matchedProducts.push(matchedProduct);
      }
    });
    
    return matchedProducts;
  };

  return (
    <>
      {/* Floating AI button with inline styles for maximum visibility */}
      <div 
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#10b981',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '18px',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
          zIndex: 10000,
          cursor: 'pointer'
        }}
        onClick={toggleAIPanel}
      >
        AI
      </div>

      {/* AI Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '150px',
            right: '20px',
            width: '300px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 6px 24px rgba(0, 0, 0, 0.2)',
            zIndex: 10000,
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '15px',
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb'
            }}
          >
            <h3 style={{ margin: 0, fontSize: '18px' }}>AI Shopping Assistant</h3>
            <button
              onClick={toggleAIPanel}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>

          <div style={{ padding: '20px' }}>
            {isLoading ? (
              <div style={{ textAlign: 'center' }}>
                <p>Processing your image...</p>
                <div
                  style={{
                    margin: '20px auto',
                    width: '30px',
                    height: '30px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #10b981',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}
                ></div>
                <style>
                  {`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}
                </style>
              </div>
            ) : recognizedItems.length > 0 ? (
              <div>
                <h4 style={{ marginBottom: '10px' }}>Found these items:</h4>
                <ul style={{ padding: 0, listStyleType: 'none' }}>
                  {recognizedItems.map((item, index) => (
                    <li
                      key={index}
                      style={{
                        padding: '8px 12px',
                        marginBottom: '8px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '4px'
                      }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
                <p style={{ marginTop: '15px' }}>Adding to your cart...</p>
              </div>
            ) : (
              <div>
                <p style={{ marginBottom: '15px' }}>
                  Upload an image of your shopping list or items you want to buy
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                />
                <button
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                  onClick={() => fileInputRef.current.click()}
                >
                  Select Image
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AIImageRecognition;