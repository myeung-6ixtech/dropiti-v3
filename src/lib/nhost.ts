import { NhostClient } from '@nhost/nextjs';

const subdomain = process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN;
const region = process.env.NEXT_PUBLIC_NHOST_REGION;

if (!subdomain) {
  throw new Error(
    'Missing environment variable: NEXT_PUBLIC_NHOST_SUBDOMAIN must be set.'
  );
}

if (!region) {
  throw new Error(
    'Missing environment variable: NEXT_PUBLIC_NHOST_REGION must be set.'
  );
}

export const nhost = new NhostClient({ subdomain, region });
