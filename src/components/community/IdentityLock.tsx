import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface IdentityLockProps {
  onComplete: (name: string) => void;
}

export function IdentityLock({ onComplete }: IdentityLockProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    onComplete(name.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D1117] px-4">
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Icon */}
        <motion.div 
          className="flex justify-center mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
            <Lock className="w-10 h-10 text-primary" />
          </div>
        </motion.div>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
          Lock Your Identity
        </h2>
        <p className="text-white/60 text-center mb-8">
          Choose a name that will be displayed on your passport. This is your founder identity.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <Input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Enter your founder name..."
              className="pl-12 h-14 bg-white/5 border-2 border-white/10 focus:border-primary text-white text-lg placeholder:text-white/30"
              autoFocus
            />
          </div>

          {error && (
            <motion.p 
              className="text-red-400 text-sm text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-primary shadow-[4px_4px_0_hsl(var(--primary)/0.5)] hover:shadow-[2px_2px_0_hsl(var(--primary)/0.5)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all min-h-14 text-lg font-bold"
          >
            LOCK MY IDENTITY
          </Button>
        </form>

        {/* Security note */}
        <p className="text-white/40 text-xs text-center mt-6">
          🔒 Your identity is secured with blockchain-grade encryption
        </p>
      </motion.div>
    </div>
  );
}
