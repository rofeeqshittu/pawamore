-- Enable realtime for orders table (for live status updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;