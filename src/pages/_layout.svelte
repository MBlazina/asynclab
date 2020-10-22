<script>
import Header from "../components/Header.svelte";
import Footer from "../components/Footer.svelte";
</script>
<style lang="scss">
main{
    padding-top: 112px;
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
