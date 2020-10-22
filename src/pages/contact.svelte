<script>
  import AddressBox from "../components/AddressBox.svelte";
import BackgroundTitle from "../components/BackgroundTitle.svelte";
import ContactForm from "../components/ContactForm.svelte";

  const pageTitle = "Contact Page";
</script>

<style lang="scss">
  @import "../styles/global.scss";

  h1 {
    margin-bottom: 41px;
  }
  .introText{
    margin-bottom: 110px;
    @media only screen and (max-width: $break-mobile) {
      margin-bottom: 50px;
    }
  }
  .formWrapper{
    margin-bottom: 120px;
  }
  .addressSection{
    margin-bottom: 287px;
    @media only screen and (max-width: $break-mobile) {
      margin-bottom: 50px;
    }
  }
</style>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<div class="container" data-aos="fade-up">
  <div class="row">
    <div class="col-md-6 offset-md-1">
      <h1>Let’s talk</h1>
      <p class="introText">
        Deep light land beginning form fish there brought fifth forth earth us
        make cattle seasons every spirit one can't behold, creepeth fish thing
        male his him.
      </p>
    </div>
    <div class="col-md-3 offset-md-1">
      <BackgroundTitle title={pageTitle} />
    </div>
  </div>
  <div class="row formWrapper">
    <ContactForm />
  </div>
  <div class="row addressSection">
    <div class="col-lg-4 mb-20 mb-lg-0">
      <AddressBox />
    </div>
    <div class="col-lg-4 mb-20 mb-lg-0" >
      <AddressBox background="gray"/>
    </div>
    <div class="col-lg-4 mb-20 mb-lg-0" >
      <AddressBox background="black"/>
    </div>
  </div>
</div>
