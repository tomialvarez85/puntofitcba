-- Esquema de marcas (brands) para el e-commerce de suplementos
-- Correr en el SQL Editor de Supabase después de schema.sql y auth_schema.sql

-- =====================================================
-- TABLA: brands
-- =====================================================
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.brands IS 'Marcas de los productos del e-commerce.';

COMMENT ON COLUMN public.brands.id IS 'Identificador único de la marca.';
COMMENT ON COLUMN public.brands.name IS 'Nombre visible de la marca.';
COMMENT ON COLUMN public.brands.slug IS 'Slug único usado para URLs amigables.';
COMMENT ON COLUMN public.brands.logo_url IS 'URL pública del logo de la marca.';
COMMENT ON COLUMN public.brands.created_at IS 'Fecha de creación de la marca.';

-- =====================================================
-- COLUMNA: products.brand_id
-- =====================================================
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.products.brand_id IS 'Marca asociada al producto.';

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_brands_slug ON public.brands(slug);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);

-- =====================================================
-- RLS (ROW LEVEL SECURITY)
-- =====================================================
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Lectura pública
DROP POLICY IF EXISTS brands_select_public ON public.brands;
CREATE POLICY brands_select_public
ON public.brands
FOR SELECT
USING (true);

-- Escritura solo para usuarios autenticados con rol admin (mismo patrón que categories, ver auth_schema.sql)
DROP POLICY IF EXISTS brands_write_admin ON public.brands;
CREATE POLICY brands_write_admin
ON public.brands
FOR ALL
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
)
WITH CHECK (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
);

-- =====================================================
-- STORAGE: bucket "brands" (logos de marca)
-- =====================================================
-- Nota: no se encontraron en el repo las policies del bucket "products" (se configuraron
-- manualmente desde el dashboard de Supabase). Estas policies siguen el mismo criterio
-- lectura pública / escritura solo admin vía profiles, aplicado al nuevo bucket "brands".

INSERT INTO storage.buckets (id, name, public)
VALUES ('brands', 'brands', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS brands_storage_select_public ON storage.objects;
CREATE POLICY brands_storage_select_public
ON storage.objects
FOR SELECT
USING (bucket_id = 'brands');

DROP POLICY IF EXISTS brands_storage_insert_admin ON storage.objects;
CREATE POLICY brands_storage_insert_admin
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'brands'
    AND auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
);

DROP POLICY IF EXISTS brands_storage_update_admin ON storage.objects;
CREATE POLICY brands_storage_update_admin
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'brands'
    AND auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
)
WITH CHECK (
    bucket_id = 'brands'
    AND auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
);

DROP POLICY IF EXISTS brands_storage_delete_admin ON storage.objects;
CREATE POLICY brands_storage_delete_admin
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'brands'
    AND auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
);
