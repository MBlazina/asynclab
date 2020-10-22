<script>
  import { url, isActive } from "@sveltech/routify";

  let menuOpen = false;
   function handleMenu() {
  menuOpen = !menuOpen;
}

</script>

<style lang="scss">
  @import "../styles/global.scss";
  #mainMenu {
    position: absolute;
    right: -100%;
    top: 0;
    z-index: 99;
    background-color: $primary;
    pointer-events: none;
    opacity: 0;
    transition: right 0.5s, opacity 0.5s;
    padding-top: 110px;

    &.open {
      opacity: 1;
      right: 0;
      pointer-events: all;
    }
    a {
      color: white;
    }
    .mainNav {
      list-style: none;
      a {
        font-size: 46px;
        font-weight: bold;
        line-height: 1.96;
        &:hover {
        }
      }
    }
  }
  .mainMenuBackground {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 98;
    background-color: black;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;
    &.open {
      opacity: 0.5;
      pointer-events: all;
    }
  }
  .menuWrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  #menuIcon {
    width: 34px;
    height: auto;
    position: relative;
    &:hover {
      cursor: pointer;
      &::before {
        width: 20px;
      }
      &::after {
        width: 100%;
      }
    }
    &::before,
    &::after {
      content: "";
      display: block;
      background-color: $primary;
      height: 2px;
      right: 0;
      transition: width 0.2s ease-in-out;
    }
    &::before {
      width: 100%;
      top: 0;
    }
    &::after {
      width: 20px;
      margin-top: 8px;
    }
  }
</style>

<div class="menuWrapper">
  <div class:open={menuOpen} class="mainMenuBackground" on:click={handleMenu} />
  <div
    id="mainMenu"
    class:open={menuOpen}
    class="col col-md-8 offset-md-4 h-100">
    <div class="row">
      <ul class="mainNav offset-md-2 col-md-4">
        <li>
          <a href={$url('/index')} class:active={$isActive('/index')}>Home</a>
        </li>
        <li>
          <a
            href={$url('/projects')}
            class:active={$isActive('/projects')}>Projects</a>
        </li>
        <li>
          <a href={$url('/about')} class:active={$isActive('/about')}>About</a>
        </li>
        <li>
          <a
            href={$url('/services')}
            class:active={$isActive('/services')}>Services</a>
        </li>
        <li>
          <a
            href={$url('/contact')}
            class:active={$isActive('/contact')}>Contact</a>
        </li>
      </ul>
      <ul class="offset-md-2 col-md-4">
        <li>
          <a
            href={$url('/careers')}
            class:active={$isActive('/careers')}>Careers</a>
        </li>
        <li>
          <a href={$url('/team')} class:active={$isActive('/team')}>Team</a>
        </li>
        <li>
          <a href={$url('/blog')} class:active={$isActive('/blog')}>Blog</a>
        </li>
      </ul>
    </div>
  </div>
</div>


<header class="">
  <div class="container">
    <div class="row d-flex justify-content-between align-items-center">
      <a href={$url('/index')} class="p-15" class:active={$isActive('/index')}>
        <img alt="logo" src="assets/logo.svg" width="105" />
      </a>
      <div
        id="menuIcon"
        class="d-flex flex-column align-items-end"
        on:click={handleMenu} />
      <!-- <a href={$url('/contact')} class="p-15" class:active={$isActive('/contact')}>Contact</a> -->
    </div>
  </div>
</header>
