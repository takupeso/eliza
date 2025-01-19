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

            for (const exchangeId of exchanges) {
                const exchangeClass = ccxt[exchangeId];
                console.error(`exchangeId: ${exchangeId}`);
                if (!exchangeClass) continue;

                const exchange = new exchangeClass();
                if (!exchange.has["fetchTickers"]) continue;
                console.error(`fetchTickers: ${exchangeId}`);
                try {
                    const markets = await exchange.loadMarkets();
                    const usdtPairs = Object.keys(markets).filter(
                        (symbol) =>
                            symbol.includes("USDT") &&
                            (symbol.includes("FAI") ||
                                symbol.includes("AKUMA") ||
                                symbol.includes("AI16Z") ||
                                symbol.includes("DOGE") ||
                                symbol.includes("BTC") ||
                                symbol.includes("SHIB"))
                    );
                    if (usdtPairs.length === 0) continue;

                    const tickers = await exchange.fetchTickers(usdtPairs);
                    for (const [symbol, ticker] of Object.entries(tickers)) {
                        if (
                            ticker["bid"] !== undefined &&
                            ticker["bidVolume"] !== undefined &&
                            ticker["ask"] !== undefined &&
                            ticker["askVolume"] !== undefined
                        ) {
                            console.error(`${exchangeId} ${symbol}: ${ticker}`);
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
            }

            const resultString = results.join("");
            await runtime.databaseAdapter.createKnowledge({
                id: uuidv4() as `${string}-${string}-${string}-${string}-${string}`,
                content: {
                    text: resultString,
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
