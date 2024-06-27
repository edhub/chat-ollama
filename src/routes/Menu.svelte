<script lang="ts">
  import { fade, slide } from "svelte/transition";
  import InplaceEdit from "./InplaceEdit.svelte";

  let {
    showMenu = $bindable(false),
    selectedOption = $bindable(),
    serverUrl = $bindable(),
    qwenServerUrl = $bindable(),
    api_key = $bindable(),
    clearChat,
  }: {
    showMenu: boolean;
    selectedOption: string;
    serverUrl: string;
    qwenServerUrl: string;
    api_key: string;
    clearChat: () => void;
  } = $props();

  let localStorageModels = localStorage.getItem("models");
  let availableModels = $state(
    localStorageModels ? JSON.parse(localStorageModels) : ["codegemma"],
  );
  async function fetchMoedls() {
    const apiListModels = serverUrl + "/api/tags";
    const resp = await (await fetch(apiListModels)).json();
    availableModels = resp.models.map((m: any) => m.model);
    localStorage.setItem("models", JSON.stringify(availableModels));
  }
  let Qwen = ["qwen-plus", "qwen-max", "qwen-turbo"];
</script>

{#if showMenu}
  <div
    onclick={() => (showMenu = false)}
    transition:fade={{ duration: 250 }}
    class="fixed left-0 top-0 w-full h-full bg-gray-800 bg-opacity-50"
  >
    <div
      transition:slide={{ duration: 250, axis: "x" }}
      class="fixed mb-2 top-0 right-0 h-full w-64 overflow-auto bg-white border-l border-gray-200"
    >
      <div class="w-64 p-4">
        <div class="mb-1 space-x-2">
          <p class="text-xl font-bold flex items-center justify-center">
            Ollama
          </p>
          <button
            class="text-blue-400 hover:text-blue-500"
            onclick={(e) => {
              e.stopPropagation();
              fetchMoedls();
            }}>刷新</button
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
                bind:group={selectedOption}
              />
              <label
                for={model}
                class="ml-1 w-full py-1 px-2 hover:bg-gray-300 rounded"
                >{model}</label
              >
            </div>
          {/each}
        </div>
        <div
          onclick={(e) => e.stopPropagation()}
          class="rounded bg-gray-100 p-2 mt-3"
        >
          <InplaceEdit bind:value={serverUrl} />
        </div>
        <p class="text-xs font-bold mt-2 mb-4 bg-white">*点击修改服务地址</p>
        <div class="mt-8 mb-8">
          <p class="text-xl font-bold mt-4 mb-2 text-center">Qwen</p>
          {#each Qwen as qwen (qwen)}
            <div class="flex items-center">
              <input
                type="radio"
                id={qwen}
                name="model"
                value={qwen}
                bind:group={selectedOption}
              />
              <label
                for={qwen}
                class="ml-1 w-full py-1 px-2 hover:bg-gray-300 rounded"
                >{qwen}</label
              >
            </div>
          {/each}
          <div
            onclick={(e) => e.stopPropagation()}
            class="rounded bg-gray-100 p-2 mt-3"
            style="word-break:break-all;overflow-wrap: break-word;"
          >
            <InplaceEdit bind:value={qwenServerUrl} />
          </div>
          <p class="text-xs font-bold mt-2 mb-10">*点击修改服务地址</p>
          <div
            onclick={(e) => e.stopPropagation()}
            class="rounded bg-gray-100 p-2 mt-3"
            style="word-break:break-all;overflow-wrap: break-word;"
          >
            <p class="text-M font-bold mt-2 mb-2">API_KEY</p>
            <InplaceEdit bind:value={api_key} />
          </div>
        </div>
        <div class="flex justify-between">
          <a href="/Help">
            <div
              class="flex justify-head p-2 mt-3 mr-8 rounded hover:bg-blue-100"
            >
              <span
                class="iconify simple-line-icons--question text-blue-500"
                style="font-size:48px;"
              >
              </span>
            </div>
          </a>
          <button
            class="p-2 mt-3 text-white rounded hover:bg-blue-100"
            onclick={clearChat}
          >
            <span
              class="iconify simple-line-icons--trash font-bond text-blue-500"
              style="font-size:48px;"
            >
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
