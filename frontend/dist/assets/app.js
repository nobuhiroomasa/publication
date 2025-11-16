import { React, ReactDOM } from './mini-react.js';

const { createElement: h, Fragment, useState, useEffect, useMemo } = React;

const NAV_LINKS = [
  { label: 'ホーム', path: '/' },
  { label: 'アクセス', path: '/access' },
  { label: '予約', path: '/reservations' },
  { label: 'ギャラリー', path: '/gallery' },
  { label: 'ストーリー', path: '/about' },
  { label: 'ハイライト', path: '/highlights' },
];

const ROUTES = {
  '/': {
    component: HomePage,
    title: 'Sample Cafe | 公式サイト',
    requires: ['content:top', 'features', 'gallery', 'announcements'],
    contentKey: 'top',
    useFeatures: true,
    useGallery: true,
    useAnnouncements: true,
  },
  '/access': {
    component: AccessPage,
    title: 'アクセス | Sample Cafe',
    requires: ['content:access'],
    contentKey: 'access',
  },
  '/reservations': {
    component: ReservationsPage,
    title: '予約 | Sample Cafe',
    requires: ['content:reservations'],
    contentKey: 'reservations',
  },
  '/gallery': {
    component: GalleryPage,
    title: 'ギャラリー | Sample Cafe',
    requires: ['gallery'],
    useGallery: true,
  },
  '/about': {
    component: AboutPage,
    title: 'ストーリー | Sample Cafe',
    requires: ['content:about', 'announcements'],
    contentKey: 'about',
    useAnnouncements: true,
  },
  '/highlights': {
    component: FeaturesPage,
    title: 'ハイライト | Sample Cafe',
    requires: ['content:features', 'features'],
    contentKey: 'features',
    useFeatures: true,
  },
  '*': {
    component: NotFoundPage,
    title: 'ページが見つかりません | Sample Cafe',
    requires: [],
  },
};

const CONTENT_SECTIONS = ['top', 'access', 'reservations', 'about', 'features'];

function App() {
  const [route, setRoute] = useState(normalizePath(window.location.pathname));
  const [contents, setContents] = useState({});
  const [features, setFeatures] = useState(null);
  const [gallery, setGallery] = useState(null);
  const [announcements, setAnnouncements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const handlePop = () => setRoute(normalizePath(window.location.pathname));
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const contentPairs = await Promise.all(
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
        setContents(Object.fromEntries(contentPairs));
        setFeatures(featureList);
        setGallery(galleryList);
        setAnnouncements(announcementList);
        setError(null);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error(err);
          setError('コンテンツの読み込みに失敗しました。しばらくしてから再度お試しください。');
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const info = ROUTES[route] || ROUTES['*'];
    document.title = info.title;
  }, [route]);

  useEffect(() => {
    if (loading) {
      return undefined;
    }
    const cleanup = initPageAnimations();
    return cleanup;
  }, [route, loading]);

  useEffect(() => {
    if (navOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [navOpen]);

  useEffect(() => {
    setNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [route]);

  const navigateTo = (path) => {
    const nextPath = normalizePath(path);
    if (nextPath === route) {
      return;
    }
    window.history.pushState({}, '', nextPath);
    setRoute(nextPath);
  };

  const routeInfo = ROUTES[route] || ROUTES['*'];
  const stateSnapshot = useMemo(() => ({ contents, features, gallery, announcements }), [
    contents,
    features,
    gallery,
    announcements,
  ]);
  const ready = !loading && isRouteReady(routeInfo, stateSnapshot);

  let mainContent;
  if (error) {
    mainContent = h(ErrorSection, { message: error });
  } else if (!ready) {
    mainContent = h(LoadingSection, { message: 'コンテンツを読み込み中です。' });
  } else {
    const pageProps = buildRouteProps(routeInfo, stateSnapshot, navigateTo);
    mainContent = h(routeInfo.component, pageProps);
  }

  const loaderClass = loading ? 'page-loader' : 'page-loader hide';

  return h(
    Fragment,
    null,
    h(PageLoader, { className: loaderClass }),
    h(Header, {
      route,
      navOpen,
      onToggleNav: () => setNavOpen((prev) => !prev),
      onNavigate: navigateTo,
    }),
    h('main', null, mainContent),
    h(Footer),
  );
}

function Header({ route, navOpen, onToggleNav, onNavigate }) {
  return h(
    'header',
    { className: 'site-header' },
    h(
      'div',
      { className: 'header-inner container' },
      h(
        'div',
        { className: 'brand' },
        'Sample Cafe',
        h('span', null, 'URBAN SLOW COFFEE'),
      ),
      h(
        'nav',
        { className: `main-nav${navOpen ? ' open' : ''}` },
        h(
          'button',
          {
            className: 'nav-toggle',
            'aria-label': 'ナビゲーションを開閉',
            'aria-expanded': navOpen ? 'true' : 'false',
            onclick: (event) => {
              event.preventDefault();
              onToggleNav();
            },
          },
          h('span'),
          h('span'),
          h('span'),
        ),
        h(
          'ul',
          null,
          NAV_LINKS.map((link) =>
            h(
              'li',
              { className: `nav-item${route === link.path ? ' active' : ''}` },
              h(
                'a',
                {
                  href: link.path,
                  onclick: (event) => handleInternalNavigation(event, link.path, onNavigate),
                },
                link.label,
              ),
            ),
          ),
        ),
        h(
          'a',
          {
            className: 'nav-cta',
            href: 'https://www.instagram.com/',
            target: '_blank',
            rel: 'noopener',
          },
          'Instagram',
        ),
      ),
    ),
  );
}

function Footer() {
  const year = new Date().getFullYear();
  return h(
    'footer',
    { className: 'site-footer' },
    h(
      'div',
      { className: 'footer-grid' },
      h(
        'div',
        null,
        h('h4', null, 'Sample Cafe'),
        h('p', null, 'カフェ・飲食店向けのデモ用CMSサイトです。ブランドの世界観づくりにご活用いただけます。'),
      ),
      h(
        'div',
        null,
        h('h4', null, 'お問い合わせ'),
        h(
          'ul',
          null,
          h('li', null, 'メール：hello@example.com'),
          h('li', null, '電話：000-0000-0000'),
          h('li', null, '住所：管理画面から自由に編集できます。'),
        ),
      ),
      h(
        'div',
        null,
        h('h4', null, '営業時間'),
        h('p', null, '平日 09:00〜20:00', h('br'), '土日祝 10:00〜22:00'),
      ),
      h(
        'div',
        null,
        h('h4', null, 'SNS'),
        h(
          'div',
          { className: 'socials' },
          h('a', { href: '#', 'aria-label': 'Instagramへ' }, h('i', { className: 'fab fa-instagram' })),
          h('a', { href: '#', 'aria-label': 'Facebookへ' }, h('i', { className: 'fab fa-facebook-f' })),
          h('a', { href: '#', 'aria-label': 'X（旧Twitter）へ' }, h('i', { className: 'fab fa-twitter' })),
        ),
      ),
      h('p', { className: 'copyright' }, `© ${year} Sample Cafe Demo. All rights reserved.`),
    ),
    h('p', { className: 'copyright' }, `© ${year} Sample Cafe Demo. 無断転載を禁じます。`),
  );
}

function PageLoader({ className }) {
  return h(
    'div',
    { className },
    h(
      'div',
      { className: 'loader-content' },
      h('div', { className: 'loader-logo' }, h('i', { className: 'fas fa-mug-hot' })),
      h('p', { className: 'loader-text' }, '淹れたてのひとときを読み込み中...'),
    ),
  );
}

function HomePage({ content, features = [], gallery = [], announcements = [], navigate }) {
  if (!content) {
    return h(LoadingSection, { message: 'トップページを読み込み中です。' });
  }
  const extra = parseExtraInfo(content.extra_info);
  const signature = extra.signature || '季節ごとに変わるおすすめメニューをご用意しています。';
  const highlightGallery = gallery.slice(0, 4);

  return h(
    Fragment,
    null,
    h(
      'section',
      {
        className: 'hero',
        style: `background-image: url('${content.image || ''}')`,
        'data-animate': '',
      },
      h(
        'div',
        { className: 'hero-content container' },
        h('span', { className: 'hero-badge' }, 'Weekend Lounge'),
        h('h1', null, content.title),
        h('p', null, content.subtitle),
        h('div', { className: 'hero-highlight' }, content.highlight),
        h(
          'a',
          {
            href: '/reservations',
            className: 'btn-primary',
            onclick: (event) => handleInternalNavigation(event, '/reservations', navigate),
          },
          '席を予約する',
        ),
      ),
    ),
    h(
      'section',
      { className: 'intro container' },
      h(
        'div',
        { className: 'intro-text' },
        h('h2', null, 'おもてなしのデモサイト'),
        h('p', null, content.body),
      ),
      h(
        'div',
        { className: 'intro-card' },
        h('h3', null, 'おすすめの一杯・一皿'),
        h('p', null, signature),
        h(
          'a',
          {
            href: '/highlights',
            className: 'btn-outline',
            onclick: (event) => handleInternalNavigation(event, '/highlights', navigate),
          },
          'おすすめを見る',
        ),
      ),
    ),
    h(
      'section',
      { className: 'social-proof', 'data-animate': '' },
      h(
        'div',
        { className: 'container' },
        h(
          'header',
          { className: 'section-header' },
          h('h2', null, 'お知らせ'),
          h('p', null, '最新の営業情報やイベント情報などをこちらでご案内します。'),
        ),
        h(
          'div',
          { className: 'metrics' },
          [
            { count: 680, label: '今月の保存数' },
            { count: 120, label: 'UGCストーリー' },
            { count: 48, label: 'コラボ投稿' },
          ].map((metric) =>
            h(
              'div',
              { className: 'card' },
              h('strong', { 'data-count': metric.count }, '0'),
              h('span', null, metric.label),
            ),
          ),
        ),
      ),
    ),
    h(
      'section',
      { className: 'feature-grid container', 'data-animate': '' },
      h(
        'header',
        { className: 'section-header' },
        h('h2', null, 'ハイライト'),
        h('p', null, 'お店らしさが伝わるポイントをご紹介します。'),
      ),
      h(
        'div',
        { className: 'grid' },
        features.map((feature) =>
          h(
            'div',
            { className: 'feature-card' },
            h('i', { className: `fas ${feature.icon}` }),
            h('h3', null, feature.title),
            h('p', null, feature.description),
          ),
        ),
      ),
    ),
    h(
      'section',
      { className: 'announcements', 'data-animate': '' },
      h(
        'div',
        { className: 'container' },
        h(
          'header',
          { className: 'section-header' },
          h('h2', null, 'News & Journal'),
          h('p', null, '最新のイベントや限定メニューをチェックして、来店前からワクワクをシェア。'),
        ),
        h(
          'div',
          { className: 'announcement-grid' },
          announcements.map((item) =>
            h(
              'article',
              { className: 'announcement-card' },
              h('time', { datetime: item.published_at }, formatDateTime(item.published_at)),
              h('h3', null, item.title),
              h('p', null, item.content),
            ),
          ),
        ),
      ),
    ),
    h(
      'section',
      { className: 'insta-focus', 'data-animate': '' },
      h(
        'div',
        { className: 'container' },
        h(
          'div',
          { className: 'insta-header' },
          h('div', null, h('p', { className: 'hero-label' }, 'Instagram Reels'), h('h2', null, 'Colorful Moments')),
          h(
            'div',
            { className: 'insta-handle' },
            h('i', { className: 'fab fa-instagram' }),
            h('span', null, '@samplecafe'),
          ),
          h(
            'a',
            {
              href: 'https://www.instagram.com/',
              className: 'btn-primary',
              target: '_blank',
              rel: 'noopener',
            },
            'フォローして最新情報を受け取る',
          ),
        ),
        h(
          'div',
          { className: 'insta-grid' },
          highlightGallery.map((image) =>
            h(
              'div',
              { className: 'insta-card' },
              h('img', { src: image.file_path, alt: image.caption || 'Instagram highlight' }),
              h('p', null, image.caption || 'Daily mood'),
            ),
          ),
        ),
      ),
    ),
    h(
      'section',
      { className: 'gallery-preview', 'data-animate': '' },
      h(
        'div',
        { className: 'container' },
        h(
          'header',
          { className: 'section-header' },
          h('h2', null, 'ギャラリー'),
          h('p', null, '店内の雰囲気やメニューの写真をご覧いただけます。'),
        ),
        h(
          'div',
          { className: 'gallery-grid' },
          gallery.map((image) =>
            h(
              'figure',
              null,
              h('img', { src: image.file_path, alt: image.caption || 'ギャラリー画像' }),
              h('figcaption', null, image.caption || ''),
            ),
          ),
        ),
        h(
          'div',
          { className: 'cta-center' },
          h(
            'a',
            {
              href: '/gallery',
              className: 'btn-outline',
              onclick: (event) => handleInternalNavigation(event, '/gallery', navigate),
            },
            'ギャラリーをもっと見る',
          ),
        ),
      ),
    ),
    h(
      'section',
      { className: 'cta-banner', style: "background-image: url('/static/images/cta.svg');" },
      h('div', { className: 'overlay' }),
      h(
        'div',
        { className: 'container' },
        h('h2', null, 'あなたのお店のコンセプト設計に。'),
        h('p', null, 'このデモCMSを使って、ストーリーや見せ方を試しながら作り込めます。'),
        h('a', { href: '/admin/login', className: 'btn-primary' }, '管理画面にログイン'),
      ),
    ),
  );
}

function AccessPage({ content }) {
  if (!content) {
    return h(LoadingSection, { message: 'アクセス情報を読み込み中です。' });
  }
  const extra = parseExtraInfo(content.extra_info);
  const infoBlocks = Object.entries(extra);

  return h(
    Fragment,
    null,
    h(
      'section',
      {
        className: 'page-hero',
        style: `background-image: url('${content.image || ''}')`,
        'data-animate': '',
      },
      h('div', { className: 'container' }, h('h1', null, content.title), h('p', null, content.subtitle)),
    ),
    h(
      'section',
      { className: 'page-section container two-column', 'data-animate': '' },
      h(
        'div',
        null,
        h('h2', null, 'ご来店案内'),
        h('p', null, content.body),
        h(
          'div',
          { className: 'info-block' },
          h('h3', null, '営業時間'),
          h('p', null, content.highlight),
        ),
        infoBlocks.length
          ? h(
              'div',
              { className: 'info-grid' },
              infoBlocks.map(([label, value]) =>
                h(
                  'div',
                  null,
                  h('span', { className: 'info-label' }, label),
                  h('span', { className: 'info-value' }, value),
                ),
              ),
            )
          : null,
      ),
      h(
        'div',
        null,
        h('h2', null, '地図'),
        h(
          'div',
          { className: 'map-wrapper' },
          h('iframe', {
            src: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3240.897597392088!2d139.76712441557174!3d35.68123618019478!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzXCsDQwJzUzLjQiTiAxMznCsDQ2JzAxLjciRQ!5e0!3m2!1sja!2sjp!4v1615973912761!5m2!1sja!2sjp',
            allowfullscreen: '',
            loading: 'lazy',
          }),
        ),
      ),
    ),
    h(
      'section',
      { className: 'page-section accent', 'data-animate': '' },
      h(
        'div',
        { className: 'container' },
        h('h2', null, 'アクセスのポイント'),
        h('p', null, '最寄り駅からの道順や目印、駐車場の有無など、ご来店に役立つ情報をこちらに記載してください。'),
      ),
    ),
  );
}

function ReservationsPage({ content }) {
  if (!content) {
    return h(LoadingSection, { message: '予約情報を読み込み中です。' });
  }
  const extra = parseExtraInfo(content.extra_info);
  const cta = extra.cta || '予約ページへ';
  const link = extra.link || '#';

  return h(
    Fragment,
    null,
    h(
      'section',
      {
        className: 'page-hero',
        style: `background-image: url('${content.image || ''}')`,
      },
      h('div', { className: 'overlay' }),
      h('div', { className: 'container' }, h('h1', null, content.title), h('p', null, content.subtitle)),
    ),
    h(
      'section',
      { className: 'page-section container two-column' },
      h(
        'div',
        null,
        h('h2', null, 'ご予約案内'),
        h('p', null, content.body),
        h(
          'div',
          { className: 'info-block' },
          h('h3', null, '当店からのお約束'),
          h('p', null, content.highlight),
        ),
      ),
      h(
        'div',
        { className: 'reservation-card' },
        h('h3', null, 'ご予約はこちら'),
        h(
          'a',
          { href: link, className: 'btn-primary', target: '_blank', rel: 'noopener' },
          cta,
        ),
        h('p', { className: 'note' }, '予約サイトやお問い合わせフォームへのリンクを設定してください。'),
      ),
    ),
    h(
      'section',
      { className: 'page-section accent' },
      h(
        'div',
        { className: 'container split' },
        h(
          'div',
          null,
          h('h2', null, '貸切・団体予約について'),
          h(
            'p',
            null,
            '貸切パーティー、テイスティング会、企業様のご利用など、団体予約に関するご案内や、ご希望に合わせたプラン内容をここにご記載ください。',
          ),
        ),
        h(
          'div',
          null,
          h('h2', null, 'ご予約時のお願い'),
          h(
            'ul',
            { className: 'bullet-list' },
            h('li', null, 'お席の時間制や事前のお預かり金などがある場合は、その内容を明記してください。'),
            h('li', null, 'キャンセル・人数変更の期限や方法についてわかりやすくご案内してください。'),
            h('li', null, 'アレルギーや記念日の演出など、事前にご相談いただきたい事項を記載すると安心です。'),
          ),
        ),
      ),
    ),
  );
}

function GalleryPage({ gallery = [] }) {
  return h(
    Fragment,
    null,
    h(
      'section',
      {
        className: 'page-hero small',
        style: "background-image: url('/static/images/gallery-banner.svg');",
        'data-animate': '',
      },
      h('div', { className: 'container' }, h('h1', null, 'ギャラリー'), h('p', null, '写真でお店の雰囲気や体験をお届けします。')),
    ),
    h(
      'section',
      { className: 'page-section container', 'data-animate': '' },
      gallery.length
        ? h(
            'div',
            { className: 'masonry-grid' },
            gallery.map((image) =>
              h(
                'figure',
                { className: 'masonry-item' },
                h('img', { src: image.file_path, alt: image.caption || 'ギャラリー画像' }),
                image.caption ? h('figcaption', null, image.caption) : null,
              ),
            ),
          )
        : h('p', null, 'ギャラリー画像はまだ登録されていません。'),
    ),
    h(
      'section',
      { className: 'page-section accent', 'data-animate': '' },
      h(
        'div',
        { className: 'container' },
        h('h2', null, 'ビジュアルの活用アイデア'),
        h(
          'p',
          null,
          'このギャラリーを使って、季節限定メニューや看板メニュー、イベントの様子、仕込みや店内の舞台裏など、さまざまなストーリーを発信できます。',
        ),
      ),
    ),
  );
}

function AboutPage({ content, announcements = [] }) {
  if (!content) {
    return h(LoadingSection, { message: 'ストーリーを読み込み中です。' });
  }
  const extra = parseExtraInfo(content.extra_info);
  const teamMembers = extra.team ? extra.team.split(',').map((member) => member.trim()).filter(Boolean) : [];

  return h(
    Fragment,
    null,
    h(
      'section',
      {
        className: 'page-hero',
        style: `background-image: url('${content.image || ''}')`,
        'data-animate': '',
      },
      h('div', { className: 'container' }, h('h1', null, content.title), h('p', null, content.subtitle)),
    ),
    h(
      'section',
      { className: 'page-section container two-column', 'data-animate': '' },
      h(
        'div',
        null,
        h('h2', null, '私たちのストーリー'),
        h('p', null, content.body),
        h(
          'div',
          { className: 'info-block' },
          h('h3', null, 'コンセプト'),
          h('p', null, content.highlight),
        ),
      ),
      h(
        'div',
        { className: 'story-card' },
        h('h3', null, 'スタッフ'),
        teamMembers.length
          ? h(
              'ul',
              null,
              teamMembers.map((member) => h('li', null, member)),
            )
          : h('p', null, 'お店を支える主なスタッフや、関わっている方々を紹介してください。'),
      ),
    ),
    h(
      'section',
      { className: 'page-section container', 'data-animate': '' },
      h(
        'header',
        { className: 'section-header' },
        h('h2', null, 'お知らせ・メディア掲載'),
        h('p', null, 'メディア掲載、コラボ企画、最近のお知らせなどをこちらに掲載できます。'),
      ),
      h(
        'div',
        { className: 'announcement-grid' },
        announcements.map((item) =>
          h(
            'article',
            { className: 'announcement-card' },
            h('time', { datetime: item.published_at }, formatDateTime(item.published_at)),
            h('h3', null, item.title),
            h('p', null, item.content),
          ),
        ),
      ),
    ),
    h(
      'section',
      { className: 'page-section accent', 'data-animate': '' },
      h(
        'div',
        { className: 'container' },
        h('h2', null, '私たちが大切にしていること'),
        h(
          'ul',
          { className: 'bullet-list' },
          h('li', null, '生産者さんや素材の背景への敬意。'),
          h('li', null, '細部へのこだわりから生まれる、心地よいひととき。'),
          h('li', null, 'サステナビリティと透明性への継続的な取り組み。'),
        ),
      ),
    ),
  );
}

function FeaturesPage({ content, features = [] }) {
  if (!content) {
    return h(LoadingSection, { message: 'ハイライトを読み込み中です。' });
  }
  return h(
    Fragment,
    null,
    h(
      'section',
      {
        className: 'page-hero',
        style: `background-image: url('${content.image || ''}')`,
        'data-animate': '',
      },
      h('div', { className: 'container' }, h('h1', null, content.title), h('p', null, content.subtitle)),
    ),
    h(
      'section',
      { className: 'page-section container', 'data-animate': '' },
      h('p', null, content.body),
      h(
        'div',
        { className: 'grid feature-expanded' },
        features.map((feature) =>
          h(
            'div',
            { className: 'feature-card' },
            h('i', { className: `fas ${feature.icon}` }),
            h('h3', null, feature.title),
            h('p', null, feature.description),
          ),
        ),
      ),
    ),
    h(
      'section',
      { className: 'page-section accent', 'data-animate': '' },
      h(
        'div',
        { className: 'container split' },
        h(
          'div',
          null,
          h('h2', null, '体験づくりのヒント'),
          h(
            'ul',
            { className: 'bullet-list' },
            h('li', null, 'メニューの背景や味わいを伝えるストーリーやコメントを添える。'),
            h('li', null, 'グッズ販売・店頭・オンラインショップなど、さまざまな接点で世界観を統一する。'),
            h('li', null, 'イベントやコラボ企画など、地域や仲間とのつながりを育てる取り組みを行う。'),
          ),
        ),
        h(
          'div',
          null,
          h('h2', null, '活用アイデア'),
          h(
            'p',
            null,
            '管理画面から季節限定メニューのハイライト切り替えやキャンペーンの公開、新しいサービスモデルのテスト表示などを行い、本番導入前に見え方を確認できます。',
          ),
        ),
      ),
    ),
  );
}

function NotFoundPage({ navigate }) {
  return h(
    'section',
    { className: 'page-section container' },
    h('h1', null, 'ページが見つかりません'),
    h('p', null, '指定されたページは存在しないか、移動した可能性があります。'),
    h(
      'a',
      { href: '/', className: 'btn-primary', onclick: (event) => handleInternalNavigation(event, '/', navigate) },
      'ホームに戻る',
    ),
  );
}

function LoadingSection({ message }) {
  return h('section', { className: 'page-section container' }, h('p', null, message));
}

function ErrorSection({ message }) {
  return h(
    'section',
    { className: 'page-section container' },
    h('h2', null, 'エラーが発生しました'),
    h('p', null, message),
  );
}

function buildRouteProps(routeInfo, state, navigate) {
  const props = { navigate };
  if (routeInfo.contentKey) {
    props.content = state.contents[routeInfo.contentKey];
  }
  if (routeInfo.useFeatures) {
    props.features = state.features || [];
  }
  if (routeInfo.useGallery) {
    props.gallery = state.gallery || [];
  }
  if (routeInfo.useAnnouncements) {
    props.announcements = state.announcements || [];
  }
  return props;
}

function isRouteReady(routeInfo, state) {
  return (routeInfo.requires || []).every((requirement) => {
    if (requirement.startsWith('content:')) {
      const key = requirement.split(':')[1];
      return Object.prototype.hasOwnProperty.call(state.contents || {}, key);
    }
    if (requirement === 'features') {
      return Array.isArray(state.features);
    }
    if (requirement === 'gallery') {
      return Array.isArray(state.gallery);
    }
    if (requirement === 'announcements') {
      return Array.isArray(state.announcements);
    }
    return true;
  });
}

function normalizePath(path) {
  if (!path || path === '/') {
    return '/';
  }
  const cleaned = path.replace(/\/+$/, '');
  return cleaned || '/';
}

async function fetchJson(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.json();
}

function handleInternalNavigation(event, path, navigate) {
  if (event) {
    event.preventDefault();
  }
  navigate(path);
}

function parseExtraInfo(text) {
  if (!text || typeof text !== 'string') {
    return {};
  }
  return text
    .split(/\r?\n|\|/)
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const [key, ...rest] = part.split('=');
      if (key && rest.length) {
        acc[key.trim()] = rest.join('=').trim();
      }
      return acc;
    }, {});
}

function formatDateTime(value) {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.replace('T', ' ');
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}`;
}

function initPageAnimations() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    return () => {};
  }
  const animatedElements = Array.from(document.querySelectorAll('[data-animate]'));
  const counters = Array.from(document.querySelectorAll('[data-count]'));
  const animateObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          animateObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 },
  );
  animatedElements.forEach((element) => animateObserver.observe(element));

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 },
  );
  counters.forEach((counter) => {
    counter.textContent = '0';
    counterObserver.observe(counter);
  });

  return () => {
    animateObserver.disconnect();
    counterObserver.disconnect();
  };
}

function animateCounter(element) {
  const target = parseInt(element.dataset.count || '0', 10);
  if (Number.isNaN(target)) {
    return;
  }
  const duration = 1400;
  const start = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const value = Math.floor(progress * target);
    element.textContent = value.toLocaleString();
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

function main() {
  const container = document.getElementById('root');
  if (!container) {
    return;
  }
  const root = ReactDOM.createRoot(container);
  root.render(h(App));
}

main();
