// CAMPO DE ANÚNCIOS E PRODUTOS: VARIÁVEIS CONSTANTES
const resultadosProdutosDiv = document.getElementById("resultadosProdutosDivID");
const resultadosProdutosUl = document.getElementById("resultadosProdutosUlID");

let produtosLi = [];
let produtosFoto = [];
let produtosTexto = [];
let produtosPreco = [];
let produtosIcone = [];
let produtosLojasNomes = [];
let produtosLink = [];
let produtosFavoritoBtn = [];

// COMENTAR =>
for (let i = 0; i < 40; i++) {
  produtosLi[i] = document.createElement('li');
  produtosLi[i].className = "resultadosProdutosLi";

  // NOVO: Botão de favorito
  produtosFavoritoBtn[i] = document.createElement('button');
  produtosFavoritoBtn[i].className = "favorite-btn";
  produtosFavoritoBtn[i].innerHTML = '<i class="far fa-heart"></i>';
  produtosFavoritoBtn[i].style.position = 'absolute';
  produtosFavoritoBtn[i].style.top = '8px';
  produtosFavoritoBtn[i].style.right = '8px';
  produtosFavoritoBtn[i].style.background = 'none';
  produtosFavoritoBtn[i].style.border = 'none';
  produtosFavoritoBtn[i].style.fontSize = '1.2rem';
  produtosFavoritoBtn[i].style.cursor = 'pointer';
  produtosFavoritoBtn[i].style.zIndex = '10';

  produtosFoto[i] = document.createElement('img');
  produtosFoto[i].className = "resultadosProdutosLiImg";

  produtosTexto[i] = document.createElement('h1');
  produtosTexto[i].className = "liProdutosTitulos";

  produtosPreco[i] = document.createElement('h2');
  produtosPreco[i].className = "liProdutosPrecos";

  produtosIcone[i] = document.createElement('img');
  produtosIcone[i].className = "liProdutosIconesImagens";

  produtosLojasNomes[i] = document.createElement('p');
  produtosLojasNomes[i].className = "liProdutosLojasNomes";

  produtosLink[i] = document.createElement('a');
  produtosLink[i].className = "resultadosProdutosA";

  // Adicionar botão de favorito primeiro
  produtosLi[i].appendChild(produtosFavoritoBtn[i]);
  produtosLi[i].appendChild(produtosFoto[i]);
  produtosLi[i].appendChild(produtosTexto[i]); 
  produtosLi[i].appendChild(produtosPreco[i]);
  produtosLi[i].appendChild(produtosIcone[i]);
  produtosLi[i].appendChild(produtosLojasNomes[i]);

  produtosLink[i].appendChild(produtosLi[i]);

  resultadosProdutosUl.appendChild(produtosLink[i]);
}

// COMENTAR E ESTUDAR =>
const params = new URLSearchParams(window.location.search);
const searchQuery = params.get("query");

// Função para salvar no histórico
async function salvarNoHistorico(product) {
  try {
    const response = await fetch('historico.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        termo: searchQuery,
        produto_nome: product.title,
        produto_url: product.product_link,
        loja_nome: product.source,
        preco: product.price,
        imagem: product.thumbnail
      })
    });
    
    const data = await response.json();
    if (!data.success) {
      console.error('Erro ao salvar no histórico');
    }
  } catch (error) {
    console.error('Erro ao salvar no histórico:', error);
  }
}

// Função para favoritar produto
async function toggleFavorite(product, heartButton, productIndex) {
  const isCurrentlyFavorite = heartButton.classList.contains('active');
  
  try {
    const response = await fetch('favoritos.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        acao: isCurrentlyFavorite ? 'remover' : 'adicionar',
        produto_nome: product.title,
        produto_url: product.product_link,
        loja_nome: product.source,
        preco: product.price,
        imagem: product.thumbnail
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      if (isCurrentlyFavorite) {
        heartButton.innerHTML = '<i class="far fa-heart"></i>';
        heartButton.classList.remove('active');
      } else {
        heartButton.innerHTML = '<i class="fas fa-heart"></i>';
        heartButton.classList.add('active');
      }
    } else {
      alert(data.message || 'Erro ao favoritar produto!');
    }
  } catch (error) {
    console.error('Erro ao atualizar favorito:', error);
    alert('Erro ao favoritar produto!');
  }
}

// Carregar favoritos do usuário
async function loadUserFavorites() {
  try {
    const response = await fetch('favoritos.php');
    if (response.ok) {
      const favoritos = await response.json();
      return favoritos.map(fav => fav.produto_url); // Alterado para comparar por URL do produto
    }
  } catch (error) {
    console.error('Erro ao carregar favoritos:', error);
  }
  return [];
}

// Função principal para buscar produtos
async function fetchProducts() {
  if (!searchQuery) return;

  try {
    document.title = 'SafeLinks - ' + searchQuery;
    
    // Carregar favoritos do usuário
    const userFavorites = await loadUserFavorites();
    
    const response = await fetch(`../api_search.php?q=${encodeURIComponent(searchQuery)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(data);

    // Processar e exibir os produtos
    if (data.shopping_results) {
      data.shopping_results.forEach((product, index) => {
        if (index < produtosFoto.length && produtosFoto[index] && produtosTexto[index]) {
          produtosFoto[index].src = product.thumbnail;
          produtosTexto[index].textContent = product.title;
          produtosPreco[index].textContent = product.price ? `${product.price}` : 'Preço não disponível!';
          produtosIcone[index].src = product.source_icon;
          produtosLojasNomes[index].textContent = product.source;
          produtosLink[index].href = product.product_link;
          produtosLink[index].target = "_blank";
          
          // Configurar botão de favorito
          const productUrl = product.product_link;
          const isFavorite = userFavorites.includes(productUrl);
          
          if (isFavorite) {
            produtosFavoritoBtn[index].innerHTML = '<i class="fas fa-heart"></i>';
            produtosFavoritoBtn[index].classList.add('active');
          } else {
            produtosFavoritoBtn[index].innerHTML = '<i class="far fa-heart"></i>';
            produtosFavoritoBtn[index].classList.remove('active');
          }
          
          // Event listener para favoritar
          produtosFavoritoBtn[index].onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(product, produtosFavoritoBtn[index], index);
          };
          
          // Adicionar evento de clique para salvar no histórico
          produtosLink[index].onclick = async (e) => {
            // Não impedir a navegação, apenas salvar no histórico em segundo plano
            await salvarNoHistorico(product);
          };
          
          produtosLi[index].style.display = 'block';
        }
      });
    }
  } catch (err) {
    console.error("Error fetching products:", err);
    resultadosProdutosUl.innerHTML = '<p style="color: red; text-align: center;">Erro ao carregar produtos. Por favor, tente novamente.</p>';
  }
}

// Chamar a função quando a página carregar
document.addEventListener('DOMContentLoaded', fetchProducts);