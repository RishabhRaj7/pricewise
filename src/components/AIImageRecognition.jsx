import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { allProducts } from '../data/products';
import { createWorker } from 'tesseract.js';

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
    setRecognizedItems([]); // Clear previous results

    try {
      // Create a URL for the image file
      const imageUrl = URL.createObjectURL(file);
      
      console.log("Processing image with Tesseract...");
      
      // Initialize Tesseract worker with English language
      const worker = await createWorker('eng');
      
      // Perform OCR on the image
      const { data } = await worker.recognize(imageUrl);
      
      // Terminate the worker when done
      await worker.terminate();
      
      // Process the OCR results
      const extractedText = data.text;
      console.log("Extracted text from image:", extractedText);
      
      // Split text into lines and filter empty lines
      let items = extractedText.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      // Further process the items (remove very short items, duplicates, etc.)
      items = items
        .filter(item => item.length > 2) // Remove very short items
        .filter(item => !/^\d+(\.\d+)?$/.test(item)) // Remove numbers-only items
        .map(item => {
          // Clean up common OCR artifacts
          return item
            .replace(/[^\w\s]/g, '') // Remove special characters
            .trim();
        })
        .filter((item, index, self) => 
          self.indexOf(item) === index && item.length > 0
        ); // Remove duplicates and empty items
      
      console.log("Processed items:", items);
      
      if (items.length === 0) {
        throw new Error("No text could be extracted from the image");
      }
      
      setRecognizedItems(items);
      
      // Match recognized items with products in your store
      const matchedProducts = findMatchingProducts(items);
      console.log("Matched products:", matchedProducts);
      
      // Add matched products to cart
      if (matchedProducts.length > 0) {
        matchedProducts.forEach(product => {
          addToCart(product);
          console.log("Added to cart:", product.name);
        });
        
        // Close the panel and navigate to cart after a short delay
        setTimeout(() => {
          setIsOpen(false);
          navigate('/cart');
        }, 2000);
      } else {
        console.log("No matching products found");
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error processing image:', error);
      setIsLoading(false);
      alert(error.message || 'Error processing image. Please try again with a clearer image.');
    }
  };

  // Function to find matching products from the allProducts list
  const findMatchingProducts = (recognizedItems) => {
    const matchedProducts = [];
    const processedProductIds = new Set(); // Prevent duplicate products
    
    recognizedItems.forEach(item => {
      if (!item) return;
      
      const itemLower = item.toLowerCase();
      
      // Score-based matching algorithm
      const possibleMatches = allProducts.map(product => {
        const productName = product.name.toLowerCase();
        const productCategory = (product.category || '').toLowerCase();
        
        // Calculate a matching score
        let score = 0;
        
        // Exact match gets highest score
        if (productName === itemLower) {
          score += 100;
        }
        // Contains the full item name
        else if (productName.includes(itemLower)) {
          score += 75;
        }
        // Item contains the product name
        else if (itemLower.includes(productName)) {
          score += 60;
        }
        // Word-by-word matching
        else {
          const itemWords = itemLower.split(/\s+/)
            .filter(word => word.length > 2);
          const productWords = productName.split(/\s+/)
            .filter(word => word.length > 2);
          
          for (const word of itemWords) {
            if (productName.includes(word)) {
              score += 15;
            }
          }
          
          for (const word of productWords) {
            if (itemLower.includes(word)) {
              score += 10;
            }
          }
        }
        
        // Category matching
        if (productCategory && (itemLower.includes(productCategory) || 
            productCategory.includes(itemLower))) {
          score += 25;
        }
        
        return { product, score };
      });
      
      // Get the best match (with a reasonable threshold)
      const bestMatches = possibleMatches
        .filter(match => match.score > 25) // Threshold for considering a match
        .sort((a, b) => b.score - a.score);
      
      if (bestMatches.length > 0 && !processedProductIds.has(bestMatches[0].product.id)) {
        matchedProducts.push(bestMatches[0].product);
        processedProductIds.add(bestMatches[0].product.id);
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