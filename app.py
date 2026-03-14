from flask import Flask, render_template, request, jsonify, send_from_directory
import sqlite3
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)

UPLOAD_FOLDER = "editais"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# -------------------------
# CRIAR BANCO AUTOMATICO
# -------------------------

def criar_banco():
    conn = sqlite3.connect("banco.db")
    c = conn.cursor()

    c.execute("""
    CREATE TABLE IF NOT EXISTS licitacoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data TEXT,
        hora TEXT,
        pregao TEXT,
        uasg TEXT,
        estado TEXT,
        orgao TEXT,
        servico TEXT,
        valor TEXT,
        modalidade TEXT,
        status TEXT,
        edital TEXT
    )
    """)

    conn.commit()
    conn.close()

criar_banco()

# -------------------------
# ROTAS DE PAGINA
# -------------------------

@app.route("/")
def login():
    return render_template("login.html")

@app.route("/painel")
def painel():
    return render_template("painel.html")

# -------------------------
# LISTAR LICITAÇÕES
# -------------------------

@app.route("/listar")
def listar():

    conn = sqlite3.connect("banco.db")
    conn.row_factory = sqlite3.Row

    c = conn.cursor()
    c.execute("SELECT * FROM licitacoes")

    dados = [dict(row) for row in c.fetchall()]

    conn.close()

    return jsonify(dados)

# -------------------------
# SALVAR LICITAÇÃO
# -------------------------

@app.route("/salvar", methods=["POST"])
def salvar():

    data = request.form.get("data")
    hora = request.form.get("hora")
    pregao = request.form.get("pregao")
    uasg = request.form.get("uasg")
    estado = request.form.get("estado")
    orgao = request.form.get("orgao")
    servico = request.form.get("servico")
    valor = request.form.get("valor")
    modalidade = request.form.get("modalidade")
    status = request.form.get("status")

    edital = None

    if "edital" in request.files:

        file = request.files["edital"]

        if file.filename != "":
            nome = secure_filename(file.filename)
            caminho = os.path.join(UPLOAD_FOLDER, nome)
            file.save(caminho)
            edital = nome

    conn = sqlite3.connect("banco.db")
    c = conn.cursor()

    c.execute("""
    INSERT INTO licitacoes
    (data,hora,pregao,uasg,estado,orgao,servico,valor,modalidade,status,edital)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)
    """, (data,hora,pregao,uasg,estado,orgao,servico,valor,modalidade,status,edital))

    conn.commit()
    conn.close()

    return "ok"

# -------------------------
# EDITAR LICITAÇÃO
# -------------------------

@app.route("/editar/<int:id>", methods=["POST"])
def editar(id):

    data = request.form.get("data")
    hora = request.form.get("hora")
    pregao = request.form.get("pregao")
    uasg = request.form.get("uasg")
    estado = request.form.get("estado")
    orgao = request.form.get("orgao")
    servico = request.form.get("servico")
    valor = request.form.get("valor")
    modalidade = request.form.get("modalidade")
    status = request.form.get("status")

    edital = None

    if "edital" in request.files:

        file = request.files["edital"]

        if file.filename != "":
            nome = secure_filename(file.filename)
            caminho = os.path.join(UPLOAD_FOLDER, nome)
            file.save(caminho)
            edital = nome

    conn = sqlite3.connect("banco.db")
    c = conn.cursor()

    if edital:

        c.execute("""
        UPDATE licitacoes SET
        data=?,hora=?,pregao=?,uasg=?,estado=?,orgao=?,
        servico=?,valor=?,modalidade=?,status=?,edital=?
        WHERE id=?
        """,(data,hora,pregao,uasg,estado,orgao,servico,valor,modalidade,status,edital,id))

    else:

        c.execute("""
        UPDATE licitacoes SET
        data=?,hora=?,pregao=?,uasg=?,estado=?,orgao=?,
        servico=?,valor=?,modalidade=?,status=?
        WHERE id=?
        """,(data,hora,pregao,uasg,estado,orgao,servico,valor,modalidade,status,id))

    conn.commit()
    conn.close()

    return "ok"

# -------------------------
# EXCLUIR
# -------------------------

@app.route("/excluir/<int:id>")
def excluir(id):

    conn = sqlite3.connect("banco.db")
    c = conn.cursor()

    c.execute("DELETE FROM licitacoes WHERE id=?", (id,))

    conn.commit()
    conn.close()

    return "ok"

# -------------------------
# BAIXAR EDITAL
# -------------------------

@app.route("/edital/<nome>")
def edital(nome):
    return send_from_directory("editais", nome)

# -------------------------
# RODAR SISTEMA
# -------------------------

if __name__ == "__main__":
    app.run(debug=True)