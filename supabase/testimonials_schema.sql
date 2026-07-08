-- Esquema de testimonios (testimonials) para el e-commerce de suplementos
-- Correr en el SQL Editor de Supabase después de schema.sql y auth_schema.sql

-- =====================================================
-- TABLA: testimonials
-- =====================================================
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    review_text TEXT NOT NULL,
    photo_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.testimonials IS 'Testimonios/reseñas de clientes para el storefront.';

COMMENT ON COLUMN public.testimonials.id IS 'Identificador único del testimonio.';
COMMENT ON COLUMN public.testimonials.customer_name IS 'Nombre del cliente que dejó la reseña.';
COMMENT ON COLUMN public.testimonials.review_text IS 'Texto de la reseña.';
COMMENT ON COLUMN public.testimonials.photo_url IS 'URL pública de la foto del cliente, si tiene.';
COMMENT ON COLUMN public.testimonials.display_order IS 'Orden manual de aparición (menor = primero).';
COMMENT ON COLUMN public.testimonials.active IS 'Indica si el testimonio se muestra públicamente.';
COMMENT ON COLUMN public.testimonials.created_at IS 'Fecha de creación del testimonio.';

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_testimonials_display_order ON public.testimonials(display_order);

-- =====================================================
-- RLS (ROW LEVEL SECURITY)
-- =====================================================
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Lectura pública solo de testimonios activos
DROP POLICY IF EXISTS testimonials_select_public ON public.testimonials;
CREATE POLICY testimonials_select_public
ON public.testimonials
FOR SELECT
USING (active = true);

-- Escritura solo para usuarios autenticados con rol admin (mismo patrón que brands/categories, ver auth_schema.sql)
DROP POLICY IF EXISTS testimonials_write_admin ON public.testimonials;
CREATE POLICY testimonials_write_admin
ON public.testimonials
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
-- STORAGE: bucket "testimonials" (fotos de clientes)
-- =====================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('testimonials', 'testimonials', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS testimonials_storage_select_public ON storage.objects;
CREATE POLICY testimonials_storage_select_public
ON storage.objects
FOR SELECT
USING (bucket_id = 'testimonials');

DROP POLICY IF EXISTS testimonials_storage_insert_admin ON storage.objects;
CREATE POLICY testimonials_storage_insert_admin
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'testimonials'
    AND auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
);

DROP POLICY IF EXISTS testimonials_storage_update_admin ON storage.objects;
CREATE POLICY testimonials_storage_update_admin
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'testimonials'
    AND auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
)
WITH CHECK (
    bucket_id = 'testimonials'
    AND auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
);

DROP POLICY IF EXISTS testimonials_storage_delete_admin ON storage.objects;
CREATE POLICY testimonials_storage_delete_admin
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'testimonials'
    AND auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
);
