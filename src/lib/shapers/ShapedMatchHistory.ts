import { MatchHistoryDataV3, Team } from '../types/types';
import type { AgentUsed } from './types';

export default class ShapedMatchHistory {
	public round: (num: number) => number;
	public trackedGames: number;

	public overview!: {
		kills: number;
		deaths: number;
		kdr: number;
		wins: number;
		losses: number;
		winRatio: number;
		agentsUsed: AgentUsed[];
	};

	private agentsUsed: AgentUsed[];
	private killDeathRatio: number;
	private winLossRatio: number;
	private gamesWon: number;
	private gamesLost: number;
	public deaths: number;

	private kills: number;

	public constructor(private readonly raw: MatchHistoryDataV3[], private readonly puuid: string) {
		this.deaths = this.raw
			.map((match) => match.players.all_players)
			.reduce((acc, curr) => {
				const player = curr.find((p) => p.puuid === this.puuid);
				if (player) {
					return acc + player.stats.deaths;
				}
				return acc;
			}, 0);

		this.round = (num: number): number => Math.round((num + Number.EPSILON) * 100) / 100;
		this.trackedGames = this.raw.length;

		const agents: AgentUsed[] = [];
		this.raw.map((match) => {
			const player = match.players.all_players.find((player) => player.puuid === this.puuid);
			if (!player) return;
			const agent = agents.find((a) => a.agentName === player.character);
			if (agent) {
				agent.timesUsed++;
			} else {
				agents.push({
					agentName: player.character,
					timesUsed: 1,
				});
			}
		});

		let wins = 0;

		this.raw.map((match) => {
			const player = match.players.all_players.find((player) => player.puuid === this.puuid);

			switch (player?.team) {
				case Team.Red: {
					if (match.teams.red.has_won) {
						wins++;
					}
					break;
				}
				case Team.Blue: {
					if (match.teams.blue.has_won) {
						wins++;
					}
					break;
				}
				default: {
					break;
				}
			}
		});

		this.gamesWon = wins;

		let losses = 0;

		this.raw.map((match) => {
			const player = match.players.all_players.find((player) => player.puuid === this.puuid);

			switch (player?.team) {
				case Team.Red: {
					if (!match.teams.red.has_won) {
						losses++;
					}
					break;
				}
				case Team.Blue: {
					if (!match.teams.blue.has_won) {
						losses++;
					}
					break;
				}
				default: {
					break;
				}
			}
		});

		this.gamesLost = losses;

		this.agentsUsed = agents;

		this.kills = this.raw
			.map((match) => match.players.all_players)
			.reduce((acc, curr) => {
				const player = curr.find((p) => p.puuid === this.puuid);
				if (player) {
					return acc + player.stats.kills;
				}
				return acc;
			}, 0);

		if (this.kills === 0) {
			this.killDeathRatio = 0;
		} else if (this.deaths === 0) {
			this.killDeathRatio = 1;
		} else {
			this.killDeathRatio = this.kills / this.deaths;
		}

		if (this.gamesWon === 0) {
			this.winLossRatio = 0;
		}
		if (this.gamesLost === 0) {
			this.winLossRatio = 1;
		}

		this.winLossRatio = this.gamesWon / this.gamesLost;

		this.overview = {
			kills: this.kills,
			deaths: this.deaths,
			kdr: this.round(this.killDeathRatio),
			wins: this.gamesWon,
			losses: this.gamesLost,
			winRatio: this.round(this.winLossRatio),
			agentsUsed: this.agentsUsed.sort((a, b) => b.timesUsed - a.timesUsed),
		};
	}
}
