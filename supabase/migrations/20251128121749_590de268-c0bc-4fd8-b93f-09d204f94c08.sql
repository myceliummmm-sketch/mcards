-- Add card image and evaluation columns to deck_cards table
ALTER TABLE deck_cards ADD COLUMN IF NOT EXISTS card_image_url TEXT;
ALTER TABLE deck_cards ADD COLUMN IF NOT EXISTS evaluation JSONB;
ALTER TABLE deck_cards ADD COLUMN IF NOT EXISTS last_evaluated_at TIMESTAMP WITH TIME ZONE;