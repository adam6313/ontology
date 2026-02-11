-- ============================================================
-- REFRESH MATERIALIZED VIEWS
-- Run AFTER all seed data is loaded
-- ============================================================

REFRESH MATERIALIZED VIEW entity_stats;
REFRESH MATERIALIZED VIEW entity_aspect_stats;
