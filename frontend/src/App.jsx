import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useCafeData } from './hooks/useCafeData.js';
import { useScrollAnimations } from './hooks/useScrollAnimations.js';
import SiteHeader from './components/SiteHeader.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import PageLoader from './components/PageLoader.jsx';
import { ErrorSection, LoadingSection } from './components/StatusSection.jsx';
import HomePage from './pages/HomePage.jsx';
import AccessPage from './pages/AccessPage.jsx';
import ReservationsPage from './pages/ReservationsPage.jsx';
import GalleryPage from './pages/GalleryPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import FeaturesPage from './pages/FeaturesPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

const NAV_LINKS = [
  { label: 'ホーム', path: '/' },
  { label: 'アクセス', path: '/access' },
  { label: '予約', path: '/reservations' },
  { label: 'ギャラリー', path: '/gallery' },
  { label: 'ストーリー', path: '/about' },
  { label: 'ハイライト', path: '/highlights' },
];

const ROUTE_TITLES = {
  '/': 'Sample Cafe | 公式サイト',
  '/access': 'アクセス | Sample Cafe',
  '/reservations': '予約 | Sample Cafe',
  '/gallery': 'ギャラリー | Sample Cafe',
  '/about': 'ストーリー | Sample Cafe',
  '/highlights': 'ハイライト | Sample Cafe',
  '*': 'ページが見つかりません | Sample Cafe',
};

export default function App() {
  const { contents, features, gallery, announcements, loading, error } = useCafeData();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);

  useScrollAnimations(!loading, location.pathname);

  useEffect(() => {
    setNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = navOpen ? 'hidden' : '';
  }, [navOpen]);

  useEffect(() => {
    const nextTitle = ROUTE_TITLES[location.pathname] ?? ROUTE_TITLES['*'];
    document.title = nextTitle;
  }, [location.pathname]);

  return (
    <>
      <PageLoader hidden={!loading} />
      <SiteHeader
        links={NAV_LINKS}
        navOpen={navOpen}
        onToggleNav={() => setNavOpen((prev) => !prev)}
      />
      <main>
        {error ? (
          <ErrorSection message={error} />
        ) : (
          <Routes>
            <Route
              path="/"
              element={
                loading && !contents.top ? (
                  <LoadingSection message="トップページを読み込み中です。" />
                ) : (
                  <HomePage
                    content={contents.top}
                    features={features}
                    gallery={gallery}
                    announcements={announcements}
                  />
                )
              }
            />
            <Route path="/access" element={<AccessPage content={contents.access} />} />
            <Route path="/reservations" element={<ReservationsPage content={contents.reservations} />} />
            <Route path="/gallery" element={<GalleryPage gallery={gallery} />} />
            <Route
              path="/about"
              element={<AboutPage content={contents.about} announcements={announcements} />}
            />
            <Route
              path="/highlights"
              element={<FeaturesPage content={contents.features} features={features} />}
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
