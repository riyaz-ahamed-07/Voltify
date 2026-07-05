// scratch/test-cognee.js
/**
 * Verification script to test the Cognee Memory Service integration.
 * Run via: node scratch/test-cognee.js
 */

// Load dotenv configuration
require('dotenv').config();

const cogneeService = require('../src/services/cogneeService');

async function runTests() {
  console.log('====================================================');
  console.log('🤖 STARTING COGNEE MEMORY INTEGRATION TESTS');
  console.log('====================================================');

  const testUserId = 'test-user-judge-123';

  // 1. Test getHomeDNA (Initial State/Seeded default)
  console.log('\n[TEST 1] Testing DNA Initial State...');
  try {
    const dna = await cogneeService.getHomeDNA(testUserId);
    console.log('✓ getHomeDNA response:', JSON.stringify(dna, null, 2));
    if (dna.score === 91) {
      console.log('  -> Match success: default seeded DNA score is 91/100.');
    } else {
      console.log('  -> Reset/Empty state score:', dna.score);
    }
  } catch (err) {
    console.error('✗ getHomeDNA failed:', err.message);
  }

  // 2. Test getHomeEvolution
  console.log('\n[TEST 2] Testing Home Evolution Timeline...');
  try {
    const timeline = await cogneeService.getHomeEvolution(testUserId);
    console.log(`✓ getHomeEvolution returned ${timeline.length} milestone events.`);
    timeline.forEach(t => console.log(`  - [${t.month}] ${t.icon} ${t.event}: ${t.details}`));
  } catch (err) {
    console.error('✗ getHomeEvolution failed:', err.message);
  }

  // 3. Test getMemoryVault (Learned Memories)
  console.log('\n[TEST 3] Testing Memory Vault Log...');
  try {
    const vault = await cogneeService.getMemoryVault(testUserId);
    console.log(`✓ getMemoryVault returned ${vault.memories.length} stored memory nodes.`);
    console.log('  Stats:', JSON.stringify(vault.stats));
    vault.memories.slice(0, 3).forEach(m => console.log(`  - [${m.source}] ${m.learned_memory} (Confidence: ${m.confidence}%)`));
  } catch (err) {
    console.error('✗ getMemoryVault failed:', err.message);
  }

  // 4. Test getReplayedState (Relive My Home slider)
  console.log('\n[TEST 4] Testing Relive My Home Month (April)...');
  try {
    const replayState = await cogneeService.getReplayedState(testUserId, 'April');
    console.log('✓ getReplayedState for April:', JSON.stringify(replayState, null, 2));
  } catch (err) {
    console.error('✗ getReplayedState failed:', err.message);
  }

  // 5. Test remember (Ingestion)
  console.log('\n[TEST 5] Testing remember() ingestion...');
  try {
    await cogneeService.remember(testUserId, 'User added a second refrigerator in the kitchen', 'session-verify');
    console.log('✓ remember() executed successfully.');
    
    console.log('Calling improve() to bridge session cache into graph database...');
    await cogneeService.improve(testUserId);
    
    // Check if it appears in vault now
    const updatedVault = await cogneeService.getMemoryVault(testUserId);
    console.log(`✓ Vault now contains ${updatedVault.memories.length} memory nodes.`);
  } catch (err) {
    console.error('✗ remember() failed:', err.message);
  }

  // 6. Test recall (Context search)
  console.log('\n[TEST 6] Testing recall() search...');
  console.log('Waiting 3 seconds for Cognee Cloud to index the new memory...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  try {
    const context = await cogneeService.recall(testUserId, 'refrigerator', 'session-verify');
    console.log('✓ recall() context output:\n', context);
  } catch (err) {
    console.error('✗ recall() failed:', err.message);
  }

  // 7. Test forget() (Memory Reset)
  console.log('\n[TEST 7] Testing forget() / memory wipe...');
  try {
    await cogneeService.forget(testUserId);
    console.log('✓ forget() reset executed successfully.');
    const emptyDna = await cogneeService.getHomeDNA(testUserId);
    console.log('✓ Post-forget DNA score:', emptyDna.score);
    if (emptyDna.score === 0) {
      console.log('  -> Match success: post-reset score is 0/100 (blank slate).');
    }
  } catch (err) {
    console.error('✗ forget() failed:', err.message);
  }

  console.log('\n====================================================');
  console.log('🎉 ALL INTEGRATION TESTS COMPLETED');
  console.log('====================================================');
}

runTests();
