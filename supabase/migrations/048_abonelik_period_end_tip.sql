-- İptal sonrası dönem sonu abonelik kredisi yakma olayı

alter table public.abonelik_islem
  drop constraint if exists abonelik_islem_tip_check;

alter table public.abonelik_islem
  add constraint abonelik_islem_tip_check
  check (
    tip in (
      'created',
      'renewal',
      'cancelled',
      'payment_failed',
      'expired',
      'retry',
      'period_end'
    )
  );
