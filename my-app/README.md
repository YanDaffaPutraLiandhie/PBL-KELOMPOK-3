# 🌿 Smart Irrigation System — Next.js Dashboard

Dashboard monitoring sistem irigasi cerdas berbasis Next.js 14 dengan tampilan real-time.

## 🚀 Cara Menjalankan

### 1. Install dependencies

```bash
npm install
```

### 2. Jalankan development server

```bash
npm run dev
```

### 3. Buka browser

```
http://localhost:3000
```

---

## 📁 Struktur Project

```
smart-irrigation/
├── app/
│   ├── globals.css         # Global styles & CSS variables
│   ├── layout.tsx          # Root layout (HTML wrapper)
│   └── page.tsx            # Halaman utama dashboard
├── components/
│   ├── Header.tsx          # Header dengan toggle dark/light
│   ├── SensorCards.tsx     # Kartu sensor (kelembaban, suhu, pompa)
│   ├── ChartSection.tsx    # Grafik histori (Recharts)
│   ├── IrrigationStats.tsx # Statistik penyiraman
│   ├── ActivityLog.tsx     # Log aktivitas
│   ├── WaterAvailability.tsx # Ketersediaan air
│   └── QuickControl.tsx    # Kontrol manual cepat
├── lib/
│   └── mockData.ts         # Data simulasi sensor
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## ✨ Fitur

- **Dark / Light Mode** — Toggle tema secara real-time
- **Data Sensor Real-time** — Update otomatis setiap 5 detik (simulasi)
- **Grafik Histori** — Kelembaban tanah & suhu (Recharts AreaChart)
- **Statistik Penyiraman** — Normal, Nitrogen N, Buka Valve Draen
- **Log Aktivitas** — Catat setiap aksi kontrol manual
- **Ketersediaan Air** — Progress bar dinamis dengan kode warna
- **Kontrol Manual** — Tombol aksi cepat dengan loading state
- **Fully Responsive** — Mobile-first layout

---

## 🔧 Integrasi API (Opsional)

Untuk menghubungkan ke sensor nyata, ganti fungsi di `lib/mockData.ts` dengan API call ke backend/IoT gateway:

```typescript
// Contoh fetch data dari ESP32 / Arduino
export async function fetchSensorData() {
  const res = await fetch("http://your-device-ip/api/sensors");
  return res.json();
}
```

---

## 🛠 Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Recharts** — Grafik
- **Lucide React** — Ikon
