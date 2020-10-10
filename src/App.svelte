<script>
  export let name;
</script>

<!--
  add lang="scss" 
  with src you can add an external scss file but than you can't write inside the style tag 
  rollup.config prepends bootstrap-custom.scss 
-->
<style lang="scss" src="./styles/test-import.scss"></style>

<main class="container">
  <div class="row">
    <h1 class="bg-primary col overflow-hidden">Hello {name}!</h1>
    <div class="col d-flex justify-content-center align-items-center">
      <h2>Lorem Ipsum</h2>
    </div>
  </div>
</main>
