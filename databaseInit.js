const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

async function ejecutarComando(comando) {
  try {
    const { stdout, stderr } = await exec(comando);
    console.log(`Resultado de ${comando}: ${stdout}`);
  } catch (error) {
    console.error(`Error al detener o borrar la database de PostgreSQL o de Mongo, ejecutando el codigo ${comando}: ${error.message}`);
  }
}

async function ejecutarComandos() {
  await ejecutarComando('docker stop tienda-db_postgres');
  await ejecutarComando('docker rm -v tienda-db_postgres');
  await ejecutarComando('docker stop tienda-db_mongo');
  await ejecutarComando('docker rm -v tienda-db_mongo');
  await ejecutarComando('docker volume rm funkonest_tienda-db-data');
  await ejecutarComando('docker volume rm funkonest_tienda-db-mongo');
  await ejecutarComando('docker-compose -f docker-compose-db.yaml up -d');
}

ejecutarComandos();