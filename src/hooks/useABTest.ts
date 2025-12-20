import { useState, useEffect } from 'react';

type Variant = 'A' | 'B';

export const useABTest = () => {
  const [variant, setVariant] = useState<Variant | null>(null);

  useEffect(() => {
    const savedVariant = localStorage.getItem('ab_test_variant') as Variant | null;
    if (savedVariant) {
      setVariant(savedVariant);
    } else {
      const newVariant = Math.random() < 0.5 ? 'A' : 'B';
      localStorage.setItem('ab_test_variant', newVariant);
      setVariant(newVariant);
    }
  }, []);

  const resetTest = () => {
    localStorage.removeItem('ab_test_variant');
    window.location.reload();
  };

  return { variant, resetTest };
};
