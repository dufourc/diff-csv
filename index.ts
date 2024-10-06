import fs from "fs";
import csv from "csv-parser";

const mainFilePath: string = process.argv[2]; // Chemin du fichier principal
const excludeFilePath: string = process.argv[3]; // Chemin du fichier d'exclusion
const keyColumn: string = process.argv[4]; // Clé de la colonne pour comparaison
const outputFilePath: string = process.argv[5]; // Chemin du fichier de résultat

if (!mainFilePath || !excludeFilePath || !keyColumn || !outputFilePath) {
  console.error(
    "Veuillez fournir les chemins des fichiers et la clé de colonne en paramètres."
  );
  process.exit(1);
}

// Fonction pour lire un fichier CSV et retourner les données sous forme de promesse
const readCsvFile = (filePath: string): Promise<Record<string, string>[]> => {
  return new Promise((resolve, reject) => {
    const results: Record<string, string>[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row: Record<string, string>) => results.push(row))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
};

// Fonction principale pour filtrer les lignes
const filterCsv = async () => {
  try {
    // Lire le fichier d'exclusion
    const excludeRows = await readCsvFile(excludeFilePath);
    const excludeObj: { [key: string]: boolean } = {};

    // Remplir l'objet d'exclusion
    excludeRows.forEach((row) => {
      excludeObj[row[keyColumn]] = true;
    });

    // Lire le fichier principal
    const mainRows = await readCsvFile(mainFilePath);
    const results: Record<string, string>[] = [];

    // Filtrer les lignes
    mainRows.forEach((row) => {
      if (!excludeObj[row[keyColumn]]) {
        results.push(row);
      }
    });

    // Écrire les résultats dans le fichier de sortie
    const outputStream = fs.createWriteStream(outputFilePath);
    if (results.length > 0) {
      outputStream.write(Object.keys(results[0]).join(",") + "\n");
      results.forEach((row) => {
        outputStream.write(Object.values(row).join(",") + "\n");
      });
    }

    console.log(
      `Les lignes ont été filtrées et enregistrées dans ${outputFilePath}`
    );
  } catch (error) {
    console.error(
      "Erreur lors de la lecture ou de l'écriture des fichiers :",
      error
    );
  }
};

// Appel de la fonction principale
filterCsv();
