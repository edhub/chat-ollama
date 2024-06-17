<script lang="ts">
  import { grabContentFromUrl } from "$lib/grab_web_page";
  import { getContext, tick, untrack } from "svelte";
  import { queryOllama } from "../lib/ask_ollama";
  import Menu from "./Menu.svelte";
  import Message from "./Message.svelte";

  interface Message {
    id: string;
    name: string;
    model: string;
    message: string;
  }

  // 检查tauri初始化
  import { onMount } from "svelte";
  import { event } from "@tauri-apps/api";

  let isInTauri = false;

  async function checkTauriEnvironment() {
    // 检查是否在Tauri环境中
    isInTauri = typeof window.__TAURI__ !== "undefined";

    if (isInTauri) {
      // 检查Tauri是否已初始化
      try {
        await event.listen("tauri://ready", () => {
          console.log("Tauri is ready");
          // Tauri已初始化，可以在这里执行更多的操作
        });
      } catch (error) {
        console.error("Error listening to Tauri ready event:", error);
      }
    } else {
      console.log("Not running in a Tauri environment");
    }
  }

  onMount(() => {
    checkTauriEnvironment();
  });
  // 查看
  async function testQueryQwen() {
    const testMessage = {
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        {
          role: "user",
          content: "你好，哪个公园距离我最近？",
        },
      ],
    };
    const testModel = "Qwen"; // 根据需要替换为实际模型
    const testServerUrl =
      "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation";

    try {
      for await (const output of queryQwen(
        testMessage,
        testModel,
        testServerUrl,
      )) {
        console.log(output);
      }
    } catch (error) {
      console.error(error);
    }
  }

  let chatLog = $state<Message[]>([]);
  let localChatLog = localStorage.getItem("chatLog");
  chatLog = localChatLog ? JSON.parse(localChatLog) : [];
  // let qwenModels = $state("qwenPlus");
  let showMenu = $state(false);
  let message = $state("");
  let isollama = $state(false);
  let chatContainer: HTMLDivElement;
  let textarea: HTMLTextAreaElement;
  let qwenServerUrl =
    "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation";
  //输入框自动调整
  function resizeTextarea() {
    textarea.style.height = "auto";
    let maxHeight = window.innerHeight * 0.8; // 80% of the window height
    let desiredHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = desiredHeight + "px";
  }

  let respMessage = $state("");
  let isRespOngoing = $state(false);

  function resendMessage(msg: string) {
    message = msg;
    sendMessage();
  }

  async function sendMessage() {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const genId = () => Math.random().toString(36).substr(2, 9);

    if (message.trim() !== "") {
      scrollToBottom();

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

      localStorage.setItem("chatLog", JSON.stringify(chatLog));
    }
  }

  $effect(() => {
    setTimeout(() => scrollToBottom(), 500);

    const updateScrollTime = () => (scrollTime = Date.now());
    window.addEventListener("scroll", updateScrollTime);
    return () => window.removeEventListener("scroll", updateScrollTime);
  });

  let scrollTime = 0;
  function shouldAutoScroll() {
    const threshold = 200; // distance from bottom in pixels
    const distanceFromBottom =
      document.documentElement.scrollHeight -
      window.scrollY -
      window.innerHeight;
    const isScrolling = Date.now() - scrollTime < 100;
    const nearBottom = distanceFromBottom < threshold;
    return isRespOngoing && nearBottom && !isScrolling;
  }

  $effect(() => {
    if (respMessage && shouldAutoScroll()) {
      scrollToBottom();
    }
  });

  async function scrollToBottom() {
    await tick();
    chatContainer.scrollIntoView({ behavior: "smooth", block: "end" });
  }

  let selectedModel = $state(
    localStorage.getItem("selectedModel") ?? "codegemma"
  );

  $effect(() => {
    if (selectedModel !== "") {
      let model = selectedModel;
      localStorage.setItem("selectedModel", model);
      untrack(() => toast.show("已选模型: " + model));
    }
  });

  let serverUrl = $state(
    localStorage.getItem("serverUrl") ?? "http://10.1.22.88:11434"
  );

  $effect(() => {
    if (serverUrl === "") {
      serverUrl = "http://localhost:11434";
    }
    serverUrl = serverUrl.replace(/\/$/, ""); // trim last slash
    localStorage.setItem("serverUrl", serverUrl);
  });

  let toast: { show: (msg: string) => void } = getContext("toast");
</script>

<div class="z-0 w-full h-full">
  <div bind:this={chatContainer} class=" flex flex-col overflow-y-auto pb-20">
    {#each chatLog as { id, name, model, message } (id)}
      <Message
        {name}
        {model}
        {message}
        onMessageCopied={() => {
          toast.show("消息已复制到剪贴板");
        }}
        onResendMessage={resendMessage}
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

  {#if isollama === true}
    <form
      class="chat-input fixed bottom-0 w-full bg-white flex items-end"
      onsubmit={(e) => {
        e.preventDefault();
        sendMessage();
      }}
    >
      <textarea
        bind:this={textarea}
        id="chat-input"
        placeholder="输入消息..."
        bind:value={message}
        class="m-2 p-2 resize-none rounded border flex-grow outline-none"
        rows="2"
        maxlength="4000"
        onkeydown={async (e) => {
          if (
            e.key === "Enter" &&
            e.keyCode === 13 &&
            !e.altKey &&
            !e.shiftKey
          ) {
            e.preventDefault();
            sendMessage();
            await tick();
            resizeTextarea();
          }
        }}
        oninput={resizeTextarea}
      ></textarea>

      <button
        type="submit"
        class="m-2 ml-0 p-2 rounded bg-blue-400 hover:bg-blue-500 text-white"
      >
        <span class="iconify simple-line-icons--paper-plane"></span>
      </button>
    </form>
  {:else}
    <form
      class="chat-input fixed bottom-0 w-full bg-white flex items-end"
      onsubmit={(e) => {
        e.preventDefault();
        sendMessageqwen();
      }}
    >
      <textarea
        bind:this={textarea}
        id="chat-input"
        placeholder="输入消息..."
        bind:value={message}
        class="m-2 p-2 resize-none rounded border flex-grow outline-none"
        rows="2"
        maxlength="4000"
        onkeydown={async (e) => {
          if (
            e.key === "Enter" &&
            e.keyCode === 13 &&
            !e.altKey &&
            !e.shiftKey
          ) {
            e.preventDefault();
            sendMessageqwen();
            await tick();
            resizeTextarea();
          }
        }}
        oninput={resizeTextarea}
      ></textarea>

      <button
        type="submit"
        class="m-2 ml-0 p-2 rounded bg-blue-400 hover:bg-blue-500 text-white"
      >
        <span class="iconify simple-line-icons--paper-plane"></span>
      </button>
    </form>
  {/if}
</div>

<button
  class="fixed top-0 right-0 m-2 p-2 rounded bg-blue-400 hover:bg-blue-500 text-white"
  onclick={() => (showMenu = true)}
>
  <span class="iconify simple-line-icons--menu"> </span>
</button>

<button
  class="fixed top-0 right-0 m-2 p-2 rounded bg-blue-400 hover:bg-blue-500 text-white"
  onclick={testQueryQwen}>测试 queryQwen</button
>

<Menu
  bind:showMenu
  bind:selectedModel
  bind:serverUrl
  bind:qwenServerUrl
  bind:isollama
  clearChat={() => {
    chatLog = [];
    localStorage.removeItem("chatLog");
  }}
/>
