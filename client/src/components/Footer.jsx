import React from 'react';
import { 
  Youtube, 
  Settings, 
  LifeBuoy, 
  Globe, 
  Shield, 
  FileText, 
  Mail,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  ChevronRight
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    about: [
      { name: 'About Us', href: '#' },
      { name: 'Press', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Contact Us', href: '#' },
      { name: 'Partners', href: '#' }
    ],
    support: [
      { name: 'Help Center', href: '#' },
      { name: 'Safety Center', href: '#' },
      { name: 'Community Guidelines', href: '#' },
      { name: 'Creators Hub', href: '#' }
    ],
    legal: [
      { name: 'Terms of Service', href: '#' },
      { name: 'Privacy Policy', href: '#' },
      { name: 'Copyright Info', href: '#' },
      { name: 'Cookie Policy', href: '#' }
    ],
    apps: [
      { name: 'iOS App', href: '#' },
      { name: 'Android App', href: '#' },
      { name: 'TV App', href: '#' },
      { name: 'Gaming App', href: '#' }
    ]
  };

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' }
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2">
              <Youtube className="w-8 h-8 text-orange-500" />
              <span className="text-xl font-bold text-white">CusineCreators</span>
            </div>
            <p className="mt-4 text-sm leading-6">
              Share your stories with the world. Upload, watch, and engage with videos that matter to you.
              Join millions of creators and viewers on our platform.
            </p>
            
            {/* Language Selector */}
            <div className="mt-6">
              <button className="flex items-center space-x-2 text-sm hover:text-white transition-colors">
                <Globe className="w-5 h-5" />
                <span>English (US)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-3 lg:grid-cols-3 lg:col-span-4 gap-8">
            {/* About Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">About</h3>
              <ul className="space-y-3">
                {footerLinks.about.map(link => (
                  <li key={link.name}>
                    <a href={link.href} className="text-sm hover:text-white transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-3">
                {footerLinks.support.map(link => (
                  <li key={link.name}>
                    <a href={link.href} className="text-sm hover:text-white transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map(link => (
                  <li key={link.name}>
                    <a href={link.href} className="text-sm hover:text-white transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Apps Links */}
            {/* <div>
              <h3 className="text-white font-semibold mb-4">Apps</h3>
              <ul className="space-y-3">
                {footerLinks.apps.map(link => (
                  <li key={link.name}>
                    <a href={link.href} className="text-sm hover:text-white transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div> */}
          </div>
        </div>

        {/* Social Links and Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            {/* Copyright */}
            <p className="text-sm">
              © {currentYear} CuisineCreators. All rights reserved.
            </p>

            {/* Social Media Links */}
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              {socialLinks.map(social => (
                <a 
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Contact Bar */}
        <div className="mt-8 py-4 px-6 bg-gray-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <LifeBuoy className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium text-white">Need urgent help?</span>
          </div>
          <a 
            href="#" 
            className="text-sm text-orange-500 hover:text-orange-400 transition-colors"
          >
            Contact Support 24/7
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;