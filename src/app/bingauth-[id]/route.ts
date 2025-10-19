import { NextResponse } from 'next/server';

export async function GET() {
  // Replace 'BingSiteAuth' with your actual Bing verification code
  const verificationCode = process.env.BING_VERIFICATION_CODE || 'BingSiteAuth';
  
  return new NextResponse(verificationCode, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
