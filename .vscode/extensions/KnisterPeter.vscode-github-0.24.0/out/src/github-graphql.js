"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_client_1 = require("apollo-client");
const graphql_tag_1 = require("graphql-tag");
const query = graphql_tag_1.default `
  query GetRepository {
    repository(owner: "KnisterPeter", name: "vscode-github") {
      name,
      defaultBranchRef {
        name
      },
      parent {
        name,
        defaultBranchRef {
          name
        }
      }
    }
  }
`;
let TOKEN;
const networkInterface = apollo_client_1.createNetworkInterface({
    uri: 'https://api.github.com/graphql'
});
networkInterface.use([
    {
        applyMiddleware(req, next) {
            if (!req.options.headers) {
                req.options.headers = {};
            }
            req.options.headers.authorization = `Bearer ${TOKEN}`;
            next();
        }
    }
]);
const client = new apollo_client_1.default({
    networkInterface
});
function run(token) {
    return __awaiter(this, void 0, void 0, function* () {
        TOKEN = token;
        try {
            const response = yield client.query({
                query
            });
            console.log('graphql', response);
        }
        catch (e) {
            console.error(e);
        }
    });
}
exports.run = run;
//# sourceMappingURL=github-graphql.js.map