<script>
    export let city = "London, UK";
    export let address = "Vlaška ulica, 70 E";
    export let email = "hello@asynclabs.co";
    export let phone = "+385 99 4936 071";

    export let background = "gray";
</script>

<style lang="scss">
    @import '../styles/global.scss';
    div{
        padding: 41px 51px;
    }
    .gray{
        background-color: $gray-100;
    }
    .black{
        background-color: $primary;
        h3,
        p{
            color: $gray-100;
        }
    }
 h3{
    font-size: 24px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  color:$primary;

  margin-bottom: 24px;
 }
 p{
    font-size: 18px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1;
  letter-spacing: normal;
  color: $gray-700;
  &:last-child{
      margin-bottom: 0;
  }

  margin-bottom: 15px;
 }
</style>

<div class:gray="{background == 'gray'}" class:black="{background == 'black'}">
    <h3>{city}</h3>
    <p>{address}</p>
    <p>{email}</p>
    <p>{phone}</p>
</div>