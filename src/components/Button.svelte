<script>
    export let text = "text";
    export let link = '/index';
    export let color = 'black'

    import { url, isActive } from "@sveltech/routify";
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
     background-color: $secondary;
 }
  &.btn-white{
      background-color: white;
      color: $primary;
      &:hover{
      background-color: $primary;
      color: white;
  }
  }
}
</style>

<a href={$url(link)}><button class:btn-white="{color == 'white'}" class="d-flex justify-content-center align-items-center">{text}</button></a>