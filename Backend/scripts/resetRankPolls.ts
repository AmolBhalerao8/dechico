import { RankPollService } from '../ranking/rankPollService';

async function resetRankPolls() {
  try {
    console.log('🔄 Resetting rank poll votes and logs...');
    await RankPollService.resetRankPollVotes();
    console.log('✅ Rank polls reset complete.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to reset rank polls:', error);
    process.exit(1);
  }
}

resetRankPolls();

