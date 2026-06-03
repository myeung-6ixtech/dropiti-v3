import LatestPropertiesSectionClient from './LatestPropertiesSectionClient';

/**
 * Homepage latest listings — client fetch via BFF → Nhost
 * `GET /v1/client/properties/get-listings` when NEXT_PUBLIC_FUNCTIONS_URL is set.
 */
export default function LatestPropertiesSection() {
  return <LatestPropertiesSectionClient />;
}
