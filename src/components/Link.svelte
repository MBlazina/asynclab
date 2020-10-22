<script>
  import { url } from "@sveltech/routify";
  export let text = "link text";
  export let link = "/index";
</script>

<style lang="scss">
  @import "../styles/global.scss";
</style>

<a class="LinkComponent" href={$url(link)}> {text} </a>
