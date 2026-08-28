const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- Expanded Mock Raw Data Sources ---
const hisData = [
  { patientId: 'Patient 102', event: 'Admitted', time: '09:00', dept: 'Cardiology', triageScore: 3, age: 65 },
  { patientId: 'Patient 245', event: 'Lab Order', count: 2, time: '10:00', dept: 'ER', triageScore: 1, age: 42 },
  { patientId: 'Patient 318', event: 'Bed Assignment', bed: '12', time: null, dept: 'ICU', triageScore: 2, age: 71 },
  { patientId: 'Patient 405', event: 'Transferred', time: '11:30', dept: 'ICU', triageScore: 1, age: 55 },
  { patientId: 'Patient 510', event: 'Discharged', time: '12:00', dept: 'Oncology', triageScore: 4, age: 39 },
];

const labData = [
  { patientId: 'Patient 245', orderId: 'L-1001', testType: 'Complete Blood Count', timeOrdered: '09:50', timeResulted: '11:20', slaLimitMins: 60, status: 'Delayed' },
  { patientId: 'Patient 245', orderId: 'L-1002', testType: 'Comprehensive Metabolic Panel', timeOrdered: '09:50', timeResulted: null, slaLimitMins: 60, status: 'Pending' },
  { patientId: 'Patient 102', orderId: 'L-1003', testType: 'Troponin', timeOrdered: '09:15', timeResulted: '09:45', slaLimitMins: 45, status: 'Completed' },
];

const bedSheetData = [
  { bedId: '12', ward: 'ICU', status: 'Occupied', patientId: 'Patient 318', nurseAssigned: 'Nurse Smith' },
  { bedId: '15', ward: 'ICU', status: 'Dirty_Needs_Cleaning', patientId: null, nurseAssigned: null },
  { bedId: '16', ward: 'ICU', status: 'Maintenance', patientId: null, nurseAssigned: null },
  { bedId: '24', ward: 'Cardiology', status: 'Occupied', patientId: 'Patient 102', nurseAssigned: 'Nurse Jones' },
  { bedId: '25', ward: 'Cardiology', status: 'Blocked', patientId: null, nurseAssigned: 'Nurse Jones' },
];

// --- AI Agents Simulation ---

function reconcileData() {
  const conflicts = [];
  
  conflicts.push({
    patient: "Patient 102",
    source1: "HIS: Admitted to Cardiology at 09:00",
    source2: "Bed Sheet: Bed 24 Occupied",
    resolution: "Admitted & Assigned Bed 24",
    reason: "Latest valid event matches occupancy.",
    confidence: "High"
  });

  conflicts.push({
    patient: "Patient 245",
    source1: "HIS: 2 Lab Orders at 10:00",
    source2: "Lab Log: Order L-1001 at 09:50, L-1002 at 09:50",
    resolution: "Potential timestamp mismatch flagged",
    reason: "HIS timestamp lags Lab system timestamp.",
    confidence: "Medium"
  });

  conflicts.push({
    patient: "Patient 318",
    source1: "HIS: Bed 12 (No Time)",
    source2: "Bed Sheet: Bed 12 Occupied",
    resolution: "Confirmed Bed 12",
    reason: "Bed sheet serves as source of truth for missing HIS timestamps.",
    confidence: "Medium"
  });

  return conflicts;
}

function generateInsights() {
  return [
    {
      type: "alert",
      title: "Capacity Alert",
      text: "ICU bed occupancy is critical. 2 beds are currently unavailable (1 Dirty, 1 Maintenance)."
    },
    {
      type: "alert",
      title: "Laboratory Bottleneck",
      text: "CBC test L-1001 for Patient 245 in ER breached the 60-min SLA (took 90 mins)."
    },
    {
      type: "success",
      title: "Reconciliation Complete",
      text: "15 of 18 detected conflicts were automatically resolved across all departments."
    }
  ];
}

function calculateMetrics() {
  return [
    {
      title: "Bed Capacity",
      value: "92%",
      subtitle: "138 of 150 beds occupied",
      status: "High Utilization",
      icon: "BedDouble"
    },
    {
      title: "Laboratory Flow",
      value: "31",
      subtitle: "Pending laboratory tests",
      status: "7 Beyond SLA",
      icon: "FlaskConical"
    },
    {
      title: "Data Reconciliation",
      value: "96%",
      subtitle: "Data confidence score",
      status: "15 of 18 conflicts resolved",
      icon: "ShieldCheck"
    }
  ];
}

// --- Endpoints ---

app.get('/api/dashboard', (req, res) => {
  res.json({
    metrics: calculateMetrics(),
    conflicts: reconcileData(),
    insights: generateInsights()
  });
});

app.get('/api/charts', (req, res) => {
  const labTurnaround = [
    { time: '08:00', turnaroundMins: 45, slaLimit: 60 },
    { time: '09:00', turnaroundMins: 55, slaLimit: 60 },
    { time: '10:00', turnaroundMins: 75, slaLimit: 60 },
    { time: '11:00', turnaroundMins: 90, slaLimit: 60 },
    { time: '12:00', turnaroundMins: 65, slaLimit: 60 },
  ];

  const bedOccupancy = [
    { name: 'ICU', occupied: 12, available: 1, dirty: 1, maintenance: 1 },
    { name: 'ER', occupied: 25, available: 5, dirty: 3, maintenance: 0 },
    { name: 'Cardiology', occupied: 40, available: 10, dirty: 2, maintenance: 1 },
    { name: 'Oncology', occupied: 18, available: 2, dirty: 1, maintenance: 0 },
  ];

  res.json({ labTurnaround, bedOccupancy });
});

app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  const msg = message ? message.toLowerCase() : '';
  
  let responseText = `CareFlow AI Simulation: I received your query "${message}". In a full deployment, this would be routed to a live LLM to dynamically generate an answer based on the SQL/NoSQL data.`;

  if (msg.includes('dirty') || msg.includes('clean')) {
    responseText = "Looking at the current bed sheet data, there is 1 bed in the ICU (Bed 15) marked as 'Dirty_Needs_Cleaning'. There are also 3 dirty beds in the ER and 2 in Cardiology. I have notified the environmental services team.";
  } else if (msg.includes('lab') || msg.includes('test') || msg.includes('delay')) {
    responseText = "Currently, 7 lab tests have breached their SLA. The most significant is Patient 245 (ER), whose CBC test took 90 minutes (30 minutes beyond the 60-min SLA).";
  } else if (msg.includes('nurse') || msg.includes('staff')) {
    responseText = "Nurse Smith is assigned to Patient 318 in the ICU. Nurse Jones is handling Patient 102 and a blocked bed in Cardiology. Staffing levels appear adequate for the current occupancy.";
  }

  res.json({ response: responseText });
});

app.post('/api/upload', (req, res) => {
  // Mock upload endpoint
  res.json({ success: true, message: 'Data sources connected and synced successfully.' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`CareFlow AI Backend running on port ${PORT}`);
});
