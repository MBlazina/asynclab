<script>
  import { url, isActive } from "@sveltech/routify";
  let menuOpen = false;

  function handleMenu(){
    menuOpen = !menuOpen;
    console.log(menuOpen)
  }
</script>

<style lang="scss">
  @import "../styles/global.scss";
  #mainMenu {
    position: absolute;
    right: 0;
    top: 0;
    background-color: black;
    z-index: 999;
    pointer-events: none;
    opacity: 0;
    &.open {
      opacity: 0.8;
    }
  }
  #menuIcon {
    width: 34px;
    height: auto;
    position: relative;
    &:hover{
      cursor: pointer;
      &::before{
        width: 20px;
      }
      &::after{
        width: 100%;
      }
    }
    &::before,
    &::after {
      content: "";
      display: block;
      background-color: $primary;
      height: 2px;
      //position: absolute;
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

<div id="mainMenu" class:open="{menuOpen}" class="w-100 h-100">menu</div>
<header class="">
  <div class="container">
    <div class="row d-flex justify-content-between align-items-center">
      <a href={$url('/index')} class="p-15" class:active={$isActive('/index')}>
        <img alt="logo" src="assets/logo.svg" width="105" />
      </a>
      <div id="menuIcon" class="d-flex flex-column align-items-end" on:click={handleMenu}/>
      <!-- <a href={$url('/contact')} class="p-15" class:active={$isActive('/contact')}>Contact</a> -->
    </div>
  </div>
</header>
