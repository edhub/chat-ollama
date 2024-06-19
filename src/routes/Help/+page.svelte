<script>
  import { open } from "@tauri-apps/plugin-shell";
  function goBack() {
    window.history.back();
  }
  async function openLink() {
    await open("https://github.com/edhub/chat-ollama");
  }
</script>

<div class="flex flex-col items-center justify-center min-h-screen">
  <p class="text-4xl font-bold text-blue-400 mb-8">help page</p>

  <p class="text-lg font-bold mb-5">FAQ</p>
  <ul class="list-disc space-y-3">
    <li>每条对话都是独立的，目前没有做多轮对话。</li>
    <li>可以总结网页，给个地址就行。</li>
    <li>
      本地大模型能力稍弱一些，但胜任简单的任务没问题，比如翻译，给点代码建议，试试便知。
    </li>
    <li>
      <button onclick={openLink} class="font-bold hover:underline">
        README
      </button>
    </li>
  </ul>

  <button
    onclick={goBack}
    class="mt-8 p-2 w-32 text-lg font-bold text-white bg-blue-400 hover:bg-blue-500"
  >
    go back
  </button>
</div>
