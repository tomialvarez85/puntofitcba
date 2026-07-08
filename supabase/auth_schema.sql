-- Esquema de autenticación y roles para Supabase

-- =====================================================
-- TABLA: profiles
-- =====================================================
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

-- =====================================================
-- TRIGGER: crear perfil al crear usuario
-- =====================================================
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

-- =====================================================
-- RLS para profiles
-- =====================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own
ON public.profiles
FOR SELECT
USING (id = auth.uid());

-- No se crean políticas de insert/update/delete para que el cliente no pueda modificar perfiles.

-- =====================================================
-- Políticas de escritura admin usando profiles
-- =====================================================
-- categories
DROP POLICY IF EXISTS categories_write_admin ON public.categories;
CREATE POLICY categories_write_admin
ON public.categories
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

-- products
DROP POLICY IF EXISTS products_write_admin ON public.products;
CREATE POLICY products_write_admin
ON public.products
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

-- product_images
DROP POLICY IF EXISTS product_images_write_admin ON public.product_images;
CREATE POLICY product_images_write_admin
ON public.product_images
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

-- combos
DROP POLICY IF EXISTS combos_write_admin ON public.combos;
CREATE POLICY combos_write_admin
ON public.combos
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

-- combo_items
DROP POLICY IF EXISTS combo_items_write_admin ON public.combo_items;
CREATE POLICY combo_items_write_admin
ON public.combo_items
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

-- promotions
DROP POLICY IF EXISTS promotions_write_admin ON public.promotions;
CREATE POLICY promotions_write_admin
ON public.promotions
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

-- promotion_products
DROP POLICY IF EXISTS promotion_products_write_admin ON public.promotion_products;
CREATE POLICY promotion_products_write_admin
ON public.promotion_products
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
