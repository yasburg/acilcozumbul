// tr.svg (simplemaps.com, free for commercial use) içindeki il sınırlarını
// ayrıştırıp src/data/turkiye-il-sinir.json'a yazar. Kayıt akışındaki
// Türkiye haritası (KayitSehirHarita) bu veriyi kullanır.
//
// Kullanım: node scripts/generate-il-sinir-verisi.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const KOK = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const KAYNAK_SVG = path.join(KOK, "tr.svg");
const HEDEF_JSON = path.join(KOK, "src/data/turkiye-il-sinir.json");

/** TR plaka kodu → Türkçe il adı (tr.svg'deki "name" alanı aksansız/hatalı) */
const KOD_IL_ADI = {
  TR01: "Adana",
  TR02: "Adıyaman",
  TR03: "Afyonkarahisar",
  TR04: "Ağrı",
  TR05: "Amasya",
  TR06: "Ankara",
  TR07: "Antalya",
  TR08: "Artvin",
  TR09: "Aydın",
  TR10: "Balıkesir",
  TR11: "Bilecik",
  TR12: "Bingöl",
  TR13: "Bitlis",
  TR14: "Bolu",
  TR15: "Burdur",
  TR16: "Bursa",
  TR17: "Çanakkale",
  TR18: "Çankırı",
  TR19: "Çorum",
  TR20: "Denizli",
  TR21: "Diyarbakır",
  TR22: "Edirne",
  TR23: "Elazığ",
  TR24: "Erzincan",
  TR25: "Erzurum",
  TR26: "Eskişehir",
  TR27: "Gaziantep",
  TR28: "Giresun",
  TR29: "Gümüşhane",
  TR30: "Hakkari",
  TR31: "Hatay",
  TR32: "Isparta",
  TR33: "Mersin",
  TR34: "İstanbul",
  TR35: "İzmir",
  TR36: "Kars",
  TR37: "Kastamonu",
  TR38: "Kayseri",
  TR39: "Kırklareli",
  TR40: "Kırşehir",
  TR41: "Kocaeli",
  TR42: "Konya",
  TR43: "Kütahya",
  TR44: "Malatya",
  TR45: "Manisa",
  TR46: "Kahramanmaraş",
  TR47: "Mardin",
  TR48: "Muğla",
  TR49: "Muş",
  TR50: "Nevşehir",
  TR51: "Niğde",
  TR52: "Ordu",
  TR53: "Rize",
  TR54: "Sakarya",
  TR55: "Samsun",
  TR56: "Siirt",
  TR57: "Sinop",
  TR58: "Sivas",
  TR59: "Tekirdağ",
  TR60: "Tokat",
  TR61: "Trabzon",
  TR62: "Tunceli",
  TR63: "Şanlıurfa",
  TR64: "Uşak",
  TR65: "Van",
  TR66: "Yozgat",
  TR67: "Zonguldak",
  TR68: "Aksaray",
  TR69: "Bayburt",
  TR70: "Karaman",
  TR71: "Kırıkkale",
  TR72: "Batman",
  TR73: "Şırnak",
  TR74: "Bartın",
  TR75: "Ardahan",
  TR76: "Iğdır",
  TR77: "Yalova",
  TR78: "Karabük",
  TR79: "Kilis",
  TR80: "Osmaniye",
  TR81: "Düzce",
};

function svgYoluAyristir(d) {
  const tokenlar = d.match(/[MmLlZz]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
  let i = 0;
  let su = { x: 0, y: 0 };
  let altYolBaslangic = { x: 0, y: 0 };
  const halkalar = [];
  let halka = null;

  const sayiMi = () => i < tokenlar.length && /^-?\d/.test(tokenlar[i]);
  const say = () => parseFloat(tokenlar[i++]);

  while (i < tokenlar.length) {
    const komut = tokenlar[i++];
    if (komut === "M") {
      su = { x: say(), y: say() };
      altYolBaslangic = { ...su };
      halka = [{ ...su }];
      halkalar.push(halka);
      while (sayiMi()) {
        su = { x: say(), y: say() };
        halka.push({ ...su });
      }
    } else if (komut === "m") {
      su = { x: su.x + say(), y: su.y + say() };
      altYolBaslangic = { ...su };
      halka = [{ ...su }];
      halkalar.push(halka);
      while (sayiMi()) {
        su = { x: su.x + say(), y: su.y + say() };
        halka.push({ ...su });
      }
    } else if (komut === "L") {
      while (sayiMi()) {
        su = { x: say(), y: say() };
        halka.push({ ...su });
      }
    } else if (komut === "l") {
      while (sayiMi()) {
        su = { x: su.x + say(), y: su.y + say() };
        halka.push({ ...su });
      }
    } else if (komut === "Z" || komut === "z") {
      su = { ...altYolBaslangic };
    }
  }
  return halkalar;
}

function alanHesapla(halka) {
  let a = 0;
  for (let i = 0; i < halka.length; i++) {
    const p1 = halka[i];
    const p2 = halka[(i + 1) % halka.length];
    a += p1.x * p2.y - p2.x * p1.y;
  }
  return a / 2;
}

function agirlikliMerkez(halka) {
  let alan = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < halka.length; i++) {
    const p1 = halka[i];
    const p2 = halka[(i + 1) % halka.length];
    const capraz = p1.x * p2.y - p2.x * p1.y;
    alan += capraz;
    cx += (p1.x + p2.x) * capraz;
    cy += (p1.y + p2.y) * capraz;
  }
  alan /= 2;
  if (Math.abs(alan) < 1e-6) {
    const n = halka.length || 1;
    const ort = halka.reduce((s, p) => ({ x: s.x + p.x, y: s.y + p.y }), { x: 0, y: 0 });
    return { x: ort.x / n, y: ort.y / n };
  }
  return { x: cx / (6 * alan), y: cy / (6 * alan) };
}

function noktaHalkaIcindeMi(nokta, halka) {
  let icinde = false;
  for (let i = 0, j = halka.length - 1; i < halka.length; j = i++) {
    const xi = halka[i].x, yi = halka[i].y;
    const xj = halka[j].x, yj = halka[j].y;
    const kesisim =
      yi > nokta.y !== yj > nokta.y &&
      nokta.x < ((xj - xi) * (nokta.y - yi)) / (yj - yi) + xi;
    if (kesisim) icinde = !icinde;
  }
  return icinde;
}

/** Douglas-Peucker basitleştirme */
function basitlestir(noktalar, epsilon) {
  if (noktalar.length < 3) return noktalar;
  const dHesapla = (p, a, b) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const uzunlukKare = dx * dx + dy * dy;
    if (uzunlukKare === 0) return Math.hypot(p.x - a.x, p.y - a.y);
    const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / uzunlukKare;
    const tc = Math.max(0, Math.min(1, t));
    const projX = a.x + tc * dx;
    const projY = a.y + tc * dy;
    return Math.hypot(p.x - projX, p.y - projY);
  };
  let enUzak = 0;
  let enUzakIndex = 0;
  for (let i = 1; i < noktalar.length - 1; i++) {
    const d = dHesapla(noktalar[i], noktalar[0], noktalar[noktalar.length - 1]);
    if (d > enUzak) {
      enUzak = d;
      enUzakIndex = i;
    }
  }
  if (enUzak > epsilon) {
    const sol = basitlestir(noktalar.slice(0, enUzakIndex + 1), epsilon);
    const sag = basitlestir(noktalar.slice(enUzakIndex), epsilon);
    return [...sol.slice(0, -1), ...sag];
  }
  return [noktalar[0], noktalar[noktalar.length - 1]];
}

function yuvarla(n) {
  return Math.round(n * 10) / 10;
}

const svgIcerik = readFileSync(KAYNAK_SVG, "utf8");
const viewBoxEslesme = svgIcerik.match(/viewbox="([^"]*)"/i);
const viewBox = viewBoxEslesme ? viewBoxEslesme[1] : "0 0 1000 422";

const pathEtiketleri = svgIcerik.match(/<path\b[^>]*>/g) ?? [];

const iller = {};
const eslesmeyenler = [];

for (const etiket of pathEtiketleri) {
  const idEslesme = etiket.match(/ id="([^"]*)"/);
  const dEslesme = etiket.match(/ d="([^"]*)"/);
  if (!idEslesme || !dEslesme) continue;
  const kod = idEslesme[1];
  const ilAdi = KOD_IL_ADI[kod];
  if (!ilAdi) {
    eslesmeyenler.push(kod);
    continue;
  }

  const halkalarHam = svgYoluAyristir(dEslesme[1]);
  const halkalar = halkalarHam
    .map((h) => basitlestir(h, 0.6))
    .filter((h) => h.length >= 3);

  let anaHalkaIndex = 0;
  let enBuyukAlan = -Infinity;
  halkalar.forEach((h, idx) => {
    const alan = Math.abs(alanHesapla(h));
    if (alan > enBuyukAlan) {
      enBuyukAlan = alan;
      anaHalkaIndex = idx;
    }
  });

  const anaHalka = halkalar[anaHalkaIndex];
  let merkez = agirlikliMerkez(anaHalka);
  if (!noktaHalkaIcindeMi(merkez, anaHalka)) {
    // Çok içbükey şekillerde ağırlıklı merkez dışarı düşebilir — en yakın
    // köşe noktasına atla (her zaman kara üzerinde kalması garanti olsun).
    let enYakin = anaHalka[0];
    let enYakinMesafe = Infinity;
    for (const p of anaHalka) {
      const m = Math.hypot(p.x - merkez.x, p.y - merkez.y);
      if (m < enYakinMesafe) {
        enYakinMesafe = m;
        enYakin = p;
      }
    }
    merkez = enYakin;
  }

  // Yakınlaştırma çerçevesi TÜM halkaları (adalar, Boğaz'ın iki yakası vb.)
  // kapsasın diye birleşik kutu; merkez/nokta-içinde testleri ise yalnızca
  // anakara halkasını kullanır.
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const h of halkalar) {
    for (const p of h) {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    }
  }

  iller[ilAdi] = {
    kod,
    halkalar: halkalar.map((h) => h.map((p) => [yuvarla(p.x), yuvarla(p.y)])),
    anaHalkaIndex,
    merkez: { x: yuvarla(merkez.x), y: yuvarla(merkez.y) },
    kutu: { minX: yuvarla(minX), maxX: yuvarla(maxX), minY: yuvarla(minY), maxY: yuvarla(maxY) },
  };
}

if (eslesmeyenler.length) {
  console.error("Eşlenemeyen plaka kodları:", eslesmeyenler);
  process.exit(1);
}

const toplamIl = Object.keys(iller).length;
if (toplamIl !== 81) {
  console.error(`Beklenen 81 il, bulunan ${toplamIl}`);
  process.exit(1);
}

const cikti = { viewBox, iller };
writeFileSync(HEDEF_JSON, JSON.stringify(cikti));

const toplamNokta = Object.values(iller).reduce(
  (t, il) => t + il.halkalar.reduce((s, h) => s + h.length, 0),
  0
);
console.log(`${toplamIl} il yazıldı → ${HEDEF_JSON}`);
console.log(`Toplam nokta: ${toplamNokta}, dosya boyutu: ${(JSON.stringify(cikti).length / 1024).toFixed(1)} KB`);
