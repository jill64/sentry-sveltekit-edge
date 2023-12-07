<script lang="ts">
  export let data

  $: ({ loadAt, routes } = data)
</script>

<p>Load at {loadAt} from Server</p>
<ul>
  {#each routes as href}
    <li>
      <a {href}>{href}</a>
    </li>
  {/each}
</ul>
<button
  on:click={() => {
    throw new Error('Error from client')
  }}
>
  Throw Error
</button>
{#each ['POST', 'PUT', 'PATCH', 'DELETE'] as method}
  <button on:click={() => fetch('/', { method })}>
    {method}
  </button>
{/each}

<style>
  @media (prefers-color-scheme: dark) {
    :global(body) {
      background: #111;
      color: #eee;
    }
    a {
      color: #3442ac;
    }
  }
</style>
