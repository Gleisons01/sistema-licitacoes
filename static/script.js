let licitacaoAtual = null

function formatarData(data){
if(!data) return "-"
let p = data.split("-")
return p[2]+"/"+p[1]+"/"+p[0]
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
let filtroOrgao = document.getElementById("filtroOrgao") ? document.getElementById("filtroOrgao").value.toLowerCase() : ""
let filtroEstado = document.getElementById("filtroEstado") ? document.getElementById("filtroEstado").value : ""

if(filtroMes){
dados = dados.filter(l => l.data.startsWith(filtroMes))
}

if(filtroOrgao){
dados = dados.filter(l => l.orgao.toLowerCase().includes(filtroOrgao))
}

if(filtroEstado){
dados = dados.filter(l => l.estado === filtroEstado)
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

let hoje = new Date()
hoje = hoje.getFullYear()+"-"+String(hoje.getMonth()+1).padStart(2,'0')+"-"+String(hoje.getDate()).padStart(2,'0')

let licHoje = dados.filter(l => l.data === hoje)

if(document.getElementById("alertaHoje")){
if(licHoje.length > 0){

document.getElementById("alertaHoje").innerHTML = `
<div class="alert alert-primary">
⚠ Você possui <b>${licHoje.length}</b> licitação(ões) hoje
</div>
`

}else{

document.getElementById("alertaHoje").innerHTML = ""

}
}

let html=""

dados.forEach(l=>{

let cor="status-cinza"

if(l.status==="Em andamento") cor="status-azul"
if(l.status==="Ganha") cor="status-verde"
if(l.status==="Perdida") cor="status-vermelho"
if(l.status==="Adiada" || l.status==="Suspensa" || l.status==="Revogada") cor="status-amarelo"

let destaque=""

if(l.data === hoje){
destaque="card-hoje"
}

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

if(document.getElementById("filtroMes")){
document.getElementById("filtroMes").addEventListener("change",carregar)
}

if(document.getElementById("filtroOrgao")){
document.getElementById("filtroOrgao").addEventListener("keyup",carregar)
}

if(document.getElementById("filtroEstado")){
document.getElementById("filtroEstado").addEventListener("change",carregar)
}

document.addEventListener("DOMContentLoaded",carregar)