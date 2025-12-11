import { useState } from 'react'
import { Link } from 'react-router-dom'

const LandingNavbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <nav className="bg-white shadow-md fixed w-full top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-gray-900">HealthCare</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#features" className="text-gray-700 hover:text-primary-600 transition-colors">Features</a>
                        <a href="#services" className="text-gray-700 hover:text-primary-600 transition-colors">Services</a>
                        <Link to="/doctors" className="text-gray-700 hover:text-primary-600 transition-colors">Doctors</Link>
                        <a href="#how-it-works" className="text-gray-700 hover:text-primary-600 transition-colors">How It Works</a>
                        <a href="#contact" className="text-gray-700 hover:text-primary-600 transition-colors">Contact</a>
                    </div>

                    {/* Desktop Auth Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                            Login
                        </Link>
                        <Link to="/register" className="btn-primary">
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile Hamburger */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200">
                        <div className="flex flex-col space-y-4">
                            <a href="#features" className="text-gray-700 hover:text-primary-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
                                Features
                            </a>
                            <a href="#services" className="text-gray-700 hover:text-primary-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
                                Services
                            </a>
                            <Link to="/doctors" className="text-gray-700 hover:text-primary-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
                                Doctors
                            </Link>
                            <a href="#how-it-works" className="text-gray-700 hover:text-primary-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
                                How It Works
                            </a>
                            <a href="#contact" className="text-gray-700 hover:text-primary-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
                                Contact
                            </a>
                            <div className="pt-4 border-t border-gray-200 flex flex-col space-y-2">
                                <Link to="/login" className="text-center py-2 text-primary-600 hover:text-primary-700 font-medium">
                                    Login
                                </Link>
                                <Link to="/register" className="btn-primary text-center">
                                    Get Started
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default LandingNavbar
