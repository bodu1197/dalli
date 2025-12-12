-- 세금계산서 테이블 생성
CREATE TABLE IF NOT EXISTS public.tax_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 승인번호 (국세청 발급 후 저장)
  issue_id TEXT,
  
  -- 공급자 (플랫폼) 정보
  supplier_biz_number TEXT NOT NULL DEFAULT '123-45-67890',
  supplier_name TEXT NOT NULL DEFAULT '(주)달리플랫폼',
  supplier_ceo_name TEXT NOT NULL DEFAULT '김대표',
  supplier_address TEXT DEFAULT '서울시 강남구',
  supplier_business_type TEXT DEFAULT '서비스업',
  supplier_business_item TEXT DEFAULT '배달대행',
  
  -- 공급받는자 (가게) 정보
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE SET NULL,
  buyer_biz_number TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_ceo_name TEXT,
  buyer_email TEXT,
  buyer_address TEXT,
  
  -- 금액 정보
  supply_cost BIGINT NOT NULL DEFAULT 0,  -- 공급가액 (원)
  tax BIGINT NOT NULL DEFAULT 0,          -- 세액 (원)
  total_amount BIGINT NOT NULL DEFAULT 0, -- 합계금액 (원)
  
  -- 세금계산서 정보
  write_date DATE NOT NULL,               -- 작성일자
  issue_type TEXT DEFAULT 'electronic',   -- electronic, paper
  remark TEXT,                            -- 비고
  
  -- 상태 관리
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'failed', 'cancelled')),
  issued_at TIMESTAMPTZ,
  failed_reason TEXT,
  
  -- 정산 기간 (어떤 기간의 수수료인지)
  period_start DATE,
  period_end DATE,
  
  -- 메타데이터
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_tax_invoices_restaurant_id ON public.tax_invoices(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_tax_invoices_status ON public.tax_invoices(status);
CREATE INDEX IF NOT EXISTS idx_tax_invoices_write_date ON public.tax_invoices(write_date);

-- RLS 정책 (Admin만 접근 가능)
ALTER TABLE public.tax_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage tax_invoices" ON public.tax_invoices
  FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
  );

-- restaurants 테이블에 business_number 컬럼 추가 (없으면)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'restaurants' 
    AND column_name = 'business_number'
  ) THEN
    ALTER TABLE public.restaurants ADD COLUMN business_number TEXT;
  END IF;
END $$;

-- 트리거: updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_tax_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_tax_invoices_updated_at ON public.tax_invoices;
CREATE TRIGGER trigger_tax_invoices_updated_at
  BEFORE UPDATE ON public.tax_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_tax_invoices_updated_at();
