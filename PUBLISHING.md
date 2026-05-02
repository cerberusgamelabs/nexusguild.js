# Publishing

## Preconditions

- You own or have access to the npm package name `nexusguild.js`
- You are logged into npm on the publishing machine
- The final repository URL is known if you want to add it to `package.json`

## Release Flow

1. Review changes and update `CHANGELOG.md`
2. Bump the version in `package.json`
3. Run:

```bash
cmd /c npm test
```

4. Publish:

```bash
cmd /c npm publish --access public
```

## Notes

- `prepublishOnly` already runs the test suite
- The package is ESM-only
- Node `18+` is required
