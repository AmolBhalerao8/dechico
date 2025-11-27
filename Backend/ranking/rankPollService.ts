import { adminDb, adminFieldValue, adminTimestamp } from '../config/firebaseAdmin';
import type { DocumentReference } from 'firebase-admin/firestore';

export type RankPollOption = {
  id: string;
  label: string;
  votes: number;
};

export type RankPoll = {
  id: string;
  question: string;
  options: RankPollOption[];
};

type DefaultPoll = {
  id: string;
  question: string;
  options: { id: string; label: string }[];
};

const COLLECTION_NAME = 'rank_polls';
export const RANK_POLL_VOTE_COLLECTION = 'rank_poll_votes';

const DEFAULT_POLLS: DefaultPoll[] = [
  {
    id: 'delusional_stereotype',
    question: 'Which Chico student stereotype is the MOST delusional?',
    options: [
      { id: 'gym_rat', label: 'Gym rat who skips class' },
      { id: 'cs_unicorn', label: 'CS major convinced they’re building the next billion-dollar startup' },
      { id: 'thu_sun_partier', label: 'Guy who parties Thu–Sun but cries about grades' },
      { id: 'wrec_mirror', label: 'Girl who uses WREC mirrors as her personal photo studio' },
      { id: 'humble_frat', label: 'Frat boy who thinks he’s “humble”' },
    ],
  },
  {
    id: 'hookup_dorm',
    question: 'Which dorm has the CRAZIEST hookups?',
    options: [
      { id: 'whitney', label: 'Whitney' },
      { id: 'lassen', label: 'Lassen' },
      { id: 'shasta', label: 'Shasta' },
      { id: 'esken', label: 'Esken' },
    ],
  },
  {
    id: 'late_night_food',
    question: 'Which 2AM food spot gives you the WORST life decisions?',
    options: [
      { id: 'jacks', label: "Jack’s" },
      { id: 'burgers_brew', label: 'Burgers & Brew' },
      { id: 'safeway_sushi', label: 'Safeway sushi (if you pick this, therapy.)' },
      { id: 'taco_bell_east', label: 'Taco Bell on East Ave' },
    ],
  },
];

const getCollection = () => adminDb.collection(COLLECTION_NAME);
const getPollRef = (pollId: string): DocumentReference => getCollection().doc(pollId);
const getVoteLogRef = (pollId: string, userId: string): DocumentReference =>
  adminDb.collection(RANK_POLL_VOTE_COLLECTION).doc(`${pollId}_${userId}`);

export const ensureDefaultPolls = async (): Promise<void> => {
  await Promise.all(
    DEFAULT_POLLS.map(async (poll) => {
      const pollRef = getPollRef(poll.id);
      const snapshot = await pollRef.get();
      if (snapshot.exists) {
        return;
      }

      await pollRef.set({
        question: poll.question,
        options: poll.options.map((option) => ({
          ...option,
          votes: 0,
        })),
        createdAt: adminFieldValue.serverTimestamp(),
      });
    }),
  );
};

export const getAllRankPolls = async (): Promise<RankPoll[]> => {
  const snapshot = await getCollection().get();
  return snapshot.docs.map((docSnapshot) => ({
    id: docSnapshot.id,
    ...(docSnapshot.data() as Omit<RankPoll, 'id'>),
  }));
};

export const voteOnPoll = async (
  pollId: string,
  optionId: string,
  userId: string,
): Promise<RankPoll> => {
  const pollRef = getPollRef(pollId);
  const voteRef = getVoteLogRef(pollId, userId);

  const updatedPoll = await adminDb.runTransaction(async (transaction) => {
    const [pollSnapshot, voteSnapshot] = await Promise.all([
      transaction.get(pollRef),
      transaction.get(voteRef),
    ]);

    if (voteSnapshot.exists) {
      throw new Error('already_voted');
    }

    if (!pollSnapshot.exists) {
      throw new Error('Poll not found');
    }

    const pollData = pollSnapshot.data() as Omit<RankPoll, 'id'>;
    let found = false;
    const options = pollData.options.map((option) => {
      if (option.id === optionId) {
        found = true;
        return { ...option, votes: option.votes + 1 };
      }
      return option;
    });

    if (!found) {
      throw new Error('Option not found');
    }

    transaction.update(pollRef, { options });
    transaction.set(voteRef, {
      pollId,
      userId,
      optionId,
      createdAt: adminTimestamp.now(),
    });

    return {
      id: pollId,
      question: pollData.question,
      options,
    };
  });

  return updatedPoll;
};

export const resetRankPollVotes = async (): Promise<void> => {
  const pollsSnapshot = await getCollection().get();
  await Promise.all(
    pollsSnapshot.docs.map(async (docSnapshot) => {
      const data = docSnapshot.data() as Omit<RankPoll, 'id'>;
      const resetOptions = data.options.map((option) => ({ ...option, votes: 0 }));
      await docSnapshot.ref.update({ options: resetOptions });
    }),
  );

  const voteSnapshot = await adminDb.collection(RANK_POLL_VOTE_COLLECTION).get();
  await Promise.all(voteSnapshot.docs.map((doc) => doc.ref.delete()));
};

export const RankPollService = {
  ensureDefaultPolls,
  getAllRankPolls,
  voteOnPoll,
  resetRankPollVotes,
};

