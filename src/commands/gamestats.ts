import { APIApplicationCommandOption, ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { ChatInputCommand, ChatInputInteraction } from 'disploy';
import { fetchAccountData, fetchMatchHistory } from '../lib';

const a = '➤';

class CompetitiveStats implements ChatInputCommand {
	public name = 'stats';
	public description = 'Get overall stats for a player';

	public options: APIApplicationCommandOption[] = [
		{
			name: 'username',
			description: 'The username of the player',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
		{
			name: 'tag',
			description: 'The tag of the player',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
	];

	private async fetchStats(username: string, tag: string) {
		const res = await fetchAccountData({
			name: username,
			tag,
		});

		const compStats = await fetchMatchHistory({
			name: username,
			puuid: res.puuid,
			region: res.region,
			tag,
		});

		return { res, compStats };
	}

	public async run(interaction: ChatInputInteraction) {
		const username = interaction.options.getString('username');
		const tag = interaction.options.getString('tag');

		interaction.deferReply();

		const { res, compStats } = await this.fetchStats(username, tag);

		try {
			return void interaction.editReply({
				embeds: [
					{
						title: `${res.name}#${res.tag}`,
						description: [
							`${a} **KD**: ${compStats.overview.kdr}%`,
							`${a} **Win Ratio**: ${compStats.overview.winRatio}% (${compStats.overview.wins}-${compStats.overview.losses})`,
							`${a} **Most Played Agent** ${
								compStats.overview.agentsUsed[0] ? compStats.overview.agentsUsed[0].agentName : 'Unknown'
							}`,
						].join('\n'),
					},
				],
			});
		} catch (e) {
			console.error(e);
			return void interaction.editReply({
				content: `No account found for ${username}#${tag}`,
			});
		}
	}
}

export default new CompetitiveStats();
