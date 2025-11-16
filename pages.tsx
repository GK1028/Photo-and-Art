import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link, NavLink } from 'react-router-dom';
import { Product, Category, Role, Review } from './types';
import { mockApi, generateDescription } from './services';
import { MOCK_PRODUCTS, PICKUP_LOCATIONS } from './constants';
import { useAppContext } from './App';
import { ProductCard, Spinner, StarRating } from './components';

// --- HomeHeader Component (for HomePage only) ---
const HomeHeader: React.FC = () => {
    const { user, logout } = useAppContext();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navLinkClasses = "px-3 py-2 text-sm font-medium text-white hover:text-gray-300 transition-colors rounded-md";

    return (
        <header>
            {/* 1. Red Top Banner */}
            <div className="bg-brand-red text-white text-center py-3 sm:py-4">
                <h1 className="text-xl sm:text-2xl font-bold">Welcome to Photo & Art Marketplace</h1>
                <p className="text-xs sm:text-sm">Buy & Sell Digital Photos & Art Seamlessly</p>
            </div>

            {/* 2. Hero Image Section with Navigation */}
            <div
                className="h-[65vh] bg-cover bg-center flex items-center justify-center relative"
                style={{ backgroundImage: "url('https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2')" }}
            >
                <div className="absolute inset-0 bg-black/30"></div>
                <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold z-10" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.7)' }}>
                    Explore Stunning Photos & Artworks
                </h2>
                
                {/* 3. Dark Navigation Bar at the bottom */}
                <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-80 backdrop-blur-sm">
                    <nav className="container mx-auto flex justify-center items-center h-14 px-4 overflow-x-auto">
                         <div className="flex items-center space-x-2 sm:space-x-4">
                            <NavLink to="/" className={navLinkClasses}>Home</NavLink>
                            {user ? (
                                <>
                                    {user.role === Role.USER && <Link to="/signup" className={navLinkClasses}>Become a Seller</Link>}
                                    {(user.role === Role.SELLER || user.role === Role.ADMIN) && (
                                        <>
                                            <NavLink to="/upload" className={navLinkClasses}>Upload</NavLink>
                                            <NavLink to="/dashboard" className={navLinkClasses}>Owner Panel</NavLink>
                                        </>
                                    )}
                                    <button onClick={handleLogout} className={navLinkClasses}>Logout</button>
                                </>
                            ) : (
                                <>
                                    <Link to="/signup" className={navLinkClasses}>Become a Seller</Link>
                                    <NavLink to="/signup" className={navLinkClasses}>Signup</NavLink>
                                    <NavLink to="/login" className={navLinkClasses}>Login</NavLink>
                                </>
                            )}
                            <NavLink to="/cart" className={navLinkClasses}>Cart</NavLink>
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
};


// --- HomePage Component ---
export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const data = await mockApi.getProducts();
      setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const featuredProducts = products.slice(0, 12);

  return (
    <div>
      <HomeHeader />
      
      <div className="bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">Featured Products</h2>
            {loading ? (
                <div className="h-64"><Spinner /></div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

// --- ProductDetailsPage Component ---
export const ProductDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user, addToCart } = useAppContext();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [aiDescription, setAiDescription] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(true);
    
    // Review form state
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewHoverRating, setReviewHoverRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewSubmitted, setReviewSubmitted] = useState(false);

  
    useEffect(() => {
      const fetchProductAndReviews = async () => {
        if (id) {
          const productId = parseInt(id, 10);
          setLoading(true);
          setLoadingReviews(true);

          const productData = await mockApi.getProductById(productId);
          setProduct(productData || null);
          
          const reviewData = await mockApi.getReviewsByProductId(productId);
          setReviews(reviewData);

          setLoading(false);
          setLoadingReviews(false);
        }
      };
      fetchProductAndReviews();
    }, [id]);
  
    const handleGenerateDescription = async () => {
      if (product) {
        setIsGenerating(true);
        const desc = await generateDescription(product.name, product.category);
        setAiDescription(desc);
        setIsGenerating(false);
      }
    };

    const handleBuyNow = () => {
      if (product) {
        addToCart(product);
        navigate('/cart');
      }
    };

    const handleDownload = (url: string, format: string) => {
        if (!product) return;

        const fileExtensionMap: { [key: string]: string } = {
            'PNG': 'png',
            'JPG': 'jpg',
            'HD': 'jpg',
            'Original': 'jpg' 
        };
        const fileExtension = fileExtensionMap[format] || 'jpg';
        const fileName = `${product.name.replace(/\s+/g, '_')}_${format}.${fileExtension}`;
    
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.download = fileName; 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();
        if(reviewRating === 0 || !reviewComment) {
            alert("Please provide a rating and a comment.");
            return;
        }
        console.log("Submitting review:", { rating: reviewRating, comment: reviewComment });
        setReviewSubmitted(true);
        // Here you would typically send the review to a server
    }
  
    if (loading) return <div className="h-screen flex items-center justify-center"><Spinner /></div>;
    if (!product) return <div className="text-center py-20 text-xl">Product not found.</div>;
  
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 animate-fade-in-up">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-sm font-semibold text-primary dark:text-secondary uppercase tracking-wider">{product.category}</span>
            <h1 className="text-4xl font-bold mt-2 text-gray-900 dark:text-white">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
                <StarRating rating={product.rating} size="lg" />
                <span className="text-gray-600 dark:text-gray-400">
                    {product.rating.toFixed(1)} stars ({product.reviewCount} reviews)
                </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">by {product.seller}</p>
            
            {product.category === Category.PHOTO ? (
                <>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed my-6">{product.description}</p>
                    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-secondary/50">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 text-center">Download Options</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {['PNG', 'JPG', 'HD', 'Original'].map(format => (
                                <button 
                                    key={format}
                                    onClick={() => handleDownload(product.imageUrl, format)} 
                                    className="w-full px-4 py-3 bg-secondary text-gray-900 font-bold rounded-md hover:bg-opacity-80 transition-colors text-sm flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    Download {format}
                                </button>
                            ))}
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">All photos are free to download for personal and commercial use.</p>
                </>
            ) : (
                <>
                    <p className="text-4xl font-display text-gray-800 dark:text-gray-100 my-6">${product.price.toFixed(2)}</p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{product.description}</p>
                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                        <button onClick={() => addToCart(product)} className="flex-1 px-8 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/80 transition-colors">Add to Cart</button>
                        <button onClick={handleBuyNow} className="flex-1 px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Buy Now</button>
                    </div>
                    {(product.category === Category.ART || product.category === Category.FRAME) && <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Note: This is a physical item that will be shipped to your address.</p>}
                </>
            )}
            
            <div className="mt-6 p-4 bg-gray-100/50 dark:bg-gray-800/50 border border-primary/20 dark:border-secondary/20 rounded-lg">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-primary dark:text-secondary">AI Generated Description</h3>
                    <button onClick={handleGenerateDescription} disabled={isGenerating} className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/80 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">
                        {isGenerating ? 'Generating...' : 'Generate'}
                    </button>
                </div>
                {isGenerating && <div className="text-center p-4"><Spinner/></div>}
                {aiDescription && !isGenerating && <p className="mt-2 text-gray-700 dark:text-gray-300 italic">"{aiDescription}"</p>}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 border-t dark:border-gray-700 pt-10">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Customer Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Existing Reviews */}
                <div className="space-y-6">
                    {loadingReviews ? <Spinner /> : reviews.length > 0 ? reviews.map(review => (
                        <div key={review.id} className="border-b dark:border-gray-700 pb-4">
                            <div className="flex items-center mb-1">
                                <StarRating rating={review.rating} />
                                <p className="ml-3 font-bold text-gray-800 dark:text-gray-200">{review.author}</p>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{review.date}</p>
                            <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                        </div>
                    )) : <p className="text-gray-500 dark:text-gray-400">No reviews yet. Be the first to leave one!</p>}
                </div>
                {/* Review Form */}
                <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {user ? (
                        reviewSubmitted ? (
                            <div className="text-center p-8 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-lg">
                                <h3 className="text-xl font-bold">Thank you for your review!</h3>
                                <p>Your feedback helps other customers.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmitReview}>
                                <h3 className="text-xl font-bold mb-4 dark:text-white">Leave a Review</h3>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Rating</label>
                                    <div className="flex items-center">
                                        {[1,2,3,4,5].map(star => (
                                            <button 
                                                type="button" 
                                                key={star} 
                                                onClick={() => setReviewRating(star)} 
                                                onMouseEnter={() => setReviewHoverRating(star)}
                                                onMouseLeave={() => setReviewHoverRating(0)}
                                                className="text-3xl"
                                            >
                                                <span className={`${(reviewHoverRating || reviewRating) >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'} transition-colors`}>★</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Review</label>
                                    <textarea id="comment" rows={4} value={reviewComment} onChange={e => setReviewComment(e.target.value)} required className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary"></textarea>
                                </div>
                                <button type="submit" className="w-full bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary/80 transition-colors">Submit Review</button>
                            </form>
                        )
                    ) : (
                        <div className="text-center p-8 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <p className="font-semibold dark:text-white">Want to leave a review?</p>
                            <Link to="/login" className="text-primary dark:text-secondary hover:underline">Log in</Link> to share your thoughts.
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    );
};

// --- CategoryPage Component ---
export const CategoryPage: React.FC = () => {
    const { categoryName } = useParams<{ categoryName: string }>();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const filteredProducts = useMemo(() => {
        return products.filter(p => p.category.toLowerCase() === categoryName?.toLowerCase());
    }, [products, categoryName]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            const data = await mockApi.getProducts();
            setProducts(data);
            setLoading(false);
        };
        fetchProducts();
    }, []);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-bold text-center mb-8 dark:text-white">{categoryName}</h1>
            {loading ? (
                <div className="h-64"><Spinner /></div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
            { !loading && filteredProducts.length === 0 && (
                <p className="text-center text-gray-400">No products found in this category.</p>
            )}
        </div>
    );
};


// --- AuthPage Component ---
export const AuthPage: React.FC<{ isLogin: boolean }> = ({ isLogin }) => {
    const { login } = useAppContext();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<Role>(Role.USER);
    const [address, setAddress] = useState('');
    const [country, setCountry] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock authentication
        const signupData: any = { email, password, role };
        if (!isLogin && role === Role.SELLER) {
            signupData.address = address;
            signupData.country = country;
            signupData.mobileNumber = mobileNumber;
            signupData.agreedToTerms = agreedToTerms;
        }
        console.log(`Attempting to ${isLogin ? 'login' : 'signup'} as`, signupData);
        login(email, role);
        navigate('/dashboard');
    };

    const isSellerSignup = !isLogin && role === Role.SELLER;

    return (
        <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 dark:bg-transparent p-4">
            <div className="max-w-md w-full mx-auto p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl animate-fade-in-up">
                <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">{isLogin ? 'Login' : 'Sign Up'}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary" />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary" />
                    </div>
                    {!isLogin && (
                        <>
                            <div>
                                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sign up as</label>
                                <select id="role" value={role} onChange={e => setRole(e.target.value as Role)} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary">
                                    <option value={Role.USER}>User</option>
                                    <option value={Role.SELLER}>Seller</option>
                                </select>
                            </div>
                            {isSellerSignup && (
                                <div className="space-y-4 animate-fade-in-up">
                                    <div>
                                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                                        <input type="text" id="address" value={address} onChange={e => setAddress(e.target.value)} required className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary" />
                                    </div>
                                    <div>
                                        <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
                                        <input type="text" id="country" value={country} onChange={e => setCountry(e.target.value)} required className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary" />
                                    </div>
                                    <div>
                                        <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Number</label>
                                        <input type="tel" id="mobile" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} required className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary" />
                                    </div>
                                    <div className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="terms"
                                                name="terms"
                                                type="checkbox"
                                                checked={agreedToTerms}
                                                onChange={e => setAgreedToTerms(e.target.checked)}
                                                className="focus:ring-primary h-4 w-4 text-primary border-gray-300 dark:border-gray-600 rounded"
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="terms" className="font-medium text-gray-700 dark:text-gray-300">
                                                I agree to the <a href="#" className="text-primary dark:text-secondary hover:underline">Terms and Conditions</a>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                     <div>
                        <button type="submit" disabled={isSellerSignup && !agreedToTerms} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed">
                            {isLogin ? 'Log In' : 'Create Account'}
                        </button>
                    </div>
                </form>
                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <Link to={isLogin ? '/signup' : '/login'} className="font-medium text-primary dark:text-secondary hover:text-primary/80 dark:hover:text-secondary/80">
                        {isLogin ? 'Sign up' : 'Log in'}
                    </Link>
                </p>
            </div>
        </div>
    );
};

// --- CartPage Component ---
export const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateQuantity } = useAppContext();
  const navigate = useNavigate();

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0), [cart]);
  const shipping = 5.00;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="text-center py-20 container mx-auto">
        <h1 className="text-3xl font-bold dark:text-white">Your Cart is Empty</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/" className="mt-6 inline-block bg-primary text-white font-bold py-3 px-8 rounded-md hover:bg-primary/80 transition-colors">
            Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Your Shopping Cart</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {cart.map(item => (
                        <div key={item.product.id} className="flex items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md animate-fade-in-up">
                            <img src={item.product.imageUrl} alt={item.product.name} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md" />
                            <div className="flex-grow ml-4">
                                <h2 className="font-bold text-lg text-gray-900 dark:text-white">{item.product.name}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{item.product.category}</p>
                                <p className="text-md font-display text-green-600 dark:text-green-400 mt-1">${item.product.price.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center space-x-2 sm:space-x-3">
                                <input 
                                    type="number" 
                                    value={item.quantity} 
                                    onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value))}
                                    className="w-16 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-center rounded-md border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-primary dark:focus:ring-secondary"
                                    min="1"
                                    aria-label={`Quantity for ${item.product.name}`}
                                />
                                <button onClick={() => removeFromCart(item.product.id)} className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-500 p-1 rounded-full transition-colors" aria-label={`Remove ${item.product.name} from cart`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Order Summary */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-fit lg:sticky lg:top-24">
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Order Summary</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between text-gray-600 dark:text-gray-300">
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 dark:text-gray-300">
                            <span>Shipping</span>
                            <span>${shipping.toFixed(2)}</span>
                        </div>
                    </div>
                    <hr className="border-gray-200 dark:border-gray-700 my-4" />
                    <div className="flex justify-between font-bold text-xl mb-6 text-gray-900 dark:text-white">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <button onClick={() => navigate('/checkout')} className="w-full bg-brand-purple text-white font-bold py-3 rounded-md hover:bg-opacity-90 transition-colors shadow-lg hover:shadow-brand-purple/40">
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

// --- CheckoutPage Component ---
const mobileBankingOptions = [
    { id: 'bkash', name: 'bKash', logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48cGF0aCBmaWxsPSIjZDIxZjU3IiBkPSJNMjQxLjIgMTEyLjFsLTk2LjQtOTguMWMtMy4xLTMuMi04LjItMy4yLTExLjQgMGwtOTYuMyA5OC4xYy0xLjYgMS42LTIuNCAzLjctMi40IDUuOUMzNC43IDEyMy45IDQwLjcgMTMwIDQ3IDEzMGgxNTguOWM2LjQgMCAxMi4zLTYuMSA5LjYtMTIuMXoiLz48cGF0aCBmaWxsPSIjZTMyNzZlIiBkPSJtMjA2LjEgMTM0LjRIMzguN2MtOS44IDAtMTIuNyA3LjctNS45IDEzLjdsODIuMSA4My4zYzMuMSAzLjIgOC4yIDMuMiAxMS40IDBsODIuMS04My4zYzYuOC02IDQtMTMuNy01LjgtMTMuN3oiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJtMTM2LjYgMTU4LjEtMTcuMS0yMC4zYy0xLjUtMS44LTMuOS0yLjItNS43LS44bC0yMy40IDE5Yy0zLjEgMi41LTEuNiA3LjUgMi4yIDguNWwxMy44IDRjMS42LjUgMy4zLjQgNC44LS4zbDIwLjItOWMyLjUtMS4xIDMuNi00LjIgMS4yLTYuMXptLTM5LjIgMzcuNmMtMy41IDAtNi40IDIuOS02LjQgNi40djExLjRjMCAzLjUgMi45IDYuNCA2LjQgNi40aDkuOWMzLjUgMCA2LjQtMi45IDYuNC02LjR2LTExLjRjMC0zLjUtMi45LTYuNC02LjQtNi40aC05Ljl6bS0xMy41LTEzLjRjLTEuNy0xLjQtMy45LTEuOC01LjgtMS4ybC0yMS40IDcuNmMtMy4zIDEuMi0zLjggNS40LS44IDcuOGwyMS4xIDIwLjVjMS40IDEuNCAzLjUgMiA1LjUgMS40bDcuOS0yLjNjMi43LS44IDQuMi0zLjYgMy4xLTYuM2wtOC42LTI3LjV6bTc5LjEtMjEuNGMtMy4xLS42LTYuMiAxLjMtNy40IDQuM2wtMjkgNzFjLTEuMiAyLjkgMCA2LjIgMi44IDcuNWw3LjYgMy42YzIuOCAxLjMgNS45IDAgNy4yLTIuN2wyOC45LTcwLjdjMS4yLTIuOS0uMS02LjItMi45LTcuNmwtNy4yLTMuNXptLTQ5LjkgMTQuOWwxOS4xIDE5LjRjMi41IDIuNiA2LjYgMySA5LjYgMS4xbDIyLjItMTQuM2MyLjktMS45IDMuNC01LjYgMS4xLTguNmwtMTkuMS0zM2MtMi4zLTMtNi40LTMuOC05LjktMS44bC0yMyAzMC43Yy0yIDItMi4zIDUuMy0uMSA2LjV6Ii8+PC9zdmc+' },
    { id: 'nagad', name: 'Nagad', logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyOCIgZmlsbD0iI2VkMWMyNCIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Im0xODkuMyA3OS4xLTEyLjgtOS4xYy0zLjgtMi43LTkuMS0xLjItMTEuMyAyLjhsLTQxLjYgNzIuOWMtMS4zIDIuMy0xLjEgNC45LjYgNi45bDIzLjMgMzQuNGMyLjEgMy4xIDYuMSA0LjIgOS40IDIuN2wxNy41LTguMWMzLjQtMS41IDUuMS01LjQgMy45LTguOWwtMTcgLTYwYy0xLjYtNS41IDEuMS0xMS4zIDYuNC0xMy40bDExLjktNC4yYzUuMy0xLjkgNy41LTcuOCAzLjYtMTIuNXptLTg4LjggNDMuNWMwIDEzLjMgMTAuNyAyNCAyMy45IDI0czIzLjktMTAuNyAyMy45LTI0YzAtMTMuMy0xMC43LTI0LTIzLjktMjRzLTIzLjkgMTAuNy0yMy45IDI0em0tNTUtMTMuMWMtLjktNS41IDItMTAuOSA2LjktMTIuNWwxNy43LTYuMWM0LjgtMS43IDEwIDEuMyAxMS4yIDYuNWwyMy4xIDk4LjVjMS4zIDUuNS0xLjggMTEtNi44IDEyLjZsLTE3LjYgNS45Yy01IDEuNy0xMC4yLTEuNC0xMS40LTYuNkwzNS41IDEwOS41eiIvPjwvc3ZnPg==' },
    { id: 'rocket', name: 'Rocket', logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAACqElEQVR4nO2Yv2sUQRTHPzO7i7iAgpXiA0YxWFkrtDGwFrQRsbGwECxtBC2MhYVYBYsYooVgYyGIFOwmYGFjY+GDBA/FIpBhhBCJIIIsiSPXurvZzW62t7Oz2xnP+2azt7Pzfd7MvHnzvoC/8M+q4bEATgCPAXp6+s1+flMAz8An8B5YBHwA/gIXQBk4A+S/gCagA8gBTwMP4d00C3wEuluP7gCtQBusAR4D3wENYCnwG7gs5W8A1wN3gTfAM+A5cBSY7XYA3d/bYg14BjwHbgLv4b00C7QCzwGbgTVgHjADnJVyFvgObARuA3+BO8B5bRegh7gfOAXsBOYDZf05zgFngEvANeACsBe4CbwHvgKztS8A5sB9wGhgEfjv20S6tkDeBWwHpgPLUs4C7wDfgVfACWAP8A14DVwGthPlPNDbYg3YAewA7kp5XQY0Ab4ClwA7/gJ+AQ+BC8Bv4CgwXPKXgNfAq8BG4CYwBfwGvopZBmYDW4AFwE/gKDADnJf27QF7gM7AvqAY6NqPbsG+oAC4DVwE3gM3gb3AYQDXgR7gOrAddw8U6t+eA7YE+FUsY0Czv7cVbAAWA+eUnP+qgTvgMbAM+AncBda2LQDXgXPAXuAmcBNYBHwB/opZBgaAO4HVwEbgM/BZyjuAtcBdYBOwB7gfWAS+7fcAnf9bW81fA9z7998B3f5bO8/P2grcBda2LQBucB/QAJwA5gM7/tva/jZfA3b9t7b/bFPAfWAVsBSYDXyQcgewHngLvAFuAveAVcAx/3bA6L7tcwN4rP333wH81eI+oGngHvAouA2cBSaB18B5SRcgV0wAnwGjwBbgLnAaeAw8V3bAKWAqcDHYDDyR/J8vjhrTTIZzfwAAAABJRU5ErkJggg==' },
    { id: 'upay', name: 'Upay', logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAADOUlEQVR4nO2YvWsUQRTHPzODuAgWgpXiA8SksLGyVmhjYAtpI2JjYaEEbQQtjIWFWAkWMSGFCsHGQkSCdhMwMbGxcMEHEg8pFIpBhhBCJIIIsiSPXurvZzW62t7Oz2xnP+2azt7Pzfd7MvHnzvoC/4Z9Vw1MAy8AfYG9vr/dbXwvAB+AR8B5YBHwC/gIXQBk4A+S/gCagA8gBTwMP4d00C3wEuluP7gCtQBusAR4D3wENYCnwG7gs5W8A1wN3gTfAM+A5cBSY7XYA3d/bYg14BjwHbgLv4b00C7QCzwGbgTVgHjADnJVyFvgObARuA3+BO8B5bRegh7gfOAXsBOYDZf05zgFngEvANeACsBe4CbwHvgKztS8A5sB9wGhgEfjv20S6tkDeBWwHpgPLUs4C7wDfgVfACWAP8A14DVwGthPlPNDbYg3YAewA7kp5XQY0Ab4ClwA7/gJ+AQ+BC8Bv4CgwXPKXgNfAq8BG4CYwBfwGvopZBmYDW4AFwE/gKDADnJf27QF7gM7AvqAY6NqPbsG+oAC4DVwE3gM3gb3AYQDXgR7gOrAddw8U6t+eA7YE+FUsY0Czv7cVbAAWA+eUnP+qgTvgMbAM+AncBda2LQDXgXPAXuAmcBNYBHwB/opZBgaAO4HVwEbgM/BZyjuAtcBdYBOwB7gfWAS+7fcAnf9bW81fA9z7998B3f5bO8/P2grcBda2LQBucB/QAJwA5gM7/tva/jZfA3b9t7b/bFPAfWAVsBSYDXyQcgewHngLvAFuAveAVcAx/3bA6L7tcwN4rP333wH81eI+oGngHvAouA2cBSaB18B5SRcgV0wAnwGjwBbgLnAaeAw8V3bAKWAqcDHYDDyR/J8vjhrTTIZzfwAAAABJRU5ErkJggg==' }
];

export const CheckoutPage: React.FC = () => {
    const { clearCart } = useAppContext();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentTab, setPaymentTab] = useState<'mobile' | 'card'>('mobile');
    const [selectedMobileMethod, setSelectedMobileMethod] = useState<string>('bkash');
    
    // New states for delivery
    const [deliveryMethod, setDeliveryMethod] = useState<'home' | 'pickup'>('home');
    const [homeAddress, setHomeAddress] = useState({ street: '', city: '', zip: '' });
    const [selectedPickup, setSelectedPickup] = useState(PICKUP_LOCATIONS[0]);
  
    const handlePayment = (e: React.FormEvent) => {
      e.preventDefault();

      if (deliveryMethod === 'home' && (!homeAddress.street || !homeAddress.city || !homeAddress.zip)) {
        alert('Please fill in your complete home address to proceed.');
        return;
      }

      console.log('Processing payment with delivery details:', {
        deliveryMethod,
        ...(deliveryMethod === 'home' && { address: homeAddress }),
        ...(deliveryMethod === 'pickup' && { pickupLocation: selectedPickup }),
        paymentTab,
        ...(paymentTab === 'mobile' && { mobileMethod: selectedMobileMethod }),
      });

      setIsProcessing(true);
      setTimeout(() => {
        clearCart();
        alert('Payment successful! Your order has been placed.');
        navigate('/');
      }, 2000);
    };

    const CheckmarkIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    )
  
    return (
        <div className="bg-gray-50 dark:bg-transparent flex items-center justify-center min-h-[70vh] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full mx-auto p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
                
                {/* 1. Delivery Information Section */}
                <div className="mb-8 animate-fade-in-up">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Delivery Information</h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setDeliveryMethod('home')} className={`p-4 rounded-lg border-2 text-left transition-colors ${deliveryMethod === 'home' ? 'border-primary dark:border-secondary bg-primary/10 dark:bg-secondary/10' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}>
                                <h3 className="font-bold">Home Delivery</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Get your order delivered to your door.</p>
                            </button>
                             <button onClick={() => setDeliveryMethod('pickup')} className={`p-4 rounded-lg border-2 text-left transition-colors ${deliveryMethod === 'pickup' ? 'border-primary dark:border-secondary bg-primary/10 dark:bg-secondary/10' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}>
                                <h3 className="font-bold">Store Pickup</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Collect from one of our locations.</p>
                            </button>
                        </div>
                        
                        <div className="pt-4">
                            {deliveryMethod === 'home' && (
                                <div className="space-y-4 animate-fade-in-up">
                                     <div>
                                        <label htmlFor="street" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Street Address</label>
                                        <input type="text" id="street" value={homeAddress.street} onChange={e => setHomeAddress(prev => ({...prev, street: e.target.value}))} required placeholder="123 Creative Lane" className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                         <div>
                                            <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                                            <input type="text" id="city" value={homeAddress.city} onChange={e => setHomeAddress(prev => ({...prev, city: e.target.value}))} required placeholder="Dhaka" className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary" />
                                        </div>
                                         <div>
                                            <label htmlFor="zip" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Zip Code</label>
                                            <input type="text" id="zip" value={homeAddress.zip} onChange={e => setHomeAddress(prev => ({...prev, zip: e.target.value}))} required placeholder="1205" className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary" />
                                        </div>
                                    </div>
                                </div>
                            )}
                             {deliveryMethod === 'pickup' && (
                                <div className="animate-fade-in-up">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select a Pickup Location</label>
                                    <div className="space-y-2">
                                        {PICKUP_LOCATIONS.map(location => (
                                            <label key={location} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${selectedPickup === location ? 'border-primary dark:border-secondary bg-primary/10 dark:bg-secondary/10' : 'border-gray-300 dark:border-gray-600'}`}>
                                                <input type="radio" name="pickupLocation" value={location} checked={selectedPickup === location} onChange={() => setSelectedPickup(location)} className="h-4 w-4 text-primary focus:ring-primary dark:text-secondary dark:focus:ring-secondary" />
                                                <span className="ml-3 text-sm font-medium text-gray-800 dark:text-gray-200">{location}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Payment Method Section */}
                <div>
                    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Payment Method</h2>
                    <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                        <nav className="-mb-px flex space-x-6">
                            <button
                                onClick={() => setPaymentTab('mobile')}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                    paymentTab === 'mobile'
                                    ? 'border-gray-800 dark:border-gray-200 text-gray-800 dark:text-gray-200'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                                }`}
                            >
                                Mobile Banking
                            </button>
                            <button
                                onClick={() => setPaymentTab('card')}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                    paymentTab === 'card'
                                    ? 'border-gray-800 dark:border-gray-200 text-gray-800 dark:text-gray-200'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                                }`}
                            >
                                Credit or Debit Card
                            </button>
                        </nav>
                    </div>

                    {paymentTab === 'mobile' && (
                        <div className="animate-fade-in-up">
                            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Please select your mode of Payment Method</p>
                            <div className="space-y-4">
                                {mobileBankingOptions.map(option => (
                                    <button
                                        key={option.id}
                                        onClick={() => setSelectedMobileMethod(option.id)}
                                        className={`w-full p-4 border rounded-lg flex items-center justify-between transition-all duration-200 bg-white dark:bg-gray-700 ${
                                            selectedMobileMethod === option.id
                                            ? 'border-brand-pink ring-1 ring-brand-pink shadow-md'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                        }`}
                                    >
                                        <img src={option.logo} alt={option.name} className="h-8 object-contain" />
                                        {selectedMobileMethod === option.id && <CheckmarkIcon />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {paymentTab === 'card' && (
                        <div className="animate-fade-in-up">
                            <form className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Card Number</label>
                                    <input type="text" placeholder="**** **** **** ****" required className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expiry Date</label>
                                        <input type="text" placeholder="MM/YY" required className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">CVC</label>
                                        <input type="text" placeholder="***" required className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary" />
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}
                    
                    <div className="mt-8">
                        <button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className="w-full max-w-xs mx-auto flex items-center justify-center py-3 px-4 bg-brand-green text-white font-bold rounded-full hover:bg-green-800 disabled:bg-gray-500 transition-colors shadow-lg"
                        >
                            {isProcessing ? 'Processing...' : 'PROCEED TO PAYMENT'}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- UploadPage Component ---
export const UploadPage: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useAppContext();

    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState<Category>(Category.PHOTO);
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        console.log("Uploading item:", {
            title,
            price,
            category,
            description,
            imageFileName: imageFile?.name
        });
        // Mock upload process
        setTimeout(() => {
            setIsUploading(false);
            alert(`Item "${title}" has been uploaded successfully!`);
            navigate('/');
        }, 1500);
    };

    // Mocking items by a specific seller for display
    const myItems = useMemo(() => MOCK_PRODUCTS.filter(p => p.seller === 'Galaxy Snaps' || p.seller === 'Artistic Visions'), []); 

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
            {/* Custom Header for Upload Page */}
            <header className="bg-gray-900 text-white shadow-md">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-2 hover:text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            <span>Home</span>
                        </Link>
                        <div className="flex items-center space-x-6 text-sm font-medium">
                            <Link to="#" className="hover:text-gray-300">My Orders</Link>
                            <Link to="#" className="hover:text-gray-300">Downloads</Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Left Panel: Upload Form */}
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Upload new item</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                                    <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Sunset Glow" className="mt-1 block w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-brand-blue focus:border-brand-blue" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price (USD)</label>
                                        <input type="number" id="price" value={price} onChange={e => setPrice(e.target.value)} required placeholder="25.00" step="0.01" className="mt-1 block w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-brand-blue focus:border-brand-blue" />
                                    </div>
                                    <div>
                                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category (optional)</label>
                                        <select id="category" value={category} onChange={e => setCategory(e.target.value as Category)} className="mt-1 block w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-brand-blue focus:border-brand-blue">
                                            <option value={Category.PHOTO}>Photo</option>
                                            <option value={Category.FRAME}>Frame</option>
                                            <option value={Category.ART}>Art</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description (optional)</label>
                                    <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Short description..." className="mt-1 block w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-brand-blue focus:border-brand-blue"></textarea>
                                </div>
                                <div>
                                    <label htmlFor="image-file" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image file</label>
                                    <div className="mt-1 flex items-center">
                                        <label htmlFor="file-upload" className="cursor-pointer bg-white dark:bg-gray-700 dark:hover:bg-gray-600 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue">
                                            Choose File
                                        </label>
                                        <input id="file-upload" name="file-upload" type="file" onChange={handleFileChange} required className="sr-only" />
                                        <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">{imageFile ? imageFile.name : 'No file chosen'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <button type="submit" disabled={isUploading} className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
                                        {isUploading ? 'Uploading...' : 'Upload'}
                                    </button>
                                    <button type="button" onClick={handleLogout} className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">
                                        Sign out
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Panel: My Items */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">My items</h2>
                            {myItems.length > 0 ? (
                                <ul className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                                    {myItems.map(item => (
                                        <li key={item.id} className="flex items-center gap-4 p-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                                            <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                                            <div className="flex-grow">
                                                <p className="font-semibold text-gray-800 dark:text-gray-200">{item.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">${item.price.toFixed(2)}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400">You haven't uploaded any items yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};


// --- DashboardPage Component ---
export const DashboardPage: React.FC = () => {
    const { user } = useAppContext();
  
    if (!user) return null; // Should be handled by ProtectedRoute
  
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-2 dark:text-white">Dashboard</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">Welcome back, {user.email}</p>
        
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            {user.role === Role.ADMIN && (
                <div>
                    <h2 className="text-2xl font-semibold text-primary dark:text-secondary mb-4">Admin Panel</h2>
                    <p>Manage users, sellers, and view site-wide analytics.</p>
                </div>
            )}
            {user.role === Role.SELLER && (
                <div>
                    <h2 className="text-2xl font-semibold text-primary dark:text-secondary mb-4">Seller Dashboard</h2>
                    <p>View your sales, manage your products, and see your earnings.</p>
                </div>
            )}
             {/* Add mock data tables or charts here for a more complete look */}
             <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-xl font-semibold mb-4">Quick Stats (Mock)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                        <p className="text-3xl font-bold text-primary dark:text-secondary">1,204</p>
                        <p className="text-gray-600 dark:text-gray-300">Total Sales</p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">$45,821</p>
                        <p className="text-gray-600 dark:text-gray-300">Total Revenue</p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                        <p className="text-3xl font-bold text-accent">312</p>
                        <p className="text-gray-600 dark:text-gray-300">New Customers</p>
                    </div>
                </div>
             </div>
        </div>
      </div>
    );
};

// --- SearchPage Component ---
export const SearchPage: React.FC = () => {
    const { searchTerm } = useAppContext();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            const data = await mockApi.getProducts();
            setProducts(data);
            setLoading(false);
        };
        fetchProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return [];
        const lowercasedTerm = searchTerm.toLowerCase();
        return products.filter(p => 
            p.name.toLowerCase().includes(lowercasedTerm) ||
            p.description.toLowerCase().includes(lowercasedTerm) ||
            p.category.toLowerCase().includes(lowercasedTerm) ||
            p.seller.toLowerCase().includes(lowercasedTerm)
        );
    }, [products, searchTerm]);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold mb-2 dark:text-white">Search Results</h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">
                {loading ? 'Searching...' : `${filteredProducts.length} results for `}
                {!loading && <span className="font-semibold text-primary dark:text-secondary">"{searchTerm}"</span>}
            </p>
            {loading ? (
                <div className="h-64"><Spinner /></div>
            ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-16">
                    <h2 className="text-2xl font-semibold">No products found</h2>
                    <p className="mt-2">Try adjusting your search terms.</p>
                </div>
            )}
        </div>
    );
};