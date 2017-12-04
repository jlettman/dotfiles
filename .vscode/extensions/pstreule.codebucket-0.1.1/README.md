# CodeBucket

A port of Dan Tao's [SublimeBucket](https://github.com/dtao/SublimeBucket) for vscode.

## Features

The following commands are available under "Bitbucket" from the context menu as well as the command palette. They are not assigned to keyboard shortcuts by default, but see the "Extension Settings" section below for instructions on how to do that.

### Open Pull Request

Looks up the commit where the current line was last changed and opens the pull request where that change was introduced.

![Open Pull Request](https://bytebucket.org/pstreule/codebucket/raw/master/images/bitbucket-open-pr.gif)

### Open Issue

Looks up the commit where the current line was last changed and opens the issue in your issue tracker (e.g., in JIRA) with which that change is associated. Currently, JIRA and Bitbucket are supported. See the "Extension Settings" section below for more details.

![Open Issue](https://bytebucket.org/pstreule/codebucket/raw/master/images/bitbucket-open-issue.gif)

### Open Changeset

Opens the commit where the current line was last changed in Bitbucket.

### Open

Opens the selected line(s) in Bitbucket, preserving all highlighted ranges. Ideal for sending someone a link to a code block.

![Open in Bitbucket](https://bytebucket.org/pstreule/codebucket/raw/master/images/bitbucket-open.gif)


## Requirements

You must have `git` installed and it has to be on the `$PATH`.

## Extension Settings

### Configure Issue Trackers

The Bitbucket issue tracker is configured by default. CodeBucket also supports JIRA, which requires some additional configuration:

```json
"codebucket.issueTrackers": [
    {
      "type": "jira",
      "host": "https://mycompany.atlassian.net",
      "projectKeys": ["ABC"]
    }
]
```

Only `"type": "jira"` is supported at the moment. Bitbucket issue references don't require any configuration.

The `"host"` is the base URL of the JIRA instance.

The `"projectsKeys"` attribute is an array of project keys for identifying issue references. In the example above, with `["ABC"]` in there, references to `ABC-1234` in a commit message would be detected and opened on https://mycompany.atlassian.net.

Bitbucket issue keys are detected by looking for `#<number>` in the commit messages.

### Keyboard Shortcuts

No keyboard shortcuts are assigned by default, but if you use a command frequently, you can configure them in `keybindings.json`:

```json
[
  {
    "key": "cmd+b p",
    "command": "codebucket.openPullRequest",
    "when": "editorTextFocus"
  }
]
```

The available commands are:

* Open: `codebucket.open`
* Open Changeset: `codebucket.openChangeset`
* Open Pull Request: `codebucket.openPullRequest`
* Open Issue: `codebucket.openIssue`

## Known Issues

* CodeBucket doesn't support Mercurial yet
* CodeBucket doesn't support Bitbucket Server yet

## Release Notes
### 0.1.1

Initial release of CodeBucket with support for Bitbucket Cloud (`git` only) and JIRA
