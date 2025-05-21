// src/components/debug/index.js
import PerformanceMonitorEnhanced from './PerformanceMonitorEnhanced';

// Exporter la version améliorée comme valeur par défaut
export default PerformanceMonitorEnhanced;

// Exporter aussi l'ancienne version pour compatibilité
export { default as PerformanceMonitor } from './PerformanceMonitor';
