import { mockFriends } from "@/data/friends";
import type { Friend, UserStats } from "@/types";

export interface FriendRepository {
  getWeeklyRanking(me: UserStats): Promise<Friend[]>;
}

export class LocalFriendRepository implements FriendRepository {
  async getWeeklyRanking(me: UserStats) {
    return [
      ...mockFriends,
      {
        id: "me",
        name: "Me",
        weeklyAnswered: me.weeklyAnswered,
        accuracyRate: me.accuracyRate,
        streak: me.streak
      }
    ].sort((a, b) => b.weeklyAnswered - a.weeklyAnswered);
  }
}

export const friendRepository: FriendRepository = new LocalFriendRepository();
