import React, { useState } from 'react';
import { NavLink, Link, useNavigate, Navigate } from 'react-router-dom';
import { Product, Role, Category } from './types';
import { useAppContext } from './App';

// FIX: Defined the missing LOGO_BASE64 constant with a placeholder SVG logo.
const LOGO_BASE64 = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcng9IjIwIiBmaWxsPSIjRjlBMDI1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaGyPSJtaWRkbGUiIGZvbnQtc2l6ZT0iNTAiIGZpbGw9IiNmZmYiIGZvbnQtZmFtaWx5PSJBcmlhbCI+UEE8L3RleHQ+PC9zdmc+';

// --- Icons ---
const ShoppingCartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);
const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
    </svg>
);

// --- ThemeToggle Component ---
const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useAppContext();

    const SunIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 5a7 7 0 100 14 7 7 0 000-14z" /></svg>);
    const MoonIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>);

    return (
        <button
            onClick={toggleTheme}
            className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-secondary transition-colors focus:outline-none"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
    );
};

// --- SearchBar Component ---
export const SearchBar: React.FC = () => {
    const [localTerm, setLocalTerm] = useState('');
    const { setSearchTerm } = useAppContext();
    const navigate = useNavigate();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const term = localTerm.trim();
        if (term) {
            setSearchTerm(term);
            navigate('/search');
            setLocalTerm(''); // Clear input after search
        }
    };
    
    return (
        <form onSubmit={handleSearch} className="hidden md:block relative">
             <input 
                type="text" 
                value={localTerm}
                onChange={(e) => setLocalTerm(e.target.value)}
                placeholder="Search..."
                className="w-40 lg:w-56 pl-4 pr-10 py-2 text-sm rounded-full border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-secondary/50 transition-all"
            />
             <button type="submit" className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-secondary" aria-label="Search">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
             </button>
        </form>
    );
};


// --- StarRating Component ---
interface StarRatingProps {
    rating: number;
    size?: 'sm' | 'md' | 'lg';
}
export const StarRating: React.FC<StarRatingProps> = ({ rating, size = 'md' }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    const starSizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    // FIX: Explicitly typed StarIcon as a React.FC to allow it to receive the `key` prop without TypeScript errors.
    const StarIcon: React.FC<{ fill: 'full' | 'half' | 'none' }> = ({ fill }) => (
        <svg className={`${starSizeClasses[size]} text-yellow-400`} viewBox="0 0 20 20" fill="currentColor">
            {fill === 'full' && <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />}
            {fill === 'half' && <>
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                <path d="M10 15.27L16.18 19l-1.64-7.03L22 7.24l-7.19-.61L12 0 9.19 6.63 2 7.24l5.46 4.73L5.82 19z" fill="lightgray" opacity="0.5"/>
            </>}
            {fill === 'none' && <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" fill="lightgray" />}
        </svg>
    );

    return (
        <div className="flex items-center">
            {Array.from({ length: fullStars }).map((_, i) => <StarIcon key={`full-${i}`} fill="full" />)}
            {halfStar && <StarIcon key="half" fill="half" />}
            {Array.from({ length: emptyStars }).map((_, i) => <StarIcon key={`empty-${i}`} fill="none" />)}
        </div>
    );
};


// --- Header Component ---
export const Header: React.FC = () => {
    const { user, logout, cart } = useAppContext();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isProfileOpen, setIsProfileOpen] = React.useState(false);


    const handleLogout = () => {
        logout();
        setIsProfileOpen(false);
        navigate('/');
    };

    const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

    const navLinkClasses = "px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-secondary transition-colors";
    const activeNavLinkClasses = "text-primary dark:text-secondary font-semibold";

    const renderNavLinks = (isMobile = false) => (
         <div className={`flex ${isMobile ? 'flex-col items-center space-y-2' : 'items-center space-x-1'}`}>
            <NavLink to="/" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} onClick={() => setIsMenuOpen(false)}>Home</NavLink>
            <NavLink to="/category/Photo" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} onClick={() => setIsMenuOpen(false)}>Photos</NavLink>
            <NavLink to="/category/Frame" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} onClick={() => setIsMenuOpen(false)}>Frames</NavLink>
            <NavLink to="/category/Art" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} onClick={() => setIsMenuOpen(false)}>Art</NavLink>
            {user && (user.role === Role.ADMIN || user.role === Role.SELLER) && (
                 <>
                    <NavLink to="/upload" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} onClick={() => setIsMenuOpen(false)}>Upload</NavLink>
                    <NavLink to="/dashboard" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} onClick={() => setIsMenuOpen(false)}>Dashboard</NavLink>
                </>
            )}
        </div>
    );

    return (
        <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md sticky top-0 z-50 shadow-sm dark:shadow-md dark:shadow-black/20">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left: Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2 group">
                            <img src={LOGO_BASE64} alt="Logo" className="h-10 w-10 rounded-full object-cover transition-transform group-hover:scale-105" />
                             <span className="hidden sm:block text-xl font-display font-bold text-gray-800 dark:text-white">
                               Photo & Art BD
                            </span>
                        </Link>
                    </div>

                    {/* Center: Navigation Links */}
                    <div className="hidden md:flex justify-center">
                        {renderNavLinks()}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <SearchBar />
                        <ThemeToggle />
                        <Link to="/cart" className="relative text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-secondary transition-colors">
                            <ShoppingCartIcon />
                            {totalCartItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">{totalCartItems}</span>
                            )}
                        </Link>
                        
                        {user ? (
                            <div className="relative">
                                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="block h-9 w-9 rounded-full overflow-hidden border-2 border-transparent hover:border-primary focus:outline-none focus:border-primary transition">
                                     <img className="h-full w-full object-cover" src={`https://api.dicebear.com/8.x/initials/svg?seed=${user.email}`} alt="User Avatar" />
                                </button>
                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20 ring-1 ring-black dark:ring-gray-700 ring-opacity-5">
                                        <div className="px-4 py-2">
                                            <p className="text-sm text-gray-700 dark:text-gray-300">Signed in as</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.email}</p>
                                        </div>
                                        <div className="border-t border-gray-100 dark:border-gray-700"></div>
                                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white">
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                             <Link to="/login" className="hidden md:block px-4 py-2 text-sm border border-primary text-primary rounded-md hover:bg-primary hover:text-white dark:border-secondary dark:text-secondary dark:hover:bg-secondary dark:hover:text-gray-900 transition-colors">
                                Login / Sign Up
                            </Link>
                        )}

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                                <MenuIcon />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                 {isMenuOpen && (
                    <div className="md:hidden pt-2 pb-4">
                        {renderNavLinks(true)}
                        {!user && (
                             <Link to="/login" onClick={() => setIsMenuOpen(false)} className="mt-4 block w-full text-center px-4 py-2 text-sm border border-primary text-primary rounded-md hover:bg-primary hover:text-white dark:border-secondary dark:text-secondary dark:hover:bg-secondary dark:hover:text-gray-900 transition-colors">
                                Login / Sign Up
                            </Link>
                        )}
                    </div>
                 )}
            </nav>
        </header>
    );
};

// --- Footer Component ---
export const Footer: React.FC = () => {
    // Social media icon components for clarity
    const FacebookIcon = () => (<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v2.385z" /></svg>);
    const TwitterIcon = () => (<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616v.064c0 2.298 1.634 4.218 3.791 4.66-.452.124-.934.19-1.424.19-.289 0-.57-.028-.84-.081.613 1.954 2.441 3.373 4.6 3.41-1.616 1.267-3.642 2.023-5.84 2.023-.379 0-.75-.022-1.11-.065 2.088 1.349 4.57 2.133 7.24 2.133 8.682 0 13.44-7.243 13.44-13.77 0-.209 0-.417-.014-.623.922-.666 1.72-1.497 2.352-2.445z"/></svg>);
    const InstagramIcon = () => (<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069s-3.584-.011-4.85-.069c-3.252-.149-4.771-1.664-4.919-4.919-.058-1.265-.069-1.644-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919 1.266-.058 1.644-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44-.645-1.44-1.441-1.44z"/></svg>);
    const GithubIcon = () => (<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>);


    return (
        <footer className="bg-gray-800 dark:bg-black/50 text-gray-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* About */}
                    <div className="md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <img src={LOGO_BASE64} alt="Logo" className="h-10 w-10 rounded-full object-cover" />
                             <span className="text-xl font-display font-bold text-white">
                               Photo & Art BD
                            </span>
                        </Link>
                        <p className="text-sm text-gray-400">Your one-stop marketplace for stunning digital photos, unique art, and beautiful frames. Capturing and sharing creativity.</p>
                    </div>
                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-white uppercase tracking-wider mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/category/Photo" className="text-gray-400 hover:text-white transition-colors">Photos</Link></li>
                            <li><Link to="/category/Frame" className="text-gray-400 hover:text-white transition-colors">Frames</Link></li>
                            <li><Link to="/category/Art" className="text-gray-400 hover:text-white transition-colors">Art</Link></li>
                            <li><Link to="/cart" className="text-gray-400 hover:text-white transition-colors">Your Cart</Link></li>
                        </ul>
                    </div>
                    {/* Support */}
                    <div>
                        <h3 className="font-bold text-white uppercase tracking-wider mb-4">Support</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                        </ul>
                    </div>
                    {/* Connect */}
                    <div>
                         <h3 className="font-bold text-white uppercase tracking-wider mb-4">Connect With Us</h3>
                         <div className="flex space-x-4 mb-4 text-gray-400">
                            <a href="#" className="hover:text-white transition-colors"><FacebookIcon /></a>
                            <a href="#" className="hover:text-white transition-colors"><TwitterIcon /></a>
                            <a href="#" className="hover:text-white transition-colors"><InstagramIcon /></a>
                            <a href="https://github.com/your-username/your-repo" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="View on GitHub"><GithubIcon /></a>
                         </div>
                         <a href="mailto:support@photoartbd.com" className="text-sm text-gray-400 hover:text-white transition-colors">support@photoartbd.com</a>
                    </div>
                </div>
            </div>
             <div className="border-t border-gray-700">
                <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
                     <p>&copy; {new Date().getFullYear()} Photo and Art Market Place BD. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};


// --- ProductCard Component ---
interface ProductCardProps {
    product: Product;
}
export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { addToCart } = useAppContext();
    const navigate = useNavigate();

    const handleBuyNow = () => {
        addToCart(product);
        navigate('/cart');
    };

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-xl dark:shadow-black/20 dark:hover:shadow-primary/20 transition-shadow duration-300 group flex flex-col animate-fade-in-up">
            <Link to={`/products/${product.id}`} className="block">
                <div className="overflow-hidden">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
            </Link>
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex-grow">
                     <span className="text-xs font-semibold text-primary dark:text-secondary uppercase">{product.category}</span>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1 truncate">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <StarRating rating={product.rating} size="sm" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">({product.reviewCount} reviews)</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm my-2">by {product.seller}</p>
                    {product.category !== Category.PHOTO && (
                         <p className="text-xl font-display text-gray-800 dark:text-gray-200">${product.price.toFixed(2)}</p>
                    )}
                </div>
                <div className="mt-4 flex flex-col">
                    {product.category === Category.PHOTO ? (
                        <Link 
                            to={`/products/${product.id}`} 
                            className="w-full text-center px-4 py-2 bg-secondary text-gray-900 font-bold rounded-md hover:bg-opacity-80 transition-colors text-sm"
                        >
                            View Download Options
                        </Link>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-2">
                             <button onClick={() => addToCart(product)} className="flex-1 px-4 py-2 bg-primary/90 text-white rounded-md hover:bg-primary transition-colors font-semibold text-sm">Add to Cart</button>
                             <button onClick={handleBuyNow} className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold text-sm">Buy Now</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- Spinner Component ---
export const Spinner: React.FC = () => (
    <div className="flex justify-center items-center h-full w-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary dark:border-secondary"></div>
    </div>
);

// --- ProtectedRoute Component ---
interface ProtectedRouteProps {
    // FIX: Changed type from JSX.Element to React.ReactNode to resolve "Cannot find namespace 'JSX'" error.
    // This is a more conventional and flexible type for the children prop.
    children: React.ReactNode;
    allowedRoles: Role[];
}
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { user } = useAppContext();
    
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};