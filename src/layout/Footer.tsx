import React from 'react';
import { Mail, Github, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { name: 'Home', href: '/link' },
    { name: 'About', href: '/link' },
    { name: 'Try', href: '/link' },
    { name: 'Privacy', href: '/link' },
    { name: 'Terms', href: '/link' },
  ];

  return (
    <footer className="bg-gradient-to-t from-indigo-50 to-white border-t border-indigo-100/30">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-2xl font-extrabold text-indigo-600 tracking-tight">
              Question Checker
            </h2>
            <p className="mt-2 text-sm text-gray-600 text-center md:text-left">
              Discover and filter similar questions with ease.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2 text-center md:text-left">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                    aria-label={`Navigate to ${link.name}`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Get in Touch</h3>
            <ul className="space-y-3">
              <li className="flex items-center justify-center md:justify-start gap-2">
                <Mail className="text-indigo-500" size={16} aria-hidden="true" />
                <a
                  href="mailto:support@questionchecker.com"
                  className="text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                  aria-label="Email support"
                >
                  support@questionchecker.com
                </a>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-2">
                <Twitter className="text-indigo-500" size={16} aria-hidden="true" />
                <a
                  href="https://twitter.com/questionchecker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                  aria-label="Visit Twitter profile"
                >
                  @questionchecker
                </a>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-2">
                <Github className="text-indigo-500" size={16} aria-hidden="true" />
                <a
                  href="https://github.com/questionchecker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                  aria-label="Visit GitHub repository"
                >
                  github.com/questionchecker
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-indigo-100/50 text-center">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} Question Checker. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;