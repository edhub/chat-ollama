<script>
  import { fade } from "svelte/transition";

  export let message = "";
  export let x = 0;
  export let y = 0;

  let alignRight = false;

  let visible = false;
  let positionStyle = "";

  function calculatePosition() {
    const windowWidth = window.innerWidth;
    let toastX = Math.max(30, x + 16);
    let toastY = Math.max(30, y + 20);

    alignRight = windowWidth - x < 300;
    toastX = alignRight ? windowWidth - x + 16 : toastX;

    positionStyle = `${alignRight ? "right" : "left"}: ${toastX}px; top: ${toastY}px`;
  }

  $: {
    if (message.length > 0) {
      calculatePosition();

      visible = true;
      setTimeout(() => {
        message = "";
      }, 1500);
    } else {
      visible = false;
    }
  }
</script>

{#if visible}
  <div
    transition:fade={{ duration: 200 }}
    class="fixed p-2 bg-cyan-400 text-sm rounded shadow-lg"
    style={positionStyle}
  >
    {message}
  </div>
{/if}
