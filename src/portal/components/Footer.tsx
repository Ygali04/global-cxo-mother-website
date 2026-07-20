
import React from 'react';
import { Link } from 'react-router-dom';
import { LinkedinIcon, TwitterIcon, Mail, Phone } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white relative z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <img 
                src="/cxo-circle-logo.png"
                alt="Global CXO Circle Logo"
                className="w-16 h-16 object-contain"
              />
              <span className="text-xl font-bold">Global CXO Circle</span>
            </Link>
            <p className="text-gray-400 mb-6">
              Uniting visionary technology leaders to shape the future of innovation.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.linkedin.com/company/globalciocircle/posts/?feedView=all" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                <LinkedinIcon size={24} />
              </a>
              {/* <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <TwitterIcon size={24} />
              </a> */}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/events" className="text-gray-400 hover:text-white transition-colors">Events</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/resources" className="text-gray-400 hover:text-white transition-colors">Resources</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Awards */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Awards</h3>
            <ul className="space-y-2">
              <li><Link to="/hall-of-fame" className="text-gray-400 hover:text-white transition-colors">Hall of Fame</Link></li>
              <li><Link to="/innovation-champions" className="text-gray-400 hover:text-white transition-colors">Innovation Champions</Link></li>
            </ul>
          </div>

          {/* Resources
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Member Portal</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Research Reports</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Best Practices</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Industry Insights</a></li>
            </ul>
          </div> */}

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <span className="text-gray-400">info@globalciocircle.com</span>
              </div>
              {/* <div className="flex items-center gap-2">
                <Phone size={16} />
                <span className="text-gray-400">+1 (555) 123-4567</span> */}
              {/* </div> */}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} Global CXO Circle. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</Link>
              <Link to="/cookie-policy" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
