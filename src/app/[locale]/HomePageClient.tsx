"use client";

import { useState, Suspense, lazy } from "react";
import {
  ArrowRight,
  Axe,
  BadgeCheck,
  Castle,
  Check,
  ChevronDown,
  Clock,
  Compass,
  Crosshair,
  ExternalLink,
  Flag,
  Gauge,
  Gift,
  GitMerge,
  Hash,
  Hourglass,
  Laptop,
  Layers,
  Link2,
  MessageCircle,
  MonitorSmartphone,
  Mountain,
  Newspaper,
  PlayCircle,
  Rocket,
  Server,
  ShieldCheck,
  Sparkles,
  Swords,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Wifi,
  Wheat,
} from "lucide-react";
import Link from "next/link";
import { useMessages } from "next-intl";
import { VideoFeature } from "@/components/home/VideoFeature";
import { LatestGuidesAccordion } from "@/components/home/LatestGuidesAccordion";
import { NativeBannerAd, AdBanner } from "@/components/ads";
import { getPreferredMobileBannerSelection } from "@/components/ads/mobileAdConfigs";
import { scrollToSection } from "@/lib/scrollToSection";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { ContentItemWithType } from "@/lib/getLatestArticles";
import type { ModuleLinkMap } from "@/lib/buildModuleLinkMap";

// Per-card icon sets for Modules 5-8 (each item uses a distinct icon).
// Defined module-level so the icons stay stable across renders.
const pvpCombatIcons = [
  Crosshair,
  ShieldCheck,
  MonitorSmartphone,
  Wifi,
  TrendingUp,
];
const raidsIcons = [Hourglass, Target, GitMerge, Mountain, Gauge];
const farmingIcons = [Axe, Server, Users, Flag, Rocket];
const updatesIcons = [
  BadgeCheck,
  Layers,
  Hash,
  Laptop,
  MessageCircle,
  PlayCircle,
];

// Lazy load heavy components
const HeroStats = lazy(() => import("@/components/home/HeroStats"));
const FAQSection = lazy(() => import("@/components/home/FAQSection"));
const CTASection = lazy(() => import("@/components/home/CTASection"));

// Loading placeholder
const LoadingPlaceholder = ({ height = "h-64" }: { height?: string }) => (
  <div
    className={`${height} bg-white/5 border border-border rounded-xl animate-pulse`}
  />
);

// Conditionally render text as a link or plain span
function LinkedTitle({
  linkData,
  children,
  className,
  locale,
}: {
  linkData: { url: string; title: string } | null | undefined;
  children: React.ReactNode;
  className?: string;
  locale: string;
}) {
  if (linkData) {
    const href = locale === "en" ? linkData.url : `/${locale}${linkData.url}`;
    return (
      <Link
        href={href}
        className={`${className || ""} hover:text-[hsl(var(--nav-theme-light))] hover:underline decoration-[hsl(var(--nav-theme-light))/0.4] underline-offset-4 transition-colors`}
        title={linkData.title}
      >
        {children}
      </Link>
    );
  }
  return <>{children}</>;
}

interface HomePageClientProps {
  latestArticles: ContentItemWithType[];
  moduleLinkMap: ModuleLinkMap;
  locale: string;
}

export default function HomePageClient({
  latestArticles,
  moduleLinkMap,
  locale,
}: HomePageClientProps) {
  const t = useMessages() as any;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.battlepiece.wiki";

  // Structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Battle Piece Wiki",
        description:
          "Battle Piece Wiki with updated codes, powers, weapons, traits, raids, PvP, and leveling guides for the anime Roblox adventure by Studio Multiverse.",
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Battle Piece - Anime Roblox Adventure RPG",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Battle Piece Wiki",
        alternateName: "Battle Piece",
        url: siteUrl,
        description:
          "Battle Piece Wiki resource hub for codes, powers, weapons, traits, raids, PvP, and leveling guides for the anime Roblox adventure",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/android-chrome-512x512.png`,
          width: 512,
          height: 512,
        },
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Battle Piece Wiki - Anime Roblox Adventure RPG",
        },
        sameAs: [
          "https://www.roblox.com/games/98662768290911/Battle-Piece",
          "https://www.roblox.com/communities/903561179/Studio-Multiverse",
          "https://www.youtube.com/watch?v=iTPzGAWfwos",
        ],
      },
      {
        "@type": "VideoGame",
        name: "Battle Piece",
        gamePlatform: ["PC", "Roblox"],
        applicationCategory: "Game",
        genre: ["Action RPG", "Adventure", "Anime"],
        numberOfPlayers: {
          minValue: 1,
          maxValue: 100,
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://www.roblox.com/games/98662768290911/Battle-Piece",
        },
      },
      {
        "@type": "VideoObject",
        name: "Battle Piece - Sukuna Update Trailer",
        description:
          "Battle Piece gameplay and Sukuna update trailer showcasing the anime Roblox adventure.",
        uploadDate: "2026-06-20",
        thumbnailUrl: `${siteUrl}/images/hero.webp`,
        embedUrl: "https://www.youtube.com/embed/iTPzGAWfwos",
        url: "https://www.youtube.com/watch?v=iTPzGAWfwos",
      },
    ],
  };

  // Raids accordion state (also reused by FAQ expansion)
  const [raidsExpanded, setRaidsExpanded] = useState<number | null>(null);
  const mobileBannerAd = getPreferredMobileBannerSelection();

  // Tools Grid 卡片 → 模块 section 锚点（1:1 对应）
  const toolsSectionIds = [
    "codes",
    "official-links",
    "beginner-guide",
    "tier-list",
    "pvp-combat",
    "raids",
    "farming",
    "updates",
  ];

  return (
    <div className="home-shell min-h-screen bg-background text-foreground">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 广告位 1: 顶部固定横幅 */}
      <div className="sticky top-20 z-20 border-b border-border py-2">
        <AdBanner type="banner-320x50" adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50} />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-24 pb-14 md:pt-32 md:pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 scroll-reveal">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 md:px-4 md:py-2
                            bg-[hsl(var(--nav-theme)/0.1)]
                            border border-[hsl(var(--nav-theme)/0.3)] mb-4 md:mb-6"
            >
              <Sparkles className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-xs md:text-sm font-medium">
                {t.hero.badge}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 leading-[1.05]">
              {t.hero.title}
            </h1>

            {/* Description */}
            <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg md:mb-10 md:max-w-3xl md:text-2xl">
              {t.hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row md:mb-12 md:gap-4">
              <button
                onClick={() => scrollToSection("codes")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           bg-[hsl(var(--nav-theme))] hover:bg-[hsl(var(--nav-theme)/0.9)]
                           text-white rounded-lg font-semibold text-base md:text-lg transition-colors"
              >
                <Gift className="w-5 h-5" />
                {t.hero.getFreeCodesCTA}
              </button>
              <a
                href="https://www.roblox.com/games/98662768290911/Battle-Piece"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           border border-border hover:bg-white/10 rounded-lg
                           font-semibold text-base md:text-lg transition-colors"
              >
                {t.hero.playOnRobloxCTA}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <Suspense fallback={<LoadingPlaceholder height="h-32" />}>
            <HeroStats stats={Object.values(t.hero.stats)} />
          </Suspense>
        </div>
      </section>

      {/* Video Section */}
      <section className="px-4 py-10 md:py-12">
        <div className="scroll-reveal container mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl">
            <VideoFeature
              videoId="iTPzGAWfwos"
              title="Battle Piece Sukuna Update"
            />
          </div>
        </div>
      </section>

      {/* Tools Grid - 8 Navigation Cards（前半屏顺序：Hero → Video → Tools Grid） */}
      <section className="px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.tools.title}{" "}
              <span className="text-[hsl(var(--nav-theme-light))]">
                {t.tools.titleHighlight}
              </span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              {t.tools.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {t.tools.cards.map((card: any, index: number) => {
              const sectionId = toolsSectionIds[index];
              return (
                <button
                  key={index}
                  onClick={() => scrollToSection(sectionId)}
                  className="scroll-reveal group rounded-xl border border-border p-4 md:p-6
                             bg-card hover:border-[hsl(var(--nav-theme)/0.5)]
                             transition-all duration-300 cursor-pointer text-left
                             hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className="mb-3 h-10 w-10 rounded-lg md:mb-4 md:h-12 md:w-12
                                  bg-[hsl(var(--nav-theme)/0.1)]
                                  flex items-center justify-center
                                  group-hover:bg-[hsl(var(--nav-theme)/0.2)]
                                  transition-colors"
                  >
                    <DynamicIcon
                      name={card.icon}
                      className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--nav-theme-light))]"
                    />
                  </div>
                  <h3 className="mb-1.5 text-sm md:text-base font-semibold">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Latest Updates Section */}
      <LatestGuidesAccordion
        articles={latestArticles}
        locale={locale}
        max={12}
      />

      {/* 广告位 2: 首屏内容之后再加载广告 */}
      <NativeBannerAd adKey={process.env.NEXT_PUBLIC_AD_NATIVE_BANNER || ""} />

      {/* 广告位 3: 移动端优先使用方形，桌面端保留横幅 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Module 1: Battle Piece Codes */}
      <section id="codes" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-4 bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] text-xs md:text-sm font-medium">
              <Gift className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              {t.modules.battlePieceCodes.eyebrow}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle
                linkData={moduleLinkMap["battlePieceCodes"]}
                locale={locale}
              >
                {t.modules.battlePieceCodes.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.battlePieceCodes.intro}
            </p>
          </div>

          {/* Active Codes */}
          <div className="scroll-reveal mb-6 md:mb-8">
            <h3 className="text-lg md:text-xl font-bold mb-3 flex items-center gap-2">
              <Check className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
              {t.modules.battlePieceCodes.activeHeading}
            </h3>
            <div className="p-4 md:p-6 bg-white/5 border border-border rounded-xl text-sm md:text-base text-muted-foreground">
              {t.modules.battlePieceCodes.activeEmpty}
            </div>
          </div>

          {/* Expired Codes */}
          <div className="scroll-reveal mb-6 md:mb-8">
            <h3 className="text-lg md:text-xl font-bold mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
              {t.modules.battlePieceCodes.expiredHeading}
            </h3>
            <div className="p-4 md:p-6 bg-white/5 border border-border rounded-xl text-sm md:text-base text-muted-foreground">
              {t.modules.battlePieceCodes.expiredEmpty}
            </div>
          </div>

          {/* Official Sources */}
          <div className="scroll-reveal mb-6 md:mb-8">
            <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">
              {t.modules.battlePieceCodes.sourcesHeading}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {t.modules.battlePieceCodes.sources.map(
                (source: any, index: number) => (
                  <a
                    key={index}
                    href={source.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors block"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
                        {source.label}
                      </span>
                      <ExternalLink className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
                    </div>
                    <h4 className="font-bold text-base md:text-lg mb-1">
                      {source.value}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {source.detail}
                    </p>
                  </a>
                ),
              )}
            </div>
          </div>

          {/* Redeem-Check Workflow */}
          <div className="scroll-reveal">
            <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">
              {t.modules.battlePieceCodes.workflowHeading}
            </h3>
            <div className="space-y-3 md:space-y-4">
              {t.modules.battlePieceCodes.workflow.map(
                (step: string, index: number) => (
                  <div
                    key={index}
                    className="flex gap-3 md:gap-4 p-4 md:p-5 bg-white/5 border border-border rounded-xl"
                  >
                    <div className="flex h-9 w-9 md:h-10 md:w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)]">
                      <span className="text-sm md:text-base font-bold text-[hsl(var(--nav-theme-light))]">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground pt-1.5">
                      {step}
                    </p>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 广告位 4: 第一模块之后的阅读停顿位 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* Module 2: Battle Piece Official Roblox Link */}
      <section
        id="official-links"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-4 bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] text-xs md:text-sm font-medium">
              <Link2 className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              {t.modules.battlePieceOfficialLinks.eyebrow}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle
                linkData={moduleLinkMap["battlePieceOfficialLinks"]}
                locale={locale}
              >
                {t.modules.battlePieceOfficialLinks.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.battlePieceOfficialLinks.intro}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.modules.battlePieceOfficialLinks.cards.map(
              (card: any, index: number) => {
                const inner = (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
                        {card.label}
                      </span>
                      {card.href && (
                        <ExternalLink className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
                      )}
                    </div>
                    <h3 className="font-bold text-lg md:text-xl mb-2 text-[hsl(var(--nav-theme-light))]">
                      {card.value}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {card.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {card.badges.map((b: string, i: number) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 rounded bg-[hsl(var(--nav-theme)/0.15)] text-[hsl(var(--nav-theme-light))]"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </>
                );
                if (card.href) {
                  return (
                    <a
                      key={index}
                      href={card.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-5 md:p-6 bg-card border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors block"
                    >
                      {inner}
                    </a>
                  );
                }
                return (
                  <div
                    key={index}
                    className="p-5 md:p-6 bg-card border border-border rounded-xl"
                  >
                    {inner}
                  </div>
                );
              },
            )}
          </div>

          <div className="scroll-reveal text-center mt-8 md:mt-10">
            <a
              href="https://www.roblox.com/games/98662768290911/Battle-Piece"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-3.5 bg-[hsl(var(--nav-theme))] hover:bg-[hsl(var(--nav-theme)/0.9)] text-white rounded-lg font-semibold transition-colors"
            >
              <Gift className="w-5 h-5" />
              {t.modules.battlePieceOfficialLinks.playLabel}
            </a>
          </div>
        </div>
      </section>

      {/* Module 3: Battle Piece Beginner Guide */}
      <section id="beginner-guide" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-4 bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] text-xs md:text-sm font-medium">
              <Compass className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              {t.modules.battlePieceBeginnerGuide.eyebrow}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle
                linkData={moduleLinkMap["battlePieceBeginnerGuide"]}
                locale={locale}
              >
                {t.modules.battlePieceBeginnerGuide.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.battlePieceBeginnerGuide.intro}
            </p>
          </div>

          <div className="scroll-reveal space-y-3 md:space-y-4">
            {t.modules.battlePieceBeginnerGuide.steps.map(
              (step: any, index: number) => (
                <div
                  key={index}
                  className="flex gap-3 md:gap-4 p-4 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                >
                  <div className="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)]">
                    <span className="text-base md:text-xl font-bold text-[hsl(var(--nav-theme-light))]">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold mb-1.5 md:mb-2">
                      {step.heading}
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground mb-2">
                      {step.body}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
                      <Check className="w-3.5 h-3.5 text-[hsl(var(--nav-theme-light))]" />
                      {t.modules.battlePieceBeginnerGuide.goalLabel}: {step.goal}
                    </span>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Module 4: Battle Piece Weapons and Powers Tier List */}
      <section
        id="tier-list"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-4 bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] text-xs md:text-sm font-medium">
              <Trophy className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              {t.modules.battlePieceTierList.eyebrow}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle
                linkData={moduleLinkMap["battlePieceTierList"]}
                locale={locale}
              >
                {t.modules.battlePieceTierList.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.battlePieceTierList.intro}
            </p>
          </div>

          <div className="scroll-reveal space-y-4 md:space-y-5">
            {t.modules.battlePieceTierList.tiers.map(
              (tier: any, index: number) => {
                const scoreKeys = Object.keys(tier.scores);
                return (
                  <div
                    key={index}
                    className="p-4 md:p-6 bg-white/5 border border-border rounded-xl"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-4">
                      <span className="flex h-12 w-12 md:h-14 md:w-14 flex-shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--nav-theme))] text-white text-xl md:text-2xl font-bold">
                        {tier.tier}
                      </span>
                      <div>
                        <h3 className="text-lg md:text-xl font-bold">
                          {tier.name}
                        </h3>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          {tier.category}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
                      {scoreKeys.map((key: string) => {
                        const val = tier.scores[key];
                        const pct = (val / 5) * 100;
                        return (
                          <div key={key}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">
                                {t.modules.battlePieceTierList.scoreLabels[key]}
                              </span>
                              <span className="font-semibold">{val}/5</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[hsl(var(--nav-theme))]"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {tier.bestFor.map((bf: string, i: number) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]"
                        >
                          <Check className="w-3 h-3 text-[hsl(var(--nav-theme-light))]" />
                          {bf}
                        </span>
                      ))}
                    </div>

                    <p className="text-sm text-muted-foreground">{tier.why}</p>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* 广告位 6: 移动端横幅 320×50 */}
      {mobileBannerAd && (
        <AdBanner type={mobileBannerAd.type} adKey={mobileBannerAd.adKey} />
      )}

      {/* Module 5: Battle Piece PvP Combat Guide */}
      <section id="pvp-combat" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-4 bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] text-xs md:text-sm font-medium">
              <Swords className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              {t.modules.battlePiecePvpCombat.eyebrow}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle
                linkData={moduleLinkMap["battlePiecePvpCombat"]}
                locale={locale}
              >
                {t.modules.battlePiecePvpCombat.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.battlePiecePvpCombat.intro}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.modules.battlePiecePvpCombat.cards.map(
              (card: any, index: number) => {
                const CardIcon = pvpCombatIcons[index];
                return (
                  <div
                    key={index}
                    className="p-5 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                  >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--nav-theme)/0.1)]">
                      <CardIcon className="h-5 w-5 text-[hsl(var(--nav-theme-light))]" />
                    </div>
                    <h3 className="font-bold text-lg md:text-xl mb-2 text-[hsl(var(--nav-theme-light))]">
                      {card.title}
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground">
                      {card.description}
                    </p>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* Module 6: Battle Piece Raids and Boss Progression Guide */}
      <section
        id="raids"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-4 bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] text-xs md:text-sm font-medium">
              <Castle className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              {t.modules.battlePieceRaidsGuide.eyebrow}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle
                linkData={moduleLinkMap["battlePieceRaidsGuide"]}
                locale={locale}
              >
                {t.modules.battlePieceRaidsGuide.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.battlePieceRaidsGuide.intro}
            </p>
          </div>

          <div className="scroll-reveal space-y-3">
            {t.modules.battlePieceRaidsGuide.items.map(
              (item: any, index: number) => {
                const ItemIcon = raidsIcons[index];
                return (
                  <div
                    key={index}
                    className="bg-white/5 border border-border rounded-xl overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setRaidsExpanded(raidsExpanded === index ? null : index)
                      }
                      className="w-full flex items-center justify-between gap-3 p-4 md:p-5 text-left hover:bg-white/5 transition-colors"
                    >
                      <span className="flex items-center gap-3 pr-2">
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--nav-theme)/0.1)]">
                          <ItemIcon className="h-4 w-4 text-[hsl(var(--nav-theme-light))]" />
                        </span>
                        <span className="font-semibold text-base md:text-lg">
                          {item.question}
                        </span>
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 flex-shrink-0 transition-transform ${raidsExpanded === index ? "rotate-180" : ""}`}
                      />
                    </button>
                    {raidsExpanded === index && (
                      <div className="px-4 md:px-5 pb-4 md:pb-5 text-sm md:text-base text-muted-foreground">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* Module 7: Battle Piece Bandits and Farming Guide */}
      <section id="farming" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-4 bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] text-xs md:text-sm font-medium">
              <Wheat className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              {t.modules.battlePieceBanditsFarming.eyebrow}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle
                linkData={moduleLinkMap["battlePieceBanditsFarming"]}
                locale={locale}
              >
                {t.modules.battlePieceBanditsFarming.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.battlePieceBanditsFarming.intro}
            </p>
          </div>

          <div className="scroll-reveal overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm md:text-base">
              <thead className="bg-[hsl(var(--nav-theme)/0.1)]">
                <tr>
                  <th className="text-left p-3 md:p-4 font-semibold whitespace-nowrap">
                    {t.modules.battlePieceBanditsFarming.columns.activity}
                  </th>
                  <th className="text-left p-3 md:p-4 font-semibold">
                    {t.modules.battlePieceBanditsFarming.columns.purpose}
                  </th>
                  <th className="text-left p-3 md:p-4 font-semibold">
                    {t.modules.battlePieceBanditsFarming.columns.action}
                  </th>
                  <th className="text-left p-3 md:p-4 font-semibold">
                    {t.modules.battlePieceBanditsFarming.columns.bestFor}
                  </th>
                </tr>
              </thead>
              <tbody>
                {t.modules.battlePieceBanditsFarming.rows.map(
                  (row: any, index: number) => {
                    const RowIcon = farmingIcons[index];
                    return (
                      <tr key={index} className="border-t border-border">
                        <td className="p-3 md:p-4 font-medium align-top whitespace-nowrap">
                          <span className="inline-flex items-center gap-2">
                            <RowIcon className="h-4 w-4 flex-shrink-0 text-[hsl(var(--nav-theme-light))]" />
                            {row.activity}
                          </span>
                        </td>
                        <td className="p-3 md:p-4 text-muted-foreground align-top">
                          {row.purpose}
                        </td>
                        <td className="p-3 md:p-4 text-muted-foreground align-top">
                          {row.action}
                        </td>
                        <td className="p-3 md:p-4 text-[hsl(var(--nav-theme-light))] align-top">
                          {row.bestFor}
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Module 8: Battle Piece Updates, Community, and Patch Tracker */}
      <section
        id="updates"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-4 bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] text-xs md:text-sm font-medium">
              <Newspaper className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              {t.modules.battlePieceUpdatesTracker.eyebrow}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle
                linkData={moduleLinkMap["battlePieceUpdatesTracker"]}
                locale={locale}
              >
                {t.modules.battlePieceUpdatesTracker.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.battlePieceUpdatesTracker.intro}
            </p>
          </div>

          <div className="scroll-reveal relative">
            <div className="absolute left-4 md:left-5 top-2 bottom-2 w-px bg-[hsl(var(--nav-theme)/0.3)]" />
            <div className="space-y-5 md:space-y-6">
              {t.modules.battlePieceUpdatesTracker.entries.map(
                (entry: any, index: number) => {
                  const EntryIcon = updatesIcons[index];
                  return (
                    <div key={index} className="relative pl-12 md:pl-14">
                      <span className="absolute left-0 flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-[hsl(var(--nav-theme)/0.15)] border border-[hsl(var(--nav-theme)/0.4)]">
                        <EntryIcon className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] mb-1.5 inline-block">
                        {entry.label}
                      </span>
                      <h3 className="font-bold text-base md:text-lg mb-1">
                        {entry.title}
                      </h3>
                      <p className="text-sm md:text-base text-muted-foreground">
                        {entry.description}
                      </p>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <FAQSection
          title={t.faq.title}
          titleHighlight={t.faq.titleHighlight}
          subtitle={t.faq.subtitle}
          questions={t.faq.questions}
        />
      </Suspense>

      {/* CTA Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <CTASection
          title={t.cta.title}
          description={t.cta.description}
          joinCommunity={t.cta.joinCommunity}
          joinGame={t.cta.joinGame}
        />
      </Suspense>

      {/* Ad Banner 3 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Footer */}
      <footer className="bg-white/[0.02] border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-[hsl(var(--nav-theme-light))]">
                {t.footer.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.footer.description}
              </p>
            </div>

            {/* Community - External Links Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.community}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://www.roblox.com/games/98662768290911/Battle-Piece"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.robloxGame}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.roblox.com/communities/903561179/Studio-Multiverse"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.robloxGroup}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.youtube.com/watch?v=iTPzGAWfwos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.youtube}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal - Internal Routes Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/copyright"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.copyrightNotice}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Copyright */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {t.footer.copyright}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.footer.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
