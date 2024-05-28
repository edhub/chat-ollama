<script lang="ts">
  import { grabContentFromUrl } from "$lib/grab_web_page";
  import { afterUpdate, onDestroy, onMount, tick } from "svelte";
  import { queryOllama } from "../lib/ask_ollama";
  import Menu from "./Menu.svelte";
  import Message from "./Message.svelte";
  import Toast from "./Toast.svelte";

  let showMenu = false;
  let chatLog: any[] = [];

  let selectedModel = localStorage.getItem("selectedModel") ?? "codegemma";

  let serverUrl =
    localStorage.getItem("serverUrl") ?? "http://10.1.22.88:11434";

  onMount(() => {
    let localChatLog = localStorage.getItem("chatLog");
    chatLog = localChatLog ? JSON.parse(localChatLog) : [];
    resizeTextarea();

    setTimeout(() => {
      scrollToBottom();
    }, 500);
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
  let isRespOngoing = false;

  async function sendMessage() {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const genId = () => Math.random().toString(36).substr(2, 9);

    if (message.trim() !== "") {
      let tmpMsg = message;
      message = "";

      chatLog.push({ id: genId(), name: "User", model: "", message: tmpMsg });
      chatLog = chatLog;
      isRespOngoing = true;

      const url = tmpMsg.match(urlRegex);

      if (url) {
        for (let i = 0; i < url.length; i++) {
          const content =
            (await grabContentFromUrl(url[i])) || "(无法打开这个网页)";
          tmpMsg = tmpMsg.replace(url[i], `${url[i]} ${content}`);
        }
      }

      const deltaReader = queryOllama(tmpMsg, selectedModel, serverUrl);

      for await (const delta of deltaReader) {
        respMessage += delta;
      }

      respMessage = respMessage.length > 0 ? respMessage : "好像出错啦";

      chatLog.push({
        id: genId(),
        name: "Ollama",
        model: selectedModel,
        message: respMessage,
      });
      chatLog = chatLog;

      isRespOngoing = false;
      respMessage = "";

      await tick();
      resizeTextarea();
      localStorage.setItem("chatLog", JSON.stringify(chatLog));
    }
  }

  afterUpdate(() => {
    if (isRespOngoing) {
      scrollToBottom();
    }
  });

  async function scrollToBottom() {
    await tick();
    chatContainer.scrollIntoView({ behavior: "smooth", block: "end" });
  }

  let toastMessage = "";

  $: {
    if (selectedModel !== "") {
      localStorage.setItem("selectedModel", selectedModel);
      showToastMessage("已选模型: " + selectedModel);
    }
  }

  $: {
    if (serverUrl === "") {
      serverUrl = "http://localhost:11434";
    }
    serverUrl = serverUrl.replace(/\/$/, ""); // trim last slash
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
          showToastMessage("已复制");
        }}
        on:resendMessage={resendMessage}
      />
    {/each}
    {#if isRespOngoing}
      <Message
        name="Ollama"
        model={selectedModel}
        message={respMessage}
        {isRespOngoing}
      />
    {/if}
  </div>

  <form
    class="chat-input fixed bottom-0 w-full bg-white flex items-end"
    on:submit|preventDefault={sendMessage}
  >
    <textarea
      bind:this={textarea}
      id="chat-input"
      placeholder="输入消息..."
      bind:value={message}
      class="m-2 p-2 rounded border flex-grow outline-none"
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

    <button
      type="submit"
      class="m-2 ml-0 p-2 rounded bg-blue-400 hover:bg-blue-500 text-white"
    >
      <span class="iconify simple-line-icons--paper-plane"></span>
    </button>
  </form>
</div>

<button
  class="fixed top-0 right-0 m-2 p-2 rounded bg-blue-400 hover:bg-blue-500 text-white"
  on:click={() => (showMenu = true)}
>
  <span class="iconify simple-line-icons--menu"> </span>
</button>

<Toast bind:message={toastMessage} />

<Menu
  bind:showMenu
  bind:selectedModel
  bind:serverUrl
  on:clearChat={() => {
    chatLog = [];
    localStorage.removeItem("chatLog");
  }}
/>
