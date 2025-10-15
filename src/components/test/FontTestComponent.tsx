import React from 'react';
import { fontClasses } from '@/utils/fonts';

export default function FontTestComponent() {
  return (
    <div className="p-8 space-y-4">
      <h1 className={fontClasses.display}>Plus Jakarta Sans Display (Google Fonts)</h1>
      <h2 className={fontClasses.heading}>Plus Jakarta Sans Heading</h2>
      <h3 className={fontClasses.subheading}>Plus Jakarta Sans Subheading</h3>
      <p className={fontClasses.body}>Plus Jakarta Sans Body Text - This is how regular body text will look with Google Fonts Plus Jakarta Sans.</p>
      <p className={fontClasses.caption}>Plus Jakarta Sans Caption - Smaller text for captions and labels.</p>
      <button className={`${fontClasses.button} bg-blue-600 text-white px-4 py-2 rounded`}>
        Plus Jakarta Sans Button
      </button>
      
      {/* Weight variations */}
      <div className="space-y-2">
        <p className="font-plus-jakarta font-extralight">Extra Light (200) - Google Fonts</p>
        <p className="font-plus-jakarta font-light">Light (300)</p>
        <p className="font-plus-jakarta font-normal">Normal (400)</p>
        <p className="font-plus-jakarta font-medium">Medium (500)</p>
        <p className="font-plus-jakarta font-semibold">Semi Bold (600)</p>
        <p className="font-plus-jakarta font-bold">Bold (700)</p>
        <p className="font-plus-jakarta font-extrabold">Extra Bold (800)</p>
      </div>
      
      {/* Test with default font-sans class */}
      <div className="mt-8 p-4 bg-gray-50 rounded">
        <h3 className="font-sans font-bold text-lg mb-2">Using font-sans class (should be Plus Jakarta Sans)</h3>
        <p className="font-sans font-normal">This text uses the default font-sans class which now points to Plus Jakarta Sans from Google Fonts.</p>
      </div>
    </div>
  );
}
