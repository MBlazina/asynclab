<script>
  import { url, isActive } from "@sveltech/routify";
import Link from "./Link.svelte";
</script>

<style lang="scss">
a,
p{
  color: white;
  
}
footer{
  padding-top: 92px;
  padding-bottom: 77px;
  .row:first-child{
    margin-bottom: 90px;
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
ul{
  list-style: none;
}
</style>

<footer class="bg-primary">
  <div class="container">
    <div class="row">
      <a href={$url('/index')} class="col-2">
        <img alt="logo" src="assets/logo-white.svg" width="105" />
      </a>
      <ul class="col-2 offset-1">
        <li><Link text="About" link="/about"/></li>
        <li><Link text="Projects" link="/projects"/></li>
        <li><Link text="Blog" link="/blog"/></li>
        <li><Link text="Contact" link="/contact"/></li>
      </ul>
      <ul class="col-2">
        <li><a href="https://www.facebook.com/" target="_blank">Facebook</a></li>
        <li><a href="https://www.linkedin.com/" target="_blank">LinkedIn</a></li>
        <li><a href="https://twitter.com/" target="_blank">Twitter</a></li>
        <li><a href="https://www.instagram.com/" target="_blank">Instagram</a></li>
      </ul>
      <p class="col-2">Async d.o.o.<br />
        Lipovečka 1,<br />
        10000 Zagreb,<br />
        Croatia
      </p>
      <a class="col-2 offset-1" href="mailto:hello@asynclabs.co">hello@asynclabs.co</a>  
    </div>
    <div class="row">
      <p>© Async Labs. All rights reserved 2020.</p>
    </div>
  </div>
</footer>
