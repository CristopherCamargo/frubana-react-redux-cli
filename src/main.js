import chalk from "chalk";
import fs from "fs";
import path from "path";
import ejs from "ejs";

function createFolder(options) {
  let folder = "atoms";
  if (options.molecule) {
    folder = "molecules";
  } else if (options.template) {
    folder = "templates";
  } else if (options.page) {
    folder = "pages";
  } else if (options.organism) {
    folder = "organisms";
  }

  let basePath = `src/components/${options.targetDirectory || folder}`;

  if (options.store) {
    basePath = `src/store`;
  }

  if (!fs.existsSync(basePath)) {
    console.log(
      `not exist folder ${folder} in src/${
        options.store ? "store" : "components"
      }, create folder please`,
      chalk.yellow("WARNING")
    );
    return;
  }

  const path = `${basePath}/${options.moduleName}`;

  if (fs.existsSync(path)) {
    console.log(
      `exists register with ${options.moduleName} name`,
      chalk.red("ERROR")
    );
    return;
  }

  fs.mkdirSync(path);
  return path;
}

function createFromTemplate(options, origenFilePath) {
  const contents = fs.readFileSync(origenFilePath, "utf8");
  const result = ejs.render(contents, options);
  return result;
}

export async function createTemplate(options) {
  const currentFileUrl = import.meta.url;
  let templateDir = path.resolve(
    new URL(currentFileUrl).pathname,
    "../../src/templates/component/with-style"
  );

  if (options.page) {
    templateDir = path.resolve(
      new URL(currentFileUrl).pathname,
      "../../src/templates/component/with-out-style"
    );
  }

  if (options.store) {
    templateDir = path.resolve(
      new URL(currentFileUrl).pathname,
      "../../src/templates/store"
    );
  }

  let targetDirectory = options.targetDirectory;
  if (!targetDirectory) {
    targetDirectory = await createFolder(options);
  }

  const filesToCreate = fs.readdirSync(templateDir);

  filesToCreate.map(file => {
    const originTemplatePath = path.join(templateDir, file);
    const stats = fs.statSync(originTemplatePath);

    try {
      if (stats.isFile()) {
        const split = options.moduleName.split("-");
        let componentName = "";
        split.map(s => {
          componentName = `${componentName}${s
            .charAt(0)
            .toUpperCase()}${s.slice(1)}`;
        });
        const template = createFromTemplate(
          {
            ...options,
            componentName,
            storeName: componentName,
            originModule: `${componentName
              .charAt(0)
              .toLocaleLowerCase()}${componentName.substring(1)}`
          },
          originTemplatePath
        );
        let extension = "tsx";
        if (file === "component.test") {
          extension = "test.tsx";
        } else if (file === "component" || file === "redux-hoc") {
          extension = "tsx";
        } else {
          extension = "ts";
        }
        fs.writeFileSync(
          `${targetDirectory}/${
            file.startsWith("component") ? options.moduleName.trim() : file
          }.${extension}`,
          template,
          "utf8"
        );
        console.log("make -> ", file, chalk.green("DONE"));
      }
    } catch (err) {
      console.log(`dont make file ${file}`, chalk.red("ERROR"));
      return;
    }
  });
}
