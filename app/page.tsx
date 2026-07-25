"use client";

import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from "react";

type PageKey = "main" | "promise" | "reward" | "goods" | "outfit";
type ViewMode = "original" | "ipad";

const navItems: { key: PageKey; eyebrow: string; label: string; mark: string }[] = [
  { key: "main", eyebrow: "START", label: "메인", mark: "✦" },
  { key: "promise", eyebrow: "PROMISE", label: "누적공약", mark: "↗" },
  { key: "reward", eyebrow: "REWARD", label: "방셀보상", mark: "◈" },
  { key: "goods", eyebrow: "GOODS", label: "굿즈", mark: "□" },
  { key: "outfit", eyebrow: "LOOKBOOK", label: "의상", mark: "♡" },
];

const promises = [
  ["10만", "엔더 하드코어 노방종"],
  ["20만", "종겜 똥겜 핀볼"],
  ["30만", "항마력 딸리는 일식 노래 커버하기"],
  ["40만", "위 공약 모두 이행"],
  ["50만", "오리지널곡 제작"],
  ["60만", "마크서버 만들기"],
  ["70만", "오리지널곡 + 3D 뮤직비디오 제작"],
  ["90만", "호룰 만지기 VLOG"],
  ["100만", "미니콘서트 (feat. 버인초청?)"],
  ["300만", "보스한테 언니 시집보내기"],
];

const currentPromiseCount = 0;

const fixedRewards = [
  { count: "1111", title: "여름 랜덤 단컷", tone: "pink" },
  { count: "2222", title: "여름 선택 2컷", tone: "blue" },
  { count: "3333", title: "뿌기니 랜덤 2컷", tone: "yellow" },
  { count: "4999", title: "버인방셀 + 버인바람막이", tone: "mint" },
  { count: "5555", title: "뿌기니 선택 2종 2컷", tone: "lavender" },
];

const roulette = [
  ["여름 A", "0.8%"],
  ["여름 B", "0.8%"],
  ["여름 C", "0.8%"],
  ["여름 D", "0.8%"],
  ["삼국지 한정 초선", "0.4%"],
  ["뿌기니 A", "0.3%"],
  ["뿌기니 B", "0.3%"],
  ["뿌기니 C", "0.3%"],
  ["뿌기니 D", "0.3%"],
  ["뿌기니 히든", "0.1%"],
  ["여름랜덤방셀", "3%"],
  ["김", "3%"],
  ["뿌", "3%"],
  ["피", "3%"],
  ["다음 룰렛 2배 (글자 적용 X)", "20%"],
  ["쿼뿌", "5%"],
  ["뿌독", "4%"],
  ["용캐지원금", "54.1%"],
];

const goodsTiers = [
  {
    count: "582개",
    label: "MINI",
    title: "미니굿즈",
    description: "미니 아크릴 키링",
    images: ["/assets/keyring.png"],
    tone: "pink",
  },
  {
    count: "1182개",
    label: "A GOODS",
    title: "A 굿즈",
    description: "티셔츠(블랙/화이트) 또는 장패드(밤/낮) 중 택 1",
    images: [
      "/assets/tshirt-black.png",
      "/assets/tshirt-white.png",
      "/assets/deskmat-night.png",
      "/assets/deskmat-day.png",
    ],
    tone: "blue",
  },
  {
    count: "1482개",
    label: "B GOODS",
    title: "B 굿즈",
    description: "텀블러(블랙/크림) 또는 키캡 또는 쿠션 중 택 1",
    images: [
      "/assets/tumbler-black.png",
      "/assets/tumbler-cream.png",
      "/assets/keycaps.png",
      "/assets/keycap-case.png",
      "/assets/cushion.png",
    ],
    tone: "yellow",
  },
  {
    count: "2882개",
    label: "SET",
    title: "굿즈세트",
    description: "미니굿즈 + A 굿즈 중 택 1 + B 굿즈 중 택 1",
    images: [
      "/assets/keyring.png",
      "/assets/tshirt-black.png",
      "/assets/tshirt-white.png",
      "/assets/deskmat-night.png",
      "/assets/deskmat-day.png",
      "/assets/tumbler-black.png",
      "/assets/tumbler-cream.png",
      "/assets/keycaps.png",
      "/assets/keycap-case.png",
      "/assets/cushion.png",
    ],
    tone: "mint",
  },
  {
    count: "4999개",
    label: "SPECIAL",
    title: "버인굿즈",
    description: "버인 바람막이와 버인 방셀",
    images: [
      "/assets/windbreaker-models.png",
      "/assets/windbreaker-black.png",
      "/assets/windbreaker-white.png",
    ],
    tone: "lavender",
  },
  {
    count: "12482개",
    label: "FULL SET",
    title: "굿즈 풀세트",
    description: "모든 굿즈·모든 색상 풀세트 + 손편지",
    images: [
      "/assets/keyring.png",
      "/assets/tshirt-black.png",
      "/assets/tshirt-white.png",
      "/assets/deskmat-night.png",
      "/assets/deskmat-day.png",
      "/assets/tumbler-black.png",
      "/assets/tumbler-cream.png",
      "/assets/keycaps.png",
      "/assets/keycap-case.png",
      "/assets/cushion.png",
    ],
    tone: "pink",
  },
];

const merchGallery = [
  ["/assets/tshirt-black.png", "블랙 티셔츠"],
  ["/assets/tshirt-white.png", "화이트 티셔츠"],
  ["/assets/deskmat-night.png", "밤 장패드"],
  ["/assets/deskmat-day.png", "낮 장패드"],
  ["/assets/tumbler-black.png", "블랙 텀블러"],
  ["/assets/tumbler-cream.png", "크림 텀블러"],
  ["/assets/keycaps.png", "캐릭터 키캡"],
  ["/assets/keycap-case.png", "키캡 패키지"],
  ["/assets/cushion.png", "뿌기니 쿠션"],
  ["/assets/keyring.png", "미니 아크릴 키링"],
  ["/assets/windbreaker-black.png", "블랙 바람막이"],
  ["/assets/windbreaker-white.png", "화이트 바람막이"],
];

type OutfitPoster = { src: string; origin: string; name: string };
type OutfitCollection = {
  key: string;
  tone: string;
  index: string;
  eyebrow: string;
  title: string;
  note: string;
  cover: string;
  coverAlt: string;
  posters: OutfitPoster[];
};

// 방셀 포스터 원본 매핑 — 5종씩 두 컬렉션.
// 여름/뿌기니 배분을 바꾸려면 아래 posters 배열의 파일명만 옮기면 됩니다.
const poster = (n: number, name: string): OutfitPoster => ({
  src: `/assets/poster/summer-pose-${String(n).padStart(2, "0")}.webp`,
  origin: `/assets/summer-pose-${String(n).padStart(2, "0")}.png`,
  name,
});

const outfitCollections: OutfitCollection[] = [
  {
    key: "summer",
    tone: "blue",
    index: "01",
    eyebrow: "SUMMER LIMITED",
    title: "여름 한정 의상",
    note: "초선 한정의상은 룰렛에서만 구매 가능해요.",
    cover: "/assets/summer-outfits.png",
    coverAlt: "여름 한정 의상 A B C D와 초선",
    posters: [
      poster(1, "여름 A"),
      poster(2, "여름 B"),
      poster(3, "여름 C"),
      poster(4, "여름 D"),
      poster(5, "삼국지 한정 초선"),
    ],
  },
  {
    key: "ppugini",
    tone: "pink",
    index: "02",
    eyebrow: "PPUGINI LIMITED",
    title: "뿌기니 한정 의상",
    note: "각 의상의 디테일과 포즈를 천천히 확인해보세요.",
    cover: "/assets/ppugini-outfits.png",
    coverAlt: "뿌기니 한정 의상 A B C D",
    posters: [
      poster(6, "뿌기니 A"),
      poster(7, "뿌기니 B"),
      poster(8, "뿌기니 C"),
      poster(9, "뿌기니 D"),
      poster(10, "뿌기니 히든"),
    ],
  },
];

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="section-title">
      <span className="section-kicker">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </header>
  );
}

function MainPage({ navigate }: { navigate: (page: PageKey) => void }) {
  return (
    <div className="page-content main-page">
      <section className="editorial-hero">
        <div className="hero-overline">
          <span>KIMFP ARCHIVE</span>
          <span>2026 / SUMMER</span>
        </div>
        <div className="hero-title">
          <h1>
            KIM<em>FP</em>
          </h1>
          <h2>후원 보상 컬렉션</h2>
        </div>
        <div className="hero-lower">
          <p>
            누적공약부터 한정 방셀, 룰렛, 굿즈와 의상까지.
            이번 시즌의 모든 보상을 하나의 아카이브로 정리했습니다.
          </p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => navigate("reward")}>
              REWARD INDEX <span>↗</span>
            </button>
            <button className="soft-button" onClick={() => navigate("outfit")}>
              VIEW LOOKBOOK
            </button>
          </div>
        </div>
        <div className="hero-metrics" aria-label="보상 항목 요약">
          <div><strong>10</strong><span>누적공약</span></div>
          <div><strong>18</strong><span>룰렛 보상</span></div>
          <div><strong>06</strong><span>굿즈 단계</span></div>
          <div><strong>10</strong><span>의상 원본</span></div>
        </div>
        <div className="summer-signal" aria-label="버추얼 여름 시즌 표시">
          <span><i /> VIRTUAL SIGNAL ONLINE</span>
          <div className="signal-bars" aria-hidden="true">
            <b /><b /><b /><b /><b /><b /><b /><b /><b /><b /><b /><b />
          </div>
          <strong>SUMMER CHANNEL · 26</strong>
        </div>
      </section>

      <section className="editorial-index" aria-label="주요 보상 요약">
        <button onClick={() => navigate("promise")}>
          <span>01</span>
          <div><small>CUMULATIVE PROMISE</small><strong>누적공약</strong></div>
          <em>10만 — 300만</em>
          <b>↗</b>
        </button>
        <button onClick={() => navigate("reward")}>
          <span>02</span>
          <div><small>REWARD &amp; ROULETTE</small><strong>방셀보상</strong></div>
          <em>100개 · 11연차</em>
          <b>↗</b>
        </button>
        <button onClick={() => navigate("goods")}>
          <span>03</span>
          <div><small>LIMITED MERCHANDISE</small><strong>굿즈보상</strong></div>
          <em>6 TIERS</em>
          <b>↗</b>
        </button>
      </section>

      <section className="main-lookbook">
        <div className="editorial-heading">
          <div>
            <span>CURATED LOOKS</span>
            <h3>이번 여름의 두 가지 무드</h3>
          </div>
          <button onClick={() => navigate("outfit")}>FULL LOOKBOOK ↗</button>
        </div>
        <div className="outfit-preview-grid">
          <figure>
            <img src="/assets/summer-outfits.png" alt="여름 한정 의상 A부터 D" />
            <figcaption><span>01</span><strong>SUMMER LIMITED</strong></figcaption>
          </figure>
          <figure>
            <img src="/assets/ppugini-outfits.png" alt="뿌기니 한정 의상 A부터 D" />
            <figcaption><span>02</span><strong>PPUGINI LIMITED</strong></figcaption>
          </figure>
        </div>
      </section>

      <section className="main-ledger">
        <article className="reward-ledger">
          <div className="editorial-heading">
            <div><span>FIXED REWARD</span><h3>확정 방셀 단가</h3></div>
            <button onClick={() => navigate("reward")}>DETAIL ↗</button>
          </div>
          <div className="mini-reward-list">
            {fixedRewards.map((reward, index) => (
              <div key={reward.count}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{reward.count}</strong>
                <p>{reward.title}</p>
              </div>
            ))}
          </div>
        </article>
        <article className="goods-feature">
          <div className="goods-feature-copy">
            <span>MERCHANDISE / 06</span>
            <h3>취향으로 완성하는<br />리워드 셀렉션</h3>
            <p>블랙과 크림, 낮과 밤. 단계별 한정 굿즈를 확인해보세요.</p>
            <button onClick={() => navigate("goods")}>EXPLORE GOODS ↗</button>
          </div>
          <div className="goods-feature-images">
            <img src="/assets/tumbler-black.png" alt="블랙 텀블러" />
            <img src="/assets/keycaps.png" alt="캐릭터 키캡" />
            <img src="/assets/keyring.png" alt="미니 아크릴 키링" />
          </div>
        </article>
      </section>
    </div>
  );
}

function PromisePage() {
  const finalPromiseCount = 300;
  const progressPercent = Math.min((currentPromiseCount / finalPromiseCount) * 100, 100);

  return (
    <div className="page-content">
      <SectionTitle
        eyebrow="CUMULATIVE PROMISE"
        title="누적공약"
        description="누적으로 함께 채워가는 김쁘피의 장기 공약이에요."
      />
      <section className="promise-progress">
        <div className="promise-progress-head">
          <div>
            <small>LIVE PROGRESS</small>
            <strong>{currentPromiseCount}만</strong>
            <span>/ {finalPromiseCount}만</span>
          </div>
          <p>완료된 구간은 진하게, 다음 목표는 포인트 색으로 표시됩니다.</p>
          <em>{Math.round(progressPercent)}%</em>
        </div>
        <div className="promise-roadmap-scroll">
          <div
            className="promise-roadmap"
            style={{ "--promise-progress": `${progressPercent}%` } as CSSProperties}
          >
            <div className="promise-track" aria-hidden="true">
              <span />
            </div>
            {promises.map(([count, title], index) => {
              const milestone = Number(count.replace("만", ""));
              const completed = currentPromiseCount >= milestone;
              const next =
                currentPromiseCount < milestone &&
                (index === 0 ||
                  currentPromiseCount >= Number(promises[index - 1][0].replace("만", "")));

              return (
                <article
                  className={`promise-node${completed ? " completed" : ""}${next ? " next" : ""}`}
                  key={count}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <i aria-hidden="true" />
                  <strong>{count}</strong>
                  <h3>{title}</h3>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <div className="promise-footer-note">
        <span>✦</span>
        <div>
          <strong>40만 달성 시 이전 공약 모두 이행</strong>
          <p>정확한 진행 일정과 세부 방식은 방송 공지를 기준으로 확인해주세요.</p>
        </div>
      </div>
    </div>
  );
}

function RewardPage() {
  const rouletteColumns = [roulette.slice(0, 9), roulette.slice(9)];

  return (
    <div className="page-content">
      <SectionTitle
        eyebrow="PERSONAL REWARD"
        title="방셀보상"
        description="확정 방셀 단가와 룰렛 확률을 함께 확인할 수 있습니다."
      />
      <div className="reward-layout">
        <section className="reward-panel fixed-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-number">01</span>
              <small>FIXED REWARD</small>
              <h3>확정 방셀 단가</h3>
            </div>
            <span className="floating-star">✦</span>
          </div>
          <p className="panel-note">
            삼국지 한정 방셀 및 히든 방셀은 룰렛에서만 구매 가능해요.
          </p>
          <div className="fixed-reward-list">
            {fixedRewards.map((reward) => (
              <article className={`fixed-reward ${reward.tone}`} key={reward.count}>
                <strong>{reward.count}</strong>
                <span>{reward.title}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="reward-panel roulette-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-number">02</span>
              <small>DOPAMINE ROULETTE</small>
              <h3>100개 방셀룰렛</h3>
            </div>
            <div className="roulette-badge">
              <strong>11</strong>
              <span>1000개 시 연차</span>
            </div>
          </div>
          <div className="roulette-columns">
            {rouletteColumns.map((column, columnIndex) => (
              <div className="roulette-list" key={columnIndex}>
                {column.map(([title, chance]) => (
                  <div key={title}>
                    <span>{title}</span>
                    <strong>{chance}</strong>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function GoodsPage() {
  return (
    <div className="page-content">
      <SectionTitle
        eyebrow="LIMITED MERCHANDISE"
        title="굿즈보상"
        description="선택형 굿즈부터 모든 색상 풀세트까지 단계별로 정리했습니다."
      />
      <div className="goods-tier-grid">
        {goodsTiers.map((tier) => (
          <article className={`goods-tier ${tier.tone}`} key={tier.count}>
            <div className="goods-tier-copy">
              <small>{tier.label}</small>
              <strong>{tier.count}</strong>
              <h3>{tier.title}</h3>
              <p>{tier.description}</p>
            </div>
            <div
              className={`goods-tier-image goods-count-${tier.images.length}`}
              role="region"
              aria-label={`${tier.title} 상품 이미지`}
              tabIndex={0}
            >
              {tier.images.map((src, imageIndex) => (
                <div className="goods-product-thumb" key={`${tier.count}-${src}`}>
                  <img src={src} alt={`${tier.title} 구성품 ${imageIndex + 1}`} />
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
      <div className="goods-caution">
        <span>!</span>
        <p>
          <strong>굿즈 풀세트 제외 안내</strong>
          버인 바람막이와 버인 방셀은 굿즈 풀세트에서 제외돼요.
        </p>
      </div>
      <section className="merch-gallery-section">
        <div className="subsection-heading">
          <div>
            <span className="section-kicker">MERCH GALLERY</span>
            <h3>전체 굿즈 보기</h3>
          </div>
          <p>상품 사진은 비율에 맞춰 카드 안에 자동으로 정리돼요.</p>
        </div>
        <div className="merch-gallery">
          {merchGallery.map(([src, name]) => (
            <figure key={name}>
              <div>
                <img src={src} alt={name} />
              </div>
              <figcaption>{name}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}

function OutfitPage() {
  const [activeKey, setActiveKey] = useState(outfitCollections[0].key);
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);

  const active =
    outfitCollections.find((collection) => collection.key === activeKey) ??
    outfitCollections[0];
  const posters = active.posters;
  const total = String(posters.length).padStart(2, "0");

  const showCollection = (key: string) => {
    setActiveKey(key);
    setZoomIndex(null);
  };

  const stepZoom = (delta: number) =>
    setZoomIndex((current) =>
      current === null
        ? current
        : (current + delta + posters.length) % posters.length,
    );

  useEffect(() => {
    if (zoomIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoomIndex(null);
      if (event.key === "ArrowLeft") stepZoom(-1);
      if (event.key === "ArrowRight") stepZoom(1);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [zoomIndex, posters.length]);

  const zoomed = zoomIndex === null ? null : posters[zoomIndex];

  return (
    <div className="page-content">
      <SectionTitle
        eyebrow="SUMMER LOOKBOOK"
        title="한정의상"
        description="사진을 누르면 해당 컬렉션의 방셀 포스터 5종이 아래에 펼쳐집니다."
      />
      <div className="lookbook-grid">
        {outfitCollections.map((collection) => {
          const selected = collection.key === active.key;

          return (
            <article
              className={`lookbook-card ${collection.tone}${selected ? " selected" : ""}`}
              key={collection.key}
            >
              <div className="lookbook-label">
                <span>{collection.index}</span>
                <div>
                  <small>{collection.eyebrow}</small>
                  <h3>{collection.title}</h3>
                </div>
                <b className="lookbook-flag">{selected ? "SHOWING" : "05종"}</b>
              </div>
              <button
                type="button"
                className="lookbook-image"
                onClick={() => showCollection(collection.key)}
                aria-pressed={selected}
                aria-label={`${collection.title} 방셀 포스터 5종 보기`}
              >
                <img src={collection.cover} alt={collection.coverAlt} />
                <span className="lookbook-cue">
                  {selected ? "◈ 아래에서 보는 중" : "포스터 5종 보기 ↓"}
                </span>
              </button>
              <p>{collection.note}</p>
            </article>
          );
        })}
      </div>
      <section className="poster-section">
        <div className="subsection-heading">
          <div>
            <span className="section-kicker">{active.eyebrow} · POSTER</span>
            <h3>{active.title} 원본 {posters.length}종</h3>
          </div>
          <div className="carousel-count">
            <strong>{total}</strong>
            <span>/ {total}</span>
          </div>
        </div>
        <div className="poster-switch" role="tablist" aria-label="의상 컬렉션 선택">
          {outfitCollections.map((collection) => (
            <button
              type="button"
              key={collection.key}
              role="tab"
              aria-selected={collection.key === active.key}
              className={collection.key === active.key ? "active" : ""}
              onClick={() => showCollection(collection.key)}
            >
              {collection.title}
            </button>
          ))}
        </div>
        <div className="poster-grid" key={active.key}>
          {posters.map((item, index) => (
            <button
              type="button"
              className="poster-tile"
              key={item.src}
              style={{ "--poster-delay": `${index * 55}ms` } as CSSProperties}
              onClick={() => setZoomIndex(index)}
              aria-label={`${item.name} 크게 보기`}
            >
              <span className="poster-grid-lines" aria-hidden="true" />
              <img src={item.src} alt={item.name} loading="lazy" />
              <span className="poster-frame-line" aria-hidden="true" />
              <span className="poster-top">
                <span className="poster-serial">
                  {active.index}
                  <i>/</i>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="poster-badge">{active.eyebrow.split(" ")[0]}</span>
              </span>
              <span className="poster-bottom">
                <span className="poster-rule" aria-hidden="true" />
                <strong>{item.name}</strong>
                <em>ZOOM ↗</em>
              </span>
            </button>
          ))}
        </div>
      </section>

      {zoomed && (
        <div
          className="poster-viewer"
          role="dialog"
          aria-modal="true"
          aria-label={`${zoomed.name} 확대 보기`}
          onClick={() => setZoomIndex(null)}
        >
          <div
            className="poster-viewer-inner"
            onClick={(event: ReactMouseEvent) => event.stopPropagation()}
          >
            <button
              type="button"
              className="poster-viewer-nav"
              onClick={() => stepZoom(-1)}
              aria-label="이전 의상 보기"
            >
              ←
            </button>
            <figure>
              <img src={zoomed.src} alt={zoomed.name} />
              <figcaption>
                <span>{active.eyebrow}</span>
                <strong>{zoomed.name}</strong>
                <em>
                  {String((zoomIndex ?? 0) + 1).padStart(2, "0")} / {total}
                </em>
                <a href={zoomed.origin} target="_blank" rel="noreferrer">
                  원본 4K 열기 ↗
                </a>
              </figcaption>
            </figure>
            <button
              type="button"
              className="poster-viewer-nav"
              onClick={() => stepZoom(1)}
              aria-label="다음 의상 보기"
            >
              →
            </button>
            <button
              type="button"
              className="poster-viewer-close"
              onClick={() => setZoomIndex(null)}
              aria-label="닫기"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [activePage, setActivePage] = useState<PageKey>("main");
  const viewMode: ViewMode = "ipad";
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const activeNav = useMemo(
    () => navItems.find((item) => item.key === activePage) ?? navItems[0],
    [activePage],
  );

  useEffect(() => {
    document.body.classList.add("ready");
    return () => document.body.classList.remove("ready");
  }, []);

  useEffect(() => {
    document.body.dataset.viewMode = viewMode;
    return () => {
      delete document.body.dataset.viewMode;
    };
  }, [viewMode]);

  useEffect(() => {
    if (!lightbox) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [lightbox]);

  const navigate = (page: PageKey) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.querySelector<HTMLElement>(".ipad-scroll-area")?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const openImageModal = (event: ReactMouseEvent<HTMLElement>) => {
    const image = event.target instanceof HTMLImageElement ? event.target : null;
    if (!image || image.closest("button")) return;

    setLightbox({
      src: image.currentSrc || image.src,
      alt: image.alt || "확대 이미지",
    });
  };

  return (
    <div
      className="view-experience"
      data-view={viewMode}
      data-archive-theme={viewMode === "original" ? "legacy" : undefined}
    >
      <div className="ipad-device">
        <div className="ipad-screen">
          {viewMode === "ipad" && (
            <div className="ipad-status-bar" aria-hidden="true">
              <strong>9:41</strong>
              <span className="ipad-status-title">김쁘피 보상 아카이브</span>
              <div className="ipad-status-icons">
                <i className="ipad-cellular" />
                <svg
                  className="ipad-wifi"
                  viewBox="0 0 20 14"
                  role="presentation"
                  focusable="false"
                >
                  <path d="M3.64 5.64a9 9 0 0 1 12.72 0" />
                  <path d="M5.76 7.76a6 6 0 0 1 8.48 0" />
                  <path d="M7.88 9.88a3 3 0 0 1 4.24 0" />
                </svg>
                <i className="ipad-battery"><b /></i>
              </div>
            </div>
          )}

          <div className="ipad-scroll-area">
            <div className="site-shell" data-theme="editorial">
              <aside className="side-navigation">
                <div className="brand-block ipad-archive-brand">
                  <div>
                    <strong>KIMFP</strong>
                    <span>REWARD ARCHIVE</span>
                  </div>
                </div>
                <nav aria-label="페이지 메뉴">
                  {navItems.map((item) => (
                    <button
                      key={item.key}
                      className={activePage === item.key ? "active" : ""}
                      onClick={() => navigate(item.key)}
                      aria-current={activePage === item.key ? "page" : undefined}
                    >
                      <span className="nav-mark">{item.mark}</span>
                      <span>
                        <small>{item.eyebrow}</small>
                        <strong>{item.label}</strong>
                      </span>
                      <span className="nav-dot" />
                    </button>
                  ))}
                </nav>
                <div className="side-note">
                  <span>VIRTUAL SUMMER 2026</span>
                  <strong>후원 보상<br />안내 페이지</strong>
                </div>
              </aside>

              <main className="content-sheet" onClick={openImageModal}>
                <header className="mobile-header">
                  <div className="brand-block">
                    <div>
                      <strong>김쁘피</strong>
                      <span>{activeNav.eyebrow}</span>
                    </div>
                  </div>
                  <div className="mobile-page-label">{activeNav.label}</div>
                </header>
                <nav className="mobile-nav" aria-label="모바일 페이지 메뉴">
                  {navItems.map((item) => (
                    <button
                      key={item.key}
                      className={activePage === item.key ? "active" : ""}
                      onClick={() => navigate(item.key)}
                    >
                      <span>{item.mark}</span>
                      {item.label}
                    </button>
                  ))}
                </nav>

                {activePage === "main" && <MainPage navigate={navigate} />}
                {activePage === "promise" && <PromisePage />}
                {activePage === "reward" && <RewardPage />}
                {activePage === "goods" && <GoodsPage />}
                {activePage === "outfit" && <OutfitPage />}

                <footer className="site-footer">
                  <span>KIMFP · REWARD ARCHIVE</span>
                  <strong>SUMMER 2026</strong>
                </footer>
              </main>
            </div>
          </div>

          {viewMode === "ipad" && (
            <nav className="ipad-dock" aria-label="아이패드 빠른 메뉴">
              {navItems.map((item, index) => (
                <button
                  key={item.key}
                  type="button"
                  className={activePage === item.key ? "active" : ""}
                  onClick={() => navigate(item.key)}
                  aria-label={item.label}
                  title={item.label}
                >
                  <span data-color={index + 1}>{item.mark}</span>
                </button>
              ))}
            </nav>
          )}
        </div>
        <span className="ipad-home-indicator" aria-hidden="true" />
      </div>

      {lightbox && (
        <div
          className="image-modal"
          role="dialog"
          aria-modal="true"
          aria-label="확대 이미지"
          onClick={() => setLightbox(null)}
        >
          <button
            className="image-modal-close"
            type="button"
            aria-label="확대 이미지 닫기"
            onClick={() => setLightbox(null)}
          >
            ×
          </button>
          <div className="image-modal-frame" onClick={(event) => event.stopPropagation()}>
            <img src={lightbox.src} alt={lightbox.alt} />
          </div>
        </div>
      )}
    </div>
  );
}
