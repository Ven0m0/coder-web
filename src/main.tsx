import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

// Set Content Security Policy after DOM is ready
const setCSP = () => {
  if (typeof document === 'undefined') return;
  
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

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready before rendering
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setCSP();
      createRoot(document.getElementById("root")!).render(<App />);
    });
  } else {
    // DOM is already loaded
    setCSP();
    createRoot(document.getElementById("root")!).render(<App />);
  }
}