<script lang="ts">
  import Markdown from "svelte-markdown";

  import { afterUpdate, onMount, tick } from "svelte";
  import { queryOllama } from "../lib/ask_ollama";
  import { grabContentFromUrl } from "$lib/grab_web_page";

  let chatLog: any[] = [];

  onMount(() => {
    let localChatLog = localStorage.getItem("chatLog");
    chatLog = localChatLog ? JSON.parse(localChatLog) : [];
    resizeTextarea();
  });

  let message = "";

  let chatContainer: HTMLDivElement;
  let textarea: HTMLTextAreaElement;

  function resizeTextarea() {
    textarea.style.height = "auto";
    let maxHeight = window.innerHeight * 0.8; // 80% of the window height
    let desiredHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = desiredHeight + "px";
  }

  let respMessage = "";

  async function sendMessage() {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const genId = () => Math.random().toString(36).substr(2, 9);

    if (message.trim() !== "") {
      chatLog.push({ id: genId(), name: "User", message });
      chatLog = chatLog;
      respMessage = "_";

      const url = message.match(urlRegex);

      if (url) {
        for (let i = 0; i < url.length; i++) {
          const content =
            (await grabContentFromUrl(url[i])) || "(无法打开这个网页)";
          message = message.replace(url[i], `${url[i]} ${content}`);
        }
      }

      const deltaReader = queryOllama(message);

      message = "";

      for await (const delta of deltaReader) {
        if (respMessage === "_") {
          respMessage = delta;
        } else {
          respMessage += delta;
        }
      }

      chatLog.push({
        id: genId(),
        name: "Ollama",
        message: respMessage,
      });
      chatLog = chatLog;

      respMessage = "";

      await tick();
      resizeTextarea();
      localStorage.setItem("chatLog", JSON.stringify(chatLog));
    }
  }

  afterUpdate(async () => {
    await tick();
    chatContainer.scrollIntoView({ behavior: "smooth", block: "end" });
  });

  function clearChatHistory() {
    chatLog = [];
    respMessage = "";
  }
</script>

<div class="">
  <button
    class="fixed top-0 right-0 m-2 p-1 rounded bg-red-400 text-white"
    on:click={clearChatHistory}
  >
    Clear
  </button>
  <div bind:this={chatContainer} class=" flex flex-col overflow-y-auto pb-20">
    {#each chatLog as { id, name, message } (id)}
      <div class="p-4 border-b border-gray-200">
        <p class="font-bold text-blue-500">{name}</p>
        <div class="prose mt-2">
          <Markdown source={message} />
        </div>
      </div>
    {/each}
    {#if respMessage.length > 0}
      <div class="p-4 border-b border-gray-200">
        <p class="font-bold text-blue-500">Ollama</p>
        <div class="prose mt-2">
          {#if respMessage === "_"}
            <p class="blink">_</p>
          {:else}
            <Markdown source={respMessage} />
          {/if}
        </div>
      </div>
    {/if}
  </div>

  <form
    class="chat-input fixed bottom-0 w-full bg-white flex items-end"
    on:submit|preventDefault={sendMessage}
  >
    <textarea
      bind:this={textarea}
      id="chat-input"
      placeholder="Type a message..."
      bind:value={message}
      class="m-2 p-2 rounded border flex-grow"
      rows="2"
      maxlength="4000"
      style="resize: none;"
      on:keydown={(e) => {
        if (e.key === "Enter" && !e.altKey && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      }}
      on:input={resizeTextarea}
    />

    <button type="submit" class="m-2 p-2 rounded bg-blue-400 text-white"
      >Send</button
    >
  </form>
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
