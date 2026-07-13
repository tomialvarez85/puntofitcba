-- =====================================================================
-- MIGRACIÓN COMPLETA CONSOLIDADA - puntofitcba (e-commerce de suplementos)
-- =====================================================================
-- Este archivo reemplaza la ejecución manual y ordenada de:
--   schema.sql -> auth_schema.sql -> brands_schema.sql -> testimonials_schema.sql
-- más las policies de Storage del bucket "products" que originalmente se
-- crearon a mano en el SQL Editor y nunca quedaron guardadas como archivo.
--
-- NOTA IMPORTANTE sobre el bucket "products":
-- No existe en el repo ni en el historial disponible el SQL original de
-- esas policies. Las políticas para "products" incluidas más abajo son una
-- RECONSTRUCCIÓN siguiendo el mismo criterio documentado y ya aplicado a
-- los buckets "brands" y "testimonials" (lectura pública, escritura solo
-- para usuarios autenticados con role = 'admin' en public.profiles).
-- Verificar contra el proyecto Supabase original antes de dar por
-- equivalentes al 100%.
--
-- Este script es idempotente: puede correrse más de una vez sin duplicar
-- ni romper nada (usa IF NOT EXISTS / DROP POLICY IF EXISTS / ON CONFLICT).
--
-- PRE-REQUISITO MANUAL (no se puede hacer por SQL de forma confiable):
-- crear los buckets de Storage "products", "brands" y "testimonials" desde
-- Supabase Studio > Storage antes de correr la sección 8 de este archivo.
-- Ver el detalle de buckets al final de este comentario.
-- =====================================================================


-- =====================================================================
-- 1. EXTENSIONES
-- =====================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- =====================================================================
-- 2. TABLAS BASE (schema.sql)
-- =====================================================================

-- ---------------------------------------------------------------------
-- TABLA: categories
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.categories IS 'Categorías de productos del e-commerce.';
COMMENT ON COLUMN public.categories.id IS 'Identificador único de la categoría.';
COMMENT ON COLUMN public.categories.name IS 'Nombre visible de la categoría.';
COMMENT ON COLUMN public.categories.slug IS 'Slug único usado para URLs amigables.';
COMMENT ON COLUMN public.categories.created_at IS 'Fecha de creación de la categoría.';

-- ---------------------------------------------------------------------
-- TABLA: products
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    price NUMERIC NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.products IS 'Productos disponibles para la tienda.';
COMMENT ON COLUMN public.products.id IS 'Identificador único del producto.';
COMMENT ON COLUMN public.products.name IS 'Nombre del producto.';
COMMENT ON COLUMN public.products.slug IS 'Slug único usado para URLs amigables.';
COMMENT ON COLUMN public.products.description IS 'Descripción del producto.';
COMMENT ON COLUMN public.products.price IS 'Precio del producto.';
COMMENT ON COLUMN public.products.stock IS 'Stock disponible del producto.';
COMMENT ON COLUMN public.products.category_id IS 'Categoría asociada al producto.';
COMMENT ON COLUMN public.products.active IS 'Indica si el producto está activo para la venta.';
COMMENT ON COLUMN public.products.created_at IS 'Fecha de creación del producto.';
COMMENT ON COLUMN public.products.updated_at IS 'Fecha de última modificación del producto.';

-- ---------------------------------------------------------------------
-- TABLA: product_images
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0
);

COMMENT ON TABLE public.product_images IS 'Imágenes asociadas a los productos.';
COMMENT ON COLUMN public.product_images.id IS 'Identificador único de la imagen.';
COMMENT ON COLUMN public.product_images.product_id IS 'Producto asociado a la imagen.';
COMMENT ON COLUMN public.product_images.url IS 'URL pública de la imagen.';
COMMENT ON COLUMN public.product_images.is_primary IS 'Indica si la imagen es la principal del producto.';
COMMENT ON COLUMN public.product_images.sort_order IS 'Orden de visualización de las imágenes.';

-- ---------------------------------------------------------------------
-- TABLA: combos
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.combos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    price NUMERIC NOT NULL,
    image_url TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.combos IS 'Combos o paquetes de productos.';
COMMENT ON COLUMN public.combos.id IS 'Identificador único del combo.';
COMMENT ON COLUMN public.combos.name IS 'Nombre del combo.';
COMMENT ON COLUMN public.combos.slug IS 'Slug único usado para URLs amigables.';
COMMENT ON COLUMN public.combos.description IS 'Descripción del combo.';
COMMENT ON COLUMN public.combos.price IS 'Precio del combo.';
COMMENT ON COLUMN public.combos.image_url IS 'URL de la imagen del combo.';
COMMENT ON COLUMN public.combos.active IS 'Indica si el combo está activo para la venta.';
COMMENT ON COLUMN public.combos.created_at IS 'Fecha de creación del combo.';
COMMENT ON COLUMN public.combos.updated_at IS 'Fecha de última modificación del combo.';

-- ---------------------------------------------------------------------
-- TABLA: combo_items
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.combo_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    combo_id UUID NOT NULL REFERENCES public.combos(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1
);

COMMENT ON TABLE public.combo_items IS 'Productos incluidos dentro de cada combo.';
COMMENT ON COLUMN public.combo_items.id IS 'Identificador único del item del combo.';
COMMENT ON COLUMN public.combo_items.combo_id IS 'Combo al que pertenece el item.';
COMMENT ON COLUMN public.combo_items.product_id IS 'Producto incluido en el combo.';
COMMENT ON COLUMN public.combo_items.quantity IS 'Cantidad del producto en el combo.';

-- ---------------------------------------------------------------------
-- TABLA: promotions
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', '2x1')),
    discount_value NUMERIC,
    image_url TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.promotions IS 'Promociones vigentes o futuras del e-commerce.';
COMMENT ON COLUMN public.promotions.id IS 'Identificador único de la promoción.';
COMMENT ON COLUMN public.promotions.name IS 'Nombre de la promoción.';
COMMENT ON COLUMN public.promotions.description IS 'Descripción de la promoción.';
COMMENT ON COLUMN public.promotions.discount_type IS 'Tipo de descuento aplicado.';
COMMENT ON COLUMN public.promotions.discount_value IS 'Valor del descuento según el tipo.';
COMMENT ON COLUMN public.promotions.image_url IS 'URL de la imagen de la promoción.';
COMMENT ON COLUMN public.promotions.start_date IS 'Fecha de inicio de vigencia.';
COMMENT ON COLUMN public.promotions.end_date IS 'Fecha de fin de vigencia.';
COMMENT ON COLUMN public.promotions.active IS 'Indica si la promoción está activa.';
COMMENT ON COLUMN public.promotions.created_at IS 'Fecha de creación de la promoción.';

-- ---------------------------------------------------------------------
-- TABLA: promotion_products
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.promotion_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    promotion_id UUID NOT NULL REFERENCES public.promotions(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    combo_id UUID REFERENCES public.combos(id) ON DELETE CASCADE,
    CHECK (product_id IS NOT NULL OR combo_id IS NOT NULL)
);

COMMENT ON TABLE public.promotion_products IS 'Vinculación de promociones con productos o combos.';
COMMENT ON COLUMN public.promotion_products.id IS 'Identificador único del vínculo.';
COMMENT ON COLUMN public.promotion_products.promotion_id IS 'Promoción asociada.';
COMMENT ON COLUMN public.promotion_products.product_id IS 'Producto incluido en la promoción, si aplica.';
COMMENT ON COLUMN public.promotion_products.combo_id IS 'Combo incluido en la promoción, si aplica.';


-- =====================================================================
-- 3. ÍNDICES (schema.sql)
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_combos_slug ON public.combos(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_combo_items_combo_id ON public.combo_items(combo_id);
CREATE INDEX IF NOT EXISTS idx_combo_items_product_id ON public.combo_items(product_id);
CREATE INDEX IF NOT EXISTS idx_promotion_products_promotion_id ON public.promotion_products(promotion_id);
CREATE INDEX IF NOT EXISTS idx_promotion_products_product_id ON public.promotion_products(product_id);
CREATE INDEX IF NOT EXISTS idx_promotion_products_combo_id ON public.promotion_products(combo_id);


-- =====================================================================
-- 4. TRIGGERS PARA updated_at (schema.sql)
-- =====================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_set_updated_at ON public.products;
CREATE TRIGGER trg_products_set_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_combos_set_updated_at ON public.combos;
CREATE TRIGGER trg_combos_set_updated_at
BEFORE UPDATE ON public.combos
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();


-- =====================================================================
-- 5. RLS + POLÍTICAS DE LECTURA PÚBLICA (schema.sql)
-- =====================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.combos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.combo_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS categories_select_public ON public.categories;
CREATE POLICY categories_select_public
ON public.categories
FOR SELECT
USING (true);

DROP POLICY IF EXISTS products_select_public ON public.products;
CREATE POLICY products_select_public
ON public.products
FOR SELECT
USING (active = true);

DROP POLICY IF EXISTS product_images_select_public ON public.product_images;
CREATE POLICY product_images_select_public
ON public.product_images
FOR SELECT
USING (true);

DROP POLICY IF EXISTS combos_select_public ON public.combos;
CREATE POLICY combos_select_public
ON public.combos
FOR SELECT
USING (active = true);

DROP POLICY IF EXISTS combo_items_select_public ON public.combo_items;
CREATE POLICY combo_items_select_public
ON public.combo_items
FOR SELECT
USING (true);

DROP POLICY IF EXISTS promotions_select_public ON public.promotions;
CREATE POLICY promotions_select_public
ON public.promotions
FOR SELECT
USING (
    active = true
    AND start_date <= NOW()
    AND end_date >= NOW()
);

DROP POLICY IF EXISTS promotion_products_select_public ON public.promotion_products;
CREATE POLICY promotion_products_select_public
ON public.promotion_products
FOR SELECT
USING (true);

-- NOTA: schema.sql definía además políticas de escritura admin basadas en
-- auth.jwt() ->> 'role'. Esas políticas quedaron reemplazadas por el sistema
-- de roles vía public.profiles (auth_schema.sql) y se omiten aquí para no
-- crear políticas intermedias que luego se pisan a sí mismas. La versión
-- final (basada en profiles) se crea en la sección 7.


-- =====================================================================
-- 6. TABLA profiles + TRIGGER DE ALTA DE USUARIO (auth_schema.sql)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Perfiles de usuario para controlar roles del panel administrativo.';
COMMENT ON COLUMN public.profiles.id IS 'ID del usuario autenticado, vinculado a auth.users.';
COMMENT ON COLUMN public.profiles.email IS 'Correo electrónico del usuario.';
COMMENT ON COLUMN public.profiles.role IS 'Rol del usuario dentro del sistema.';
COMMENT ON COLUMN public.profiles.created_at IS 'Fecha de creación del perfil.';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'customer');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own
ON public.profiles
FOR SELECT
USING (id = auth.uid());

-- No se crean políticas de insert/update/delete para que el cliente no
-- pueda modificar perfiles directamente.


-- =====================================================================
-- 7. POLÍTICAS DE ESCRITURA ADMIN VÍA profiles (auth_schema.sql)
-- =====================================================================
DROP POLICY IF EXISTS categories_write_admin ON public.categories;
CREATE POLICY categories_write_admin
ON public.categories
FOR ALL
USING (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
)
WITH CHECK (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

DROP POLICY IF EXISTS products_write_admin ON public.products;
CREATE POLICY products_write_admin
ON public.products
FOR ALL
USING (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
)
WITH CHECK (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

DROP POLICY IF EXISTS product_images_write_admin ON public.product_images;
CREATE POLICY product_images_write_admin
ON public.product_images
FOR ALL
USING (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
)
WITH CHECK (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

DROP POLICY IF EXISTS combos_write_admin ON public.combos;
CREATE POLICY combos_write_admin
ON public.combos
FOR ALL
USING (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
)
WITH CHECK (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

DROP POLICY IF EXISTS combo_items_write_admin ON public.combo_items;
CREATE POLICY combo_items_write_admin
ON public.combo_items
FOR ALL
USING (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
)
WITH CHECK (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

DROP POLICY IF EXISTS promotions_write_admin ON public.promotions;
CREATE POLICY promotions_write_admin
ON public.promotions
FOR ALL
USING (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
)
WITH CHECK (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

DROP POLICY IF EXISTS promotion_products_write_admin ON public.promotion_products;
CREATE POLICY promotion_products_write_admin
ON public.promotion_products
FOR ALL
USING (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
)
WITH CHECK (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);


-- =====================================================================
-- 8. TABLA brands + products.brand_id (brands_schema.sql)
-- =====================================================================
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

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.products.brand_id IS 'Marca asociada al producto.';

CREATE INDEX IF NOT EXISTS idx_brands_slug ON public.brands(slug);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS brands_select_public ON public.brands;
CREATE POLICY brands_select_public
ON public.brands
FOR SELECT
USING (true);

DROP POLICY IF EXISTS brands_write_admin ON public.brands;
CREATE POLICY brands_write_admin
ON public.brands
FOR ALL
USING (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
)
WITH CHECK (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);


-- =====================================================================
-- 9. TABLA testimonials (testimonials_schema.sql)
-- =====================================================================
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

CREATE INDEX IF NOT EXISTS idx_testimonials_display_order ON public.testimonials(display_order);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS testimonials_select_public ON public.testimonials;
CREATE POLICY testimonials_select_public
ON public.testimonials
FOR SELECT
USING (active = true);

DROP POLICY IF EXISTS testimonials_write_admin ON public.testimonials;
CREATE POLICY testimonials_write_admin
ON public.testimonials
FOR ALL
USING (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
)
WITH CHECK (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);


-- =====================================================================
-- 10. STORAGE: POLÍTICAS PARA LOS BUCKETS "products", "brands", "testimonials"
-- =====================================================================
-- Los buckets deben crearse manualmente en Supabase Studio > Storage ANTES
-- de correr esta sección (ver lista de buckets en el mensaje del asistente).
-- Todas las políticas siguen el mismo criterio: lectura pública, escritura
-- (INSERT/UPDATE/DELETE) solo para usuarios autenticados con role = 'admin'
-- en public.profiles.

-- ---------------------------------------------------------------------
-- Bucket: products
-- RECONSTRUIDO (no se encontró el SQL original pegado a mano en el
-- SQL Editor). Sigue el mismo patrón que brands/testimonials.
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS products_storage_select_public ON storage.objects;
CREATE POLICY products_storage_select_public
ON storage.objects
FOR SELECT
USING (bucket_id = 'products');

DROP POLICY IF EXISTS products_storage_insert_admin ON storage.objects;
CREATE POLICY products_storage_insert_admin
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'products'
    AND auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

DROP POLICY IF EXISTS products_storage_update_admin ON storage.objects;
CREATE POLICY products_storage_update_admin
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'products'
    AND auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
)
WITH CHECK (
    bucket_id = 'products'
    AND auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

DROP POLICY IF EXISTS products_storage_delete_admin ON storage.objects;
CREATE POLICY products_storage_delete_admin
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'products'
    AND auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- ---------------------------------------------------------------------
-- Bucket: brands
-- ---------------------------------------------------------------------
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
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

DROP POLICY IF EXISTS brands_storage_update_admin ON storage.objects;
CREATE POLICY brands_storage_update_admin
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'brands'
    AND auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
)
WITH CHECK (
    bucket_id = 'brands'
    AND auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

DROP POLICY IF EXISTS brands_storage_delete_admin ON storage.objects;
CREATE POLICY brands_storage_delete_admin
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'brands'
    AND auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- ---------------------------------------------------------------------
-- Bucket: testimonials
-- ---------------------------------------------------------------------
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
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

DROP POLICY IF EXISTS testimonials_storage_update_admin ON storage.objects;
CREATE POLICY testimonials_storage_update_admin
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'testimonials'
    AND auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
)
WITH CHECK (
    bucket_id = 'testimonials'
    AND auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

DROP POLICY IF EXISTS testimonials_storage_delete_admin ON storage.objects;
CREATE POLICY testimonials_storage_delete_admin
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'testimonials'
    AND auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- =====================================================================
-- FIN DE LA MIGRACIÓN
-- =====================================================================
