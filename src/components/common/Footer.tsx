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
      { name: 'Press', href: 'https://www.instagram.com/dropiti.housing/', external: true },
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
    name: 'Instagram', 
    href: 'https://www.instagram.com/dropiti.housing/', 
    icon: () => (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
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
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={footerStyles.sectionLink}
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className={footerStyles.sectionLink}
                      >
                        {link.name}
                      </Link>
                    )}
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
