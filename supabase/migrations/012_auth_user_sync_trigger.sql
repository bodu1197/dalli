-- 012_auth_user_sync_trigger.sql
-- auth.users 테이블에 신규 사용자 생성 시 public.users에 자동으로 프로필 생성

-- 1. 프로필 자동 생성 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    phone,
    name,
    role,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 2. 기존 트리거가 있으면 삭제
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. 새 트리거 생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. 기존 auth.users에 있지만 public.users에 없는 사용자들 동기화
INSERT INTO public.users (id, email, phone, name, role, created_at, updated_at)
SELECT
  au.id,
  au.email,
  au.phone,
  COALESCE(au.raw_user_meta_data->>'name', au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
  COALESCE(au.raw_user_meta_data->>'role', 'customer'),
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- 5. 동기화 로그 (선택적)
DO $$
DECLARE
  synced_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO synced_count
  FROM auth.users au
  LEFT JOIN public.users pu ON au.id = pu.id
  WHERE pu.id IS NULL;

  IF synced_count > 0 THEN
    RAISE NOTICE 'Synced % users from auth.users to public.users', synced_count;
  END IF;
END $$;
