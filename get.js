import { createServer } from "node:http";
import sql from "./db.js";

class insert {
  constructor(hostname, port) {
    this.hostname = hostname;
    this.port = port;

    this.server = createServer(async (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");

      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");

      const url = req.url;
      console.log("Endpoint recibido:", url);

      if (url === "/db/now" && req.method === "GET") {
        try {
          const { data, error } = await sql
            .from("Caballeros")
            .select("*")
            .limit(1);

          if (error) throw error;

          res.statusCode = 200;
          res.end(
            JSON.stringify({
              conectado: true,
              filasEjemplo: data.length,
              mensaje: "Conexión  OK",
            })
          );
        } catch (e) {
          res.statusCode = 500;
          res.end(
            JSON.stringify({
              conectado: false,
              error: "DB error",
              detalle: e.message,
            })
          );
        }
        return;
      }
      const partes = url.split("/");
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      // suma

      if (partes.length >= 3 && partes[1] === "caballero") {
        const id = Number(partes[2]);
        console.log(id);

        if (isNaN(id)) {
          res.end(
            JSON.stringify({
              error: "Los parámetros deben ser id válidos (numeros)",
              ejemplo: "http://127.0.0.1:3010/caballero/5",
            })
          );
        } else {
          try {
            const { data, error } = await sql
              .from("Caballeros")
              .select("*")
              .eq("id", id);

            if (error) throw error;

            res.statusCode = 200;
            res.end(JSON.stringify(data || []));
            return;
          } catch (dbErr) {
            res.statusCode = 500;
            res.end(
              JSON.stringify({
                warning:
                  "Se ha presentado un error consultando la base de Datos",
                dbError: dbErr.message || String(dbErr),
              })
            );
            return;
          }
        }
      }
      res.statusCode = 404;
      res.end(
        JSON.stringify({
          mensaje: "Ruta no encontrada",
          ejemplo: {
            metodo: "GET",
            url: "http://0.0.0.0:3006/caballero/5",
          },
          extras: {
            probarDB: "GET http://0.0.0.0:3006/caballero/5",
          },
        })
      );
    });
  }

  iniciarServidor() {
    this.server.listen(this.port, this.hostname, () => {
      console.log(
        `Servidor de suma activo en http://${this.hostname}:${this.port}/`
      );
    });
  }
}

const miServer = new insert("0.0.0.0", 3010);
miServer.iniciarServidor();
