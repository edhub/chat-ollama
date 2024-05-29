<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { fade } from "svelte/transition";

  let { message = "" } = $props();

  let alignRight = false;

  let visible = $state(false);
  let positionStyle = $state("");

  onMount(() => {
    window.addEventListener("mousemove", trackMouse);
  });

  onDestroy(() => {
    window.removeEventListener("mousemove", trackMouse);
  });

  let x = 0;
  let y = 0;

  function trackMouse(event: MouseEvent) {
    x = event.clientX;
    y = event.clientY;
  }

  function calculatePosition() {
    const windowWidth = window.innerWidth;
    let toastX = Math.max(30, x + 20);
    let toastY = Math.max(30, y);

    alignRight = windowWidth - x < 300;
    toastX = alignRight ? windowWidth - x + 20 : toastX;

    positionStyle = `${alignRight ? "right" : "left"}: ${toastX}px; top: ${toastY}px`;
  }

  $effect(() => {
    if (message.length > 0) {
      calculatePosition();

      visible = true;
      setTimeout(() => {
        message = "";
      }, 1500);
    } else {
      visible = false;
    }
  });
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
