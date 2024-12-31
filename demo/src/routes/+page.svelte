<script lang="ts">
  import { toast } from '@jill64/svelte-toast'
  let { data } = $props()
</script>

<p>Load at {data.loadAt} from Server</p>
<ul>
  {#each data.routes as href}
    <li>
      <a {href}>{href}</a>
    </li>
  {/each}
</ul>
<button
  onclick={() => {
    toast.error('Error from client')
    throw new Error('Error from client')
  }}
>
  Throw Error
</button>
{#each ['POST', 'PUT', 'PATCH', 'DELETE'] as method}
  <button
    onclick={async () => {
      const res = await fetch('/', { method })
      if (res.ok) {
        toast.success(await res.text())
      } else {
        toast.error(await res.text())
      }
    }}
  >
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
