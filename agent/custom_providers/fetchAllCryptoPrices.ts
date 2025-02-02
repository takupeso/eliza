import { IAgentRuntime, Memory, Provider, State } from "@elizaos/core";
import ccxt from "ccxt";
import { v4 as uuidv4 } from "uuid";

const fetchAllCryptoPricesProvider: Provider = {
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
                    if (!exchange.has["fetchTickers"]) return;
                    console.error(`fetchTickers: ${exchangeId}`);
                    try {
                        const markets = await exchange.loadMarkets();
                        const usdtPairs = Object.keys(markets).filter(
                            (symbol) =>
                                /USDT/.test(symbol) &&
                                /(FAI|AKUMA|AI16Z|DOGE|BTC|SHIB)/.test(symbol)
                        );
                        if (usdtPairs.length === 0) return;

                        const tickers = await exchange.fetchTickers(usdtPairs);
                        for (const [symbol, ticker] of Object.entries(
                            tickers
                        )) {
                            if (
                                ticker["bid"] !== undefined &&
                                ticker["bidVolume"] !== undefined &&
                                ticker["ask"] !== undefined &&
                                ticker["askVolume"] !== undefined
                            ) {
                                results.push(
                                    `${exchangeId} ${symbol}: {bid: ${ticker["bid"]}, bidVolume: ${ticker["bidVolume"]}, ask: ${ticker["ask"]}, askVolume: ${ticker["askVolume"]}}`
                                );
                            }
                        }
                    } catch (error) {
                        console.error(
                            `Error fetching tickers from ${exchangeId}:`,
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
            return `Failed to fetch crypto data`;
        }
    },
};

export { fetchAllCryptoPricesProvider };
