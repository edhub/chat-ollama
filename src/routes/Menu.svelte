<script>
  import { createEventDispatcher } from "svelte";
  import { fade, slide } from "svelte/transition";
  import InplaceEdit from "./InplaceEdit.svelte";

  const dispatch = createEventDispatcher();

  export let showMenu = false;
  export let selectedModel = "";
  export let serverUrl = "";

  let MODELS = ["codegemma", "llama3", "phi3:14b"];
</script>

{#if showMenu}
  <div
    on:click={() => (showMenu = false)}
    transition:fade
    class="fixed left-0 top-0 w-full h-full bg-gray-800 bg-opacity-50"
  >
    <div
      transition:slide={{ axis: "x" }}
      class="fixed top-0 right-0 h-full w-64 overflow-auto bg-white border-l border-gray-200"
    >
      <div class="w-64 p-4">
        <p class="text-lg font-bold mb-2">Choose a Model</p>
        <div>
          {#each MODELS as model (model)}
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

        <p class="text-lg font-bold mt-8 mb-2">Server Url</p>
        <div on:click|stopPropagation class="rounded bg-gray-200 p-2">
          <InplaceEdit bind:value={serverUrl} />
        </div>

        <button
          class="w-full mt-12 p-2 bg-red-500 text-white rounded"
          on:click={() => {
            dispatch("clearChat");
          }}>Clear Chat</button
        >
      </div>
    </div>
  </div>
{/if}
