// Approximate waypoint coordinates (x, y as percentages 0-100) for the 12 F1 circuits.
// Point 0 is the start/finish line (checkered flag).
// Paths are ordered in the direction of racing.

export const TRACK_PATHS = {
  // Bahrain: Start bottom, clockwise.
  bahrain: [
    {x: 35, y: 80}, {x: 65, y: 80}, {x: 75, y: 70}, {x: 70, y: 55},
    {x: 80, y: 40}, {x: 70, y: 20}, {x: 55, y: 15}, {x: 40, y: 30},
    {x: 25, y: 20}, {x: 10, y: 40}, {x: 15, y: 65}, {x: 25, y: 80}
  ],
  // Jeddah: Long vertical, counter-clockwise.
  jeddah: [
    {x: 45, y: 80}, {x: 60, y: 90}, {x: 75, y: 80}, {x: 75, y: 50},
    {x: 85, y: 20}, {x: 70, y: 5}, {x: 50, y: 10}, {x: 35, y: 30},
    {x: 20, y: 60}, {x: 30, y: 80}
  ],
  // Melbourne: Clockwise around the lake.
  melbourne: [
    {x: 45, y: 75}, {x: 65, y: 75}, {x: 80, y: 80}, {x: 85, y: 60},
    {x: 75, y: 45}, {x: 85, y: 20}, {x: 60, y: 15}, {x: 40, y: 15},
    {x: 20, y: 30}, {x: 30, y: 50}, {x: 15, y: 65}, {x: 25, y: 75}
  ],
  // Monaco: Clockwise, tight, bottom right start.
  monaco: [
    {x: 70, y: 85}, {x: 85, y: 75}, {x: 85, y: 50}, {x: 75, y: 30},
    {x: 50, y: 20}, {x: 20, y: 30}, {x: 25, y: 50}, {x: 55, y: 60},
    {x: 75, y: 65}, {x: 60, y: 85}
  ],
  // Barcelona: Clockwise.
  barcelona: [
    {x: 60, y: 80}, {x: 85, y: 70}, {x: 80, y: 45}, {x: 60, y: 30},
    {x: 70, y: 15}, {x: 50, y: 10}, {x: 20, y: 20}, {x: 15, y: 50},
    {x: 35, y: 65}, {x: 50, y: 85}
  ],
  // Silverstone: Recalibrated to match circuit image.
  // Racing order: Start/Finish → T01 → T02 → T03 → T04 → T05 → T10 → T09 → T08 → T07 → T06 → T01 area → T18 → T17 → T16 → T15 → back to start
  silverstone: [
    // Start/finish area (top center, near turn 18/01)
    {x: 42, y: 13}, 
    // Turn 01 — right of center
    {x: 53, y: 22},
    // Turn 02
    {x: 50, y: 34},
    // Turn 03
    {x: 55, y: 43},
    // Turn 04 — heading down-left
    {x: 50, y: 50},
    // Turn 05
    {x: 57, y: 52},
    // Turn 10 — far right area
    {x: 67, y: 55},
    // Turn 09
    {x: 80, y: 48},
    // Turn 08
    {x: 78, y: 25},
    // Turn 07 — top right
    {x: 70, y: 18},
    // Turn 06
    {x: 67, y: 28},
    // Back across top — Hangar Straight
    {x: 58, y: 22},
    // Turn 18 — top area
    {x: 38, y: 11},
    // Turn 17
    {x: 32, y: 16},
    // Turn 16
    {x: 30, y: 22},
    // Sector 3 — left side
    {x: 25, y: 28},
    // Turn 15
    {x: 22, y: 38},
    // Through to Speed Trap area — far left
    {x: 30, y: 48},
    // Bottom section
    {x: 32, y: 56},
    // Turn 14
    {x: 45, y: 62},
    // Turn 13
    {x: 50, y: 68},
    // Turn 12
    {x: 55, y: 64},
    // Turn 11
    {x: 60, y: 62},
    // DRS Zone 2 area — heading up
    {x: 62, y: 55},
    // Back to start — Wellington Straight
    {x: 48, y: 18},
  ],
  // Monza: Clockwise, long straights.
  monza: [
    {x: 35, y: 80}, {x: 60, y: 65}, {x: 75, y: 50}, {x: 85, y: 30},
    {x: 75, y: 15}, {x: 50, y: 20}, {x: 35, y: 35}, {x: 20, y: 50},
    {x: 10, y: 70}, {x: 20, y: 85}
  ],
  // Spa: Clockwise, huge elevation, winding.
  spa: [
    {x: 15, y: 30}, {x: 10, y: 15}, {x: 30, y: 10}, {x: 50, y: 20},
    {x: 75, y: 30}, {x: 85, y: 50}, {x: 70, y: 70}, {x: 50, y: 85},
    {x: 30, y: 75}, {x: 20, y: 55}
  ],
  // Suzuka: Figure 8, clockwise start.
  suzuka: [
    {x: 60, y: 80}, {x: 85, y: 75}, {x: 80, y: 50}, {x: 60, y: 40},
    {x: 35, y: 35}, {x: 20, y: 20}, {x: 40, y: 10}, {x: 65, y: 20},
    {x: 55, y: 55}, {x: 20, y: 75}, {x: 15, y: 55}, {x: 40, y: 75}
  ],
  // Singapore: Anti-clockwise.
  singapore: [
    {x: 60, y: 75}, {x: 40, y: 85}, {x: 20, y: 75}, {x: 30, y: 55},
    {x: 15, y: 35}, {x: 35, y: 15}, {x: 55, y: 25}, {x: 80, y: 15},
    {x: 85, y: 40}, {x: 75, y: 60}
  ],
  // Interlagos: Anti-clockwise.
  interlagos: [
    {x: 30, y: 35}, {x: 15, y: 50}, {x: 25, y: 80}, {x: 55, y: 85},
    {x: 75, y: 65}, {x: 85, y: 40}, {x: 60, y: 15}, {x: 35, y: 15}
  ],
  // Abu Dhabi: Anti-clockwise.
  abudhabi: [
    {x: 45, y: 80}, {x: 25, y: 75}, {x: 15, y: 55}, {x: 30, y: 40},
    {x: 10, y: 20}, {x: 25, y: 15}, {x: 50, y: 30}, {x: 75, y: 15},
    {x: 85, y: 40}, {x: 70, y: 60}, {x: 80, y: 80}, {x: 60, y: 85}
  ]
};

// Generates a smooth path from roughly plotted waypoints using Catmull-Rom logic
export function getSmoothPath(trackId, stepsPerSegment = 10) {
  const points = TRACK_PATHS[trackId] || TRACK_PATHS.melbourne;
  const loop = [...points, points[0], points[1], points[2]]; // Padding for spline
  
  const smooth = [];
  for (let i = 1; i < loop.length - 2; i++) {
    const p0 = loop[i - 1], p1 = loop[i], p2 = loop[i + 1], p3 = loop[i + 2];
    for (let t = 0; t < 1; t += 1 / stepsPerSegment) {
      const t2 = t * t;
      const t3 = t2 * t;
      
      const x = 0.5 * (
        (2 * p1.x) + 
        (-p0.x + p2.x) * t + 
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + 
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
      );
      
      const y = 0.5 * (
        (2 * p1.y) + 
        (-p0.y + p2.y) * t + 
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + 
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
      );
      
      smooth.push({ x, y });
    }
  }
  return smooth;
}
