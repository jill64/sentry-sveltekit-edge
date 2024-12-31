<script lang="ts">
  import { Toaster } from '@jill64/svelte-toast'

  let { data, children } = $props()
</script>

<Toaster />
<svelte:head>
  <title>{data.title}</title>
</svelte:head>
<h1>{data.title}</h1>
{@render children()}

<style>
  :global(body) {
    font-family: sans-serif;
  }
</style>
