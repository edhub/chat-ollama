<script>
  import { createEventDispatcher } from "svelte";
  import { fade, slide } from "svelte/transition";
  import InplaceEdit from "./InplaceEdit.svelte";

  import { open } from "@tauri-apps/plugin-shell";

  const dispatch = createEventDispatcher();

  export let showMenu = false;
  export let selectedModel = "";
  export let serverUrl = "";

  let localStorageModels = localStorage.getItem("models");
  let availableModels = localStorageModels
    ? JSON.parse(localStorageModels)
    : ["codegemma"];

  async function fetchMoedls() {
    const apiListModels = serverUrl + "/api/tags";
    const resp = await (await fetch(apiListModels)).json();
    console.log(resp);
    availableModels = resp.models.map((m) => m.model);
    localStorage.setItem("models", JSON.stringify(availableModels));
  }
</script>

{#if showMenu}
  <div
    on:click={() => (showMenu = false)}
    transition:fade={{ duration: 250 }}
    class="fixed left-0 top-0 w-full h-full bg-gray-800 bg-opacity-50"
  >
    <div
      transition:slide={{ duration: 250, axis: "x" }}
      class="fixed top-0 right-0 h-full w-64 overflow-auto bg-white border-l border-gray-200"
    >
      <div class="w-64 p-4">
        <div class="flex flex-row items-baseline">
          <p class="text-lg font-bold mb-2">选择模型</p>
          <button
            class="text-blue-400 hover:text-blue-500 ml-4"
            on:click|stopPropagation={fetchMoedls}>刷新</button
          >
        </div>
        <div>
          {#each availableModels as model (model)}
            <div class="flex items-center">
              <input
                type="radio"
                id={model}
                name="model"
                value={model}
                bind:group={selectedModel}
              />
              <label
                for={model}
                class="ml-1 w-full py-1 px-2 hover:bg-gray-300 rounded"
                >{model}</label
              >
            </div>
          {/each}
        </div>

        <p class="text-lg font-bold mt-8 mb-2">服务地址</p>
        <div on:click|stopPropagation class="rounded bg-gray-200 p-2">
          <InplaceEdit bind:value={serverUrl} />
        </div>

        <p class="text-lg font-bold mt-8 mb-2">FAQ</p>
        <ul class="list-disc pl-4 space-y-3">
          <li>每条对话都是独立的，目前没有做多轮对话。</li>
          <li>可以总结网页，给个地址就行。</li>
          <li>
            本地大模型能力稍弱一些，但胜任简单的任务没问题，比如翻译，给点代码建议，试试便知。
          </li>
          <li>
            <p
              class="cursor-pointer text-blue-400 hover:text-blue-500"
              on:click={() => {
                open(
                  "https://fiture.feishu.cn/docx/Z4rod0wsRoZ0vTxBuUjczBgNneb"
                );
              }}
            >
              查看帮助文档
            </p>
          </li>
        </ul>

        <button
          class="w-full mt-12 p-2 bg-red-500 text-white rounded"
          on:click={() => {
            dispatch("clearChat");
          }}>清除聊天历史</button
        >
      </div>
    </div>
  </div>
{/if}
