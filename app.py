from flask import Flask, render_template, request, jsonify, send_from_directory
import sqlite3
import os

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


def conectar():
    conn = sqlite3.connect("banco.db")
    conn.row_factory = sqlite3.Row
    return conn


def criar_banco():
    conn = conectar()
    conn.execute("""
    CREATE TABLE IF NOT EXISTS licitacoes(
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


@app.route("/")
def login():
    return render_template("login.html")


@app.route("/painel")
def painel():
    return render_template("painel.html")


@app.route("/listar")
def listar():
    conn = conectar()
    dados = conn.execute("SELECT * FROM licitacoes").fetchall()
    conn.close()

    lista = []

    for l in dados:
        lista.append(dict(l))

    return jsonify(lista)


@app.route("/salvar", methods=["POST"])
def salvar():

    edital_nome = ""

    if "edital" in request.files:
        file = request.files["edital"]

        if file.filename != "":
            edital_nome = file.filename
            caminho = os.path.join(UPLOAD_FOLDER, edital_nome)
            file.save(caminho)

    conn = conectar()

    conn.execute("""
    INSERT INTO licitacoes(
        data,hora,pregao,uasg,estado,orgao,servico,valor,modalidade,status,edital
    )
    VALUES (?,?,?,?,?,?,?,?,?,?,?)
    """, (
        request.form["data"],
        request.form["hora"],
        request.form["pregao"],
        request.form["uasg"],
        request.form["estado"],
        request.form["orgao"],
        request.form["servico"],
        request.form["valor"],
        request.form["modalidade"],
        request.form["status"],
        edital_nome
    ))

    conn.commit()
    conn.close()

    return "ok"


@app.route("/editar/<int:id>", methods=["POST"])
def editar(id):

    edital_nome = request.form.get("edital_antigo", "")

    if "edital" in request.files:
        file = request.files["edital"]

        if file.filename != "":
            edital_nome = file.filename
            caminho = os.path.join(UPLOAD_FOLDER, edital_nome)
            file.save(caminho)

    conn = conectar()

    conn.execute("""
    UPDATE licitacoes SET
    data=?,
    hora=?,
    pregao=?,
    uasg=?,
    estado=?,
    orgao=?,
    servico=?,
    valor=?,
    modalidade=?,
    status=?,
    edital=?
    WHERE id=?
    """, (
        request.form["data"],
        request.form["hora"],
        request.form["pregao"],
        request.form["uasg"],
        request.form["estado"],
        request.form["orgao"],
        request.form["servico"],
        request.form["valor"],
        request.form["modalidade"],
        request.form["status"],
        edital_nome,
        id
    ))

    conn.commit()
    conn.close()

    return "ok"


@app.route("/excluir/<int:id>")
def excluir(id):

    conn = conectar()
    conn.execute("DELETE FROM licitacoes WHERE id=?", (id,))
    conn.commit()
    conn.close()

    return "ok"


@app.route("/uploads/<filename>")
def baixar(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


# CONFIGURAÇÃO PARA RENDER
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)