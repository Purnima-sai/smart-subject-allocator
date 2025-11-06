const { greedyAllocate } = require('../utils/allocationAlgorithm');

function testGreedySimple() {
  const subjects = [
    { _id: 's1', capacity: 1 },
    { _id: 's2', capacity: 1 },
  ];
  const students = [
    { _id: 'a', preferences: ['s1','s2'], cgpa: 9.0 },
    { _id: 'b', preferences: ['s1','s2'], cgpa: 8.0 },
  ];
  const alloc = greedyAllocate(students, subjects);
  if (alloc.length !== 2) throw new Error('Expected 2 allocations');
  if (alloc[0].student !== 'a') throw new Error('First allocation should be student a');
  if (alloc[0].subject !== 's1') throw new Error('Student a should get s1');
  if (alloc[1].subject !== 's2') throw new Error('Student b should get s2');
}

module.exports = { testGreedySimple };
