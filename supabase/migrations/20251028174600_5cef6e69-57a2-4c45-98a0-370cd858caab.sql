-- Enable reliable realtime for transactions (idempotent)
DO $$ BEGIN
  EXECUTE 'ALTER TABLE public.transactions REPLICA IDENTITY FULL';
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'transactions'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions';
  END IF;
END $$;