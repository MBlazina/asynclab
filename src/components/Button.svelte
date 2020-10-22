<script>
    export let text = "text";
</script>
<style lang="scss">
    @import '../styles/global.scss';
button{
    font-size: 18px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: right;
  color: #ffffff;
  background-color: $primary;
  padding: 20px;
  min-width: 220px;
  border: none;
  position: relative;
  &:hover{
      background-color: rgba(16, 16, 16, 0.3);
  }
}
</style>

<button class="d-flex justify-content-center align-items-center">{text}</button>