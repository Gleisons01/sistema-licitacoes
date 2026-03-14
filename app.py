from flask import Flask, render_template, request, jsonify, send_from_directory
import sqlite3
import os
import psycopg2
from urllib.parse import urlparse

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

DATABASE_URL = os.getenv("DATABASE_URL")


def conectar():

    if DATABASE_URL:
        url = urlparse(DATABASE_URL)

        conn = psycopg2.connect(
            host=url.hostname,
            database=url.path[1:],
            user=url.username,
            password=url.password,
            port=url.port
        )

        return conn

    else:
        conn = sqlite3.connect("banco.db")
        conn.row_factory = sqlite3.Row
        return conn


def criar_banco():

    conn = conectar()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS licitacoes(
        id SERIAL PRIMARY KEY,
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
    cur = conn.cursor()

    cur.execute("SELECT * FROM licitacoes ORDER BY data")

    colunas = [desc[0] for desc in cur.description]
    dados = [dict(zip(colunas, row)) for row in cur.fetchall()]

    conn.close()

    return jsonify(dados)


@app.route("/salvar", methods=["POST"])
def salvar():

    edital_nome = ""

    if "edital" in request.files:
        file = request.files["edital"]

        if file.filename != "":
            edital_nome = file.filename
            file.save(os.path.join(UPLOAD_FOLDER, edital_nome))

    conn = conectar()
    cur = conn.cursor()

    cur.execute("""
    INSERT INTO licitacoes
    (data,hora,pregao,uasg,estado,orgao,servico,valor,modalidade,status,edital)
    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
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

    conn = conectar()
    cur = conn.cursor()

    cur.execute("""
    UPDATE licitacoes SET
    data=%s,
    hora=%s,
    pregao=%s,
    uasg=%s,
    estado=%s,
    orgao=%s,
    servico=%s,
    valor=%s,
    modalidade=%s,
    status=%s
    WHERE id=%s
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
        id
    ))

    conn.commit()
    conn.close()

    return "ok"


@app.route("/excluir/<int:id>")
def excluir(id):

    conn = conectar()
    cur = conn.cursor()

    cur.execute("DELETE FROM licitacoes WHERE id=%s", (id,))

    conn.commit()
    conn.close()

    return "ok"


@app.route("/uploads/<filename>")
def baixar(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


if __name__ == "__main__":

    port = int(os.environ.get("PORT", 5000))

    app.run(host="0.0.0.0", port=port)
