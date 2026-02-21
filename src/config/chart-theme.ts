// Priority colors - Monochromatic Ocean Scale (Darker for visibility)
export const priorityColors = {
  'Low': '#67e8f9',      // Ocean 300
  'Medium': '#22d3ee',   // Ocean 400
  'High': '#06b6d4',     // Ocean 500
  'Urgent': '#0891b2',   // Ocean 600
  'TBD': '#0e7490',      // Ocean 700
};

// Status colors - Monochromatic Ocean Scale (Matching Priority Sequence)
export const statusColors = {
  'To Do': '#67e8f9',        // Ocean 300 (Matches Low)
  'In Progress': '#22d3ee',  // Ocean 400 (Matches Medium)
  'Done': '#06b6d4',         // Ocean 500 (Matches High)
  'Needs Scoping': '#0891b2', // Ocean 600 (Matches Urgent)
  'Discovery': '#0e7490',    // Ocean 700 (Matches TBD)
};

// Default fallback color
export const defaultChartColor = '#06b6d4'; // Cyan
