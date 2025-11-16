import React, { useState, useContext, createContext, useCallback, useMemo, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { User, Role, Product, CartItem } from './types';
import { Header, Footer, ProtectedRoute } from './components';
import { HomePage, ProductDetailsPage, CategoryPage, AuthPage, CartPage, CheckoutPage, DashboardPage, UploadPage, SearchPage } from './pages';

// --- App Context ---
interface AppContextType {
  user: User | null;
  cart: CartItem[];
  theme: 'light' | 'dark';
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  toggleTheme: () => void;
  login: (email: string, role: Role) => void;
  logout: () => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// --- App Provider ---
const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');


  // Theme State & Logic
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      return storedTheme as 'light' | 'dark';
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);


  const login = useCallback((email: string, role: Role) => {
    // Mock login
    setUser({ id: `user_${Date.now()}`, email, role });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const addToCart = useCallback((product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const contextValue = useMemo(() => ({
    user,
    cart,
    theme,
    searchTerm,
    setSearchTerm,
    toggleTheme,
    login,
    logout,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  }), [user, cart, theme, searchTerm, toggleTheme, login, logout, addToCart, removeFromCart, updateQuantity, clearCart]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};


// --- Page Layout Component ---
const PageLayout = () => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';
    const isUploadPage = location.pathname === '/upload';


    return (
        <div className="flex flex-col min-h-screen">
          {!isHomePage && !isUploadPage && <Header />}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products/:id" element={<ProductDetailsPage />} />
              <Route path="/category/:categoryName" element={<CategoryPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/login" element={<AuthPage isLogin={true} />} />
              <Route path="/signup" element={<AuthPage isLogin={false} />} />
              <Route path="/cart" element={<CartPage />} />
              
              <Route path="/checkout" element={
                <ProtectedRoute allowedRoles={[Role.USER, Role.SELLER, Role.ADMIN]}>
                  <CheckoutPage />
                </ProtectedRoute>
              } />
               <Route path="/upload" element={
                <ProtectedRoute allowedRoles={[Role.SELLER, Role.ADMIN]}>
                  <UploadPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={[Role.SELLER, Role.ADMIN]}>
                  <DashboardPage />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          {!isUploadPage && <Footer />}
        </div>
    )
}

// --- Main App Component ---
function App() {
  return (
    <AppProvider>
      <HashRouter>
          <PageLayout />
      </HashRouter>
    </AppProvider>
  );
}

export default App;