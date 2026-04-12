// src/shared/ui/SecurityHeaders.jsx
// SEC-F1-06: Content Security Policy via meta tag
import React from "react";

const SecurityHeaders = () => (
  <>
    <meta httpEquiv="Content-Security-Policy" content="default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com https://api.groq.com https://api.together.xyz https://openrouter.ai https://api.anthropic.com; font-src 'self' https:; frame-ancestors 'none';" />
    <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
    <meta httpEquiv="X-Frame-Options" content="DENY" />
    <meta name="referrer" content="strict-origin-when-cross-origin" />
  </>
);

export default SecurityHeaders;
