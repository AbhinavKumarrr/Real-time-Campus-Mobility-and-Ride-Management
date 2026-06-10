// Known campus pickup/drop points (approx. IIT Roorkee coordinates).
export const CAMPUS_PLACES = [
  { label: 'Main Gate', lat: 29.8649, lng: 77.8965 },
  { label: 'Lecture Hall Complex', lat: 29.865, lng: 77.8967 },
  { label: 'Mahatma Gandhi Central Library', lat: 29.8662, lng: 77.8951 },
  { label: 'Rajendra Bhawan', lat: 29.8688, lng: 77.8939 },
  { label: 'Cautley Bhawan', lat: 29.8675, lng: 77.8983 },
  { label: 'Azad Bhawan', lat: 29.8702, lng: 77.8961 },
  { label: 'Tinkering Lab', lat: 29.864, lng: 77.894 },
  { label: 'Student Activity Centre', lat: 29.8669, lng: 77.8995 },
  { label: 'Department of CSE', lat: 29.8651, lng: 77.8964 },
  { label: 'Health Centre', lat: 29.8695, lng: 77.8972 },
];

export const CAMPUS_CENTER = [29.8668, 77.8967];

export const RIDE_STATUS_LABELS = {
  requested: 'Requested',
  accepted: 'Accepted',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

// Lifecycle order used to render progress steppers.
export const RIDE_FLOW = ['requested', 'accepted', 'in_progress', 'completed'];

export const findPlace = (label) =>
  CAMPUS_PLACES.find((p) => p.label === label) || null;
