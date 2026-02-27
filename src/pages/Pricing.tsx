/**
 * Pricing.tsx — Landing/pricing page shown before auth
 *
 * Updated: Now renders the full Adobe-style LandingPage with:
 *  - Hero section: image + punchline "No more guess work — only daily insights"
 *  - Plan chooser: Grower Plan, Developer Plan, CA Store Plan
 *  - Flows to /signup (role pre-selected) or /login
 */

import React from 'react';
import LandingPage from './LandingPage';

const Pricing: React.FC = () => {
  return <LandingPage />;
};

export default Pricing;
