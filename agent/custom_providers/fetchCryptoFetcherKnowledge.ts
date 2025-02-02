import { IAgentRuntime, Memory, State } from "../../packages/core/src/types";

export async function fetchCryptoFetcherKnowledgeProvider(
    runtime: IAgentRuntime,
    _message: Memory,
    _state?: State
): Promise<string> {
    try {
        if (runtime.character?.name === "cryptoAnalyst") {
            // 共有知識からcryptoFetcherのデータを取得
            const knowledgeEntries =
                runtime.character.knowledge
                    ?.filter((k) => typeof k !== "string" && k.shared)
                    ?.map((k) => {
                        if (typeof k === "string") return k;
                        const content = runtime.readSharedKnowledge(k.path);
                        return `[${k.path}]\n${content}`;
                    }) || [];

            return (
                knowledgeEntries.join("\n\n") ||
                "暗号通貨フェッチャーからのデータがありません"
            );
        }
        return "";
    } catch (error) {
        console.error("暗号通貨知識の取得エラー:", error);
        return "";
    }
}
