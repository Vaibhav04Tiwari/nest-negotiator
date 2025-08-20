-- Create labour profiles table
CREATE TABLE public.labour_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  trade TEXT NOT NULL,
  experience_years INTEGER NOT NULL DEFAULT 0,
  rate_per_day INTEGER NOT NULL,
  rating DECIMAL(2,1) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  avatar_url TEXT,
  bio TEXT,
  skills TEXT[],
  is_verified BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.labour_profiles ENABLE row LEVEL SECURITY;

-- Create policies for labour profiles
CREATE POLICY "Anyone can view labour profiles"
ON public.labour_profiles
FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own labour profile"
ON public.labour_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own labour profile"
ON public.labour_profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for labour profiles timestamp updates
CREATE TRIGGER update_labour_profiles_updated_at
  BEFORE UPDATE ON public.labour_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();