'use client';

import Link from 'next/link';
import Image from 'next/image';
import { footerStyles } from '@/styles/index';

interface FooterProps {
  className?: string;
}

interface FooterLink {
  name: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const footerSections: FooterSection[] = [
  {
    title: 'Properties',
    links: [
      { name: 'Search Properties', href: '/search' },
      { name: 'Rent Properties', href: '/search?type=rent' },
      // { name: 'Buy Properties', href: '/search?type=buy' },
      { name: 'New Listings', href: '/search?sort=newest' },
      { name: 'Featured Properties', href: '/search?featured=true' },
    ]
  },
  {
    title: 'Our Community',
    links: [
      { name: 'Listing Guidelines', href: '/listing-guidelines' },
      { name: 'Help Center', href: '/help' },
      { name: 'Press', href: '/press' },
      { name: 'Blog', href: '/blog' },
    ]
  },
  {
    title: 'Support',
    links: [
      { name: 'FAQ', href: '/faq' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Cookie Policy', href: '/cookies' },
    ]
  }
];

const socialLinks = [
  { 
    name: 'Facebook', 
    href: 'https://facebook.com', 
    icon: () => (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    external: true 
  },
  { 
    name: 'Twitter', 
    href: 'https://twitter.com', 
    icon: () => (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
      </svg>
    ),
    external: true 
  },
  { 
    name: 'Instagram', 
    href: 'https://instagram.com', 
    icon: () => (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.928-.875-1.418-2.026-1.418-3.323s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.323z"/>
      </svg>
    ),
    external: true 
  },
  { 
    name: 'LinkedIn', 
    href: 'https://linkedin.com', 
    icon: () => (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    external: true 
  },
];



export default function Footer({ className = '' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`${footerStyles.container} ${className}`}>
      {/* Main Footer Content */}
      <div className={footerStyles.mainContent}>
        <div className={footerStyles.grid}>
          {/* Company Info */}
          <div className={footerStyles.companyInfo}>
            <div className={footerStyles.companyHeader}>
              <span className={footerStyles.companyName}>dropiti</span>
            </div>
            <p className={footerStyles.companyDescription}>
              Your trusted partner in finding the perfect property. We connect tenants with landlords 
              and help everyone find their ideal space.
            </p>
            
            {/* Company Credentials */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center space-x-4 mb-10">
                <Image
                  src="/images/6ixtechlogo_full_white.png"
                  alt="6ixTech Logo"
                  width={120}
                  height={40}
                  className="h-8 w-auto object-contain"
                />
                <Image
                  src="/images/cyberport_logo.png"
                  alt="Cyberport Logo"
                  width={100}
                  height={40}
                  className="h-8 w-auto object-contain"
                />
              </div>
            </div>
            
            {/* Social Links */}
            <div className={footerStyles.socialLinks}>
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target={social.external ? '_blank' : undefined}
                  rel={social.external ? 'noopener noreferrer' : undefined}
                  className={footerStyles.socialLink}
                >
                  <span className={footerStyles.socialSrOnly}>{social.name}</span>
                  {social.icon()}
                </a>
              ))}
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className={footerStyles.section}>
                {section.title}
              </h3>
              <ul className={footerStyles.sectionLinks}>
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className={footerStyles.sectionLink}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={footerStyles.bottomBar}>
        <div className={footerStyles.bottomContent}>
          <div className={footerStyles.bottomFlex}>
            {/* Copyright */}
            <div className={footerStyles.copyright}>
              © {currentYear} Dropiti. All rights reserved.
            </div>

            {/* Additional Links */}
            <div className={footerStyles.bottomLinks}>
              <Link
                href="/terms"
                className={footerStyles.bottomLink}
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className={footerStyles.bottomLink}
              >
                Privacy
              </Link>
              <Link
                href="/cookies"
                className={footerStyles.bottomLink}
              >
                Cookies
              </Link>
              <Link
                href="/listing-guidelines"
                className={footerStyles.bottomLink}
              >
                Guidelines
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
