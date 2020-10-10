<script>
  //ROUTIFY IMPORT
  import { Router } from "@sveltech/routify";
  import { routes } from "@sveltech/routify/tmp/routes";
</script>

<!--
  add lang="scss" 
  with src you can add an external scss file but than you can't write inside the style tag 
  rollup.config prepends bootstrap-custom.scss 
-->
<style lang="scss" global>
  *,
  *::before,
  *::after,
  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
</style>

<Router {routes} />
