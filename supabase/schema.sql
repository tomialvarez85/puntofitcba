-- Esquema base para e-commerce de suplementos en Supabase (PostgreSQL)

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLA: categories
-- =====================================================
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

-- =====================================================
-- TABLA: products
-- =====================================================
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

-- =====================================================
-- TABLA: product_images
-- =====================================================
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

-- =====================================================
-- TABLA: combos
-- =====================================================
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

-- =====================================================
-- TABLA: combo_items
-- =====================================================
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

-- =====================================================
-- TABLA: promotions
-- =====================================================
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

-- =====================================================
-- TABLA: promotion_products
-- =====================================================
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

-- =====================================================
-- ÍNDICES
-- =====================================================
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

-- =====================================================
-- TRIGGERS PARA updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_set_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_combos_set_updated_at
BEFORE UPDATE ON public.combos
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =====================================================
-- RLS (ROW LEVEL SECURITY)
-- =====================================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'categories' AND c.relkind = 'r'
    ) THEN
        ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'products' AND c.relkind = 'r'
    ) THEN
        ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'product_images' AND c.relkind = 'r'
    ) THEN
        ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'combos' AND c.relkind = 'r'
    ) THEN
        ALTER TABLE public.combos ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'combo_items' AND c.relkind = 'r'
    ) THEN
        ALTER TABLE public.combo_items ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'promotions' AND c.relkind = 'r'
    ) THEN
        ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'promotion_products' AND c.relkind = 'r'
    ) THEN
        ALTER TABLE public.promotion_products ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Políticas de lectura pública
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'categories' AND c.relkind = 'r'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'categories_select_public'
    ) THEN
        CREATE POLICY categories_select_public
        ON public.categories
        FOR SELECT
        USING (true);
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'products' AND c.relkind = 'r'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'products_select_public'
    ) THEN
        CREATE POLICY products_select_public
        ON public.products
        FOR SELECT
        USING (active = true);
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'product_images' AND c.relkind = 'r'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'product_images' AND policyname = 'product_images_select_public'
    ) THEN
        CREATE POLICY product_images_select_public
        ON public.product_images
        FOR SELECT
        USING (true);
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'combos' AND c.relkind = 'r'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'combos' AND policyname = 'combos_select_public'
    ) THEN
        CREATE POLICY combos_select_public
        ON public.combos
        FOR SELECT
        USING (active = true);
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'combo_items' AND c.relkind = 'r'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'combo_items' AND policyname = 'combo_items_select_public'
    ) THEN
        CREATE POLICY combo_items_select_public
        ON public.combo_items
        FOR SELECT
        USING (true);
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'promotions' AND c.relkind = 'r'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'promotions' AND policyname = 'promotions_select_public'
    ) THEN
        CREATE POLICY promotions_select_public
        ON public.promotions
        FOR SELECT
        USING (
            active = true
            AND start_date <= NOW()
            AND end_date >= NOW()
        );
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'promotion_products' AND c.relkind = 'r'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'promotion_products' AND policyname = 'promotion_products_select_public'
    ) THEN
        CREATE POLICY promotion_products_select_public
        ON public.promotion_products
        FOR SELECT
        USING (true);
    END IF;
END $$;

-- Políticas de escritura solo para usuarios autenticados con rol admin
-- TODO: reemplazar esta lógica más adelante con una tabla profiles o claims custom.
-- Por ahora queda preparada para ser ampliada cuando exista el sistema de roles.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'categories' AND c.relkind = 'r'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'categories_write_admin'
    ) THEN
        CREATE POLICY categories_write_admin
        ON public.categories
        FOR ALL
        USING (
            auth.role() = 'authenticated'
            AND COALESCE((auth.jwt() ->> 'role'), '') = 'admin'
        )
        WITH CHECK (
            auth.role() = 'authenticated'
            AND COALESCE((auth.jwt() ->> 'role'), '') = 'admin'
        );
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'products' AND c.relkind = 'r'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'products_write_admin'
    ) THEN
        CREATE POLICY products_write_admin
        ON public.products
        FOR ALL
        USING (
            auth.role() = 'authenticated'
            AND COALESCE((auth.jwt() ->> 'role'), '') = 'admin'
        )
        WITH CHECK (
            auth.role() = 'authenticated'
            AND COALESCE((auth.jwt() ->> 'role'), '') = 'admin'
        );
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'product_images' AND c.relkind = 'r'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'product_images' AND policyname = 'product_images_write_admin'
    ) THEN
        CREATE POLICY product_images_write_admin
        ON public.product_images
        FOR ALL
        USING (
            auth.role() = 'authenticated'
            AND COALESCE((auth.jwt() ->> 'role'), '') = 'admin'
        )
        WITH CHECK (
            auth.role() = 'authenticated'
            AND COALESCE((auth.jwt() ->> 'role'), '') = 'admin'
        );
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'combos' AND c.relkind = 'r'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'combos' AND policyname = 'combos_write_admin'
    ) THEN
        CREATE POLICY combos_write_admin
        ON public.combos
        FOR ALL
        USING (
            auth.role() = 'authenticated'
            AND COALESCE((auth.jwt() ->> 'role'), '') = 'admin'
        )
        WITH CHECK (
            auth.role() = 'authenticated'
            AND COALESCE((auth.jwt() ->> 'role'), '') = 'admin'
        );
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'combo_items' AND c.relkind = 'r'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'combo_items' AND policyname = 'combo_items_write_admin'
    ) THEN
        CREATE POLICY combo_items_write_admin
        ON public.combo_items
        FOR ALL
        USING (
            auth.role() = 'authenticated'
            AND COALESCE((auth.jwt() ->> 'role'), '') = 'admin'
        )
        WITH CHECK (
            auth.role() = 'authenticated'
            AND COALESCE((auth.jwt() ->> 'role'), '') = 'admin'
        );
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'promotions' AND c.relkind = 'r'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'promotions' AND policyname = 'promotions_write_admin'
    ) THEN
        CREATE POLICY promotions_write_admin
        ON public.promotions
        FOR ALL
        USING (
            auth.role() = 'authenticated'
            AND COALESCE((auth.jwt() ->> 'role'), '') = 'admin'
        )
        WITH CHECK (
            auth.role() = 'authenticated'
            AND COALESCE((auth.jwt() ->> 'role'), '') = 'admin'
        );
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'promotion_products' AND c.relkind = 'r'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'promotion_products' AND policyname = 'promotion_products_write_admin'
    ) THEN
        CREATE POLICY promotion_products_write_admin
        ON public.promotion_products
        FOR ALL
        USING (
            auth.role() = 'authenticated'
            AND COALESCE((auth.jwt() ->> 'role'), '') = 'admin'
        )
        WITH CHECK (
            auth.role() = 'authenticated'
            AND COALESCE((auth.jwt() ->> 'role'), '') = 'admin'
        );
    END IF;
END $$;
