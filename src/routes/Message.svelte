<script>
  import Markdown from "svelte-exmarkdown";

  import { gfmPlugin } from "svelte-exmarkdown/gfm";
  import rehypeHighlight from "rehype-highlight";
  import "highlight.js/styles/github-dark-dimmed.min.css";

  const plugins = [
    gfmPlugin(),
    {
      rehypePlugin: [rehypeHighlight],
    },
  ];

  import { fade } from "svelte/transition";
  import { createEventDispatcher } from "svelte";

  export let name = "";
  export let model = "";
  export let message = "";
  export let isRespOngoing = false;

  const dispatch = createEventDispatcher();

  let showActionButtons = false;

  function copyToClipboard() {
    navigator.clipboard.writeText(message);
    dispatch("copiedMessage");
  }
</script>

<div
  class="p-4 border-b border-gray-200"
  on:mouseover={() => {
    showActionButtons = true;
  }}
  on:focus={() => {
    showActionButtons = true;
  }}
  on:mouseleave={() => {
    showActionButtons = false;
  }}
>
  <p class="relative font-bold text-blue-500">
    {name}
    {#if name !== "User"}
      <span class="text-gray-500 font-normal">({model})</span>
    {/if}
    {#if showActionButtons}
      <span transition:fade={{ duration: 300 }}>
        <button
          class="ml-4 p-0 text-xs text-blue-400"
          on:click={copyToClipboard}>Copy</button
        >
        {#if name === "User"}
          <button
            class="ml-2 p-0 text-xs text-blue-400"
            on:click={() => {
              dispatch("resendMessage", { message });
            }}>Resend</button
          >
        {/if}
      </span>
    {/if}
  </p>
  <div class="prose mt-2 max-w-none">
    {#if message.length === 0 && isRespOngoing}
      <div class="blink">_</div>
    {:else}
      <Markdown md={message} {plugins} />
    {/if}
  </div>
</div>

<style>
  @keyframes blink {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  .blink {
    animation: blink 1s infinite;
  }
</style>
