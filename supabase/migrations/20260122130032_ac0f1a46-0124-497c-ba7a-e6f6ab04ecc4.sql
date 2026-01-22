-- Удаляем старый constraint
ALTER TABLE ab_test_events 
DROP CONSTRAINT IF EXISTS ab_test_events_variant_check;

-- Добавляем новый constraint с 'tg2'
ALTER TABLE ab_test_events 
ADD CONSTRAINT ab_test_events_variant_check 
CHECK (variant = ANY (ARRAY['A', 'B', 'community', 'empire', 'classic', 'tg2']));