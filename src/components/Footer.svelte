<script>
  import { url, isActive } from "@sveltech/routify";
import Link from "./Link.svelte";
</script>

<style lang="scss">
  @import "../styles/global.scss";
a,
p{
  color: white;
  margin-bottom: 0;
  
}
footer{
  padding-top: 92px;
  padding-bottom: 77px;
  @media only screen and (max-width: $break-mobile) {
    padding-top: 30px;
    padding-bottom: 30px;
  }
  .row:first-child{
    margin-bottom: 90px;
    @media only screen and (max-width: $break-mobile) {
      margin-bottom: 30px;
    }
  }
  a{
    &:hover{
      color: white;
    }
  }
  ul{
  list-style: none;
  margin-bottom: 0;

  @media only screen and (max-width: $break-mobile) {
    margin-bottom: 40px;
  }
}
}
a,
p,
footer :global(.LinkComponent){
  font-size: 16px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 2;
  letter-spacing: normal;
  color: white;
}
footer :global(.LinkComponent:hover){
  color: white;
}

</style>

<footer class="bg-primary">
  <div class="container">
    <div class="row">
      <a href={$url('/index')} class="col-12 col-md-2 text-center mb-30 align-self-start">
        <img alt="logo" src="assets/logo-white.svg" width="105" />
      </a>
      <ul class="col-6 col-sm-4 col-md-2 offset-md-1">
        <li><Link text="About" link="/about"/></li>
        <li><Link text="Projects" link="/projects"/></li>
        <li><Link text="Blog" link="/blog"/></li>
        <li><Link text="Contact" link="/contact"/></li>
      </ul>
      <ul class="col-6 col-sm-4 col-md-2">
        <li><a href="https://www.facebook.com/" target="_blank">Facebook</a></li>
        <li><a href="https://www.linkedin.com/" target="_blank">LinkedIn</a></li>
        <li><a href="https://twitter.com/" target="_blank">Twitter</a></li>
        <li><a href="https://www.instagram.com/" target="_blank">Instagram</a></li>
      </ul>
      <p class="col-sm-4 col-md-2 mb-30 mb-md-0">Async d.o.o.<br />
        Lipovečka 1,<br />
        10000 Zagreb,<br />
        Croatia
      </p>
      <a class="col-md-2 offset-lg-1 text-center align-self-start" href="mailto:hello@asynclabs.co">hello@asynclabs.co</a>  
    </div>
    <div class="row">
      <p class="w-100 text-center text-md-left">© Async Labs. All rights reserved 2020.</p>
    </div>
  </div>
</footer>
