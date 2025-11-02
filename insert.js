import { createServer } from "node:http";
import sql from "./db.js";

class WebServerSumaBody {
  constructor(hostname, port) {
    this.hostname = hostname;
    this.port = port;

    this.server = createServer(async (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");

      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
      }

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

      let body = "";
      req.on("data", (chunk) => (body += chunk));

      if (url === "/agregarCaballero" && req.method === "POST") {
        req.on("end", async () => {
          try {
            const data = JSON.parse(body || "{}");
            console.log(data);
            const nombre = data.nombre;
            const edad = data.edad;
            const altura = data.altura;
            const constelacion = data.constelacion;
            const imagen = data.imagen;

            if (!nombre || isNaN(edad) || !altura || !constelacion || !imagen) {
              res.statusCode = 400;
              res.end(
                JSON.stringify({
                  error:
                    "Body inválido. Campos requeridos: nombre, edad, altura, constelacion ,imagen",
                  ejemplo: {
                    nombre: "Seiya",
                    edad: 13,
                    altura: "165",
                    constelacion: "Pegaso",
                    imagen: "URL",
                  },
                })
              );
              return;
            }

            try {
              console.log("entro");

              const { error } = await sql.from("Caballeros").insert([
                {
                  nombre: nombre,
                  edad: edad,
                  altura: altura,
                  constelacion: constelacion,
                  imagen: imagen,
                },
              ]);

              if (error) throw error;
              console.log(error);

              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  nombre,
                  edad,
                  altura,
                  constelacion,
                  imagen,
                })
              );
            } catch (dbErr) {
              res.statusCode = 207;
              res.end(
                JSON.stringify({
                  warning: "No se pudo registrar en Supabase.",
                  dbError: dbErr.message || String(dbErr),
                })
              );
            }
          } catch (err) {
            res.statusCode = 400;
            res.end(
              JSON.stringify({
                error: "Body inválido. Debe ser JSON.",
                ejemplo: {
                  nombre: "Seiya",
                  edad: 13,
                  altura: "165",
                  constelacion: "Pegaso",
                  imagen: "URL",
                },
              })
            );
          }
        });
        return;
      }

      res.statusCode = 404;

      res.end(
        JSON.stringify({
          mensaje: `Usa POST /body con JSON {nombre: "Seiya", edad: 13,altura: "165", constelacion: "Pegaso",imagen: "URL",} o GET /db/now."`,
          ejemplo: {
            metodo: "POST",
            url: "http://0.0.0.0:3020/agregarCaballero",
            body: {
              nombre: "Seiya",
              edad: 13,
              altura: "165",
              constelacion: "Pegaso",
              imagen: "URL",
            },
          },
          extras: { probarDB: "GET http://0.0.0.0:3020/db/now" },
        })
      );
    });
  }

  iniciarServidor() {
    this.server.listen(this.port, this.hostname, () => {
      console.log(`Servidor activo en http://${this.hostname}:${this.port}/`);
    });

    const shutdown = async () => {
      console.log("Apagando servidor…");
      this.server.close(() => process.exit(0));
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  }
}

(async () => {
  const miServer = new WebServerSumaBody("0.0.0.0", 3020);
  miServer.iniciarServidor();
})();
