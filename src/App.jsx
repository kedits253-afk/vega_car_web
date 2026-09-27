// src/App.jsx — Layout shell: skip link, header nav, routes (lazy-loaded pages), footer.
import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';

// Lazy-load pages so the initial critical payload stays small (<1 MB w/o 3D assets)
const Home = lazy(() => import('./pages/Home.jsx'));
const Model = lazy(() => import('./pages/Model.jsx'));
const Specs = lazy(() => import('./pages/Specs.jsx'));
const Quiz = lazy(() => import('./pages/Quiz.jsx'));
const Download = lazy(() => import('./pages/Download.jsx'));
const Privacy = lazy(() => import('./pages/Privacy.jsx'));
const Terms = lazy(() => import('./pages/Terms.jsx'));

function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      Loading…
    </div>
  );
}

export default function App() {
  const location = useLocation();

  // Scroll to top + move focus to main landmark on route change (a11y SPA pattern)
  useEffect(() => {
    window.scrollTo(0, 0);
    const main = document.getElementById('main');
    if (main) main.focus({ preventScroll: true });
  }, [location.pathname]);

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Header />
      <main id="main" tabIndex={-1}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/model" element={<Model />} />
            <Route path="/specs" element={<Specs />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/download" element={<Download />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
