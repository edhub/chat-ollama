<script>
    import { open } from "@tauri-apps/plugin-shell";
    function goBack() {
        window.history.back();
    }
    async function openLink() {
    await open('https://github.com/edhub/chat-ollama')}
</script>

<t1 class="flex items-centers  mb-5 ml-4 p-0 text-4xl font-bond text-blue-400">
    <br>help page<br>
</t1>

<p class="text-lg font-bold mt-8 mb-2 ml-5">FAQ</p>
<ul class="list-disc pl-4 space-y-3 ml-5">
  <li>每条对话都是独立的，目前没有做多轮对话。</li>
  <li>可以总结网页，给个地址就行。</li>
  <li>
    本地大模型能力稍弱一些，但胜任简单的任务没问题，比如翻译，给点代码建议，试试便知。
  </li>
  <li>
    <button onclick={openLink} class="font-bond hover:underline"
    > README </button>
  </li>
</ul>

<button onclick={goBack}>
<span class="flex items-centers w-30 ml-5 mb-3 mt-20 p-2 text-lg text-white font-bond bg-blue-400 hover:bg-lue-500">
go back
</span>
</button>