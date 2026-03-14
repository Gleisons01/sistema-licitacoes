let hoje = new Date().toISOString().split("T")[0]

dados.forEach(l=>{

let cor="status-cinza"

if(l.status==="Em andamento") cor="status-azul"
if(l.status==="Ganha") cor="status-verde"
if(l.status==="Perdida") cor="status-vermelho"
if(l.status==="Adiada" || l.status==="Suspensa" || l.status==="Revogada") cor="status-amarelo"

let destaque = ""

if(l.data === hoje){
destaque = "card-hoje"
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