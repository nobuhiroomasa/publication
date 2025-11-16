import { useEffect, useState } from 'react';
import { fetchJson } from '../lib/api.js';

const CONTENT_SECTIONS = ['top', 'access', 'reservations', 'about', 'features'];

export function useCafeData() {
  const [state, setState] = useState({
    contents: {},
    features: [],
    gallery: [],
    announcements: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const contentEntries = await Promise.all(
          CONTENT_SECTIONS.map(async (section) => {
            const data = await fetchJson(`/api/content/${section}`, controller.signal);
            return [section, data];
          }),
        );
        const [featureList, galleryList, announcementList] = await Promise.all([
          fetchJson('/api/features', controller.signal),
          fetchJson('/api/gallery', controller.signal),
          fetchJson('/api/announcements', controller.signal),
        ]);
        setState({
          contents: Object.fromEntries(contentEntries),
          features: featureList,
          gallery: galleryList,
          announcements: announcementList,
          loading: false,
          error: null,
        });
      } catch (err) {
        if (err.name === 'AbortError') {
          return;
        }
        console.error(err);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: 'コンテンツの読み込みに失敗しました。時間をおいて再度お試しください。',
        }));
      }
    }
    load();
    return () => controller.abort();
  }, []);

  return state;
}
