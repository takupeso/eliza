import { IAgentRuntime, Memory, Provider, State } from "@elizaos/core";
import ccxt from "ccxt";
import { v4 as uuidv4 } from "uuid";

const fetchAllTradingFeesProvider: Provider = {
    get: async (
        runtime: IAgentRuntime,
        _message: Memory,
        _state?: State
    ): Promise<string> => {
        try {
            const exchanges = ccxt.exchanges;
            const results: string[] = [];

            await Promise.all(
                exchanges.map(async (exchangeId) => {
                    const exchangeClass = ccxt[exchangeId];
                    if (!exchangeClass) return;

                    const exchange = new exchangeClass();
                    if (!exchange.has["fetchTradingFees"]) return;
                    console.error(`fetchTradingFees: ${exchangeId}`);

                    try {
                        const tradingFees = await exchange.fetchTradingFees();

                        for (const [symbol, fee] of Object.entries(
                            tradingFees
                        )) {
                            if (
                                symbol.includes("USDT") &&
                                (symbol.includes("FAI") ||
                                    symbol.includes("AKUMA") ||
                                    symbol.includes("AI16Z") ||
                                    symbol.includes("DOGE") ||
                                    symbol.includes("BTC") ||
                                    symbol.includes("SHIB"))
                            ) {
                                results.push(
                                    `${exchangeId} ${symbol}: ${fee["taker"]}}`
                                );
                            }
                        }
                    } catch (error) {
                        console.error(
                            `Error fetching trading fees from ${exchangeId}:`,
                            error
                        );
                    }
                })
            );

            const resultString = results.join("|");
            await runtime.databaseAdapter.createKnowledge({
                id: uuidv4() as `${string}-${string}-${string}-${string}-${string}`,
                content: {
                    text: resultString,
                    metadata: {
                        isShared: true,
                    },
                },
                agentId: runtime.agentId,
            });
            return resultString;
        } catch (error) {
            return `Failed to fetch trading fees data`;
        }
    },
};

export { fetchAllTradingFeesProvider };
