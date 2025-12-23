-- Drop the old constraint that only allows 'A' and 'B'
ALTER TABLE ab_test_events DROP CONSTRAINT IF EXISTS ab_test_events_variant_check;

-- Add new constraint with all valid variants
ALTER TABLE ab_test_events ADD CONSTRAINT ab_test_events_variant_check 
  CHECK (variant = ANY (ARRAY['A', 'B', 'community', 'empire', 'classic']));