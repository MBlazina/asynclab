<script>
  export let position = "right";
  export let title = "title";
  export let text = "insert some profound text here"
  export let imageMain = "assets/images/services/1.jpg";
  export let imageSecondary = "assets/images/services/2.jpg";
  import Button from "./Button.svelte";
</script>

<style lang="scss">
  @import "../styles/global.scss";
  .imageContainer {
    position: relative;
    display: flex;
    justify-content: flex-start;
  }

  .imgMain {
    margin-top: 116px;
    z-index: 2;
    width: 83%;
  }
  .imgSecondary {
    position: absolute;
    top: 0;
    right: 0;
    z-index: -1;
    width: 45%;
  }

  .serviceInfo {
    padding-left: 70px;
    h2 {
      margin-bottom: 40px;
    }
    p {
      margin-bottom: 57px;
    }
    .servicesList {
      list-style: none;
      margin-bottom: 0;
      li {
        display: flex;
        align-items: center;
        text-transform: uppercase;
        font-size: 13px;
        font-weight: bold;
        font-stretch: normal;
        font-style: normal;
        line-height: normal;
        letter-spacing: 2px;
        color: $primary;
        margin-bottom: 22px;
        &:last-child {
          margin-bottom: 0;
        }
        &::before {
          content: "";
          width: 11px;
          margin-right: 20px;
          height: 1px;
          display: block;
          background: $secondary;
        }
      }
      margin-bottom: 57px;
    }
    .btn {
      margin-top: 57px;
    }
  }

  .imageGroupWrapper {
    &.right {
      flex-direction: row-reverse;
      .imageContainer {
        justify-content: flex-end;
        .imgSecondary {
          left: 0;
          right: auto;
        }
      }
      .serviceInfo {
        padding-left: 0;
        padding-right: 70px;
      }
    }
  }
</style>

<div
  class:left={position == 'left'}
  class:right={position == 'right'}
  class="imageGroupWrapper row d-flex align-items-center">
  <div class="imageContainer col-md-6 p-0">
    <img class="imgMain" src={imageMain} alt="" />
    <img class="imgSecondary" src={imageSecondary} alt="" />
  </div>
  <div class="serviceInfo col-md-6">
    <h2>{title}</h2>
    <p>{text}</p>
    <ul class="servicesList">
      <li>Frontend Development</li>
      <li>Backend Development</li>
      <li>Mobile Development</li>
      <li>Blockchain Development</li>
    </ul>
    <Button text="View service" />
  </div>
</div>
