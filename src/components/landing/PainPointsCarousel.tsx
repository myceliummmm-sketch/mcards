import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Briefcase, Code, GraduationCap, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const AUDIENCES = [
  { id: "soloFounder", icon: User, color: "hsl(190 100% 50%)" },
  { id: "corporate", icon: Briefcase, color: "hsl(280 70% 60%)" },
  { id: "noCode", icon: Code, color: "hsl(140 70% 50%)" },
  { id: "student", icon: GraduationCap, color: "hsl(45 90% 55%)" },
  { id: "techFounder", icon: Code, color: "hsl(260 70% 60%)" },
  { id: "freelancer", icon: Briefcase, color: "hsl(15 90% 60%)" },
  { id: "secondTimeFounder", icon: User, color: "hsl(320 70% 60%)" },
];

export function PainPointsCarousel() {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % AUDIENCES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const goTo = (index: number) => setActiveIndex(index);
  const goPrev = () => setActiveIndex((prev) => (prev - 1 + AUDIENCES.length) % AUDIENCES.length);
  const goNext = () => setActiveIndex((prev) => (prev + 1) % AUDIENCES.length);

  const current = AUDIENCES[activeIndex];

  return (
    <section className="relative z-10 py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            {t('painPoints.title')}
          </h2>
        </motion.div>

        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Navigation Arrows */}
          <button
            onClick={goPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-20 p-2 rounded-full bg-card/80 border border-border/50 hover:border-primary/50 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-20 p-2 rounded-full bg-card/80 border border-border/50 hover:border-primary/50 transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="relative p-8 md:p-12 rounded-2xl bg-card/80 border border-border/50 backdrop-blur-sm"
              style={{
                boxShadow: `0 0 60px ${current.color.replace(")", " / 0.15)")}`,
                borderColor: `${current.color.replace(")", " / 0.3)")}`,
              }}
            >
              {/* Audience Icon & Label */}
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${current.color.replace(")", " / 0.2)")}` }}
                >
                  <current.icon className="w-6 h-6" style={{ color: current.color }} />
                </div>
                <span
                  className="text-sm font-medium uppercase tracking-wider"
                  style={{ color: current.color }}
                >
                  {t(`painPoints.${current.id}.label`)}
                </span>
              </div>

              {/* Pain Quote */}
              <div className="mb-8">
                <div className="text-4xl text-primary/30 font-serif mb-2">"</div>
                <p className="text-xl md:text-2xl font-display text-foreground leading-relaxed -mt-6 pl-6">
                  {t(`painPoints.${current.id}.pain`)}
                </p>
              </div>

              {/* Solution Arrow */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div className="text-2xl">→</div>
                <p className="text-lg text-primary font-medium">
                  {t(`painPoints.${current.id}.solution`)}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-3 mt-8">
            {AUDIENCES.map((aud, idx) => (
              <button
                key={aud.id}
                onClick={() => goTo(idx)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  idx === activeIndex
                    ? "scale-125"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                style={{
                  backgroundColor: idx === activeIndex ? aud.color : undefined,
                }}
                aria-label={`Go to ${aud.id}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
