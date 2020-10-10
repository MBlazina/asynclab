<script>
  import { url } from "@sveltech/routify";
</script>

<style lang="scss">

</style>
<header class="pt-15 pb-5">
  <div class="container">
    <div class="row">
      <div class="col-4 d-flex justify-content-start">
        <a href={$url('/')} class="p-5">Home</a>
        <a href={$url('about')} class="p-5">About</a>
      </div>
    </div>
  </div>
</header>
