<script lang="ts">
  import { afterUpdate, onDestroy, onMount, tick } from "svelte";
  import { queryOllama } from "../lib/ask_ollama";
  import { grabContentFromUrl } from "$lib/grab_web_page";
  import Message from "./Message.svelte";
  import Menu from "./Menu.svelte";
  import Toast from "./Toast.svelte";

  let showMenu = false;
  let chatLog: any[] = [];

  let selectedModel = "";

  const DEFAULT_SERVER_URL = "http://127.0.0.1:11434/api/generate";
  let serverUrl = DEFAULT_SERVER_URL;

  onMount(() => {
    selectedModel = localStorage.getItem("selectedModel") || "codegemma";
    serverUrl = localStorage.getItem("serverUrl") || DEFAULT_SERVER_URL;

    let localChatLog = localStorage.getItem("chatLog");
    chatLog = localChatLog ? JSON.parse(localChatLog) : [];
    resizeTextarea();

    setTimeout(() => {
      scrollToBottom();
    }, 500);
    window.addEventListener("mousemove", trackMouse);
  });

  onDestroy(() => {
    window.removeEventListener("mousemove", trackMouse);
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
      chatLog.push({ id: genId(), name: "User", model: "", message });
      chatLog = chatLog;
      respMessage = "_";

      const url = message.match(urlRegex);

      if (url) {
        for (let i = 0; i < url.length; i++) {
          const content =
            (await grabContentFromUrl(url[i])) || "(无法打开这个网页)";
          console.log(content);
          message = message.replace(url[i], `${url[i]} ${content}`);
        }
      }

      const deltaReader = queryOllama(message, selectedModel, serverUrl);

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
        model: selectedModel,
        message: respMessage,
      });
      chatLog = chatLog;

      respMessage = "";

      await tick();
      resizeTextarea();
      localStorage.setItem("chatLog", JSON.stringify(chatLog));
    }
  }

  afterUpdate(() => {
    if (respMessage.length > 0) {
      scrollToBottom();
    }
  });

  async function scrollToBottom() {
    await tick();
    chatContainer.scrollIntoView({ behavior: "smooth", block: "end" });
  }

  let x = 0;
  let y = 0;
  let toastMessage = "";

  function trackMouse(event: MouseEvent) {
    x = event.clientX;
    y = event.clientY;
  }

  $: {
    if (selectedModel !== "") {
      localStorage.setItem("selectedModel", selectedModel);
      showToastMessage("Selected model: " + selectedModel);
    }
  }
  $: {
    localStorage.setItem("serverUrl", serverUrl);
  }

  function resendMessage(event: any) {
    message = event.detail.message;
    sendMessage();
  }

  function showToastMessage(message: string) {
    toastMessage = message;
  }
</script>

<div class="z-0 w-full h-full">
  <div bind:this={chatContainer} class=" flex flex-col overflow-y-auto pb-20">
    {#each chatLog as { id, name, model, message } (id)}
      <Message
        {name}
        {model}
        {message}
        on:copiedMessage={() => {
          showToastMessage("Message copied!");
        }}
        on:resendMessage={resendMessage}
      />
    {/each}
    {#if respMessage.length > 0}
      <Message name="Ollama" model={selectedModel} message={respMessage} />
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

<button
  class="fixed top-0 right-0 m-2 p-1 rounded bg-blue-500 text-white"
  on:click={() => (showMenu = true)}>Menu</button
>

<Toast {x} {y} bind:message={toastMessage} />

<Menu
  bind:showMenu
  bind:selectedModel
  on:clearChat={() => {
    chatLog = [];
    localStorage.removeItem("chatLog");
  }}
/>
