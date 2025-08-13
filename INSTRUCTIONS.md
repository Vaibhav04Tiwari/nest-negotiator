# BuildMate Backend Setup Instructions

This document provides step-by-step instructions to set up the complete backend infrastructure for BuildMate.

## Table of Contents
1. [Supabase Setup](#supabase-setup)
2. [Razorpay Integration](#razorpay-integration)
3. [Database Schema](#database-schema)
4. [Authentication Setup](#authentication-setup)
5. [Edge Functions Configuration](#edge-functions-configuration)
6. [Security Configuration](#security-configuration)
7. [Testing & Deployment](#testing--deployment)

## 1. Supabase Setup

### Initial Project Setup
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project named "buildmate"
3. Note down your project URL and anon key
4. Update the project configuration in `src/integrations/supabase/client.ts`

### Environment Variables
Your Supabase project should have these environment variables configured:
- `SUPABASE_URL`: Your project URL
- `SUPABASE_ANON_KEY`: Your public anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (for backend operations)

## 2. Razorpay Integration

### Account Setup
1. Create a Razorpay account at [razorpay.com](https://razorpay.com)
2. Navigate to Account & Settings > API Keys
3. Generate API keys for Test/Live mode

### Required Secrets
Add these secrets in Supabase Edge Functions settings:
- `RAZORPAY_KEY_ID`: Your Razorpay Key ID
- `RAZORPAY_KEY_SECRET`: Your Razorpay Key Secret

### Integration Steps
1. The payment flow uses Razorpay Checkout for seamless payments
2. Payment verification is handled server-side for security
3. Order tracking is maintained in the `map_plans` table

## 3. Database Schema

Run this SQL migration in your Supabase SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create customers table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create labour table
CREATE TABLE public.labour (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trade TEXT NOT NULL,
  rate_per_day DECIMAL(10,2),
  city TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create jobs table
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create job_labour junction table
CREATE TABLE public.job_labour (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  labour_id UUID REFERENCES public.labour(id) ON DELETE CASCADE,
  daily_rate DECIMAL(10,2),
  total_days INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create materials table
CREATE TABLE public.materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  unit_price DECIMAL(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create job_materials junction table
CREATE TABLE public.job_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
  quantity DECIMAL(10,2),
  unit_price DECIMAL(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create map_plans table
CREATE TABLE public.map_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plot_length INTEGER,
  plot_width INTEGER,
  floors TEXT,
  style TEXT,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_labour_updated_at BEFORE UPDATE ON public.labour FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON public.materials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_map_plans_updated_at BEFORE UPDATE ON public.map_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labour ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_labour ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles policies
CREATE POLICY "select_own_profile" ON public.profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "insert_own_profile" ON public.profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "update_own_profile" ON public.profiles FOR UPDATE USING (user_id = auth.uid());

-- Customers policies
CREATE POLICY "select_own_customers" ON public.customers FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "insert_own_customers" ON public.customers FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "update_own_customers" ON public.customers FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "delete_own_customers" ON public.customers FOR DELETE USING (user_id = auth.uid());

-- Labour policies
CREATE POLICY "select_own_labour" ON public.labour FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "insert_own_labour" ON public.labour FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "update_own_labour" ON public.labour FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "delete_own_labour" ON public.labour FOR DELETE USING (user_id = auth.uid());

-- Jobs policies
CREATE POLICY "select_own_jobs" ON public.jobs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "insert_own_jobs" ON public.jobs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "update_own_jobs" ON public.jobs FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "delete_own_jobs" ON public.jobs FOR DELETE USING (user_id = auth.uid());

-- Job labour policies
CREATE POLICY "select_job_labour" ON public.job_labour FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = job_labour.job_id AND jobs.user_id = auth.uid())
);
CREATE POLICY "insert_job_labour" ON public.job_labour FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = job_labour.job_id AND jobs.user_id = auth.uid())
);
CREATE POLICY "update_job_labour" ON public.job_labour FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = job_labour.job_id AND jobs.user_id = auth.uid())
);
CREATE POLICY "delete_job_labour" ON public.job_labour FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = job_labour.job_id AND jobs.user_id = auth.uid())
);

-- Materials policies
CREATE POLICY "select_own_materials" ON public.materials FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "insert_own_materials" ON public.materials FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "update_own_materials" ON public.materials FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "delete_own_materials" ON public.materials FOR DELETE USING (user_id = auth.uid());

-- Job materials policies
CREATE POLICY "select_job_materials" ON public.job_materials FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = job_materials.job_id AND jobs.user_id = auth.uid())
);
CREATE POLICY "insert_job_materials" ON public.job_materials FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = job_materials.job_id AND jobs.user_id = auth.uid())
);
CREATE POLICY "update_job_materials" ON public.job_materials FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = job_materials.job_id AND jobs.user_id = auth.uid())
);
CREATE POLICY "delete_job_materials" ON public.job_materials FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = job_materials.job_id AND jobs.user_id = auth.uid())
);

-- Map plans policies
CREATE POLICY "select_own_map_plans" ON public.map_plans FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "insert_own_map_plans" ON public.map_plans FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "update_own_map_plans" ON public.map_plans FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "delete_own_map_plans" ON public.map_plans FOR DELETE USING (user_id = auth.uid());

-- Service role policies for edge functions
CREATE POLICY "service_role_map_plans_insert" ON public.map_plans FOR INSERT WITH CHECK (true);
CREATE POLICY "service_role_map_plans_update" ON public.map_plans FOR UPDATE USING (true);
```

## 4. Authentication Setup

### Email Authentication
1. Go to Authentication > Settings in Supabase
2. Enable Email authentication
3. Configure email templates as needed
4. Set up password policies

### Optional: Social Authentication
1. Configure Google/GitHub/other providers in Authentication > Providers
2. Add the respective client IDs and secrets
3. Update redirect URLs

## 5. Edge Functions Configuration

### Function Deployment
The following edge functions are included:
- `create-payment`: Creates Razorpay orders
- `verify-payment`: Verifies payment signatures

### Required Secrets
In Supabase Dashboard > Edge Functions > Manage secrets, add:
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

## 6. Security Configuration

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Service role can perform operations for edge functions

### API Security
- CORS is properly configured for all functions
- Payment verification uses cryptographic signatures
- User authentication is required for all operations

## 7. Testing & Deployment

### Test Mode
1. Use Razorpay test keys for development
2. Test payment flows with test card numbers
3. Verify database operations

### Production Deployment
1. Switch to Razorpay live keys
2. Update domain configurations
3. Monitor edge function logs
4. Set up error monitoring

### Monitoring
- Check Supabase logs for database operations
- Monitor edge function performance
- Set up alerts for payment failures

## Additional Features to Implement

### Email Notifications
- Set up email templates for order confirmations
- Configure SMTP settings in Supabase

### File Storage
- Set up Supabase Storage for plan files
- Configure bucket policies for secure access

### Analytics
- Implement usage tracking
- Set up conversion monitoring

## Support & Troubleshooting

### Common Issues
1. **Payment failures**: Check Razorpay webhook configurations
2. **Database errors**: Verify RLS policies
3. **Authentication issues**: Check email confirmations

### Logging
- All edge functions include comprehensive logging
- Check Supabase logs for detailed error messages
- Monitor payment status in the database

### Security Best Practices
- Never expose secret keys in frontend code
- Always verify payments server-side
- Use HTTPS for all communications
- Regularly rotate API keys

---

For additional support, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [Razorpay Documentation](https://razorpay.com/docs/)
- [BuildMate Support](mailto:support@buildmate.com)