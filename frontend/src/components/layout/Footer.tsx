import React from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  // Linkedin,
  Heart,
  ArrowUp,
  Zap,
  Shield,
  Youtube,
Award,
  // Award,
} from "lucide-react";

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLinkClick = () => {
    // Scroll to top when clicking footer links
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const socialLinks = [
    {
      href: "https://www.facebook.com/people/Quantum-Pickleball-Pro/61564192682238/",
      icon: Facebook,
      hoverColor: "hover:bg-blue-600 hover:border-blue-500",
    },
    {
      href: "https://x.com/PunitMohan66816",
      icon: Twitter,
      hoverColor: "hover:bg-sky-500 hover:border-sky-400",
    },
    {
      href: " https://www.instagram.com/quantumpickleballpro/",
      icon: Instagram,
      hoverColor:
        "hover:bg-gradient-to-r hover:from-pink-500 hover:to-orange-500 hover:border-pink-400",
    },
    // {
    //   href: "https://linkedin.com",
    //   icon: Linkedin,
    //   hoverColor: "hover:bg-blue-700 hover:border-blue-600",
    // },
    {
      href: "https://www.youtube.com/channel/UCB3oJfpIEbm0yYAe3uVj0ew",
      icon: Youtube,
      hoverColor: "hover:bg-red-600 hover:border-red-500",
    }
  ];

  const footerSections = [
    {
      title: "Platform",
      icon: Zap,
      iconColor: "text-blue-400",
      dotColor: "bg-blue-400",
      links: [
        { to: "/booking", label: "Find Venues" },
        { to: "/events", label: "Events" },
        { to: "/shop", label: "Shop" },
        { to: "/partner/register", label: "Become Partner" },
      ],
    },
    {
      title: "Bonus Socials",
      icon: Award,
      iconColor: "text-green-400",
      dotColor: "bg-green-400",
      links: [
        { to: "https://www.threads.com/@quantumpickleballpro", label: "Threads" },
        { to: "https://in.pinterest.com/quantumpickleball/", label: "Pinterest" },
        { to: "https://www.hopp.bio/quantum-pickleball", label: "Hopp" },
        // { to: "/", label: "Press Kit" },
      ],
    },
    {
      title: "Support",
      icon: Shield,
      iconColor: "text-purple-400",
      dotColor: "bg-purple-400",
      links: [
        { to: "/contact", label: "Help Center" },
        { to: "/contact", label: "Contact Us" },
        { to: "/privacy", label: "Privacy Policy" },
        { to: "/terms", label: "Terms & Conditions" },
      ],
    },
  ];

  const contactInfo = [
    {
      icon: MapPin,
      iconColor: "text-blue-400",
      label: "Address",
      value: " 4th Floor, 36/F, Topsia Rd, Kolkata, West Bengal 700039",
    },
    {
      icon: Phone,
      iconColor: "text-green-400",
      label: "Phone",
      value: "+91 98765 43210",
    },
    {
      icon: Mail,
      iconColor: "text-purple-400",
      label: "Email",
      value: "quantum@eipickleball.com",
    },
  ];

  const stats = [
    { value: "0", label: "Hassle Guarantee", color: "text-blue-400" },
    { value: "2K+", label: "Users", color: "text-green-400" },
    { value: "100%", label: "Verified Venues", color: "text-purple-400" },
    { value: "24/7", label: "Support", color: "text-orange-400" },
  ];

  return (
    <footer className="relative z-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl -translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl translate-x-48 translate-y-48"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-5">
              <div className="flex items-center space-x-3 mb-6">

                <img src="/with_bg.PNG" className="w-24 h-24 sm:w-24 sm:h-24" alt="Quantum" />
              </div>

              <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-lg">
                Revolutionizing sports venue booking with cutting-edge
                technology. Join thousands of athletes and venue partners in
                building the future of sports.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className={`text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      className={`w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center ${social.hoverColor} transition-all duration-200 group`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IconComponent className="h-5 w-5 text-gray-300 group-hover:text-white" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Links Sections */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {footerSections.map((section, index) => {
                  const IconComponent = section.icon;
                  return (
                    <div key={index}>
                      <h3 className="text-lg font-bold mb-6 flex items-center">
                        <IconComponent
                          className={`h-5 w-5 mr-2 ${section.iconColor}`}
                        />
                        {section.title}
                      </h3>
                      <ul className="space-y-4">
                        {section.links.map((link, linkIndex) => (
                          <li key={linkIndex}>
                            <Link
                              to={link.to}
                              onClick={handleLinkClick}
                              className="text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center group"
                            >
                              <span
                                className={`w-1.5 h-1.5 ${section.dotColor} rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity`}
                              ></span>
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info Bar */}
        <div className="border-t border-white/10 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactInfo.map((contact, index) => {
              const IconComponent = contact.icon;
              return (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center">
                    <IconComponent className={`h-5 w-5 ${contact.iconColor}`} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">{contact.label}</div>
                    <div className="text-white font-medium">
                      {contact.value}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 text-gray-400 mb-4 md:mb-0">
              <span>© 2025 Quantum. Made with</span>
              <Heart className="h-4 w-4 text-red-400 fill-current" />
              <span>in India</span>
            </div>

            <button
              onClick={scrollToTop}
              className="group flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-200"
            >
              <span className="text-gray-300 group-hover:text-white">
                Back to top
              </span>
              <ArrowUp className="h-4 w-4 text-gray-300 group-hover:text-white group-hover:-translate-y-0.5 transition-all duration-200" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
