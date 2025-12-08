import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface InsightCardData {
  title: string;
  insight: string;
  topic: string;
  phase?: string;
}

interface InsightCardProps {
  data: InsightCardData;
  imageUrl?: string | null;
  className?: string;
  onClick?: () => void;
}

const TOPIC_COLORS: Record<string, string> = {
  strategy: 'from-violet-500/20 to-indigo-600/20 border-violet-500/50',
  product: 'from-cyan-500/20 to-teal-600/20 border-cyan-500/50',
  market: 'from-emerald-500/20 to-green-600/20 border-emerald-500/50',
  tech: 'from-blue-500/20 to-sky-600/20 border-blue-500/50',
  growth: 'from-orange-500/20 to-amber-600/20 border-orange-500/50',
  risk: 'from-red-500/20 to-rose-600/20 border-red-500/50',
  innovation: 'from-pink-500/20 to-fuchsia-600/20 border-pink-500/50',
  customer: 'from-yellow-500/20 to-amber-600/20 border-yellow-500/50',
};

const TOPIC_BADGE_COLORS: Record<string, string> = {
  strategy: 'bg-violet-500/30 text-violet-200',
  product: 'bg-cyan-500/30 text-cyan-200',
  market: 'bg-emerald-500/30 text-emerald-200',
  tech: 'bg-blue-500/30 text-blue-200',
  growth: 'bg-orange-500/30 text-orange-200',
  risk: 'bg-red-500/30 text-red-200',
  innovation: 'bg-pink-500/30 text-pink-200',
  customer: 'bg-yellow-500/30 text-yellow-200',
};

export const InsightCard = ({ data, imageUrl, className, onClick }: InsightCardProps) => {
  const topicColor = TOPIC_COLORS[data.topic] || TOPIC_COLORS.strategy;
  const badgeColor = TOPIC_BADGE_COLORS[data.topic] || TOPIC_BADGE_COLORS.strategy;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={cn(
        'relative w-40 h-56 rounded-xl overflow-hidden cursor-pointer group',
        'bg-gradient-to-br border',
        topicColor,
        'shadow-lg hover:shadow-xl transition-shadow duration-300',
        className
      )}
    >
      {/* Crystalline facet pattern overlay */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="facetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
            </linearGradient>
          </defs>
          <polygon points="0,0 50,20 30,50 0,40" fill="url(#facetGradient)" />
          <polygon points="100,0 70,30 100,60" fill="url(#facetGradient)" />
          <polygon points="50,80 100,100 60,100" fill="url(#facetGradient)" />
        </svg>
      </div>

      {/* Image */}
      {imageUrl && (
        <div className="absolute inset-0">
          <img 
            src={imageUrl} 
            alt={data.title}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-3">
        {/* Topic badge */}
        <span className={cn(
          'absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide',
          badgeColor
        )}>
          {data.topic}
        </span>

        {/* Title */}
        <h4 className="text-sm font-display font-bold text-foreground mb-1 line-clamp-2 text-shadow">
          {data.title}
        </h4>

        {/* Insight preview */}
        <p className="text-xs text-muted-foreground line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {data.insight}
        </p>
      </div>

      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>

      {/* Edge glow */}
      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20 pointer-events-none" />
    </motion.div>
  );
};
