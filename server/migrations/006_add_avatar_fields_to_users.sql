ALTER TABLE users
ADD COLUMN IF NOT EXISTS selected_avatar VARCHAR(100) DEFAULT 'default-avatar',
ADD COLUMN IF NOT EXISTS unlocked_avatars TEXT[] DEFAULT ARRAY['default-avatar'];