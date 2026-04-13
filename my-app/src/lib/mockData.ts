export function generateSensorData() {
  const soilBase = 48;
  const tempBase = 25;

  return {
    soilMoisture: soilBase + Math.floor(Math.random() * 6 - 3),
    temperature: tempBase + parseFloat((Math.random() * 2 - 1).toFixed(1)),
    pumpStatus: Math.random() > 0.15 ? "AKTIF" : "NON-AKTIF",
  };
}

export function generateChartData(hours = 6) {
  const data = [];
  const now = new Date();
  for (let i = hours; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 60 * 60 * 1000);
    const label = t.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    data.push({
      time: label,
      kelembaban: 40 + Math.floor(Math.random() * 25),
      suhu: 22 + parseFloat((Math.random() * 8).toFixed(1)),
    });
  }
  return data;
}

export interface IrrigationEvent {
  timestamp: Date;
  duration: number;
  type: "quick" | "intensive" | "water-saving";
}

export function generateIrrigationEvents(): IrrigationEvent[] {
  const events: IrrigationEvent[] = [];
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const durations: number[] = [5, 10, 20];

  // Generate random irrigation events for the last 30 days
  let currentDate = new Date(thirtyDaysAgo);
  while (currentDate <= now) {
    // Randomly add 0-3 irrigation events per day
    const eventsPerDay = Math.floor(Math.random() * 4);
    for (let i = 0; i < eventsPerDay; i++) {
      const randomDuration = durations[Math.floor(Math.random() * durations.length)];
      const eventTime = new Date(currentDate);
      eventTime.setHours(Math.floor(Math.random() * 24));
      eventTime.setMinutes(Math.floor(Math.random() * 60));
      eventTime.setSeconds(Math.floor(Math.random() * 60));

      events.push({
        timestamp: eventTime,
        duration: randomDuration,
        type: randomDuration === 5 ? "quick" : randomDuration === 10 ? "intensive" : "water-saving",
      });
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return events;
}

export const irrigationStats = {
  normal: { label: "Normal", value: 419, color: "#00e5a0" },
  nitrojen: { label: "Nitogen N", value: 141, color: "#00c8ff" },
  bukaValveDraen: { label: "Buka Valve Draen", value: null, color: "#7c3aed" },
};
