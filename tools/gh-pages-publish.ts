const { cd, exec, echo, touch } = require("shelljs")
const { readFileSync } = require("fs")
const url = require("url")

let repoUrl
let pkg = JSON.parse(readFileSync("package.json") as any)
if (typeof pkg.repository === "object") {
  if (!pkg.repository.hasOwnProperty("url")) {
    throw new Error("URL does not exist in repository section")
  }
  repoUrl = pkg.repository.url
} else {
  repoUrl = pkg.repository
}

let parsedUrl = url.parse(repoUrl)
echo("Deploying docs!!!")
cd("docs")
touch(".nojekyll")
exec("git init")
exec("git add .")
exec('git config user.name "Thomas Champagne"')
exec('git config user.email "th.champagne@gmail.com"')
exec('git commit -m "docs(docs): update gh-pages"')
exec(
  // `git push --force --quiet "https://${ghToken}@${repository}" master:gh-pages` // https
  `git push --force --quiet "git@${parsedUrl.host}:${parsedUrl.path}.git" master:gh-pages` // ssh
)
echo("Docs deployed!!")
