<script>
  export let value = "";

  let editing = false;
  let tempValue = value;

  // @ts-ignore
  function handleKeydown(event) {
    if (event.key === "Enter") {
      value = tempValue;
      editing = false;
    } else if (event.key === "Escape") {
      editing = false;
    }
  }
  function handleBlur() {
    value = tempValue;
    editing = false;
  }
</script>

{#if editing}
  <!-- svelte-ignore a11y-autofocus -->
  <input
    type="text"
    bind:value={tempValue}
    on:keydown={handleKeydown}
    on:blur={handleBlur}
    autofocus
  />
{:else}
  <p
    on:click={() => {
      editing = true;
      tempValue = value;
    }}
  >
    {value}
  </p>
{/if}
