'use client';

import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import MarkdownRenderer from '@/components/common/MarkdownRenderer';
import Footer from '@/components/common/Footer';

const SLUG_TO_FILE: Record<string, string> = {
  faq: '/terms-and-conditions/faq.md',
  terms: '/terms-and-conditions/terms.md',
  privacy: '/terms-and-conditions/privacy.md',
  cookies: '/terms-and-conditions/cookies.md',
  'listing-guidelines': '/terms-and-conditions/listing-guidelines.md',
};

export default function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    params.then(({ slug }) => setSlug(slug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    const path = SLUG_TO_FILE[slug];
    if (!path) { setError('Not Found'); return; }
    fetch(path)
      .then((res) => { if (!res.ok) throw new Error('Failed to load content'); return res.text(); })
      .then((text) => setContent(text))
      .catch(() => setError('Failed to load content'));
  }, [slug]);

  if (error === 'Not Found') return notFound();

  return (
    <>
    <div className="policy-container">
      {content ? (
        <>
          <MarkdownRenderer content={content} />
        </>
      ) : (
        <div className="policy-loading">
          <div className="policy-loading-spinner"></div>
          <span className="policy-loading-text">Loading...</span>
        </div>
      )}
      </div>
      <Footer />
    </>
  );
}


