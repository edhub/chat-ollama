<script lang="ts">
  let message = "";
  let chatLog = [];

  function sendMessage() {
    if (message.trim() !== "") {
      chatLog.push(message);
      message = "";
    }
  }
</script>

<div class="chat-container text-red-500">
  sdfs sdf
  <div class="chat-log">
    {#each chatLog as msg, i}
      <p>{msg}</p>
    {/each}
  </div>

  <form class="chat-input text-blue-400" on:submit|preventDefault={sendMessage}>
    <input
      id="chat-input"
      placeholder="Type a message..."
      bind:value={message}
    />
    <button type="submit">Send</button>
  </form>
</div>

<style>
  .chat-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .chat-log {
    flex: 1;
    overflow-y: auto;
    padding: 1em;
    border-bottom: 1px solid #ccc;
  }

  .chat-input {
    display: flex;
    justify-content: space-between;
    padding: 1em;
  }

  .chat-input input {
    flex: 1;
    margin-right: 1em;
  }
</style>
