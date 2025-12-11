 
export class HomePage {
    constructor() {
        this.container = document.getElementById('Home');
    }

    async render() {
        // 1. Mostra estado de carregamento
        this.container.innerHTML = `
            <div class="p-4 text-center">
                <h1 class="text-2xl font-bold mb-4">Resumo</h1>
                <p>Seja bem vindo(a) ao Saint Finance</p>
            </div>`;

        try {
      
            
            
        } catch (error) {
            console.error(error);
            this.container.innerHTML = `<p class="text-red-500">Erro .</p>`;
        }
    }
}