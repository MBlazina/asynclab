<script>
  //ROUTIFY IMPORT
  import { Router } from "@sveltech/routify";
  import { routes } from "@sveltech/routify/tmp/routes";

  import { afterPageLoad } from "@sveltech/routify"

</script>

<!--
  add lang="scss" 
  with src you can add an external scss file but than you can't write inside the style tag 
  rollup.config prepends bootstrap-custom.scss 
-->
<style lang="scss">

  
</style>

<Router {routes} />
