<script lang="ts">
  let { value = $bindable("") } = $props();

  let editing = $state(false);
  let tempValue = $state(value);

  function handleKeydown(event: KeyboardEvent) {
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
  <!-- svelte-ignore a11y_autofocus -->
  <input
    type="text"
    bind:value={tempValue}
    onkeydown={handleKeydown}
    onblur={handleBlur}
    autofocus
  />
{:else}
  <p
    onclick={(e) => {
      editing = true;
      tempValue = value;
    }}
  >
    {value}
  </p>
{/if}
