const { multiRoundAllocate } = require('../utils/multiRoundAllocation');

function testMultiRound() {
  const subjects = [
    { _id: 's1', sections: [{ name: 'A', capacity: 1 }] },
    { _id: 's2', sections: [{ name: 'A', capacity: 1 }] },
  ];
  // student a has higher cgpa but chooses s2 first; b chooses s1 first
  const students = [
    { _id: 'a', preferences: ['s2','s1'], cgpa: 9.5 },
    { _id: 'b', preferences: ['s1','s2'], cgpa: 8.0 },
    { _id: 'c', preferences: ['s1','s2'], cgpa: 7.5 },
  ];
  const { allocations, waitlists } = multiRoundAllocate(students, subjects, 2);
  if (allocations.length !== 2) throw new Error('Expected 2 allocations');
  // a should get s2, b should get s1 (higher cgpa gets first choice in each round)
  const aAlloc = allocations.find(x => x.student === 'a');
  const bAlloc = allocations.find(x => x.student === 'b');
  if (!aAlloc || aAlloc.subject !== 's2') throw new Error('Student a should get s2');
  if (!bAlloc || bAlloc.subject !== 's1') throw new Error('Student b should get s1');
}

module.exports = { testMultiRound };
