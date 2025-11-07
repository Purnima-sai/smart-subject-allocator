const { testGreedySimple } = require('./allocation.test');
const { testMultiRound } = require('./multiRoundAllocation.test');

try {
  testGreedySimple();
  testMultiRound();
  console.log('All tests passed');
  process.exit(0);
} catch (err) {
  console.error('Test failed:', err.message);
  process.exit(1);
}
