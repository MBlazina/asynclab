<script>
  export let title = "Title";
  export let text = "Some text";
  export let number = "01";
</script>

<style lang="scss">
  @import "../styles/global.scss";
  h3 {
    font-size: 24px;
    font-weight: bold;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    color: white;

    padding-bottom: 21px;
    padding-top: 50px;
    margin-bottom: 21px;
    position: relative;
    z-index: 1;
    span {
      position: absolute;
      left: 0;
      bottom: 0;
      font-size: 100px;
      z-index: -1;
      font-weight: normal;
      -webkit-text-fill-color: transparent; /* Will override color (regardless of order) */
      -webkit-text-stroke-width: 1px;
      -webkit-text-stroke-color: $gray-400;
    }
  }
  p {
    font-size: 18px;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.5;
    letter-spacing: normal;
    color: white;
    margin-bottom: 0;
  }
</style>

<h3>{title} <span>{number}</span></h3>
<p>{text}</p>
