<script lang="ts">
  import { grabContentFromUrl } from "$lib/grab_web_page";
  import { getContext, tick, untrack } from "svelte";
  import { queryOllama } from "../lib/ask_ollama";
  import { queryQwen } from "../lib/qwen";
  import Menu from "./Menu.svelte";
  import Message from "./Message.svelte";

  interface Message {
    id: string;
    name: string;
    model: string;
    message: string;
  }

  let chatLog = $state<Message[]>([]);
  let localChatLog = localStorage.getItem("chatLog");
  chatLog = localChatLog ? JSON.parse(localChatLog) : [];
  let showMenu = $state(false);
  let message = $state("");
  let isollama = $state(false);
  let chatContainer: HTMLDivElement;
  let textarea: HTMLTextAreaElement;
  let qwenServerUrl =
    "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation";
  let qwenmodel = $state("qwen-plus");
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

  // ollama-sendmessage
  async function sendMessage() {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const genId = () => Math.random().toString(36).substr(2, 9);

    if (message.trim() !== "") {
      scrollToBottom();
      let tmpMsg = message;
      message = "";
      chatLog.push({ id: genId(), name: "User", model: "", message: tmpMsg });
      chatLog = chatLog;
      isRespOngoing = true; // 模型开始运转
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
  // qwen-sendmessage
  async function sendMessageqwen() {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const genId = () => Math.random().toString(36).substr(2, 9);

    if (message.trim() !== "") {
      scrollToBottom();

      let tmpMsg = message;
      message = "";

      chatLog.push({ id: genId(), name: "User", model: "", message: tmpMsg });
      chatLog = chatLog;
      isRespOngoing = true;

      //url提取无法作用
      const url = tmpMsg.match(urlRegex);
      if (url) {
        for (let i = 0; i < url.length; i++) {
          const content =
            (await grabContentFromUrl(url[i])) || "(无法打开这个网页)";
          tmpMsg = tmpMsg.replace(url[i], `${url[i]} ${content}`);
        }
      }
      let Msg = {
        messages: [
          {
            role: "user",
            content: tmpMsg,
          },
        ],
      };
      //console.log(Msg);
      const deltaReader = queryQwen(Msg, qwenmodel, qwenServerUrl);
      for await (const delta of deltaReader) {
        respMessage += delta;
      }
      //console.log(respMessage);
      respMessage = respMessage.length > 0 ? respMessage : "好像出错啦";
      chatLog.push({
        id: genId(),
        name: "Qwen",
        model: qwenmodel,
        message: respMessage,
      });
      chatLog = chatLog;
      isRespOngoing = false;
      respMessage = "";
      localStorage.setItem("chatLog", JSON.stringify(chatLog));
    }
  }
  async function sendMSG() {
    if (isollama === true) {
      sendMessage();
    } else {
      sendMessageqwen();
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
    localStorage.getItem("selectedModel") ?? "codegemma",
  );

  //选择之后提示选择模型
  $effect(() => {
    if (AllModel !== "") {
      (async () => {
        let model = AllModel;
        await tick();
        untrack(() => toast.show("已选模型: " + model));
        if (isollama) {
          localStorage.setItem("selectedModel", model);
        }
      })();
    }
  });

  let serverUrl = $state(
    localStorage.getItem("serverUrl") ?? "http://10.1.22.88:11434",
  );

  $effect(() => {
    if (serverUrl === "") {
      serverUrl = "http://localhost:11434";
    }
    serverUrl = serverUrl.replace(/\/$/, ""); // trim last slash
    localStorage.setItem("serverUrl", serverUrl);
  });

  // api_key定义
  let api_key = $state(
    localStorage.getItem("api_key") ?? "sk-b6fb4372167e4e849094180c9a227b3c",
  );
  $effect(() => {
    if (api_key === "") {
      api_key = "sk-b6fb4372167e4e849094180c9a227b3c";
    }
    localStorage.setItem("api_key", api_key);
  });

  let modelname = $state("");
  let AllModel = $state("");
  $effect(() => {
    modelname = isollama ? "Ollama" : "Qwen";
    AllModel = isollama ? selectedModel : qwenmodel;
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
        name={modelname}
        model={AllModel}
        message={respMessage}
        {isRespOngoing}
      />
    {/if}
  </div>

  <form
    class="chat-input fixed bottom-0 w-full bg-white flex items-end"
    onsubmit={(e) => {
      e.preventDefault();
      sendMSG();
    }}
  >
    <div class="fixed bottom-0 w-full bg-white flex items-end">
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
            sendMSG();
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
    </div>
  </form>

  <button
    class="fixed top-0 right-0 m-2 p-2 rounded bg-blue-400 hover:bg-blue-500 text-white"
    onclick={() => (showMenu = true)}
  >
    <span class="iconify simple-line-icons--menu"> </span>
  </button>
</div>

<Menu
  bind:showMenu
  bind:selectedModel
  bind:serverUrl
  bind:qwenServerUrl
  bind:isollama
  bind:qwenmodel
  bind:api_key
  clearChat={() => {
    chatLog = [];
    localStorage.removeItem("chatLog");
  }}
/>
