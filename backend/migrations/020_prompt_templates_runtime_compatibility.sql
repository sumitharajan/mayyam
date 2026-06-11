-- Align prompt_templates runtime columns with the Rust SeaORM model.
-- Earlier migrations created the LLM analytics table with prompt_type/template_content
-- naming, while the repository/model read workflow_type/prompt_template.

ALTER TABLE prompt_templates
    ADD COLUMN IF NOT EXISTS resource_type VARCHAR(100),
    ADD COLUMN IF NOT EXISTS workflow_type VARCHAR(100),
    ADD COLUMN IF NOT EXISTS prompt_template TEXT,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS is_system BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS created_by UUID;

UPDATE prompt_templates
SET
    workflow_type = COALESCE(workflow_type, prompt_type),
    prompt_template = COALESCE(prompt_template, template_content),
    is_active = COALESCE(is_active, status = 'active'),
    is_system = COALESCE(is_system, is_system_prompt)
WHERE prompt_template IS NULL
   OR workflow_type IS NULL;

ALTER TABLE prompt_templates
    ALTER COLUMN prompt_template SET DEFAULT '';

UPDATE prompt_templates
SET prompt_template = ''
WHERE prompt_template IS NULL;

ALTER TABLE prompt_templates
    ALTER COLUMN prompt_template SET NOT NULL;
