import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { AmbientCanvas } from './AmbientCanvas';
import {
  X,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Target,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sliders,
  DollarSign,
  PieChart,
  Users,
  CheckCircle2,
  Play,
  Pause,
  Scan,
  Brain,
  Compass,
  Coins,
  Clock,
  Flame,
  RefreshCw,
  FileText,
  Award,
  CreditCard,
  Layers,
  Radar,
  Smartphone,
  Lock,
  Workflow,
  BarChart3,
  CalendarCheck,
  Lightbulb,
} from 'lucide-react';

interface Presentation2026Props {
  onClose: () => void;
}

export const Presentation2026: React.FC<Presentation2026Props> = ({ onClose }) => {
  const { language, setActiveTab } = useApp();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoPlaySpeed] = useState<number>(8);
  const [autoPlayProgress, setAutoPlayProgress] = useState<number>(0);

  // Interactive Feature Demo States (No real user data - Pure interactive demos)
  const [demoReceiptScanning, setDemoReceiptScanning] = useState(false);
  const [demoCurrencyAmount, setDemoCurrencyAmount] = useState<number>(100);
  const [demoSelectedCurrency, setDemoSelectedCurrency] = useState<'USD' | 'EUR'>('USD');
  const [simIncomeBoost, setSimIncomeBoost] = useState<number>(15);
  const [simExpenseCut, setSimExpenseCut] = useState<number>(15);
  const [selectedParetoTier, setSelectedParetoTier] = useState<'A' | 'B' | 'C'>('A');

  const totalSlides = 8;
  const slideContainerRef = useRef<HTMLDivElement | null>(null);
  const isTransitioningRef = useRef(false);

  // Harmonic Chord Synthesizer (Web Audio API)
  const playHarmonicChime = useCallback((chordType: 'advance' | 'action' = 'advance') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const freqs =
        chordType === 'advance'
          ? [523.25, 659.25, 783.99, 1046.5] // C Major: C5, E5, G5, C6
          : [659.25, 830.61, 987.77, 1318.51]; // E Major: E5, G#5, B5, E6

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteTime = ctx.currentTime + idx * 0.05;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.0001, noteTime);
        gain.gain.linearRampToValueAtTime(0.04, noteTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.32);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(noteTime);
        osc.stop(noteTime + 0.35);
      });
    } catch {
      // Audio context might be restricted
    }
  }, [soundEnabled]);

  const goToSlide = useCallback((index: number) => {
    if (index < 0 || index >= totalSlides) return;
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setCurrentSlide(index);
    setAutoPlayProgress(0);
    playHarmonicChime('advance');
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 450);
  }, [playHarmonicChime, totalSlides]);

  const nextSlide = useCallback(() => {
    goToSlide(Math.min(totalSlides - 1, currentSlide + 1));
  }, [currentSlide, goToSlide, totalSlides]);

  const prevSlide = useCallback(() => {
    goToSlide(Math.max(0, currentSlide - 1));
  }, [currentSlide, goToSlide]);

  // Trackpad / Wheel gesture
  useEffect(() => {
    let accumulatedDelta = 0;
    let resetTimer: NodeJS.Timeout;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      accumulatedDelta += e.deltaY;
      clearTimeout(resetTimer);

      if (Math.abs(accumulatedDelta) > 50) {
        if (accumulatedDelta > 0) nextSlide();
        else prevSlide();
        accumulatedDelta = 0;
      }

      resetTimer = setTimeout(() => {
        accumulatedDelta = 0;
      }, 250);
    };

    const container = slideContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
      clearTimeout(resetTimer);
    };
  }, [nextSlide, prevSlide]);

  // Touch Swipe
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;

      if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) nextSlide();
        else prevSlide();
      } else if (Math.abs(diffY) > 40 && Math.abs(diffY) > Math.abs(diffX)) {
        if (diffY > 0) nextSlide();
        else prevSlide();
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [nextSlide, prevSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, onClose]);

  // Autoplay progression
  useEffect(() => {
    if (!autoPlay) {
      setAutoPlayProgress(0);
      return;
    }

    const intervalTime = 100;
    const totalSteps = (autoPlaySpeed * 1000) / intervalTime;

    const timer = setInterval(() => {
      setAutoPlayProgress(prev => {
        if (prev >= 100) {
          setCurrentSlide(curr => (curr + 1) % totalSlides);
          playHarmonicChime('advance');
          return 0;
        }
        return prev + 100 / totalSteps;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [autoPlay, autoPlaySpeed, playHarmonicChime, totalSlides]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // 8 Feature-Focused Slide Titles & Metadata
  const slideTitles = [
    { title: 'Экотизим ва Архитектура', subtitle: 'Интеллектуал оилавий молиявий марказ', icon: Compass },
    { title: 'Smart Receipt OCR', subtitle: 'Vision AI ёрдамида чекларни сканерлаш', icon: Scan },
    { title: 'AI Forecast & Башорат', subtitle: 'Машинавий таълим ва ақлли лимитлар', icon: Brain },
    { title: 'Кунлик Хавфсиз Сарф', subtitle: 'Safe-To-Spend лимит ҳисоблагичи', icon: Clock },
    { title: 'Парето 80/20 Матрицаси', subtitle: 'Сарф тақсимоти ва ёниш суръати (Burn Rate)', icon: Layers },
    { title: 'Кўп Валютали Экотизим', subtitle: 'USD / EUR / UZS жонли кросс-курслар', icon: Coins },
    { title: 'Мақсадлар ва Радар', subtitle: 'Орзулар траекторияси ва қарзлар назорати', icon: Target },
    { title: 'What-If Симулятори', subtitle: 'Келажак қарорларини бошқариш модели', icon: Sliders },
  ];

  const handleTriggerReceiptScan = () => {
    setDemoReceiptScanning(true);
    playHarmonicChime('action');
    setTimeout(() => {
      setDemoReceiptScanning(false);
    }, 2400);
  };

  return (
    <div
      ref={slideContainerRef}
      className="fixed inset-0 z-50 bg-[#020713] text-white overflow-hidden select-none font-sans"
    >
      {/* Cinematic Ambient Canvas Backdrop */}
      <AmbientCanvas intensity={1.25} interactive={true} />

      {/* Top Futuristic HUD Header */}
      <header className="absolute top-0 left-0 right-0 z-40 h-16 sm:h-20 px-4 sm:px-8 flex items-center justify-between border-b border-cyan-500/15 bg-slate-950/70 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-cyan-500 via-teal-400 to-emerald-400 text-slate-950 flex items-center justify-center font-black text-sm shadow-[0_0_25px_rgba(6,182,212,0.7)]">
            ✨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-wide text-white">
                {language === 'uz_cyrl' ? 'ДАСТУР ИМКОНИЯТЛАРИ 2026' : 'DASTUR IMKONYATLARI 2026'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-bold">
                PLATFORM SHOWCASE
              </span>
            </div>
            <p className="text-[11px] text-cyan-200/70 hidden sm:block">
              {slideTitles[currentSlide].title} · {slideTitles[currentSlide].subtitle}
            </p>
          </div>
        </div>

        {/* Top Control Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playHarmonicChime('advance');
            }}
            title={soundEnabled ? 'Овозни ўчириш' : 'Футуристик овозларни ёқиш'}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
              soundEnabled
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.5)]'
                : 'bg-slate-900/70 border-slate-700/60 text-slate-400 hover:text-white'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setAutoPlay(!autoPlay)}
            title={autoPlay ? 'Тўхтатиш' : 'Автоматик саёҳатни бошлаш (8с)'}
            className={`h-9 px-3 rounded-xl border flex items-center gap-1.5 transition-all text-xs font-semibold ${
              autoPlay
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                : 'bg-slate-900/70 border-slate-700/60 text-slate-400 hover:text-white'
            }`}
          >
            {autoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{autoPlay ? 'Тўхтатиш' : 'Авто-саёҳат'}</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="w-9 h-9 rounded-xl bg-slate-900/70 border border-slate-700/60 text-slate-400 hover:text-white flex items-center justify-center transition-all hidden sm:flex"
            title="Тўлиқ экран"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-all shadow-xs"
          >
            <X className="w-4 h-4 text-cyan-300" />
            <span className="hidden sm:inline">CRM'га қайтиш</span>
          </button>
        </div>
      </header>

      {/* Autoplay Top Line Progress */}
      {autoPlay && (
        <div className="absolute top-16 sm:top-20 left-0 right-0 h-1 bg-slate-900 z-50 overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-cyan-400 via-teal-300 to-emerald-400 transition-all duration-100 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
            style={{ width: `${autoPlayProgress}%` }}
          />
        </div>
      )}

      {/* Main Presentation Viewport with 3D Depth Transitions */}
      <div className="relative z-10 w-full h-full pt-18 sm:pt-22 pb-24 sm:pb-28 px-4 sm:px-8 max-w-7xl mx-auto flex items-center justify-center">
        <AnimatePresence mode="wait">
          {/* =========================================================
              SLIDE 1: PLATFORM ARCHITECTURE & SMART ECOSYSTEM
              ========================================================= */}
          {currentSlide === 0 && (
            <motion.div
              key="slide-0"
              initial={{ opacity: 0, scale: 0.9, rotateX: 6, z: -100 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0, z: 0 }}
              exit={{ opacity: 0, scale: 1.08, rotateX: -6, z: 100 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-5xl text-center flex flex-col items-center"
            >
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono tracking-wider mb-3 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span>01 / 08 · ИНТЕЛЛЕКТУАЛ ЭКОТИЗИМ</span>
              </motion.div>

              <motion.h1
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-linear-to-b from-white via-slate-100 to-cyan-200 max-w-3xl leading-tight"
              >
                Оилавий Молия Бошқаруви Платформаси
              </motion.h1>

              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="text-slate-300/80 text-sm sm:text-base max-w-2xl mt-2"
              >
                Оила аъзолари, ҳамёнлар, кўп валютали баланс ва сунъий интеллектни ягона марказга бирлаштирувчи экотизим
              </motion.p>

              {/* Central Capability Hologram */}
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.35, type: 'spring', damping: 20 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 w-full max-w-4xl"
              >
                <div className="p-5 rounded-3xl bg-slate-900/80 border border-cyan-500/40 backdrop-blur-xl text-left hover:border-cyan-400 transition-all shadow-[0_0_30px_rgba(6,182,212,0.15)] group">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-lg mb-3 group-hover:scale-110 transition-transform">
                    ⚡
                  </div>
                  <h3 className="font-extrabold text-sm text-white mb-1">Реал вақт синхронизацияси</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Барча карталар (Uzcard, Humo, Visa) ва нақд ҳамёнлар бир онда янгиланади.
                  </p>
                </div>

                <div className="p-5 rounded-3xl bg-slate-900/80 border border-emerald-500/40 backdrop-blur-xl text-left hover:border-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.15)] group">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-lg mb-3 group-hover:scale-110 transition-transform">
                    🧠
                  </div>
                  <h3 className="font-extrabold text-sm text-white mb-1">Vision & Forecast AI</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Чекларни камерадан таниш (OCR) ва тарихий сарф бўйича лимитлар башорати.
                  </p>
                </div>

                <div className="p-5 rounded-3xl bg-slate-900/80 border border-indigo-500/40 backdrop-blur-xl text-left hover:border-indigo-400 transition-all shadow-[0_0_30px_rgba(99,102,241,0.15)] group">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-lg mb-3 group-hover:scale-110 transition-transform">
                    👥
                  </div>
                  <h3 className="font-extrabold text-sm text-white mb-1">Оилавий Ҳамкорлик</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Ҳар бир оила аъзосининг улуши, масъулиятлари ва харажатлари алоҳида назоратда.
                  </p>
                </div>

                <div className="p-5 rounded-3xl bg-slate-900/80 border border-amber-500/40 backdrop-blur-xl text-left hover:border-amber-400 transition-all shadow-[0_0_30px_rgba(245,158,11,0.15)] group">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-lg mb-3 group-hover:scale-110 transition-transform">
                    🛡️
                  </div>
                  <h3 className="font-extrabold text-sm text-white mb-1">100% Хавфсизлик</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Маҳаллий шифрланган сақлаш ва шахсий молиявий сирларнинг мутлақ дахлсизлиги.
                  </p>
                </div>
              </motion.div>

              {/* Bottom Callout */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="mt-7 flex items-center gap-2 text-xs text-cyan-300 font-mono"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Кейинги слайдларда дастурнинг барча асосий модуллари билан батафсил танишинг</span>
              </motion.div>
            </motion.div>
          )}

          {/* =========================================================
              SLIDE 2: SMART RECEIPT OCR (VISION AI CAPABILITY)
              ========================================================= */}
          {currentSlide === 1 && (
            <motion.div
              key="slide-1"
              initial={{ opacity: 0, scale: 0.9, rotateX: 6, z: -100 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0, z: 0 }}
              exit={{ opacity: 0, scale: 1.08, rotateX: -6, z: 100 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-5xl"
            >
              <div className="text-center mb-6">
                <span className="inline-block px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono tracking-wider mb-2 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  02 / 08 · VISION AI ИМКОНИЯТИ
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                  Smart Receipt OCR: Чекларни Бир Сонияда Киритиш
                </h2>
                <p className="text-slate-300/80 text-sm max-w-xl mx-auto mt-1">
                  Ҳар қандай савдо чекини суратга олиб, маълумотларни автоматик ёзиш технологияси
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {/* Visual Laser Scanner Demonstration Card */}
                <div className="p-6 rounded-3xl bg-slate-900/85 border border-cyan-500/40 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold">
                          <Scan className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-base">Интерактив OCR Симулятор</h3>
                          <span className="text-[10px] text-cyan-300 font-mono">Лазерли таниш алгоритми</span>
                        </div>
                      </div>

                      <button
                        onClick={handleTriggerReceiptScan}
                        className="px-3.5 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${demoReceiptScanning ? 'animate-spin' : ''}`} />
                        <span>Синаб кўриш ⚡</span>
                      </button>
                    </div>

                    {/* Holographic Mock Receipt Card */}
                    <div className="relative p-5 rounded-2xl bg-slate-950/85 border border-slate-700/80 font-mono text-xs space-y-2.5 overflow-hidden shadow-inner">
                      {/* Laser scanning beam line */}
                      <div
                        className={`absolute left-0 right-0 h-1 bg-linear-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(6,182,212,1)] ${
                          demoReceiptScanning ? 'animate-scan-beam' : 'top-1/2 opacity-30'
                        }`}
                      />

                      <div className="flex items-center justify-between text-slate-300 border-b border-slate-800 pb-2">
                        <span className="flex items-center gap-1.5 font-sans font-bold text-white">
                          <FileText className="w-4 h-4 text-cyan-400" />
                          <span>Савдо Чеки (Суратдан олинган)</span>
                        </span>
                        <span className="text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40">
                          99.4% Аниқлик
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                          <span className="text-slate-500 block text-[10px]">Дўкон номи:</span>
                          <span className="text-white font-bold font-sans">Супермаркет Корзинка</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                          <span className="text-slate-500 block text-[10px]">Тоифа таснифи:</span>
                          <span className="text-cyan-300 font-bold font-sans">🛒 Озиқ-овқат</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                          <span className="text-slate-500 block text-[10px]">Сана ва вақт:</span>
                          <span className="text-white font-bold">28.10.2026, 19:30</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                          <span className="text-slate-500 block text-[10px]">Тўлов тури:</span>
                          <span className="text-emerald-400 font-bold font-sans">💳 Банк картаси</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between">
                        <span className="text-slate-400 text-xs font-sans">Танилган жами сумма:</span>
                        <span className="text-emerald-400 font-black text-sm font-mono">
                          Автоматик тўлдирилади
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-cyan-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Қўлда ёзиб ўтириш шарт эмас — барчаси чек суратидан олинади!</span>
                  </div>
                </div>

                {/* Features & Workflow Breakdown */}
                <div className="p-6 rounded-3xl bg-slate-900/85 border border-slate-800 backdrop-blur-xl flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-white mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>OCR Модулининг Асосий Кучлари</span>
                    </h3>

                    <div className="space-y-3.5 text-xs text-slate-300">
                      <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                          1
                        </div>
                        <div>
                          <strong className="text-white block text-sm mb-0.5">Камера ёки Галереядан юклаш</strong>
                          <p className="text-slate-400 text-[11px]">
                            Камера орқали расмга олиш ёки смартфон галереясидаги тайёр скриншотларни юклаш имконияти.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                          2
                        </div>
                        <div>
                          <strong className="text-white block text-sm mb-0.5">Ақлли Тоифалаш ва Изоҳ</strong>
                          <p className="text-slate-400 text-[11px]">
                            Чекдаги маҳсулотлар номига қараб дастур харажат тоифасини (масалан: Аптека, Ресторан) ўзи танлайди.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                          3
                        </div>
                        <div>
                          <strong className="text-white block text-sm mb-0.5">0.8 Сониялик Юқори Тезлик</strong>
                          <p className="text-slate-400 text-[11px]">
                            Сунъий интеллект модели сониянинг бир қисмида матнни рақамлаштиради ва формани тўлдиради.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={nextSlide}
                      className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                    >
                      <span>AI Forecast имкониятига ўтиш</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* =========================================================
              SLIDE 3: AI FORECAST & PREDICTIVE BUDGETING
              ========================================================= */}
          {currentSlide === 2 && (
            <motion.div
              key="slide-2"
              initial={{ opacity: 0, scale: 0.9, rotateX: 6, z: -100 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0, z: 0 }}
              exit={{ opacity: 0, scale: 1.08, rotateX: -6, z: 100 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-5xl"
            >
              <div className="text-center mb-6">
                <span className="inline-block px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-500/40 text-indigo-300 text-xs font-mono tracking-wider mb-2 shadow-[0_0_20px_rgba(99,102,241,0.35)]">
                  03 / 08 · СУНЪИЙ ИНТЕЛЛЕКТ БАШОРАТИ
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                  AI Forecast: Машинавий Таълим ва Прогноз
                </h2>
                <p className="text-slate-300/80 text-sm max-w-xl mx-auto mt-1">
                  Тарихий сарфланиш қонуниятлари ва мавсумийликни таҳлил қилиб, келгуси ой лимитларини башорат қилиш
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-6 rounded-3xl bg-slate-900/85 border border-indigo-500/40 backdrop-blur-xl space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-2xl shadow-inner">
                    📈
                  </div>
                  <h3 className="font-extrabold text-base text-white">Мавсумий Трендлар Таҳлили</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Қишки коммунал тўловлар ортиши, мактаб мавсуми ёки байрам олди харажатларини модель олдиндан ҳисобга олади.
                  </p>
                  <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-[11px] text-indigo-200 font-mono">
                    ✓ Кўп йиллик сарф модели
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-slate-900/85 border border-cyan-500/40 backdrop-blur-xl space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-2xl shadow-inner">
                    🎯
                  </div>
                  <h3 className="font-extrabold text-base text-white">Оптимал Лимитлар Тавсияси</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Ҳар бир тоифа (Озиқ-овқат, Транспорт, Саломатлик) бўйича оилавий бюджетга зиён етказмайдиган хавфсиз чегаралар белгиланади.
                  </p>
                  <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-[11px] text-cyan-200 font-mono">
                    ✓ 94% Ишонч даражаси
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-slate-900/85 border border-emerald-500/40 backdrop-blur-xl space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-2xl shadow-inner">
                    🛡️
                  </div>
                  <h3 className="font-extrabold text-base text-white">Олдиндан Огоҳлантириш</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Агар сарф суръати жуда тезлашса, тизим ойнинг 15-кунидаёқ лимит ортиб кетиши ҳақида хабар беради.
                  </p>
                  <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-[11px] text-emerald-200 font-mono">
                    ✓ Проактив хатар ҳимояси
                  </div>
                </div>
              </div>

              {/* Bottom Nav Action */}
              <div className="mt-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-300">
                  💡 Бюджет Режалаштирувчи бўлимида <strong>«AI Forecast»</strong> тугмаси орқали ишга туширилади.
                </span>
                <button
                  onClick={nextSlide}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                >
                  <span>Кунлик сарфга ўтиш</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* =========================================================
              SLIDE 4: SAFE-TO-SPEND DAILY BUDGET ENGINE
              ========================================================= */}
          {currentSlide === 3 && (
            <motion.div
              key="slide-3"
              initial={{ opacity: 0, scale: 0.9, rotateX: 6, z: -100 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0, z: 0 }}
              exit={{ opacity: 0, scale: 1.08, rotateX: -6, z: 100 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-5xl"
            >
              <div className="text-center mb-6">
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-mono tracking-wider mb-2">
                  04 / 08 · КУНЛИК БЮДЖЕТ ДВИГАТЕЛИ
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                  Кунлик Хавфсиз Сарф: Safe-To-Spend Модели
                </h2>
                <p className="text-slate-300/80 text-sm max-w-xl mx-auto mt-1">
                  Ой охиригача хавфсиз яшаш ва маблағ етишмовчилигининг олдини олувчи алгоритм
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {/* Concept Visual Dial */}
                <div className="p-6 rounded-3xl bg-slate-900/85 border border-emerald-500/40 backdrop-blur-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                        <Clock className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">Динамик Кунлик Ҳисоблагич</h3>
                        <span className="text-[10px] text-emerald-300 font-mono">Ҳар бир янги кунда қайта янгиланади</span>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-950/85 border border-slate-800 text-center my-3">
                      <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider block">
                        АЛГОРИТМ ТАМОЙИЛИ:
                      </span>
                      <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 my-2">
                        Эркин Қолдиқ ÷ Қолган Кунлар
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-300 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Кафолатланган жамғарма сақланиши</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-300 pt-1">
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/40 border border-slate-700/60">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                        <span><strong>Яшил ҳудуд:</strong> Кунлик сарф меъёрда, мақсадлар хавфсиз</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/40 border border-slate-700/60">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                        <span><strong>Сариқ ҳудуд:</strong> Сарф суръати тезлашди, назорат тавсия этилади</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/40 border border-slate-700/60">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0" />
                        <span><strong>Қизил ҳудуд:</strong> Кунлик лимит ошди, ихтиёрий сарфларни тўхтатиш керак</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-4">
                    ✓ Агар бугун камроқ сарфланса, қолган пул кейинги кунлар лимитини автоматик оширади!
                  </p>
                </div>

                {/* Benefits & Impact */}
                <div className="p-6 rounded-3xl bg-slate-900/85 border border-slate-800 backdrop-blur-xl flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-white mb-4 flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-400" />
                      <span>Бу Оилага Нима Беради?</span>
                    </h3>

                    <div className="space-y-4 text-xs text-slate-300">
                      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                        <strong className="text-white text-sm block mb-1">Стресссиз Ой Якуни</strong>
                        <p className="text-slate-400 text-[11px]">
                          Ой охирига бориб пул етишмай қолиши ёки кутилмаган қарз олиш ҳолатлари буткул бартараф этилади.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                        <strong className="text-white text-sm block mb-1">Аниқ Кунлик Назорат</strong>
                        <p className="text-slate-400 text-[11px]">
                          Кунига қанча сарфлаш мумкинлиги аниқ бўлгани учун оила аъзолари харидларни онгли амалга оширади.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                        <strong className="text-white text-sm block mb-1">Орзуларга Кафолатланган Ҳисса</strong>
                        <p className="text-slate-400 text-[11px]">
                          Жамғарма учун ажратилган маблағга тегилмайди ва мақсадларга белгиланган муддатда эришилади.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={nextSlide}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                    >
                      <span>Парето 80/20 таҳлилига ўтиш</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* =========================================================
              SLIDE 5: PARETO 80/20 & BURN RATE MATRIX
              ========================================================= */}
          {currentSlide === 4 && (
            <motion.div
              key="slide-4"
              initial={{ opacity: 0, scale: 0.9, rotateX: 6, z: -100 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0, z: 0 }}
              exit={{ opacity: 0, scale: 1.08, rotateX: -6, z: 100 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-5xl"
            >
              <div className="text-center mb-6">
                <span className="inline-block px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono tracking-wider mb-2">
                  05 / 08 · АНАЛИТИКА ВА ПАРЕТО МАТРИЦАСИ
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                  Парето (ABC) 80/20 Молиявий Матрицаси
                </h2>
                <p className="text-slate-300/80 text-sm max-w-xl mx-auto mt-1">
                  Профессионал дизайнер ва молиявий таҳлилчи даражасидаги кўп босқичли иерархия
                </p>
              </div>

              {/* Interactive Tier Switcher Demo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <div
                  onClick={() => setSelectedParetoTier('A')}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer backdrop-blur-xl ${
                    selectedParetoTier === 'A'
                      ? 'bg-rose-950/40 border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.3)] ring-2 ring-rose-500/30'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-mono font-bold text-xs">
                      Класс A (Ўзак 80%)
                    </span>
                    <Flame className="w-4 h-4 text-rose-400" />
                  </div>
                  <h3 className="font-extrabold text-base text-white">Асосий Ҳаётий Эҳтиёжлар</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Озиқ-овқат, коммунал тўловлар, уй-жой, фарзандлар боғчаси/мактаби.
                  </p>
                  <div className="mt-3 text-[11px] text-rose-300 font-mono">
                    ✓ Қисқартириб бўлмайдиган база
                  </div>
                </div>

                <div
                  onClick={() => setSelectedParetoTier('B')}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer backdrop-blur-xl ${
                    selectedParetoTier === 'B'
                      ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.3)] ring-2 ring-amber-500/30'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold text-xs">
                      Класс B (Муҳим 15%)
                    </span>
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                  </div>
                  <h3 className="font-extrabold text-base text-white">Оператив Харажатлар</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Транспорт/бензин, соғлиқ ва дори-дармон, кийим-кечак, маиший таъмир.
                  </p>
                  <div className="mt-3 text-[11px] text-amber-300 font-mono">
                    ✓ Оптималлаштириш мумкин
                  </div>
                </div>

                <div
                  onClick={() => setSelectedParetoTier('C')}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer backdrop-blur-xl ${
                    selectedParetoTier === 'C'
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.3)] ring-2 ring-emerald-500/30'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs">
                      Класс C (Ихтиёрий 5%)
                    </span>
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="font-extrabold text-base text-white">Дискрецион Чиқимлар</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Ресторан ва қаҳвахоналар, кўнгилочар ҳордиқ, совғалар, обуналар.
                  </p>
                  <div className="mt-3 text-[11px] text-emerald-300 font-mono">
                    ✓ Тезкор тежаш манбаси
                  </div>
                </div>
              </div>

              {/* Analytics Features Banner */}
              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-white text-sm block">Интерактив Радиал Ҳалқа & Инспектор</strong>
                    <p className="text-xs text-slate-400">
                      Сичқонча ҳалқа устига борганда марказий жонли телеметрия ва оила аъзоларининг улушини очиш.
                    </p>
                  </div>
                </div>

                <button
                  onClick={nextSlide}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] whitespace-nowrap"
                >
                  <span>Валюта экотизимига ўтиш</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* =========================================================
              SLIDE 6: MULTI-CURRENCY LIVE ECOSYSTEM
              ========================================================= */}
          {currentSlide === 5 && (
            <motion.div
              key="slide-5"
              initial={{ opacity: 0, scale: 0.9, rotateX: 6, z: -100 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0, z: 0 }}
              exit={{ opacity: 0, scale: 1.08, rotateX: -6, z: 100 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-5xl"
            >
              <div className="text-center mb-6">
                <span className="inline-block px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono tracking-wider mb-2">
                  06 / 08 · ВАЛЮТА МАРКАЗИ
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                  Кўп Валютали Экотизим ва Жонли Курслар
                </h2>
                <p className="text-slate-300/80 text-sm max-w-xl mx-auto mt-1">
                  UZS, USD ва EUR валюталаридаги ҳисобларни ягона балансда бошқариш ва реал вақт конвертацияси
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {/* Interactive Currency Playground */}
                <div className="p-6 rounded-3xl bg-slate-900/85 border border-cyan-500/40 backdrop-blur-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold">
                        <Coins className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">Интерактив Кросс-Курс Симулятори</h3>
                        <span className="text-[10px] text-cyan-300 font-mono">Жонли Марказий Банк курслари</span>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-950/85 border border-slate-800 space-y-4 my-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Валютани алмаштиринг:</span>
                        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-700">
                          <button
                            onClick={() => setDemoSelectedCurrency('USD')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              demoSelectedCurrency === 'USD'
                                ? 'bg-cyan-500 text-slate-950 shadow-xs'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            USD ($)
                          </button>
                          <button
                            onClick={() => setDemoSelectedCurrency('EUR')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              demoSelectedCurrency === 'EUR'
                                ? 'bg-cyan-500 text-slate-950 shadow-xs'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            EUR (€)
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                          <span>Миқдорни созланг:</span>
                          <span className="font-mono text-cyan-300 font-bold text-sm">
                            {demoCurrencyAmount} {demoSelectedCurrency}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="1000"
                          step="10"
                          value={demoCurrencyAmount}
                          onChange={e => setDemoCurrencyAmount(Number(e.target.value))}
                          className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div className="p-3.5 rounded-xl bg-cyan-950/50 border border-cyan-500/40 flex items-center justify-between">
                        <span className="text-xs text-slate-300">Миллий сўмдаги қиймати:</span>
                        <span className="font-mono text-base sm:text-lg font-black text-emerald-400 tabular-nums">
                          {(demoCurrencyAmount * (demoSelectedCurrency === 'USD' ? 12850 : 13920)).toLocaleString('ru-RU')}{' '}
                          сўм
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-3">
                    ✓ Бошқарув панелида хоҳлаган пайтда бир тугма билан бутун дастур валютасини USD ёки UZS га ўгириш мумкин.
                  </p>
                </div>

                {/* Capabilities Cards */}
                <div className="p-6 rounded-3xl bg-slate-900/85 border border-slate-800 backdrop-blur-xl flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-white mb-4 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-cyan-400" />
                      <span>Валюта Модули Имкониятлари</span>
                    </h3>

                    <div className="space-y-3.5 text-xs text-slate-300">
                      <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                        <strong className="text-white text-sm block mb-1">Икки Ёқлама Баланс</strong>
                        <p className="text-slate-400 text-[11px]">
                          Ҳар бир карта ва ҳамён баланси бир вақтнинг ўзида ҳам сўмда, ҳам доллар эквивалентида акс этади.
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                        <strong className="text-white text-sm block mb-1">Тезкор Конвертер Виджети</strong>
                        <p className="text-slate-400 text-[11px]">
                          Дашбордда жойлашган тезкор конвертер ёрдамида исталган суммани сония ичида ҳисоблаш мумкин.
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                        <strong className="text-white text-sm block mb-1">Чет эл Валютасидаги Харидлар</strong>
                        <p className="text-slate-400 text-[11px]">
                          Чет эл сафарлари ва онлайн обуналар (AppStore, Netflix, авиачипталар)ни тўғридан-тўғри валютада қайд этиш.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={nextSlide}
                      className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                    >
                      <span>Мақсадлар ва Радарга ўтиш</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* =========================================================
              SLIDE 7: TARGET GOALS & ORBITAL DEBT RADAR
              ========================================================= */}
          {currentSlide === 6 && (
            <motion.div
              key="slide-6"
              initial={{ opacity: 0, scale: 0.9, rotateX: 6, z: -100 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0, z: 0 }}
              exit={{ opacity: 0, scale: 1.08, rotateX: -6, z: 100 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-5xl"
            >
              <div className="text-center mb-6">
                <span className="inline-block px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-500/40 text-indigo-300 text-xs font-mono tracking-wider mb-2">
                  07 / 08 · МАҚСАДЛАР ВА ҚАРЗЛАР НАЗОРАТИ
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                  Орзулар Траекторияси ва Қарзлар Радари
                </h2>
                <p className="text-slate-300/80 text-sm max-w-xl mx-auto mt-1">
                  Ҳар бир мақсадга аниқ қадамлар билан эришиш ва мажбуриятларни хавфсиз бошқариш
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {/* Goals Engine */}
                <div className="p-6 rounded-3xl bg-slate-900/85 border border-indigo-500/40 backdrop-blur-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold">
                        <Target className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">Мақсадлар ва Орзулар Траекторияси</h3>
                        <span className="text-[10px] text-indigo-300 font-mono">Автоматлаштирилган прогноз муддати</span>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs text-slate-300 my-2">
                      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-bold text-sm">🎯 Аниқ тугаш санаси прогнози</span>
                          <span className="text-emerald-400 font-mono font-bold">100% Автомат</span>
                        </div>
                        <p className="text-slate-400 text-[11px]">
                          Ойлик жамғариш суръатига қараб мақсадга қайси йил ва ойда эришилишини аниқ ҳисоблаб беради.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-bold text-sm">📊 Прогресс ва Муваффақият кузатуви</span>
                          <span className="text-cyan-300 font-mono font-bold">Неон треклар</span>
                        </div>
                        <p className="text-slate-400 text-[11px]">
                          Ҳар бир тўлдириш мақсад чизиғини неон рангда олдинга силжитади ва мотивация беради.
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-3">
                    ✓ Уй-жой, автомобил, фарзандлар таълими ёки саёҳат орзулари учун чексиз мақсадлар очиш мумкин.
                  </p>
                </div>

                {/* Orbital Debt Radar */}
                <div className="p-6 rounded-3xl bg-slate-900/85 border border-rose-500/30 backdrop-blur-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold">
                        <Radar className="w-5 h-5 text-rose-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">Орбитал Қарз Дафтари</h3>
                        <span className="text-[10px] text-rose-300 font-mono">Муддатлар ва мажбуриятлар расади</span>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs text-slate-300 my-2">
                      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-bold text-sm">🟢 Мендан қарздорлар (Олинадиган)</span>
                          <span className="text-emerald-400 font-mono font-bold">Актив</span>
                        </div>
                        <p className="text-slate-400 text-[11px]">
                          Кимга қанча пул берилгани, қачон қайтариши ва муддати яқинлашганда эслатмалар тизими.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-bold text-sm">🔴 Менинг қарзларим (Тўланадиган)</span>
                          <span className="text-rose-400 font-mono font-bold">Пассив</span>
                        </div>
                        <p className="text-slate-400 text-[11px]">
                          Кредит, қарз ва тўлов мажбуриятларининг режали сўндирилишини график асосида назорат қилиш.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={nextSlide}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                    >
                      <span>What-If Симуляторига ўтиш</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* =========================================================
              SLIDE 8: INTERACTIVE WHAT-IF FUTURE ENGINE
              ========================================================= */}
          {currentSlide === 7 && (
            <motion.div
              key="slide-7"
              initial={{ opacity: 0, scale: 0.9, rotateX: 6, z: -100 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0, z: 0 }}
              exit={{ opacity: 0, scale: 1.08, rotateX: -6, z: 100 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-5xl"
            >
              <div className="text-center mb-6">
                <span className="inline-block px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono tracking-wider mb-2 shadow-[0_0_20px_rgba(6,182,212,0.35)]">
                  08 / 08 · КЕЛАЖАКНИ БОШҚАРИШ ЛАБОРАТОРИЯСИ
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                  What-If Симулятори: Келажакни Реал Вақтда Кўринг
                </h2>
                <p className="text-slate-300/80 text-sm max-w-xl mx-auto mt-1">
                  «Агар даромад +15% га ортса ёки харажат -15% га қисқарса орзуларга неча ой олдин эришамиз?»
                </p>
              </div>

              {/* Interactive Simulator Cockpit */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Sliders Controller (5 cols) */}
                <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900/85 border border-cyan-500/40 backdrop-blur-xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-cyan-400" />
                      <span>Интерактив Бошқарув Слайдерлари</span>
                    </h3>

                    {/* Slider 1: Income Boost */}
                    <div className="mb-5">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-300">Даромадни ошириш:</span>
                        <span className="font-mono font-bold text-emerald-400 tabular-nums">
                          +{simIncomeBoost}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="5"
                        value={simIncomeBoost}
                        onChange={e => setSimIncomeBoost(Number(e.target.value))}
                        className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-500">Фриланс, қўшимча лойиҳалар, малака ошириш</span>
                    </div>

                    {/* Slider 2: Expense Cut */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-300">Ихтиёрий сарфларни қисқартириш:</span>
                        <span className="font-mono font-bold text-cyan-300 tabular-nums">
                          -{simExpenseCut}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="35"
                        step="5"
                        value={simExpenseCut}
                        onChange={e => setSimExpenseCut(Number(e.target.value))}
                        className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-500">Ортиқча обуналар, режадан ташқари чиқимлар</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 mt-3">
                    <div className="text-[11px] text-cyan-300 uppercase tracking-wide font-mono font-bold">
                      СИМУЛЯЦИЯ НАТИЖАСИ:
                    </div>
                    <div className="text-lg font-black text-white mt-1">
                      Жамғариш суръати <span className="text-emerald-400">+{simIncomeBoost + simExpenseCut}% га тезлашади</span>
                    </div>
                    <div className="text-xs text-slate-300 mt-1">
                      Оила ҳар йили катта миқдордаги қўшимча инвестиция капитали шакллантиради.
                    </div>
                  </div>
                </div>

                {/* Outcome Display (7 cols) */}
                <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/85 border border-emerald-500/40 backdrop-blur-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono text-emerald-400 tracking-wider font-bold">
                        МАҚСАДЛАРГА ЭРИШИШ ТЕЗЛАШУВИ
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        ~{Math.round((simIncomeBoost + simExpenseCut) * 0.45 + 3)} Ойга Эртароқ!
                      </span>
                    </div>

                    <div className="space-y-4 my-4">
                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Одатий суръат:</span>
                          <span className="font-mono text-white">Одатдаги муддат (100%)</span>
                        </div>
                        <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                          <div className="bg-slate-500 h-full rounded-full" style={{ width: '100%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-emerald-300 font-semibold mb-1">
                          <span>What-If Тезлаштирилган режа:</span>
                          <span className="font-mono text-emerald-400 font-bold">
                            {Math.max(40, 100 - (simIncomeBoost + simExpenseCut))}% муддатда бажарилади!
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-3.5 rounded-full overflow-hidden p-0.5">
                          <div
                            className="bg-linear-to-r from-cyan-400 via-emerald-400 to-teal-300 h-full rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.7)]"
                            style={{
                              width: `${Math.max(30, 100 - (simIncomeBoost + simExpenseCut))}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 mt-4">
                      💡 <strong>Хулоса:</strong> «What-If» симулятори орқали оила бюджетини реал вақтда синаб кўриш, режаларни келажакка мослаштириш ва орзуларга бир неча ой ва йил аввал эришиш мумкин.
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-800">
                    <button
                      onClick={() => goToSlide(0)}
                      className="text-xs text-cyan-300 hover:text-white transition-colors"
                    >
                      Бошидан қайта кўриш ↺
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        setActiveTab('dashboard');
                      }}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-95"
                    >
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      <span>Дастурдан фойдаланишни бошлаш</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Futuristic Bottom Navigation Dock with Slide Filmstrip */}
      <footer className="absolute bottom-0 left-0 right-0 z-40 h-22 sm:h-24 px-4 sm:px-8 flex items-center justify-between border-t border-cyan-500/15 bg-slate-950/70 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="font-mono text-sm sm:text-base font-extrabold text-cyan-300 tabular-nums">
            0{currentSlide + 1} <span className="text-slate-500">/ 0{totalSlides}</span>
          </div>
          <span className="text-xs text-slate-300 hidden sm:inline font-semibold">
            · {slideTitles[currentSlide].title}
          </span>
        </div>

        {/* Filmstrip Dock for all 8 feature slides */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
          {slideTitles.map((s, idx) => {
            const Icon = s.icon;
            const isActive = idx === currentSlide;
            return (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-linear-to-r from-cyan-500 to-emerald-400 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.6)] scale-105'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title={s.title}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">{idx + 1}. {s.title.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Previous & Next Control Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs font-semibold text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Олдинги</span>
          </button>

          <button
            onClick={nextSlide}
            disabled={currentSlide === totalSlides - 1}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] flex items-center gap-1"
          >
            <span className="hidden sm:inline">Кейинги</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
};
