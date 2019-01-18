import { declare } from "@babel/helper-plugin-utils";
import template from "@babel/template";
import { types as t } from "@babel/core";

let buildModule = template(`
define(IMPORT_PATHS, function(IMPORT_VARS) {
  NAMED_IMPORTS;
  BODY;
});
`);

export default declare((api) => {
  api.assertVersion(7);

  return {
    name: "transform-modules-simple-destructure-amd",
    visitor: {
      Program: {
        exit(path) {
          let body = path.get("body"),
            sources = [],
            anonymousSources = [],
            vars = [],
            namedImports = [],
            isModular = false,
            middleDefaultExportID = false;

          for (let i = 0; i < body.length; i++) {
            let path = body[i],
              isLast = i == body.length - 1;

            if (path.isExportDefaultDeclaration()) {
              let declaration = path.get("declaration");

              if(isLast) {
                path.replaceWith(t.returnStatement(declaration.node));
              } else {
                middleDefaultExportID = path.scope.generateUidIdentifier("export_default");
                path.replaceWith(t.variableDeclaration('var', [t.variableDeclarator(middleDefaultExportID, declaration.node)]));
              }

              isModular = true;
            }

            if (path.isImportDeclaration()) {
              let specifiers = path.node.specifiers;

              if(specifiers.length == 0) {
                anonymousSources.push(path.node.source);
              } else if(specifiers.length == 1 && specifiers[0].type == 'ImportDefaultSpecifier') {
                sources.push(path.node.source);
                vars.push(specifiers[0].local);
              } else if (specifiers.length > 1 && specifiers[0].type == 'ImportDefaultSpecifier') {
                sources.push(path.node.source);
                vars.push(specifiers[0].local);
                specifiers.forEach(({imported, local}, index) => {
                  if (index != 0) {
                    namedImports.push(t.variableDeclaration("var", [
                      t.variableDeclarator(t.identifier(local.name), t.identifier(specifiers[0].local.name + '.' + imported.name))
                    ]));
                  }
                });
              } else {
                let importedID = path.scope.generateUidIdentifier(path.node.source.value);
                sources.push(path.node.source);
                vars.push(importedID);

                specifiers.forEach(({imported, local}) => {
                  namedImports.push(t.variableDeclaration("var", [
                    t.variableDeclarator(t.identifier(local.name), t.identifier(importedID.name + '.' + imported.name))
                  ]));
                });
              }

              path.remove();

              isModular = true;
            }

            if(isLast && middleDefaultExportID) {
              path.insertAfter(t.returnStatement(middleDefaultExportID));
            }
          }

          if(isModular) {
            let paths=t.arrayExpression(sources.concat(anonymousSources));
            path.node.body = [
              buildModule({
                IMPORT_PATHS: paths,
                IMPORT_VARS: vars,
                BODY: path.node.body,
                NAMED_IMPORTS: namedImports
              })
            ];
          }
        }
      }
    },
  };
});
