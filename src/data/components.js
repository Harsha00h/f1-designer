// F1 Component data — real teams and realistic specs

export const TEAMS = [
  { id: 'ferrari', name: 'Scuderia Ferrari', color: '#E8002D' },
  { id: 'mercedes', name: 'Mercedes-AMG', color: '#27F4D2' },
  { id: 'redbull', name: 'Red Bull Racing', color: '#3671C6' },
  { id: 'mclaren', name: 'McLaren', color: '#FF8000' },
];

// Default components — each has a version field
// Power units produce ~1000 HP total (ICE ~700-750 HP + ERS ~160 HP + MGU-K ~120 HP)
export const DEFAULT_COMPONENTS = {
  engine: [
    { id: 'eng-fer', team: 'ferrari', model: 'Ferrari 066/12', power: '1010 HP', weight: '150 kg', reliability: 91, version: 1, updatedAt: null },
    { id: 'eng-mer', team: 'mercedes', model: 'Mercedes M15', power: '1005 HP', weight: '149 kg', reliability: 95, version: 1, updatedAt: null },
    { id: 'eng-rb', team: 'redbull', model: 'Honda RBPT H003', power: '1015 HP', weight: '151 kg', reliability: 89, version: 1, updatedAt: null },
    { id: 'eng-mcl', team: 'mclaren', model: 'Mercedes M15-B', power: '1000 HP', weight: '150 kg', reliability: 94, version: 1, updatedAt: null },
  ],
  tires: [
    { id: 'tire-fer', team: 'ferrari', model: 'Pirelli P Zero C5', grip: 97, durability: 62, type: 'Soft', version: 1, updatedAt: null },
    { id: 'tire-mer', team: 'mercedes', model: 'Pirelli P Zero C3', grip: 85, durability: 88, type: 'Medium', version: 1, updatedAt: null },
    { id: 'tire-rb', team: 'redbull', model: 'Pirelli P Zero C1', grip: 75, durability: 95, type: 'Hard', version: 1, updatedAt: null },
    { id: 'tire-mcl', team: 'mclaren', model: 'Pirelli P Zero C4', grip: 92, durability: 74, type: 'Soft', version: 1, updatedAt: null },
  ],
  brakes: [
    { id: 'brk-fer', team: 'ferrari', model: 'Brembo Type-F', stopping: 97, heat: 'Low', material: 'Carbon-Carbon', version: 1, updatedAt: null },
    { id: 'brk-mer', team: 'mercedes', model: 'Brembo Type-M', stopping: 94, heat: 'Medium', material: 'Carbon-Carbon', version: 1, updatedAt: null },
    { id: 'brk-rb', team: 'redbull', model: 'Carbon Industrie CI-R', stopping: 93, heat: 'Low', material: 'Carbon-Carbon', version: 1, updatedAt: null },
    { id: 'brk-mcl', team: 'mclaren', model: 'Akebono Racing MCL', stopping: 95, heat: 'Medium', material: 'Carbon-Ceramic', version: 1, updatedAt: null },
  ],
};

// Backward-compatible export
export const COMPONENTS = DEFAULT_COMPONENTS;

// Real F1 circuit data (official FIA distances and lap counts)
export const TRACKS = [
  { id: 'bahrain', name: 'Bahrain International Circuit', laps: 57, lengthKm: 5.412, country: 'Bahrain', flag: '🇧🇭', image: '/circuits/Bahrain_Circuit.webp.avif' },
  { id: 'jeddah', name: 'Jeddah Corniche Circuit', laps: 50, lengthKm: 6.174, country: 'Saudi Arabia', flag: '🇸🇦', image: '/circuits/Saudi_Arabia_Circuit.webp.avif' },
  { id: 'melbourne', name: 'Albert Park, Melbourne', laps: 58, lengthKm: 5.278, country: 'Australia', flag: '🇦🇺', image: '/circuits/Australia_Circuit.webp.avif' },
  { id: 'monaco', name: 'Circuit de Monaco', laps: 78, lengthKm: 3.337, country: 'Monaco', flag: '🇲🇨', image: '/circuits/Monte-Carlo03.png' },
  { id: 'barcelona', name: 'Circuit de Barcelona-Catalunya', laps: 66, lengthKm: 4.657, country: 'Spain', flag: '🇪🇸', image: '/circuits/Spain_Circuit.webp.avif' },
  { id: 'silverstone', name: 'Silverstone Circuit', laps: 52, lengthKm: 5.891, country: 'Great Britain', flag: '🇬🇧', image: '/circuits/Great_Britain_Circuit.webp.avif' },
  { id: 'monza', name: 'Autodromo Nazionale Monza', laps: 53, lengthKm: 5.793, country: 'Italy', flag: '🇮🇹', image: '/circuits/Italy_Circuit.webp.avif' },
  { id: 'spa', name: 'Circuit de Spa-Francorchamps', laps: 44, lengthKm: 7.004, country: 'Belgium', flag: '🇧🇪', image: '/circuits/Belgium_Circuit.webp.avif' },
  { id: 'suzuka', name: 'Suzuka International Racing Course', laps: 53, lengthKm: 5.807, country: 'Japan', flag: '🇯🇵', image: '/circuits/2026tracksuzukadetailed.webp.avif' },
  { id: 'singapore', name: 'Marina Bay Street Circuit', laps: 62, lengthKm: 4.940, country: 'Singapore', flag: '🇸🇬', image: '/circuits/Singapore_Circuit.webp.avif' },
  { id: 'interlagos', name: 'Autodromo Jose Carlos Pace', laps: 71, lengthKm: 4.309, country: 'Brazil', flag: '🇧🇷', image: '/circuits/Brazil_Circuit.webp.avif' },
  { id: 'abudhabi', name: 'Yas Marina Circuit', laps: 58, lengthKm: 5.281, country: 'Abu Dhabi', flag: '🇦🇪', image: '/circuits/Abu_Dhabi_Circuit.webp.avif' },
];

export const WEATHER_OPTIONS = ['Dry', 'Wet', 'Mixed'];

// Compatibility rules: certain cross-team combinations may conflict
export const COMPATIBILITY_RULES = [
  {
    components: ['ferrari', 'redbull'],
    type: ['engine', 'brakes'],
    severity: 'warning',
    message: 'Ferrari power unit with Red Bull brakes may cause thermal management issues — different cooling philosophies.',
  },
  {
    components: ['mercedes', 'mclaren'],
    type: ['tires', 'brakes'],
    severity: 'warning',
    message: 'Mercedes tire setup with McLaren brakes may require brake bias recalibration due to different brake-by-wire mapping.',
  },
  {
    components: ['redbull', 'ferrari'],
    type: ['tires', 'engine'],
    severity: 'warning',
    message: 'Red Bull hard compound tires may overheat under Ferrari engine exhaust positioning — reduced tire life expected.',
  },
  {
    components: ['ferrari', 'mercedes'],
    type: ['engine', 'brakes'],
    severity: 'error',
    message: 'Ferrari power unit is incompatible with Mercedes brake-by-wire system — different ERS energy recovery protocols.',
  },
  {
    components: ['redbull', 'mclaren'],
    type: ['engine', 'tires'],
    severity: 'warning',
    message: 'Honda RBPT engine heat output may degrade McLaren soft compound tires faster than expected.',
  },
];

// Editable fields per component category
export const EDITABLE_FIELDS = {
  engine: [
    { key: 'model', label: 'Model', type: 'text' },
    { key: 'power', label: 'Power', type: 'text' },
    { key: 'weight', label: 'Weight', type: 'text' },
    { key: 'reliability', label: 'Reliability (%)', type: 'number', min: 0, max: 100 },
  ],
  tires: [
    { key: 'model', label: 'Model', type: 'text' },
    { key: 'grip', label: 'Grip (%)', type: 'number', min: 0, max: 100 },
    { key: 'durability', label: 'Durability (%)', type: 'number', min: 0, max: 100 },
    { key: 'type', label: 'Type', type: 'select', options: ['Soft', 'Medium', 'Hard', 'Intermediate', 'Wet'] },
  ],
  brakes: [
    { key: 'model', label: 'Model', type: 'text' },
    { key: 'stopping', label: 'Stopping (%)', type: 'number', min: 0, max: 100 },
    { key: 'heat', label: 'Heat', type: 'select', options: ['Low', 'Medium', 'High'] },
    { key: 'material', label: 'Material', type: 'select', options: ['Carbon-Carbon', 'Carbon-Ceramic', 'Steel-Composite'] },
  ],
};
