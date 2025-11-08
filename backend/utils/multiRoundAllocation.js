// multiRoundAllocation.js
// Multi-round allocation: for each preference rank (round), assign unallocated students in merit order.
// Returns { allocations: [{student,subject,priority,section}], waitlists: { subjectId: [studentId,...] } }

const { greedyAllocate } = require('./allocationAlgorithm');

exports.multiRoundAllocate = (students, subjects, maxChoices = 5) => {
  // students: array with { _id, preferences: [subjectId,...], cgpa }
  // subjects: array with { _id, capacity, sections }

  // Build slots similar to allocationAlgorithm but we will attempt round-wise
  const slotMap = new Map();
  const subjSlots = new Map();

  subjects.forEach(s => {
    const subjKey = String(s._id);
    subjSlots.set(subjKey, []);
    if (Array.isArray(s.sections) && s.sections.length > 0) {
      s.sections.forEach((sec, idx) => {
        const slotId = `${subjKey}::sec::${idx}`;
        slotMap.set(slotId, { subjId: subjKey, section: sec.name || `S${idx+1}`, remaining: sec.capacity || 0 });
        subjSlots.get(subjKey).push(slotId);
      });
    } else {
      const slotId = `${subjKey}::whole`;
      slotMap.set(slotId, { subjId: subjKey, section: null, remaining: s.capacity || 0 });
      subjSlots.get(subjKey).push(slotId);
    }
  });

  const allocations = [];
  const assignedStudents = new Set();
  const waitlists = {}; // subjectId -> array of student ids (in order attempted)

  // For each round (preference index)
  for (let round = 0; round < maxChoices; round++) {
    // Consider only students not yet assigned
    const candidates = students.filter(s => !assignedStudents.has(String(s._id)) && Array.isArray(s.preferences) && s.preferences.length > round);
    // Sort by CGPA descending
    candidates.sort((a,b) => (b.cgpa || 0) - (a.cgpa || 0));

    for (const student of candidates) {
      const pref = String(student.preferences[round]);
      if (!pref) continue;
      const slots = subjSlots.get(pref) || [];
      let given = null;
      for (const slotId of slots) {
        const slot = slotMap.get(slotId);
        if (slot && (slot.remaining || 0) > 0) {
          slot.remaining -= 1;
          given = { student: student._id, subject: pref, priority: round+1, section: slot.section };
          break;
        }
      }
      if (given) {
        allocations.push(given);
        assignedStudents.add(String(student._id));
      } else {
        // add to waitlist for subject
        if (!waitlists[pref]) waitlists[pref] = [];
        waitlists[pref].push(student._id);
      }
    }
  }

  return { allocations, waitlists };
};
