<script lang="ts">
    import { getContext } from "svelte";
    let collectchatlog = $state(localStorage.getItem("collectchatlog"));
    interface Message {
        id: string;
        name: string;
        model: string;
        message: string;
    }
    interface Chatlog {
        input: Message;
        output: Message;
    }
    function goBack() {
        window.history.back();
    }
    function clearall() {
        localStorage.removeItem("collectchatlog");
        collectchatlog = localStorage.getItem("collectchatlog");
    }
    let collectcl = $state<Chatlog[]>([]);
    $effect(() => {
        collectcl = collectchatlog ? JSON.parse(collectchatlog) : [];
    });
    $effect(() => {
        localStorage.setItem("collectchatlog", JSON.stringify(collectcl));
    });
    let toast: { show: (msg: string) => void } = getContext("toast");
</script>

<div class="flex gap-2">
    <div
        class="flex flex-col items-center w-12 left-0 top-0 bottom-0 bg-blue-100"
    >
        <p
            class="text-xl p-2 font-bold text-blue-500 shadow-md rounded-lg bg-blue-50"
        >
            收藏
        </p>
        <button
            onclick={goBack}
            class="rounded p-2 text-lg font-bold text-white hover:bg-blue-200"
        >
            <span
                class="iconify simple-line-icons--action-undo font-bond text-blue-500"
                style="font-size:35px;"
            >
            </span>
        </button>
        <button
            onclick={clearall}
            class="mb-4 p-2 rounded text-lg font-bold text-white hover:bg-blue-200"
        >
            <span
                class="iconify simple-line-icons--trash font-bond text-blue-500"
                style="font-size:35px;"
            >
            </span>
        </button>
    </div>
    <div class="flex flex-col gap-2 p-2 rounded border-b border-grey-200">
        {#each collectcl as { input, output }, index}
            <div>
                <p
                    class="flex mr-2 justify-between items-center font-bold text-blue-500"
                >
                    <span class="flex-grow">
                        Question:
                        <span class="font-normal ml-2 mr-4 text-black">
                            {input.message}
                        </span>
                    </span>
                    <button
                        onclick={() => {
                            collectcl.splice(index, 1);
                        }}
                    >
                        <span
                            class="iconify simple-line-icons--close font-bond text-red-500 hover:bg-red-900 rounded-full p-1"
                            style="font-size:30px;"
                        >
                        </span>
                    </button>
                </p>
            </div>
            <div>
                <p class="flex font-bold mb-2 text-blue-500">
                    {output.name}
                    <span class="flex ml-2 font-normal text-gray-500">
                        ({output.model})
                    </span>
                </p>
                <span class="font-normal ml-2 mr-4 text-black">
                    {@html output.message.replace(/\n/g, "<br>")}
                </span>
            </div>
            {#if index !== collectcl.length - 1}
                <div class="border-b border-gray-200"></div>
            {/if}
        {/each}
    </div>
</div>
