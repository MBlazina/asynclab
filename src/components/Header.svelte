<script>
  import { url, isActive } from "@sveltech/routify";
  console.log($url());
</script>

<style lang="scss">
  header{
    a{
      &:hover{
        text-decoration: none;
      }
      transition: transform 0.2s;
      &:hover,
      &.active{
        transform: rotate(-5deg);
      }
    }
  }
</style>
<header class="">
  <div class="container">
    <div class="row">
      <div class="col-4 d-flex justify-content-start">
        <a href={$url('/index')} class="p-15" class:active={$isActive('/index')}>Home</a>
        <a href={$url('/about')} class="p-15" class:active={$isActive('/about')}>About</a>
      </div>
    </div>
  </div>
</header>
