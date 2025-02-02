import {
    Client,
    IAgentRuntime,
    ModelClass,
    composeContext,
    elizaLogger,
    generateText,
    stringToUuid,
} from "@elizaos/core";

const fetchTickersTemplate = `
# Areas of Expertise
{{knowledge}}

{{providers}}


# Task: Fetch tickers
Fetch tickers and trading fees.
`;

export class AutoClient {
    interval: NodeJS.Timeout;
    runtime: IAgentRuntime;

    constructor(runtime: IAgentRuntime) {
        elizaLogger.success("running auto client...");
        this.runtime = runtime;
        // start a loop that runs every x seconds
        this.interval = setInterval(
            async () => {
                await this.fetchTickers();
            },
            // 60 * 60 * 1000
            30 * 1000
        ); // 1 hour in milliseconds
    }

    async fetchTickers() {
        elizaLogger.success("stringToUuid");
        const roomId = stringToUuid("generate_room_for_fetcher");

        elizaLogger.success("composeState");

        const state = await this.runtime.composeState({
            userId: this.runtime.agentId,
            roomId: roomId,
            agentId: this.runtime.agentId,
            content: {
                text: "",
            },
        });

        elizaLogger.success("composeContext");

        const context = composeContext({
            state,
            template: fetchTickersTemplate,
        });

        elizaLogger.success(context);

        const content = await generateText({
            runtime: this.runtime,
            context,
            modelClass: ModelClass.SMALL,
        });

        elizaLogger.success("generated post prompt:\n" + content);
    }
}

export const AutoClientInterface: Client = {
    start: async (runtime: IAgentRuntime) => {
        const client = new AutoClient(runtime);
        return client;
    },
    stop: async (_runtime: IAgentRuntime) => {
        console.warn("Direct client does not support stopping yet");
    },
};

export default AutoClientInterface;
