-- Безопасная функция которая возвращает только count лидов
CREATE OR REPLACE FUNCTION get_leads_count()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer FROM leads;
$$;