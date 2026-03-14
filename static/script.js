let licitacaoAtual = null;

function formatarData(data){
  if(!data) return "-";
  let p = data.split("-");
  return p[2]+"/"+p[1]+"/"+p[0];
}

function abrirNova(){
  licitacaoAtual=null;
  document.getElementById("formLic").reset();
  let modal = new bootstrap.Modal(document.getElementById("modalLic"));
  modal.show();
}

async function carregar(){
  let r = await fetch("/listar");
  let dados = await r.json();

  // filtros
  let filtroMes = document.getElementById("filtroMes").value; // "01".."12"
  let filtroOrgao = document.getElementById("filtroOrgao")?.value.toLowerCase() || "";
  let filtroEstado = document.getElementById("filtroEstado")?.value || "";

  if(filtroMes){
    dados = dados.filter(l => l.data.split("-")[1] === filtroMes);
  }
  if(filtroOrgao){
    dados = dados.filter(l => l.orgao.toLowerCase().includes(filtroOrgao));
  }
  if(filtroEstado){
    dados = dados.filter(l => l.estado === filtroEstado);
  }

  // contagem cards
  let total=0, andamento=0, ganhas=0, perdidas=0;
  dados.forEach(l=>{
    total++;
    if(l.status==="Em andamento") andamento++;
    if(l.status==="Ganha") ganhas++;
    if(l.status==="Perdida") perdidas++;
  });

  document.getElementById("totalLic").innerText = total;
  document.getElementById("andamentoLic").innerText = andamento;
  document.getElementById("ganhasLic").innerText = ganhas;
  document.getElementById("perdidasLic").innerText = perdidas;

  // destaque hoje
  let hoje = new Date();
  hoje = hoje.getFullYear()+"-"+String(hoje.getMonth()+1).padStart(2,'0')+"-"+String(hoje.getDate()).padStart(2,'0');

  let licHoje = dados.filter(l => l.data === hoje);

  document.getElementById("alertaHoje").innerHTML = licHoje.length>0 ?
    `<div class="alert alert-primary">⚠ Você possui <b>${licHoje.length}</b> licitação(ões) hoje</div>` : "";

  // gerar lista compacta
  let html="";
  dados.forEach(l=>{
    let cor="status-cinza";
    if(l.status==="Em andamento") cor="status-azul";
    if(l.status==="Ganha") cor="status-verde";
    if(l.status==="Perdida") cor="status-vermelho";
    if(["Adiada","Suspensa","Revogada"].includes(l.status)) cor="status-amarelo";

    let destaque = (l.data===hoje) ? "card-hoje" : "";

    html+=`
    <div class="col-lg-3 col-md-4 col-sm-6 mb-2">
      <div class="card p-2 shadow-sm ${destaque}" onclick="editar(${l.id})">
        <div class="d-flex justify-content-between">
          <strong>${l.orgao}</strong>
          <span class="status ${cor}"></span>
        </div>
        <hr>
        <p><b>Data:</b> ${formatarData(l.data)}</p>
        <p><b>Hora:</b> ${l.hora||"-"}</p>
        <p><b>Pregão:</b> ${l.pregao}</p>
        <p><b>UASG:</b> ${l.uasg}</p>
      </div>
    </div>`;
  });

  document.getElementById("lista").innerHTML = html;
}

// Eventos e modal permanecem iguais
document.getElementById("formLic").addEventListener("submit", async function(e){
  e.preventDefault();
  let form = new FormData(this);
  if(licitacaoAtual){
    await fetch("/editar/"+licitacaoAtual,{method:"POST",body:form});
  }else{
    await fetch("/salvar",{method:"POST",body:form});
  }
  carregar();
  bootstrap.Modal.getInstance(document.getElementById("modalLic")).hide();
});

["filtroMes","filtroOrgao","filtroEstado"].forEach(id=>{
  let el = document.getElementById(id);
  if(el){
    let evento = (id==="filtroOrgao") ? "keyup" : "change";
    el.addEventListener(evento, carregar);
  }
});

document.addEventListener("DOMContentLoaded", carregar);
