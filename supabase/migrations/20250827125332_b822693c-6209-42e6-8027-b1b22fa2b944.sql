-- Create suborganizers table
CREATE TABLE public.suborganizers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  village TEXT NOT NULL,
  crop_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  suborganizer_id UUID NOT NULL REFERENCES public.suborganizers(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount DECIMAL(10,2) NOT NULL,
  purpose TEXT NOT NULL,
  payment_mode TEXT NOT NULL,
  bill_receipt_url TEXT,
  payment_screenshot_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (but allow all operations since no auth)
ALTER TABLE public.suborganizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (no authentication required)
CREATE POLICY "Allow all operations on suborganizers" 
ON public.suborganizers 
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations on payments" 
ON public.payments 
FOR ALL
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_suborganizers_updated_at
  BEFORE UPDATE ON public.suborganizers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for receipts and payment screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true);

-- Create storage policies
CREATE POLICY "Allow all operations on receipts bucket" 
ON storage.objects 
FOR ALL
USING (bucket_id = 'receipts')
WITH CHECK (bucket_id = 'receipts');

-- Add indexes for better performance
CREATE INDEX idx_payments_suborganizer_id ON public.payments(suborganizer_id);
CREATE INDEX idx_payments_date ON public.payments(date);
CREATE INDEX idx_payments_purpose ON public.payments(purpose);
CREATE INDEX idx_payments_payment_mode ON public.payments(payment_mode);