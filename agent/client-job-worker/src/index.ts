import { Client, elizaLogger, IAgentRuntime } from "@elizaos/core";
import { createPublicClient, createWalletClient, http, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { createContract } from "./actions/createContractFromMinutes";

// ウォレットクライアントの初期化
const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(process.env.EVM_PROVIDER_URL),
});

const abi = [
    {
        inputs: [
            {
                internalType: "address",
                name: "_disputeResolver",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "jobId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "contractor",
                type: "address",
            },
        ],
        name: "JobApplied",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "jobId",
                type: "uint256",
            },
        ],
        name: "JobCancelled",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "jobId",
                type: "uint256",
            },
        ],
        name: "JobCompleted",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "jobId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "client",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "depositAmount",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                indexed: false,
                internalType: "string",
                name: "title",
                type: "string",
            },
            {
                indexed: false,
                internalType: "string",
                name: "description",
                type: "string",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "deadline",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "string",
                name: "jobURI",
                type: "string",
            },
        ],
        name: "JobCreated",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "jobId",
                type: "uint256",
            },
        ],
        name: "JobDeadlineCancelled",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "jobId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "string",
                name: "submissionURI",
                type: "string",
            },
        ],
        name: "JobDelivered",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "jobId",
                type: "uint256",
            },
        ],
        name: "JobDisputed",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "jobId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "disputeUpheld",
                type: "bool",
            },
        ],
        name: "JobResolved",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "jobId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "contractor",
                type: "address",
            },
        ],
        name: "JobStarted",
        type: "event",
    },
    {
        inputs: [],
        name: "AUTO_APPROVE_PERIOD",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ internalType: "uint256", name: "_jobId", type: "uint256" }],
        name: "applyForJob",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ internalType: "uint256", name: "_jobId", type: "uint256" }],
        name: "approveAndComplete",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ internalType: "uint256", name: "_jobId", type: "uint256" }],
        name: "autoApproveIfTimeoutPassed",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ internalType: "uint256", name: "_jobId", type: "uint256" }],
        name: "autoCancelIfDeadlinePassed",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ internalType: "uint256", name: "_jobId", type: "uint256" }],
        name: "cancelJob",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "address", name: "_tokenAddress", type: "address" },
            {
                internalType: "uint256",
                name: "_depositAmount",
                type: "uint256",
            },
            { internalType: "string", name: "_title", type: "string" },
            { internalType: "string", name: "_description", type: "string" },
            { internalType: "uint256", name: "_deadline", type: "uint256" },
            { internalType: "string", name: "_jobURI", type: "string" },
        ],
        name: "createJob",
        outputs: [{ internalType: "uint256", name: "jobId", type: "uint256" }],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "uint256", name: "_jobId", type: "uint256" },
            { internalType: "string", name: "_submissionURI", type: "string" },
        ],
        name: "deliverWork",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "disputeResolver",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ internalType: "uint256", name: "_jobId", type: "uint256" }],
        name: "getJob",
        outputs: [
            { internalType: "address", name: "client_", type: "address" },
            { internalType: "address", name: "contractor_", type: "address" },
            {
                internalType: "uint256",
                name: "depositAmount_",
                type: "uint256",
            },
            { internalType: "address", name: "tokenAddress_", type: "address" },
            {
                internalType: "enum WorkAgreement.JobStatus",
                name: "status_",
                type: "uint8",
            },
            { internalType: "string", name: "title_", type: "string" },
            { internalType: "string", name: "description_", type: "string" },
            { internalType: "uint256", name: "deadline_", type: "uint256" },
            { internalType: "string", name: "jobURI_", type: "string" },
            { internalType: "uint256", name: "deliveredAt_", type: "uint256" },
            { internalType: "string", name: "submissionURI_", type: "string" },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "jobCounter",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        name: "jobs",
        outputs: [
            { internalType: "address", name: "client", type: "address" },
            { internalType: "address", name: "contractor", type: "address" },
            { internalType: "uint256", name: "depositAmount", type: "uint256" },
            { internalType: "address", name: "tokenAddress", type: "address" },
            {
                internalType: "enum WorkAgreement.JobStatus",
                name: "status",
                type: "uint8",
            },
            { internalType: "string", name: "title", type: "string" },
            { internalType: "string", name: "description", type: "string" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
            { internalType: "string", name: "jobURI", type: "string" },
            {
                internalType: "uint256",
                name: "deliveredTimestamp",
                type: "uint256",
            },
            { internalType: "string", name: "submissionURI", type: "string" },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "owner",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ internalType: "uint256", name: "_jobId", type: "uint256" }],
        name: "raiseDispute",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "uint256", name: "_jobId", type: "uint256" },
            { internalType: "bool", name: "_disputeUpheld", type: "bool" },
        ],
        name: "resolveDispute",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "address", name: "_resolver", type: "address" },
        ],
        name: "setDisputeResolver",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "uint256", name: "_jobId", type: "uint256" },
            {
                internalType: "address",
                name: "_selectedContractor",
                type: "address",
            },
        ],
        name: "startContract",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ internalType: "uint256", name: "_jobId", type: "uint256" }],
        name: "withdrawPayment",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    { stateMutability: "payable", type: "receive" },
] as const;

// const contractAddress = "0x6cD5fda7C84A9F6EAd2F7768985A2B67d97A06C1";
const contractAddress = "0xf5b7EFc4E95403B9715c63b47beEFf75C574e269";
const account = privateKeyToAccount(process.env.EVM_PRIVATE_KEY_WORKER as Hex);
const client = createWalletClient({
    account,
    chain: sepolia,
    transport: http(process.env.EVM_PROVIDER_URL),
});

export class JobWorkerClient {
    interval: NodeJS.Timeout;
    runtime: IAgentRuntime;

    constructor(runtime: IAgentRuntime) {
        elizaLogger.success("running JobWorkerClient...");
        this.runtime = runtime;
        // start a loop that runs every x seconds
        this.watchJobCreation();
        this.watchJobStarted();
        this.watchDeliveryWorkApproval();
    }

    // タスク作成イベント（JobCreated)を監視し、スマートコントラクトの応募メソッド（applyForJob)を実行する
    watchJobCreation() {
        publicClient.watchContractEvent({
            address: contractAddress,
            abi: abi,
            eventName: "JobCreated",
            onLogs: async (logs) => {
                elizaLogger.success("JobCreatedイベントが検出されました");

                try {
                    const jobId = logs[0].args.jobId;
                    const title = logs[0].args.title;
                    const url = logs[0].args.jobURI;

                    if (!title.includes("議事録")) {
                        elizaLogger.info("契約書作成タスクではありません。");

                        return;
                    }

                    elizaLogger.success("契約書作成タスクが見つかりました。");

                    // タスクに応募するスマートコントラクトを実行
                    await client.writeContract({
                        address: contractAddress,
                        abi: abi,
                        functionName: "applyForJob",
                        chain: sepolia,
                        account: account,
                        args: [BigInt(jobId)],
                    });

                    await this.runtime.messageManager.createMemory({
                        userId: this.runtime.agentId,
                        agentId: this.runtime.agentId,
                        roomId: this.runtime.agentId,
                        content: {
                            text: jobId.toString(),
                            key: "jobId",
                            url: url,
                        },
                    });
                    elizaLogger.success("タスクに応募しました。");
                } catch (error) {
                    elizaLogger.error("エラーが発生しました:", error);
                }
            },
            onError: (error) => {
                elizaLogger.error(
                    "イベント監視中にエラーが発生しました:",
                    error
                );
            },
        });
    }

    // タスク応募の承認(JobStarted)を監視し、契約書を作成する。その後にスマートコントラクトの納品メソッド（deliverWork)を実行する
    watchJobStarted() {
        publicClient.watchContractEvent({
            address: contractAddress,
            abi: abi,
            eventName: "JobStarted",
            onLogs: async (logs) => {
                elizaLogger.success("JobStartedイベントが検出されました");

                try {
                    const memories =
                        await this.runtime.messageManager.getMemories({
                            roomId: this.runtime.agentId,
                        });
                    const memorisedJob = memories.find(
                        (memory) => memory.content.key === "jobId"
                    );

                    const jobId = logs[0].args.jobId;

                    if (BigInt(jobId) !== BigInt(memorisedJob.content.text)) {
                        elizaLogger.error("jobIdが一致しません。");
                        elizaLogger.error("jobId:", jobId);
                        elizaLogger.error(
                            "memorisedJob.content.text:",
                            memorisedJob.content.text
                        );

                        return;
                    }

                    // createContractActionを呼び出す
                    const url: string = (await createContract(
                        memorisedJob.content.url
                    )) as string;

                    // deliverWorkメソッドを実行
                    await client.writeContract({
                        address: contractAddress,
                        abi: abi,
                        functionName: "deliverWork",
                        chain: sepolia,
                        account: account,
                        args: [BigInt(memorisedJob.content.text), url],
                    });

                    elizaLogger.success(
                        "契約書の作成、納品が完了しました。",
                        url
                    );
                } catch (error) {
                    elizaLogger.error(
                        "createContractFromMinutes: エラーが発生しました:",
                        error
                    );
                }
            },
            onError: (error) => {
                elizaLogger.error(
                    "イベント監視中にエラーが発生しました:",
                    error
                );
            },
        });
    }

    // 納品承認イベント(JobCompleted)を監視し、スマートコントラクトの報酬引き出しメソッド（withdrawPayment)を実行する
    watchDeliveryWorkApproval() {
        publicClient.watchContractEvent({
            address: contractAddress,
            abi: abi,
            eventName: "JobCompleted",
            onLogs: async (logs) => {
                elizaLogger.success("JobCompletedイベントが検出されました");

                try {
                    const memories =
                        await this.runtime.messageManager.getMemories({
                            roomId: this.runtime.agentId,
                        });
                    const memorisedJob = memories.find(
                        (memory) => memory.content.key === "jobId"
                    );

                    const jobId = logs[0].args.jobId;

                    if (BigInt(jobId) !== BigInt(memorisedJob.content.text)) {
                        elizaLogger.error("jobIdが一致しません。");
                        elizaLogger.error("jobId:", jobId);
                        elizaLogger.error(
                            "memorisedJob.content.text:",
                            memorisedJob.content.text
                        );

                        return;
                    }

                    // withdrawPaymentメソッドを実行
                    await client.writeContract({
                        address: contractAddress,
                        abi: abi,
                        functionName: "withdrawPayment",
                        chain: sepolia,
                        account: account,
                        args: [BigInt(jobId)],
                    });

                    elizaLogger.success("報酬を引き出しました。");
                } catch (error) {
                    elizaLogger.error(
                        "withdrawPayment: エラーが発生しました:",
                        error
                    );
                }
            },
            onError: (error) => {
                elizaLogger.error(
                    "イベント監視中にエラーが発生しました:",
                    error
                );
            },
        });
    }
}

export const jobWorkerInterface: Client = {
    start: async (runtime: IAgentRuntime) => {
        const client = new JobWorkerClient(runtime);
        return client;
    },
    stop: async (_runtime: IAgentRuntime) => {
        elizaLogger.warn("Direct client does not support stopping yet");
    },
};

export default jobWorkerInterface;
