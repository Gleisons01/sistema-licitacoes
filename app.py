from flask import Flask, render_template, request, jsonify, send_from_directory
import sqlite3
import os

app = Flask(__name__)

# Pasta para uploads
UPLOAD_FOLDER = "uploads"
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Usar SQLite por padrão
DB_FILE = "banco.db"

def conectar():
    # Conectar SQLite
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

# Criar tabela se não existir
def criar_banco():
    conn = conectar()
    cur = conn.cursor()
    cur.execute("""
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

# Rotas
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
    VALUES (?,?,?,?,?,?,?,?,?,?,?)
    """, (
        request.form["data"],
        request.form["hora"],
        request.form["pregao"],
        request.form["uasg"],
        request.form["estado"],
        request.form["orgao"],
        reque
