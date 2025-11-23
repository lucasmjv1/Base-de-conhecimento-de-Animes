// --- ELEMENTOS DA LISTAGEM ---
const container = document.querySelector('.card-container'); // Onde os cards são renderizados
const loadMoreBtn = document.getElementById('loadMore'); // Botão de paginação

// --- BUSCA E FILTROS ---
const searchInput = document.getElementById('searchInput'); // Campo de texto
const searchBtn = document.getElementById('searchBtn');     // Botão de lupa
const clearBtn = document.getElementById('clearBtn');       // Botão limpar
const filterGenre = document.getElementById('filterGenre'); // Select de gêneros

// --- CARROSSEL (BANNER TOPO) ---
const carouselTrack = document.querySelector('.carousel-track'); // Trilho das imagens
const heroTitle = document.getElementById('heroTitle');          // Título do banner
const heroMeta = document.getElementById('heroMeta');            // Subtítulo do banner

// --- MODAL (POP-UP DE DETALHES) ---
const modal = document.getElementById('modal');               // Container principal do modal
const modalClose = document.getElementById('modalClose');     // Botão X de fechar
const modalImg = document.getElementById('modalImg');         // Imagem da capa no modal
const modalTitle = document.getElementById('modalTitle');     // Título no modal
const modalMeta = document.getElementById('modalMeta');       // Info (Ano/Autor)
const modalSinopse = document.getElementById('modalSinopse'); // Texto da sinopse
const modalLinks = document.getElementById('modalLinks');     // Área dos botões de assistir

let dataList=[];
let renderedCount=0;
const PAGE_SIZE=4;
let carouselIndex=0;

function fetchData(){return fetch('data.json').then(r=>r.json())}
function safeText(t){return t?t:''}

function createPlatformIcon(name){ //links das imagens das logos 
    const map={
        "crunchyroll":'https://i.pinimg.com/736x/dc/94/4a/dc944a8bb35207a237778d0f4f5d02a3.jpg',
        "netflix":'https://i.pinimg.com/1200x/72/a0/50/72a0500ff35991d147a6b48e4bffc721.jpg',
        "primevideo":'https://i.pinimg.com/736x/bc/3f/1b/bc3f1bed189cc92f86302a4a22301b29.jpg',
        "hbomax":'https://i.pinimg.com/736x/fc/7a/d7/fc7ad737959f03493d6f1b1ff98a8361.jpg',
        "star+":'https://i.pinimg.com/736x/ca/df/99/cadf9984a599f6345444d02507624737.jpg',
        "funimation":'https://i.pinimg.com/736x/fe/fd/e0/fefde04fd9d45e8f1b98d33810e8c73d.jpg'
    };
    const key=name.toLowerCase().replace(/\s/g,'');
    return map[key]||'';
}

function renderCards(list,reset=false){
    if(reset){
        container.innerHTML='';
        renderedCount=0;
    }

    const slice=list.slice(renderedCount,renderedCount+PAGE_SIZE);

    slice.forEach(item=>{
        const art=document.createElement('article');
        art.className='card';
        art.tabIndex=0;

        art.innerHTML=`
            <div class="thumb">
                <img loading="lazy" src="${item.capa_url||'https://via.placeholder.com/300x450?text=Sem+Imagem'}" 
                alt="Capa ${item.nome}" 
                onerror="this.onerror=null;this.src='https://via.placeholder.com/300x450?text=Erro'">
            </div>

            <div class="info">
                <div class="title">${item.nome}</div>
                <div class="meta">Ano: ${item.ano||'—'} • Autor: ${item.autor||'—'}</div>
                <div class="where"></div>
            </div>
        `;

        const whereContainer = art.querySelector('.where');

        (item.links_para_assistir||[]).slice(0,3).forEach(l=>{
            const a=document.createElement('a');
            a.href=l.link;
            a.target='_blank';
            a.rel='noopener';

            const img=document.createElement('img');
            img.className='platform-icon';
            img.src=createPlatformIcon(l.plataforma);
            img.alt=l.plataforma;

            a.appendChild(img);
            whereContainer.appendChild(a);
        });

        art.addEventListener('click',()=>openModal(item));
        art.addEventListener('keypress',e=>{if(e.key==='Enter')openModal(item)});

        container.appendChild(art);
    });

    renderedCount+=slice.length;

    loadMoreBtn.style.display = renderedCount >= list.length ? 'none' : 'inline-block';
}

function openModal(item){
    modal.setAttribute('aria-hidden','false');
    modalImg.src=item.capa_url||'https://via.placeholder.com/300x450?text=Sem+Imagem';
    modalTitle.textContent=item.nome;
    modalMeta.textContent=`Ano: ${safeText(item.ano)} • Autor: ${safeText(item.autor)}`;
    modalSinopse.textContent=safeText(item.sinopse);

    modalLinks.innerHTML='';

    (item.links_para_assistir||[]).forEach(l=>{
        const a=document.createElement('a');
        a.href=l.link;
        a.target='_blank';
        a.rel='noopener';

        const img=document.createElement('img');
        img.src=createPlatformIcon(l.plataforma);
        img.alt=l.plataforma;
        img.className='platform-icon';

        a.appendChild(img);
        modalLinks.appendChild(a);
    });

    document.body.style.overflow='hidden';
}

modalClose.addEventListener('click',closeModal);
modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});

function closeModal(){
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow='auto';
}

function setupCarousel(list){
    const picks=list.filter(i=>i.banner).slice(0,6);
    carouselTrack.innerHTML='';

    picks.forEach(p=>{
        const d=document.createElement('div');
        d.className='carousel-item';

        const img=document.createElement('img');
        img.src=p.banner;
        img.alt=p.nome;
        img.loading='lazy';

        d.appendChild(img);

        d.dataset.title=p.nome;
        d.dataset.meta=`${p.ano||''} • ${p.autor||''}`;

        carouselTrack.appendChild(d);
    });

    if(picks.length){
        heroTitle.textContent=picks[0].nome;
        heroMeta.textContent=`${picks[0].ano||''} • ${picks[0].autor||''}`;
    }

    setInterval(()=>{
        carouselIndex=(carouselIndex+1)%carouselTrack.children.length;
        carouselTrack.style.transform=`translateX(-${carouselIndex*100}%)`;

        const cur=carouselTrack.children[carouselIndex];
        heroTitle.textContent=cur.dataset.title||'';
        heroMeta.textContent=cur.dataset.meta||'';
    },4000);
}

function populateGenres(list){
    const set=new Set();
    list.forEach(i=>{
        if(i.genero){
            i.genero.split(',').map(s=>s.trim()).forEach(g=>set.add(g))
        }
    });

    const arr=['all',...Array.from(set)];

    filterGenre.innerHTML='';
    arr.forEach(a=>{
        const opt=document.createElement('option');
        opt.value=a;
        opt.textContent=a==='all'?'Todos':a;
        filterGenre.appendChild(opt);
    });
}

function applyFilters(list){
    const q=searchInput.value.trim().toLowerCase();
    const genre=filterGenre.value;

    return list.filter(i=>{
        const name=(i.nome||'').toLowerCase();
        const sin=(i.sinopse||'').toLowerCase();
        const aut=(i.autor||'').toLowerCase();

        const matchesQ=q?(name.includes(q)||sin.includes(q)||aut.includes(q)):true;
        const matchesG=genre==='all'?true:(i.genero?i.genero.toLowerCase().split(',').map(s=>s.trim()).includes(genre):false);

        return matchesQ && matchesG;
    });
}

function attachUi(list){
    searchBtn.onclick=()=>{
        const res=applyFilters(list);
        renderCards(res,true);
    };

    searchInput.addEventListener('input',()=>{
        const res=applyFilters(list);
        renderCards(res,true);
    });

    clearBtn.onclick=()=>{
        searchInput.value='';
        filterGenre.value='all';
        renderCards(list,true);
    };

    loadMoreBtn.onclick=()=>{
        const res=applyFilters(list);
        renderCards(res,false);
    };

    filterGenre.onchange=()=>{
        const res=applyFilters(list);
        renderCards(res,true);
    };
}

fetchData().then(d=>{
    dataList=d;
    populateGenres(d);
    setupCarousel(d);
    attachUi(d);
    renderCards(d,true);
}).catch(()=>{
    container.innerHTML='<p style="color:#aaa;padding:20px;text-align:center">Falha ao carregar os dados.</p>';
});
