-- 014: OQL Query Engine - Trigram indexes for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_objects_canonical_name_trgm ON objects USING gin (canonical_name gin_trgm_ops);
CREATE INDEX idx_object_aliases_alias_trgm ON object_aliases USING gin (alias gin_trgm_ops);
CREATE INDEX idx_entity_stats_canonical_name_trgm ON entity_stats USING gin (canonical_name gin_trgm_ops);
