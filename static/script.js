let licitacaoAtual = null

function formatarData(data){
if(!data) return "-"
let p = data.split("-")
return p[2]+"/"+p[1]+"/"+p[0]
}

function carregarMeses(){

let select = document.getElementById("filtroMes")

let meses = [
["2026-01","Janeiro"],
["2026-02","Fevereiro"],
["2026-03","Março"],
["2026-04","Abril"],
["2026-05","Maio"],
["2026-06","Junho"],
["2026-07","Julho"],
["2026-08","Agosto"],
["2026-09","Setembro"],
["2026-10","Outubro"],
["2026-11","Novembro"],
["2026-12","Dezembro"]
]

meses.forEach(m=>{

let op = document.createElement("option")
op.value = m[0]
op.textContent = m[1]

select.appendChild(op)

})

}

function abrirNova(){

licitacaoAtual=null
document.getElementById("formLic").reset()

let modal = new bootstrap.Modal(document.getElementById("modalLic"))
modal.show()

}

async function carregar(){

let r = await fetch("/listar")
let dados = await r.json()

let filtroMes = document.getElementById("filtroMes").value
let busca = document.getElementById("busca").value.toLowerCase()

if(filtroMes){
dados = dados.filter(l => l.data.startsWith(filtroMes))
}

if(busca){

dados = dados.filter(l =>
l.orgao.toLowerCase().includes(busca) ||
l.estado.toLowerCase().includes(busca) ||
l.pregao.toLowerCase().includes(busca)
)

}

let total=dados.length
let andamento=0
let ganhas=0
let perdidas=0

dados.forEach(l=>{

if(l.status==="Em andamento") andamento++
if(l.status==="Ganha") ganhas++
if(l.status==="Perdida") perdidas++

})

document.getElementById("totalLic").innerText=total
document.getElementById("andamentoLic").innerText=andamento
document.getElementById("ganhasLic").innerText=ganhas
document.getElementById("perdidasLic").innerText=perdidas

dados.sort((a,b)=> new Date(a.data)-new Date(b.data))

let html=""

dados.forEach(l=>{

let cor="status-cinza"

if(l.status==="Em andamento") cor="status-azul"
if(l.status==="Ganha") cor="status-verde"
if(l.status==="Perdida") cor="status-vermelho"
if(l.status==="Adiada" || l.status==="Suspensa" || l.status==="Revogada") cor="status-amarelo"

html+=`

<div class="col-lg-3 col-md-4 col-sm-6 mb-2">

<div class="card p-2 shadow-sm" onclick="editar(${l.id})">

<div class="d-flex justify-content-between">

<strong>${l.orgao}</strong>

<span class="status ${cor}"></span>

</div>

<hr>

<p>📅 ${formatarData(l.data)}</p>
<p><b>Hora:</b> ${l.hora||"-"}</p>
<p><b>Pregão:</b> ${l.pregao}</p>
<p><b>Estado:</b> ${l.estado}</p>

${l.edital ? `<a href="/edital/${l.edital}" target="_blank">📄 Ver edital</a>` : ""}

</div>

</div>

`

})

document.getElementById("lista").innerHTML=html

}

async function editar(id){

let r = await fetch("/listar")
let dados = await r.json()

let lic = dados.find(l=>l.id===id)

licitacaoAtual=id

document.querySelector("[name=data]").value=lic.data
document.querySelector("[name=hora]").value=lic.hora
document.querySelector("[name=pregao]").value=lic.pregao
document.querySelector("[name=uasg]").value=lic.uasg
document.querySelector("[name=estado]").value=lic.estado
document.querySelector("[name=orgao]").value=lic.orgao
document.querySelector("[name=servico]").value=lic.servico
document.querySelector("[name=valor]").value=lic.valor
document.querySelector("[name=modalidade]").value=lic.modalidade
document.querySelector("[name=status]").value=lic.status

let modal = new bootstrap.Modal(document.getElementById("modalLic"))
modal.show()

}

async function excluirLic(){

if(!licitacaoAtual) return

if(!confirm("Deseja excluir esta licitação?")) return

await fetch("/excluir/"+licitacaoAtual)

carregar()

let modal = bootstrap.Modal.getInstance(document.getElementById("modalLic"))
modal.hide()

}

document.getElementById("formLic").addEventListener("submit",async function(e){

e.preventDefault()

let form = new FormData(this)

if(licitacaoAtual){

await fetch("/editar/"+licitacaoAtual,{
method:"POST",
body:form
})

}else{

await fetch("/salvar",{
method:"POST",
body:form
})

}

carregar()

let modal = bootstrap.Modal.getInstance(document.getElementById("modalLic"))
modal.hide()

})

document.getElementById("filtroMes").addEventListener("change",carregar)
document.getElementById("busca").addEventListener("keyup",carregar)

document.addEventListener("DOMContentLoaded",()=>{

carregarMeses()
carregar()

})