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
  interface Chatlog {
    iscollect?: boolean;
    input: Message;
    output: Message;
  }
  let selectedOption = $state(
    localStorage.getItem("selectedOption") ?? "llama3:latest",
  );
  let chatLog = $state<Chatlog[]>([]);
  let localChatLog = localStorage.getItem("chatLog");
  chatLog = localChatLog ? JSON.parse(localChatLog) : [];
  let showMenu = $state(false);
  let message = $state("");
  let chatContainer: HTMLDivElement;
  let textarea: HTMLTextAreaElement;
  let qwenServerUrl = $state(
    "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
  );
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
    sendmsg();
  }

  let collectchatlog = $state<Chatlog[]>([]);
  let localcollectchatlog = localStorage.getItem("collectchatlog");
  collectchatlog = localcollectchatlog ? JSON.parse(localcollectchatlog) : [];

  let server = $state("");
  $effect(() => {
    if (selectedOption.includes("qwen")) {
      server = qwenServerUrl;
    } else {
      server = serverUrl;
    }
  });
  interface Msg {
    messages: [
      {
        role: "user";
        content: string;
      },
    ];
  }

  async function* query(Msg: Msg, model: string) {
    if (selectedOption.includes("qwen")) {
      yield* queryQwen(Msg, model, server);
    } else {
      yield* queryOllama(Msg.messages[0].content, model, server);
    }
  }
  async function sendmsg() {
    const genId = () => Math.random().toString(36).substr(2, 9);
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    if (message.trim() !== "") {
      scrollToBottom();
      let tmpMsg = message;
      //提取url
      const url = tmpMsg.match(urlRegex);
      if (url) {
        for (let i = 0; i < url.length; i++) {
          const content =
            (await grabContentFromUrl(url[i])) || "(无法打开这个网页)";
          tmpMsg = tmpMsg.replace(url[i], `${url[i]} ${content}`);
        }
      }
      const id = genId();
      let input = {
        id: id,
        name: "User",
        model: selectedOption,
        message: tmpMsg,
      };
      message = "";
      isRespOngoing = true;
      let Msg: Msg = {
        messages: [
          {
            role: "user",
            content: tmpMsg,
          },
        ],
      };
      let deltaReader = query(Msg, selectedOption);
      for await (const delta of deltaReader) {
        respMessage += delta;
      }
      //console.log(respMessage);
      respMessage = respMessage.length > 0 ? respMessage : "好像出错啦";
      let output = {
        id: id,
        name: selectedOption.includes("qwen") ? "Qwen" : "Ollama",
        model: selectedOption,
        message: JSON.stringify(respMessage),
      };
      chatLog.push({
        input: input,
        output: output,
      });
      chatLog = chatLog;
      // console.log(JSON.stringify(chatLog));
      isRespOngoing = false;
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

  $effect(() => {
    if (selectedOption !== "") {
      //   await tick();
      let model = selectedOption;
      untrack(() => toast.show("已选模型: " + model));
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
  $effect(() => {
    selectedOption.includes("qwen") ? "Qwen" : "Ollama";
  });
  let toast: { show: (msg: string) => void } = getContext("toast");
</script>

<div class="z-0 w-full h-full">
  <div bind:this={chatContainer} class=" flex flex-col overflow-y-auto pb-20">
    {#each chatLog as { input, output }}
      {#each [input] as { name, model, message }}
        <Message
          {name}
          {model}
          {message}
          onMessageCopied={() => {
            toast.show("消息已复制到剪贴板");
          }}
          onResendMessage={resendMessage}
          collectedsession={() => {
            collectchatlog.push({
              input: input,
              output: output,
            });
            localStorage.setItem(
              "collectchatlog",
              JSON.stringify(collectchatlog),
            );
          }}
        />
      {/each}
      {#each [output] as { name, model, message }}
        <Message
          {name}
          {model}
          {message}
          onMessageCopied={() => {
            toast.show("消息已复制到剪贴板");
          }}
        />
      {/each}
    {/each}
    {#if isRespOngoing}
      <Message
        name={modelname}
        model={selectedOption}
        {message}
        {isRespOngoing}
      />
    {/if}
  </div>

  <form
    class="chat-input fixed bottom-0 w-full bg-white flex items-end"
    onsubmit={(e) => {
      e.preventDefault();
      sendmsg();
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
            sendmsg();
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

  <a href="/collection">
    <div
      class="fixed top-10 right-0 p-2 m-2 rounded text-white bg-blue-400 hover:bg-blue-500"
    >
      <span class="iconify simple-line-icons--folder-alt"> </span>
    </div>
  </a>

  <button
    class="fixed top-0 right-0 m-2 p-2 rounded bg-blue-400 hover:bg-blue-500 text-white"
    onclick={() => (showMenu = true)}
  >
    <span class="iconify simple-line-icons--menu"> </span>
  </button>
</div>

<Menu
  bind:showMenu
  bind:selectedOption
  bind:serverUrl
  bind:qwenServerUrl
  bind:api_key
  clearChat={() => {
    chatLog = [];
    localStorage.removeItem("chatLog");
  }}
/>
