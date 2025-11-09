// Espera o HTML carregar
window.addEventListener('DOMContentLoaded', () => {
  console.log('App web carregado!');
  
  const btn = document.getElementById('btn-teste');
  const respostaEl = document.getElementById('resposta-api');

  btn.addEventListener('click', async () => {
    respostaEl.textContent = 'Carregando...';
    try {
      // IMPORTANTE:
      // Se seu backend Node.js está no mesmo PC:
      // - Emulador Android usa: [http://10.0.2.2:3000](http://10.0.2.2:3000)
      // - Celular real (mesma rede Wi-Fi): use o IP do PC, ex: [http://192.168.1.10:3000](http://192.168.1.10:3000)
      
      const response = await fetch('[http://10.0.2.2:3000/api/teste](http://10.0.2.2:3000/api/teste)'); // Alvo para emulador Android
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      respostaEl.textContent = `Sucesso: ${data.message}`;
    } catch (e) {
      console.error(e);
      respostaEl.textContent = `Erro ao conectar: ${e.message}`;
    }
  });
});