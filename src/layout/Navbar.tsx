import React, { useState } from 'react';
import { Menu, X } from 'lucide-react'; // For hamburger/close icons

interface Link {
  link: string;
  name: string;
  icon?: string; // Optional, as placeholders were provided
}

const links: Link[] = [
  { link: '/link', name: 'Home' },
  { link: '/link', name: 'About' },
  { link: '/link', name: 'Sign In' },
  { link: '/link', name: 'Sign Up' },
  { link: '/link', name: 'Try' },
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 py-4">
        <div className="flex justify-between items-center">
          {/* Logo/Title */}
          <div className="flex items-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-indigo-600">
              Question Checker
            </h1>
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-8">
            {links.map((item) => (
              <a
                key={item.name}
                href={item.link}
                className="text-gray-700 hover:text-indigo-600 font-semibold text-base transition-colors duration-200"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-indigo-600 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden mt-4 pb-4 flex flex-col gap-4">
            {links.map((item) => (
              <a
                key={item.name}
                href={item.link}
                className="text-gray-700 hover:text-indigo-600 font-semibold text-base py-2 transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;