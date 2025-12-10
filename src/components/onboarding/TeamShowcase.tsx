import { motion } from "framer-motion";
import { TEAM_CHARACTERS } from "@/data/teamCharacters";

const FEATURED_CHARACTERS = ["evergreen", "prisma", "phoenix", "techpriest"];

export const TeamShowcase = () => {
  const characters = FEATURED_CHARACTERS.map((id) => TEAM_CHARACTERS[id]).filter(Boolean);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl mx-auto">
      {characters.map((character, index) => (
        <motion.div
          key={character.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.2 }}
          className="group"
        >
          <div className="card-shine rounded-xl border border-border/50 bg-card/80 p-4 text-center hover:border-primary/50 transition-all duration-300 hover:scale-105">
            {/* Avatar */}
            <div className="relative w-16 h-16 mx-auto mb-3">
              <img
                src={character.avatar}
                alt={character.name}
                className="w-full h-full rounded-full object-cover border-2 border-border group-hover:border-primary/50 transition-colors"
              />
              <div
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-30 transition-opacity blur-lg"
                style={{ backgroundColor: character.color }}
              />
            </div>

            {/* Info */}
            <div className="space-y-1">
              <h3 className="font-display font-semibold text-sm">
                {character.emoji} {character.name}
              </h3>
              <p className="text-xs text-primary">{character.role}</p>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                {character.tagline}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
