-- This is an empty migration.

-- Migration: Add cache invalidation triggers
-- Simple triggers to notify when cache should be invalidated

-- Create function to send cache invalidation notifications
CREATE OR REPLACE FUNCTION notify_cache_invalidation()
RETURNS trigger AS $$
DECLARE
  payload jsonb;
BEGIN
  -- Build notification payload based on table
  CASE TG_TABLE_NAME
    WHEN 'users' THEN
      payload := jsonb_build_object(
        'table', 'users',
        'clerk_id', COALESCE(NEW.clerk_id, OLD.clerk_id),
        'operation', TG_OP
      );
    WHEN 'tags' THEN
      payload := jsonb_build_object(
        'table', 'tags',
        'operation', TG_OP
      );
    WHEN 'tag_similarities' THEN
      payload := jsonb_build_object(
        'table', 'tag_similarities',
        'operation', TG_OP
      );
    ELSE
      payload := jsonb_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP
      );
  END CASE;

  -- Send notification
  PERFORM pg_notify('cache_invalidation', payload::text);
  
  -- Return appropriate record
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Add triggers for users table
CREATE TRIGGER trigger_users_cache_invalidation
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW
  EXECUTE FUNCTION notify_cache_invalidation();

-- Add triggers for tags table
CREATE TRIGGER trigger_tags_cache_invalidation
  AFTER INSERT OR UPDATE OR DELETE ON tags
  FOR EACH ROW
  EXECUTE FUNCTION notify_cache_invalidation();

-- Add triggers for tag_similarities table
CREATE TRIGGER trigger_tag_similarities_cache_invalidation
  AFTER INSERT OR UPDATE OR DELETE ON tag_similarities
  FOR EACH ROW
  EXECUTE FUNCTION notify_cache_invalidation(); 