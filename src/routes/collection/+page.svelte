<script lang="ts">
    //import Message from "../Message.svelte";
    //import { chatLog, Message } from "../+page.svelte";
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
</script>

<div>
    <p class="flex flex-col text-5xl ml-12 mt-5 font-bold text-blue-500">
        收藏夹
    </p>
</div>
<div class="flex ml-12 mt-5 bg-opacity-50">
    {collectchatlog}
</div>
<button
    onclick={goBack}
    class="fixed top-0 left-0 p-2 text-lg font-bold text-white hover:bg-blue-200"
>
    <span
        class="iconify simple-line-icons--action-undo font-bond text-blue-500"
        style="font-size:35px;"
    >
    </span>
</button>
<button
    onclick={clearall}
    class="fixed bottom-0 left-0 mt-8 p-2 text-lg font-bold text-white hover:bg-blue-200"
>
    <span
        class="iconify simple-line-icons--trash font-bond text-blue-500"
        style="font-size:48px;"
    >
    </span>
</button>
