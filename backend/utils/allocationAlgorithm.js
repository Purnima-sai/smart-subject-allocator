// allocationAlgorithm.js
// Greedy allocation supporting subject sections.
// Inputs:
//  - students: [{ _id, preferences: [subjectId,...], cgpa }]
//  - subjects: [{ _id, capacity, sections: [{name,capacity}] }]
// Algorithm:
//  - Expand subjects into slots. If sections exist, each section is a separate slot with its own capacity.
//  - Iterate students in provided order (caller should sort by merit). For each student's preferences,
//    assign the first slot with remaining capacity.

exports.greedyAllocate = (students, subjects) => {
  // Build slotMap: slotId -> { subjId, sectionName|null, remaining }
  const slotMap = new Map();
  // Also map subjectId -> array of slotIds (for lookup)
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
      // single slot for the whole subject
      const slotId = `${subjKey}::whole`;
      slotMap.set(slotId, { subjId: subjKey, section: null, remaining: s.capacity || 0 });
      subjSlots.get(subjKey).push(slotId);
    }
  });

  const allocations = [];

  for (const student of students) {
    const prefs = student.preferences || [];
    let assigned = null;
    for (let i = 0; i < prefs.length; i++) {
      const prefSubId = String(prefs[i]);
      const slots = subjSlots.get(prefSubId) || [];
      // try to find any slot for this subject with remaining capacity
      for (const slotId of slots) {
        const slot = slotMap.get(slotId);
        if (slot && (slot.remaining || 0) > 0) {
          // allocate here
          slot.remaining -= 1;
          assigned = { student: student._id, subject: prefSubId, priority: i + 1, section: slot.section };
          break;
        }
      }
      if (assigned) break;
    }
    if (assigned) allocations.push(assigned);
  }

  return allocations;
};
