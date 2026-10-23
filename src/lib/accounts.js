// =====================================================================
// STAFF ACCOUNTS: the only people who can sign in as Admin, Sales Manager or Technician.
// Everyone else registers through the Sign up page and becomes a Vendor.
// Passwords are checked in the browser, so this is for the prototype only.
//
// `assignedTo` (Technician only): the vendor company whose leads this technician works on.
// =====================================================================
export const STAFF_ACCOUNTS = [
  { email: 'hitika.sharma@gmail.com', password: 'Hitika@123', name: 'Hitika Sharma', role: 'Admin' },
  { email: 'admin.arkawelle@gmail.com', password: 'Admin@123', name: 'Arkawelle Admin', role: 'Admin' },
  { email: 'sales.arkawelle@gmail.com', password: 'Sales@123', name: 'Arkawelle Sales', role: 'Sales Manager' },
  { email: 'tech.arkawelle@gmail.com', password: 'Tech@123', name: 'Arkawelle Technician', role: 'Technician', assignedTo: 'SunBridge Energy' },
]

// Optional one-click demo vendor on the sign-in page (already "Approved" and linked to the seeded
// SunBridge Energy leads). Set this to [] to hide the demo card.
export const DEMO_VENDORS = [
  { email: 'vendor@sunbridge.in', password: 'vendor123', name: 'Ankit Malhotra', role: 'Vendor', company: 'SunBridge Energy', city: 'Gurugram', phone: '+91 98100 20001', gst: '06ABCDE1234F1Z5' },
]
