<script>
    export let title = 'Page title'
</script>

<style lang="scss">
    @import '../styles/global.scss';
  p {
    -webkit-text-stroke: 0.6px #e5e5e5;
    font-family: Swansea;
    font-size: 130px;
    font-weight: bold;
    font-stretch: normal;
    font-style: normal;
    line-height: 0.54;
    letter-spacing: normal;
    color: rgba(18, 18, 18, 0);
    white-space: nowrap;
    @media only screen and (max-width: $break-mobile) {
        display: none;
    }
  }
</style>

<p>{title}</p>
