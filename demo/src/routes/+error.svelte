<script lang="ts">
  import { page } from '$app/stores'
</script>

<h1>Error Page</h1>
<p>message:{$page.error?.message}</p>
<p>EventId: {$page.error?.sentryEventId}</p>
