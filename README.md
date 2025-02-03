# Convert svg to tsx

Node script that recursively traverses folders and converts SVG files to React
components.

## Usage

```console
npx tsx bin/convertSvgToReact --sourceFolder=src
```

The script will prompt the following:

```
This program will find all svg files in the given folder and strip the contents
of each file from invalid attributes and, where possible, attribute values will be
converted to props (eg. `style="..."`).
New (component) files will be stored in the folder containing the original svg files
with their file names transformed (from snake, kebab or camel) to PascalCase.

Converting files from <sourceFolder>

Found # files. Continue? (Y/n) Y
How many files do you want to convert? [#] #
Replace all references in import statements? (Y/n) Y
Remove all source files afterwards? (Y/n) Y
Run `eslint --fix`? (Y/n) Y
Run `prettier --write`? (Y/n) Y
```

After entering the requested input, the script will parse all found files,
replace references to the original files (if so indicated) and remove all source
files (if so indicated). Not applying linting or Prettier will greatly speed up
the conversion of the files.

### Excluding files

Specific files can be excluded from processing:

```console
npx tsx bin/convertSvgToReact --sourceFolder=src --excludeFolder=src/foo/bar
```

### Multiple source folders

```console
npx tsx bin/convertSvgToReact --sourceFolder=foo --sourceFolder=bar/baz
```

## Known issues

The script looks for references of converted files with the following regex:

```ts
new RegExp(`import { ReactComponent as (.+) } from '${importPath}';`);
```

If there are files that are imported like this:

```tsx
import SomeSvg from 'foo/bar/baz';
```

or like this:

```tsx
import SomeSvg, { ReactComponent as SomeSvgComponent } from 'foo/bar/baz';
```

the script does not take those formats into account (yet).
