<script>
  //ROUTIFY IMPORT
  import { Router } from "@sveltech/routify";
  import { routes } from "@sveltech/routify/tmp/routes";

  import { afterPageLoad } from "@sveltech/routify";
  $afterPageLoad((page) => {
    console.log("loaded " + page.title);
   /*  var prevScrollpos = window.pageYOffset; */
    window.onscroll = function () {
      console.log(window.scrollY)
      /* var currentScrollPos = window.pageYOffset; */
      /* if (prevScrollpos > currentScrollPos) {
        document.getElementsByTagName("header")[0].style.top = "0";
      } else {
        document.getElementsByTagName("header")[0].style.top = "-50px";
      }
      prevScrollpos = currentScrollPos; */
    };
  });

  import "./libs/aos/aos.js";
</script>

<!--
  add lang="scss" 
  with src you can add an external scss file but than you can't write inside the style tag 
  rollup.config prepends bootstrap-custom.scss 
-->
<style lang="scss">
</style>

<Router {routes} />
