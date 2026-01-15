-- Seed data for testing and development
-- This file provides realistic test data for all major entities

-- Enable UUID extension (should already be enabled from migration)
-- create extension if not exists "uuid-ossp";

-- Insert test packages
INSERT INTO public.packages (name, code, description, price_monthly, price_setup, is_active) VALUES
  ('Basic Website', 'basic', 'Simple landing page with basic features', 1500000.00, 2000000.00, true),
  ('Professional Website', 'pro', 'Professional website with advanced features', 3500000.00, 5000000.00, true),
  ('E-commerce Website', 'ecommerce', 'Full-featured e-commerce platform', 7000000.00, 10000000.00, true),
  ('Custom Application', 'custom', 'Custom web application development', 12000000.00, 20000000.00, true)
ON CONFLICT (code) DO NOTHING;

-- Insert test clients
INSERT INTO public.clients (name, slug, industry, status) VALUES
  ('PT Maju Jaya', 'maju-jaya', 'Manufacturing', 'active'),
  ('CV Sejahtera', 'sejahtera', 'Retail', 'active'),
  ('PT Teknologi Indonesia', 'teknologi-indonesia', 'Technology', 'active'),
  ('Toko Budi', 'toko-budi', 'E-commerce', 'pending'),
  ('Restoran Nusantara', 'restoran-nusantara', 'Food & Beverage', 'active')
ON CONFLICT DO NOTHING;

-- Get client IDs for references
DO $$
DECLARE
  v_client1 uuid := (SELECT id FROM public.clients WHERE slug = 'maju-jaya' LIMIT 1);
  v_client2 uuid := (SELECT id FROM public.clients WHERE slug = 'sejahtera' LIMIT 1);
  v_client3 uuid := (SELECT id FROM public.clients WHERE slug = 'teknologi-indonesia' LIMIT 1);
  v_package1 uuid := (SELECT id FROM public.packages WHERE code = 'basic' LIMIT 1);
  v_package2 uuid := (SELECT id FROM public.packages WHERE code = 'pro' LIMIT 1);
  v_package3 uuid := (SELECT id FROM public.packages WHERE code = 'ecommerce' LIMIT 1);
  
  v_project_id1 uuid := gen_random_uuid();
  v_project_id2 uuid := gen_random_uuid();
  v_project_id3 uuid := gen_random_uuid();
BEGIN
  -- Insert test projects
  INSERT INTO public.projects (id, client_id, package_id, name, slug, status) VALUES
    (v_project_id1, v_client1, v_package2, 'Company Website', 'maju-jaya-company-website', 'active'),
    (v_project_id2, v_client2, v_package3, 'Online Store', 'sejahtera-online-store', 'active'),
    (v_project_id3, v_client3, v_package1, 'Landing Page', 'teknologi-landing', 'planning')
  ON CONFLICT DO NOTHING;
  
  -- Insert test websites
  INSERT INTO public.websites (project_id, client_id, domain, provider, go_live_at, monitoring_status) VALUES
    (v_project_id1, v_client1, 'majujaya.com', 'Cloudflare', '2024-01-15 00:00:00', 'up'),
    (v_project_id2, v_client2, 'sejahtera.co.id', 'Netlify', '2024-02-01 00:00:00', 'up')
  ON CONFLICT DO NOTHING;
  
  -- Insert test products
  INSERT INTO public.products (package_id, name, type, metadata, price) VALUES
    (v_package1, 'SEO Optimization', 'service', '{"duration": "monthly"}', 500000.00),
    (v_package1, 'Content Writing', 'service', '{"per_article": 10}', 150000.00),
    (v_package2, 'Analytics Setup', 'service', '{"tools": ["GA4", "GTM"]}', 1000000.00),
    (v_package3, 'Payment Gateway Integration', 'feature', '{"providers": ["midtrans", "xendit"]}', 2000000.00),
    (v_package3, 'Inventory Management', 'feature', '{"type": "basic"}', 1500000.00)
  ON CONFLICT DO NOTHING;
  
  -- Insert test subscriptions
  INSERT INTO public.subscriptions (client_id, package_id, status, billing_cycle, current_period_start, current_period_end) VALUES
    (v_client1, v_package2, 'active', 'monthly', '2024-12-01 00:00:00', '2025-01-01 00:00:00'),
    (v_client2, v_package3, 'active', 'annual', '2024-01-01 00:00:00', '2025-01-01 00:00:00')
  ON CONFLICT DO NOTHING;
  
  -- Get subscription IDs
  DECLARE v_sub1 uuid := (SELECT id FROM public.subscriptions WHERE client_id = v_client1 LIMIT 1);
  DECLARE v_sub2 uuid := (SELECT id FROM public.subscriptions WHERE client_id = v_client2 LIMIT 1);
  DECLARE v_inv1 uuid := gen_random_uuid();
  DECLARE v_inv2 uuid := gen_random_uuid();
  DECLARE v_inv3 uuid := gen_random_uuid();
  
  -- Insert test invoices
  INSERT INTO public.invoices (id, client_id, subscription_id, total, currency, status, due_date, issued_at) VALUES
    (v_inv1, v_client1, v_sub1, 3500000.00, 'IDR', 'paid', '2024-12-15', '2024-12-01 00:00:00'),
    (v_inv2, v_client2, v_sub2, 70000000.00, 'IDR', 'pending', '2025-01-15', '2025-01-01 00:00:00'),
    (v_inv3, v_client3, NULL, 2000000.00, 'IDR', 'overdue', '2024-11-15', '2024-11-01 00:00:00')
  ON CONFLICT DO NOTHING;
  
  -- Insert test payments
  INSERT INTO public.payments (invoice_id, client_id, provider, provider_reference, amount, status, paid_at) VALUES
    (v_inv1, v_client1, 'Midtrans', 'MID-123456', 3500000.00, 'succeeded', '2024-12-10 10:30:00'),
    (v_inv1, v_client1, 'Midtrans', 'MID-123457', -100000.00, 'refunded', '2024-12-12 14:00:00')
  ON CONFLICT DO NOTHING;
  
  -- Insert test addons
  INSERT INTO public.addons (client_id, name, price, is_recurring, metadata) VALUES
    (v_client1, 'Premium Support', 1500000.00, true, '{"sla": "24h"}'),
    (v_client1, 'Backup Service', 500000.00, true, '{"frequency": "daily", "retention": "30d"}'),
    (v_client2, 'Marketing Package', 3000000.00, false, '{"services": ["seo", "social_media"]}')
  ON CONFLICT DO NOTHING;
  
  -- Insert test tickets
  INSERT INTO public.tickets (client_id, project_id, subject, category, priority, status, sla_due) VALUES
    (v_client1, v_project_id1, 'Website loading slowly', 'Performance', 'medium', 'open', '2025-01-10 00:00:00'),
    (v_client2, v_project_id2, 'Payment not processing', 'Bug', 'critical', 'in-progress', '2025-01-08 00:00:00'),
    (v_client1, v_project_id1, 'Need to update logo', 'Change Request', 'low', 'resolved', '2025-01-05 00:00:00')
  ON CONFLICT DO NOTHING;
  
  -- Insert test documentation
  INSERT INTO public.docs (client_id, title, slug, content_md, visibility) VALUES
    (v_client1, 'Getting Started Guide', 'getting-started', '# Getting Started\n\nWelcome to your new website!', 'public'),
    (v_client1, 'Admin Dashboard', 'admin-dashboard', '# Admin Dashboard\n\nLearn how to manage your site.', 'internal'),
    (v_client2, 'Product Management', 'product-management', '# Managing Products\n\nAdd, edit, and delete products.', 'private')
  ON CONFLICT DO NOTHING;
  
  -- Insert test tutorials
  INSERT INTO public.tutorials (client_id, title, video_url, steps) VALUES
    (v_client1, 'How to add a new product', 'https://youtube.com/watch?v=example1', 
     '{"steps": ["Login to dashboard", "Go to Products", "Click Add New", "Fill in details"]}'::jsonb),
    (v_client2, 'Processing orders guide', 'https://youtube.com/watch?v=example2',
     '{"steps": ["View orders", "Select order", "Update status", "Notify customer"]}'::jsonb)
  ON CONFLICT DO NOTHING;
  
  -- Insert test KB categories
  INSERT INTO public.kb_categories (client_id, name, slug) VALUES
    (v_client1, 'General', 'general'),
    (v_client1, 'Technical', 'technical'),
    (v_client1, 'Billing', 'billing'),
    (v_client2, 'E-commerce', 'ecommerce'),
    (v_client2, 'Marketing', 'marketing')
  ON CONFLICT DO NOTHING;
END $$;

-- Note: user_profiles would need actual auth.users records
-- These should be created through the Supabase auth system
-- For testing, you might need to create test users first via Supabase CLI or Dashboard
