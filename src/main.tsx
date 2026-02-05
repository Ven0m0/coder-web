import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

// Set Content Security Policy after DOM is ready
const setCSP = () => {
  const csp = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self' data:;
    connect-src 'self' https://api.openai.com https://generativelanguage.googleapis.com;
    frame-src 'none';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = csp;
  document.head.appendChild(meta);
};

// Wait for DOM to be ready before rendering
document.addEventListener('DOMContentLoaded', () => {
  // Apply CSP before rendering the app
  setCSP();
  
  // Render the app
  createRoot(document.getElementById("root")!).render(<App />);
});

// Fallback for cases where DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setCSP();
    createRoot(document.getElementById("root")!).render(<App />);
  });
} else {
  setCSP();
  createRoot(document.getElementById("root")!).render(<App />);
}