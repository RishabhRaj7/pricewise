import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";

const brandIcons = {
  blinkit: `${import.meta.env.BASE_URL}logos/blinkit.png`,
  zepto: `${import.meta.env.BASE_URL}logos/zepto.png`,
  instamart: `${import.meta.env.BASE_URL}logos/instamart.png`,
  swiggyinstamart: `${import.meta.env.BASE_URL}logos/instamart.png`,
  jiomart: `${import.meta.env.BASE_URL}logos/jiomart.png`,
  bigbasket: `${import.meta.env.BASE_URL}logos/bigbasket.png`,
};

export default function Explore() {
  const { addToCart, cartItems, updateQuantity } = useCart();
  const [productsByCategory, setProductsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [spellingSuggestion, setSpellingSuggestion] = useState(null);
  const [productNames, setProductNames] = useState([]);
  const [suggestionResults, setSuggestionResults] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const { data: rawProducts, error } = await supabase.rpc("get_products_with_prices");
      if (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
        return;
      }

      const { data: platforms } = await supabase.from("platform").select("*");
      const platformMap = {};
      platforms.forEach((p) => {
        platformMap[p.platformid] = p.name;
      });

      const groupedByCategory = {};
      const productsArray = [];
      const categoriesSet = new Set();

      rawProducts.forEach((row) => {
        const product = row.product;
        const platformPrices = (product.prices || []).filter((p) => p.platformid !== null);
        if (!platformPrices.length) return;

        const productData = {
          id: product.id,
          productid: product.id,
          name: product.name,
          category: product.category,
          quantityText: "1 unit",
          image: `https://placehold.co/100x100?text=${encodeURIComponent(product.name)}`,
          prices: platformPrices.map((p) => ({
            platform: platformMap[p.platformid] || `Platform ${p.platformid}`,
            price: p.discountedprice,
            oldPrice: p.baseprice,
            time: `⏱ ${Math.floor(Math.random() * 11) + 10} Mins`,
          })),
          keywords: `${product.name} ${product.category}`.toLowerCase(),
        };

        // Add to products array for search
        productsArray.push(productData);

        // Add to categories
        categoriesSet.add(product.category);

        // Group by category
        if (!groupedByCategory[product.category]) {
          groupedByCategory[product.category] = [];
        }
        groupedByCategory[product.category].push(productData);
      });

      setAllProducts(productsArray);
      setProductsByCategory(groupedByCategory);
      setCategories(["All", ...Array.from(categoriesSet)]);
      setLoading(false);

      // Extract all product names for spell checking
      const names = productsArray.map(p => p.name.toLowerCase());
      setProductNames(names);
    }

    fetchProducts();
  }, []);

  // Function to find closest word match using Levenshtein distance
  const findClosestMatch = (input, wordList) => {
    if (!input || input.length < 3) return null;
    
    // Calculate Levenshtein distance between two strings
    const levenshteinDistance = (str1, str2) => {
      const track = Array(str2.length + 1).fill(null).map(() => 
        Array(str1.length + 1).fill(null));
      
      for (let i = 0; i <= str1.length; i += 1) {
        track[0][i] = i;
      }
      
      for (let j = 0; j <= str2.length; j += 1) {
        track[j][0] = j;
      }
      
      for (let j = 1; j <= str2.length; j += 1) {
        for (let i = 1; i <= str1.length; i += 1) {
          const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
          track[j][i] = Math.min(
            track[j][i - 1] + 1, // deletion
            track[j - 1][i] + 1, // insertion
            track[j - 1][i - 1] + indicator, // substitution
          );
        }
      }
      
      return track[str2.length][str1.length];
    };
    
    // Find words that might be close matches
    const inputLower = input.toLowerCase();
    
    // First check for words that contain the input as a substring
    const containsMatches = wordList.filter(word => word.includes(inputLower));
    if (containsMatches.length > 0) return null; // No need for suggestion if direct matches exist
    
    // Find closest match based on Levenshtein distance
    let closestMatch = null;
    let minDistance = Infinity;
    
    // Check individual words within search query
    const inputWords = inputLower.split(/\s+/);
    
    // For each word in the input
    for (const inputWord of inputWords) {
      if (inputWord.length < 3) continue; // Skip short words
      
      // For each product name in our database
      for (const productName of wordList) {
        // Check against each word in the product name
        const productWords = productName.split(/\s+/);
        
        for (const word of productWords) {
          if (word.length < 3) continue; // Skip short words
          
          const distance = levenshteinDistance(inputWord, word);
          // Normalize distance by longer word length
          const normalizedDistance = distance / Math.max(inputWord.length, word.length);
          
          // Consider it a match if normalized distance is less than 0.4 (40% different)
          if (normalizedDistance < 0.4 && normalizedDistance < minDistance) {
            minDistance = normalizedDistance;
            closestMatch = word;
          }
        }
      }
    }
    
    // If the input is very short but we found a match, or if the closest match
    // is different enough from the input, suggest it
    if (closestMatch && closestMatch !== inputLower) {
      return closestMatch;
    }
    
    return null;
  };
  
  // Improved search function with spell checking and suggested results
  useEffect(() => {
    if (!searchQuery.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      setSpellingSuggestion(null);
      setSuggestionResults([]);
      return;
    }

    setIsSearching(true);
    const query = searchQuery.toLowerCase().trim();
    
    // Find potential spelling corrections
    const suggestion = findClosestMatch(query, productNames);
    setSpellingSuggestion(suggestion);
    
    // Function to calculate similarity score between query and text with stricter rules
    const calculateSimilarity = (text, query) => {
      // Exact match gets highest score
      if (text.includes(query)) return 3;
      
      // Check for word matches (must be complete words, not partial)
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
    
    // Search and score products with stricter filtering
    const results = allProducts
      .map(product => {
        const similarity = calculateSimilarity(product.keywords, query);
        return { ...product, similarity };
      })
      .filter(product => product.similarity >= 0.5) // Higher threshold
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10); // Limit to top 10 results for better relevance

    setSearchResults(results);
    
    // If we have a spelling suggestion and few or no results, also search for the suggestion
    if (suggestion && results.length < 3) {
      const suggestionQuery = suggestion.toLowerCase();
      const suggestionResults = allProducts
        .map(product => {
          const similarity = calculateSimilarity(product.keywords, suggestionQuery);
          return { ...product, similarity };
        })
        .filter(product => product.similarity >= 0.5)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5); // Limit suggestion results
      
      setSuggestionResults(suggestionResults);
    } else {
      setSuggestionResults([]);
    }
  }, [searchQuery, allProducts, productNames]);

  const renderPriceGrid = (product) => (
    <div className="mt-4 space-y-1 text-xs">
      {product.prices.map((p, i) => {
        const key = p.platform.toLowerCase().replace(/\s+/g, "");
        const logo = brandIcons[key];
        return (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {logo ? (
                <img
                  src={logo}
                  alt={p.platform}
                  className="w-[4rem] h-[4rem] object-contain"
                />
              ) : (
                <span className="text-xs text-gray-700">{p.platform}</span>
              )}
            </div>
            <div className="text-right">
              <div className="text-gray-400 line-through text-[11px]">₹{p.oldPrice}</div>
              <div className="font-semibold">₹{p.price}</div>
              <div className="text-[10px] text-gray-500">{p.time}</div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderCard = (product, index) => {
    const cartItem = cartItems.find((item) => item.name === product.name);

    const renderCartControls = () => {
      return cartItem ? (
        <div className="flex items-center gap-2 mt-1">
          <button onClick={() => updateQuantity(product.name, -1)} className="w-8 h-8 border rounded-full text-lg">−</button>
          <span>{cartItem.quantity}</span>
          <button onClick={() => updateQuantity(product.name, 1)} className="w-8 h-8 border rounded-full text-lg text-green-600">+</button>
        </div>
      ) : (
        <button
          onClick={() =>
            addToCart({
              name: product.name,
              image: product.image,
              quantityText: product.quantityText,
              prices: product.prices,
            })
          }
          className="bg-green-500/80 hover:bg-green-500 text-white rounded-full w-8 h-8 mt-2 ml-auto block transition"
        >
          +
        </button>
      );
    };

    return (
      <div key={index} className="bg-white rounded-xl p-3 shadow-sm">
        <img
          src={product.image}
          alt={product.name}
          className="h-20 w-20 object-contain mx-auto mb-2 rounded cursor-pointer"
          onClick={() => navigate(`/product/${product.name}`)}
        />
        <div className="flex items-start justify-between relative">
          <div>
            <h4 className="text-sm font-semibold">
              {product.brand ? `${product.brand} ${product.name}` : product.name}
            </h4>
            <p className="text-xs text-gray-500">{product.quantityText}</p>
          </div>
          <div className="absolute right-[0.05rem] top-[26px]">
            {renderCartControls()}
          </div>
        </div>
        {renderPriceGrid(product)}
      </div>
    );
  };

  const categoryColors = [
    "bg-green-100",
    "bg-yellow-100",
    "bg-pink-100",
    "bg-blue-100",
    "bg-purple-100",
    "bg-lime-100",
    "bg-red-100",
    "bg-indigo-100",
  ];

  const renderCategoryGrid = () => {
    const categories = Object.keys(productsByCategory);
    return (
      <div className="grid grid-cols-2 gap-4">
        {categories.map((category, index) => (
          <div
            key={category}
            className={`rounded-xl px-4 py-6 text-center font-semibold text-sm shadow-sm cursor-pointer ${categoryColors[index % categoryColors.length]}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-[#fbfbfb] min-h-screen pb-24">
      <div className="sticky top-0 bg-[#fbfbfb] z-10 p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-center mb-4">Explore</h2>
        
        <div className="bg-gray-100 rounded-full px-4 py-2 mb-4 flex items-center">
          <span className="text-gray-500 mr-2">🔍</span>
          <input
            type="text"
            placeholder="Search products..."
            className="bg-transparent outline-none w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="text-gray-500"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {isSearching ? (
          <>
            <div className="flex items-center mb-4">
              <h2 className="text-lg font-semibold">
                Search Results
              </h2>
            </div>

            {searchResults.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <p>No results found for "{searchQuery}"</p>
                
                {spellingSuggestion && (
                  <div className="mt-4">
                    <p className="text-sm text-blue-600">
                      Did you mean: 
                      <button 
                        className="ml-1 underline font-medium" 
                        onClick={() => setSearchQuery(spellingSuggestion)}
                      >
                        {spellingSuggestion}
                      </button>?
                    </p>
                    
                    {suggestionResults.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-left text-md font-medium mb-3">Results for "{spellingSuggestion}":</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {suggestionResults.map(renderCard)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {!spellingSuggestion && (
                  <p className="text-sm mt-2">Try using different keywords or browse categories</p>
                )}
              </div>
            ) : (
              <>
                {spellingSuggestion && (
                  <div className="mb-4 text-blue-600 text-sm">
                    Did you mean: 
                    <button 
                      className="ml-1 underline" 
                      onClick={() => setSearchQuery(spellingSuggestion)}
                    >
                      {spellingSuggestion}
                    </button>?
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  {searchResults.map(renderCard)}
                </div>
                
                {spellingSuggestion && suggestionResults.length > 0 && searchResults.length < 3 && (
                  <div className="mt-6">
                    <h3 className="text-md font-medium mb-3">Results for "{spellingSuggestion}":</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {suggestionResults.map(renderCard)}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center mb-4">
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-sm px-2 py-1 rounded-full bg-gray-200 mr-2"
                >
                  ← Back
                </button>
              )}
              <h2 className="text-lg font-semibold">
                {selectedCategory ? selectedCategory : "Explore Categories"}
              </h2>
            </div>

            {loading ? (
              <div className="text-center text-gray-500 mt-16">Loading...</div>
            ) : selectedCategory ? (
              <div className="grid grid-cols-2 gap-4">
                {productsByCategory[selectedCategory].map(renderCard)}
              </div>
            ) : (
              renderCategoryGrid()
            )}
          </>
        )}
      </div>
    </div>
  );
}
