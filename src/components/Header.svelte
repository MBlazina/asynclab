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

    &.open {
      opacity: 1;
      right: 0;
      pointer-events: all;
    }
    a {
      color: white;
    }
    .mainNav {
      li {
        display: flex;
        align-items: center;
        &:hover {
          .menuArrow {
            opacity: 1;
          }
        }
      }
      list-style: none;
      a {
        font-size: 46px;
        font-weight: bold;
        line-height: 1.96;
        &:hover {
          color: white !important;
        }
      }
      &:hover {
        a {
          color: $gray-400;
        }
      }
      .menuArrow {
        width: 21px;
        height: 18px;
        margin-left: 27px;
        background: url("/assets/menu-arrow.svg");
        background-repeat: no-repeat;
        background-size: contain;
        opacity: 0;
      }
    }
    .utilityNav {
      font-size: 24px;
      font-weight: normal;
      font-stretch: normal;
      font-style: normal;
      line-height: 2.08;
      letter-spacing: normal;
      list-style: none;
      a {
        color: #b3b3b3;
        &:hover {
          color: white;
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
    pointer-events: none;
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

  $menuWidth: 18px;
  $iconWidth: 2px;
  .closeIcon {
    width: $menuWidth;
    height: $menuWidth;
    margin-right: 15px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 36px;
    margin-bottom: 68px;
    cursor: pointer;
    &:hover {
      &::before,
      &::after {
        background-color: white;
      }
      &::before {
        transform: rotate(135deg);
      }
      &::after {
        transform: rotate(45deg);
      }
    }
    &::before,
    &::after {
      content: "";
      width: calc(#{$menuWidth} + #{$menuWidth} / 2);
      position: absolute;
      height: $iconWidth;
      border-radius: $iconWidth;
      background-color: #b3b3b3;
      display: block;
      transition: transform 0.2s;
    }
    &::before {
      transform: rotate(45deg);
    }
    &::after {
      transform: rotate(-45deg);
    }
  }
</style>

<div class="menuWrapper">
  <div class:open={menuOpen} class="mainMenuBackground" on:click={handleMenu} />
  <div
    id="mainMenu"
    class:open={menuOpen}
    class="col col-md-8 offset-md-4 h-100">
    <div class="row d-flex justify-content-end">
      <div class="closeIcon" on:click={handleMenu} />
    </div>
    <div class="row">
      <ul class="mainNav offset-lg-2 col-lg-4" on:click={handleMenu}>
        <li>
          <a href={$url('/index')}>Home</a>
          <div class="menuArrow" />
        </li>
        <li>
          <a href={$url('/projects')}>Projects</a>
          <div class="menuArrow" />
        </li>
        <li>
          <a href={$url('/about')}>About</a>
          <div class="menuArrow" />
        </li>
        <li>
          <a href={$url('/services')}>Services</a>
          <div class="menuArrow" />
        </li>
        <li>
          <a href={$url('/contact')}>Contact</a>
          <div class="menuArrow" />
        </li>
      </ul>
      <ul class="utilityNav offset-lg-1 col-lg-4" on:click={handleMenu}>
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

<header class="pt-30">
  <div class="container">
    <div class="row d-flex justify-content-between align-items-center">
      <a
        href={$url('/index')}
        class="pl-15 pl-md-0"
        class:active={$isActive('/index')}>
        <img alt="logo" src="/assets/logo.svg" width="105" />
      </a>
      <div
        id="menuIcon"
        class="mr-15 mr-md-0 d-flex flex-column align-items-end"
        on:click={handleMenu} />
      <!-- <a href={$url('/contact')} class="p-15" class:active={$isActive('/contact')}>Contact</a> -->
    </div>
  </div>
</header>
