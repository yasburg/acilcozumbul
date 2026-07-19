# Ölçeklenebilirlik regression smoke checklist

Her faz deploy sonrası:

1. Yeni müşteri talebi oluştur (OTP → talep)
2. Uygun çekiciye bildirim gittiğini doğrula (panel / SMS log)
3. Çekici paneli: bugünkü açık / gizli talepler listeleniyor
4. Çekici ihaleye katıl (kredi düşümü)
5. Teklif ver (min 100 TL)
6. Müşteri bekle ekranında teklif görünüyor; puan / rozet sıralaması doğru
7. Müşteri teklif seç → `kazanan_belli`
8. Anlaştı → `anlaşıldı`
9. Ayrı senaryo: anlaşamadı → kalan teklifler veya yeniden ihale
10. Çekici istatistik: teklif sayısı / kazanç / haftalık SMS harcaması makul
11. Admin panel: talepler sayfalı listeleniyor; özet sayıları dolu
12. Demo oturum: production `talepler` satırı yazılmadan çalışıyor

## Baseline (Faz 0 — migration öncesi kaydet)

```sql
select count(*) as talep_sayisi from public.talepler;
select coalesce(avg(jsonb_array_length(teklifler)), 0) as ort_teklif
  from public.talepler;
select count(*) as sms_log_sayisi from public.sms_log;
select count(*) as cekici_sayisi from public.cekiciler;
```

Yavaş endpoint’ler (manuel veya APM): `GET /api/cekici/talepler`, `GET /api/talep/:id/teklifler`, `GET /api/cekici/istatistik`.
