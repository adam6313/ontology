-- ============================================
-- Content Topic as First-Class Entity
--
-- 1. object_types 新增 content_topic
-- 2. ontology_classes 新增 topic (id=70)
-- 3. relation_types 新增 discusses/discussed_by, relevant_to/has_relevant_topic
-- 4. inference rules 新增 topic_surge, topic_decay
-- 5. GIN index on properties->>'category'
-- ============================================

BEGIN;

-- 1. object_types 新增 content_topic
INSERT INTO object_types (name, display_name) VALUES ('content_topic', '內容主題')
ON CONFLICT (name) DO NOTHING;

-- 2. ontology_classes 新增 topic
INSERT INTO ontology_classes (id, slug, name, parent_id, description, icon, sort_order)
VALUES (70, 'topic', '內容主題', 1, '可追蹤的內容主題概念', 'tag', 70)
ON CONFLICT (id) DO NOTHING;

-- 3. relation_types: discusses / discussed_by (person ↔ topic)
INSERT INTO ontology_relation_types (id, slug, name, display_name, source_class_id, target_class_id, cardinality, inverse_id, description)
VALUES
  (16, 'discusses', 'DISCUSSES', '討論', 30, 70, 'many_to_many', 17, 'KOL/person discusses a topic'),
  (17, 'discussed_by', 'DISCUSSED_BY', '被討論', 70, 30, 'many_to_many', 16, 'Topic is discussed by KOL/person')
ON CONFLICT (id) DO NOTHING;

-- 4. relation_types: relevant_to / has_relevant_topic (topic ↔ brand)
INSERT INTO ontology_relation_types (id, slug, name, display_name, source_class_id, target_class_id, cardinality, inverse_id, description)
VALUES
  (18, 'relevant_to', 'RELEVANT_TO', '相關品牌', 70, 11, 'many_to_many', 19, 'Topic is relevant to a brand'),
  (19, 'has_relevant_topic', 'HAS_RELEVANT_TOPIC', '相關話題', 11, 70, 'many_to_many', 18, 'Brand has relevant topic')
ON CONFLICT (id) DO NOTHING;

-- 5. inference rule: topic_surge (聲量 7 天成長超過 100%)
INSERT INTO ontology_rules (name, description, priority, trigger_type, condition, action_type, action_config) VALUES
(
    'topic_surge',
    '主題聲量 7 天內成長超過 100%',
    6,
    'observation_change',
    '{
        "entity_class": "topic",
        "metric": "mention_count",
        "compare": "prev_period",
        "operator": "increase_pct",
        "threshold": 100,
        "min_mentions": 3
    }',
    'derive_fact',
    '{
        "fact_type": "trend",
        "severity": "warning",
        "title_template": "「{{entity.name}}」話題急升 +{{delta_pct}}%",
        "body_template": "「{{entity.name}}」本週聲量較上週成長 {{delta_pct}}%，共 {{current_value}} 則提及。"
    }'
);

-- 6. inference rule: topic_decay (連續 4 週無提及)
INSERT INTO ontology_rules (name, description, priority, trigger_type, condition, action_type, action_config) VALUES
(
    'topic_decay',
    '主題連續 4 週無提及',
    2,
    'observation_change',
    '{
        "entity_class": "topic",
        "metric": "mention_count",
        "compare": "prev_period",
        "operator": "equals",
        "threshold": 0,
        "consecutive_periods": 4
    }',
    'derive_fact',
    '{
        "fact_type": "trend",
        "severity": "info",
        "title_template": "「{{entity.name}}」話題沉寂",
        "body_template": "「{{entity.name}}」已連續 4 週無人討論。上次提及：{{last_mention_date}}。"
    }'
);

-- 7. GIN index on properties->>'category' for topic filtering
CREATE INDEX IF NOT EXISTS idx_objects_category ON objects ((properties->>'category'))
  WHERE (properties->>'category') IS NOT NULL;

COMMIT;
