<script>
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
  }
  .formWrapper{
    margin-bottom: 120px;
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
</div>
