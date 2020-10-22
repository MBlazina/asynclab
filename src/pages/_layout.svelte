<script>
import Header from "../components/Header.svelte";
import Footer from "../components/Footer.svelte";
</script>
<style lang="scss">
    @import '../styles/global.scss';
main{
    padding-top: 112px;
    @media only screen and (max-width: $break-mobile) {
        padding-top: 60px;
    }
}
.wrapper{
    overflow-x: hidden;
}
</style>

    <div class="wrapper h-100 d-flex flex-column">
        <Header />
        <main class="flex-grow-1">
            <slot />
        </main>
        
        <Footer />
    </div>
