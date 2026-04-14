export const defaultConfig = {
  soilMoistureMin: 30,
  soilMoistureMax: 70,
  temperatureMin: 20,
  temperatureMax: 35,
  alertThreshold: 80,
};

export function validateConfig(config: typeof defaultConfig, setNotif: (n: {type: 'success'|'error', message: string}) => void) {
  if (
    config.soilMoistureMin >= config.soilMoistureMax ||
    config.temperatureMin >= config.temperatureMax
  ) {
    setNotif({ type: 'error', message: 'Nilai minimum harus lebih kecil dari maksimum.' });
    return false;
  }
  if (
    config.soilMoistureMin < 0 || config.soilMoistureMax > 100 ||
    config.temperatureMin < -20 || config.temperatureMax > 100 ||
    config.alertThreshold < 0 || config.alertThreshold > 100
  ) {
    setNotif({ type: 'error', message: 'Nilai di luar rentang yang diperbolehkan.' });
    return false;
  }
  return true;
}
