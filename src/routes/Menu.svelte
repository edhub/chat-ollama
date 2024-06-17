<script lang="ts">
  import { fade, slide } from "svelte/transition";
  import InplaceEdit from "./InplaceEdit.svelte";
  import { open } from "@tauri-apps/plugin-shell";

  let {
    showMenu = $bindable(false),
    selectedModel = $bindable(),
    // qwenModels = $bindable(),
    serverUrl = $bindable(),
    qwenServerUrl = $bindable(),
    isollama = $bindable(),
    clearChat,
  }: {
    showMenu: boolean;
    selectedModel: string;
    qwenModels: string;
    serverUrl: string;
    qwenServerUrl: string;
    isollama: boolean;
    clearChat: () => void;
  } = $props();

  let localStorageModels = localStorage.getItem("models");
  let availableModels = $state(
    localStorageModels ? JSON.parse(localStorageModels) : ["codegemma"]
  );
  // 从服务器获取模型列表并更新到本地存储到模型列表中【在这里改变qwen本地存储setting】
  async function fetchMoedls() {
    const apiListModels = serverUrl + "/api/tags";
    const resp = await (await fetch(apiListModels)).json();
    availableModels = resp.models.map((m: any) => m.model);//这里面每个元素都是models属性，这个是用来function到吗？还是只是名字
    localStorage.setItem("models", JSON.stringify(availableModels));
  }
  const qwenPlus = "qwen-plus";
</script>

{#if showMenu}
  <div
    onclick={() => (showMenu = false)}
    transition:fade={{ duration: 250 }}
    class="fixed left-0 top-0 w-full h-full bg-gray-800 bg-opacity-50"
  >
    <div
      transition:slide={{ duration: 250, axis: "x" }}
      class="fixed top-0 right-0 h-full w-64 overflow-auto bg-white border-l border-gray-200"
    >
<!------------------------本地模型模块---------------------------------->
      <div class="w-64 p-4">
        <div class="flex flex-row items-baseline">
          <p class="text-lg font-bold mb-2">选择模型</p>
          <button
            class="text-blue-400 hover:text-blue-500 ml-4"
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
                bind:group={selectedModel}
                onchange={() => isollama = true}              
              />
              <label
                for={model}
                class="ml-1 w-full py-1 px-2 hover:bg-gray-300 rounded"
                >{model}</label
              >
            </div>
          {/each}
        </div>

        <p class="text-lg font-bold mt-5 mb-4 mb-2">服务地址</p>
        <div 
          onclick={(e) => e.stopPropagation()}
          class="rounded bg-gray-200 p-2"
        >
          <InplaceEdit bind:value={serverUrl}/>
        </div>
<!-----------------qwen------------------------>
          <div class="mt-8">
          <p class="text-lg font-bold mb-2">通义千问</p>
              <div class="flex items-center mt-3">
                <input
                  type="radio"
                  id={qwenPlus}
                  name="qwen"
                  value={qwenPlus}
                  onchange={() => isollama = false}
                />
                <label
                  for={qwenPlus}
                  class="ml-1 w-full py-1 px-2 hover:bg-gray-300 rounded"
                  >qwen-plus</label
                >
              </div>
              <p class="text-lg font-bold mt-5 mb-4 mb-2">服务地址</p>
              <div 
                onclick={(e) => e.stopPropagation()}
                class="rounded bg-gray-200 p-2"
              >
                <InplaceEdit bind:value={ qwenServerUrl }/>
              </div>
          </div>


       

        <a href="/Help">
          <div class="mt-10 text-lg font-bond text-blue-400 hover:text-blue-500"
          >help page
        </div>
        </a>

        <button
          class="w-full p-2 mt-10 bg-red-500 text-white rounded"
          onclick={clearChat}>清除聊天历史</button
        >
      </div>
    </div>
  </div>
{/if}
